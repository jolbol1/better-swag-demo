// Copyright The OpenTelemetry Authors
// SPDX-License-Identifier: Apache-2.0

import styled from 'styled-components';

export const CurrencySwitcher = styled.div`
  display: flex;
  justify-content: flex-end;
`;

export const Container = styled.div`
  display: flex;
  align-items: center;
  position: relative;
  color: ${({ theme }) => theme.colors.textLightGray};

  &::-webkit-input-placeholder,
  &::-moz-placeholder,
  :-ms-input-placeholder,
  :-moz-placeholder {
    font-size: 12px;
    color: ${({ theme }) => theme.colors.textLightGray};
  }
`;

export const SelectedConcurrency = styled.span`
  font-size: ${({ theme }) => theme.sizes.mMedium};
  text-align: center;
  font-weight: ${({ theme }) => theme.fonts.regular};
  position: relative;
  left: 34px;
  width: 20px;
  display: inline-block;
  color: ${({ theme }) => theme.colors.accent};
`;

export const Arrow = styled.img.attrs({
  src: '/icons/Chevron.svg',
  alt: 'arrow',
})`
  position: absolute;
  right: 16px;
  width: 12px;
  height: 12px;
  transform: rotate(90deg);
  opacity: 0.72;
`;

export const Select = styled.select`
  -webkit-appearance: none;
  -webkit-border-radius: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.04);
  font-weight: ${({ theme }) => theme.fonts.regular};
  border: 1px solid ${({ theme }) => theme.colors.borderGray};
  color: ${({ theme }) => theme.colors.textGray};
  width: 132px;
  height: 44px;
  flex-shrink: 0;
  padding: 1px 0 0 45px;
  font-size: 15px;
  border-radius: ${({ theme }) => theme.radii.pill};
`;
