import Link from 'next/link';
import { Separator } from '../ui/separator';

export default function StoreFooter() {
  return (
    <footer className="mt-8 rounded-[32px] border border-white/10 bg-black/20 px-6 py-5 backdrop-blur">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-primary">Better Swag</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Better Stack essentials running on the OpenTelemetry demo backend.
          </p>
        </div>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Link href="/" className="transition hover:text-foreground">
            Catalog
          </Link>
          <Separator orientation="vertical" className="h-4" />
          <Link href="/cart" className="transition hover:text-foreground">
            Checkout
          </Link>
          <Separator orientation="vertical" className="h-4" />
          <a
            href="https://betterstack.com"
            target="_blank"
            rel="noreferrer"
            className="transition hover:text-foreground"
          >
            Better Stack
          </a>
        </div>
      </div>
    </footer>
  );
}
