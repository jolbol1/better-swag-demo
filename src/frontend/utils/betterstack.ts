export type BetterstackCommand = (...args: unknown[]) => void;

declare global {
  interface Window {
    betterstack?: BetterstackCommand & {
      l?: number;
      q?: unknown[][];
    };
  }
}

type BetterstackPayload = Record<string, string | number | boolean | null | undefined>;

function getFunnelStorageKey(event: string) {
  return `betterstack:funnel:${event}`;
}

function isBrowser() {
  return typeof window !== 'undefined';
}

export function trackBetterstackEvent(event: string, payload?: BetterstackPayload) {
  if (!isBrowser() || typeof window.betterstack !== 'function') {
    return;
  }

  window.betterstack('track', event, payload ?? {});
}

export function trackBetterstackFunnelStep(event: string, payload?: BetterstackPayload) {
  if (!isBrowser() || typeof window.betterstack !== 'function') {
    return;
  }

  const storageKey = getFunnelStorageKey(event);

  if (window.sessionStorage.getItem(storageKey)) {
    return;
  }

  window.sessionStorage.setItem(storageKey, '1');
  window.betterstack('track', event, payload ?? {});
}

export function setBetterstackUser(user: BetterstackPayload | null) {
  if (!isBrowser() || typeof window.betterstack !== 'function') {
    return;
  }

  window.betterstack('user', user);
}
