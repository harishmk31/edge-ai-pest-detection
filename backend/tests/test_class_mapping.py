import pytest
from app.data.pest_catalog import (
    IP102_CLASSES,
    get_all_pests,
    get_pest_by_id,
    get_pest_by_name,
    search_pests,
)


def test_ip102_classes_count():
    assert len(IP102_CLASSES) == 102
    assert IP102_CLASSES[0] == "rice leaf roller"
    assert IP102_CLASSES[14] == "grub"
    assert IP102_CLASSES[24] == "aphids"
    assert IP102_CLASSES[101] == "Cicadellidae"


def test_get_pest_by_id():
    entry_0 = get_pest_by_id(0)
    assert entry_0 is not None
    assert entry_0["class_id"] == 0
    assert entry_0["dataset_name"] == "rice leaf roller"
    assert entry_0["common_name"] == "Rice leaf roller"
    assert entry_0["verified"] is True

    # Out of range
    assert get_pest_by_id(-1) is None
    assert get_pest_by_id(102) is None


def test_get_pest_by_name():
    entry = get_pest_by_name("aphids")
    assert entry["class_id"] == 24
    assert "aphid" in entry["common_name"].lower()


def test_get_all_pests():
    pests = get_all_pests()
    assert len(pests) == 102
    for idx, p in enumerate(pests):
        assert p["class_id"] == idx
        assert "dataset_name" in p
        assert "common_name" in p
        assert "group" in p


def test_search_pests():
    results = search_pests("rice")
    assert len(results) > 0
    assert any(p["dataset_name"] == "rice leaf roller" for p in results)

    results_empty = search_pests("nonexistent_alien_bug_xyz")
    assert len(results_empty) == 0
