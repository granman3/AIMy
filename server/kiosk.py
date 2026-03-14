from __future__ import annotations

import secrets
from dataclasses import asdict, dataclass
from datetime import datetime, timezone
from difflib import SequenceMatcher
from html import escape
from typing import Iterable

from fastapi import FastAPI, HTTPException
from fastapi.responses import HTMLResponse


@dataclass(frozen=True)
class InventoryItem:
    item_id: str
    name: str
    category: str
    location: str
    aisle: int
    shelf: str
    keywords: tuple[str, ...]

    def search_blob(self) -> str:
        terms = " ".join((self.name, self.category, self.location, *self.keywords))
        return terms.lower()

    def to_public_dict(self) -> dict[str, object]:
        return {
            "id": self.item_id,
            "name": self.name,
            "category": self.category,
            "location": self.location,
            "aisle": self.aisle,
            "shelf": self.shelf,
        }


@dataclass
class ShoppingListEntry:
    item: InventoryItem
    quantity: int
    added_at: str

    def to_public_dict(self) -> dict[str, object]:
        data = self.item.to_public_dict()
        data["quantity"] = self.quantity
        data["added_at"] = self.added_at
        return data


@dataclass
class MapRecord:
    token: str
    created_at: str
    items: list[dict[str, object]]
    stops: list[dict[str, object]]
    summary: str

    def to_public_dict(self) -> dict[str, object]:
        return asdict(self)


CATALOG: tuple[InventoryItem, ...] = (
    # IDs must match Next.js products.ts so fallback → add_item flows work
    InventoryItem(
        item_id="df-001",
        name="WholePaws Adult Dog Kibble",
        category="Dog Food",
        location="Aisle 1",
        aisle=1,
        shelf="Top shelf",
        keywords=("dog food", "wholepaws", "chicken", "adult dog", "kibble", "grain-free"),
    ),
    InventoryItem(
        item_id="df-002",
        name="WholePaws Puppy Formula",
        category="Dog Food",
        location="Aisle 1",
        aisle=1,
        shelf="Middle shelf",
        keywords=("dog food", "puppy", "kibble", "dha"),
    ),
    InventoryItem(
        item_id="cf-001",
        name="FelineFeast Indoor Cat Formula",
        category="Cat Food",
        location="Aisle 1",
        aisle=1,
        shelf="Top shelf",
        keywords=("cat food", "indoor", "hairball", "kibble"),
    ),
    InventoryItem(
        item_id="ca-002",
        name="PurrfectScoop Clumping Litter 20lb",
        category="Cat Litter",
        location="Aisle 8",
        aisle=8,
        shelf="Bottom shelf",
        keywords=("cat litter", "clumping", "odor control"),
    ),
    InventoryItem(
        item_id="ff-001",
        name="AquaLife Goldfish Flakes",
        category="Fish Food",
        location="Aisle 1",
        aisle=1,
        shelf="Middle shelf",
        keywords=("fish food", "goldfish", "flakes", "aquarium"),
    ),
    InventoryItem(
        item_id="ff-002",
        name="AquaLife Betta Pellets",
        category="Fish Food",
        location="Aisle 1",
        aisle=1,
        shelf="Middle shelf",
        keywords=("fish food", "betta", "pellets"),
    ),
    InventoryItem(
        item_id="ff-003",
        name="OceanPrime Tropical Flakes",
        category="Fish Food",
        location="Aisle 1",
        aisle=1,
        shelf="Middle shelf",
        keywords=("fish food", "tropical", "flakes", "multi-species"),
    ),
    InventoryItem(
        item_id="dt-001",
        name="ToughChew Rope Toy",
        category="Dog Toys",
        location="Aisle 6",
        aisle=6,
        shelf="Endcap",
        keywords=("dog toy", "rope", "chew", "dental"),
    ),
    InventoryItem(
        item_id="da-001",
        name="ComfortWalk Retractable Leash",
        category="Dog Accessories",
        location="Aisle 8",
        aisle=8,
        shelf="Peg wall",
        keywords=("leash", "dog leash", "retractable"),
    ),
    InventoryItem(
        item_id="dg-001",
        name="SoftCoat Dog Shampoo",
        category="Dog Grooming",
        location="Aisle 7",
        aisle=7,
        shelf="Middle shelf",
        keywords=("dog", "shampoo", "grooming", "oatmeal"),
    ),
)


class LocalInventoryAdapter:
    def __init__(self, items: Iterable[InventoryItem] = CATALOG):
        self._items = tuple(items)
        self._items_by_id = {item.item_id: item for item in self._items}

    def find_item(self, query: str, limit: int = 5) -> list[InventoryItem]:
        normalized = " ".join(query.lower().split())
        if not normalized:
            return []

        scored: list[tuple[float, InventoryItem]] = []
        for item in self._items:
            haystack = item.search_blob()
            score = 0.0

            if normalized == item.name.lower():
                score += 120
            if normalized in haystack:
                score += 70

            for token in normalized.split():
                if token in haystack:
                    score += 18

            score += SequenceMatcher(None, normalized, item.name.lower()).ratio() * 30

            if score >= 35:
                scored.append((score, item))

        scored.sort(key=lambda match: (-match[0], match[1].aisle, match[1].name))
        return [item for _, item in scored[:limit]]

    def get_item(self, item_id: str) -> InventoryItem | None:
        return self._items_by_id.get(item_id)


class SessionState:
    def __init__(self) -> None:
        self.shopping_list: dict[str, ShoppingListEntry] = {}

    def add_item(self, item: InventoryItem, quantity: int = 1) -> ShoppingListEntry:
        now = datetime.now(timezone.utc).isoformat()
        existing = self.shopping_list.get(item.item_id)
        if existing:
            existing.quantity += quantity
            return existing

        entry = ShoppingListEntry(item=item, quantity=quantity, added_at=now)
        self.shopping_list[item.item_id] = entry
        return entry

    def list_items(self) -> list[ShoppingListEntry]:
        return sorted(
            self.shopping_list.values(),
            key=lambda entry: (entry.item.aisle, entry.item.name),
        )

    def item_count(self) -> int:
        return sum(entry.quantity for entry in self.shopping_list.values())


class LocalMapService:
    def build_map_record(self, token: str, entries: list[ShoppingListEntry]) -> MapRecord:
        items = [entry.to_public_dict() for entry in entries]
        stops = []
        for entry in entries:
            stops.append(
                {
                    "item_id": entry.item.item_id,
                    "name": entry.item.name,
                    "quantity": entry.quantity,
                    "location": entry.item.location,
                    "aisle": entry.item.aisle,
                    "shelf": entry.item.shelf,
                }
            )

        summary = f"{len(entries)} stops for {sum(entry.quantity for entry in entries)} items"
        return MapRecord(
            token=token,
            created_at=datetime.now(timezone.utc).isoformat(),
            items=items,
            stops=stops,
            summary=summary,
        )


class MapRegistry:
    def __init__(self) -> None:
        self._records: dict[str, MapRecord] = {}

    def create(self, entries: list[ShoppingListEntry], map_service: LocalMapService) -> MapRecord:
        token = secrets.token_urlsafe(8)
        record = map_service.build_map_record(token, entries)
        self._records[token] = record
        return record

    def get(self, token: str) -> MapRecord | None:
        return self._records.get(token)


def render_map_html(record: MapRecord) -> str:
    stops_markup = "\n".join(
        (
            "<li>"
            f"<strong>{escape(str(stop['name']))}</strong>"
            f" x{escape(str(stop['quantity']))}"
            f" <span>{escape(str(stop['location']))}, {escape(str(stop['shelf']))}</span>"
            "</li>"
        )
        for stop in record.stops
    )

    return f"""<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Pet Store Shopping Map</title>
    <style>
      :root {{
        color-scheme: light;
        --bg: #f8f5ee;
        --panel: #fffdf8;
        --ink: #1f2a1f;
        --muted: #5c6b5c;
        --accent: #2f7d4a;
        --border: #d7decc;
      }}
      body {{
        margin: 0;
        font-family: "Avenir Next", "Trebuchet MS", sans-serif;
        background: radial-gradient(circle at top, #fff8df, var(--bg));
        color: var(--ink);
      }}
      main {{
        max-width: 760px;
        margin: 0 auto;
        padding: 32px 20px 48px;
      }}
      section {{
        background: var(--panel);
        border: 1px solid var(--border);
        border-radius: 18px;
        padding: 24px;
        box-shadow: 0 18px 40px rgba(35, 48, 28, 0.08);
      }}
      h1 {{
        margin-top: 0;
        font-size: 2rem;
      }}
      p {{
        color: var(--muted);
        line-height: 1.5;
      }}
      ol {{
        padding-left: 20px;
      }}
      li {{
        margin: 0 0 12px;
      }}
      li span {{
        display: block;
        color: var(--muted);
      }}
      .meta {{
        margin-top: 20px;
        font-size: 0.95rem;
      }}
      .badge {{
        display: inline-block;
        margin-bottom: 10px;
        padding: 6px 10px;
        border-radius: 999px;
        background: #e3f3e8;
        color: var(--accent);
        font-weight: 700;
        letter-spacing: 0.02em;
      }}
    </style>
  </head>
  <body>
    <main>
      <section>
        <div class="badge">Pet Store Help Kiosk</div>
        <h1>Your shopping map</h1>
        <p>{escape(record.summary)}. Follow the aisle order below for the fastest walk through the store.</p>
        <ol>
          {stops_markup}
        </ol>
        <p class="meta">Map token: {escape(record.token)}<br>Generated: {escape(record.created_at)}</p>
      </section>
    </main>
  </body>
</html>"""


def install_map_routes(app: FastAPI, registry: MapRegistry) -> None:
    if getattr(app.state, "kiosk_routes_installed", False):
        return

    @app.get("/api/maps/{token}")
    async def get_map(token: str) -> dict[str, object]:
        record = registry.get(token)
        if not record:
            raise HTTPException(status_code=404, detail="Map not found")
        return record.to_public_dict()

    @app.get("/maps/{token}", response_class=HTMLResponse)
    async def get_map_page(token: str) -> HTMLResponse:
        record = registry.get(token)
        if not record:
            raise HTTPException(status_code=404, detail="Map not found")
        return HTMLResponse(render_map_html(record))

    app.state.kiosk_routes_installed = True
