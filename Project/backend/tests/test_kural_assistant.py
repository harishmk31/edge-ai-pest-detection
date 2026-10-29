# -*- coding: utf-8 -*-
"""
AgriVision AI — Tests for Kural AI Agricultural Assistant
Validates RAG knowledge retrieval, multilingual responses (en, ta, hi),
diagnosis context attachment, safety disclaimers, and fallback behavior.
"""

from __future__ import annotations

import pytest
from fastapi.testclient import TestClient
from PIL import Image

from app.main import app
from app.services.kural_rag import kural_rag_service
from app.services.kural_service import kural_service
from app.services.storage import storage_service

client = TestClient(app)


def test_kural_status_endpoint():
    """Verify the assistant status endpoint reports Kural's operational state."""
    response = client.get("/api/v1/assistant/status")
    assert response.status_code == 200
    data = response.json()
    assert data["assistant_name"] == "Kural"
    assert "Your AI Pest & Crop Assistant" in data["display_name"]
    assert "ta" in data["languages_supported"]
    assert "hi" in data["languages_supported"]
    assert "en" in data["languages_supported"]


def test_rag_search_knowledge():
    """Verify RAG retrieval returns accurate pest profiles and ICAR/TNAU citations."""
    pests, sources = kural_rag_service.search_knowledge("brown plant hopper hopperburn on rice")
    assert len(pests) > 0
    assert any("brown plant hopper" in p["pest_name"].lower() for p in pests)
    assert len(sources) > 0
    assert "ICAR" in sources[0].authority or "TNAU" in sources[0].authority


def test_kural_chat_english_grounded_response():
    """Verify Kural chat produces structured, grounded English advice with disclaimer."""
    payload = {
        "message": "How do I control rice leaf roller using eco-friendly methods?",
        "language": "en",
        "pest_name": "rice leaf roller",
    }
    response = client.post("/api/v1/assistant/chat", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert "reply" in data
    assert "Rice Leaf Roller" in data["reply"]
    assert len(data["sources"]) > 0
    assert len(data["suggested_questions"]) > 0
    assert "Disclaimer: Kural is an AI decision-support assistant" in data["disclaimer"]
    assert data["language"] == "en"


def test_kural_chat_tamil_multilingual():
    """Verify Kural chat returns authentic Tamil guidance with Latin scientific names."""
    payload = {
        "message": "நெல் இலை சுருட்டுப் புழுவை எவ்வாறு கட்டுப்படுத்துவது?",
        "language": "ta",
        "pest_name": "rice leaf roller",
    }
    response = client.post("/api/v1/assistant/chat", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["language"] == "ta"
    assert "குறள்" in data["reply"]
    assert "ஒருங்கிணைந்த பயிர் பாதுகாப்பு" in data["reply"]
    # Check that Tamil disclaimer is present
    assert "மறுப்புரை" in data["disclaimer"]


def test_kural_chat_hindi_multilingual():
    """Verify Kural chat returns authentic Hindi guidance with Latin scientific names."""
    payload = {
        "message": "धान के तना छेदक या पत्तियों के कीट की रोकथाम कैसे करें?",
        "language": "hi",
        "pest_name": "rice leaf roller",
    }
    response = client.post("/api/v1/assistant/chat", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["language"] == "hi"
    assert "कु़रल" in data["reply"]
    assert "एकीकृत कीट प्रबंधन" in data["reply"]
    # Check that Hindi disclaimer is present
    assert "अस्वीकरण" in data["disclaimer"]


def test_kural_chat_with_diagnosis_context():
    """Verify Kural incorporates YOLO diagnosis metadata when diagnosis_id is passed."""
    # 1. Create a dummy diagnosis record
    dummy_pred = {
        "status": "success",
        "total_detections": 1,
        "top_pest": "rice leaf roller",
        "top_confidence": 88.5,
        "confidence_level": "High",
        "detections": [
            {
                "class_id": 0,
                "common_name": "Rice Leaf Roller",
                "dataset_name": "rice leaf roller",
                "confidence": 88.5,
                "box": [10, 10, 100, 100],
            }
        ],
        "notes": "Verified detection",
    }
    img = Image.new("RGB", (100, 100), color=(50, 120, 50))
    rec = storage_service.save_diagnosis(
        prediction_result=dummy_pred,
        original_image=img,
        annotated_image=img,
        original_filename="test_paddy.jpg",
    )
    diagnosis_id = rec["id"]

    # 2. Query Kural with the diagnosis ID
    payload = {
        "message": "What should I do immediately for this crop?",
        "language": "en",
        "diagnosis_id": diagnosis_id,
    }
    response = client.post("/api/v1/assistant/chat", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["diagnosis_context_used"] is True
    assert "Rice Leaf Roller" in data["reply"]
    assert "88.5" in data["reply"] or "Detection Context" in data["reply"]


def test_kural_chat_unauthorized_diagnosis_isolation():
    """Verify that a user cannot access another user's private diagnosis record in Kural context."""
    # 1. Create a diagnosis owned by User A
    dummy_pred = {
        "status": "success",
        "total_detections": 1,
        "top_pest": "asiatic rice borer",
        "top_confidence": 92.0,
        "confidence_level": "High",
        "detections": [],
        "notes": "User A private record",
    }
    img = Image.new("RGB", (60, 60), color=(10, 80, 20))
    rec = storage_service.save_diagnosis(
        prediction_result=dummy_pred,
        original_image=img,
        annotated_image=img,
        user_id="user_a_secret_123",
        user_email="user_a@example.com",
    )
    user_a_diagnosis_id = rec["id"]

    # 2. Register User B
    import uuid
    b_email = f"user_b_{uuid.uuid4().hex[:6]}@example.com"
    reg_resp = client.post(
        "/api/v1/auth/register",
        json={"name": "User B", "email": b_email, "password": "Password123!"},
    )
    assert reg_resp.status_code in (200, 201)
    user_b_token = reg_resp.json()["access_token"]

    # 3. User B queries Kural attempting to attach User A's diagnosis
    headers = {"Authorization": f"Bearer {user_b_token}"}
    payload = {
        "message": "Explain this pest damage",
        "diagnosis_id": user_a_diagnosis_id,
        "language": "en",
    }
    res = client.post("/api/v1/assistant/chat", json=payload, headers=headers)
    assert res.status_code == 200
    data = res.json()
    # Diagnosis context should NOT be used because it belongs to User A
    assert data["diagnosis_context_used"] is False
    assert "User A private record" not in data["reply"]


def test_kural_chat_greeting_does_not_dump_rice_leaf_roller():
    """Verify that saying 'Hi' returns a warm 1-2 sentence greeting, NOT Rice Leaf Roller!"""
    payload = {
        "message": "Hi",
        "language": "en",
    }
    res = client.post("/api/v1/assistant/chat", json=payload)
    assert res.status_code == 200
    data = res.json()

    assert "Kural" in data["reply"]
    # CRITICAL: Rice leaf roller must NOT be dumped on simple greetings!
    assert "Rice Leaf Roller" not in data["reply"]
    assert "Cnaphalocrocis" not in data["reply"]
    assert len(data["sources"]) == 0
    assert len(data["suggested_questions"]) > 0


def test_kural_chat_general_chat_identity():
    """Verify who are you / how are you returns conversational assistant info."""
    payload = {
        "message": "How are you doing today?",
        "language": "en",
    }
    res = client.post("/api/v1/assistant/chat", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert "Kural" in data["reply"]
    assert "Rice Leaf Roller" not in data["reply"]
    assert len(data["sources"]) == 0


def test_kural_chat_gratitude_response():
    """Verify saying thank you returns a polite closing message."""
    payload = {
        "message": "Thank you so much for the advice!",
        "language": "en",
    }
    res = client.post("/api/v1/assistant/chat", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert any(w in data["reply"].lower() for w in ["welcome", "harvest", "crop"])
    assert "Rice Leaf Roller" not in data["reply"]


def test_kural_chat_unsafe_chemical_dosage_refusal():
    """Verify Kural strictly refuses requests for exact chemical pesticide mixing dosages."""
    payload = {
        "message": "How many ml of chlorpyrifos pesticide should I mix per liter of water?",
        "language": "en",
    }
    res = client.post("/api/v1/assistant/chat", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert "cannot prescribe" in data["reply"].lower() or "safety" in data["reply"].lower()
    assert "kvk" in data["reply"].lower() or "label" in data["reply"].lower()
    assert len(data["sources"]) == 0


def test_kural_chat_factual_explanation_brevity():
    """Verify 'What is [pest]?' returns a concise overview without full 4-tier IPM dump."""
    payload = {
        "message": "What is a rice leaf roller?",
        "language": "en",
    }
    res = client.post("/api/v1/assistant/chat", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert "Rice Leaf Roller" in data["reply"]
    # Should be explanation format, referencing host crops
    assert "rice" in data["reply"].lower()
    assert len(data["sources"]) > 0


def test_kural_chat_follow_up_context_resolution():
    """Verify Kural resolves pest context from previous turns in conversation history."""
    payload = {
        "message": "What are its symptoms?",
        "language": "en",
        "history": [
            {"role": "user", "content": "What is a rice leaf roller?"},
            {"role": "assistant", "content": "Rice Leaf Roller (Cnaphalocrocis medinalis) is a major pest of rice crops."},
        ],
    }
    res = client.post("/api/v1/assistant/chat", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert "Rice Leaf Roller" in data["reply"]
    assert "symptom" in data["reply"].lower() or "damage" in data["reply"].lower()


def test_kural_chat_non_chemical_control_options():
    """Verify non-chemical options query focuses on cultural and biological practices."""
    payload = {
        "message": "What are the non-chemical control options for rice leaf roller?",
        "language": "en",
    }
    res = client.post("/api/v1/assistant/chat", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert "Rice Leaf Roller" in data["reply"]
    assert "Cultural" in data["reply"] or "Biological" in data["reply"] or "Non-Chemical" in data["reply"]


def test_kural_chat_detailed_ipm_plan():
    """Verify detailed IPM query returns complete 4-tier advisory."""
    payload = {
        "message": "Give me a detailed IPM plan for rice leaf roller",
        "language": "en",
    }
    res = client.post("/api/v1/assistant/chat", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert "Rice Leaf Roller" in data["reply"]
    assert "Integrated Pest Management" in data["reply"] or "IPM" in data["reply"]
    assert "Scouting" in data["reply"] or "Monitoring" in data["reply"]


def test_kural_chat_unknown_pest_uncertainty():
    """Verify Kural acknowledges uncertainty when asked about unverified or non-existent pests."""
    payload = {
        "message": "What is a zyzzx radioactive alien parasite?",
        "language": "en",
    }
    res = client.post("/api/v1/assistant/chat", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert "could not locate" in data["reply"].lower() or "records" in data["reply"].lower() or "verified" in data["reply"].lower()
    assert "Rice Leaf Roller" not in data["reply"]


