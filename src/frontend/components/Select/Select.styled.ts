// Copyright The OpenTelemetry Authors
// SPDX-License-Identifier: Apache-2.0

import styled from 'styled-components';

export const Select = styled.select`
  width: 100%;
  height: 52px;
  border: 1px solid ${({ theme }) => theme.colors.borderGray};
  padding: 10px 18px;
  border-radius: ${({ theme }) => theme.radii.small};
  position: relative;
  min-width: 112px;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.textGray};
  background: rgba(255, 255, 255, 0.04);
`;

export const SelectContainer = styled.div`
  position: relative;
  width: min-content;
`;

export const Arrow = styled.img.attrs({
  src: '/icons/Chevron.svg',
  alt: 'select',
})`
  position: absolute;
  right: 18px;
  top: 23px;
  width: 10px;
  height: 5px;
  transform: rotate(90deg);
  opacity: 0.75;
`;
