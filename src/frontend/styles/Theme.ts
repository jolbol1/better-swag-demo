// Copyright The OpenTelemetry Authors
// SPDX-License-Identifier: Apache-2.0

import { DefaultTheme } from 'styled-components';

const Theme: DefaultTheme = {
  colors: {
    otelBlue: '#6dc7ff',
    otelYellow: '#8ef2cc',
    otelGray: '#050a12',
    otelRed: '#ff7b95',
    backgroundGray: 'rgba(11, 19, 32, 0.86)',
    lightBorderGray: 'rgba(255, 255, 255, 0.1)',
    borderGray: 'rgba(255, 255, 255, 0.14)',
    textGray: '#ecf4ff',
    textLightGray: '#8da0b8',
    white: '#FFFFFF',
    background: '#050a12',
    surface: '#0d1624',
    surfaceElevated: '#121f32',
    surfaceSoft: 'rgba(255, 255, 255, 0.04)',
    accent: '#6dc7ff',
    accentSecondary: '#67e8c3',
    accentGlow: 'rgba(109, 199, 255, 0.18)',
    shadow: 'rgba(3, 8, 18, 0.45)',
  },
  breakpoints: {
    desktop: '@media (min-width: 768px)',
  },
  sizes: {
    mxLarge: '22px',
    mLarge: '20px',
    mMedium: '14px',
    mSmall: '12px',
    dxLarge: '58px',
    dLarge: '40px',
    dMedium: '18px',
    dSmall: '16px',
    nano: '8px',
  },
  fonts: {
    bold: '800',
    regular: '500',
    semiBold: '700',
    light: '400',
  },
  radii: {
    small: '14px',
    medium: '24px',
    large: '32px',
    pill: '999px',
  },
};

export default Theme;
