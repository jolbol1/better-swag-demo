import { useEffect, useMemo, useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ArrowLeft, ArrowRight, Check, Layers3 } from 'lucide-react';
import { useCart } from '../../providers/Cart.provider';
import { Product } from '../../protos/demo';
import {
  formatMoney,
  getProductImagePath,
  getRelatedProducts,
  getStoreFamily,
  getStoreVariant,
  getVariantOptions,
} from '../../utils/storefront';
import { cn } from '../../utils/cn';
import Recommendations from './Recommendations';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';

interface PreviewMockup {
  accent: string;
  cacheBlob: string;
  id: string;
  image: string;
  title: string;
}

function buildMockupSvg({
  accent,
  badgeText,
  note,
  productName,
  variantName,
}: {
  accent: string;
  badgeText: string;
  note: string;
  productName: string;
  variantName: string;
}) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="560" height="720" viewBox="0 0 560 720">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#061019" />
          <stop offset="100%" stop-color="${accent}" />
        </linearGradient>
      </defs>
      <rect width="560" height="720" rx="44" fill="url(#bg)" />
      <rect x="32" y="32" width="496" height="656" rx="36" fill="rgba(6,16,25,0.48)" stroke="rgba(255,255,255,0.14)" />
      <rect x="56" y="56" width="160" height="34" rx="17" fill="${accent}" />
      <text x="136" y="78" text-anchor="middle" font-size="18" font-family="Arial" fill="#061019">${badgeText}</text>
      <text x="56" y="158" font-size="48" font-family="Arial" font-weight="700" fill="#f8fafc">${productName}</text>
      <text x="56" y="202" font-size="22" font-family="Arial" fill="rgba(248,250,252,0.78)">${variantName}</text>
      <text x="56" y="260" font-size="18" font-family="Arial" fill="rgba(248,250,252,0.72)">${note}</text>
      <rect x="56" y="320" width="448" height="224" rx="28" fill="rgba(255,255,255,0.07)" />
      <rect x="88" y="352" width="384" height="12" rx="6" fill="rgba(255,255,255,0.13)" />
      <rect x="88" y="388" width="300" height="12" rx="6" fill="rgba(255,255,255,0.13)" />
      <rect x="88" y="456" width="190" height="56" rx="28" fill="${accent}" />
      <text x="183" y="492" text-anchor="middle" font-size="22" font-family="Arial" font-weight="700" fill="#061019">Better Stack</text>
      <text x="56" y="610" font-size="18" font-family="Arial" fill="rgba(248,250,252,0.72)">Auto-generated merch lab preview</text>
      <text x="56" y="644" font-size="18" font-family="Arial" fill="rgba(248,250,252,0.72)">Ideal for live traces and interaction demos</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function createPreviewMockup({
  accent,
  badgeText,
  note,
  productName,
  variantName,
}: {
  accent: string;
  badgeText: string;
  note: string;
  productName: string;
  variantName: string;
}): PreviewMockup {
  const cacheSeed = `${productName}:${variantName}:${accent}:${badgeText}:${note}`;

  return {
    accent,
    cacheBlob: cacheSeed.repeat(900),
    id: `${cacheSeed}:${Math.random().toString(36).slice(2, 8)}`,
    image: buildMockupSvg({
      accent,
      badgeText,
      note,
      productName,
      variantName,
    }),
    title: `${productName} / ${variantName}`,
  };
}

export default function ProductDetailView({
  product,
  productList,
}: {
  product: Product;
  productList: Product[];
}) {
  const router = useRouter();
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [badgeText, setBadgeText] = useState('RUM launch');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [note, setNote] = useState('Live collector preview');
  const [savedMockups, setSavedMockups] = useState<PreviewMockup[]>([]);

  const family = getStoreFamily(product.id);
  const variant = getStoreVariant(product.id);
  const relatedProducts = useMemo(() => getRelatedProducts(productList, product.id), [product.id, productList]);
  const siblingVariants = getVariantOptions(product.id);
  const savedStateMb = (
    savedMockups.reduce((sum, mockup) => sum + mockup.cacheBlob.length, 0) /
    1024 /
    1024
  ).toFixed(2);

  useEffect(() => {
    setQuantity(1);
  }, [product.id]);

  useEffect(() => {
    if (!feedback) {
      return;
    }

    const timeout = window.setTimeout(() => setFeedback(null), 1800);

    return () => window.clearTimeout(timeout);
  }, [feedback]);

  function handleAddToCart() {
    addItem({ productId: product.id, quantity });
    setFeedback('Added to cart');
  }

  function saveCurrentPreview() {
    const mockup = createPreviewMockup({
      accent: variant?.swatch || '#7dd3fc',
      badgeText,
      note,
      productName: family?.name || product.name,
      variantName: variant?.label || product.name,
    });

    setSavedMockups(current => [mockup, ...current].slice(0, 24));
  }

  function generateLookbookSet() {
    startTransition(() => {
      const mockups = Array.from({ length: 12 }, (_, index) =>
        createPreviewMockup({
          accent: index % 2 === 0 ? variant?.swatch || '#7dd3fc' : '#7dd3fc',
          badgeText: `${badgeText} ${index + 1}`,
          note: `${note} / frame ${index + 1}`,
          productName: family?.name || product.name,
          variantName: variant?.label || product.name,
        })
      );

      setSavedMockups(current => [...mockups, ...current].slice(0, 30));
    });
  }

  return (
    <main className="mt-8 space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[32px] border border-white/10 bg-black/20 px-5 py-4 backdrop-blur">
        <Button asChild variant="ghost" className="-ml-2 text-muted-foreground">
          <Link href="/">
            <ArrowLeft className="size-4" />
            Back to collection
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/cart">
            Open checkout
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)]">
        <section className="space-y-6">
          <Card className="overflow-hidden">
            <CardContent className="grid gap-6 px-6 py-6 lg:grid-cols-[minmax(0,1fr)_280px]">
              <div className="min-h-[420px] overflow-hidden rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(125,211,252,0.16),_transparent_54%),linear-gradient(180deg,rgba(15,23,42,0.85),rgba(8,12,20,0.96))]">
                <img
                  src={getProductImagePath(product)}
                  alt={`${family?.name || product.name} in ${variant?.label || product.name}`}
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="space-y-5">
                <div className="space-y-3">
                  <Badge>{family?.badge || 'Featured'}</Badge>
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-primary">
                      {family?.category || 'Merch'}
                    </p>
                    <h1 className="mt-2 text-4xl font-semibold tracking-tight">
                      {family?.name || product.name}
                    </h1>
                    <p className="mt-2 text-lg text-foreground/80">{variant?.label || product.name}</p>
                    <p className="mt-3 text-base leading-8 text-muted-foreground">
                      {family?.description || product.description}
                    </p>
                  </div>
                  <p className="text-2xl font-semibold">{formatMoney(product.priceUsd)}</p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Variant</span>
                    <span>{variant?.label || product.name}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {siblingVariants.map(option => (
                      <button
                        key={option.productId}
                        type="button"
                        className={cn(
                          'flex items-center gap-2 rounded-full border px-3 py-2 text-sm transition',
                          option.productId === product.id
                            ? 'border-primary/60 bg-primary/12 text-foreground'
                            : 'border-white/10 bg-white/[0.03] text-muted-foreground hover:border-white/20 hover:text-foreground'
                        )}
                        onClick={() => router.push(`/product/${option.productId}`)}
                      >
                        <span
                          className="size-3 rounded-full border border-black/10"
                          style={{ backgroundColor: option.swatch }}
                        />
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {family?.highlights?.length ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Highlights</span>
                      <span>{family.highlights.length} details</span>
                    </div>
                    <div className="grid gap-2">
                      {family.highlights.map(highlight => (
                        <div
                          key={highlight}
                          className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-muted-foreground"
                        >
                          {highlight}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Quantity</span>
                    <span>{quantity}</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {[1, 2, 3, 4].map(option => (
                      <button
                        key={option}
                        type="button"
                        className={cn(
                          'rounded-2xl border px-3 py-2 text-sm transition',
                          quantity === option
                            ? 'border-primary/60 bg-primary/12 text-foreground'
                            : 'border-white/10 bg-white/[0.03] text-muted-foreground hover:border-white/20 hover:text-foreground'
                        )}
                        onClick={() => setQuantity(option)}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <Button size="lg" className="w-full" onClick={handleAddToCart}>
                    Add to cart
                  </Button>
                  {feedback ? (
                    <div className="flex items-center gap-2 text-sm text-foreground">
                      <Check className="size-4 text-primary" />
                      <span>{feedback}</span>
                    </div>
                  ) : null}
                </div>
              </div>
            </CardContent>
          </Card>

          <section className="grid gap-6 lg:grid-cols-3">
            {relatedProducts.map(relatedProduct => {
              const relatedFamily = getStoreFamily(relatedProduct.id);
              const relatedVariant = getStoreVariant(relatedProduct.id);

              return (
                <Card key={relatedProduct.id}>
                  <CardContent className="space-y-4 pt-6">
                    <div className="inline-flex size-12 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10">
                      <Check className="size-5 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold">{relatedFamily?.name || relatedProduct.name}</h2>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {relatedVariant?.label || relatedProduct.name}
                      </p>
                      <p className="mt-2 text-sm leading-7 text-muted-foreground">
                        {relatedFamily?.description || relatedProduct.description}
                      </p>
                    </div>
                    <Button asChild variant="outline" className="w-full">
                      <Link href={`/product/${relatedProduct.id}`}>Open product</Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </section>
        </section>

        <aside className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex size-11 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10">
                  <Layers3 className="size-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Merch Lab</CardTitle>
                  <CardDescription>
                    A heavier client-side preview workflow to make the performance dashboard more
                    interesting.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground" htmlFor="badge-text">
                    Campaign badge
                  </label>
                  <Input
                    id="badge-text"
                    name="badgeText"
                    value={badgeText}
                    onChange={event => setBadgeText(event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground" htmlFor="preview-note">
                    Preview note
                  </label>
                  <Input
                    id="preview-note"
                    name="previewNote"
                    value={note}
                    onChange={event => setNote(event.target.value)}
                  />
                </div>
              </div>

              <div className="rounded-[28px] border border-white/[0.08] bg-[linear-gradient(180deg,rgba(15,23,42,0.72),rgba(7,11,17,0.96))] p-5">
                <div
                  className="rounded-[24px] border border-white/10 p-5"
                  style={{ backgroundColor: `${variant?.swatch || '#7dd3fc'}1f` }}
                >
                  <p className="text-xs uppercase tracking-[0.28em] text-primary">{badgeText}</p>
                  <p className="mt-3 text-2xl font-semibold">{family?.name || product.name}</p>
                  <p className="mt-2 text-sm text-muted-foreground">{variant?.label || product.name}</p>
                  <p className="mt-6 text-sm leading-7 text-muted-foreground">{note}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button onClick={saveCurrentPreview}>Save preview</Button>
                <Button variant="outline" onClick={generateLookbookSet}>
                  {isPending ? 'Generating...' : 'Generate 12 previews'}
                </Button>
                <Button variant="ghost" onClick={() => setSavedMockups([])}>
                  Clear studio
                </Button>
              </div>

              <div className="rounded-3xl border border-white/[0.08] bg-white/[0.03] p-4 text-sm text-muted-foreground">
                Holding approximately {savedStateMb} MB of preview cache in memory across{' '}
                {savedMockups.length} saved render{savedMockups.length === 1 ? '' : 's'}.
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {savedMockups.map(mockup => (
                  <div
                    key={mockup.id}
                    className="overflow-hidden rounded-[24px] border border-white/[0.08] bg-white/[0.03]"
                  >
                    <img
                      src={mockup.image}
                      alt={mockup.title}
                      className="aspect-[7/9] w-full object-cover"
                    />
                    <div className="px-4 py-3">
                      <p className="font-medium text-foreground">{mockup.title}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.22em] text-muted-foreground">
                        Accent {mockup.accent}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>

      <Recommendations />
    </main>
  );
}
