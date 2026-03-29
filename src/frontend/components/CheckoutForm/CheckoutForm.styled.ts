// Copyright The OpenTelemetry Authors
// SPDX-License-Identifier: Apache-2.0

import styled, { css } from 'styled-components';
import Button from '../Button';

export const CheckoutForm = styled.form`
  padding: 26px 24px;
  border-radius: ${({ theme }) => theme.radii.large};
  border: 1px solid ${({ theme }) => theme.colors.borderGray};
  background: rgba(255, 255, 255, 0.03);
`;

export const StateRow = styled.div`
  display: grid;
  grid-template-columns: 35% 55%;
  gap: 10%;
`;

export const Title = styled.h1`
  margin: 0;
  margin-bottom: 24px;
  color: ${({ theme }) => theme.colors.textGray};
  font-size: 28px;
`;

export const CardRow = styled.div`
  display: grid;
  grid-template-columns: 35% 35% 20%;
  gap: 5%;
`;

export const SubmitContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  flex-direction: column-reverse;

  ${({ theme }) => theme.breakpoints.desktop} {
    flex-direction: row;
    justify-content: end;
    align-items: center;
    margin-top: 67px;
  }
`;

export const CartButton = styled(Button)`
  padding: 16px 35px;
  font-weight: ${({ theme }) => theme.fonts.regular};
  width: 100%;

  ${({ theme }) => theme.breakpoints.desktop} {
    width: inherit;
  }
`;

export const EmptyCartButton = styled(Button)`
  font-weight: ${({ theme }) => theme.fonts.regular};
  color: ${({ theme }) => theme.colors.otelRed};
  width: 100%;
  ${({ $type }) =>
    !$type &&
    css`
      background: rgba(255, 123, 149, 0.08);
      border-color: rgba(255, 123, 149, 0.32);
    `}

  ${({ theme }) => theme.breakpoints.desktop} {
    width: inherit;
  }
`;
