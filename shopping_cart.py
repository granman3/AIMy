"""
In-memory shopping cart for the AIMy pet store voice assistant.
"""
from catalog import get_product_by_id

# Module-level cart state (single session), keyed by product_id
_cart: dict = {}


def add_to_cart(product_id: str, reason: str) -> dict | None:
    """
    Add a product to the cart. Returns the cart entry, or None if product not found.
    If already in cart, increments quantity.
    """
    product = get_product_by_id(product_id)
    if product is None:
        return None

    if product_id in _cart:
        _cart[product_id]["quantity"] += 1
    else:
        _cart[product_id] = {
            "product_id": product_id,
            "name": product["name"],
            "price": product["price"],
            "aisle": product["aisle"],
            "reason": reason,
            "quantity": 1,
        }
    return _cart[product_id]


def remove_from_cart(product_id: str) -> bool:
    """Remove a product from cart. Returns True if removed, False if not in cart."""
    if product_id in _cart:
        del _cart[product_id]
        return True
    return False


def get_cart() -> list:
    """Return all cart items as a list of dicts."""
    return list(_cart.values())


def get_subtotal() -> float:
    """Return the cart subtotal rounded to 2 decimal places."""
    total = sum(item["price"] * item["quantity"] for item in _cart.values())
    return round(total, 2)


def clear_cart() -> None:
    """Empty the cart."""
    _cart.clear()


def _price_to_spoken(price: float) -> str:
    """Convert a float price to a spoken string, e.g. 18.99 -> '18 dollars and 99 cents'."""
    dollars = int(price)
    cents = round((price - dollars) * 100)
    if cents == 0:
        return f"{dollars} dollars even"
    return f"{dollars} dollars and {cents} cents"


def format_cart_summary() -> str:
    """
    Return a human-readable spoken receipt — no dollar signs or symbols.
    Example:
        Shopping list:
        1. OmegaCoat Salmon Oil, aisle 3 B, 18 dollars and 99 cents. For dry skin.
        Your total is 18 dollars and 99 cents.
    """
    items = list(_cart.values())
    if not items:
        return "Your shopping list is empty."

    lines = ["Shopping list:"]
    for i, item in enumerate(items, 1):
        aisle_spoken = " ".join(list(item["aisle"]))  # "3B" -> "3 B"
        qty_note = f", quantity {item['quantity']}" if item["quantity"] > 1 else ""
        lines.append(
            f"{i}. {item['name']}, aisle {aisle_spoken}{qty_note}, "
            f"{_price_to_spoken(item['price'] * item['quantity'])}. "
            f"{item['reason']}."
        )

    lines.append(f"Your total is {_price_to_spoken(get_subtotal())}.")
    return "\n".join(lines)
