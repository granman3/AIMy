import { searchProducts, getProductById, products } from '../data/products';
import { checkCompatibility } from '../data/compatibility';
import {
  getShoppingList,
  addToShoppingList,
  removeFromShoppingList,
} from './state';
import { generateShoppingPlan } from '../actions/plan-generator';
import { ShoppingPlan } from '../types';

export interface ToolResult {
  result: unknown;
  plan?: ShoppingPlan;
}

export function executeConversationTool(
  toolName: string,
  input: Record<string, unknown>,
  sessionId: string
): ToolResult {
  switch (toolName) {
    case 'find_items': {
      const query = (input.query as string) || '';
      const keywords = query.toLowerCase().split(/\s+/);

      // Search across multiple dimensions for best results
      let results = searchProducts({ keyword: query });

      // If keyword search yields few results, expand by trying individual terms
      if (results.length < 3) {
        const seen = new Map(results.map((p) => [p.id, p]));
        for (const kw of keywords) {
          for (const p of searchProducts({ keyword: kw })) seen.set(p.id, p);
          for (const p of searchProducts({ petType: kw })) seen.set(p.id, p);
        }
        results = [...seen.values()];
      }

      return {
        result: {
          status: results.length > 0 ? 'ok' : 'not_found',
          query,
          count: results.length,
          matches: results.map((p) => ({
            id: p.id,
            name: p.name,
            price: p.price,
            category: p.category,
            aisle: p.aisle,
            brand: p.brand,
            description: p.description.substring(0, 120),
            petType: p.petType,
          })),
        },
      };
    }

    case 'add_item': {
      const itemId = input.item_id as string;
      const rawQty = Number(input.quantity) || 1;
      const quantity = Math.max(1, Math.floor(rawQty));

      const product = getProductById(itemId);
      if (!product) {
        return {
          result: {
            status: 'error',
            message: `Product '${itemId}' not found. Use IDs from find_items results.`,
          },
        };
      }

      // Add to list
      const listItem = addToShoppingList(sessionId, product, quantity);

      // Auto-run compatibility check
      const shoppingList = getShoppingList(sessionId);
      const allProductIds = shoppingList.items.map((i) => i.productId);
      const compatibility = checkCompatibility(
        allProductIds,
        products,
        shoppingList.petContext
      );

      return {
        result: {
          status: 'ok',
          added_item: {
            id: product.id,
            name: product.name,
            price: product.price,
            aisle: product.aisle,
            quantity: listItem.quantity,
          },
          warnings: compatibility.warnings,
          suggestions: compatibility.suggestions,
          list_count: shoppingList.items.reduce((s, i) => s + i.quantity, 0),
          list_items: shoppingList.items.map((i) => ({
            id: i.productId,
            name: i.product.name,
            quantity: i.quantity,
            price: i.product.price,
          })),
        },
      };
    }

    case 'remove_item': {
      const itemId = input.item_id as string;
      const removed = removeFromShoppingList(sessionId, itemId);

      if (!removed) {
        return {
          result: {
            status: 'error',
            message: `Item '${itemId}' not found in the shopping list.`,
          },
        };
      }

      const shoppingList = getShoppingList(sessionId);
      return {
        result: {
          status: 'ok',
          removed_item: {
            id: removed.productId,
            name: removed.product.name,
          },
          list_count: shoppingList.items.reduce((s, i) => s + i.quantity, 0),
        },
      };
    }

    case 'generate_plan': {
      return generateShoppingPlan(sessionId, {
        title: input.title as string,
        summary: input.summary as string,
        proTips: input.proTips as string[],
        petContext: input.petContext as string,
      });
    }

    default:
      return { result: { error: `Unknown tool: ${toolName}` } };
  }
}
