// Copyright The OpenTelemetry Authors
// SPDX-License-Identifier: Apache-2.0

import { v4 } from 'uuid';

export interface ISession {
  demoUserId: string | null;
  userId: string;
  currencyCode: string;
}

const sessionKey = 'session';
const createAnonymousSession = (overrides?: Partial<ISession>): ISession => ({
  demoUserId: null,
  userId: v4(),
  currencyCode: 'USD',
  ...overrides,
});
const serverSession = createAnonymousSession();

const SessionGateway = () => ({
  getSession(): ISession {
    if (typeof window === 'undefined') return serverSession;
    const sessionString = localStorage.getItem(sessionKey);

    if (!sessionString) {
      const anonymousSession = createAnonymousSession();
      localStorage.setItem(sessionKey, JSON.stringify(anonymousSession));

      return anonymousSession;
    }

    try {
      return {
        ...createAnonymousSession(),
        ...(JSON.parse(sessionString) as Partial<ISession>),
      };
    } catch {
      const anonymousSession = createAnonymousSession();
      localStorage.setItem(sessionKey, JSON.stringify(anonymousSession));

      return anonymousSession;
    }
  },
  setSession(session: ISession) {
    localStorage.setItem(sessionKey, JSON.stringify(session));

    return session;
  },
  setSessionValue<K extends keyof ISession>(key: K, value: ISession[K]) {
    const session = this.getSession();

    return this.setSession({ ...session, [key]: value });
  },
  clearIdentifiedUser() {
    const { currencyCode } = this.getSession();

    return this.setSession(createAnonymousSession({ currencyCode }));
  },
});

export default SessionGateway();
