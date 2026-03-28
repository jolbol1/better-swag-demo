import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Search, Sparkles } from 'lucide-react';
import { useCart } from '../../providers/Cart.provider';
import { Product } from '../../protos/demo';
import {
  BENEFIT_TILES,
  COLLECTION_STATS,
  buildStorefrontCollection,
  formatMoney,
  getProductImagePath,
  getSearchCategories,
} from '../../utils/storefront';
import { trackBetterstackEvent, trackBetterstackFunnelStep } from '../../utils/betterstack';
import { cn } from '../../utils/cn';
import CartSummary from './CartSummary';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Input } from '../ui/input';

export default function CollectionView({ products }: { products: Product[] }) {
  const { addItem } = useCart();
  const [searchValue, setSearchValue] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const deferredSearch = useDeferredValue(searchValue);

  const collection = useMemo(() => buildStorefrontCollection(products), [products]);
  const categories = useMemo(() => getSearchCategories(), []);

  const visibleProducts = useMemo(() => {
    return collection.filter(({ definition }) => {
      const matchesCategory = activeCategory === 'All' || definition.category === activeCategory;
      const searchNeedle = deferredSearch.trim().toLowerCase();

      if (!searchNeedle) {
        return matchesCategory;
      }

      const searchHaystack = [
        definition.name,
        definition.category,
        definition.badge,
        definition.description,
        definition.heroCopy,
        ...definition.highlights,
        ...definition.variants.map(variant => variant.label),
      ]
        .join(' ')
        .toLowerCase();

      return matchesCategory && searchHaystack.includes(searchNeedle);
    });
  }, [activeCategory, collection, deferredSearch]);

  useEffect(() => {
    if (collection.length === 0) {
      return;
    }

    trackBetterstackFunnelStep('funnel_storefront_viewed', {
      category_count: categories.length - 1,
      page: '/',
      product_family_count: collection.length,
    });

    trackBetterstackEvent('storefront_viewed', {
      product_family_count: collection.length,
      category_count: categories.length - 1,
    });
  }, [categories.length, collection.length]);

  useEffect(() => {
    const trimmedSearch = deferredSearch.trim();

    if (!trimmedSearch) {
      return;
    }

    trackBetterstackEvent('catalog_search_performed', {
      search_term: trimmedSearch,
      result_count: visibleProducts.length,
      active_category: activeCategory,
    });
  }, [activeCategory, deferredSearch, visibleProducts.length]);

  return (
    <main className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="space-y-8">
        <section>
          <Card className="overflow-hidden">
            <CardContent className="grid gap-8 px-6 py-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:px-8 lg:py-10">
              <div className="space-y-6">
                <Badge>Ops-ready collection</Badge>
                <div className="space-y-4">
                  <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
                    Swag for the people who read incident timelines for fun.
                  </h1>
                  <p className="max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg">
                    Better Swag replaces the original demo storefront with heavyweight staples,
                    matte ceramics, and everyday accessories while keeping the full OTel service
                    graph behind cart, checkout, recommendations, shipping, and currency.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button asChild size="lg">
                    <a
                      href="#catalog"
                      onClick={() =>
                        trackBetterstackEvent('storefront_cta_clicked', {
                          cta_id: 'browse_drop',
                          page: '/',
                        })
                      }
                    >
                      Browse the drop
                    </a>
                  </Button>
                  <Button asChild size="lg" variant="outline">
                    <Link
                      href="/product/incident-hoodie-sand"
                      onClick={() =>
                        trackBetterstackEvent('storefront_cta_clicked', {
                          cta_id: 'open_merch_lab',
                          destination_product_id: 'incident-hoodie-sand',
                          page: '/',
                        })
                      }
                    >
                      Open merch lab
                    </Link>
                  </Button>
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  {COLLECTION_STATS.map(stat => (
                    <div
                      key={stat.label}
                      className="rounded-3xl border border-white/[0.08] bg-white/[0.03] p-4"
                    >
                      <p className="text-3xl font-semibold">{stat.value}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.22em] text-muted-foreground">
                        {stat.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative min-h-[360px] rounded-[28px] border border-white/[0.08] bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.18),_transparent_55%),linear-gradient(180deg,rgba(15,23,42,0.75),rgba(7,11,17,0.96))] p-4">
                <div className="absolute inset-0 bg-[linear-gradient(135deg,transparent_0%,rgba(255,255,255,0.04)_100%)]" />
                <div className="relative h-full">
                  <div className="absolute left-2 top-6 w-44 rotate-[-10deg] overflow-hidden rounded-[24px] border border-white/10 shadow-2xl">
                    <img
                      src="/images/products/hoodie-charcoal.png"
                      alt="Better Swag hoodie"
                      className="h-auto w-full object-cover"
                    />
                  </div>
                  <div className="absolute right-0 top-20 w-40 rotate-[9deg] overflow-hidden rounded-[24px] border border-white/10 shadow-2xl">
                    <img
                      src="/images/products/mug-black.png"
                      alt="Better Swag mug"
                      className="h-auto w-full object-cover"
                    />
                  </div>
                  <div className="absolute bottom-2 left-1/2 w-44 -translate-x-1/2 rotate-[4deg] overflow-hidden rounded-[24px] border border-white/10 shadow-2xl">
                    <img
                      src="/images/products/tote-natural.png"
                      alt="Better Swag tote"
                      className="h-auto w-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section id="catalog" className="space-y-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-primary">Collection</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight">
                Quiet enough for work, loud enough for your landing page.
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-7 text-muted-foreground">
              Search the catalog, slice by category, and drill into product pages for a heavier
              client-side merch lab without losing the demo’s backend behaviors.
            </p>
          </div>

          <Card>
            <CardContent className="space-y-4 px-5 py-5">
              <div className="flex flex-col gap-3 lg:flex-row">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="catalog-search"
                    name="catalogSearch"
                    value={searchValue}
                    placeholder="Search by product, badge, or highlight"
                    className="pl-10"
                    onChange={event => setSearchValue(event.target.value)}
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {categories.map(category => (
                    <button
                      key={category}
                      type="button"
                      className={cn(
                        'rounded-full border px-4 py-2 text-sm transition',
                        activeCategory === category
                          ? 'border-primary/60 bg-primary/12 text-foreground'
                          : 'border-white/10 bg-white/[0.03] text-muted-foreground hover:border-white/20 hover:text-foreground'
                      )}
                      onClick={() => setActiveCategory(category)}
                      onClickCapture={() =>
                        trackBetterstackEvent('catalog_filter_changed', {
                          category,
                          page: '/',
                        })
                      }
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{visibleProducts.length} product families visible</span>
                <span>Service-backed add-to-cart and checkout remain intact.</span>
              </div>
            </CardContent>
          </Card>

          {visibleProducts.length > 0 ? (
            <div className="grid gap-6 xl:grid-cols-2">
              {visibleProducts.map(({ availableVariants, definition }) => {
                const activeProductId = selectedVariants[definition.slug] || availableVariants[0].product.id;
                const activeVariant = availableVariants.find(variant => variant.product.id === activeProductId) || availableVariants[0];

                return (
                  <Card key={definition.slug} className="group overflow-hidden">
                    <div className="aspect-square overflow-hidden border-b border-white/[0.06] bg-[radial-gradient(circle_at_top,_rgba(45,212,191,0.18),_transparent_55%),linear-gradient(180deg,rgba(15,23,42,0.85),rgba(8,12,20,0.96))]">
                      <img
                        src={getProductImagePath(activeVariant.product)}
                        alt={`${definition.name} in ${activeVariant.label}`}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                      />
                    </div>
                    <CardContent className="space-y-5 pt-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-2">
                          <Badge>{definition.badge}</Badge>
                          <div>
                            <h3 className="text-xl font-semibold tracking-tight">{definition.name}</h3>
                            <p className="mt-1 text-sm leading-6 text-muted-foreground">
                              {definition.description}
                            </p>
                          </div>
                        </div>
                        <p className="text-lg font-semibold">{formatMoney(activeVariant.product.priceUsd)}</p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {definition.highlights.map(highlight => (
                          <span
                            key={highlight}
                            className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-muted-foreground"
                          >
                            {highlight}
                          </span>
                        ))}
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Variant</span>
                          <span>{activeVariant.label}</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {availableVariants.map(variant => (
                            <button
                              key={variant.product.id}
                              type="button"
                              className={cn(
                                'flex items-center gap-2 rounded-full border px-3 py-2 text-sm transition',
                                variant.product.id === activeVariant.product.id
                                  ? 'border-primary/60 bg-primary/12 text-foreground'
                                  : 'border-white/10 bg-white/[0.03] text-muted-foreground hover:border-white/20 hover:text-foreground'
                              )}
                              onClick={() =>
                                {
                                  setSelectedVariants(current => ({
                                    ...current,
                                    [definition.slug]: variant.product.id,
                                  }));
                                  trackBetterstackEvent('catalog_variant_selected', {
                                    category: definition.category,
                                    product_family: definition.name,
                                    product_id: variant.product.id,
                                    variant: variant.label,
                                  });
                                }
                              }
                            >
                              <span
                                className="size-3 rounded-full border border-black/10"
                                style={{ backgroundColor: variant.swatch }}
                              />
                              {variant.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-4">
                        <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                          {definition.shipNote}
                        </p>
                        <div className="flex gap-3">
                          <Button
                            variant="outline"
                            onClick={() => {
                              addItem({ productId: activeVariant.product.id, quantity: 1 });
                              trackBetterstackFunnelStep('funnel_cart_started', {
                                category: definition.category,
                                page: '/',
                                price: activeVariant.product.priceUsd?.units ?? 0,
                                product_family: definition.name,
                                product_id: activeVariant.product.id,
                                quantity: 1,
                                source: 'collection_card',
                                variant: activeVariant.label,
                              });
                              trackBetterstackEvent('product_added_to_cart', {
                                category: definition.category,
                                price: activeVariant.product.priceUsd?.units ?? 0,
                                product_family: definition.name,
                                product_id: activeVariant.product.id,
                                quantity: 1,
                                source: 'collection_card',
                                variant: activeVariant.label,
                              });
                            }}
                          >
                            Add to cart
                          </Button>
                          <Button asChild>
                            <Link
                              href={`/product/${activeVariant.product.id}`}
                              onClick={() =>
                                {
                                  trackBetterstackFunnelStep('funnel_product_viewed', {
                                    category: definition.category,
                                    page: `/product/${activeVariant.product.id}`,
                                    product_family: definition.name,
                                    product_id: activeVariant.product.id,
                                    source: 'collection_card',
                                    variant: activeVariant.label,
                                  });
                                  trackBetterstackEvent('product_detail_opened', {
                                    category: definition.category,
                                    product_family: definition.name,
                                    product_id: activeVariant.product.id,
                                    source: 'collection_card',
                                    variant: activeVariant.label,
                                  });
                                }
                              }
                            >
                              View details
                              <ArrowRight className="size-4" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="px-6 py-8 text-sm text-muted-foreground">
                No products match that filter yet. Try a broader term like `hoodie`, `desk`, or
                `canvas`.
              </CardContent>
            </Card>
          )}
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          {BENEFIT_TILES.map(tile => (
            <Card key={tile.title}>
              <CardContent className="space-y-4 pt-6">
                <div className="inline-flex size-12 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10">
                  <Sparkles className="size-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{tile.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">{tile.copy}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </section>
      </div>

      <aside className="lg:sticky lg:top-8 lg:self-start">
        <CartSummary />
      </aside>
    </main>
  );
}
