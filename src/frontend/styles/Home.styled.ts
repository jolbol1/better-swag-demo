// Copyright The OpenTelemetry Authors
// SPDX-License-Identifier: Apache-2.0

import styled from 'styled-components';

export const Container = styled.div`
  width: 100%;
  padding: 0 20px 80px;

  ${({ theme }) => theme.breakpoints.desktop} {
    padding: 0 32px 120px;
  }
`;

export const Row = styled.div`
  display: flex;
  flex-wrap: wrap;
  width: 100%;
`;

export const Content = styled.div`
  width: 100%;

  ${({ theme }) => theme.breakpoints.desktop} {
    margin-top: 44px;
  }
`;

export const HotProducts = styled.div`
  margin-bottom: 20px;

  ${({ theme }) => theme.breakpoints.desktop} {
    margin-bottom: 60px;
  }
`;

export const HotProductsTitle = styled.h1`
  margin: 0 0 10px;
  font-size: ${({ theme }) => theme.sizes.mLarge};
  font-weight: ${({ theme }) => theme.fonts.bold};
  color: ${({ theme }) => theme.colors.textGray};

  ${({ theme }) => theme.breakpoints.desktop} {
    font-size: 42px;
  }
`;

export const Home = styled.div`
  @media (max-width: 992px) {
    ${Content} {
      width: 100%;
    }
  }
`;
