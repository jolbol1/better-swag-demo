// Copyright The OpenTelemetry Authors
// SPDX-License-Identifier: Apache-2.0

import Link from 'next/link';
import Button from '../Button';
import * as S from '../../styles/Cart.styled';

const EmptyCart = () => {
  return (
    <S.EmptyCartContainer>
      <S.Title>Your merch cart is empty.</S.Title>
      <S.Subtitle>Add a Better Swag item and it will show up here instantly.</S.Subtitle>

      <S.ButtonContainer>
        <Link href="/">
          <Button type="submit">Browse the Collection</Button>
        </Link>
      </S.ButtonContainer>
    </S.EmptyCartContainer>
  );
};

export default EmptyCart;
