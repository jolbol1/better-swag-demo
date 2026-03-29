import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useAd } from '../../providers/Ad.provider';
import { formatMoney, getProductImagePath, getStoreFamily, getStoreVariant } from '../../utils/storefront';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';

export default function Recommendations() {
  const { recommendedProductList } = useAd();

  if (recommendedProductList.length === 0) {
    return null;
  }

  return (
    <section className="mt-8 space-y-5">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-primary">Recommended</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight">You may also like</h2>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        {recommendedProductList.slice(0, 3).map(product => {
          const family = getStoreFamily(product.id);
          const variant = getStoreVariant(product.id);

          return (
            <Card key={product.id}>
              <div className="aspect-[4/3] overflow-hidden rounded-t-[28px] border-b border-white/10 bg-[radial-gradient(circle_at_top,_rgba(45,212,191,0.18),_transparent_55%),linear-gradient(180deg,rgba(15,23,42,0.85),rgba(8,12,20,0.96))]">
                <img
                  src={getProductImagePath(product)}
                  alt={family?.name || product.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <CardContent className="space-y-4 pt-6">
                <div className="inline-flex size-12 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10">
                  <Sparkles className="size-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{family?.name || product.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{variant?.label || product.name}</p>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">
                    {family?.description || product.description}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-lg font-semibold">{formatMoney(product.priceUsd)}</p>
                  <Button asChild variant="outline">
                    <Link href={`/product/${product.id}`}>
                      View
                      <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
