// Copyright The OpenTelemetry Authors
// SPDX-License-Identifier: Apache-2.0

import Link from 'next/link';
import styled from 'styled-components';

export const Header = styled.header`
  padding: 20px 20px 0;

  ${({ theme }) => theme.breakpoints.desktop} {
    padding: 28px 32px 0;
  }
`;

export const NavBar = styled.nav`
  min-height: 82px;
  background: rgba(3, 8, 18, 0.48);
  font-size: 15px;
  color: ${({ theme }) => theme.colors.textLightGray};
  border: 1px solid ${({ theme }) => theme.colors.borderGray};
  border-radius: ${({ theme }) => theme.radii.large};
  backdrop-filter: blur(18px);
  box-shadow: 0 20px 45px -34px ${({ theme }) => theme.colors.shadow};
  z-index: 1;

  ${({ theme }) => theme.breakpoints.desktop} {
    min-height: 96px;
  }
`;

export const Container = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  height: 100%;
  padding: 16px 20px;

  ${({ theme }) => theme.breakpoints.desktop} {
    padding: 18px 28px;
  }
`;

export const NavBarBrand = styled(Link)`
  display: flex;
  align-items: center;
  padding: 0;
`;

export const BrandImg = styled.img.attrs({
  src: '/images/better-stack-logo-wordmark-white.png',
})`
  width: 176px;
  height: auto;
`;

export const Controls = styled.div`
  display: flex;
  align-items: center;
  height: 60px;
`;
