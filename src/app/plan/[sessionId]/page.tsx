'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ShoppingPlan, ShoppingPlanItem } from '@/lib/types';
import ProductCard from '@/components/ProductCard';
import StoreMap from '@/components/StoreMap';

const AISLE_NAMES: Record<number, string> = {
  1: 'Pet Food',
  2: 'Tanks & Habitats',
  3: 'Filters & Equipment',
  4: 'Health & Water Care',
  5: 'Gravel & Decorations',
  6: 'Toys',
  7: 'Grooming & Accessories',
  8: 'Leashes, Collars & Litter',
};

interface RouteStop {
  stopNumber: number;
  aisleNumber: number;
  aisleName: string;
  items: ShoppingPlanItem[];
}

function groupItemsByRoute(items: ShoppingPlanItem[], route: number[]): RouteStop[] {
  return route
    .map((aisleNum, i) => ({
      stopNumber: i + 1,
      aisleNumber: aisleNum,
      aisleName: AISLE_NAMES[aisleNum] || `Aisle ${aisleNum}`,
      items: items.filter(item => item.product.aisle === aisleNum),
    }))
    .filter(stop => stop.items.length > 0);
}

export default function PlanPage() {
  const params = useParams();
  const sessionId = params.sessionId as string;
  const [plan, setPlan] = useState<ShoppingPlan | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [collapsedStops, setCollapsedStops] = useState<Set<number>>(new Set());

  useEffect(() => {
    async function fetchPlan() {
      try {
        const res = await fetch(`/api/plan/${sessionId}`);
        if (!res.ok) throw new Error('Not found');
        setPlan(await res.json());
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchPlan();
  }, [sessionId]);

  const toggleItem = (productId: string, stop: RouteStop) => {
    setCheckedItems(prev => {
      const next = new Set(prev);
      const wasChecked = next.has(productId);
      if (wasChecked) {
        next.delete(productId);
      } else {
        next.add(productId);
        const allDone = stop.items.every(i => i.product.id === productId || next.has(i.product.id));
        if (allDone) setTimeout(() => setCollapsedStops(p => new Set(p).add(stop.aisleNumber)), 400);
      }
      return next;
    });
  };

  const toggleCollapse = (aisleNumber: number) => {
    setCollapsedStops(prev => {
      const next = new Set(prev);
      next.has(aisleNumber) ? next.delete(aisleNumber) : next.add(aisleNumber);
      return next;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
        <div className="text-center">
          <div
            className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin mx-auto mb-4"
            style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent' }}
          />
          <p style={{ color: 'var(--text-muted)' }}>Loading your shopping plan...</p>
        </div>
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
        <div className="text-center">
          <p className="text-4xl mb-4">🐾</p>
          <h1 className="text-xl font-semibold mb-2">Plan not found</h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            This plan may have expired. Visit the kiosk to create a new one.
          </p>
        </div>
      </div>
    );
  }

  const routeStops = groupItemsByRoute(plan.items, plan.route);
  const totalItems = plan.items.length;
  const foundItems = checkedItems.size;
  const progressPct = totalItems > 0 ? Math.round((foundItems / totalItems) * 100) : 0;

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)', color: 'var(--text)' }}>

      {/* Header */}
      <header className="px-4 py-5" style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border-c)' }}>
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-2 mb-3">
            <div className="wordmark text-lg">
              AI<span className="accent">M</span><span className="accent">y</span>
            </div>
            <div style={{ width: '1px', height: '16px', background: 'var(--border-focus)' }} />
            <span className="text-xs uppercase tracking-widest" style={{ color: 'var(--text-dim)', letterSpacing: '0.1em' }}>
              Paws &amp; Claws Pet Emporium
            </span>
          </div>
          <div className="divider mb-3" />
          <h1 className="text-xl font-semibold" style={{ color: 'var(--text)' }}>{plan.title}</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{plan.summary}</p>
        </div>
      </header>

      {/* Sticky progress bar */}
      <div
        className="sticky top-0 z-10 px-4 py-3"
        style={{ background: 'rgba(13,12,11,0.95)', borderBottom: '1px solid var(--border-c)', backdropFilter: 'blur(8px)' }}
      >
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm" style={{ color: foundItems === totalItems ? 'var(--success-c)' : 'var(--text-muted)' }}>
              {foundItems === totalItems ? 'All items found' : `${foundItems} of ${totalItems} items found`}
            </p>
            <p className="font-semibold text-base" style={{ color: 'var(--text)' }}>
              ${plan.totalCost.toFixed(2)}
            </p>
          </div>
          <div className="h-1 rounded-full overflow-hidden" style={{ background: 'var(--surface-el)' }}>
            <div className="h-full progress-bar-fill rounded-full" style={{ width: `${progressPct}%` }} />
          </div>
          <p className="text-xs mt-1.5" style={{ color: 'var(--text-dim)' }}>
            Tap items to check them off as you shop
          </p>
        </div>
      </div>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-6" aria-live="polite">

        <StoreMap route={plan.route} />

        {/* Route stops */}
        {routeStops.map(stop => {
          const stopChecked = stop.items.every(i => checkedItems.has(i.product.id));
          const checkedCount = stop.items.filter(i => checkedItems.has(i.product.id)).length;
          const isCollapsed = collapsedStops.has(stop.aisleNumber);

          return (
            <section key={stop.aisleNumber}>
              <button
                onClick={() => toggleCollapse(stop.aisleNumber)}
                className={`stop-header w-full flex items-center justify-between px-3 py-3 mb-2 ${stopChecked ? 'done' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className="w-7 h-7 rounded flex items-center justify-center text-sm font-bold shrink-0"
                    style={stopChecked
                      ? { background: 'var(--success-c)', color: '#fff' }
                      : { background: 'var(--primary-soft)', color: 'var(--primary)', border: '1px solid rgba(180,83,9,0.2)' }
                    }
                  >
                    {stopChecked ? '✓' : stop.stopNumber}
                  </span>
                  <div className="text-left">
                    <h2
                      className="text-sm font-semibold uppercase tracking-wider"
                      style={{ color: stopChecked ? 'var(--success-c)' : 'var(--primary)', letterSpacing: '0.08em' }}
                    >
                      Aisle {stop.aisleNumber} — {stop.aisleName}
                    </h2>
                    <p className="text-xs" style={{ color: 'var(--text-dim)' }}>
                      {checkedCount} of {stop.items.length} items
                    </p>
                  </div>
                </div>
                <svg
                  className={`w-4 h-4 transition-transform duration-200 ${isCollapsed ? '' : 'rotate-180'}`}
                  style={{ color: 'var(--text-dim)' }}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {!isCollapsed && (
                <div className="space-y-2">
                  {stop.items.map(item => (
                    <ProductCard
                      key={item.product.id}
                      item={item}
                      stopNumber={stop.stopNumber}
                      checked={checkedItems.has(item.product.id)}
                      onToggle={() => toggleItem(item.product.id, stop)}
                    />
                  ))}
                </div>
              )}
            </section>
          );
        })}

        {/* Pro tips */}
        {plan.proTips.length > 0 && (
          <section
            className="p-4 rounded"
            style={{ background: 'var(--surface)', border: '1px solid var(--border-c)', borderLeft: '3px solid var(--primary)' }}
          >
            <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--primary)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Tips for your visit
            </h2>
            <ul className="space-y-2">
              {plan.proTips.map((tip, i) => (
                <li key={i} className="text-sm flex gap-2" style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>
                  <span style={{ color: 'var(--text-dim)' }} className="shrink-0">–</span>
                  {tip}
                </li>
              ))}
            </ul>
          </section>
        )}

        <footer className="text-center py-6" style={{ borderTop: '1px solid var(--border-c)' }}>
          <p className="text-xs" style={{ color: 'var(--text-dim)' }}>
            AIMy at Paws &amp; Claws Pet Emporium
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-dim)', opacity: 0.6 }}>
            Prices may vary. Check with store for availability.
          </p>
        </footer>
      </main>
    </div>
  );
}
