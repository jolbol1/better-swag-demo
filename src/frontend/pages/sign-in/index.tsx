// Copyright The OpenTelemetry Authors
// SPDX-License-Identifier: Apache-2.0

import { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useCallback } from 'react';
import Footer from '../../components/Footer';
import Layout from '../../components/Layout';
import { fakeUsers } from '../../data/fakeUsers';
import { useSession } from '../../providers/Session.provider';
import * as S from '../../styles/SignIn.styled';

const SignInPage: NextPage = () => {
  const { push } = useRouter();
  const { selectedUser, signIn } = useSession();

  const onSelectUser = useCallback(
    (fakeUserId: string) => {
      signIn(fakeUserId);
      push('/');
    },
    [push, signIn]
  );

  return (
    <Layout>
      <Head>
        <title>Otel Demo - Sign In</title>
      </Head>
      <S.SignIn>
        <S.Intro>
          <S.Title>Pick a demo user</S.Title>
          <S.Description>
            Choose a fake customer profile to reuse a known e-mail address, shipping details, payment details,
            cart identity, and Better Stack user context for this browser session.
          </S.Description>
          {selectedUser && (
            <S.ActiveUser>
              <S.ActiveLabel>Current session</S.ActiveLabel>
              <strong>{selectedUser.username}</strong> ({selectedUser.email})
            </S.ActiveUser>
          )}
        </S.Intro>

        <S.UserGrid>
          {fakeUsers.map(fakeUser => (
            <S.UserCard key={fakeUser.id}>
              <S.UserHeader>
                <div>
                  <S.UserName>{fakeUser.username}</S.UserName>
                  <S.UserEmail>{fakeUser.email}</S.UserEmail>
                </div>
                <S.Plan>{fakeUser.plan}</S.Plan>
              </S.UserHeader>
              <S.DetailList>
                <S.Detail>Currency: {fakeUser.currencyCode}</S.Detail>
                <S.Detail>
                  Address: {fakeUser.address.streetAddress}, {fakeUser.address.city}, {fakeUser.address.country}
                </S.Detail>
                <S.Detail>
                  Card ending: {fakeUser.creditCard.creditCardNumber.slice(-4)}
                </S.Detail>
              </S.DetailList>
              <S.Actions>
                <S.Status>{selectedUser?.id === fakeUser.id ? 'Active' : 'Available'}</S.Status>
                <S.SignInButton
                  type="button"
                  data-user-id={fakeUser.id}
                  onClick={() => onSelectUser(fakeUser.id)}
                >
                  {selectedUser?.id === fakeUser.id ? 'Use Again' : 'Use This User'}
                </S.SignInButton>
              </S.Actions>
            </S.UserCard>
          ))}
        </S.UserGrid>
      </S.SignIn>
      <Footer />
    </Layout>
  );
};

export default SignInPage;
