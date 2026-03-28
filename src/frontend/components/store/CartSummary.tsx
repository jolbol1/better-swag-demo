import Link from 'next/link';
import { ShoppingBag, Trash2 } from 'lucide-react';
import { useCart } from '../../providers/Cart.provider';
import { formatMoney, getProductImagePath, getStoreFamily, getStoreVariant, moneyToNumber } from '../../utils/storefront';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';

interface IProps {
  ctaLabel?: string;
  ctaHref?: string;
  shippingCostLabel?: string;
  title?: string;
}

export default function CartSummary({
  ctaHref = '/cart',
  ctaLabel = 'Go to checkout',
  shippingCostLabel = 'Calculated at checkout',
  title = 'Cart',
}: IProps) {
  const {
    cart: { items },
    emptyCart,
  } = useCart();

  const subtotal = items.reduce((sum, item) => sum + moneyToNumber(item.product.priceUsd) * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>
              {itemCount === 0
                ? 'Nothing in the basket yet.'
                : `${itemCount} item${itemCount === 1 ? '' : 's'} ready for checkout.`}
            </CardDescription>
          </div>
          {itemCount > 0 ? (
            <Button variant="ghost" size="sm" onClick={() => emptyCart()}>
              <Trash2 className="size-4" />
              Empty
            </Button>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {items.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.02] p-6 text-sm leading-6 text-muted-foreground">
            Add a product from the collection to start building your order.
          </div>
        ) : (
          <div className="space-y-4">
            {items.map(item => {
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
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium text-foreground">{family?.name || item.product.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {variant?.label || item.product.name}
                          </p>
                        </div>
                        <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-muted-foreground">
                          Qty {item.quantity}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{family?.shipNote || item.product.description}</p>
                      <p className="text-sm font-medium text-foreground">
                        {formatMoney(item.product.priceUsd)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="space-y-3 rounded-3xl border border-white/[0.08] bg-white/[0.03] p-4 text-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span>Subtotal</span>
            <span>{formatMoney(items[0]?.product.priceUsd ? { ...items[0].product.priceUsd, units: subtotal, nanos: 0 } : undefined)}</span>
          </div>
          <div className="flex items-center justify-between text-muted-foreground">
            <span>Shipping</span>
            <span>{shippingCostLabel}</span>
          </div>
          <div className="flex items-center justify-between text-base font-semibold text-foreground">
            <span>Estimated total</span>
            <span>{formatMoney(items[0]?.product.priceUsd ? { ...items[0].product.priceUsd, units: subtotal, nanos: 0 } : undefined)}</span>
          </div>
        </div>

        <Button asChild size="lg" className="w-full">
          <Link href={ctaHref}>
            <ShoppingBag className="size-4" />
            {ctaLabel}
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
