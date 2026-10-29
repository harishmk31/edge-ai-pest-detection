# -*- coding: utf-8 -*-
"""
AgriVision AI — Kural AI Agricultural Assistant Service
Integrates local ICAR/TNAU RAG retrieval with OpenAI LLM generation,
featuring full multilingual support (en, ta, hi), natural intent handling
(greetings, general chat, gratitude, pest queries, follow-ups, unsafe chemical refusal),
safety guardrails, and zero-crash local catalog fallback.
"""

from __future__ import annotations

import logging
import re
import time
from typing import Any, Dict, List, Optional, Tuple

from app.core.config import settings
from app.data.pest_catalog import IP102_CLASSES, get_all_pests
from app.schemas.assistant import ChatMessage, ChatRequest, ChatResponse, ChatSource
from app.services.kural_rag import kural_rag_service
from app.services.storage import storage_service

logger = logging.getLogger("agrivision.kural")

MANDATORY_DISCLAIMERS = {
    "en": (
        "Disclaimer: Kural is an AI decision-support assistant and not a certified agronomist or government official. "
        "AI detections are visual pattern approximations. Always confirm critical crop protection measures with your "
        "local Krishi Vigyan Kendra (KVK) or agricultural extension officer before applying chemical interventions."
    ),
    "ta": (
        "மறுப்புரை: குறள் என்பது ஒரு AI முடிவெடுக்கும் வழிகாட்டி மட்டுமே; சான்றளிக்கப்பட்ட வேளாண் விஞ்ஞானி அல்ல. "
        "AI கண்டறிதல்கள் காட்சி மாதிரி மதிப்பீடுகளே. ரசாயனப் பூச்சிக்கொல்லிகளைப் பயன்படுத்துவதற்கு முன் உங்கள் பகுதி "
        "வேளாண் விரிவாக்க அலுவலர் அல்லது கிருஷி விஞ்ஞான் கேந்திராவை (KVK) அணுகி உறுதிப்படுத்தவும்."
    ),
    "hi": (
        "अस्वीकरण: 'कु़रल' एक AI निर्णय-सहायता प्रणाली है, प्रमाणित कृषि वैज्ञानिक या सरकारी अधिकारी नहीं। "
        "AI पहचान केवल दृश्य पैटर्न पर आधारित अनुमान है। किसी भी रासायनिक कीटनाशक के प्रयोग से पहले अपने स्थानीय "
        "कृषि विज्ञान केंद्र (KVK) या कृषि अधिकारी से परामर्श अवश्य लें।"
    ),
}

SYSTEM_PROMPT = """You are Kural ("குறள்"), the friendly, knowledgeable, and scientifically grounded AI Agricultural Assistant on AgriVision AI.
Your mission is to assist farmers, agricultural students, and field scouts with pest diagnosis, Integrated Pest Management (IPM), and crop health.

CORE PRINCIPLES & GUIDELINES:
1. Identity: You are Kural. You are an AI decision-support tool, NOT a certified agronomist, plant doctor, or government official.
2. Scientific Grounding: Base your advice strictly on verified agricultural knowledge (sourced from ICAR - Indian Council of Agricultural Research and TNAU - Tamil Nadu Agricultural University Agritech Portal).
3. Intent & Conciseness Guidelines:
   - GREETING: If the user says hello, hi, vanakkam, namaste, respond with a warm, friendly 1-2 sentence greeting introducing yourself and asking how you can assist their crop or pest inquiry today. DO NOT provide unsolicited pest reports or dump Rice Leaf Roller information.
   - GENERAL CHAT / IDENTITY: If the user asks who you are or how you are, reply politely in 1-2 sentences.
   - GRATITUDE: If the user thanks you, reply warmly with an encouraging agricultural wish.
   - FACTUAL OVERVIEW: If the user asks "What is [pest]?", provide a concise 1-paragraph overview with key affected crops. DO NOT dump the full 4-tier IPM advisory unless the user specifically asks for control or management.
   - FOLLOW-UP RESOLUTION: When the user asks follow-up questions (e.g., "What are its symptoms?", "What are the non-chemical control options?", "Explain it in Tamil"), resolve the pest from conversation history.
   - DETAILED IPM: Provide the full 4-tier IPM plan (Scouting, Cultural/Mechanical, Biological, Cautious Chemical) only when the user requests management, control, or an IPM plan.
4. Strict Chemical Safety: Never fabricate pesticide brand dosages, tank-mix ratios, or hazardous chemical recipes. Refuse specific dosage requests and direct the user to statutory product labels and local KVK/extension officers.
5. Diagnosis Context: If the user has a YOLO detection attached (with pest name and confidence %), acknowledge the visual detection while emphasizing field verification.
6. Language:
   - If language is 'ta', write natural, accessible Tamil prose while keeping Latin scientific names in English/Latin (e.g., *Cnaphalocrocis medinalis*).
   - If language is 'hi', write natural, accessible Hindi prose while keeping Latin scientific names in English/Latin.
   - If language is 'en', write clear, friendly, structured English.
7. Format: Use clean markdown with bold section headings, bullet points, and concise actionable steps.
"""


class KuralAssistantService:
    def __init__(self):
        self._openai_client = None
        self._all_pests_cache: List[Dict[str, Any]] = get_all_pests()
        self._init_client()

    def _init_client(self):
        if settings.OPENAI_API_KEY and settings.OPENAI_API_KEY.strip():
            try:
                import openai
                kwargs: Dict[str, Any] = {"api_key": settings.OPENAI_API_KEY.strip()}
                if settings.OPENAI_BASE_URL:
                    kwargs["base_url"] = settings.OPENAI_BASE_URL
                self._openai_client = openai.OpenAI(**kwargs)
                logger.info(f"OpenAI client initialized for Kural with model {settings.OPENAI_MODEL}")
            except Exception as exc:
                logger.warning(f"Could not initialize OpenAI client: {exc}")
                self._openai_client = None
        else:
            self._openai_client = None

    # -------------------------------------------------------------------------
    # Intent Detection and Context Resolution
    # -------------------------------------------------------------------------

    def _detect_intent(self, message: str) -> str:
        """
        Classify conversational intent:
        'greeting', 'general_chat', 'gratitude', 'unsafe_dosage',
        'symptoms', 'non_chemical', 'full_ipm', 'explanation', or 'general'
        """
        msg_clean = message.strip().lower()

        # 1. Chemical dosage inquiry (SAFETY FIRST)
        unsafe_dosage_patterns = [
            r"\b(how much|how many|dosage|dose|quantity|concentration|tank mix|mix ratio|spray rate|per liter|per litre|per acre|per hectare|ml/l|ml per|gm per|kg per)\b.*\b(pesticide|chemical|insecticide|fungicide|spray|chlorpyrifos|monocrotophos|malathion|neem|powder|solution)\b",
            r"\b(dosage|dose|quantity|amount)\s+of\s+(pesticide|chemical|insecticide|chlorpyrifos|monocrotophos|malathion)",
            r"\b(how much|how many)\s+(ml|gm|gram|liter|litre|spray|pesticide|chemical)",
            r"(ரசாயன\s*அளவு|மருந்தின்\s*அளவு|எவ்வளவு\s*அளவு|தெளிக்கும்\s*அளவு|கலவை\s*அளவு|பூச்சிக்கொல்லி\s*அளவு)",
            r"(कीटनाशक\s*की\s*मात्रा|दवा\s*की\s*मात्रा|कितनी\s*मात्रा|स्प्रे\s*का\s*डोज|घोल\s*का\s*अनुपात)",
        ]
        for pat in unsafe_dosage_patterns:
            if re.search(pat, msg_clean):
                return "unsafe_dosage"

        # 2. Pure Greetings
        greeting_tokens = [
            "hi", "hello", "hey", "good morning", "good afternoon", "good evening",
            "greetings", "howdy", "vanakkam", "namaste", "namaskar", "pranam",
            "வணக்கம்", "வணக்கங்க", "ஹலோ", "ஹாய்", "नमस्ते", "नमस्कार", "प्रणाम", "हेलो", "हाय"
        ]
        # Check if the message is essentially just a greeting
        cleaned_words = re.findall(r"[\w]+", msg_clean)
        if len(cleaned_words) <= 4:
            for g in greeting_tokens:
                if g in msg_clean:
                    return "greeting"

        # 3. General Chat / Identity
        chat_patterns = [
            r"\b(how are you|who are you|what is your name|what can you do|what are you|tell me about yourself)\b",
            r"(எப்படி\s*இருக்கீங்க|நீ\s*யார்|உன்\s*பெயர்\s*என்ன|நீ\s*என்ன\s*செய்வாய்)",
            r"(आप\s*कैसे\s*हैं|आप\s*कौन\s*हैं|तुम्हारा\s*नाम\s*क्या\s*है|तुम\s*क्या\s*कर\s*सकते\s*हो)",
        ]
        for pat in chat_patterns:
            if re.search(pat, msg_clean):
                return "general_chat"

        # 4. Gratitude / Closure
        gratitude_patterns = [
            r"\b(thank you|thanks|thanks a lot|thank you so much|thx)\b",
            r"(நன்றி|மிக்க\s*நன்றி|ரொம்ப\s*நன்றி|சரி\s*நன்றி)",
            r"(धन्यवाद|बहुत\s*बहुत\s*धन्यवाद|शुक्रिया)",
        ]
        for pat in gratitude_patterns:
            if re.search(pat, msg_clean):
                return "gratitude"

        # 5. Non-chemical / biological / cultural query
        non_chem_patterns = [
            r"\b(non-chemical|non chemical|without chemical|organic|natural|biological|predator|parasitoid|cultural|botanical|neem)\b",
            r"(ரசாயனம்\s*இன்றி|இயற்கை|உயிரியல்|வேப்ப|வேட்டையாடும்)",
            r"(बिना\s*रसायन|जैविक|प्राकृतिक|मित्र\s*कीट|नीम)",
        ]
        for pat in non_chem_patterns:
            if re.search(pat, msg_clean):
                return "non_chemical"

        # 6. Symptoms query
        symptoms_patterns = [
            r"\b(symptom|symptoms|damage|sign|signs|look like|how does it damage|infestation)\b",
            r"(அறிகுறி|பாதிப்பு|சேதம்|அடையாளம்)",
            r"(लक्षण|पहचान|नुकसान|क्षति)",
        ]
        for pat in symptoms_patterns:
            if re.search(pat, msg_clean):
                return "symptoms"

        # 7. Full IPM / Management Plan
        ipm_patterns = [
            r"\b(detailed ipm|ipm plan|management plan|how to manage|how to control|control measure|control measures|action plan|complete ipm)\b",
            r"(மேலாண்மை|கட்டுப்படுத்துவது|ஒருங்கிணைந்த\s*பயிர்\s*பாதுகாப்பு|திட்டம்)",
            r"(प्रबंधन|रोकथाम|नियंत्रण|कार्य\s*योजना)",
        ]
        for pat in ipm_patterns:
            if re.search(pat, msg_clean):
                return "full_ipm"

        # 8. Factual Explanation
        explanation_patterns = [
            r"\b(what is|what are|tell me about|explain|describe|who is)\b",
            r"(பற்றி\s*விளக்க|விளக்கம்|என்றால்\s*என்ன)",
            r"(के\s*बारे\s*में\s*बताएं|क्या\s*है|व्याख्या)",
        ]
        for pat in explanation_patterns:
            if re.search(pat, msg_clean):
                return "explanation"

        return "general"

    def _resolve_target_pest(
        self,
        message: str,
        explicit_pest: Optional[str],
        diagnosis_context: Optional[Dict[str, Any]],
        history: List[ChatMessage],
    ) -> Optional[str]:
        """
        Resolve the target pest from:
        1. Explicit request parameter
        2. Attached diagnosis context
        3. Name mentioned directly in the current message
        4. Prior conversation history (for follow-up questions)
        """
        # 1. Explicit pest
        if explicit_pest and explicit_pest.strip():
            return explicit_pest.strip()

        # 2. Direct match in current message
        msg_lower = message.lower()
        for p_name in IP102_CLASSES:
            if p_name.lower() in msg_lower:
                return p_name
        for p_meta in self._all_pests_cache:
            if p_meta["common_name"].lower() in msg_lower:
                return p_meta["dataset_name"]

        # 3. Diagnosis context
        if diagnosis_context and diagnosis_context.get("top_pest"):
            return diagnosis_context.get("top_pest")

        # 4. Check conversation history (most recent first) for prior pest reference
        follow_up_tokens = [
            "it", "its", "this", "these", "pest", "insect", "bug", "symptom", "control",
            "crops", "non-chemical", "tamil", "hindi", "explain", "details",
            "அறிகுறி", "கட்டுப்பாடு", "விளக்கம்", "लक्षण", "रोकथाम", "व्याख्या"
        ]
        is_follow_up = any(tok in msg_lower for tok in follow_up_tokens)

        if is_follow_up and history:
            for past_msg in reversed(history):
                past_text = past_msg.content.lower()
                for p_name in IP102_CLASSES:
                    if p_name.lower() in past_text:
                        return p_name
                for p_meta in self._all_pests_cache:
                    if p_meta["common_name"].lower() in past_text:
                        return p_meta["dataset_name"]

        return None

    # -------------------------------------------------------------------------
    # Main Chat Pipeline
    # -------------------------------------------------------------------------

    def process_chat(
        self,
        request: ChatRequest,
        current_user: Optional[Dict[str, Any]] = None,
    ) -> ChatResponse:
        start_time = time.time()
        lang = request.language if request.language in ("en", "ta", "hi") else "en"
        disclaimer = MANDATORY_DISCLAIMERS.get(lang, MANDATORY_DISCLAIMERS["en"])

        # 1. Inspect diagnosis context if provided
        diagnosis_context: Optional[Dict[str, Any]] = None
        diagnosis_context_used = False

        if request.diagnosis_id:
            user_id = current_user.get("id") if current_user else None
            record = storage_service.get_diagnosis_by_id(request.diagnosis_id, user_id=user_id)
            if record:
                diagnosis_context = record
                diagnosis_context_used = True

        # 2. Detect Intent & Resolve Pest Context
        intent = self._detect_intent(request.message)
        target_pest_name = self._resolve_target_pest(
            message=request.message,
            explicit_pest=request.pest_name,
            diagnosis_context=diagnosis_context,
            history=request.history,
        )

        reply_text: Optional[str] = None
        sources: List[ChatSource] = []
        suggested_questions: List[str] = []
        model_used = "local-rag"

        # 3. High-Priority Conversational / Safety Handling
        if intent == "unsafe_dosage":
            reply_text = self._synthesize_unsafe_dosage_refusal(lang)
            sources = []
            suggested_questions = kural_rag_service.generate_suggested_questions([], language=lang)
            model_used = "kural-safety-guardrail"

        elif intent == "greeting":
            reply_text = self._synthesize_greeting(lang)
            sources = []
            suggested_questions = kural_rag_service.generate_suggested_questions([], language=lang)
            model_used = "kural-conversational"

        elif intent == "general_chat":
            reply_text = self._synthesize_general_chat(lang)
            sources = []
            suggested_questions = kural_rag_service.generate_suggested_questions([], language=lang)
            model_used = "kural-conversational"

        elif intent == "gratitude":
            reply_text = self._synthesize_gratitude(lang)
            sources = []
            suggested_questions = kural_rag_service.generate_suggested_questions([], language=lang)
            model_used = "kural-conversational"

        else:
            # Pest or Agricultural Inquiry
            pests, retrieved_sources = kural_rag_service.search_knowledge(
                query=request.message,
                explicit_pest=target_pest_name,
                top_k=2,
            )
            sources = retrieved_sources
            suggested_questions = kural_rag_service.generate_suggested_questions(pests, language=lang)

            # Check / re-init OpenAI client if configured
            if self._openai_client is None and settings.OPENAI_API_KEY:
                self._init_client()

            if self._openai_client and (pests or diagnosis_context):
                try:
                    context_passage = kural_rag_service.format_context_passage(pests, diagnosis_context)
                    messages = [
                        {"role": "system", "content": f"{SYSTEM_PROMPT}\n\nLanguage: {lang}\nIntent Detected: {intent}\n\n{context_passage}"}
                    ]
                    for msg in request.history[-6:]:
                        messages.append({"role": msg.role, "content": msg.content})
                    messages.append({"role": "user", "content": request.message})

                    response = self._openai_client.chat.completions.create(
                        model=settings.OPENAI_MODEL,
                        messages=messages,
                        max_tokens=settings.ASSISTANT_MAX_TOKENS,
                        temperature=settings.ASSISTANT_TEMPERATURE,
                    )
                    choice = response.choices[0]
                    if choice.message and choice.message.content:
                        reply_text = choice.message.content.strip()
                        model_used = settings.OPENAI_MODEL
                except Exception as exc:
                    logger.warning(f"OpenAI completion failed for Kural ({exc}). Falling back to targeted local synthesis.")

            # Fallback to targeted grounded local RAG synthesis
            if not reply_text:
                reply_text = self._synthesize_targeted_local_reply(
                    message=request.message,
                    intent=intent,
                    pests=pests,
                    diagnosis_context=diagnosis_context,
                    language=lang,
                )
                model_used = "local-rag-catalog"

        exec_time = round((time.time() - start_time) * 1000, 2)

        return ChatResponse(
            reply=reply_text,
            sources=sources,
            suggested_questions=suggested_questions,
            disclaimer=disclaimer,
            language=lang,
            diagnosis_context_used=diagnosis_context_used,
            model_used=model_used,
            execution_time_ms=exec_time,
        )

    # -------------------------------------------------------------------------
    # Targeted Local Synthesis Handlers
    # -------------------------------------------------------------------------

    def _synthesize_greeting(self, language: str) -> str:
        if language == "ta":
            return (
                "வணக்கம்! 👋 நான் **குறள்**, உங்கள் வேளாண் AI உதவியாளர்.\n\n"
                "பயிர் நலம், பூச்சி அடையாளம் அல்லது இயற்கை பூச்சி மேலாண்மை (IPM) ஆலோசனைகளில் உங்களுக்கு இன்று நான் எவ்வாறு உதவட்டும்?"
            )
        elif language == "hi":
            return (
                "नमस्ते! 👋 मैं **'कु़रल'** हूँ, आपका कृषि AI सहायक।\n\n"
                "आज मैं आपकी फसलों की सुरक्षा, कीट पहचान या एकीकृत कीट प्रबंधन (IPM) में किस प्रकार सहायता कर सकता हूँ?"
            )
        else:
            return (
                "Hello! 👋 I am **Kural**, your AI Agricultural Assistant.\n\n"
                "How can I assist you with pest identification, crop health, or Integrated Pest Management (IPM) today?"
            )

    def _synthesize_general_chat(self, language: str) -> str:
        if language == "ta":
            return (
                "நான் நலமாக உள்ளேன், நன்றி! 🌱 நான் அக்ரிவிஷன் AI இன் வேளாண் உதவியாளர் 'குறள்'. "
                "பயிர்களில் தாக்கும் பூச்சிகளை அடையாளம் காணவும், இயற்கை IPM முறைகளை வழிகாட்டவும் பயிற்சி பெற்றுள்ளேன்."
            )
        elif language == "hi":
            return (
                "मैं बढ़िया हूँ, धन्यवाद! 🌱 मैं एग्रीविज़न AI का कृषि सहायक 'कु़रल' हूँ। "
                "मेरा मुख्य कार्य किसानों और कृषि छात्रों को कीट पहचान और सुरक्षित IPM प्रबंधन में सहायता प्रदान करना है।"
            )
        else:
            return (
                "I'm doing well, thank you! 🌱 I am Kural, the dedicated AI Agricultural Assistant on AgriVision AI. "
                "I can help you identify crop pests, understand damage symptoms, and implement scientifically grounded Integrated Pest Management (IPM) practices."
            )

    def _synthesize_gratitude(self, language: str) -> str:
        if language == "ta":
            return (
                "மகிழ்ச்சி! 🌱 உங்கள் பயிர்கள் செழித்து வளரவும், நல்ல விளைச்சல் பெறவும் வாழ்த்துகள். "
                "வேளாண் அல்லது பூச்சி மேலாண்மை சார்ந்த எந்தவொரு கேள்விக்கும் எப்போது வேண்டுமானாலும் கேளுங்கள்!"
            )
        elif language == "hi":
            return (
                "आपका बहुत-बहुत स्वागत है! 🌱 आपकी फसलें सदैव स्वस्थ रहें और उत्तम उपज प्राप्त हो। "
                "कीट या फसल सुरक्षा से जुड़े किसी भी प्रश्न के लिए कभी भी संपर्क करें!"
            )
        else:
            return (
                "You're very welcome! 🌱 Wishing you a healthy crop and a bountiful harvest. "
                "Feel free to ask anytime you need pest identification or field management guidance!"
            )

    def _synthesize_unsafe_dosage_refusal(self, language: str) -> str:
        if language == "ta":
            return (
                "⚠️ **ரசாயன மருந்தளவு பாதுகாப்பு வழிகாட்டுதல்:**\n\n"
                "சுற்றுச்சூழல் பாதுகாப்பு, பயிர் நலம் மற்றும் சட்ட விதிகளின்படி, குறிப்பிட்ட ரசாயனப் பூச்சிக்கொல்லி அளவுகளையோ (ml/L அல்லது கிராம்) அல்லது மருந்து கலவை விகிதங்களையோ நான் பரிந்துரைக்க முடியாது.\n\n"
                "**ஏன்?**\n"
                "- மருந்தளவு என்பது பயிரின் வளர்ச்சி நிலை, பூச்சியின் தீவிர நிலை மற்றும் அரசால் அங்கீகரிக்கப்பட்ட தயாரிப்புக்கு ஏற்ப மாறுபடும்.\n"
                "- தவறான மருந்தளவு பயிரைக் கரிக்கவோ அல்லது பூச்சிகளுக்கு எதிர்ப்புத் திறனை உருவாக்கவோ கூடும்.\n\n"
                "👉 **பாதுகாப்பான நடைமுறை:**\n"
                "1. அங்கீகரிக்கப்பட்ட பூச்சிக்கொல்லி பாட்டிலில் உள்ள **அரசு முத்திரை விவரக் குறிப்பை (Leaflet/Label)** கண்டிப்பாகப் படித்துப் பின்பற்றவும்.\n"
                "2. சரியான அளவு மற்றும் பரிந்துரைக்கு உங்கள் பகுதி **வேளாண் விரிவாக்க அலுவலர்** அல்லது **கிருஷி விஞ்ஞான் கேந்திரா (KVK)** விஞ்ஞானிகளை அணுகவும்."
            )
        elif language == "hi":
            return (
                "⚠️ **रासायनिक कीटनाशक मात्रा सुरक्षा परामर्श:**\n\n"
                "पर्यावरण सुरक्षा, फसल स्वास्थ्य और वैधानिक नियमों के तहत, मैं किसी भी रासायनिक कीटनाशक की निश्चित खुराक (ml/लीटर या ग्राम) या मिश्रण का अनुपात नहीं बता सकता।\n\n"
                "**कारण:**\n"
                "- कीटनाशक की सही मात्रा फसल की अवस्था, कीट के प्रकोप की तीव्रता और **केंद्रीय कीटनाशक बोर्ड (CIBRC)** द्वारा पंजीकृत फॉर्मूलेशन पर निर्भर करती है।\n"
                "- अनुचित मात्रा से फसल जल सकती है अथवा कीटों में प्रतिरोधक क्षमता विकसित हो सकती है।\n\n"
                "👉 **सुरक्षित मार्गदर्शन:**\n"
                "1. हमेशा उत्पाद के साथ मिलने वाले **वैधानिक लेबल और लीफलेट** पर दिए गए निर्देशों का ही पालन करें।\n"
                "2. सटीक खुराक के लिए अपने स्थानीय **कृषि विज्ञान केंद्र (KVK)** या ब्लॉक कृषि अधिकारी से तुरंत संपर्क करें।"
            )
        else:
            return (
                "⚠️ **Safety Advisory on Chemical Dosages:**\n\n"
                "For crop safety, environmental protection, and regulatory compliance, I cannot prescribe specific chemical pesticide dosages, tank-mix ratios, or product concentrations (e.g., ml/L or grams/acre).\n\n"
                "**Why this precaution?**\n"
                "- Application rates depend strictly on the exact commercial formulation (EC, WP, SC), crop growth stage, and Economic Threshold Levels (ETL).\n"
                "- Unregistered or imprecise dosage can cause crop phytotoxicity or lead to pesticide resistance.\n\n"
                "👉 **Recommended Safe Actions:**\n"
                "1. Always read and adhere strictly to the **statutory container label and leaflet** issued with CIBRC-registered products.\n"
                "2. Wear protective equipment (gloves, mask, eye protection) when handling any agricultural inputs.\n"
                "3. Consult your local **Krishi Vigyan Kendra (KVK)** or Block Agricultural Extension Officer for certified recommendations."
            )

    def _synthesize_targeted_local_reply(
        self,
        message: str,
        intent: str,
        pests: List[Dict[str, Any]],
        diagnosis_context: Optional[Dict[str, Any]],
        language: str,
    ) -> str:
        """
        Targeted grounded local reply based on the specific pest and conversational intent.
        """
        top_pest = pests[0] if pests else None

        # Unknown / unverified pest
        if not top_pest:
            if language == "ta":
                return (
                    "எங்கள் வேளாண் தரவுத்தளத்தில் நீங்கள் குறிப்பிட்ட பூச்சி பற்றிய சரிபார்க்கப்பட்ட பதிவுகள் கிடைக்கவில்லை. "
                    "பாதுகாப்பான பயிர் மேலாண்மைக்கு துல்லியமான அடையாளம் அவசியம் என்பதால், தவறான தகவல்களை வழங்க முடியாது. "
                    "தயவுசெய்து பூச்சியின் பெயரைச் சரிபார்க்கவும் அல்லது 'நோய் கண்டறிதல்' பகுதியில் தெளிவான புகைப்படத்தைப் பதிவேற்றவும்."
                )
            elif language == "hi":
                return (
                    "हमारे कृषि डेटाबेस में आपके द्वारा पूछे गए कीट के बारे में प्रमाणित जानकारी उपलब्ध नहीं है। "
                    "सुरक्षित फसल प्रबंधन के लिए सटीक पहचान आवश्यक है, अतः बिना प्रमाण कोई अनुमान नहीं लगाया जा सकता। "
                    "कृपया कीट का नाम जांचें या 'रोग पहचान' अनुभाग में स्पष्ट फोटो अपलोड करें।"
                )
            else:
                return (
                    "I could not locate verified agricultural records for that query in our extension database. "
                    "Because responsible pest management demands accurate identification, I cannot guess or fabricate advice. "
                    "Please verify the pest name or crop, or upload a clear photo in the Diagnosis section for visual analysis."
                )

        p_name = top_pest.get("common_name", "Identified Pest").title()
        s_name = top_pest.get("scientific_name")
        scientific_str = f" (*{s_name}*)" if s_name else ""
        crops = ", ".join(top_pest.get("crops_affected", [])) or "Field crops"
        symptoms = top_pest.get("symptoms", "Feeding damage observed on crops.")
        desc = top_pest.get("description", "Agricultural insect pest affecting crops.")
        group = top_pest.get("group", "Insect")
        ipm = top_pest.get("ipm_recommendations", {})
        mon = ipm.get("monitoring", "Inspect crops regularly.")
        cult = ipm.get("cultural_mechanical", "Maintain clean bunds and field sanitation.")
        bio = ipm.get("biological", "Conserve spiders and natural predators; apply neem-based formulations.")
        chem = ipm.get("chemical", "Use approved chemicals only if economic damage threshold is crossed.")
        consult = top_pest.get("when_to_consult_expert", "Consult your local agricultural extension officer.")
        source = top_pest.get("source", "ICAR - NRCPM / TNAU Agritech Portal")

        diag_note = ""
        if diagnosis_context:
            conf = diagnosis_context.get("top_confidence", "N/A")
            diag_note = f"\n> **Detection Context:** YOLO model matched **{p_name}** ({conf}% confidence). Field verification is recommended.\n"

        # 1. Non-Chemical Query
        if intent == "non_chemical":
            if language == "ta":
                return (
                    f"### 🌱 {p_name}{scientific_str} — இயற்கை & ரசாயனமற்ற மேலாண்மை\n"
                    f"{diag_note}\n"
                    f"**பாதிக்கப்படும் முதன்மை பயிர்கள்:** {crops}\n\n"
                    f"#### 1. இயற்கை & உழவியல் முறைகள் (Cultural & Mechanical)\n"
                    f"{cult}\n\n"
                    f"#### 2. உயிரியல் முறை & இயற்கை எதிரிகள் (Biological Control)\n"
                    f"{bio}\n\n"
                    f"#### 3. கண்காணிப்பு (Field Monitoring)\n"
                    f"{mon}\n\n"
                    f"*(ஆதாரம்: {source})*"
                )
            elif language == "hi":
                return (
                    f"### 🌱 {p_name}{scientific_str} — जैविक एवं गैर-रासायनिक उपाय\n"
                    f"{diag_note}\n"
                    f"**प्रभावित प्रमुख फसलें:** {crops}\n\n"
                    f"#### 1. कृषि एवं यांत्रिक रोकथाम (Cultural & Mechanical)\n"
                    f"{cult}\n\n"
                    f"#### 2. जैविक नियंत्रण एवं मित्र कीट (Biological Control)\n"
                    f"{bio}\n\n"
                    f"#### 3. खेत की नियमित निगरानी (Scouting & Monitoring)\n"
                    f"{mon}\n\n"
                    f"*(स्रोत: {source})*"
                )
            else:
                return (
                    f"### 🌱 Non-Chemical Control Options for {p_name}{scientific_str}\n"
                    f"{diag_note}\n"
                    f"**Primary Host Crops:** {crops}\n\n"
                    f"#### 1. Cultural & Mechanical Practices\n"
                    f"{cult}\n\n"
                    f"#### 2. Biological Control & Natural Allies\n"
                    f"{bio}\n\n"
                    f"#### 3. Field Scouting & Traps\n"
                    f"{mon}\n\n"
                    f"*(Source: {source})*"
                )

        # 2. Symptoms Query
        if intent == "symptoms":
            if language == "ta":
                return (
                    f"### 🔍 {p_name}{scientific_str} — தாக்குதலின் முக்கிய அறிகுறிகள்\n"
                    f"{diag_note}\n"
                    f"**பாதிக்கப்படும் பயிர்கள்:** {crops}\n\n"
                    f"#### புலத்தில் கவனிக்க வேண்டிய அறிகுறிகள்:\n"
                    f"{symptoms}\n\n"
                    f"#### எப்போது நடவடிக்கை தேவை?\n"
                    f"- இலைகள் மற்றும் பயிர் தண்டுகளை வாரம் ஒருமுறை கவனமாகப் பரிசோதிக்கவும்.\n"
                    f"- பொருளாதார சேத வரம்பை (ETL) எட்டினால் மட்டுமே தீவிரக் கட்டுப்பாட்டு நடவடிக்கைகளில் இறங்க வேண்டும்.\n\n"
                    f"*(ஆதாரம்: {source})*"
                )
            elif language == "hi":
                return (
                    f"### 🔍 {p_name}{scientific_str} — नुकसान के प्रमुख लक्षण\n"
                    f"{diag_note}\n"
                    f"**प्रभावित फसलें:** {crops}\n\n"
                    f"#### खेत में दिखने वाले मुख्य लक्षण:\n"
                    f"{symptoms}\n\n"
                    f"#### आवश्यक निरीक्षण:\n"
                    f"- सप्ताह में कम से कम एक बार पत्तियों और तनों का सूक्ष्म निरीक्षण करें।\n"
                    f"- आर्थिक क्षति स्तर (ETL) पार होने पर ही रोकथाम के कदम उठाएं।\n\n"
                    f"*(स्रोत: {source})*"
                )
            else:
                return (
                    f"### 🔍 Damage Symptoms of {p_name}{scientific_str}\n"
                    f"{diag_note}\n"
                    f"**Host Crops:** {crops}\n\n"
                    f"#### Field Symptoms to Look For:\n"
                    f"{symptoms}\n\n"
                    f"#### Field Scouting Advice:\n"
                    f"- Inspect crop leaves, shoots, and crowns at weekly intervals.\n"
                    f"- Assess whether damage exceeds local Economic Threshold Levels (ETL) before intervening.\n\n"
                    f"*(Source: {source})*"
                )

        # 3. Factual Explanation / Definition (Short paragraph, not full 4-tier IPM)
        if intent == "explanation":
            if language == "ta":
                return (
                    f"### 🌾 {p_name}{scientific_str}\n"
                    f"{diag_note}\n"
                    f"**{p_name}** என்பது *{group}* வகையைச் சேர்ந்த ஒரு முதன்மை வேளாண் பூச்சியாகும். "
                    f"இது முக்கியமாக **{crops}** போன்ற பயிர்களைத் தாக்கி சேதப்படுத்துகிறது.\n\n"
                    f"{desc}\n\n"
                    f"**முக்கிய அறிகுறி:** {symptoms[:200]}...\n\n"
                    f"*(கட்டுப்பாட்டு வழிமுறைகள் அல்லது விரிவான IPM திட்டத்திற்கு 'இயற்கை கட்டுப்பாட்டு வழிகள்' என்று கேட்கலாம்)*"
                )
            elif language == "hi":
                return (
                    f"### 🌾 {p_name}{scientific_str}\n"
                    f"{diag_note}\n"
                    f"**{p_name}** (*{group}* वर्ग) एक प्रमुख कृषि कीट है, जो मुख्य रूप से **{crops}** फसलों को प्रभावित करता है।\n\n"
                    f"{desc}\n\n"
                    f"**प्रमुख लक्षण:** {symptoms[:200]}...\n\n"
                    f"*(रोकथाम और विस्तृत IPM योजना के लिए 'रोकथाम के उपाय' या 'जैविक उपाय' पूछें)*"
                )
            else:
                return (
                    f"### 🌾 {p_name}{scientific_str}\n"
                    f"{diag_note}\n"
                    f"**{p_name}** is a major agricultural pest belonging to the *{group}* group. "
                    f"It primarily infests **{crops}**.\n\n"
                    f"{desc}\n\n"
                    f"**Key Damage Pattern:** {symptoms[:200]}...\n\n"
                    f"*(To see management options, ask: 'What are the non-chemical control options?' or 'Give me a detailed IPM plan')*"
                )

        # 4. Default / Full IPM Plan
        if language == "ta":
            return (
                f"### 🌱 குறள் வழிகாட்டுதல்: {p_name}{scientific_str}\n"
                f"{diag_note}\n"
                f"**பாதிக்கப்படும் பயிர்கள்:** {crops}\n\n"
                f"#### 🔍 அறிகுறிகள் & கவனிப்பு\n"
                f"{symptoms}\n\n"
                f"#### 🛡️ ஒருங்கிணைந்த பயிர் பாதுகாப்பு (IPM) முறைகள்\n"
                f"- **1. கண்காணிப்பு:** {mon}\n"
                f"- **2. இயற்கை & உழவியல் முறைகள்:** {cult}\n"
                f"- **3. உயிரியல் முறை & இயற்கை எதிரிகள்:** {bio}\n"
                f"- **4. ரசாயன எச்சரிக்கை:** {chem}\n\n"
                f"#### 👨‍🌾 எப்போது வல்லுநரை அணுக வேண்டும்?\n"
                f"{consult}\n\n"
                f"*(ஆதாரம்: {source})*"
            )
        elif language == "hi":
            return (
                f"### 🌱 कु़रल कृषि मार्गदर्शन: {p_name}{scientific_str}\n"
                f"{diag_note}\n"
                f"**प्रभावित फसलें:** {crops}\n\n"
                f"#### 🔍 पहचान और प्रमुख लक्षण\n"
                f"{symptoms}\n\n"
                f"#### 🛡️ एकीकृत कीट प्रबंधन (IPM) समाधान\n"
                f"- **1. खेत निगरानी:** {mon}\n"
                f"- **2. कृषि एवं यांत्रिक उपाय:** {cult}\n"
                f"- **3. जैविक नियंत्रण व मित्र कीट:** {bio}\n"
                f"- **4. रासायनिक सावधानी:** {chem}\n\n"
                f"#### 👨‍🌾 कृषि विशेषज्ञ से कब संपर्क करें?\n"
                f"{consult}\n\n"
                f"*(स्रोत: {source})*"
            )
        else:
            return (
                f"### 🌱 Kural Advisory: {p_name}{scientific_str}\n"
                f"{diag_note}\n"
                f"**Primary Host Crops:** {crops}\n\n"
                f"#### 🔍 Symptoms & What to Look For\n"
                f"{symptoms}\n\n"
                f"#### 🛡️ Integrated Pest Management (IPM) Action Plan\n"
                f"- **1. Field Scouting & Monitoring:** {mon}\n"
                f"- **2. Cultural & Mechanical Practices:** {cult}\n"
                f"- **3. Biological Control & Natural Allies:** {bio}\n"
                f"- **4. Chemical Precaution:** {chem}\n\n"
                f"#### 👨‍🌾 When to Seek Agricultural Expert Support\n"
                f"{consult}\n\n"
                f"*(Grounded in verified extension data: {source})*"
            )


kural_service = KuralAssistantService()
