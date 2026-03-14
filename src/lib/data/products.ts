import { Product } from '../types';

export const products: Product[] = [
  // ===== FISH FOOD (Aisle 1) =====
  { id: 'ff-001', name: 'AquaLife Goldfish Flakes', category: 'food', petType: ['fish', 'goldfish'], price: 6.99, description: 'Premium daily nutrition flakes formulated specifically for goldfish. Enhances color and supports immune health.', aisle: 1, inStock: true, brand: 'AquaLife', tags: ['goldfish', 'flakes', 'daily-feeding'], compatibilityNotes: ['Suitable for all goldfish varieties'] },
  { id: 'ff-002', name: 'AquaLife Betta Pellets', category: 'food', petType: ['fish', 'betta'], price: 5.49, description: 'Floating micro-pellets designed for betta fish. High protein formula supports fin growth and vibrant color.', aisle: 1, inStock: true, brand: 'AquaLife', tags: ['betta', 'pellets', 'daily-feeding'] },
  { id: 'ff-003', name: 'OceanPrime Tropical Flakes', category: 'food', petType: ['fish', 'tropical'], price: 8.99, description: 'Multi-species tropical fish food with krill and spirulina. Suitable for tetras, guppies, mollies, and more.', aisle: 1, inStock: true, brand: 'OceanPrime', tags: ['tropical', 'flakes', 'multi-species'] },
  { id: 'ff-004', name: 'NutriPond Goldfish Pellets Premium', category: 'food', petType: ['fish', 'goldfish'], price: 12.99, description: 'Slow-sinking pellets with probiotics for optimal goldfish digestion. Less tank waste than flakes.', aisle: 1, inStock: true, brand: 'NutriPond', tags: ['goldfish', 'pellets', 'premium', 'less-waste'] },
  { id: 'ff-005', name: 'FreezeMax Bloodworms', category: 'food', petType: ['fish', 'betta', 'tropical'], price: 4.99, description: 'Freeze-dried bloodworms as a high-protein treat. Great for bettas and tropical fish. Feed 2-3 times per week.', aisle: 1, inStock: true, brand: 'FreezeMax', tags: ['treat', 'bloodworms', 'freeze-dried'] },
  { id: 'ff-006', name: 'Budget Goldfish Flakes', category: 'food', petType: ['fish', 'goldfish'], price: 3.49, description: 'Affordable daily goldfish food. Basic nutrition for healthy fish.', aisle: 1, inStock: true, brand: 'PetBasics', tags: ['goldfish', 'flakes', 'budget'] },

  // ===== DOG FOOD (Aisle 1) =====
  { id: 'df-001', name: 'WholePaws Adult Dog Kibble', category: 'food', petType: ['dog'], price: 34.99, description: 'Grain-free chicken recipe for adult dogs. Made with real deboned chicken and sweet potato.', aisle: 1, inStock: true, brand: 'WholePaws', tags: ['dog', 'kibble', 'grain-free', 'adult'] },
  { id: 'df-002', name: 'WholePaws Puppy Formula', category: 'food', petType: ['dog', 'puppy'], price: 29.99, description: 'DHA-enriched puppy food supporting brain and eye development. Small kibble size for puppy mouths.', aisle: 1, inStock: true, brand: 'WholePaws', tags: ['dog', 'puppy', 'kibble'] },
  { id: 'df-003', name: 'PetBasics Dog Food', category: 'food', petType: ['dog'], price: 19.99, description: 'Affordable everyday nutrition for adult dogs. Chicken and rice formula.', aisle: 1, inStock: true, brand: 'PetBasics', tags: ['dog', 'kibble', 'budget'] },

  // ===== CAT FOOD (Aisle 1) =====
  { id: 'cf-001', name: 'FelineFeast Indoor Cat Formula', category: 'food', petType: ['cat'], price: 27.99, description: 'Specially formulated for indoor cats with hairball control and weight management.', aisle: 1, inStock: true, brand: 'FelineFeast', tags: ['cat', 'indoor', 'hairball-control'] },
  { id: 'cf-002', name: 'FelineFeast Wet Food Variety Pack', category: 'food', petType: ['cat'], price: 18.99, description: '12-pack of wet food in gravy. Chicken, salmon, and turkey flavors. Grain-free.', aisle: 1, inStock: true, brand: 'FelineFeast', tags: ['cat', 'wet-food', 'variety'] },

  // ===== FISH TANKS & HABITAT (Aisle 2) =====
  { id: 'ft-001', name: 'ClearView 10-Gallon Starter Kit', category: 'habitat', petType: ['fish'], price: 49.99, description: 'Complete 10-gallon glass aquarium kit. Includes LED hood, filter, and heater. Perfect starter tank for goldfish or small tropical community.', aisle: 2, inStock: true, brand: 'ClearView', tags: ['tank', '10-gallon', 'starter-kit', 'glass'], compatibilityNotes: ['Suitable for 1-2 goldfish or 8-10 small tropical fish', 'Included filter rated for up to 10 gallons'] },
  { id: 'ft-002', name: 'ClearView 20-Gallon Long Tank', category: 'habitat', petType: ['fish'], price: 79.99, description: '20-gallon long glass aquarium. More swimming space ideal for goldfish and community tanks. Tank only - accessories sold separately.', aisle: 2, inStock: true, brand: 'ClearView', tags: ['tank', '20-gallon', 'glass', 'long'], compatibilityNotes: ['Recommended for 2-4 goldfish', 'Needs separate filter, heater, and hood'] },
  { id: 'ft-003', name: 'AquaBetta 5-Gallon Betta Tank', category: 'habitat', petType: ['fish', 'betta'], price: 34.99, description: 'Curved-front 5-gallon tank designed for betta fish. Built-in LED light and gentle filter that wont stress bettas.', aisle: 2, inStock: true, brand: 'AquaBetta', tags: ['tank', '5-gallon', 'betta', 'curved'] },
  { id: 'ft-004', name: 'NanoReef 30-Gallon Tank', category: 'habitat', petType: ['fish'], price: 149.99, description: '30-gallon rimless glass tank. Ideal for tropical community or goldfish. Crystal clear glass with polished edges.', aisle: 2, inStock: true, brand: 'NanoReef', tags: ['tank', '30-gallon', 'rimless', 'premium'] },
  { id: 'ft-005', name: 'Budget 5-Gallon Tank Kit', category: 'habitat', petType: ['fish'], price: 24.99, description: 'Basic 5-gallon tank with plastic hood and small filter. Good starter for a single betta or a few small fish.', aisle: 2, inStock: true, brand: 'PetBasics', tags: ['tank', '5-gallon', 'budget', 'starter-kit'] },

  // ===== DOG/CAT HABITAT (Aisle 2) =====
  { id: 'dh-001', name: 'CozyDen Large Dog Crate', category: 'habitat', petType: ['dog'], price: 69.99, description: '42-inch wire crate with divider panel. Double door design. Includes washable tray.', aisle: 2, inStock: true, brand: 'CozyDen', tags: ['dog', 'crate', 'large', 'wire'] },
  { id: 'ch-001', name: 'PurrfectNest Cat Tree Tower', category: 'habitat', petType: ['cat'], price: 59.99, description: '5-level cat tree with sisal scratching posts, plush platforms, and a cozy hideaway. 52 inches tall.', aisle: 2, inStock: true, brand: 'PurrfectNest', tags: ['cat', 'tree', 'scratching-post'] },

  // ===== FILTERS & EQUIPMENT (Aisle 3) =====
  { id: 'fe-001', name: 'AquaClear Power Filter 20', category: 'accessories', petType: ['fish'], price: 24.99, description: 'Hang-on-back filter rated for 5-20 gallon tanks. 3-stage filtration: foam, carbon, and bio-media. Adjustable flow rate.', aisle: 3, inStock: true, brand: 'AquaClear', tags: ['filter', 'HOB', '20-gallon', 'adjustable'], compatibilityNotes: ['For tanks 5-20 gallons', 'Adjustable flow good for bettas'] },
  { id: 'fe-002', name: 'AquaClear Power Filter 50', category: 'accessories', petType: ['fish'], price: 34.99, description: 'Hang-on-back filter for 20-50 gallon tanks. 3-stage filtration with higher flow rate for larger tanks.', aisle: 3, inStock: true, brand: 'AquaClear', tags: ['filter', 'HOB', '50-gallon'], compatibilityNotes: ['For tanks 20-50 gallons'] },
  { id: 'fe-003', name: 'ThermoGuard 50W Aquarium Heater', category: 'accessories', petType: ['fish', 'tropical', 'betta'], price: 19.99, description: 'Submersible heater for 10-20 gallon tanks. Preset to 78°F, ideal for tropical fish and bettas. Auto shut-off safety feature.', aisle: 3, inStock: true, brand: 'ThermoGuard', tags: ['heater', '50W', 'tropical', 'preset'], compatibilityNotes: ['For 10-20 gallon tanks', 'Not needed for goldfish (cold water fish)'] },
  { id: 'fe-004', name: 'ThermoGuard 100W Aquarium Heater', category: 'accessories', petType: ['fish', 'tropical', 'betta'], price: 27.99, description: 'Adjustable heater for 20-40 gallon tanks. Temperature range 68-88°F.', aisle: 3, inStock: true, brand: 'ThermoGuard', tags: ['heater', '100W', 'adjustable'], compatibilityNotes: ['For 20-40 gallon tanks'] },
  { id: 'fe-005', name: 'BrightFin LED Aquarium Light', category: 'accessories', petType: ['fish'], price: 22.99, description: 'Full-spectrum LED light for 10-20 gallon tanks. Day/night modes. Low energy consumption.', aisle: 3, inStock: true, brand: 'BrightFin', tags: ['light', 'LED', 'aquarium'] },
  { id: 'fe-006', name: 'AirMax Aquarium Air Pump', category: 'accessories', petType: ['fish'], price: 12.99, description: 'Quiet air pump for tanks up to 20 gallons. Includes airline tubing and air stone. Improves oxygenation.', aisle: 3, inStock: true, brand: 'AirMax', tags: ['air-pump', 'oxygenation', 'quiet'] },

  // ===== WATER CARE & HEALTH (Aisle 4) =====
  { id: 'wc-001', name: 'AquaSafe Water Conditioner', category: 'health', petType: ['fish'], price: 7.99, description: 'Instantly removes chlorine and chloramines from tap water. Essential for any new tank setup or water change. Treats 500 gallons.', aisle: 4, inStock: true, brand: 'AquaSafe', tags: ['water-conditioner', 'dechlorinator', 'essential'], compatibilityNotes: ['MUST use when setting up new tank or doing water changes'] },
  { id: 'wc-002', name: 'NitroCycle Beneficial Bacteria', category: 'health', petType: ['fish'], price: 11.99, description: 'Live beneficial bacteria to jump-start the nitrogen cycle. Reduces new tank syndrome. Add when setting up a new tank.', aisle: 4, inStock: true, brand: 'NitroCycle', tags: ['bacteria', 'cycling', 'new-tank', 'essential'] },
  { id: 'wc-003', name: 'TestRight Master Water Test Kit', category: 'health', petType: ['fish'], price: 24.99, description: 'Tests pH, ammonia, nitrite, and nitrate. 800+ tests per kit. Essential for monitoring water quality.', aisle: 4, inStock: true, brand: 'TestRight', tags: ['test-kit', 'water-quality', 'pH', 'ammonia'] },
  { id: 'wc-004', name: 'BettaFix Antibacterial Treatment', category: 'health', petType: ['fish', 'betta'], price: 8.99, description: 'All-natural antibacterial remedy for bettas. Heals fin rot, open wounds, and ulcers. Melaleuca-based formula.', aisle: 4, inStock: true, brand: 'BettaFix', tags: ['medication', 'fin-rot', 'betta', 'antibacterial'] },
  { id: 'wc-005', name: 'IchCure Fish Disease Treatment', category: 'health', petType: ['fish'], price: 9.99, description: 'Treats ich (white spot disease), the most common fish illness. Safe for most freshwater fish.', aisle: 4, inStock: true, brand: 'IchCure', tags: ['medication', 'ich', 'disease-treatment'] },
  { id: 'wc-006', name: 'StressCoat Fish Protector', category: 'health', petType: ['fish'], price: 8.49, description: 'Replaces slime coat damaged by handling, shipping, or disease. Reduces fish stress during tank changes.', aisle: 4, inStock: true, brand: 'StressCoat', tags: ['stress-relief', 'slime-coat', 'water-additive'] },

  // ===== DOG/CAT HEALTH (Aisle 4) =====
  { id: 'dh-002', name: 'FleaShield Plus for Dogs', category: 'health', petType: ['dog'], price: 39.99, description: 'Monthly flea and tick prevention for dogs 11-20 lbs. 3-month supply. Waterproof formula.', aisle: 4, inStock: true, brand: 'FleaShield', tags: ['dog', 'flea', 'tick', 'prevention'] },
  { id: 'dh-003', name: 'JointEase Dog Supplement', category: 'health', petType: ['dog'], price: 24.99, description: 'Glucosamine and chondroitin chews for joint health. 60 soft chews. Bacon flavor dogs love.', aisle: 4, inStock: true, brand: 'JointEase', tags: ['dog', 'joint', 'supplement'] },
  { id: 'ch-002', name: 'HairballRelief Cat Treats', category: 'health', petType: ['cat'], price: 7.99, description: 'Crunchy treats with natural fiber to help prevent hairballs. Chicken flavor.', aisle: 4, inStock: true, brand: 'HairballRelief', tags: ['cat', 'hairball', 'treats'] },

  // ===== GRAVEL & DECORATIONS (Aisle 5) =====
  { id: 'gd-001', name: 'NaturalStone Aquarium Gravel 5lb', category: 'accessories', petType: ['fish'], price: 8.99, description: 'Natural river-stone gravel in assorted earth tones. Pre-washed and safe for all freshwater aquariums. 5lb bag covers ~5 gallons.', aisle: 5, inStock: true, brand: 'NaturalStone', tags: ['gravel', 'substrate', 'natural'], compatibilityNotes: ['Use 1lb per gallon of tank'] },
  { id: 'gd-002', name: 'NaturalStone Aquarium Gravel 10lb', category: 'accessories', petType: ['fish'], price: 14.99, description: 'Natural river-stone gravel. 10lb bag covers ~10 gallons. Pre-washed.', aisle: 5, inStock: true, brand: 'NaturalStone', tags: ['gravel', 'substrate', 'natural', 'value'] },
  { id: 'gd-003', name: 'AquaScape Silk Plants 3-Pack', category: 'accessories', petType: ['fish'], price: 11.99, description: 'Realistic silk aquarium plants. Safe for bettas (won\'t tear fins like plastic). Weighted bases stay put.', aisle: 5, inStock: true, brand: 'AquaScape', tags: ['plants', 'silk', 'decoration', 'betta-safe'], compatibilityNotes: ['Silk plants are safer for betta fins than plastic'] },
  { id: 'gd-004', name: 'AquaScape Driftwood Centerpiece', category: 'accessories', petType: ['fish'], price: 16.99, description: 'Natural-look resin driftwood. Provides hiding spots for fish. Non-toxic and won\'t affect water chemistry.', aisle: 5, inStock: true, brand: 'AquaScape', tags: ['decoration', 'driftwood', 'hideout'] },
  { id: 'gd-005', name: 'GlowFish Neon Gravel 5lb', category: 'accessories', petType: ['fish'], price: 9.99, description: 'Brightly colored neon gravel. Fun for kids\' tanks. Non-toxic coating safe for all freshwater fish.', aisle: 5, inStock: true, brand: 'GlowFish', tags: ['gravel', 'neon', 'colorful', 'kids'] },

  // ===== TOYS (Aisle 6) =====
  { id: 'dt-001', name: 'ToughChew Rope Toy', category: 'toys', petType: ['dog'], price: 9.99, description: 'Durable cotton rope toy for medium to large dogs. Great for tug-of-war and dental health.', aisle: 6, inStock: true, brand: 'ToughChew', tags: ['dog', 'rope', 'chew', 'dental'] },
  { id: 'dt-002', name: 'SqueekyBall Tennis Balls 3-Pack', category: 'toys', petType: ['dog'], price: 7.99, description: 'Extra-bouncy tennis balls with squeaker inside. Durable felt won\'t wear down quickly.', aisle: 6, inStock: true, brand: 'SqueekyBall', tags: ['dog', 'ball', 'squeaky', 'fetch'] },
  { id: 'dt-003', name: 'PuzzlePaws Treat Dispenser', category: 'toys', petType: ['dog'], price: 14.99, description: 'Interactive puzzle toy that dispenses treats. Keeps dogs mentally stimulated. Difficulty adjustable.', aisle: 6, inStock: true, brand: 'PuzzlePaws', tags: ['dog', 'puzzle', 'interactive', 'treat'] },
  { id: 'ct-001', name: 'LaserChase Cat Toy', category: 'toys', petType: ['cat'], price: 8.99, description: 'Automatic laser pointer with random patterns. Battery operated. Keeps cats entertained for hours.', aisle: 6, inStock: true, brand: 'LaserChase', tags: ['cat', 'laser', 'automatic', 'interactive'] },
  { id: 'ct-002', name: 'FeatherWand Cat Teaser', category: 'toys', petType: ['cat'], price: 6.99, description: 'Retractable wand toy with natural feathers. Great for bonding and exercise.', aisle: 6, inStock: true, brand: 'FeatherWand', tags: ['cat', 'wand', 'feather', 'interactive'] },
  { id: 'ct-003', name: 'CrinkleMouse Catnip Toy 2-Pack', category: 'toys', petType: ['cat'], price: 5.99, description: 'Crinkle-stuffed mice with organic catnip. Irresistible to cats.', aisle: 6, inStock: true, brand: 'CrinkleMouse', tags: ['cat', 'mouse', 'catnip', 'crinkle'] },

  // ===== GROOMING (Aisle 7) =====
  { id: 'dg-001', name: 'SoftCoat Dog Shampoo', category: 'grooming', petType: ['dog'], price: 11.99, description: 'Gentle oatmeal shampoo for sensitive skin. Soap-free and tearless. Leaves coat soft and shiny.', aisle: 7, inStock: true, brand: 'SoftCoat', tags: ['dog', 'shampoo', 'sensitive-skin', 'oatmeal'] },
  { id: 'dg-002', name: 'ProGroom Deshedding Tool', category: 'grooming', petType: ['dog', 'cat'], price: 19.99, description: 'Stainless steel deshedding blade reduces shedding up to 90%. Works on dogs and cats. Medium size.', aisle: 7, inStock: true, brand: 'ProGroom', tags: ['deshedding', 'brush', 'multi-pet'] },
  { id: 'dg-003', name: 'QuickClip Nail Trimmer', category: 'grooming', petType: ['dog', 'cat'], price: 8.99, description: 'Safety-guard nail clippers for dogs and cats. Built-in guard prevents over-cutting.', aisle: 7, inStock: true, brand: 'QuickClip', tags: ['nail-trimmer', 'safety', 'multi-pet'] },

  // ===== ACCESSORIES (Aisle 7) =====
  { id: 'fa-001', name: 'AquaNet Fish Net Medium', category: 'accessories', petType: ['fish'], price: 3.99, description: 'Soft-mesh fish net. Gentle on fish. 4-inch wide. Essential for tank maintenance.', aisle: 7, inStock: true, brand: 'AquaNet', tags: ['net', 'fish-net', 'tank-maintenance'] },
  { id: 'fa-002', name: 'AquaTherm Digital Thermometer', category: 'accessories', petType: ['fish'], price: 6.99, description: 'Accurate digital aquarium thermometer with suction cup mount. LCD display easy to read.', aisle: 7, inStock: true, brand: 'AquaTherm', tags: ['thermometer', 'digital', 'aquarium'] },
  { id: 'fa-003', name: 'SiphonPro Gravel Vacuum', category: 'accessories', petType: ['fish'], price: 12.99, description: 'Easy-start gravel vacuum for water changes and substrate cleaning. Fits tanks 10-50 gallons.', aisle: 7, inStock: true, brand: 'SiphonPro', tags: ['gravel-vacuum', 'siphon', 'water-change', 'cleaning'] },

  // ===== LEASHES, COLLARS, BOWLS (Aisle 8) =====
  { id: 'da-001', name: 'ComfortWalk Retractable Leash', category: 'accessories', petType: ['dog'], price: 16.99, description: '16-foot retractable leash with ergonomic handle. One-button lock. For dogs up to 55 lbs.', aisle: 8, inStock: true, brand: 'ComfortWalk', tags: ['dog', 'leash', 'retractable'] },
  { id: 'da-002', name: 'ComfortWalk Adjustable Collar', category: 'accessories', petType: ['dog'], price: 10.99, description: 'Reflective nylon collar with quick-release buckle. Adjustable 12-18 inches. Multiple colors.', aisle: 8, inStock: true, brand: 'ComfortWalk', tags: ['dog', 'collar', 'reflective', 'adjustable'] },
  { id: 'da-003', name: 'StainlessSteel Dog Bowl Set', category: 'accessories', petType: ['dog'], price: 12.99, description: 'Set of 2 non-slip stainless steel bowls. Dishwasher safe. 32oz capacity each.', aisle: 8, inStock: true, brand: 'PetDine', tags: ['dog', 'bowl', 'stainless-steel', 'non-slip'] },
  { id: 'ca-001', name: 'SelfClean Automatic Litter Box', category: 'accessories', petType: ['cat'], price: 89.99, description: 'Self-cleaning litter box with motion sensor. Rakes automatically 20 minutes after cat leaves. Uses standard clumping litter.', aisle: 8, inStock: true, brand: 'SelfClean', tags: ['cat', 'litter-box', 'automatic', 'self-cleaning'] },
  { id: 'ca-002', name: 'PurrfectScoop Clumping Litter 20lb', category: 'accessories', petType: ['cat'], price: 14.99, description: 'Ultra-clumping clay litter with baking soda odor control. Low dust. 20lb box.', aisle: 8, inStock: true, brand: 'PurrfectScoop', tags: ['cat', 'litter', 'clumping', 'odor-control'] },
  { id: 'ca-003', name: 'CeramicChic Cat Bowl', category: 'accessories', petType: ['cat'], price: 9.99, description: 'Whisker-friendly wide ceramic bowl. Weighted base prevents tipping. Dishwasher safe.', aisle: 8, inStock: true, brand: 'CeramicChic', tags: ['cat', 'bowl', 'ceramic', 'whisker-friendly'] },
];

export function searchProducts(query: {
  keyword?: string;
  category?: string;
  petType?: string;
  minPrice?: number;
  maxPrice?: number;
}): Product[] {
  let results = products.filter(p => p.inStock);

  if (query.keyword) {
    const kw = query.keyword.toLowerCase();
    results = results.filter(p =>
      p.name.toLowerCase().includes(kw) ||
      p.description.toLowerCase().includes(kw) ||
      p.tags.some(t => t.toLowerCase().includes(kw)) ||
      p.category.toLowerCase().includes(kw)
    );
  }

  if (query.category) {
    const cat = query.category.toLowerCase();
    results = results.filter(p => p.category.toLowerCase() === cat);
  }

  if (query.petType) {
    const pt = query.petType.toLowerCase();
    results = results.filter(p =>
      p.petType.some(t => t.toLowerCase().includes(pt))
    );
  }

  if (query.minPrice !== undefined) {
    results = results.filter(p => p.price >= query.minPrice!);
  }

  if (query.maxPrice !== undefined) {
    results = results.filter(p => p.price <= query.maxPrice!);
  }

  return results;
}

export function getProductById(id: string): Product | undefined {
  return products.find(p => p.id === id);
}
