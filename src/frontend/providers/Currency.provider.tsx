// Copyright The OpenTelemetry Authors
// SPDX-License-Identifier: Apache-2.0

import { createContext, useCallback, useContext, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import ApiGateway from '../gateways/Api.gateway';
import { useSession } from './Session.provider';

interface IContext {
  currencyCodeList: string[];
  setSelectedCurrency(currency: string): void;
  selectedCurrency: string;
}

export const Context = createContext<IContext>({
  currencyCodeList: [],
  selectedCurrency: 'USD',
  setSelectedCurrency: () => ({}),
});

interface IProps {
  children: React.ReactNode;
}

export const useCurrency = () => useContext(Context);

const CurrencyProvider = ({ children }: IProps) => {
  const {
    session: { currencyCode },
    setSessionValue,
  } = useSession();
  const { data: currencyCodeListUnsorted = [] } = useQuery({
    queryKey: ['currency'],
    queryFn: ApiGateway.getSupportedCurrencyList
  });

  const onSelectCurrency = useCallback((currencyCode: string) => {
    setSessionValue('currencyCode', currencyCode);
  }, [setSessionValue]);

  const currencyCodeList = currencyCodeListUnsorted.sort();

  const value = useMemo(
      () => ({
        currencyCodeList,
        selectedCurrency: currencyCode,
        setSelectedCurrency: onSelectCurrency,
      }),
      [currencyCode, currencyCodeList, onSelectCurrency]
  );

  return <Context.Provider value={value}>{children}</Context.Provider>;
};

export default CurrencyProvider;
