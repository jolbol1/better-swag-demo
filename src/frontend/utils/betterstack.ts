// Copyright The OpenTelemetry Authors
// SPDX-License-Identifier: Apache-2.0

type BetterStackUser = {
  id: string;
  email: string;
  username: string;
  plan?: string;
  currencyCode?: string;
};

type BetterStackFlags = {
  userIdentificationEnabled: boolean;
  customEventsEnabled: boolean;
};

let cachedFlags: BetterStackFlags | null = null;

const isEnabled = (value?: string) => !['false', '0', 'no', 'off'].includes((value || 'true').toLowerCase());

const getBetterStackFlags = (): BetterStackFlags => {
  if (cachedFlags) {
    return cachedFlags;
  }

  const env = typeof window === 'undefined' ? undefined : window.ENV;

  cachedFlags = {
    userIdentificationEnabled: isEnabled(env?.ENABLE_BETTERSTACK_USER_IDENTIFICATION),
    customEventsEnabled: isEnabled(env?.ENABLE_BETTERSTACK_CUSTOM_EVENTS),
  };

  return cachedFlags;
};

const canUseBetterStack = () => typeof window !== 'undefined' && typeof window.betterstack === 'function';

export const setBetterStackUser = (user: BetterStackUser | null) => {
  if (!canUseBetterStack() || !getBetterStackFlags().userIdentificationEnabled) {
    return;
  }

  const betterstack = window.betterstack;
  if (!betterstack) {
    return;
  }

  betterstack('user', user);
};

export const trackBetterStackEvent = (eventName: string, data: Record<string, unknown>) => {
  if (!canUseBetterStack() || !getBetterStackFlags().customEventsEnabled) {
    return;
  }

  const betterstack = window.betterstack;
  if (!betterstack) {
    return;
  }

  betterstack('track', eventName, data);
};
