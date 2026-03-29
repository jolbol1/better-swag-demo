// Copyright The OpenTelemetry Authors
// SPDX-License-Identifier: Apache-2.0

import { useRouter } from 'next/router';
import { useCallback, useState } from 'react';
import CartItems from '../CartItems';
import CheckoutForm from '../CheckoutForm';
import { IFormData } from '../CheckoutForm/CheckoutForm';
import { useCart } from '../../providers/Cart.provider';
import { useCurrency } from '../../providers/Currency.provider';
import { useSession } from '../../providers/Session.provider';
import * as S from '../../styles/Cart.styled';

const CartDetail = () => {
  const {
    cart: { items },
    emptyCart,
    placeOrder,
  } = useCart();
  const { selectedCurrency } = useCurrency();
  const {
    session: { userId },
  } = useSession();
  const { push } = useRouter();
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const onPlaceOrder = useCallback(
    async ({
      email,
      state,
      streetAddress,
      country,
      city,
      zipCode,
      creditCardCvv,
      creditCardExpirationMonth,
      creditCardExpirationYear,
      creditCardNumber,
    }: IFormData) => {
      setCheckoutError(null);

      try {
        const order = await placeOrder({
          userId,
          email,
          address: {
            streetAddress,
            state,
            country,
            city,
            zipCode,
          },
          userCurrency: selectedCurrency,
          creditCard: {
            creditCardCvv,
            creditCardExpirationMonth,
            creditCardExpirationYear,
            creditCardNumber,
          },
        });

        push({
          pathname: `/cart/checkout/${order.orderId}`,
          query: { order: JSON.stringify(order) },
        });
      } catch (error) {
        console.error('Unable to place order', error);
        setCheckoutError(error instanceof Error ? error.message : 'Checkout failed. Please try again.');
      }
    },
    [placeOrder, push, selectedCurrency, userId]
  );

  return (
    <S.Container>
      <div>
        <S.Header>
          <S.CarTitle>Merch Cart</S.CarTitle>
          <S.EmptyCartButton onClick={emptyCart} $type="link">
            Empty Cart
          </S.EmptyCartButton>
        </S.Header>
        {checkoutError ? <S.ErrorCallout role="alert">{checkoutError}</S.ErrorCallout> : null}
        <CartItems productList={items} />
      </div>
      <CheckoutForm onSubmit={onPlaceOrder} />
    </S.Container>
  );
};

export default CartDetail;
