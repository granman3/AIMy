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
        matches = self.inventory.find_item("blue buffalo chicken dog food")
        self.assertTrue(matches)
        self.assertEqual(matches[0].item_id, "dog-food-blue-buffalo-chicken")

    def test_find_item_returns_multiple_matches_for_ambiguous_query(self) -> None:
        matches = self.inventory.find_item("dog food")
        self.assertGreaterEqual(len(matches), 2)

    def test_add_item_accumulates_quantity(self) -> None:
        session = SessionState()
        item = self.inventory.get_item("dog-food-blue-buffalo-chicken")
        assert item is not None

        session.add_item(item, quantity=1)
        entry = session.add_item(item, quantity=2)

        self.assertEqual(entry.quantity, 3)
        self.assertEqual(session.item_count(), 3)

    def test_map_registry_round_trip(self) -> None:
        session = SessionState()
        first = self.inventory.get_item("dog-food-blue-buffalo-chicken")
        second = self.inventory.get_item("cat-litter-tidy-cats")
        assert first is not None
        assert second is not None

        session.add_item(second, quantity=1)
        session.add_item(first, quantity=2)

        registry = MapRegistry()
        record = registry.create(session.list_items(), LocalMapService())

        self.assertEqual(registry.get(record.token), record)
        self.assertEqual(record.stops[0]["aisle"], 1)
        self.assertEqual(record.stops[1]["aisle"], 2)


if __name__ == "__main__":
    unittest.main()
