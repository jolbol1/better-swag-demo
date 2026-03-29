import { useEffect } from 'react';
import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import { IProductCheckout } from '../../types/Cart';
import { trackBetterstackEvent } from '../../utils/betterstack';
import { formatMoney, getPrimaryCategoryFromLineItems, getProductImagePath, getStoreFamily, getStoreVariant, moneyToNumber } from '../../utils/storefront';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';

export default function OrderCompleteView({ order }: { order: IProductCheckout }) {
  const itemTotal = order.items.reduce((sum, entry) => sum + moneyToNumber(entry.cost), 0);
  const shippingTotal = moneyToNumber(order.shippingCost);
  const currencyTemplate = order.shippingCost || order.items[0]?.cost;
  const primaryCategory = getPrimaryCategoryFromLineItems(
    order.items.map(entry => ({
      productId: entry.item.productId,
      quantity: entry.item.quantity,
    }))
  );

  useEffect(() => {
    trackBetterstackEvent('order_complete_viewed', {
      category: primaryCategory,
      item_count: order.items.reduce((sum, entry) => sum + entry.item.quantity, 0),
      item_total: itemTotal,
      order_id: order.orderId || 'pending-confirmation',
      shipping_total: shippingTotal,
      tracking_id: order.shippingTrackingId || 'pending-shipment',
    });
  }, [itemTotal, order.items, order.orderId, order.shippingTrackingId, primaryCategory, shippingTotal]);

  return (
    <main className="mt-8">
      <div className="mx-auto max-w-4xl">
        <Card className="w-full">
          <CardContent className="space-y-6 px-8 py-10">
            <div className="mx-auto flex size-18 items-center justify-center rounded-full border border-emerald-400/20 bg-emerald-400/10">
              <CheckCircle2 className="size-8 text-emerald-300" />
            </div>
            <div className="space-y-3 text-center">
              <p className="text-xs uppercase tracking-[0.32em] text-primary">Order confirmed</p>
              <h1 className="text-4xl font-semibold tracking-tight">Checkout complete.</h1>
              <p className="text-base leading-8 text-muted-foreground">
                The order has been handed off to the existing demo services and a confirmation email
                should already be on its way.
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
              <div className="space-y-4">
                {order.items.map(({ item, cost }) => {
                  const family = getStoreFamily(item.productId);
                  const variant = getStoreVariant(item.productId);

                  return (
                    <div
                      key={item.productId}
                      className="rounded-3xl border border-white/[0.08] bg-white/[0.03] p-4"
                    >
                      <div className="flex gap-4">
                        <div className="size-20 overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                          <img
                            src={getProductImagePath(item.product)}
                            alt={family?.name || item.product.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-medium text-foreground">{family?.name || item.product.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {variant?.label || item.product.name} / Qty {item.quantity}
                              </p>
                            </div>
                            <p className="text-sm font-semibold text-foreground">{formatMoney(cost)}</p>
                          </div>
                          <p className="mt-3 text-sm text-muted-foreground">{item.product.description}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="space-y-4">
                <div className="rounded-3xl border border-white/[0.08] bg-white/[0.03] p-5">
                  <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">Reference</p>
                  <p className="mt-2 text-2xl font-semibold">{order.orderId || 'Pending confirmation'}</p>
                  <p className="mt-4 text-xs uppercase tracking-[0.28em] text-muted-foreground">
                    Tracking
                  </p>
                  <p className="mt-2 text-lg font-medium">{order.shippingTrackingId || 'Pending shipment'}</p>
                </div>

                <div className="rounded-3xl border border-white/[0.08] bg-white/[0.03] p-5 text-sm">
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>Items</span>
                    <span>
                      {currencyTemplate
                        ? formatMoney({ ...currencyTemplate, units: itemTotal, nanos: 0 })
                        : '$0.00'}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-muted-foreground">
                    <span>Shipping</span>
                    <span>{formatMoney(order.shippingCost)}</span>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-base font-semibold text-foreground">
                    <span>Total</span>
                    <span>
                      {currencyTemplate
                        ? formatMoney({ ...currencyTemplate, units: itemTotal + shippingTotal, nanos: 0 })
                        : '$0.00'}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <Button asChild size="lg">
                    <Link href="/">Return to storefront</Link>
                  </Button>
                  <Button asChild size="lg" variant="outline">
                    <Link href="/product/incident-hoodie-sand">Open merch lab</Link>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
