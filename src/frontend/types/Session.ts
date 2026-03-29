// Copyright The OpenTelemetry Authors
// SPDX-License-Identifier: Apache-2.0

export interface FakeUserAddress {
  streetAddress: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
}

export interface FakeUserCreditCard {
  creditCardNumber: string;
  creditCardCvv: number;
  creditCardExpirationYear: number;
  creditCardExpirationMonth: number;
}

export interface FakeUser {
  id: string;
  email: string;
  username: string;
  plan: string;
  currencyCode: string;
  address: FakeUserAddress;
  creditCard: FakeUserCreditCard;
}

export interface SessionState {
  userId: string;
  currencyCode: string;
  selectedUserId: string | null;
}
