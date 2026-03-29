// Copyright The OpenTelemetry Authors
// SPDX-License-Identifier: Apache-2.0

export { CypressFields } from './enums/CypressFields';
import { CypressFields } from './enums/CypressFields';

export const getElementByField = (field: CypressFields, context: Cypress.Chainable = cy) =>
  context.get(`[data-cy="${field}"]`);
