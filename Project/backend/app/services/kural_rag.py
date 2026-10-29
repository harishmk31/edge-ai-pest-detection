# -*- coding: utf-8 -*-
"""
AgriVision AI — Kural Agricultural RAG Knowledge Retrieval Service
Retrieves verified IPM guidance and biological metadata from ICAR, TNAU,
and the IP102 benchmark catalog for prompt grounding.
"""

from __future__ import annotations

import re
from typing import Any, Dict, List, Optional, Tuple

from app.data.pest_catalog import IP102_CLASSES, get_all_pests, get_pest_by_name
from app.data.pest_management import get_pest_management_details
from app.schemas.assistant import ChatSource

STOP_WORDS = {
    "a", "an", "the", "in", "on", "at", "to", "for", "of", "and", "or", "is",
    "are", "was", "were", "be", "been", "being", "how", "what", "which", "when",
    "where", "who", "why", "can", "do", "does", "did", "my", "me", "i", "we",
    "you", "your", "tell", "give", "explain", "about", "help", "with", "this",
    "pest", "pests", "insect", "insects", "attack", "crop", "crops", "plant", "plants",
}


class KuralRAGService:
    def __init__(self):
        self._all_pests: List[Dict[str, Any]] = get_all_pests()

    def search_knowledge(
        self,
        query: str,
        explicit_pest: Optional[str] = None,
        top_k: int = 2,
    ) -> Tuple[List[Dict[str, Any]], List[ChatSource]]:
        """
        Retrieve the most relevant pest management profiles and formatted citation sources.
        """
        selected_pests: List[Dict[str, Any]] = []

        # 1. If explicit pest provided, fetch it first
        if explicit_pest:
            explicit_norm = explicit_pest.strip().lower()
            matched_dataset_name: Optional[str] = None
            for p_name in IP102_CLASSES:
                if p_name.lower() == explicit_norm or explicit_norm in p_name.lower():
                    matched_dataset_name = p_name
                    break

            if not matched_dataset_name:
                # Check common names
                for p_meta in self._all_pests:
                    if explicit_norm in p_meta["common_name"].lower():
                        matched_dataset_name = p_meta["dataset_name"]
                        break

            if matched_dataset_name:
                pm = get_pest_management_details(matched_dataset_name)
                selected_pests.append(pm)

        # 2. Tokenize and score query against knowledge base
        tokens = [
            t for t in re.findall(r"\b[a-zA-Z]{3,}\b", query.lower())
            if t not in STOP_WORDS
        ]

        scored_candidates: List[Tuple[float, Dict[str, Any]]] = []
        already_added = {p["pest_name"].lower() for p in selected_pests}

        for p_name in IP102_CLASSES:
            if p_name.lower() in already_added:
                continue

            pm = get_pest_management_details(p_name)
            score = 0.0

            name_lower = pm["common_name"].lower() + " " + p_name.lower()
            crops_str = " ".join(pm.get("crops_affected", [])).lower()
            symp_str = pm.get("symptoms", "").lower()
            desc_str = pm.get("description", "").lower()
            group_str = pm.get("group", "").lower()

            # Exact multi-word matching
            if p_name.lower() in query.lower() or pm["common_name"].lower() in query.lower():
                score += 15.0

            for tok in tokens:
                if tok in name_lower:
                    score += 5.0
                if tok in crops_str:
                    score += 2.0
                if tok in group_str:
                    score += 2.0
                if tok in symp_str:
                    score += 1.5
                if tok in desc_str:
                    score += 1.0

            if score >= 3.0:
                scored_candidates.append((score, pm))

        scored_candidates.sort(key=lambda x: x[0], reverse=True)

        for _, pm in scored_candidates:
            if len(selected_pests) >= top_k:
                break
            selected_pests.append(pm)

        # Build verified citation sources for matched pests only (no default fallback)
        sources: List[ChatSource] = []
        for p in selected_pests:
            sources.append(
                ChatSource(
                    title=f"{p['common_name']} ({p.get('scientific_name') or p['group']})",
                    authority=p.get("source", "ICAR - National Research Centre for IPM & TNAU Agritech Portal"),
                    relevance=f"Affects: {', '.join(p.get('crops_affected', [])[:3])}. Non-chemical IPM and monitoring guidelines.",
                )
            )

        return selected_pests, sources

    def format_context_passage(
        self,
        pests: List[Dict[str, Any]],
        diagnosis_context: Optional[Dict[str, Any]] = None,
    ) -> str:
        """
        Render structured text block for inclusion in the LLM system/user context.
        """
        sections: List[str] = []

        if diagnosis_context:
            sections.append(
                "--- CURRENT USER DIAGNOSIS CONTEXT ---\n"
                f"- Top Pest Identified by YOLO: {diagnosis_context.get('top_pest', 'Unknown')}\n"
                f"- Model Confidence: {diagnosis_context.get('top_confidence', 0.0)}%\n"
                f"- Total Pest Detections: {diagnosis_context.get('total_detections', 1)}\n"
                f"- Diagnosis Timestamp: {diagnosis_context.get('timestamp', 'Recent')}\n"
                "Note: Remind the user that YOLO detections are visual pattern estimates, not official lab diagnoses."
            )

        sections.append("--- VERIFIED AGRICULTURAL KNOWLEDGE (ICAR & TNAU EXTENSION GUIDELINES) ---")

        for idx, p in enumerate(pests, 1):
            ipm = p.get("ipm_recommendations", {})
            crops = ", ".join(p.get("crops_affected", [])) or "Agricultural crops"
            passage = (
                f"[Pest Record #{idx}]\n"
                f"Common Name: {p['common_name']}\n"
                f"Scientific Name: {p.get('scientific_name') or 'Not verified in dataset'}\n"
                f"Group: {p.get('group', 'Agricultural Insect')}\n"
                f"Affected Crops: {crops}\n"
                f"Description: {p.get('description', '')}\n"
                f"Symptoms: {p.get('symptoms', '')}\n"
                f"Life Cycle: {p.get('life_cycle', 'Variable depending on weather')}\n"
                "IPM Practices:\n"
                f"  - Monitoring: {ipm.get('monitoring', 'Scout crops weekly.')}\n"
                f"  - Cultural & Mechanical: {ipm.get('cultural_mechanical', 'Clean weeding and field sanitation.')}\n"
                f"  - Biological & Predators: {ipm.get('biological', 'Conserve spiders, parasitoid wasps, and ladybugs. Use neem.')}\n"
                f"  - Chemical Guidance: {ipm.get('chemical', 'Use only approved chemicals if economic injury threshold is crossed. Adhere strictly to product labels.')}\n"
                f"When to consult expert: {p.get('when_to_consult_expert', 'Consult local agricultural extension officer.')}\n"
                f"Source Authority: {p.get('source', 'ICAR / TNAU Agritech Portal')}"
            )
            sections.append(passage)

        return "\n\n".join(sections)

    def generate_suggested_questions(
        self,
        pests: List[Dict[str, Any]],
        language: str = "en",
    ) -> List[str]:
        """
        Generate contextual question prompt chips based on retrieved pest and language.
        """
        top_pest = pests[0] if pests else None
        if not top_pest:
            if language == "ta":
                return [
                    "பூச்சியைக் கண்டறிய நல்ல புகைப்படம் எடுப்பது எப்படி?",
                    "ஒருங்கிணைந்த பயிர் பாதுகாப்பு (IPM) என்றால் என்ன?",
                    "பயிர்களைப் பாதுகாக்கும் இயற்கை எதிரி பூச்சிகள் யாவை?",
                    "ரசாயனம் இன்றி இயற்கை வழியில் பூச்சிகளை தடுப்பது எப்படி?",
                ]
            elif language == "hi":
                return [
                    "कीट की पहचान के लिए अच्छी फोटो कैसे लें?",
                    "एकीकृत कीट प्रबंधन (IPM) क्या होता है?",
                    "फसलों को बचाने वाले मित्र कीट कौन से हैं?",
                    "बिना रसायन के जैविक तरीके से कीटों की रोकथाम कैसे करें?",
                ]
            else:
                return [
                    "How do I take a good photo for pest diagnosis?",
                    "What is Integrated Pest Management (IPM)?",
                    "What natural predators help protect field crops?",
                    "How do I prevent pest infestations without chemicals?",
                ]

        p_name = top_pest["common_name"]

        if language == "ta":
            return [
                f"{p_name} பற்றி எளிய விளக்கம் தாருங்கள்",
                "இயற்கை / ரசாயனமற்ற கட்டுப்பாட்டு வழிகள் யாவை?",
                "இப்பூச்சியால் பாதிக்கப்படும் பயிர்கள் எவை?",
                "களத்தில் வேட்டையாடும் இயற்கை எதிரிகள் யாவை?",
            ]
        elif language == "hi":
            return [
                f"{p_name} के बारे में सरल व्याख्या दें",
                "जैविक और गैर-रासायनिक रोकथाम के तरीके क्या हैं?",
                "यह कीट किन फसलों को नुकसान पहुंचाता है?",
                "खेत में पाए जाने वाले मित्र कीट कौन से हैं?",
            ]
        else:
            return [
                f"Explain {p_name} in simple terms",
                "What are the non-chemical control options?",
                "Which crops does this pest affect?",
                "What natural predators help control it?",
            ]


kural_rag_service = KuralRAGService()
