import { Product } from '../types';

interface CompatibilityCheck {
  compatible: boolean;
  warnings: string[];
  suggestions: string[];
}

/**
 * Check compatibility between a set of products and optional pet context.
 */
export function checkCompatibility(
  productIds: string[],
  products: Product[],
  petContext?: string
): CompatibilityCheck {
  const warnings: string[] = [];
  const suggestions: string[] = [];

  const selectedProducts = products.filter(p => productIds.includes(p.id));
  const context = (petContext || '').toLowerCase();

  // Check tank size for goldfish
  const hasGoldfish = context.includes('goldfish');
  const tanks = selectedProducts.filter(p => p.tags.includes('tank'));
  const has10GallonOrSmaller = tanks.some(
    p => p.tags.includes('5-gallon') || p.tags.includes('10-gallon')
  );

  if (hasGoldfish && has10GallonOrSmaller) {
    const goldFishCount = context.match(/(\d+)\s*goldfish/)?.[1];
    const count = goldFishCount ? parseInt(goldFishCount) : 1;
    warnings.push(
      'Goldfish produce a lot of waste and need more space than most people think. ' +
      'A single goldfish needs at least 20 gallons, and each additional goldfish needs 10 more gallons.'
    );
    if (count <= 2) {
      suggestions.push('Consider upgrading to at least a 20-gallon tank for a healthier goldfish.');
    } else {
      suggestions.push(`For ${count} goldfish, I recommend at least a ${20 + (count - 1) * 10}-gallon tank.`);
    }
  }

  // Check betta tank compatibility
  const hasBetta = context.includes('betta');
  if (hasBetta) {
    const hasBettaTank = selectedProducts.some(p => p.tags.includes('betta'));
    const hasAnyTank = tanks.length > 0;
    if (hasAnyTank && !hasBettaTank) {
      const tankSize = tanks[0]?.tags.find(t => t.includes('gallon'));
      if (tankSize && parseInt(tankSize) > 10) {
        suggestions.push(
          'Bettas prefer calmer water and smaller spaces. A dedicated 5-gallon betta tank works best.'
        );
      }
    }
  }

  // Check filter compatibility with tank size
  const filters = selectedProducts.filter(p => p.tags.includes('filter'));
  if (tanks.length > 0 && filters.length > 0) {
    const tankIs20Plus = tanks.some(p => p.tags.includes('20-gallon') || p.tags.includes('30-gallon'));
    const filterIs20Max = filters.some(p => p.tags.includes('20-gallon') && p.tags.includes('filter'));
    if (tankIs20Plus && filterIs20Max) {
      warnings.push(
        'The AquaClear 20 filter is rated for up to 20 gallons. For a larger tank, consider the AquaClear 50.'
      );
    }
  }

  // Check heater necessity
  const hasTropicalFish = context.includes('tropical') || hasBetta;
  const hasHeater = selectedProducts.some(p => p.tags.includes('heater'));
  if (hasTropicalFish && tanks.length > 0 && !hasHeater) {
    suggestions.push(
      'Tropical fish and bettas need a heater to maintain water temperature around 76-82°F.'
    );
  }

  // Heater not needed for goldfish
  if (hasGoldfish && hasHeater) {
    suggestions.push(
      'Goldfish are cold-water fish and typically don\'t need a heater unless your room is very cold.'
    );
  }

  // Water conditioner check
  const hasConditioner = selectedProducts.some(p => p.tags.includes('water-conditioner'));
  if (tanks.length > 0 && !hasConditioner) {
    warnings.push(
      'You\'ll need water conditioner to remove chlorine from tap water before adding fish. This is essential!'
    );
  }

  // Beneficial bacteria for new tank
  const hasBacteria = selectedProducts.some(p => p.tags.includes('bacteria'));
  if (tanks.length > 0 && !hasBacteria) {
    suggestions.push(
      'Adding beneficial bacteria when setting up a new tank helps establish the nitrogen cycle faster and keeps fish healthier.'
    );
  }

  // Gravel check for new tank
  const hasGravel = selectedProducts.some(p => p.tags.includes('gravel') || p.tags.includes('substrate'));
  if (tanks.length > 0 && !hasGravel) {
    suggestions.push('Don\'t forget substrate/gravel for the bottom of your tank!');
  }

  // Betta fin safety with plastic plants
  if (hasBetta) {
    const hasPlasticDecor = selectedProducts.some(p =>
      p.tags.includes('decoration') && !p.tags.includes('betta-safe') && !p.tags.includes('silk')
    );
    if (hasPlasticDecor) {
      warnings.push(
        'Bettas have delicate fins that can tear on sharp decorations. Silk plants are safer than plastic ones.'
      );
    }
  }

  return {
    compatible: warnings.length === 0,
    warnings,
    suggestions,
  };
}
