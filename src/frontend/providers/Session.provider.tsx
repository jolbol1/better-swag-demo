// Copyright The OpenTelemetry Authors
// SPDX-License-Identifier: Apache-2.0

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import SessionGateway from '../gateways/Session.gateway';
import { getFakeUserById } from '../data/fakeUsers';
import { FakeUser, SessionState } from '../types/Session';
import { setBetterStackUser } from '../utils/betterstack';

interface IContext {
  hasHydratedSession: boolean;
  session: SessionState;
  selectedUser: FakeUser | null;
  isSignedIn: boolean;
  signIn(fakeUserId: string): void;
  signOut(): void;
  setSessionValue<K extends keyof SessionState>(key: K, value: SessionState[K]): void;
}

const defaultSession: SessionState = {
  userId: '',
  currencyCode: 'USD',
  selectedUserId: null,
};

export const Context = createContext<IContext>({
  hasHydratedSession: false,
  session: defaultSession,
  selectedUser: null,
  isSignedIn: false,
  signIn: () => {},
  signOut: () => {},
  setSessionValue: () => {},
});

interface IProps {
  children: React.ReactNode;
}

export const useSession = () => useContext(Context);

const SessionProvider = ({ children }: IProps) => {
  const [session, setSession] = useState(defaultSession);
  const [hasHydratedSession, setHasHydratedSession] = useState(false);
  const selectedUser = getFakeUserById(session.selectedUserId);

  useEffect(() => {
    const syncSession = () => {
      setSession(SessionGateway.getSession());
      setHasHydratedSession(true);
    };

    syncSession();

    return SessionGateway.subscribe(syncSession);
  }, []);

  useEffect(() => {
    if (!hasHydratedSession) {
      return;
    }

    if (!selectedUser) {
      setBetterStackUser(null);
      return;
    }

    setBetterStackUser({
      id: selectedUser.id,
      email: selectedUser.email,
      username: selectedUser.username,
      plan: selectedUser.plan,
      currencyCode: selectedUser.currencyCode,
    });
  }, [hasHydratedSession, selectedUser]);

  const value = useMemo(
    () => ({
      hasHydratedSession,
      session,
      selectedUser,
      isSignedIn: !!selectedUser,
      signIn: SessionGateway.signIn,
      signOut: SessionGateway.signOut,
      setSessionValue: SessionGateway.setSessionValue,
    }),
    [hasHydratedSession, selectedUser, session]
  );

  return <Context.Provider value={value}>{children}</Context.Provider>;
};

export default SessionProvider;
