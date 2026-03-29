// Copyright The OpenTelemetry Authors
// SPDX-License-Identifier: Apache-2.0

import '../styles/globals.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App, { AppContext, AppProps } from 'next/app';
import { useEffect } from 'react';
import CurrencyProvider from '../providers/Currency.provider';
import CartProvider from '../providers/Cart.provider';
import { ThemeProvider } from 'styled-components';
import Theme from '../styles/Theme';
import { OpenFeatureProvider, OpenFeature } from '@openfeature/react-sdk';
import { FlagdWebProvider } from '@openfeature/flagd-web-provider';
import SessionProvider, { useSession } from '../providers/Session.provider';

declare global {
  interface Window {
    ENV: {
      NEXT_PUBLIC_PLATFORM?: string;
      IS_SYNTHETIC_REQUEST?: string;
    };
    betterstack?: (...args: unknown[]) => void;
  }
}

const queryClient = new QueryClient();

const FeatureFlagBootstrap = () => {
  const { session } = useSession();

  useEffect(() => {
    if (!window.location) {
      return;
    }

    const useTLS = window.location.protocol === 'https:';
    let port = useTLS ? 443 : 80;
    if (window.location.port) {
      port = parseInt(window.location.port, 10);
    }

    OpenFeature.setProvider(
      new FlagdWebProvider({
        host: window.location.hostname,
        pathPrefix: 'flagservice',
        port,
        tls: useTLS,
        maxRetries: 3,
        maxDelay: 10000,
      })
    );
  }, []);

  useEffect(() => {
    OpenFeature.setContext({ targetingKey: session.userId, ...session });
  }, [session]);

  return null;
};

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider theme={Theme}>
      <SessionProvider>
        <OpenFeatureProvider>
          <FeatureFlagBootstrap />
          <QueryClientProvider client={queryClient}>
            <CurrencyProvider>
              <CartProvider>
                <Component {...pageProps} />
              </CartProvider>
            </CurrencyProvider>
          </QueryClientProvider>
        </OpenFeatureProvider>
      </SessionProvider>
    </ThemeProvider>
  );
}

MyApp.getInitialProps = async (appContext: AppContext) => {
  const appProps = await App.getInitialProps(appContext);

  return { ...appProps };
};

export default MyApp;
