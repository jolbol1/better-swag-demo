// Copyright The OpenTelemetry Authors
// SPDX-License-Identifier: Apache-2.0

import { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import AdProvider from '../../../../providers/Ad.provider';
import AdStrip from '../../../../components/store/AdStrip';
import OrderCompleteView from '../../../../components/store/OrderCompleteView';
import StoreShell from '../../../../components/store/StoreShell';
import { IProductCheckout } from '../../../../types/Cart';

const Checkout: NextPage = () => {
  const { query } = useRouter();
  const { items = [], shippingAddress } = JSON.parse((query.order || '{}') as string) as IProductCheckout;

  return (
    <AdProvider
      productIds={items.map(({ item }) => item?.productId || '')}
      contextKeys={[...new Set(items.flatMap(({ item }) => item.product.categories))]}
    >
      <Head>
        <title>Order Complete | Better Swag</title>
      </Head>
      <StoreShell>
        <AdStrip />
        <OrderCompleteView order={{ ...JSON.parse((query.order || '{}') as string), items, shippingAddress }} />
      </StoreShell>
    </AdProvider>
  );
};

export default Checkout;
