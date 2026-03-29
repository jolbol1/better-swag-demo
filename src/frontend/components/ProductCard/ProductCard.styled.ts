// Copyright The OpenTelemetry Authors
// SPDX-License-Identifier: Apache-2.0

import styled from 'styled-components';
import RouterLink from 'next/link';

export const Link = styled(RouterLink)`
  text-decoration: none;
`;

export const Image = styled.div<{ $src: string }>`
  width: 100%;
  height: 240px;
  background:
    radial-gradient(circle at top, rgba(109, 199, 255, 0.16), transparent 52%),
    linear-gradient(180deg, rgba(16, 26, 41, 0.88), rgba(8, 12, 20, 0.98));
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  position: relative;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: url(${({ $src }) => $src}) no-repeat center;
    background-size: contain;
    transition: transform 220ms ease;
  }

  ${({ theme }) => theme.breakpoints.desktop} {
    height: 320px;
  }
`;

export const ProductCard = styled.div`
  cursor: pointer;
  overflow: hidden;
  border-radius: ${({ theme }) => theme.radii.medium};
  border: 1px solid ${({ theme }) => theme.colors.borderGray};
  background: rgba(255, 255, 255, 0.03);
  box-shadow: 0 20px 40px -34px ${({ theme }) => theme.colors.shadow};
  transition:
    transform 180ms ease,
    border-color 180ms ease,
    box-shadow 180ms ease;

  &:hover {
    transform: translateY(-4px);
    border-color: rgba(109, 199, 255, 0.34);
    box-shadow: 0 28px 48px -34px ${({ theme }) => theme.colors.shadow};
  }

  &:hover ${Image}::after {
    transform: scale(1.04);
  }
`;

export const Copy = styled.div`
  padding: 18px 18px 20px;
`;

export const Category = styled.span`
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 0 12px;
  border-radius: ${({ theme }) => theme.radii.pill};
  background: rgba(109, 199, 255, 0.12);
  color: ${({ theme }) => theme.colors.accent};
  font-size: ${({ theme }) => theme.sizes.nano};
  font-weight: ${({ theme }) => theme.fonts.bold};
  letter-spacing: 0.16em;
  text-transform: uppercase;
`;

export const ProductName = styled.p`
  margin: 0;
  margin-top: 14px;
  font-size: ${({ theme }) => theme.sizes.dMedium};
  color: ${({ theme }) => theme.colors.textGray};
`;

export const ProductDescription = styled.p`
  margin: 8px 0 0;
  color: ${({ theme }) => theme.colors.textLightGray};
  font-size: ${({ theme }) => theme.sizes.mMedium};
  line-height: 1.7;
`;

export const ProductPrice = styled.p`
  margin: 16px 0 0;
  font-size: 22px;
  color: ${({ theme }) => theme.colors.textGray};
  font-weight: ${({ theme }) => theme.fonts.bold};
`;
