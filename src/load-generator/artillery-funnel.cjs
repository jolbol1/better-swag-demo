const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const fakeUsers = JSON.parse(fs.readFileSync(path.join(__dirname, 'fake_users.json'), 'utf8'));

const browserProfiles = [
  {
    name: 'chrome_windows',
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36',
    acceptLanguage: 'en-US,en;q=0.9',
    navigatorPlatform: 'Win32',
    viewport: { width: 1536, height: 864 },
    brands: [
      { brand: 'Chromium', version: '133' },
      { brand: 'Google Chrome', version: '133' },
      { brand: 'Not(A:Brand', version: '24' },
    ],
    fullVersionList: [
      { brand: 'Chromium', version: '133.0.6943.142' },
      { brand: 'Google Chrome', version: '133.0.6943.142' },
      { brand: 'Not(A:Brand', version: '24.0.0.0' },
    ],
    uaPlatform: 'Windows',
    platformVersion: '10.0.0',
    architecture: 'x86',
    bitness: '64',
  },
  {
    name: 'chrome_macos',
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36',
    acceptLanguage: 'en-US,en;q=0.8',
    navigatorPlatform: 'MacIntel',
    viewport: { width: 1440, height: 900 },
    brands: [
      { brand: 'Chromium', version: '133' },
      { brand: 'Google Chrome', version: '133' },
      { brand: 'Not(A:Brand', version: '24' },
    ],
    fullVersionList: [
      { brand: 'Chromium', version: '133.0.6943.142' },
      { brand: 'Google Chrome', version: '133.0.6943.142' },
      { brand: 'Not(A:Brand', version: '24.0.0.0' },
    ],
    uaPlatform: 'macOS',
    platformVersion: '10.15.7',
    architecture: 'x86',
    bitness: '64',
  },
  {
    name: 'edge_windows',
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36 Edg/133.0.3065.82',
    acceptLanguage: 'en-GB,en-US;q=0.9,en;q=0.8',
    navigatorPlatform: 'Win32',
    viewport: { width: 1366, height: 768 },
    brands: [
      { brand: 'Chromium', version: '133' },
      { brand: 'Microsoft Edge', version: '133' },
      { brand: 'Not(A:Brand', version: '24' },
    ],
    fullVersionList: [
      { brand: 'Chromium', version: '133.0.6943.142' },
      { brand: 'Microsoft Edge', version: '133.0.3065.82' },
      { brand: 'Not(A:Brand', version: '24.0.0.0' },
    ],
    uaPlatform: 'Windows',
    platformVersion: '10.0.0',
    architecture: 'x86',
    bitness: '64',
  },
];

const productsByCategory = {
  hoodies: ['OLJCESPC7Z', '66VCHSJNUP'],
  tshirts: ['1YMWWN1N4O', 'L9ECAV7KIM'],
  drinkware: ['2ZYFJ3GM2N', '0PUK6V6EV0'],
  bags: ['LS4PSXUNUM', '9SIQT8TOJO'],
  bottoms: ['6E92ZMYYFZ'],
  accessories: ['HQTGWGPNH4'],
};

const planFunnelProfiles = {
  premium: { productViewRate: 0.94, addToCartRate: 0.78, cartViewRate: 0.88, checkoutRate: 0.66 },
  team: { productViewRate: 0.89, addToCartRate: 0.6, cartViewRate: 0.82, checkoutRate: 0.55 },
  free: { productViewRate: 0.85, addToCartRate: 0.46, cartViewRate: 0.78, checkoutRate: 0.495 },
  starter: { productViewRate: 0.8, addToCartRate: 0.36, cartViewRate: 0.72, checkoutRate: 0.396 },
  anonymous: { productViewRate: 0.84, addToCartRate: 0.44, cartViewRate: 0.75, checkoutRate: 0.54 },
};

const planOutcomeOffsets = {
  premium: 0.11,
  team: 0.29,
  free: 0.47,
  starter: 0.63,
  anonymous: 0.79,
};

const planOutcomeCounters = new Map();
const entryModes = ['sign_in', 'remembered', 'anonymous'];
const baseStageTimingRanges = {
  home: [2500, 16000, 6500],
  product: [4500, 28000, 11000],
  post_add: [1200, 9000, 3200],
  cart: [3000, 18000, 7500],
  checkout: [5500, 36000, 14000],
  post_checkout: [1800, 10000, 4200],
  micro: [350, 2400, 800],
};

const planCompletedJourneyTargetsMs = {
  premium: 90000,
  team: 98000,
  free: 106000,
  anonymous: 114000,
  starter: 120000,
};

const completedJourneyStages = ['home', 'product', 'micro', 'post_add', 'cart', 'micro', 'checkout', 'post_checkout'];

const baseUrl = (process.env.ARTILLERY_TARGET || process.env.LOCUST_HOST || 'http://better-swag.com').replace(/\/+$/, '');

const pick = items => items[Math.floor(Math.random() * items.length)];

const pickWeighted = weightedItems => {
  const totalWeight = weightedItems.reduce((sum, item) => sum + item.weight, 0);
  let remaining = Math.random() * totalWeight;

  for (const item of weightedItems) {
    remaining -= item.weight;
    if (remaining <= 0) {
      return item.value;
    }
  }

  return weightedItems[weightedItems.length - 1].value;
};

const pickFunnelTarget = () => {
  const category = pick(Object.keys(productsByCategory));
  return {
    category,
    productId: pick(productsByCategory[category]),
  };
};

const getPlanProfile = plan => planFunnelProfiles[plan] || planFunnelProfiles.starter;

const nextOutcomeIndex = plan => {
  const nextIndex = (planOutcomeCounters.get(plan) || 0) + 1;
  planOutcomeCounters.set(plan, nextIndex);
  return nextIndex;
};

const chooseFunnelOutcome = plan => {
  const profile = getPlanProfile(plan);
  const homeDropProbability = 1 - profile.productViewRate;
  const productDropProbability = profile.productViewRate * (1 - profile.addToCartRate);
  const postAddDropProbability = profile.productViewRate * profile.addToCartRate * (1 - profile.cartViewRate);
  const cartDropProbability =
    profile.productViewRate * profile.addToCartRate * profile.cartViewRate * (1 - profile.checkoutRate);
  const sequenceIndex = nextOutcomeIndex(plan);
  const quasiRandom = (sequenceIndex * 0.6180339887498949 + (planOutcomeOffsets[plan] || 0.07)) % 1;

  if (quasiRandom < homeDropProbability) {
    return 'home';
  }

  if (quasiRandom < homeDropProbability + productDropProbability) {
    return 'product';
  }

  if (quasiRandom < homeDropProbability + productDropProbability + postAddDropProbability) {
    return 'post_add';
  }

  if (quasiRandom < homeDropProbability + productDropProbability + postAddDropProbability + cartDropProbability) {
    return 'cart';
  }

  return 'checkout';
};

const chooseQuantity = () => pickWeighted([
  { value: 1, weight: 0.74 },
  { value: 2, weight: 0.2 },
  { value: 3, weight: 0.06 },
]);

const createUuid = prefix => `${prefix}_${crypto.randomUUID()}`;

const buildSession = fakeUser => ({
  userId: createUuid('session'),
  currencyCode: fakeUser.currencyCode || 'USD',
  selectedUserId: fakeUser.id,
});

const buildAnonymousSession = () => ({
  userId: createUuid('guest'),
  currencyCode: 'USD',
  selectedUserId: null,
});

const triangular = (minimum, maximum, mode) => {
  const ratio = (mode - minimum) / (maximum - minimum);
  const randomValue = Math.random();

  if (randomValue <= ratio) {
    return minimum + Math.sqrt(randomValue * (maximum - minimum) * (mode - minimum));
  }

  return maximum - Math.sqrt((1 - randomValue) * (maximum - minimum) * (maximum - mode));
};

const averageTriangular = ([minimum, maximum, mode]) => (minimum + maximum + mode) / 3;

const baseCompletedJourneyMeanMs = completedJourneyStages.reduce(
  (total, stage) => total + averageTriangular(baseStageTimingRanges[stage]),
  0
);

const getPlanTimingScale = plan =>
  (planCompletedJourneyTargetsMs[plan] || planCompletedJourneyTargetsMs.starter) / baseCompletedJourneyMeanMs;

const getStageTimingRange = (plan, stage) => {
  const scale = getPlanTimingScale(plan);
  return baseStageTimingRanges[stage].map(value => Math.round(value * scale));
};

const pauseForStage = async (page, plan, stage) => {
  const [minimum, maximum, mode] = getStageTimingRange(plan, stage);
  await page.waitForTimeout(Math.round(triangular(minimum, maximum, mode)));
};

const absoluteUrl = pathname => `${baseUrl}${pathname.startsWith('/') ? pathname : `/${pathname}`}`;

const logFunnel = message => {
  console.log(`[artillery-funnel] ${message}`);
};

const applyBrowserProfile = async (page, profile) => {
  const profilePayload = JSON.stringify({
    userAgent: profile.userAgent,
    navigatorPlatform: profile.navigatorPlatform,
    language: profile.acceptLanguage.split(',')[0],
    languages: profile.acceptLanguage.split(',').map(language => language.split(';')[0]),
    brands: profile.brands,
    fullVersionList: profile.fullVersionList,
    uaPlatform: profile.uaPlatform,
    platformVersion: profile.platformVersion,
    architecture: profile.architecture,
    bitness: profile.bitness,
  });

  const cdpSession = await page.context().newCDPSession(page);
  await cdpSession.send('Network.setUserAgentOverride', {
    userAgent: profile.userAgent,
    acceptLanguage: profile.acceptLanguage,
    platform: profile.uaPlatform,
    userAgentMetadata: {
      brands: profile.brands,
      fullVersionList: profile.fullVersionList,
      fullVersion: profile.fullVersionList[0].version,
      platform: profile.uaPlatform,
      platformVersion: profile.platformVersion,
      architecture: profile.architecture,
      model: '',
      mobile: false,
      bitness: profile.bitness,
      wow64: false,
    },
  });

  await page.context().setExtraHTTPHeaders({ 'Accept-Language': profile.acceptLanguage });
  await page.setViewportSize(profile.viewport);
  await page.addInitScript(`
    (() => {
      const profile = ${profilePayload};
      Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
      Object.defineProperty(navigator, 'platform', { get: () => profile.navigatorPlatform });
      Object.defineProperty(navigator, 'userAgent', { get: () => profile.userAgent });
      Object.defineProperty(navigator, 'appVersion', { get: () => profile.userAgent });
      Object.defineProperty(navigator, 'language', { get: () => profile.language });
      Object.defineProperty(navigator, 'languages', { get: () => profile.languages });
      Object.defineProperty(navigator, 'vendor', { get: () => 'Google Inc.' });
      Object.defineProperty(navigator, 'hardwareConcurrency', { get: () => 8 });
      Object.defineProperty(navigator, 'deviceMemory', { get: () => 8 });
      Object.defineProperty(navigator, 'maxTouchPoints', { get: () => 0 });
      window.chrome = window.chrome || { runtime: {} };
      Object.defineProperty(navigator, 'userAgentData', {
        get: () => ({
          brands: profile.brands,
          mobile: false,
          platform: profile.uaPlatform,
          getHighEntropyValues: async () => ({
            architecture: profile.architecture,
            bitness: profile.bitness,
            brands: profile.brands,
            fullVersionList: profile.fullVersionList,
            mobile: false,
            model: '',
            platform: profile.uaPlatform,
            platformVersion: profile.platformVersion,
            uaFullVersion: profile.fullVersionList[0].version,
          }),
          toJSON: () => ({
            brands: profile.brands,
            mobile: false,
            platform: profile.uaPlatform,
          }),
        }),
      });
    })();
  `);
};

const resetSession = async page => {
  await page.context().clearCookies();
  await page.goto(absoluteUrl('/'), { waitUntil: 'commit' });
  await page.evaluate(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });
  await page.goto('about:blank', { waitUntil: 'commit' });
};

const startSession = async (page, fakeUser, entryMode, sessionPayload) => {
  if (entryMode === 'sign_in') {
    await page.goto(absoluteUrl('/sign-in'), { waitUntil: 'commit' });
    await page.waitForSelector(`button[data-user-id="${fakeUser.id}"]`);
    await page.click(`button[data-user-id="${fakeUser.id}"]`);
    return;
  }

  await page.goto(absoluteUrl('/'), { waitUntil: 'commit' });
  await page.evaluate(session => window.localStorage.setItem('session', JSON.stringify(session)), sessionPayload);
  await page.reload({ waitUntil: 'commit' });
};

const awaitJsonResponse = async (page, matcher, action) => {
  const [response] = await Promise.all([
    page.waitForResponse(response => matcher(response), { timeout: 15000 }),
    action(),
  ]);

  if (!response.ok()) {
    throw new Error(`Unexpected response status ${response.status()} for ${response.url()}`);
  }

  return response;
};

async function browserFunnel(page, vuContext, events, test) {
  const fakeUser = pick(fakeUsers);
  const browserProfile = pick(browserProfiles);
  const entryMode = pickWeighted([
    { value: entryModes[0], weight: 0.35 },
    { value: entryModes[1], weight: 0.45 },
    { value: entryModes[2], weight: 0.2 },
  ]);
  const { category, productId } = pickFunnelTarget();
  const quantity = chooseQuantity();

  let sessionPayload = buildSession(fakeUser);
  let sessionUserId = fakeUser.id;
  let plan = fakeUser.plan || 'starter';

  if (entryMode === 'anonymous') {
    sessionPayload = buildAnonymousSession();
    sessionUserId = sessionPayload.userId;
    plan = 'anonymous';
  }

  const profile = getPlanProfile(plan);
  const plannedOutcome = chooseFunnelOutcome(plan);
  const expectedTotal = profile.productViewRate * profile.addToCartRate * profile.cartViewRate * profile.checkoutRate;
  const expectedJourneySeconds = Math.round(planCompletedJourneyTargetsMs[plan] || planCompletedJourneyTargetsMs.starter) / 1000;

  logFunnel(
    `task boot user=${sessionUserId} plan=${plan} entry=${entryMode} category=${category} product=${productId}`
  );

  await applyBrowserProfile(page, browserProfile);
  await resetSession(page);
  await startSession(page, fakeUser, entryMode, sessionPayload);
  logFunnel(`session ready user=${sessionUserId} entry=${entryMode} product=${productId}`);

  await page.waitForSelector('[data-cy="home-page"]', { timeout: 15000 });
  await page.selectOption('[data-cy="currency-switcher"]', 'USD');
  logFunnel(
    `session started user=${sessionUserId} plan=${plan} entry=${entryMode} category=${category} product=${productId} expected_total=${(
      expectedTotal * 100
    ).toFixed(1)}% expected_journey=${expectedJourneySeconds}s planned_outcome=${plannedOutcome}`
  );

  if (test && typeof test.step === 'function') {
    await test.step('homepage', async () => {
      await pauseForStage(page, plan, 'home');
    });
  } else {
    await pauseForStage(page, plan, 'home');
  }

  if (plannedOutcome === 'home') {
    logFunnel(`drop-off stage=home user=${sessionUserId} plan=${plan} category=${category} product=${productId}`);
    return;
  }

  await page.locator(`a[href="/product/${productId}"]`).first().click();
  await page.waitForSelector('[data-cy="product-detail"]', { timeout: 15000 });
  await pauseForStage(page, plan, 'product');

  if (plannedOutcome === 'product') {
    logFunnel(`drop-off stage=product user=${sessionUserId} plan=${plan} category=${category} product=${productId}`);
    return;
  }

  await page.selectOption('[data-cy="product-quantity"]', String(quantity));
  await pauseForStage(page, plan, 'micro');
  await awaitJsonResponse(
    page,
    response => response.url().includes('/api/cart') && response.request().method() === 'POST',
    () => page.click('[data-cy="product-add-to-cart"]')
  );
  await page.waitForSelector('[data-cy="product-cart-notice"]', { timeout: 15000 });
  await pauseForStage(page, plan, 'post_add');
  logFunnel(`add-to-cart user=${sessionUserId} plan=${plan} category=${category} product=${productId} quantity=${quantity}`);

  if (plannedOutcome === 'post_add') {
    logFunnel(`drop-off stage=post_add user=${sessionUserId} plan=${plan} category=${category} product=${productId}`);
    return;
  }

  await page.goto(absoluteUrl('/cart'), { waitUntil: 'commit' });
  await page.waitForSelector('[data-cy="checkout-place-order"]', { timeout: 15000 });
  await pauseForStage(page, plan, 'cart');

  if (plannedOutcome === 'cart') {
    logFunnel(`drop-off stage=cart user=${sessionUserId} plan=${plan} category=${category} product=${productId}`);
    return;
  }

  await pauseForStage(page, plan, 'micro');
  await pauseForStage(page, plan, 'checkout');
  await awaitJsonResponse(
    page,
    response => response.url().includes('/api/checkout') && response.request().method() === 'POST',
    () => page.click('[data-cy="checkout-place-order"]')
  );
  await page.waitForFunction(() => window.location.pathname.startsWith('/cart/checkout/'), null, { timeout: 15000 });
  await page.waitForSelector('text=Your Better Swag order is confirmed.', { timeout: 15000 });
  await pauseForStage(page, plan, 'post_checkout');

  if (events && typeof events.emit === 'function') {
    events.emit('counter', 'browser.funnel.checkout_complete', 1);
  }

  logFunnel(
    `checkout-complete user=${sessionUserId} plan=${plan} entry=${entryMode} category=${category} product=${productId} quantity=${quantity}`
  );
}

module.exports = { browserFunnel };
