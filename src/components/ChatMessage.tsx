'use client';

import { ToolCallInfo } from '@/lib/types';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  toolCalls?: ToolCallInfo[];
  isLoading?: boolean;
}

const toolLabels: Record<string, string> = {
  search_inventory:      'Searching inventory',
  get_product_details:   'Looking up product',
  check_compatibility:   'Checking compatibility',
  plan_store_route:      'Planning route',
  generate_shopping_plan:'Building plan',
};

export default function ChatMessage({ role, content, toolCalls, isLoading }: ChatMessageProps) {
  const isUser = role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-5`}>
      <div className={`max-w-[85%] ${isUser ? 'order-2' : 'order-1'}`}>
        <div className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>

          {/* Avatar */}
          <div
            className="w-9 h-9 rounded flex items-center justify-center shrink-0 text-xs font-semibold"
            style={isUser
              ? { background: 'var(--surface-el)', border: '1px solid var(--border-c)', color: 'var(--text-muted)' }
              : { background: 'var(--primary-soft)', border: '1px solid rgba(180,83,9,0.2)', color: 'var(--primary)' }
            }
          >
            {isUser ? 'You' : '🐾'}
          </div>

          <div>
            {/* Sender label */}
            <p
              className={`text-xs font-medium mb-1 ${isUser ? 'text-right' : ''}`}
              style={{ color: isUser ? 'var(--text-dim)' : 'var(--primary)' }}
            >
              {isUser ? 'You' : 'AIMy'}
            </p>

            {/* Bubble */}
            <div
              className={`px-4 py-3 ${isUser ? 'msg-user' : 'msg-assistant'}`}
            >
              {isLoading ? (
                <div className="flex gap-1.5 py-1">
                  <span className="w-2 h-2 rounded-full animate-bounce" style={{ background: 'var(--text-dim)', animationDelay: '0ms' }} />
                  <span className="w-2 h-2 rounded-full animate-bounce" style={{ background: 'var(--text-dim)', animationDelay: '150ms' }} />
                  <span className="w-2 h-2 rounded-full animate-bounce" style={{ background: 'var(--text-dim)', animationDelay: '300ms' }} />
                </div>
              ) : (
                <p className="text-base leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--text)' }}>
                  {content}
                </p>
              )}
            </div>

            {/* Tool call badges */}
            {toolCalls && toolCalls.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {toolCalls.map((tc, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center text-xs px-2.5 py-0.5 rounded"
                    style={{
                      background: 'var(--surface-el)',
                      border: '1px solid var(--border-c)',
                      color: 'var(--text-dim)',
                    }}
                  >
                    {toolLabels[tc.tool] || tc.tool.replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
