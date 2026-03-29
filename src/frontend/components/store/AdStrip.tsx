import { Megaphone } from 'lucide-react';
import { useAd } from '../../providers/Ad.provider';

export default function AdStrip() {
  const { adList } = useAd();
  const activeAd = adList[0];

  if (!activeAd) {
    return null;
  }

  return (
    <a
      href={activeAd.redirectUrl}
      className="mt-8 flex items-center gap-3 rounded-[28px] border border-emerald-400/15 bg-emerald-400/10 px-5 py-4 text-sm text-emerald-50 transition hover:border-emerald-300/25 hover:bg-emerald-400/14"
    >
      <div className="flex size-10 items-center justify-center rounded-2xl border border-emerald-200/15 bg-emerald-200/10">
        <Megaphone className="size-4 text-emerald-200" />
      </div>
      <div>
        <p className="text-xs uppercase tracking-[0.26em] text-emerald-100/80">Featured</p>
        <p className="mt-1">{activeAd.text}</p>
      </div>
    </a>
  );
}
