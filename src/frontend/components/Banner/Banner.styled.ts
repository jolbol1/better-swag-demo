// Copyright The OpenTelemetry Authors
// SPDX-License-Identifier: Apache-2.0

import styled from 'styled-components';
import Button from '../Button';

export const Banner = styled.div`
  display: flex;
  flex-direction: column;
  gap: 28px;
  margin: 0 20px;
  padding: 28px 20px;
  border: 1px solid ${({ theme }) => theme.colors.borderGray};
  border-radius: ${({ theme }) => theme.radii.large};
  background:
    radial-gradient(circle at top left, rgba(109, 199, 255, 0.18), transparent 25%),
    radial-gradient(circle at bottom right, rgba(103, 232, 195, 0.12), transparent 24%),
    linear-gradient(180deg, rgba(10, 17, 28, 0.92), rgba(7, 12, 20, 0.98));
  overflow: hidden;
  position: relative;

  ${({ theme }) => theme.breakpoints.desktop} {
    flex-direction: row;
    align-items: center;
    margin: 0 32px;
    padding: 34px 34px 32px;
  }
`;

export const ImageContainer = styled.div`
  position: relative;
  min-height: 320px;

  ${({ theme }) => theme.breakpoints.desktop} {
    min-width: 46%;
    min-height: 420px;
  }
`;

export const TextContainer = styled.div`
  position: relative;
  z-index: 1;

  ${({ theme }) => theme.breakpoints.desktop} {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: start;
    width: 54%;
    padding-right: 36px;
  }
`;

export const Eyebrow = styled.p`
  margin: 0 0 14px;
  color: ${({ theme }) => theme.colors.accent};
  font-size: ${({ theme }) => theme.sizes.nano};
  font-weight: ${({ theme }) => theme.fonts.bold};
  letter-spacing: 0.34em;
  text-transform: uppercase;
`;

export const Title = styled.h1`
  margin: 0;
  color: ${({ theme }) => theme.colors.textGray};
  font-size: 36px;
  line-height: 1.04;
  font-weight: ${({ theme }) => theme.fonts.bold};

  ${({ theme }) => theme.breakpoints.desktop} {
    font-size: 58px;
  }
`;

export const Description = styled.p`
  margin: 18px 0 0;
  max-width: 640px;
  color: ${({ theme }) => theme.colors.textLightGray};
  font-size: ${({ theme }) => theme.sizes.dSmall};
  line-height: 1.8;
`;

export const StatRow = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  width: 100%;
  margin: 26px 0;
`;

export const StatCard = styled.div`
  padding: 14px 16px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: ${({ theme }) => theme.radii.medium};
  background: rgba(255, 255, 255, 0.03);
`;

export const StatValue = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.textGray};
  font-size: ${({ theme }) => theme.sizes.dMedium};
  font-weight: ${({ theme }) => theme.fonts.bold};
`;

export const StatLabel = styled.p`
  margin: 4px 0 0;
  color: ${({ theme }) => theme.colors.textLightGray};
  font-size: ${({ theme }) => theme.sizes.nano};
  letter-spacing: 0.16em;
  text-transform: uppercase;
`;

export const GoShoppingButton = styled(Button)`
  width: 100%;

  ${({ theme }) => theme.breakpoints.desktop} {
    width: auto;
  }
`;

export const SecondaryAction = styled(Button).attrs({
  $type: 'secondary',
})`
  margin-top: 12px;
  width: 100%;

  ${({ theme }) => theme.breakpoints.desktop} {
    width: auto;
    margin-left: 12px;
  }
`;

export const VisualCard = styled.div`
  position: absolute;
  overflow: hidden;
  border-radius: 28px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 24px 48px -30px rgba(0, 0, 0, 0.65);

  img {
    width: 100%;
    height: auto;
    display: block;
  }
`;

export const HoodieCard = styled(VisualCard)`
  top: 10px;
  left: 0;
  width: 56%;
  transform: rotate(-8deg);
`;

export const MugCard = styled(VisualCard)`
  top: 84px;
  right: 0;
  width: 44%;
  transform: rotate(10deg);
`;

export const ToteCard = styled(VisualCard)`
  bottom: 0;
  left: 30%;
  width: 46%;
  transform: rotate(4deg);
`;
