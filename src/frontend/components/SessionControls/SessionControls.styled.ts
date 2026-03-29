// Copyright The OpenTelemetry Authors
// SPDX-License-Identifier: Apache-2.0

import Link from 'next/link';
import styled from 'styled-components';

export const Wrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-left: 14px;
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
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  padding: 0 16px;
  border-radius: ${({ theme }) => theme.radii.pill};
  border: 1px solid ${({ theme }) => theme.colors.borderGray};
  background: rgba(255, 255, 255, 0.03);
  color: ${({ theme }) => theme.colors.textGray};
  font-size: ${({ theme }) => theme.sizes.mSmall};
  font-weight: ${({ theme }) => theme.fonts.bold};
  text-decoration: none;
`;

export const ActionLink = styled(Link)`
  color: ${({ theme }) => theme.colors.textLightGray};
  font-size: ${({ theme }) => theme.sizes.mSmall};
  text-decoration: none;
`;

export const SignOutButton = styled.button`
  border: 1px solid rgba(255, 123, 149, 0.32);
  background: rgba(255, 123, 149, 0.08);
  color: ${({ theme }) => theme.colors.otelRed};
  min-height: 34px;
  padding: 0 12px;
  border-radius: ${({ theme }) => theme.radii.pill};
  font-size: ${({ theme }) => theme.sizes.nano};
  cursor: pointer;
`;
