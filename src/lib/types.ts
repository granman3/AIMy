export interface Product {
  id: string;
  name: string;
  category: 'food' | 'toys' | 'habitat' | 'health' | 'grooming' | 'accessories';
  petType: string[];
  price: number;
  description: string;
  aisle: number;
  inStock: boolean;
  brand: string;
  tags: string[];
  compatibilityNotes?: string[];
}

export interface StoreAisle {
  number: number;
  name: string;
  categories: string[];
  x: number;
  y: number;
}

export interface StoreLayout {
  aisles: StoreAisle[];
  entrance: { x: number; y: number };
  checkout: { x: number; y: number };
}

export interface CompatibilityRule {
  id: string;
  description: string;
  check: (products: Product[], context?: string) => CompatibilityResult;
}

export interface CompatibilityResult {
  compatible: boolean;
  warnings: string[];
  suggestions: string[];
}

export interface ShoppingPlanItem {
  product: Product;
  reason: string;
  priority: 'essential' | 'recommended' | 'optional';
  quantity: number;
}

export interface ShoppingPlan {
  id: string;
  sessionId: string;
  title: string;
  summary: string;
  items: ShoppingPlanItem[];
  route: number[];
  totalCost: number;
  proTips: string[];
  createdAt: string;
  petContext: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  toolCalls?: ToolCallInfo[];
  timestamp: string;
}

export interface ToolCallInfo {
  tool: string;
  input: Record<string, unknown>;
  result: unknown;
}

export interface Session {
  id: string;
  messages: ChatMessage[];
  plan?: ShoppingPlan;
  createdAt: string;
}
