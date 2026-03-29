import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { OpenFeature } from '@openfeature/react-sdk';
import SessionGateway from '../gateways/Session.gateway';
import { setBetterstackUser, trackBetterstackEvent } from '../utils/betterstack';
import { demoUsers, findDemoUser, type DemoUser } from '../utils/fakeUsers';

interface IContext {
  demoUsers: DemoUser[];
  isAuthenticated: boolean;
  sessionUserId: string;
  signIn(userId: string): DemoUser | null;
  signOut(): void;
  user: DemoUser | null;
}

const Context = createContext<IContext>({
  demoUsers,
  isAuthenticated: false,
  sessionUserId: SessionGateway.getSession().userId,
  signIn: () => null,
  signOut: () => {},
  user: null,
});

function getBetterstackUserPayload(user: DemoUser) {
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    plan: user.plan,
    team: user.team,
    company: user.company,
    role: user.role,
    lifecycleStage: user.lifecycleStage,
    preferredCategory: user.preferredCategory,
  };
}

function syncOpenFeatureContext(user: DemoUser | null) {
  const session = SessionGateway.getSession();
  const context: Record<string, string> = {
    targetingKey: session.userId,
    userId: session.userId,
    currencyCode: session.currencyCode,
  };

  if (session.demoUserId) {
    context.demoUserId = session.demoUserId;
  }

  if (user) {
    context.email = user.email;
    context.username = user.username;
    context.plan = user.plan;
    context.team = user.team;
    context.company = user.company;
    context.role = user.role;
    context.lifecycleStage = user.lifecycleStage;
    context.preferredCategory = user.preferredCategory;
  }

  void OpenFeature.setContext(context);
}

export const useAuth = () => useContext(Context);

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<DemoUser | null>(null);
  const [sessionUserId, setSessionUserId] = useState(() => SessionGateway.getSession().userId);

  const refreshData = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['cart'] });
    queryClient.invalidateQueries({ queryKey: ['recommendations'] });
  }, [queryClient]);

  useEffect(() => {
    const session = SessionGateway.getSession();
    const storedUser = findDemoUser(session.demoUserId);

    if (!storedUser && session.demoUserId) {
      const anonymousSession = SessionGateway.clearIdentifiedUser();

      setSessionUserId(anonymousSession.userId);
      setBetterstackUser(null);
      syncOpenFeatureContext(null);
      return;
    }

    setUser(storedUser);
    setSessionUserId(session.userId);
    setBetterstackUser(storedUser ? getBetterstackUserPayload(storedUser) : null);
    syncOpenFeatureContext(storedUser);
  }, []);

  const signIn = useCallback(
    (userId: string) => {
      const selectedUser = findDemoUser(userId);

      if (!selectedUser) {
        return null;
      }

      const nextSession = SessionGateway.setSession({
        ...SessionGateway.getSession(),
        demoUserId: selectedUser.id,
        userId: selectedUser.id,
      });

      setUser(selectedUser);
      setSessionUserId(nextSession.userId);
      setBetterstackUser(getBetterstackUserPayload(selectedUser));
      syncOpenFeatureContext(selectedUser);
      trackBetterstackEvent('user_signed_in', {
        plan: selectedUser.plan,
        team: selectedUser.team,
        userId: selectedUser.id,
      });
      refreshData();

      return selectedUser;
    },
    [refreshData]
  );

  const signOut = useCallback(() => {
    if (user) {
      trackBetterstackEvent('user_signed_out', {
        plan: user.plan,
        team: user.team,
        userId: user.id,
      });
    }

    const nextSession = SessionGateway.clearIdentifiedUser();

    setUser(null);
    setSessionUserId(nextSession.userId);
    setBetterstackUser(null);
    syncOpenFeatureContext(null);
    refreshData();
  }, [refreshData, user]);

  const value = useMemo(
    () => ({
      demoUsers,
      isAuthenticated: user !== null,
      sessionUserId,
      signIn,
      signOut,
      user,
    }),
    [sessionUserId, signIn, signOut, user]
  );

  return <Context.Provider value={value}>{children}</Context.Provider>;
}
