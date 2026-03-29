// Copyright The OpenTelemetry Authors
// SPDX-License-Identifier: Apache-2.0

import Link from 'next/link';
import styled from 'styled-components';

export const Wrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-left: 20px;
`;

export const Meta = styled.div`
  display: none;
  min-width: 170px;

  ${({ theme }) => theme.breakpoints.desktop} {
    display: block;
  }
`;

export const Username = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.textGray};
  font-size: ${({ theme }) => theme.sizes.mSmall};
  font-weight: ${({ theme }) => theme.fonts.bold};
`;

export const Email = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.textLightGray};
  font-size: ${({ theme }) => theme.sizes.nano};
`;

export const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const SignInLink = styled(Link)`
  color: ${({ theme }) => theme.colors.otelBlue};
  font-size: ${({ theme }) => theme.sizes.mSmall};
  font-weight: ${({ theme }) => theme.fonts.bold};
  text-decoration: none;
`;

export const ActionLink = styled(Link)`
  color: ${({ theme }) => theme.colors.textGray};
  font-size: ${({ theme }) => theme.sizes.nano};
  text-decoration: none;
`;

export const SignOutButton = styled.button`
  border: 0;
  background: transparent;
  color: ${({ theme }) => theme.colors.otelRed};
  font-size: ${({ theme }) => theme.sizes.nano};
  cursor: pointer;
  padding: 0;
`;
