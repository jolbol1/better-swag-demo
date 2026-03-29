// Copyright The OpenTelemetry Authors
// SPDX-License-Identifier: Apache-2.0

import { useRouter } from 'next/router';
import { useCallback } from 'react';
import { useSession } from '../../providers/Session.provider';
import * as S from './SessionControls.styled';

const SessionControls = () => {
  const { isSignedIn, selectedUser, signOut } = useSession();
  const { push } = useRouter();

  const onSignOut = useCallback(() => {
    signOut();
    push('/');
  }, [push, signOut]);

  if (!isSignedIn || !selectedUser) {
    return (
      <S.Wrapper>
        <S.SignInLink href="/sign-in">Sign In</S.SignInLink>
      </S.Wrapper>
    );
  }

  return (
    <S.Wrapper>
      <S.Meta>
        <S.Username>{selectedUser.username}</S.Username>
        <S.Email>{selectedUser.email}</S.Email>
      </S.Meta>
      <S.Actions>
        <S.ActionLink href="/sign-in">Switch User</S.ActionLink>
        <S.SignOutButton type="button" onClick={onSignOut}>
          Sign Out
        </S.SignOutButton>
      </S.Actions>
    </S.Wrapper>
  );
};

export default SessionControls;
