'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ShoppingPlan } from '@/lib/types';
import ProductCard from '@/components/ProductCard';
import StoreMap from '@/components/StoreMap';

export default function PlanPage() {
  const params = useParams();
  const sessionId = params.sessionId as string;
  const [plan, setPlan] = useState<ShoppingPlan | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

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

  const essentialItems = plan.items.filter(i => i.priority === 'essential');
  const recommendedItems = plan.items.filter(i => i.priority === 'recommended');
  const optionalItems = plan.items.filter(i => i.priority === 'optional');

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

      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Cost summary */}
        <div className="flex items-center justify-between bg-gray-800/50 rounded-xl px-4 py-3 border border-gray-700">
          <div>
            <p className="text-sm text-gray-400">{plan.items.length} items</p>
            <p className="text-xs text-gray-500">{plan.route.length} aisles to visit</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-white">${plan.totalCost.toFixed(2)}</p>
            <p className="text-xs text-gray-500">estimated total</p>
          </div>
        </div>

        {/* Store map */}
        <StoreMap route={plan.route} />

        {/* Essential items */}
        {essentialItems.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-red-400 uppercase tracking-wider mb-3">
              Must-Have Items
            </h2>
            <div className="space-y-3">
              {essentialItems.map((item, i) => (
                <ProductCard key={item.product.id} item={item} index={i} />
              ))}
            </div>
          </section>
        )}

        {/* Recommended items */}
        {recommendedItems.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-yellow-400 uppercase tracking-wider mb-3">
              Recommended
            </h2>
            <div className="space-y-3">
              {recommendedItems.map((item, i) => (
                <ProductCard
                  key={item.product.id}
                  item={item}
                  index={essentialItems.length + i}
                />
              ))}
            </div>
          </section>
        )}

        {/* Optional items */}
        {optionalItems.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-blue-400 uppercase tracking-wider mb-3">
              Nice to Have
            </h2>
            <div className="space-y-3">
              {optionalItems.map((item, i) => (
                <ProductCard
                  key={item.product.id}
                  item={item}
                  index={essentialItems.length + recommendedItems.length + i}
                />
              ))}
            </div>
          </section>
        )}

        {/* Pro tips */}
        {plan.proTips.length > 0 && (
          <section className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
            <h2 className="text-sm font-semibold text-purple-300 mb-3 flex items-center gap-2">
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
          <p className="text-[10px] text-gray-600 mt-1">
            Prices may vary. Check with store for availability.
          </p>
        </footer>
      </main>
    </div>
  );
}
