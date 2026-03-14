import { StoreLayout } from '../types';

export const storeLayout: StoreLayout = {
  entrance: { x: 0, y: 4 },
  checkout: { x: 0, y: 0 },
  aisles: [
    { number: 1, name: 'Pet Food', categories: ['food'], x: 1, y: 0 },
    { number: 2, name: 'Tanks & Habitats', categories: ['habitat'], x: 2, y: 0 },
    { number: 3, name: 'Filters & Equipment', categories: ['accessories'], x: 3, y: 0 },
    { number: 4, name: 'Health & Water Care', categories: ['health'], x: 4, y: 0 },
    { number: 5, name: 'Gravel & Decorations', categories: ['accessories'], x: 1, y: 1 },
    { number: 6, name: 'Toys', categories: ['toys'], x: 2, y: 1 },
    { number: 7, name: 'Grooming & Accessories', categories: ['grooming', 'accessories'], x: 3, y: 1 },
    { number: 8, name: 'Leashes, Collars & Litter', categories: ['accessories'], x: 4, y: 1 },
  ],
};

const aisleNames: Record<number, string> = {
  1: 'Pet Food',
  2: 'Tanks & Habitats',
  3: 'Filters & Equipment',
  4: 'Health & Water Care',
  5: 'Gravel & Decorations',
  6: 'Toys',
  7: 'Grooming & Accessories',
  8: 'Leashes, Collars & Litter',
};

/**
 * Plans an optimal serpentine route through the store.
 * Row 2 (aisles 5-8) is closer to entrance, Row 1 (aisles 1-4) is closer to checkout.
 * The route snakes through aisles to minimize backtracking.
 */
export function planRoute(aisleNumbers: number[]): {
  route: number[];
  directions: string[];
} {
  if (aisleNumbers.length === 0) {
    return { route: [], directions: ['Head straight to checkout!'] };
  }

  const uniqueAisles = [...new Set(aisleNumbers)];

  // Serpentine: visit row 2 (near entrance) left-to-right, then row 1 right-to-left (toward checkout)
  const row2 = uniqueAisles.filter(a => a >= 5).sort((a, b) => a - b);
  const row1 = uniqueAisles.filter(a => a <= 4).sort((a, b) => b - a);
  const sorted = [...row2, ...row1];

  const directions: string[] = ['Enter the store and follow the main path.'];

  sorted.forEach((aisleNum, i) => {
    const name = aisleNames[aisleNum] || `Aisle ${aisleNum}`;
    if (i === 0 && aisleNum >= 5) {
      directions.push(`${i + 1}. Head to Aisle ${aisleNum} (${name}) on your right.`);
    } else if (aisleNum >= 5) {
      directions.push(`${i + 1}. Continue to Aisle ${aisleNum} (${name}).`);
    } else if (row2.length === 0 && i === 0) {
      directions.push(`${i + 1}. Head up to Aisle ${aisleNum} (${name}).`);
    } else {
      directions.push(`${i + 1}. Cross to Aisle ${aisleNum} (${name}).`);
    }
  });

  directions.push('Then head to the checkout at the front of the store.');

  return { route: sorted, directions };
}
