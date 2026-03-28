// Copyright The OpenTelemetry Authors
// SPDX-License-Identifier: Apache-2.0

import { CypressFields } from './enums/CypressFields';

export { CypressFields };

type QueryContext = {
  get(selector: string): any;
};

export const getElementByField = (field: CypressFields, context?: QueryContext): any => {
  const activeContext = context ?? (globalThis as { cy?: QueryContext }).cy;

  if (!activeContext) {
    throw new Error('Cypress query context is unavailable.');
  }

  return activeContext.get(`[data-cy="${field}"]`);
};
