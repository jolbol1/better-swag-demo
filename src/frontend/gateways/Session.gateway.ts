// Copyright The OpenTelemetry Authors
// SPDX-License-Identifier: Apache-2.0

import { v4 } from 'uuid';
import { getFakeUserById } from '../data/fakeUsers';
import { SessionState } from '../types/Session';

const sessionKey = 'session';
const sessionEvent = 'otel-demo:session-update';

const createAnonymousSession = (currencyCode = 'USD'): SessionState => ({
  userId: v4(),
  currencyCode,
  selectedUserId: null,
});

const defaultSession = createAnonymousSession();
let cachedSession = defaultSession;
let hasHydratedSession = false;

const notifySessionUpdate = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(sessionEvent));
  }
};

const normalizeSession = (value: unknown): SessionState => {
  const partial = (value || {}) as Partial<SessionState>;
  const selectedUser = getFakeUserById(partial.selectedUserId);

  if (selectedUser) {
    return {
      userId: partial.userId || v4(),
      currencyCode: partial.currencyCode || selectedUser.currencyCode,
      selectedUserId: selectedUser.id,
    };
  }

  return {
    userId: partial.userId || v4(),
    currencyCode: partial.currencyCode || 'USD',
    selectedUserId: null,
  };
};

const persistSession = (session: SessionState) => {
  cachedSession = normalizeSession(session);
  hasHydratedSession = true;

  if (typeof window === 'undefined') {
    return cachedSession;
  }

  localStorage.setItem(sessionKey, JSON.stringify(cachedSession));
  notifySessionUpdate();

  return cachedSession;
};

const hydrateSessionFromStorage = () => {
  if (typeof window === 'undefined') {
    return cachedSession;
  }

  const sessionString = localStorage.getItem(sessionKey);
  if (!sessionString) {
    return persistSession(defaultSession);
  }

  try {
    const session = normalizeSession(JSON.parse(sessionString));
    if (JSON.stringify(session) !== sessionString) {
      return persistSession(session);
    }

    cachedSession = session;
    hasHydratedSession = true;

    return cachedSession;
  } catch {
    return persistSession(defaultSession);
  }
};

const getStoredSession = () => {
  if (typeof window === 'undefined') {
    return cachedSession;
  }

  if (!hasHydratedSession) {
    return hydrateSessionFromStorage();
  }

  return cachedSession;
};

const getSession = (): SessionState => getStoredSession();

const setSessionValue = <K extends keyof SessionState>(key: K, value: SessionState[K]) => {
  const session = getSession();

  return persistSession({
    ...session,
    [key]: value,
  });
};

const signIn = (fakeUserId: string) => {
  const fakeUser = getFakeUserById(fakeUserId);
  if (!fakeUser) {
    return getSession();
  }

  const { userId } = getSession();

  return persistSession({
    userId: userId || v4(),
    currencyCode: fakeUser.currencyCode,
    selectedUserId: fakeUser.id,
  });
};

const signOut = () => {
  const { currencyCode } = getSession();

  return persistSession(createAnonymousSession(currencyCode));
};

const subscribe = (listener: () => void) => {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const onStorage = (event: Event) => {
    if (!(event instanceof StorageEvent) || event.key === null || event.key === sessionKey) {
      if (event instanceof StorageEvent) {
        hydrateSessionFromStorage();
      }

      listener();
    }
  };

  window.addEventListener(sessionEvent, listener);
  window.addEventListener('storage', onStorage);

  return () => {
    window.removeEventListener(sessionEvent, listener);
    window.removeEventListener('storage', onStorage);
  };
};

export default {
  getSession,
  setSessionValue,
  signIn,
  signOut,
  subscribe,
};
