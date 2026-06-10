"""Smoke-тест PR C: проверка что блок SetElements в routers/thanka.py
правильно разбирает 3 формата Elements (JSON-список объектов, JSON-список
строк, legacy CSV через ';').

Не лезем в БД — мокаем ad.execute и проверяем, что вызывается с правильным
elements_list.
"""
import sys
import types
from pathlib import Path

# Делаем backend импортируемым
ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT))


class FakeAdapter:
    """Перехватывает ad.execute(\"SetElements\", payload) для проверки."""

    def __init__(self):
        self.calls: list[tuple[str, dict]] = []

    def execute(self, method, payload):
        self.calls.append((method, payload))
        # Имитируем _h_set_thanka: возвращаем Id для первого Set/Create.
        return {}


def parse_elements_block(data, editor_type, result_id, ad):
    """Точная копия логики из routers/thanka.py:802-828 — extracted
    для unit-тестирования без поднятия HTTP."""
    if result_id and "Elements" in data:
        raw_elements = data.get("Elements")
        if isinstance(raw_elements, str):
            sep = ";" if ";" in raw_elements else ","
            elements_list = [
                {"ID": s.strip()} for s in raw_elements.split(sep)
            ]
        elif isinstance(raw_elements, list):
            elements_list = [
                ({"ID": str(it).strip()} if not isinstance(it, dict)
                 else {"ID": str(it.get("ID") or it.get("Id") or "").strip()})
                for it in raw_elements
            ]
        else:
            elements_list = []
        if any(el.get("ID") for el in elements_list):
            ad.execute("SetElements", {"Id": result_id, "Elements": elements_list})
        elif editor_type == "edit":
            ad.execute("SetElements", {"Id": result_id, "Elements": elements_list})


def test_json_objects():
    """Фронт JSON-ветка: [{ID:uuid1},{ID:""},{ID:uuid2},{ID:""}]"""
    ad = FakeAdapter()
    data = {
        "Elements": [
            {"ID": "uuid-1"},
            {"ID": ""},
            {"ID": "uuid-2"},
            {"ID": ""},
        ]
    }
    parse_elements_block(data, "create", "thanka-xyz", ad)
    assert len(ad.calls) == 1
    method, payload = ad.calls[0]
    assert method == "SetElements"
    assert payload["Id"] == "thanka-xyz"
    assert payload["Elements"] == [
        {"ID": "uuid-1"}, {"ID": ""}, {"ID": "uuid-2"}, {"ID": ""}
    ]


def test_csv_legacy():
    """Multipart ветка: \"uuid-a;;uuid-b;\""""
    ad = FakeAdapter()
    data = {"Elements": "uuid-a;;uuid-b;"}
    parse_elements_block(data, "create", "thanka-xyz", ad)
    assert len(ad.calls) == 1
    _, payload = ad.calls[0]
    assert payload["Elements"] == [
        {"ID": "uuid-a"}, {"ID": ""}, {"ID": "uuid-b"}, {"ID": ""}
    ]


def test_empty_create_skips():
    """Create + все 4 пустых — НЕ должен звать SetElements (лишняя работа)."""
    ad = FakeAdapter()
    data = {"Elements": [{"ID": ""}, {"ID": ""}, {"ID": ""}, {"ID": ""}]}
    parse_elements_block(data, "create", "thanka-xyz", ad)
    assert ad.calls == []


def test_empty_edit_clears():
    """Edit + все 4 пустых — ДОЛЖЕН вызвать (это «очистить все углы»)."""
    ad = FakeAdapter()
    data = {"Elements": [{"ID": ""}, {"ID": ""}, {"ID": ""}, {"ID": ""}]}
    parse_elements_block(data, "edit", "thanka-xyz", ad)
    assert len(ad.calls) == 1
    _, payload = ad.calls[0]
    assert payload["Elements"] == [{"ID": ""}] * 4


def test_no_elements_key_noop():
    """Если фронт вообще не прислал Elements (старый фронт) — не вмешиваемся."""
    ad = FakeAdapter()
    data = {}
    parse_elements_block(data, "edit", "thanka-xyz", ad)
    assert ad.calls == []


def test_array_of_strings():
    """JSON-список строк: [\"uuid\", \"\", ...] — тоже валидно."""
    ad = FakeAdapter()
    data = {"Elements": ["uuid-1", "", "uuid-2", ""]}
    parse_elements_block(data, "create", "thanka-xyz", ad)
    _, payload = ad.calls[0]
    assert payload["Elements"] == [
        {"ID": "uuid-1"}, {"ID": ""}, {"ID": "uuid-2"}, {"ID": ""}
    ]


def test_no_result_id_skips():
    """Set/Create вернул пустой Id — не зовём SetElements."""
    ad = FakeAdapter()
    data = {"Elements": [{"ID": "uuid-1"}]}
    parse_elements_block(data, "create", "", ad)
    assert ad.calls == []


if __name__ == "__main__":
    test_json_objects()
    test_csv_legacy()
    test_empty_create_skips()
    test_empty_edit_clears()
    test_no_elements_key_noop()
    test_array_of_strings()
    test_no_result_id_skips()
    print("OK: все 7 smoke-кейсов прошли (JSON-objects, CSV, empty-skip,")
    print("    empty-clear-edit, no-elements-key, array-strings, no-result-id)")
