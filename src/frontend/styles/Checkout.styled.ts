// Copyright The OpenTelemetry Authors
// SPDX-License-Identifier: Apache-2.0

import styled from 'styled-components';

export const Checkout = styled.div`
  margin: 24px 20px 80px;

  ${({ theme }) => theme.breakpoints.desktop} {
    margin: 44px 32px 96px;
  }
`;

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 28px;
  align-items: center;
  justify-content: center;
  padding: 40px 24px;
  border-radius: ${({ theme }) => theme.radii.large};
  border: 1px solid ${({ theme }) => theme.colors.borderGray};
  background: rgba(255, 255, 255, 0.03);

  ${({ theme }) => theme.breakpoints.desktop} {
    display: grid;
    grid-template-columns: auto;
  }
`;

export const DataRow = styled.div`
  display: grid;
  width: 100%;
  justify-content: space-between;
  grid-template-columns: 1fr 1fr;
  padding: 24px 0;
  border-top: solid 1px ${({ theme }) => theme.colors.borderGray};

  span:last-of-type {
    text-align: right;
  }
`;

export const ItemList = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 24px;

  ${({ theme }) => theme.breakpoints.desktop} {
    margin: 72px 0;
  }
`;

export const Title = styled.h1`
  text-align: center;
  margin: 0;
  color: ${({ theme }) => theme.colors.textGray};
  font-size: ${({ theme }) => theme.sizes.mLarge};

  ${({ theme }) => theme.breakpoints.desktop} {
    font-size: ${({ theme }) => theme.sizes.dLarge};
  }
`;

export const Subtitle = styled.h3`
  text-align: center;
  margin: 0;

  font-size: ${({ theme }) => theme.sizes.mMedium};
  color: ${({ theme }) => theme.colors.textLightGray};

  ${({ theme }) => theme.breakpoints.desktop} {
    font-size: ${({ theme }) => theme.sizes.dMedium};
  }
`;

export const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;
