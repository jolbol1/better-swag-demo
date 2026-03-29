// Copyright The OpenTelemetry Authors
// SPDX-License-Identifier: Apache-2.0

interface IRequestParams {
  url: string;
  body?: object;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  queryParams?: Record<string, any>;
  headers?: Record<string, string>;
}

const getErrorMessage = (payload: unknown, fallbackMessage: string) => {
  if (typeof payload === 'string' && payload.trim()) {
    return payload;
  }

  if (payload && typeof payload === 'object' && 'message' in payload && typeof payload.message === 'string') {
    return payload.message;
  }

  return fallbackMessage;
};

const request = async <T>({
  url = '',
  method = 'GET',
  body,
  queryParams = {},
  headers = {
    'content-type': 'application/json',
  },
}: IRequestParams): Promise<T> => {
  const searchParams = new URLSearchParams(queryParams).toString();
  const requestUrl = searchParams ? `${url}?${searchParams}` : url;
  const response = await fetch(requestUrl, {
    method,
    body: body ? JSON.stringify(body) : undefined,
    headers,
  });
  const contentType = response.headers.get('content-type') || '';
  const responseText = await response.text();

  if (!responseText) {
    if (!response.ok) {
      throw new Error(response.statusText || 'Request failed');
    }

    return undefined as unknown as T;
  }

  const isJsonResponse = contentType.includes('application/json');
  const payload = isJsonResponse ? JSON.parse(responseText) : responseText;

  if (!response.ok) {
    throw new Error(getErrorMessage(payload, response.statusText || 'Request failed'));
  }

  return payload as T;
};

export default request;
