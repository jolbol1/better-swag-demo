import Link from 'next/link';
import { useRouter } from 'next/router';
import getSymbolFromCurrency from 'currency-symbol-map';
import { ArrowRight, LogOut, ShoppingBag, UserRound } from 'lucide-react';
import { useAuth } from '../../providers/Auth.provider';
import { useCart } from '../../providers/Cart.provider';
import { useCurrency } from '../../providers/Currency.provider';
import { Button } from '../ui/button';

export default function StoreHeader() {
  const router = useRouter();
  const { isAuthenticated, signOut, user } = useAuth();
  const { currencyCodeList, selectedCurrency, setSelectedCurrency } = useCurrency();
  const {
    cart: { items },
  } = useCart();

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const activeCurrency = selectedCurrency || 'USD';

  return (
    <header className="rounded-[32px] border border-white/10 bg-black/20 px-5 py-4 backdrop-blur">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/" className="flex items-center gap-4">
          <div className="flex size-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06]">
            <img src="/betterstack-logo.png" alt="Better Stack" className="size-8" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-primary">Better Swag</p>
            <img
              src="/better-stack-logo-wordmark-white.png"
              alt="Better Stack"
              className="mt-2 h-5 w-auto opacity-90"
            />
          </div>
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <label className="relative block">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              {getSymbolFromCurrency(activeCurrency) || activeCurrency}
            </span>
            <select
              className="h-11 rounded-2xl border border-white/10 bg-white/[0.03] pl-14 pr-10 text-sm text-foreground outline-none transition hover:border-white/20 focus:border-primary/50"
              value={activeCurrency}
              onChange={event => setSelectedCurrency(event.target.value)}
            >
              {currencyCodeList.map(currencyCode => (
                <option key={currencyCode} value={currencyCode}>
                  {currencyCode}
                </option>
              ))}
            </select>
          </label>
          <Button asChild variant="outline" className="rounded-2xl">
            <a href="https://betterstack.com" target="_blank" rel="noreferrer">
              Better Stack
              <ArrowRight className="size-4" />
            </a>
          </Button>
          {isAuthenticated && user ? (
            <>
              <Button asChild variant="outline" className="rounded-2xl">
                <Link href={{ pathname: '/login', query: { from: router.asPath } }}>
                  <UserRound className="size-4" />
                  {user.firstName}
                </Link>
              </Button>
              <Button type="button" variant="ghost" className="rounded-2xl" onClick={signOut}>
                <LogOut className="size-4" />
                Sign out
              </Button>
            </>
          ) : (
            <Button asChild variant="outline" className="rounded-2xl">
              <Link href={{ pathname: '/login', query: { from: router.asPath } }}>
                <UserRound className="size-4" />
                Sign in
              </Link>
            </Button>
          )}
          <Button asChild variant="outline" className="rounded-2xl">
            <Link href="/cart">
              <ShoppingBag className="size-4" />
              Cart
              {itemCount > 0 ? (
                <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs text-primary">
                  {itemCount}
                </span>
              ) : null}
            </Link>
          </Button>
        </div>
        {isAuthenticated && user ? (
          <div className="mt-4 rounded-2xl border border-emerald-400/15 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
            Identified as {user.username} • {user.plan} plan • {user.company}
          </div>
        ) : null}
      </div>
    </header>
  );
}
