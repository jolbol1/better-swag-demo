// Copyright The OpenTelemetry Authors
// SPDX-License-Identifier: Apache-2.0

import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import Ad from '../../../../components/Ad';
import Button from '../../../../components/Button';
import CheckoutItem from '../../../../components/CheckoutItem';
import Footer from '../../../../components/Footer';
import Layout from '../../../../components/Layout';
import Recommendations from '../../../../components/Recommendations';
import AdProvider from '../../../../providers/Ad.provider';
import { useSession } from '../../../../providers/Session.provider';
import * as S from '../../../../styles/Checkout.styled';
import { IProductCheckout } from '../../../../types/Cart';
import { trackBetterStackEvent } from '../../../../utils/betterstack';

const Checkout: NextPage = () => {
  const { query } = useRouter();
  const { session, selectedUser } = useSession();
  const {
    orderId = '',
    items = [],
    shippingAddress,
    shippingCost,
  } = JSON.parse((query.order || '{}') as string) as IProductCheckout;

  useEffect(() => {
    if (!orderId || !items.length) {
      return;
    }

    trackBetterStackEvent('checkout-completed', {
      order_id: orderId,
      user_id: session.userId,
      selected_user_id: selectedUser?.id || null,
      selected_user_plan: selectedUser?.plan || null,
      item_count: items.length,
      total_quantity: items.reduce((sum, checkoutItem) => sum + checkoutItem.item.quantity, 0),
      product_ids: items.map(checkoutItem => checkoutItem.item.productId),
      product_names: items.map(checkoutItem => checkoutItem.item.product.name),
      product_categories: [...new Set(items.flatMap(checkoutItem => checkoutItem.item.product.categories))],
      shipping_country: shippingAddress?.country || null,
      shipping_state: shippingAddress?.state || null,
      shipping_city: shippingAddress?.city || null,
      shipping_zip_code: shippingAddress?.zipCode || null,
      shipping_cost_units: shippingCost?.units ?? null,
      shipping_cost_currency: shippingCost?.currencyCode || null,
      source_page: `/cart/checkout/${orderId}`,
    });
  }, [
    items,
    orderId,
    selectedUser?.id,
    selectedUser?.plan,
    session.userId,
    shippingAddress?.city,
    shippingAddress?.country,
    shippingAddress?.state,
    shippingAddress?.zipCode,
    shippingCost?.currencyCode,
    shippingCost?.units,
  ]);

  return (
    <AdProvider
      productIds={items.map(({ item }) => item?.productId || '')}
      contextKeys={[...new Set(items.flatMap(({ item }) => item.product.categories))]}
    >
      <Head>
        <title>Better Swag - Order Complete</title>
      </Head>
      <Layout>
        <S.Checkout>
          <S.Container>
            <S.Title>Your Better Swag order is confirmed.</S.Title>
            <S.Subtitle>Confirmation details are queued for this demo session.</S.Subtitle>

            <S.ItemList>
              {items.map(checkoutItem => (
                <CheckoutItem
                  key={checkoutItem.item.productId}
                  checkoutItem={checkoutItem}
                  address={shippingAddress}
                />
              ))}
            </S.ItemList>

            <S.ButtonContainer>
              <Link href="/">
                <Button type="submit">Back to Store</Button>
              </Link>
            </S.ButtonContainer>
          </S.Container>
          <Recommendations />
        </S.Checkout>
        <Ad />
        <Footer />
      </Layout>
    </AdProvider>
  );
};

export default Checkout;
