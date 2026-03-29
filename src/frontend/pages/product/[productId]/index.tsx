// Copyright The OpenTelemetry Authors
// SPDX-License-Identifier: Apache-2.0

import { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import ApiGateway from '../../../gateways/Api.gateway';
import { Product } from '../../../protos/demo';
import AdProvider from '../../../providers/Ad.provider';
import { useCurrency } from '../../../providers/Currency.provider';
import AdStrip from '../../../components/store/AdStrip';
import ProductDetailView from '../../../components/store/ProductDetailView';
import StoreShell from '../../../components/store/StoreShell';

const ProductDetail: NextPage = () => {
  const { query } = useRouter();
  const { selectedCurrency } = useCurrency();
  const productId = query.productId as string;

  const {
    data: product = {} as Product,
  } = useQuery({
    queryKey: ['product', productId, 'selectedCurrency', selectedCurrency],
    queryFn: () => ApiGateway.getProduct(productId, selectedCurrency),
    enabled: !!productId,
  }) as { data: Product };
  const { data: productList = [] } = useQuery({
    queryKey: ['products', selectedCurrency],
    queryFn: () => ApiGateway.listProducts(selectedCurrency),
  });

  return (
    <AdProvider
      productIds={[productId]}
      contextKeys={product.categories || []}
    >
      <Head>
        <title>{product.name ? `${product.name} | Better Swag` : 'Better Swag Product'}</title>
      </Head>
      <StoreShell>
        <AdStrip />
        {product.id ? <ProductDetailView product={product} productList={productList} /> : null}
      </StoreShell>
    </AdProvider>
  );
};

export default ProductDetail;
