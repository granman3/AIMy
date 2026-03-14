import Anthropic from '@anthropic-ai/sdk';

export const toolDefinitions: Anthropic.Tool[] = [
  {
    name: 'search_inventory',
    description:
      'Search the store inventory for products. Use this to find products by keyword, category, pet type, or price range. Always search before recommending products.',
    input_schema: {
      type: 'object' as const,
      properties: {
        keyword: {
          type: 'string',
          description: 'Search keyword (e.g., "goldfish food", "filter", "tank")',
        },
        category: {
          type: 'string',
          enum: ['food', 'toys', 'habitat', 'health', 'grooming', 'accessories'],
          description: 'Product category to filter by',
        },
        petType: {
          type: 'string',
          description: 'Pet type to filter by (e.g., "fish", "dog", "cat", "goldfish", "betta")',
        },
        minPrice: { type: 'number', description: 'Minimum price filter' },
        maxPrice: { type: 'number', description: 'Maximum price filter' },
      },
      required: [],
    },
  },
  {
    name: 'get_product_details',
    description:
      'Get detailed information about a specific product by its ID. Use this when you need more info about a product found in search results.',
    input_schema: {
      type: 'object' as const,
      properties: {
        productId: {
          type: 'string',
          description: 'The product ID (e.g., "ff-001")',
        },
      },
      required: ['productId'],
    },
  },
  {
    name: 'check_compatibility',
    description:
      'Check if a set of products are compatible with each other and with the customer\'s pet. Use this to catch issues like tanks being too small, missing essential items, or unsafe combinations.',
    input_schema: {
      type: 'object' as const,
      properties: {
        productIds: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of product IDs to check compatibility for',
        },
        petContext: {
          type: 'string',
          description: 'Description of the pet situation (e.g., "2 goldfish", "new betta fish")',
        },
      },
      required: ['productIds'],
    },
  },
  {
    name: 'plan_store_route',
    description:
      'Plan an optimal walking route through the store to pick up items. Returns ordered aisle-by-aisle directions.',
    input_schema: {
      type: 'object' as const,
      properties: {
        aisleNumbers: {
          type: 'array',
          items: { type: 'number' },
          description: 'List of aisle numbers the customer needs to visit',
        },
      },
      required: ['aisleNumbers'],
    },
  },
  {
    name: 'generate_shopping_plan',
    description:
      'Generate the final shopping plan for the customer. Call this ONLY when you have gathered enough information and selected all the products. This creates the plan that the customer will see on their phone via QR code.',
    input_schema: {
      type: 'object' as const,
      properties: {
        title: {
          type: 'string',
          description: 'A friendly title for the plan (e.g., "Your Goldfish Starter Kit")',
        },
        summary: {
          type: 'string',
          description: 'A brief summary of what was recommended and why',
        },
        items: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              productId: { type: 'string' },
              reason: {
                type: 'string',
                description: 'Why this product was recommended',
              },
              priority: {
                type: 'string',
                enum: ['essential', 'recommended', 'optional'],
              },
              quantity: { type: 'number', description: 'How many to buy' },
            },
            required: ['productId', 'reason', 'priority', 'quantity'],
          },
          description: 'The products to include in the plan',
        },
        proTips: {
          type: 'array',
          items: { type: 'string' },
          description: 'Helpful tips for the customer (care advice, setup instructions, etc.)',
        },
        petContext: {
          type: 'string',
          description: 'Description of the customer\'s pet situation for context',
        },
      },
      required: ['title', 'summary', 'items', 'proTips', 'petContext'],
    },
  },
];
