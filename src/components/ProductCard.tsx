'use client';

import { ShoppingPlanItem } from '@/lib/types';

const priorityStyles = {
  essential: { bg: 'bg-red-500/10', border: 'border-red-500/30', badge: 'bg-red-500', label: 'Essential' },
  recommended: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', badge: 'bg-yellow-500', label: 'Recommended' },
  optional: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', badge: 'bg-blue-500', label: 'Optional' },
};

const categoryEmoji: Record<string, string> = {
  food: '🍽️',
  toys: '🎾',
  habitat: '🏠',
  health: '💊',
  grooming: '✂️',
  accessories: '🔧',
};

interface ProductCardProps {
  item: ShoppingPlanItem;
  index: number;
}

export default function ProductCard({ item, index }: ProductCardProps) {
  const style = priorityStyles[item.priority];
  const emoji = categoryEmoji[item.product.category] || '📦';

  return (
    <div
      className={`${style.bg} border ${style.border} rounded-xl p-4 transition-all hover:scale-[1.01]`}
    >
      <div className="flex items-start gap-3">
        {/* Number badge */}
        <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-sm font-bold text-white shrink-0">
          {index + 1}
        </div>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className="font-semibold text-white text-sm leading-tight">
                {emoji} {item.product.name}
              </h4>
              <p className="text-xs text-gray-400 mt-0.5">
                {item.product.brand} &middot; Aisle {item.product.aisle}
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="font-bold text-white">${item.product.price.toFixed(2)}</p>
              {item.quantity > 1 && (
                <p className="text-xs text-gray-400">x{item.quantity}</p>
              )}
            </div>
          </div>

          {/* Reason */}
          <p className="text-xs text-gray-300 mt-2 leading-relaxed">{item.reason}</p>

          {/* Priority badge */}
          <span className={`inline-block mt-2 text-[10px] px-2 py-0.5 rounded-full ${style.badge} text-white font-medium`}>
            {style.label}
          </span>
        </div>
      </div>
    </div>
  );
}
