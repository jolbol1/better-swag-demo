import { Money, Product } from '../protos/demo';

export interface StoreVariantDefinition {
  label: string;
  productId: string;
  swatch: string;
}

export interface StoreFamilyDefinition {
  badge: string;
  category: string;
  description: string;
  highlights: string[];
  heroCopy: string;
  name: string;
  shipNote: string;
  slug: string;
  variants: StoreVariantDefinition[];
}

export interface StorefrontFamilyProduct {
  availableVariants: Array<StoreVariantDefinition & { product: Product }>;
  definition: StoreFamilyDefinition;
  selectedProduct: Product;
  selectedVariant: StoreVariantDefinition;
}

export const STORE_FAMILIES: StoreFamilyDefinition[] = [
  {
    slug: 'uptime-tee',
    name: 'Uptime Tee',
    category: 'Apparel',
    badge: 'Best seller',
    description:
      'Heavyweight cotton with a direct Better Stack wordmark print for post-incident victory laps.',
    heroCopy:
      'Heavyweight cotton, clean wordmark placement, and a fit built for long deploy nights.',
    shipNote: 'Ships in 2 business days',
    highlights: ['230gsm cotton', 'Relaxed fit', 'Low-noise screen print'],
    variants: [
      { productId: 'uptime-tee-bone', label: 'Bone', swatch: '#ede6d7' },
      { productId: 'uptime-tee-washed-black', label: 'Washed black', swatch: '#141821' },
    ],
  },
  {
    slug: 'incident-hoodie',
    name: 'Incident Hoodie',
    category: 'Apparel',
    badge: 'Warmest drop',
    description:
      'Soft fleece pullover for long debugging sessions, deploy nights, and early mornings.',
    heroCopy:
      'Structured fleece and a sharper silhouette for the people carrying the pager.',
    shipNote: 'Ships with package protection',
    highlights: ['Brushed interior', 'Structured hood', 'Premium chest print'],
    variants: [
      { productId: 'incident-hoodie-sand', label: 'Sand', swatch: '#d6c0a5' },
      { productId: 'incident-hoodie-charcoal', label: 'Midnight charcoal', swatch: '#232b3b' },
    ],
  },
  {
    slug: 'on-call-mug',
    name: 'On-Call Mug',
    category: 'Desk',
    badge: 'Desk setup',
    description:
      'Ceramic caffeine container with the Better Stack mark, sized for false confidence and true espresso.',
    heroCopy:
      'Matte ceramic, clean lines, and enough capacity for the follow-up incident review.',
    shipNote: 'Packed securely for transit',
    highlights: ['14oz ceramic', 'Matte finish', 'Dishwasher safe in theory'],
    variants: [
      { productId: 'on-call-mug-white', label: 'Cloud white', swatch: '#f5f5f4' },
      { productId: 'on-call-mug-black', label: 'Matte black', swatch: '#111111' },
    ],
  },
  {
    slug: 'logs-tote',
    name: 'Logs Tote',
    category: 'Carry',
    badge: 'Field tested',
    description:
      'Heavy canvas tote for laptop bricks, notebooks, and enough stickers to alarm finance.',
    heroCopy:
      'Heavy canvas, structured base, and a clean wordmark for office commutes and travel days.',
    shipNote: 'Delivered with tracked shipping',
    highlights: ['Heavy canvas', 'Structured base', 'Printed wordmark'],
    variants: [
      { productId: 'logs-tote-natural', label: 'Natural', swatch: '#efe4d0' },
      { productId: 'logs-tote-black', label: 'Black', swatch: '#151515' },
    ],
  },
];

export const COLLECTION_STATS = [
  { label: 'Products', value: '08' },
  { label: 'Variant count', value: '02 / family' },
  { label: 'Free shipping', value: '$75+' },
];

export const BENEFIT_TILES = [
  {
    title: 'Real service wiring',
    copy: 'Cart, checkout, shipping, recommendations, ads, and currency conversion still run through the demo backend.',
  },
  {
    title: 'Sharper storefront',
    copy: 'The Better Swag visual language replaces the original astronomy store without flattening the interaction surface.',
  },
  {
    title: 'Traffic-friendly detail',
    copy: 'Search, filtering, merch-lab interactions, and order flows give the demo richer traces and UI behavior.',
  },
];

const storeFamiliesByProductId = STORE_FAMILIES.reduce<Record<string, StoreFamilyDefinition>>((acc, family) => {
  family.variants.forEach(variant => {
    acc[variant.productId] = family;
  });

  return acc;
}, {});

const storeVariantsByProductId = STORE_FAMILIES.reduce<Record<string, StoreVariantDefinition>>((acc, family) => {
  family.variants.forEach(variant => {
    acc[variant.productId] = variant;
  });

  return acc;
}, {});

export function moneyToNumber(price?: Money) {
  if (!price) {
    return 0;
  }

  return Number(price.units || 0) + Number(price.nanos || 0) / 1_000_000_000;
}

export function formatMoney(price?: Money) {
  if (!price) {
    return '$0.00';
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: price.currencyCode || 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(moneyToNumber(price));
}

export function getProductImagePath(product?: Product) {
  return product?.picture ? `/images/products/${product.picture}` : '';
}

export function getStoreFamily(productId: string) {
  return storeFamiliesByProductId[productId];
}

export function getPrimaryCategoryFromLineItems(lineItems: Array<{ productId: string; quantity: number }>) {
  const categoryTotals = lineItems.reduce<Record<string, number>>((acc, item) => {
    const category = getStoreFamily(item.productId)?.category;

    if (!category) {
      return acc;
    }

    acc[category] = (acc[category] || 0) + item.quantity;
    return acc;
  }, {});

  const [primaryCategory] = Object.entries(categoryTotals).sort((left, right) => right[1] - left[1])[0] || [];

  return primaryCategory || 'Merch';
}

export function getStoreVariant(productId: string) {
  return storeVariantsByProductId[productId];
}

export function getVariantOptions(productId: string) {
  return getStoreFamily(productId)?.variants ?? [];
}

export function buildStorefrontCollection(products: Product[]): StorefrontFamilyProduct[] {
  const productMap = new Map(products.map(product => [product.id, product]));

  return STORE_FAMILIES.flatMap(definition => {
    const availableVariants = definition.variants
      .map(variant => {
        const product = productMap.get(variant.productId);

        if (!product) {
          return null;
        }

        return {
          ...variant,
          product,
        };
      })
      .filter((variant): variant is StorefrontFamilyProduct['availableVariants'][number] => !!variant);

    if (availableVariants.length === 0) {
      return [];
    }

    return [
      {
        definition,
        availableVariants,
        selectedProduct: availableVariants[0].product,
        selectedVariant: availableVariants[0],
      },
    ];
  });
}

export function getRelatedProducts(productList: Product[], productId: string) {
  const family = getStoreFamily(productId);

  if (!family) {
    return productList.filter(product => product.id !== productId).slice(0, 3);
  }

  return STORE_FAMILIES.filter(candidate => candidate.slug !== family.slug)
    .map(candidate => candidate.variants.map(variant => productList.find(product => product.id === variant.productId)).find(Boolean))
    .filter((product): product is Product => !!product)
    .slice(0, 3);
}

export function getSearchCategories() {
  return ['All', ...new Set(STORE_FAMILIES.map(product => product.category))];
}
