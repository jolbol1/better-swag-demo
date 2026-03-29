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

interface BetterstackControls {
  manualEventsEnabled?: boolean;
  userIdentificationEnabled?: boolean;
}

let manualEventsEnabled = true;
let userIdentificationEnabled = true;
let lastKnownUser: BetterstackPayload | null = null;

function isBrowser() {
  return typeof window !== 'undefined';
}

function syncBetterstackUserState() {
  if (!isBrowser() || typeof window.betterstack !== 'function') {
    return;
  }

  if (!userIdentificationEnabled || lastKnownUser === null) {
    window.betterstack('user', null);
    return;
  }

  window.betterstack('user', lastKnownUser);
}

export function setBetterstackControls({
  manualEventsEnabled: nextManualEventsEnabled,
  userIdentificationEnabled: nextUserIdentificationEnabled,
}: BetterstackControls) {
  if (typeof nextManualEventsEnabled === 'boolean') {
    manualEventsEnabled = nextManualEventsEnabled;
  }

  if (typeof nextUserIdentificationEnabled === 'boolean') {
    userIdentificationEnabled = nextUserIdentificationEnabled;
    syncBetterstackUserState();
  }
}

export function trackBetterstackEvent(event: string, payload?: BetterstackPayload) {
  if (!manualEventsEnabled || !isBrowser() || typeof window.betterstack !== 'function') {
    return;
  }

  window.betterstack('track', event, payload ?? {});
}

export function setBetterstackUser(user: BetterstackPayload | null) {
  lastKnownUser = user;
  syncBetterstackUserState();
}
