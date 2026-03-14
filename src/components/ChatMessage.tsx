'use client';

import { ToolCallInfo } from '@/lib/types';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  toolCalls?: ToolCallInfo[];
  isLoading?: boolean;
}

const toolLabels: Record<string, string> = {
  search_inventory: 'Searching inventory...',
  get_product_details: 'Looking up product...',
  check_compatibility: 'Checking compatibility...',
  plan_store_route: 'Planning your route...',
  generate_shopping_plan: 'Building your plan...',
};

export default function ChatMessage({ role, content, toolCalls, isLoading }: ChatMessageProps) {
  const isUser = role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-5`}>
      <div className={`max-w-[85%] ${isUser ? 'order-2' : 'order-1'}`}>
        <div className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0 ${
              isUser
                ? 'bg-blue-500 text-white'
                : 'bg-gradient-to-br from-purple-500 to-pink-500 text-white'
            }`}
          >
            {isUser ? '👤' : '🐾'}
          </div>

          <div>
            <p className={`text-xs font-medium mb-1 ${isUser ? 'text-right' : ''} text-gray-400`}>
              {isUser ? 'You' : 'AIMy'}
            </p>

            <div
              className={`rounded-2xl px-5 py-3.5 ${
                isUser
                  ? 'bg-blue-500 text-white rounded-tr-sm'
                  : 'bg-gray-800 text-gray-100 rounded-tl-sm'
              }`}
            >
              {isLoading ? (
                <div className="flex gap-1.5 py-1">
                  <span className="w-2.5 h-2.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2.5 h-2.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2.5 h-2.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              ) : (
                <p className="text-base leading-relaxed whitespace-pre-wrap">{content}</p>
              )}
            </div>

            {/* Tool calls — descriptive labels */}
            {toolCalls && toolCalls.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {toolCalls.map((tc, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-gray-700/50 text-gray-300 border border-gray-700"
                  >
                    <span className="w-2 h-2 rounded-full bg-green-400" />
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
