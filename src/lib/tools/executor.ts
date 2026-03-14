import { searchProducts, getProductById, products } from '../data/products';
import { planRoute } from '../data/store-map';
import { checkCompatibility } from '../data/compatibility';
import { ShoppingPlan, ShoppingPlanItem } from '../types';
import { v4 as uuidv4 } from 'uuid';

export interface ToolResult {
  result: unknown;
  plan?: ShoppingPlan;
}

export function executeTool(
  toolName: string,
  input: Record<string, unknown>,
  sessionId: string
): ToolResult {
  switch (toolName) {
    case 'search_inventory': {
      const results = searchProducts({
        keyword: input.keyword as string | undefined,
        category: input.category as string | undefined,
        petType: input.petType as string | undefined,
        minPrice: input.minPrice as number | undefined,
        maxPrice: input.maxPrice as number | undefined,
      });
      return {
        result: {
          count: results.length,
          products: results.map(p => ({
            id: p.id,
            name: p.name,
            price: p.price,
            category: p.category,
            aisle: p.aisle,
            brand: p.brand,
            description: p.description.substring(0, 100),
            petType: p.petType,
          })),
        },
      };
    }

    case 'get_product_details': {
      const product = getProductById(input.productId as string);
      if (!product) {
        return { result: { error: 'Product not found' } };
      }
      return { result: product };
    }

    case 'check_compatibility': {
      const result = checkCompatibility(
        input.productIds as string[],
        products,
        input.petContext as string | undefined
      );
      return { result };
    }

    case 'plan_store_route': {
      const result = planRoute(input.aisleNumbers as number[]);
      return { result };
    }

    case 'generate_shopping_plan': {
      const items: ShoppingPlanItem[] = (input.items as Array<{
        productId: string;
        reason: string;
        priority: 'essential' | 'recommended' | 'optional';
        quantity: number;
      }>).map(item => {
        const product = getProductById(item.productId);
        if (!product) throw new Error(`Product not found: ${item.productId}`);
        return {
          product,
          reason: item.reason,
          priority: item.priority,
          quantity: item.quantity,
        };
      });

      const aisleNumbers = [...new Set(items.map(i => i.product.aisle))];
      const route = planRoute(aisleNumbers);

      const plan: ShoppingPlan = {
        id: uuidv4(),
        sessionId,
        title: input.title as string,
        summary: input.summary as string,
        items,
        route: route.route,
        totalCost: items.reduce((sum, i) => sum + i.product.price * i.quantity, 0),
        proTips: input.proTips as string[],
        createdAt: new Date().toISOString(),
        petContext: input.petContext as string,
      };

      return {
        result: {
          success: true,
          planId: plan.id,
          totalCost: plan.totalCost,
          itemCount: plan.items.length,
          route: route.directions,
        },
        plan,
      };
    }

    default:
      return { result: { error: `Unknown tool: ${toolName}` } };
  }
}
