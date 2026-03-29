// Copyright The OpenTelemetry Authors
// SPDX-License-Identifier: Apache-2.0

import styled from 'styled-components';

export const Footer = styled.footer`
  position: relative;
  margin: 0 20px 20px;
  padding: 28px 24px;
  border-radius: ${({ theme }) => theme.radii.large};
  border: 1px solid ${({ theme }) => theme.colors.borderGray};
  background: rgba(3, 8, 18, 0.5);
  backdrop-filter: blur(14px);

  * {
    color: ${({ theme }) => theme.colors.textGray};
    font-size: ${({ theme }) => theme.sizes.mMedium};
    font-weight: ${({ theme }) => theme.fonts.regular};
  }

  ${({ theme }) => theme.breakpoints.desktop} {
    margin: 0 32px 32px;
  }
`;
