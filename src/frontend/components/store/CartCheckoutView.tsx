import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import { CreditCard, ShieldCheck, Truck } from 'lucide-react';
import ApiGateway from '../../gateways/Api.gateway';
import { useAuth } from '../../providers/Auth.provider';
import { useCart } from '../../providers/Cart.provider';
import { useCurrency } from '../../providers/Currency.provider';
import { trackBetterstackEvent } from '../../utils/betterstack';
import { formatMoney, moneyToNumber } from '../../utils/storefront';
import Recommendations from './Recommendations';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';

interface IFormState {
  city: string;
  country: string;
  creditCardCvv: string;
  creditCardExpirationMonth: string;
  creditCardExpirationYear: string;
  creditCardNumber: string;
  email: string;
  state: string;
  streetAddress: string;
  zipCode: string;
}

const defaultFormState: IFormState = {
  email: 'someone@example.com',
  streetAddress: '1600 Amphitheatre Parkway',
  city: 'Mountain View',
  state: 'CA',
  country: 'United States',
  zipCode: '94043',
  creditCardNumber: '4432-8015-6152-0454',
  creditCardCvv: '672',
  creditCardExpirationYear: '2030',
  creditCardExpirationMonth: '1',
};

export default function CartCheckoutView() {
  const router = useRouter();
  const { sessionUserId, user } = useAuth();
  const {
    cart: { items },
    placeOrder,
  } = useCart();
  const { selectedCurrency } = useCurrency();
  const [formState, setFormState] = useState<IFormState>(defaultFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setFormState(current => ({
      ...current,
      email: user?.email ?? defaultFormState.email,
    }));
  }, [user]);

  const shippingAddress = useMemo(
    () => ({
      streetAddress: formState.streetAddress,
      city: formState.city,
      state: formState.state,
      country: formState.country,
      zipCode: formState.zipCode,
    }),
    [formState]
  );

  const isShippingReady = Object.values(shippingAddress).every(Boolean) && items.length > 0;
  const subtotal = items.reduce((sum, item) => sum + moneyToNumber(item.product.priceUsd) * item.quantity, 0);

  useEffect(() => {
    if (items.length === 0) {
      return;
    }

    trackBetterstackEvent('checkout_viewed', {
      currency: selectedCurrency || 'USD',
      identified_user: Boolean(user),
      item_count: items.reduce((sum, item) => sum + item.quantity, 0),
      subtotal,
    });
  }, [items, selectedCurrency, subtotal, user]);

  const { data: shippingCost } = useQuery({
    queryKey: ['shipping-quote', items, selectedCurrency, shippingAddress],
    queryFn: () => ApiGateway.getShippingCost(items, selectedCurrency || 'USD', shippingAddress),
    enabled: isShippingReady,
    refetchOnWindowFocus: false,
  });

  const total = subtotal + moneyToNumber(shippingCost);

  useEffect(() => {
    if (!isShippingReady || !shippingCost) {
      return;
    }

    trackBetterstackEvent('shipping_quote_received', {
      country: shippingAddress.country,
      currency: selectedCurrency || 'USD',
      item_count: items.reduce((sum, item) => sum + item.quantity, 0),
      shipping_cost: moneyToNumber(shippingCost),
      state: shippingAddress.state,
    });
  }, [isShippingReady, items, selectedCurrency, shippingAddress.country, shippingAddress.state, shippingCost]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    trackBetterstackEvent('checkout_submitted', {
      currency: selectedCurrency || 'USD',
      identified_user: Boolean(user),
      item_count: items.reduce((sum, item) => sum + item.quantity, 0),
      shipping_country: shippingAddress.country,
      shipping_state: shippingAddress.state,
      subtotal,
      user_id: sessionUserId,
    });

    try {
      const order = await placeOrder({
        userId: sessionUserId,
        userCurrency: selectedCurrency || 'USD',
        email: formState.email,
        address: shippingAddress,
        creditCard: {
          creditCardNumber: formState.creditCardNumber,
          creditCardCvv: Number(formState.creditCardCvv),
          creditCardExpirationYear: Number(formState.creditCardExpirationYear),
          creditCardExpirationMonth: Number(formState.creditCardExpirationMonth),
        },
      });

      router.push({
        pathname: `/cart/checkout/${order.orderId}`,
        query: { order: JSON.stringify(order) },
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="mt-8 space-y-8">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
        <form className="space-y-6" onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Contact</CardTitle>
              <CardDescription>
                Share the essentials so the checkout, email, and shipping services can complete the
                order.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <label className="text-sm text-muted-foreground" htmlFor="email">
                  Email
                </label>
                <Input
                  id="email"
                  value={formState.email}
                  onChange={event => setFormState(current => ({ ...current, email: event.target.value }))}
                  required
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex size-11 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10">
                  <Truck className="size-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Shipping</CardTitle>
                  <CardDescription>
                    The shipping quote is fetched from the demo shipping service as you fill this
                    out.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <label className="text-sm text-muted-foreground" htmlFor="streetAddress">
                  Address
                </label>
                <Input
                  id="streetAddress"
                  value={formState.streetAddress}
                  onChange={event =>
                    setFormState(current => ({ ...current, streetAddress: event.target.value }))
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground" htmlFor="city">
                  City
                </label>
                <Input
                  id="city"
                  value={formState.city}
                  onChange={event => setFormState(current => ({ ...current, city: event.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground" htmlFor="zipCode">
                  Postal code
                </label>
                <Input
                  id="zipCode"
                  value={formState.zipCode}
                  onChange={event => setFormState(current => ({ ...current, zipCode: event.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground" htmlFor="state">
                  State
                </label>
                <Input
                  id="state"
                  value={formState.state}
                  onChange={event => setFormState(current => ({ ...current, state: event.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground" htmlFor="country">
                  Country
                </label>
                <Input
                  id="country"
                  value={formState.country}
                  onChange={event => setFormState(current => ({ ...current, country: event.target.value }))}
                  required
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex size-11 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10">
                  <CreditCard className="size-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Payment</CardTitle>
                  <CardDescription>
                    Fast checkout, but still running through the real demo payment path.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <label className="text-sm text-muted-foreground" htmlFor="cardNumber">
                  Card number
                </label>
                <Input
                  id="cardNumber"
                  value={formState.creditCardNumber}
                  onChange={event =>
                    setFormState(current => ({ ...current, creditCardNumber: event.target.value }))
                  }
                  required
                  pattern="\d{4}-\d{4}-\d{4}-\d{4}"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground" htmlFor="expiryMonth">
                  Expiry month
                </label>
                <Input
                  id="expiryMonth"
                  value={formState.creditCardExpirationMonth}
                  onChange={event =>
                    setFormState(current => ({
                      ...current,
                      creditCardExpirationMonth: event.target.value,
                    }))
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground" htmlFor="expiryYear">
                  Expiry year
                </label>
                <Input
                  id="expiryYear"
                  value={formState.creditCardExpirationYear}
                  onChange={event =>
                    setFormState(current => ({
                      ...current,
                      creditCardExpirationYear: event.target.value,
                    }))
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground" htmlFor="cvv">
                  CVV
                </label>
                <Input
                  id="cvv"
                  value={formState.creditCardCvv}
                  onChange={event =>
                    setFormState(current => ({ ...current, creditCardCvv: event.target.value }))
                  }
                  required
                  pattern="\d{3}"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-emerald-300/15 bg-emerald-500/10">
            <CardContent className="flex gap-3 px-6 py-5 text-sm text-emerald-100">
              <ShieldCheck className="mt-0.5 size-5 shrink-0 text-emerald-200" />
              <p>
                Checkout writes to the existing demo services. Cart, payment, shipping, email, and
                downstream accounting are still exercised by this flow.
              </p>
            </CardContent>
          </Card>

          <Button type="submit" size="lg" className="w-full" disabled={items.length === 0 || isSubmitting}>
            {isSubmitting ? 'Placing order...' : 'Place order'}
          </Button>
        </form>

        <aside className="lg:sticky lg:top-8 lg:self-start">
          <Card>
            <CardHeader>
              <CardTitle>Order summary</CardTitle>
              <CardDescription>
                {items.length} item{items.length === 1 ? '' : 's'} in your checkout.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-3 text-sm">
                {items.map(item => (
                  <div key={item.productId} className="flex items-center justify-between gap-3">
                    <span className="text-muted-foreground">
                      {item.product.name} x {item.quantity}
                    </span>
                    <span className="text-foreground">{formatMoney(item.product.priceUsd)}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-3 rounded-3xl border border-white/[0.08] bg-white/[0.03] p-4 text-sm">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>{formatMoney(items[0]?.product.priceUsd ? { ...items[0].product.priceUsd, units: subtotal, nanos: 0 } : undefined)}</span>
                </div>
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Shipping</span>
                  <span>{shippingCost ? formatMoney(shippingCost) : 'Waiting for address'}</span>
                </div>
                <div className="flex items-center justify-between text-base font-semibold text-foreground">
                  <span>Total</span>
                  <span>{formatMoney(items[0]?.product.priceUsd ? { ...items[0].product.priceUsd, units: total, nanos: 0 } : undefined)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>

      <Recommendations />
    </main>
  );
}
