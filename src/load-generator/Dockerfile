# Copyright The OpenTelemetry Authors
# SPDX-License-Identifier: Apache-2.0

FROM artilleryio/artillery:latest

WORKDIR /app

COPY ./src/load-generator/artillery-funnel.cjs .
COPY ./src/load-generator/run-artillery.mjs .
COPY ./src/load-generator/people.json .
COPY ./src/frontend/data/fakeUsers.json fake_users.json

ENTRYPOINT ["node", "run-artillery.mjs"]
