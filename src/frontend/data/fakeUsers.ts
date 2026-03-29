// Copyright The OpenTelemetry Authors
// SPDX-License-Identifier: Apache-2.0

import fakeUsersData from './fakeUsers.json';
import { FakeUser } from '../types/Session';

export const fakeUsers = fakeUsersData as FakeUser[];

export const getFakeUserById = (userId: string | null | undefined) =>
  fakeUsers.find(fakeUser => fakeUser.id === userId) || null;
