import Anthropic from '@anthropic-ai/sdk';

export const conversationTools: Anthropic.Tool[] = [
  {
    name: 'find_items',
    description:
      'Search the store inventory for products. Use this when the customer mentions wanting something or asks about products. Takes a natural language query.',
    input_schema: {
      type: 'object' as const,
      properties: {
        query: {
          type: 'string',
          description:
            'Natural language search query (e.g., "goldfish food", "tank for betta", "dog toys")',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'add_item',
    description:
      'Add a product to the customer\'s shopping list. Automatically checks compatibility with existing items and pet context. Use after finding and confirming a product.',
    input_schema: {
      type: 'object' as const,
      properties: {
        item_id: {
          type: 'string',
          description: 'The product ID from search results (e.g., "ff-001")',
        },
        quantity: {
          type: 'number',
          description: 'How many to add. Defaults to 1.',
        },
      },
      required: ['item_id'],
    },
  },
  {
    name: 'remove_item',
    description:
      'Remove a product from the customer\'s shopping list.',
    input_schema: {
      type: 'object' as const,
      properties: {
        item_id: {
          type: 'string',
          description: 'The product ID to remove from the list',
        },
      },
      required: ['item_id'],
    },
  },
  {
    name: 'generate_plan',
    description:
      'Finalize the shopping experience: generates a shopping plan with optimized store route and a QR code link. Call this when the customer is ready to shop or has all their items.',
    input_schema: {
      type: 'object' as const,
      properties: {
        title: {
          type: 'string',
          description: 'A friendly title for the plan (e.g., "Your Goldfish Starter Kit")',
        },
        summary: {
          type: 'string',
          description: 'Brief summary of what was recommended and why',
        },
        proTips: {
          type: 'array',
          items: { type: 'string' },
          description: 'Helpful care tips for the customer',
        },
        petContext: {
          type: 'string',
          description: 'Description of the customer\'s pet situation',
        },
      },
      required: ['title', 'summary', 'proTips', 'petContext'],
    },
  },
];
