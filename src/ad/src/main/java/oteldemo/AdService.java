/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

package oteldemo;

import com.google.common.collect.ImmutableListMultimap;
import com.google.common.collect.Iterables;
import io.grpc.*;
import io.grpc.health.v1.HealthCheckResponse.ServingStatus;
import io.grpc.protobuf.services.*;
import io.grpc.stub.StreamObserver;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.Random;
import org.apache.logging.log4j.Level;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import oteldemo.Demo.Ad;
import oteldemo.Demo.AdRequest;
import oteldemo.Demo.AdResponse;
import oteldemo.problempattern.GarbageCollectionTrigger;
import oteldemo.problempattern.CPULoad;
import dev.openfeature.contrib.providers.flagd.FlagdOptions;
import dev.openfeature.contrib.providers.flagd.FlagdProvider;
import dev.openfeature.sdk.Client;
import dev.openfeature.sdk.EvaluationContext;
import dev.openfeature.sdk.MutableContext;
import dev.openfeature.sdk.OpenFeatureAPI;
import java.util.UUID;


public final class AdService {

  private static final Logger logger = LogManager.getLogger(AdService.class);

  @SuppressWarnings("FieldCanBeLocal")
  private static final int MAX_ADS_TO_SERVE = 2;

  private Server server;
  private HealthStatusManager healthMgr;

   private static final AdService service = new AdService();

  private void start() throws IOException {
    int port =
        Integer.parseInt(
            Optional.ofNullable(System.getenv("AD_PORT"))
                .orElseThrow(
                    () ->
                        new IllegalStateException(
                            "environment vars: AD_PORT must not be null")));
    healthMgr = new HealthStatusManager();

    // Create a flagd instance
    FlagdOptions options =
        FlagdOptions.builder()
            .build();

    FlagdProvider flagdProvider = new FlagdProvider(options);
    // Set flagd as the OpenFeature Provider
    OpenFeatureAPI.getInstance().setProvider(flagdProvider);
  
    server =
        ServerBuilder.forPort(port)
            .addService(new AdServiceImpl())
            .addService(healthMgr.getHealthService())
            .build()
            .start();
    logger.info("Ad service started, listening on " + port);
    Runtime.getRuntime()
        .addShutdownHook(
            new Thread(
                () -> {
                  // Use stderr here since the logger may have been reset by its JVM shutdown hook.
                  System.err.println(
                      "*** shutting down gRPC ads server since JVM is shutting down");
                  AdService.this.stop();
                  System.err.println("*** server shut down");
                }));
    healthMgr.setStatus("", ServingStatus.SERVING);
  }

  private void stop() {
    if (server != null) {
      healthMgr.clearStatus("");
      server.shutdown();
    }
  }

  private enum AdRequestType {
    TARGETED,
    NOT_TARGETED
  }

  private enum AdResponseType {
    TARGETED,
    RANDOM
  }

  private static class AdServiceImpl extends oteldemo.AdServiceGrpc.AdServiceImplBase {
    
    private static final String AD_FAILURE = "adFailure";
    private static final String AD_MANUAL_GC_FEATURE_FLAG = "adManualGc";
    private static final String AD_HIGH_CPU_FEATURE_FLAG = "adHighCpu";
    private static final Client ffClient = OpenFeatureAPI.getInstance().getClient();
    
    private AdServiceImpl() {}

    /**
     * Retrieves ads based on context provided in the request {@code AdRequest}.
     *
     * @param req the request containing context.
     * @param responseObserver the stream observer which gets notified with the value of {@code
     *     AdResponse}
     */
    @Override
    public void getAds(AdRequest req, StreamObserver<AdResponse> responseObserver) {
      AdService service = AdService.getInstance();

      try {
        List<Ad> allAds = new ArrayList<>();
        AdRequestType adRequestType;
        AdResponseType adResponseType;

        MutableContext evaluationContext = new MutableContext();

        CPULoad cpuload = CPULoad.getInstance();
        cpuload.execute(ffClient.getBooleanValue(AD_HIGH_CPU_FEATURE_FLAG, false, evaluationContext));

        if (req.getContextKeysCount() > 0) {
          logger.info("Targeted ad request received for " + req.getContextKeysList());
          for (int i = 0; i < req.getContextKeysCount(); i++) {
            Collection<Ad> ads = service.getAdsByCategory(req.getContextKeys(i));
            allAds.addAll(ads);
          }
          adRequestType = AdRequestType.TARGETED;
          adResponseType = AdResponseType.TARGETED;
        } else {
          logger.info("Non-targeted ad request received, preparing random response.");
          allAds = service.getRandomAds();
          adRequestType = AdRequestType.NOT_TARGETED;
          adResponseType = AdResponseType.RANDOM;
        }
        if (allAds.isEmpty()) {
          // Serve random ads.
          allAds = service.getRandomAds();
          adResponseType = AdResponseType.RANDOM;
        }

        // Throw 1/10 of the time to simulate a failure when the feature flag is enabled
        if (ffClient.getBooleanValue(AD_FAILURE, false, evaluationContext) && random.nextInt(10) == 0) {
          throw new StatusRuntimeException(Status.UNAVAILABLE);
        }

        if (ffClient.getBooleanValue(AD_MANUAL_GC_FEATURE_FLAG, false, evaluationContext)) {
          logger.warn("Feature Flag " + AD_MANUAL_GC_FEATURE_FLAG + " enabled, performing a manual gc now");
          GarbageCollectionTrigger gct = new GarbageCollectionTrigger();
          gct.doExecute();
        }

        AdResponse reply = AdResponse.newBuilder().addAllAds(allAds).build();
        responseObserver.onNext(reply);
        responseObserver.onCompleted();
       } catch (StatusRuntimeException e) {
         logger.log(Level.WARN, "GetAds Failed with status {}", e.getStatus());
         responseObserver.onError(e);
       }
    }
  }

  private static final ImmutableListMultimap<String, Ad> adsMap = createAdsMap();

  private Collection<Ad> getAdsByCategory(String category) {
    Collection<Ad> ads = adsMap.get(category);
    return ads;
  }

  private static final Random random = new Random();

  private List<Ad> getRandomAds() {

    List<Ad> ads = new ArrayList<>(MAX_ADS_TO_SERVE);

    Collection<Ad> allAds = adsMap.values();
    for (int i = 0; i < MAX_ADS_TO_SERVE; i++) {
      ads.add(Iterables.get(allAds, random.nextInt(allAds.size())));
    }

    return ads;
  }

  private static AdService getInstance() {
    return service;
  }

  /** Await termination on the main thread since the grpc library uses daemon threads. */
  private void blockUntilShutdown() throws InterruptedException {
    if (server != null) {
      server.awaitTermination();
    }
  }

  private static ImmutableListMultimap<String, Ad> createAdsMap() {
    Ad uptimeTee =
        Ad.newBuilder()
            .setRedirectUrl("/product/uptime-tee-bone")
            .setText("Uptime Tee in bone is back. Heavyweight cotton, limited drop.")
            .build();
    Ad incidentHoodie =
        Ad.newBuilder()
            .setRedirectUrl("/product/incident-hoodie-charcoal")
            .setText("Incident Hoodie in charcoal. Built for long nights and fast recoveries.")
            .build();
    Ad onCallMug =
        Ad.newBuilder()
            .setRedirectUrl("/product/on-call-mug-black")
            .setText("On-Call Mug in matte black. Clean ceramic for stronger coffee.")
            .build();
    Ad logsTote =
        Ad.newBuilder()
            .setRedirectUrl("/product/logs-tote-natural")
            .setText("Logs Tote in natural. Heavy canvas for laptops, notebooks, and travel.")
            .build();
    return ImmutableListMultimap.<String, Ad>builder()
        .putAll("apparel", uptimeTee, incidentHoodie)
        .putAll("desk", onCallMug)
        .putAll("carry", logsTote)
        .build();
  }

  /** Main launches the server from the command line. */
  public static void main(String[] args) throws IOException, InterruptedException {
    // Start the RPC server. You shouldn't see any output from gRPC before this.
    logger.info("Ad service starting.");
    final AdService service = AdService.getInstance();
    service.start();
    service.blockUntilShutdown();
  }
}
