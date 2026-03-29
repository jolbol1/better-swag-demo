// Copyright The OpenTelemetry Authors
// SPDX-License-Identifier: Apache-2.0

import Image from 'next/image';
import styled from 'styled-components';

export const CartIcon = styled.a`
  position: relative;
  display: block;
  display: flex;
  flex-flow: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  margin-left: 16px;
  width: 46px;
  height: 46px;
  border-radius: ${({ theme }) => theme.radii.pill};
  border: 1px solid ${({ theme }) => theme.colors.borderGray};
  background: rgba(255, 255, 255, 0.03);
`;

export const Icon = styled(Image).attrs({
  width: '24',
  height: '24',
})`
  margin-bottom: 3px;
`;

export const ItemsCount = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: 7px;
  right: 7px;
  width: 18px;
  height: 18px;
  font-size: ${({ theme }) => theme.sizes.nano};
  border-radius: 50%;
  border: 1px solid #05111d;
  color: #05111d;
  background: ${({ theme }) => theme.colors.otelRed};
`;
