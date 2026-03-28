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

function isBrowser() {
  return typeof window !== 'undefined';
}

export function trackBetterstackEvent(event: string, payload?: BetterstackPayload) {
  if (!isBrowser() || typeof window.betterstack !== 'function') {
    return;
  }

  window.betterstack('track', event, payload ?? {});
}

export function setBetterstackUser(user: BetterstackPayload | null) {
  if (!isBrowser() || typeof window.betterstack !== 'function') {
    return;
  }

  window.betterstack('user', user);
}
