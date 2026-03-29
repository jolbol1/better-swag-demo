// Copyright The OpenTelemetry Authors
// SPDX-License-Identifier: Apache-2.0

export const trackBetterStackEvent = (eventName: string, data: Record<string, unknown>) => {
  if (typeof window === 'undefined' || typeof window.betterstack !== 'function') {
    return;
  }

  window.betterstack('track', eventName, data);
};
