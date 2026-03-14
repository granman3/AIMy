import { ShoppingListItem, ShoppingListState, Product } from '../types';
import { getOrCreateSession } from '../sessions';

export function getShoppingList(sessionId: string): ShoppingListState {
  const session = getOrCreateSession(sessionId);
  return session.shoppingList;
}

export function addToShoppingList(
  sessionId: string,
  product: Product,
  quantity: number = 1
): ShoppingListItem {
  const session = getOrCreateSession(sessionId);
  const existing = session.shoppingList.items.find(
    (i) => i.productId === product.id
  );

  if (existing) {
    existing.quantity += quantity;
    return existing;
  }

  const item: ShoppingListItem = {
    productId: product.id,
    product,
    quantity,
    addedAt: new Date().toISOString(),
  };
  session.shoppingList.items.push(item);
  return item;
}

export function removeFromShoppingList(
  sessionId: string,
  productId: string
): ShoppingListItem | undefined {
  const session = getOrCreateSession(sessionId);
  const index = session.shoppingList.items.findIndex(
    (i) => i.productId === productId
  );
  if (index === -1) return undefined;
  return session.shoppingList.items.splice(index, 1)[0];
}

export function setPetContext(sessionId: string, context: string): void {
  const session = getOrCreateSession(sessionId);
  session.shoppingList.petContext = context;
}

export function serializeShoppingList(state: ShoppingListState): string {
  if (state.items.length === 0) {
    return '## Current Shopping List\nEmpty — no items added yet.';
  }

  const lines = state.items.map((item, i) => {
    const subtotal = (item.product.price * item.quantity).toFixed(2);
    return `${i + 1}. ${item.product.name} x${item.quantity} - $${subtotal} (Aisle ${item.product.aisle})`;
  });

  const total = state.items
    .reduce((sum, i) => sum + i.product.price * i.quantity, 0)
    .toFixed(2);
  const count = state.items.reduce((sum, i) => sum + i.quantity, 0);

  return `## Current Shopping List\n${lines.join('\n')}\nTotal: $${total} | ${count} item${count !== 1 ? 's' : ''}`;
}
