import { ShoppingPlan } from '../types';
import { getShoppingList } from '../conversation/state';
import { planRoute } from '../data/store-map';
import { setPlan } from '../sessions';
import { v4 as uuidv4 } from 'uuid';

interface PlanInput {
  title: string;
  summary: string;
  proTips: string[];
  petContext: string;
}

export function generateShoppingPlan(
  sessionId: string,
  input: PlanInput
): { result: unknown; plan?: ShoppingPlan } {
  const shoppingList = getShoppingList(sessionId);

  if (shoppingList.items.length === 0) {
    return {
      result: {
        status: 'empty',
        message:
          'The shopping list is empty. Add items before generating a plan.',
      },
    };
  }

  const planItems = shoppingList.items.map((item) => ({
    product: item.product,
    reason: '', // Claude provides the context through the summary
    priority: 'essential' as const,
    quantity: item.quantity,
  }));

  const aisleNumbers = [
    ...new Set(shoppingList.items.map((i) => i.product.aisle)),
  ];
  const route = planRoute(aisleNumbers);

  const totalCost = shoppingList.items.reduce(
    (sum, i) => sum + i.product.price * i.quantity,
    0
  );

  const plan: ShoppingPlan = {
    id: uuidv4(),
    sessionId,
    title: input.title,
    summary: input.summary,
    items: planItems,
    route: route.route,
    totalCost,
    proTips: input.proTips,
    createdAt: new Date().toISOString(),
    petContext: input.petContext,
  };

  setPlan(sessionId, plan);

  return {
    result: {
      status: 'ok',
      planId: plan.id,
      totalCost: plan.totalCost,
      itemCount: plan.items.length,
      route: route.directions,
      map_url: `${process.env.NEXT_PUBLIC_URL || ''}/plan/${sessionId}`,
      summary: input.summary,
    },
    plan,
  };
}
