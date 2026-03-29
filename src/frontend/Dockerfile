# Copyright The OpenTelemetry Authors
# SPDX-License-Identifier: Apache-2.0

FROM docker.io/library/node:22-slim AS builder

WORKDIR /app

COPY ./src/frontend/package.json package.json
COPY ./src/frontend/package-lock.json package-lock.json

RUN npm ci

COPY ./src/frontend/components/ components/
COPY ./src/frontend/gateways/ gateways/
COPY ./src/frontend/instrumentation-client.ts instrumentation-client.ts
COPY ./src/frontend/instrumentation.ts instrumentation.ts
COPY ./src/frontend/pages/ pages/
COPY ./src/frontend/protos/ protos/
COPY ./src/frontend/providers/ providers/
COPY ./src/frontend/sentry.edge.config.ts sentry.edge.config.ts
COPY ./src/frontend/sentry.server.config.ts sentry.server.config.ts
COPY ./src/frontend/sentry.shared.ts sentry.shared.ts
COPY ./src/frontend/services/ services/
COPY ./src/frontend/styles/ styles/
COPY ./src/frontend/types/ types/
COPY ./src/frontend/utils/ utils/

COPY ./src/frontend/next.config.js next.config.js
COPY ./src/frontend/postcss.config.mjs postcss.config.mjs
COPY ./src/frontend/tsconfig.json tsconfig.json

RUN npm run build

# -----------------------------------------------------------------------------

FROM docker.io/library/node:22-slim AS deps

WORKDIR /app

COPY ./src/frontend/package.json package.json
COPY ./src/frontend/package-lock.json package-lock.json

RUN npm ci --omit=dev

# -----------------------------------------------------------------------------

FROM gcr.io/distroless/nodejs22-debian12:nonroot

WORKDIR /app

ENV PORT=8080

COPY --from=builder /app/.next/standalone/ ./
COPY --from=builder /app/.next/static/ .next/static/

COPY --from=deps /app/node_modules/ node_modules/

COPY ./src/frontend/public/ public/


EXPOSE ${PORT}

CMD ["server.js"]
