// Copyright The OpenTelemetry Authors
// SPDX-License-Identifier: Apache-2.0
export default function imageLoader({ src, width, quality }) {
  // Keep image requests same-origin so SSR and browser rendering generate identical URLs.
  const normalizedSrc = src.startsWith('/') ? src : `/${src}`;

  return `${normalizedSrc}?w=${width}&q=${quality || 75}`;
}
