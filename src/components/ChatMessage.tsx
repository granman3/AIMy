'use client';

import { ToolCallInfo } from '@/lib/types';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  toolCalls?: ToolCallInfo[];
  isLoading?: boolean;
}

export default function ChatMessage({ role, content, toolCalls, isLoading }: ChatMessageProps) {
  const isUser = role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-[80%] ${isUser ? 'order-2' : 'order-1'}`}>
        {/* Avatar */}
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
            {/* Name */}
            <p className={`text-xs font-medium mb-1 ${isUser ? 'text-right' : ''} text-gray-400`}>
              {isUser ? 'You' : 'AIMy'}
            </p>

            {/* Message bubble */}
            <div
              className={`rounded-2xl px-4 py-3 ${
                isUser
                  ? 'bg-blue-500 text-white rounded-tr-sm'
                  : 'bg-gray-800 text-gray-100 rounded-tl-sm'
              }`}
            >
              {isLoading ? (
                <div className="flex gap-1 py-1">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              ) : (
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
              )}
            </div>

            {/* Tool calls indicator */}
            {toolCalls && toolCalls.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {toolCalls.map((tc, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-gray-700/50 text-gray-400 border border-gray-700"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                    {tc.tool.replace(/_/g, ' ')}
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
