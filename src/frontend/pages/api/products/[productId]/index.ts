// Copyright The OpenTelemetry Authors
// SPDX-License-Identifier: Apache-2.0

import type { NextApiRequest, NextApiResponse } from 'next';
import { Empty, Product } from '../../../../protos/demo';
import ProductCatalogService from '../../../../services/ProductCatalog.service';
import { isProductNotFoundError } from '../../../../utils/productCatalogErrors';

type TResponse = Product | Empty;

const handler = async ({ method, query }: NextApiRequest, res: NextApiResponse<TResponse>) => {
  switch (method) {
    case 'GET': {
      const { productId = '', currencyCode = '' } = query;
      try {
        const product = await ProductCatalogService.getProduct(productId as string, currencyCode as string);

        return res.status(200).json(product);
      } catch (error) {
        if (isProductNotFoundError(error)) {
          return res.status(404).send('');
        }

        throw error;
      }
    }

    default: {
      return res.status(405).send('');
    }
  }
};

export default handler;
