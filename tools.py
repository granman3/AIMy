"""
Claude tool definitions and async handlers for the pet store voice assistant.
"""
from pipecat.adapters.schemas.function_schema import FunctionSchema
from pipecat.adapters.schemas.tools_schema import ToolsSchema

# ---------------------------------------------------------------------------
# Tool Schemas
# ---------------------------------------------------------------------------

search_products_schema = FunctionSchema(
    name="search_products",
    description=(
        "Search the pet store catalog for products matching a pet problem or need. "
        "Returns relevant products with name, price, aisle, and why each is recommended."
    ),
    properties={
        "problem_keywords": {
            "type": "array",
            "items": {"type": "string"},
            "description": (
                "Keywords describing the pet's problem, e.g. ['dry_skin', 'itching', 'coat']. "
                "Use lowercase with underscores."
            ),
        },
        "pet_type": {
            "type": "string",
            "enum": ["dog", "cat", "bird", "fish", "small_animal", "any"],
            "description": "The type of pet the customer has.",
        },
    },
    required=["problem_keywords", "pet_type"],
)

add_to_cart_schema = FunctionSchema(
    name="add_to_cart",
    description="Add a recommended product to the customer's shopping list.",
    properties={
        "product_id": {
            "type": "string",
            "description": "The product ID from catalog search results.",
        },
        "reason": {
            "type": "string",
            "description": "Customer-friendly reason this product was recommended.",
        },
    },
    required=["product_id", "reason"],
)

remove_from_cart_schema = FunctionSchema(
    name="remove_from_cart",
    description="Remove a product from the shopping list if the customer changes their mind.",
    properties={
        "product_id": {
            "type": "string",
            "description": "The product ID to remove.",
        },
    },
    required=["product_id"],
)

get_cart_schema = FunctionSchema(
    name="get_cart",
    description=(
        "Get the current shopping list with all items, prices, aisles, and subtotal. "
        "Use this to report the running total or read the final summary."
    ),
    properties={},
    required=[],
)

get_product_details_schema = FunctionSchema(
    name="get_product_details",
    description="Get full details for a specific product. Use when the customer asks for more information.",
    properties={
        "product_id": {
            "type": "string",
            "description": "The product ID to look up.",
        },
    },
    required=["product_id"],
)

PET_STORE_TOOLS = ToolsSchema(standard_tools=[
    search_products_schema,
    add_to_cart_schema,
    remove_from_cart_schema,
    get_cart_schema,
    get_product_details_schema,
])


# ---------------------------------------------------------------------------
# Async Handlers
# ---------------------------------------------------------------------------

async def handle_search_products(params):
    from catalog import search_products
    args = params.arguments
    category = args.get("pet_type")
    if category == "any":
        category = None
    results = search_products(query_tags=args["problem_keywords"], category=category)
    if not results:
        await params.result_callback({
            "found": False,
            "message": "No products found. Ask the customer to describe the problem differently.",
        })
        return
    summary = [
        {
            "product_id": p["id"],
            "name": p["name"],
            "price": p["price"],
            "aisle": p["aisle"],
            "description": p["description"],
            "good_for": p["why_good_for"],
        }
        for p in results[:5]
    ]
    await params.result_callback({"found": True, "products": summary})


async def handle_add_to_cart(params):
    from shopping_cart import add_to_cart, get_subtotal
    args = params.arguments
    entry = add_to_cart(args["product_id"], args["reason"])
    if entry is None:
        await params.result_callback({
            "success": False,
            "message": f"Product {args['product_id']} not found in catalog.",
        })
        return
    await params.result_callback({
        "success": True,
        "added": entry["name"],
        "price": entry["price"],
        "aisle": entry["aisle"],
        "new_subtotal": get_subtotal(),
    })


async def handle_remove_from_cart(params):
    from shopping_cart import remove_from_cart, get_subtotal
    removed = remove_from_cart(params.arguments["product_id"])
    await params.result_callback({
        "success": removed,
        "new_subtotal": get_subtotal(),
    })


async def handle_get_cart(params):
    from shopping_cart import get_cart, get_subtotal, format_cart_summary
    await params.result_callback({
        "items": get_cart(),
        "subtotal": get_subtotal(),
        "summary": format_cart_summary(),
    })


async def handle_get_product_details(params):
    from catalog import get_product_by_id
    product = get_product_by_id(params.arguments["product_id"])
    if product is None:
        await params.result_callback({"found": False})
        return
    await params.result_callback({"found": True, "product": product})


def register_all_tools(llm):
    """Wire all tool handlers to the AnthropicLLMService instance."""
    llm.register_function("search_products", handle_search_products)
    llm.register_function("add_to_cart", handle_add_to_cart)
    llm.register_function("remove_from_cart", handle_remove_from_cart)
    llm.register_function("get_cart", handle_get_cart)
    llm.register_function("get_product_details", handle_get_product_details)
