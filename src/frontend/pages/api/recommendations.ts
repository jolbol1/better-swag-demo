// Copyright The OpenTelemetry Authors
// SPDX-License-Identifier: Apache-2.0

import type { NextApiRequest, NextApiResponse } from 'next';
import RecommendationsGateway from '../../gateways/rpc/Recommendations.gateway';
import { Empty, Product } from '../../protos/demo';
import ProductCatalogService from '../../services/ProductCatalog.service';
import { isProductNotFoundError } from '../../utils/productCatalogErrors';

type TResponse = Product[] | Empty;

const handler = async ({ method, query }: NextApiRequest, res: NextApiResponse<TResponse>) => {
  switch (method) {
    case 'GET': {
      const { productIds = [], sessionId = '', currencyCode = '' } = query;
      const { productIds: productList } = await RecommendationsGateway.listRecommendations(
        sessionId as string,
        productIds as string[]
      );
      const recommendedProductList = (
        await Promise.all(
          productList.slice(0, 4).map(async id => {
            try {
              return await ProductCatalogService.getProduct(id, currencyCode as string);
            } catch (error) {
              if (isProductNotFoundError(error)) {
                console.warn('Skipping stale recommended product', {
                  productId: id,
                  requestProductIds: productIds,
                  sessionId,
                });
                return null;
              }

              throw error;
            }
          })
        )
      ).filter(Boolean) as Product[];

      return res.status(200).json(recommendedProductList);
    }

    default: {
      return res.status(405).send('');
    }
  }
};

export default handler;
