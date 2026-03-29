// Copyright The OpenTelemetry Authors
// SPDX-License-Identifier: Apache-2.0

import { NextPage } from 'next';
import Head from 'next/head';
import { useCart } from '../../providers/Cart.provider';
import AdProvider from '../../providers/Ad.provider';
import AdStrip from '../../components/store/AdStrip';
import CartCheckoutView from '../../components/store/CartCheckoutView';
import StoreShell from '../../components/store/StoreShell';

const Cart: NextPage = () => {
  const {
    cart: { items },
  } = useCart();

  return (
    <AdProvider
      productIds={items.map(({ productId }) => productId)}
      contextKeys={[...new Set(items.flatMap(({ product }) => product.categories))]}
    >
      <Head>
        <title>Checkout | Better Swag</title>
      </Head>
      <StoreShell>
        <AdStrip />
        <CartCheckoutView />
      </StoreShell>
    </AdProvider>
  );
};

export default Cart;
