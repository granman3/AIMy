'use client';

import { ShoppingPlanItem } from '@/lib/types';

const categoryEmoji: Record<string, string> = {
  food:        '🍽️',
  toys:        '🎾',
  habitat:     '🏠',
  health:      '💊',
  grooming:    '✂️',
  accessories: '🔧',
};

const priorityLabel: Record<string, string> = {
  essential:   'Essential',
  recommended: 'Recommended',
  optional:    'Optional',
};

interface ProductCardProps {
  item: ShoppingPlanItem;
  stopNumber: number;
  checked?: boolean;
  onToggle?: () => void;
}

export default function ProductCard({ item, checked, onToggle }: ProductCardProps) {
  const emoji = categoryEmoji[item.product.category] || '📦';

  return (
    <div
      onClick={onToggle}
      className={`product-card ${item.priority} ${checked ? 'checked' : ''} p-4 select-none`}
    >
      <div className="flex items-start gap-3">

        {/* Checkbox */}
        <div
          className="w-6 h-6 rounded shrink-0 mt-0.5 flex items-center justify-center transition-all"
          style={checked
            ? { background: 'var(--success-c)', border: '2px solid var(--success-c)' }
            : { background: 'transparent', border: `2px solid var(--border-focus)` }
          }
        >
          {checked && (
            <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4
                className={`font-semibold text-base leading-tight ${checked ? 'line-through' : ''}`}
                style={{ color: checked ? 'var(--text-dim)' : 'var(--text)' }}
              >
                {emoji} {item.product.name}
              </h4>
              <p className="text-sm mt-0.5" style={{ color: 'var(--text-dim)' }}>
                {item.product.brand} &middot; Aisle {item.product.aisle}
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="font-semibold text-base" style={{ color: 'var(--text)' }}>
                ${item.product.price.toFixed(2)}
              </p>
              {item.quantity > 1 && (
                <p className="text-sm" style={{ color: 'var(--text-dim)' }}>×{item.quantity}</p>
              )}
            </div>
          </div>

          <p className="text-sm mt-2 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            {item.reason}
          </p>

          <span
            className="inline-block mt-2 text-xs px-2 py-0.5 rounded"
            style={{
              background: 'var(--surface-el)',
              border: '1px solid var(--border-c)',
              color: 'var(--text-muted)',
            }}
          >
            {priorityLabel[item.priority]}
          </span>
        </div>
      </div>
    </div>
  );
}
