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
  const stops: RouteStop[] = [];
  for (let i = 0; i < route.length; i++) {
    const aisleNum = route[i];
    const aisleItems = items.filter(item => item.product.aisle === aisleNum);
    if (aisleItems.length > 0) {
      stops.push({
        stopNumber: i + 1,
        aisleNumber: aisleNum,
        aisleName: AISLE_NAMES[aisleNum] || `Aisle ${aisleNum}`,
        items: aisleItems,
      });
    }
  }
  return stops;
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
        const data = await res.json();
        setPlan(data);
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
        // Auto-collapse when last item in this stop is checked
        const allDone = stop.items.every(i => i.product.id === productId || next.has(i.product.id));
        if (allDone) {
          setTimeout(() => {
            setCollapsedStops(p => new Set(p).add(stop.aisleNumber));
          }, 400);
        }
      }
      return next;
    });
  };

  const toggleCollapse = (aisleNumber: number) => {
    setCollapsedStops(prev => {
      const next = new Set(prev);
      if (next.has(aisleNumber)) {
        next.delete(aisleNumber);
      } else {
        next.add(aisleNumber);
      }
      return next;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading your shopping plan...</p>
        </div>
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-4xl mb-4">🐾</div>
          <h1 className="text-xl font-bold mb-2">Plan Not Found</h1>
          <p className="text-gray-400 text-sm">
            This plan may have expired. Visit the kiosk to create a new one!
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
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 border-b border-gray-800 px-4 py-5">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">🐾</span>
            <span className="text-xs font-medium text-purple-300 uppercase tracking-wider">
              Paws & Claws Pet Emporium
            </span>
          </div>
          <h1 className="text-xl font-bold">{plan.title}</h1>
          <p className="text-sm text-gray-300 mt-1">{plan.summary}</p>
        </div>
      </header>

      {/* Sticky progress bar */}
      <div className="sticky top-0 z-10 bg-gray-950/95 backdrop-blur-sm border-b border-gray-800 px-4 py-2.5">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-sm font-medium text-gray-300">
              {foundItems === totalItems
                ? 'All items found!'
                : `${foundItems} of ${totalItems} items found`}
            </p>
            <p className="text-lg font-bold text-white">${plan.totalCost.toFixed(2)}</p>
          </div>
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-green-500 rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">Tap items to check them off as you shop</p>
        </div>
      </div>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-6" aria-live="polite">
        {/* Store map */}
        <StoreMap route={plan.route} />

        {/* Items grouped by route stop — collapsible */}
        {routeStops.map(stop => {
          const stopChecked = stop.items.every(i => checkedItems.has(i.product.id));
          const checkedCount = stop.items.filter(i => checkedItems.has(i.product.id)).length;
          const isCollapsed = collapsedStops.has(stop.aisleNumber);

          return (
            <section key={stop.aisleNumber}>
              {/* Collapsible header — tappable */}
              <button
                onClick={() => toggleCollapse(stop.aisleNumber)}
                className={`w-full flex items-center justify-between py-3 px-3 rounded-lg mb-2 transition-colors active:bg-gray-800/50 ${
                  stopChecked ? 'bg-green-500/10' : 'bg-gray-800/30'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                    stopChecked ? 'bg-green-500 text-white' : 'bg-amber-500 text-gray-900'
                  }`}>
                    {stopChecked ? '✓' : stop.stopNumber}
                  </span>
                  <div className="text-left">
                    <h2 className={`text-sm font-semibold uppercase tracking-wider ${
                      stopChecked ? 'text-green-400' : 'text-amber-400'
                    }`}>
                      Aisle {stop.aisleNumber} — {stop.aisleName}
                    </h2>
                    <p className="text-xs text-gray-500">
                      {checkedCount} of {stop.items.length} items
                    </p>
                  </div>
                </div>
                {/* Chevron */}
                <svg
                  className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${isCollapsed ? '' : 'rotate-180'}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Collapsible content */}
              {!isCollapsed && (
                <div className="space-y-3">
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
          <section className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
            <h2 className="text-base font-semibold text-purple-300 mb-3 flex items-center gap-2">
              <span>💡</span> Pro Tips from AIMy
            </h2>
            <ul className="space-y-2">
              {plan.proTips.map((tip, i) => (
                <li key={i} className="text-sm text-gray-300 flex gap-2">
                  <span className="text-purple-400 shrink-0">•</span>
                  {tip}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Footer */}
        <footer className="text-center py-6 border-t border-gray-800">
          <p className="text-xs text-gray-500">
            Powered by AIMy at Paws & Claws Pet Emporium
          </p>
          <p className="text-xs text-gray-600 mt-1">
            Prices may vary. Check with store for availability.
          </p>
        </footer>
      </main>
    </div>
  );
}
