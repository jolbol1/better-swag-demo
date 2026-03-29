// Copyright The OpenTelemetry Authors
// SPDX-License-Identifier: Apache-2.0

import styled from 'styled-components';

export const Input = styled.input`
  width: -webkit-fill-available;
  padding: 16px;
  outline: none;
  font-weight: ${({ theme }) => theme.fonts.regular};
  font-size: ${({ theme }) => theme.sizes.dSmall};
  color: ${({ theme }) => theme.colors.textGray};
  border-radius: ${({ theme }) => theme.radii.small};
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid ${({ theme }) => theme.colors.borderGray};
  transition: border-color 150ms ease, box-shadow 150ms ease, background 150ms ease;

  &::placeholder {
    color: ${({ theme }) => theme.colors.textLightGray};
  }

  &:focus {
    border-color: ${({ theme }) => theme.colors.accent};
    box-shadow: 0 0 0 4px rgba(109, 199, 255, 0.14);
    background: rgba(255, 255, 255, 0.06);
  }
`;

export const InputLabel = styled.p`
  font-size: ${({ theme }) => theme.sizes.mMedium};
  color: ${({ theme }) => theme.colors.textLightGray};
  font-weight: ${({ theme }) => theme.fonts.regular};
  letter-spacing: 0.01em;
  margin: 0;
  margin-bottom: 10px;
`;

export const Select = styled.select`
  width: 100%;
  padding: 16px;
  font-weight: ${({ theme }) => theme.fonts.regular};
  font-size: ${({ theme }) => theme.sizes.dSmall};
  color: ${({ theme }) => theme.colors.textGray};
  border-radius: ${({ theme }) => theme.radii.small};
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid ${({ theme }) => theme.colors.borderGray};
`;

export const InputRow = styled.div`
  position: relative;
  margin-bottom: 24px;
`;

export const Arrow = styled.img.attrs({
  src: '/icons/Chevron.svg',
  alt: 'arrow',
})`
  position: absolute;
  right: 20px;
  width: 10px;
  height: 5px;
  top: 55px;
  opacity: 0.7;
  transform: rotate(90deg);
`;
