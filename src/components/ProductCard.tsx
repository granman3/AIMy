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
  stopNumber: number;
  checked?: boolean;
  onToggle?: () => void;
}

export default function ProductCard({ item, checked, onToggle }: ProductCardProps) {
  const style = priorityStyles[item.priority];
  const emoji = categoryEmoji[item.product.category] || '📦';

  return (
    <div
      onClick={onToggle}
      className={`${style.bg} border ${style.border} rounded-xl p-4 transition-all active:scale-[0.98] cursor-pointer select-none ${
        checked ? 'opacity-60' : ''
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <div className={`w-7 h-7 rounded-md border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${
          checked
            ? 'bg-green-500 border-green-500'
            : 'border-gray-500 bg-transparent'
        }`}>
          {checked && (
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className={`font-semibold text-white text-base leading-tight ${checked ? 'line-through opacity-70' : ''}`}>
                {emoji} {item.product.name}
              </h4>
              <p className="text-sm text-gray-400 mt-0.5">
                {item.product.brand} &middot; Aisle {item.product.aisle}
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="font-bold text-white text-lg">${item.product.price.toFixed(2)}</p>
              {item.quantity > 1 && (
                <p className="text-sm text-gray-400">x{item.quantity}</p>
              )}
            </div>
          </div>

          {/* Reason */}
          <p className="text-sm text-gray-300 mt-2 leading-relaxed">{item.reason}</p>

          {/* Priority badge */}
          <span className={`inline-block mt-2 text-xs px-2.5 py-0.5 rounded-full ${style.badge} text-white font-medium`}>
            {style.label}
          </span>
        </div>
      </div>
    </div>
  );
}
