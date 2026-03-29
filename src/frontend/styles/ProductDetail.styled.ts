// Copyright The OpenTelemetry Authors
// SPDX-License-Identifier: Apache-2.0

import styled from 'styled-components';
import Button from '../components/Button';

export const ProductDetail = styled.div`
  padding: 24px 20px 80px;

  ${({ theme }) => theme.breakpoints.desktop} {
    padding: 44px 32px 96px;
  }
`;

export const Container = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 28px;

  ${({ theme }) => theme.breakpoints.desktop} {
    grid-template-columns: 46% 54%;
  }
`;

export const Image = styled.div<{ $src: string }>`
  width: 100%;
  min-height: 320px;
  border-radius: ${({ theme }) => theme.radii.large};
  border: 1px solid ${({ theme }) => theme.colors.borderGray};
  background:
    radial-gradient(circle at top, rgba(109, 199, 255, 0.16), transparent 54%),
    linear-gradient(180deg, rgba(16, 26, 41, 0.88), rgba(8, 12, 20, 0.98)),
    url(${({ $src }) => $src}) no-repeat center;
  background-size: auto, auto, contain;

  ${({ theme }) => theme.breakpoints.desktop} {
    min-height: 560px;
  }
`;

export const Details = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 24px;
  border-radius: ${({ theme }) => theme.radii.large};
  border: 1px solid ${({ theme }) => theme.colors.borderGray};
  background: rgba(255, 255, 255, 0.03);
`;

export const AddToCart = styled(Button)`
  display: flex;
  align-items: center;
  gap: 10px;
  justify-content: center;
  width: 100%;
  font-size: ${({ theme }) => theme.sizes.dSmall};
  font-weight: ${({ theme }) => theme.fonts.regular};

  ${({ theme }) => theme.breakpoints.desktop} {
    font-size: ${({ theme }) => theme.sizes.dMedium};
    width: 100%;
  }
`;

export const Name = styled.h5`
  color: ${({ theme }) => theme.colors.textGray};
  font-size: 34px;
  margin: 0;

  ${({ theme }) => theme.breakpoints.desktop} {
    font-size: 46px;
  }
`;

export const Text = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.textLightGray};
`;

export const Description = styled(Text)`
  margin: 0;
  color: ${({ theme }) => theme.colors.textLightGray};
  font-weight: ${({ theme }) => theme.fonts.regular};
  line-height: 1.8;

  ${({ theme }) => theme.breakpoints.desktop} {
    font-size: ${({ theme }) => theme.sizes.dMedium};
  }
`;

export const ProductPrice = styled(Text)`
  color: ${({ theme }) => theme.colors.textGray};
  font-weight: ${({ theme }) => theme.fonts.bold};
  font-size: 28px;

  ${({ theme }) => theme.breakpoints.desktop} {
    font-size: 34px;
  }
`;
