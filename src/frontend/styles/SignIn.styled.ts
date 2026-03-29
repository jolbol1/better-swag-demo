// Copyright The OpenTelemetry Authors
// SPDX-License-Identifier: Apache-2.0

import styled from 'styled-components';
import Button from '../components/Button';

export const SignIn = styled.div`
  padding: 40px 20px 80px;

  ${({ theme }) => theme.breakpoints.desktop} {
    padding: 60px 100px 100px;
  }
`;

export const Intro = styled.div`
  max-width: 780px;
  margin-bottom: 32px;
`;

export const Title = styled.h1`
  margin: 0 0 12px;
  font-size: 32px;

  ${({ theme }) => theme.breakpoints.desktop} {
    font-size: 48px;
  }
`;

export const Description = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.textLightGray};
  font-size: ${({ theme }) => theme.sizes.dSmall};
  line-height: 1.5;
`;

export const ActiveUser = styled.div`
  margin-top: 20px;
  padding: 16px 20px;
  border: 1px solid ${({ theme }) => theme.colors.textGray};
  border-radius: 12px;
  background: rgba(133, 59, 92, 0.06);
`;

export const ActiveLabel = styled.p`
  margin: 0 0 8px;
  color: ${({ theme }) => theme.colors.textLightGray};
`;

export const UserGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;

  ${({ theme }) => theme.breakpoints.desktop} {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

export const UserCard = styled.article`
  border: 1px solid ${({ theme }) => theme.colors.textGray};
  border-radius: 16px;
  padding: 20px;
  background: ${({ theme }) => theme.colors.white};
`;

export const UserHeader = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
  margin-bottom: 12px;
`;

export const UserName = styled.h2`
  margin: 0;
  font-size: ${({ theme }) => theme.sizes.dMedium};
`;

export const UserEmail = styled.p`
  margin: 6px 0 0;
  color: ${({ theme }) => theme.colors.textLightGray};
`;

export const Plan = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 88px;
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(82, 98, 168, 0.12);
  color: ${({ theme }) => theme.colors.otelBlue};
  font-size: ${({ theme }) => theme.sizes.nano};
  text-transform: uppercase;
`;

export const DetailList = styled.div`
  display: grid;
  gap: 8px;
  margin-bottom: 20px;
  color: ${({ theme }) => theme.colors.textGray};
`;

export const Detail = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.textGray};
`;

export const Actions = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
`;

export const Status = styled.span`
  color: ${({ theme }) => theme.colors.otelBlue};
  font-size: ${({ theme }) => theme.sizes.nano};
  text-transform: uppercase;
`;

export const SignInButton = styled(Button)`
  min-width: 150px;
`;
