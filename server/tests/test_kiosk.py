from __future__ import annotations

import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from kiosk import LocalInventoryAdapter, LocalMapService, MapRegistry, SessionState


class KioskTests(unittest.TestCase):
    def setUp(self) -> None:
        self.inventory = LocalInventoryAdapter()

    def test_find_item_returns_exact_match_first(self) -> None:
        matches = self.inventory.find_item("WholePaws Adult Dog Kibble")
        self.assertTrue(matches)
        self.assertEqual(matches[0].item_id, "df-001")

    def test_find_item_returns_multiple_matches_for_ambiguous_query(self) -> None:
        matches = self.inventory.find_item("dog food")
        self.assertGreaterEqual(len(matches), 2)

    def test_add_item_accumulates_quantity(self) -> None:
        session = SessionState()
        item = self.inventory.get_item("df-001")
        assert item is not None

        session.add_item(item, quantity=1)
        entry = session.add_item(item, quantity=2)

        self.assertEqual(entry.quantity, 3)
        self.assertEqual(session.item_count(), 3)

    def test_map_registry_round_trip(self) -> None:
        session = SessionState()
        first = self.inventory.get_item("df-001")
        second = self.inventory.get_item("ca-002")
        assert first is not None
        assert second is not None

        session.add_item(second, quantity=1)
        session.add_item(first, quantity=2)

        registry = MapRegistry()
        record = registry.create(session.list_items(), LocalMapService())

        self.assertEqual(registry.get(record.token), record)
        self.assertEqual(record.stops[0]["aisle"], 1)
        self.assertEqual(record.stops[1]["aisle"], 8)

    def test_public_dict_uses_id_field(self) -> None:
        """Ensure fallback responses use 'id' (not 'item_id') to match Next.js format."""
        item = self.inventory.get_item("ff-001")
        assert item is not None
        d = item.to_public_dict()
        self.assertIn("id", d)
        self.assertNotIn("item_id", d)
        self.assertEqual(d["id"], "ff-001")


if __name__ == "__main__":
    unittest.main()
