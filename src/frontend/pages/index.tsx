// Copyright The OpenTelemetry Authors
// SPDX-License-Identifier: Apache-2.0

import { NextPage } from 'next';
import Head from 'next/head';
import { useQuery } from '@tanstack/react-query';
import AdProvider from '../providers/Ad.provider';
import ApiGateway from '../gateways/Api.gateway';
import AdStrip from '../components/store/AdStrip';
import CollectionView from '../components/store/CollectionView';
import StoreShell from '../components/store/StoreShell';
import { useCurrency } from '../providers/Currency.provider';

const Home: NextPage = () => {
  const { selectedCurrency } = useCurrency();
  const { data: productList = [] } = useQuery({
    queryKey: ['products', selectedCurrency],
    queryFn: () => ApiGateway.listProducts(selectedCurrency),
  });

  return (
    <AdProvider productIds={[]} contextKeys={['apparel', 'desk', 'carry']}>
      <Head>
        <title>Better Swag</title>
      </Head>
      <StoreShell>
        <AdStrip />
        <CollectionView products={productList} />
      </StoreShell>
    </AdProvider>
  );
};

export default Home;
