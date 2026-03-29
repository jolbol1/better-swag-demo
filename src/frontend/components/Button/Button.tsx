// Copyright The OpenTelemetry Authors
// SPDX-License-Identifier: Apache-2.0

import styled, { css } from 'styled-components';

const Button = styled.button<{ $type?: 'primary' | 'secondary' | 'link' }>`
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.accent} 0%, #57b2ff 100%);
  color: #05111d;
  display: inline-block;
  border: 1px solid transparent;
  padding: 0 20px;
  outline: none;
  font-weight: 800;
  font-size: 16px;
  line-height: 1;
  letter-spacing: 0.01em;
  border-radius: ${({ theme }) => theme.radii.small};
  height: 54px;
  cursor: pointer;
  box-shadow: 0 16px 32px -24px ${({ theme }) => theme.colors.accentGlow};
  transition:
    transform 150ms ease,
    box-shadow 150ms ease,
    border-color 150ms ease,
    background 150ms ease,
    color 150ms ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 24px 45px -26px ${({ theme }) => theme.colors.accentGlow};
  }

  ${({ $type = 'primary' }) =>
    $type === 'secondary' &&
    css`
      background: rgba(255, 255, 255, 0.03);
      color: ${({ theme }) => theme.colors.textGray};
      border-color: ${({ theme }) => theme.colors.borderGray};
      box-shadow: none;
    `};

  ${({ $type = 'primary' }) =>
    $type === 'link' &&
    css`
      background: none;
      color: ${({ theme }) => theme.colors.accent};
      border: none;
      box-shadow: none;
      height: auto;
      padding: 0;
    `};
`;

export default Button;
