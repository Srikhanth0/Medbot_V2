"""
Safety Gate — Intent classifier and emergency detection node.

Runs as an INDEPENDENT gate BEFORE the main generation call.
A jailbreak against the big model's system prompt still has to get past this
separate gate — meaningfully stronger than single-layer prompting.

Categories:
  - normal: standard RAG pipeline
  - emergency: chest pain, stroke symptoms, severe bleeding, suicidal ideation, overdose
  - diagnosis_seeking: "do I have cancer", "what's wrong with me"
  - treatment_seeking: "how much X should I take", "what should I take for this"
  - drug_misuse: requests for recreational drug info, harmful combinations
"""

from __future__ import annotations

import logging
import re
import time

from app.langgraph.state import GraphState, SafetyClassification

logger = logging.getLogger(__name__)

# ─── Emergency Keywords ───────────────────────────────────────────────
# These trigger immediate emergency response — latency is secondary to
# not delaying someone toward real emergency care.
EMERGENCY_PATTERNS: list[re.Pattern[str]] = [
    re.compile(p, re.IGNORECASE)
    for p in [
        r"\b(chest\s+pain|heart\s+attack|cardiac\s+arrest)\b",
        r"\b(can'?t\s+breathe|difficulty\s+breathing|shortness\s+of\s+breath|choking)\b",
        r"\b(stroke|sudden\s+numbness|face\s+drooping|slurred\s+speech)\b",
        r"\b(severe\s+bleeding|hemorrhag|uncontrollable\s+bleed)\b",
        r"\b(suicid|kill\s+myself|want\s+to\s+die|end\s+my\s+life|self[- ]?harm)\b",
        r"\b(overdos|took\s+too\s+(many|much)|poison)\b",
        r"\b(anaphyla|severe\s+allergic\s+reaction|throat\s+swelling)\b",
        r"\b(seizure|convulsion|unconscious|passed\s+out|faint)\b",
        r"\b(severe\s+head\s+injur|head\s+trauma|skull\s+fracture)\b",
    ]
]

# ─── Diagnosis-Seeking Patterns ───────────────────────────────────────
DIAGNOSIS_PATTERNS: list[re.Pattern[str]] = [
    re.compile(p, re.IGNORECASE)
    for p in [
        r"\bdo\s+I\s+have\b",
        r"\bis\s+(it|this)\s+(cancer|diabetes|hiv|aids|covid|lupus|ms)\b",
        r"\bwhat('?s|\s+is)\s+wrong\s+with\s+me\b",
        r"\bam\s+I\s+(sick|ill|dying|infected)\b",
        r"\bdiagnos(e|is)\s+(me|my|this)\b",
        r"\bwhat\s+disease\s+do\s+I\b",
        r"\bis\s+this\s+(serious|dangerous|life[- ]?threatening|fatal)\b",
        r"\bshould\s+I\s+be\s+(worried|concerned|scared)\b",
        r"\bcould\s+(this|it)\s+be\b.*\b(cancer|tumor|malignant)\b",
    ]
]

# ─── Treatment/Dosage-Seeking Patterns ────────────────────────────────
TREATMENT_PATTERNS: list[re.Pattern[str]] = [
    re.compile(p, re.IGNORECASE)
    for p in [
        r"\bwhat\s+should\s+I\s+take\b",
        r"\bhow\s+much\s+.{1,30}\s+should\s+I\s+take\b",
        r"\bwhat('?s|\s+is)\s+the\s+(right|correct|proper)\s+dos(e|age)\b",
        r"\brecommend\s+(a\s+)?(?:drug|medication|medicine|treatment|prescription)\b",
        r"\bprescribe\s+(?:me|something)\b",
        r"\bwhat\s+medication\b",
        r"\bcan\s+I\s+(take|use|try)\b.*\b(mg|pill|tablet|capsule|dose)\b",
        r"\bincrease\s+(my\s+)?dos(e|age)\b",
        r"\bstop\s+taking\s+(?:my\s+)?(?:medication|medicine|drug)\b",
    ]
]

# ─── Drug Misuse Patterns ─────────────────────────────────────────────
DRUG_MISUSE_PATTERNS: list[re.Pattern[str]] = [
    re.compile(p, re.IGNORECASE)
    for p in [
        r"\b(get\s+high|recreational\s+use|abuse)\b",
        r"\bmix(ing)?\s+.{1,30}\s+with\s+(alcohol|drugs)\b",
        r"\bhow\s+to\s+(get|obtain|buy)\s+.{1,30}\s+without\s+prescription\b",
        r"\bmaximum\s+.{1,20}\s+I\s+can\s+take\s+(safely|without\s+dying)\b",
        r"\b(snort|inject|crush)\s+.{1,20}\s+(pill|tablet|medication)\b",
    ]
]


# ─── Emergency Response Templates ─────────────────────────────────────
EMERGENCY_RESPONSE = """🚨 **I've detected language suggesting a medical emergency.**

**If you or someone near you is experiencing a medical emergency, please take the following steps immediately:**

1. **Call emergency services** (911 in the US, 112 in the EU, 108 in India, or your local emergency number)
2. **Do not wait** — time is critical in medical emergencies
3. **Stay with the person** if you're helping someone else

**Crisis resources:**
- **Emergency:** Call your local emergency number immediately
- **Suicide & Crisis Lifeline (US):** Call or text 988
- **Crisis Text Line:** Text HOME to 741741
- **Poison Control (US):** 1-800-222-1222

I'm a medical understanding assistant and cannot provide emergency medical care. Please contact emergency services right away.
"""

REFRAME_DIAGNOSIS = (
    "I understand you're concerned about your health, and that's completely valid. "
    "However, I'm not able to provide a diagnosis — that requires a qualified healthcare "
    "professional who can examine you, review your full medical history, and order "
    "appropriate tests.\n\n"
    "What I *can* do is help you understand what your report says — the specific values, "
    "what the medical terms mean, and what reference ranges typically indicate. "
    "Would you like me to explain any specific part of your report?\n\n"
    "**I strongly recommend discussing your concerns with your doctor or healthcare "
    "provider, who can give you personalized medical advice.**"
)

REFRAME_TREATMENT = (
    "I appreciate you reaching out, but I'm not able to recommend specific medications, "
    "treatments, or dosages. Medication decisions depend on your full medical history, "
    "current medications, allergies, and many other factors that only your healthcare "
    "provider can properly evaluate.\n\n"
    "What I *can* do is help you understand the information in your medical report — "
    "including what conditions or findings are noted, what medical terms mean, and what "
    "general information is publicly available about them.\n\n"
    "**Please consult your doctor or pharmacist for treatment recommendations.**"
)

REFRAME_DRUG_MISUSE = (
    "I'm not able to provide information that could be used for drug misuse or "
    "recreational purposes. This is to ensure your safety.\n\n"
    "If you're struggling with substance use, please reach out for help:\n"
    "- **SAMHSA National Helpline (US):** 1-800-662-4357 (free, confidential, 24/7)\n"
    "- **Your primary care provider** can connect you with resources\n\n"
    "I'm here to help you understand your medical reports. Is there something "
    "specific in your report I can explain?"
)


def classify_query(query: str) -> tuple[SafetyClassification, str | None]:
    """
    Classify a user query into a safety category using keyword/pattern matching.

    This is the first-pass classifier. It runs before the LLM and acts as an
    independent safety gate.

    Returns:
        Tuple of (classification, pre-built_response_or_None)
    """
    query_lower = query.lower().strip()

    # 1. Emergency detection — highest priority
    for pattern in EMERGENCY_PATTERNS:
        if pattern.search(query_lower):
            return SafetyClassification.EMERGENCY, EMERGENCY_RESPONSE

    # 2. Drug misuse detection
    for pattern in DRUG_MISUSE_PATTERNS:
        if pattern.search(query_lower):
            return SafetyClassification.DRUG_MISUSE, REFRAME_DRUG_MISUSE

    # 3. Treatment/dosage seeking
    for pattern in TREATMENT_PATTERNS:
        if pattern.search(query_lower):
            return SafetyClassification.TREATMENT_SEEKING, REFRAME_TREATMENT

    # 4. Diagnosis seeking
    for pattern in DIAGNOSIS_PATTERNS:
        if pattern.search(query_lower):
            return SafetyClassification.DIAGNOSIS_SEEKING, REFRAME_DIAGNOSIS

    # 5. Normal — passes through to RAG pipeline
    return SafetyClassification.NORMAL, None


def safety_gate_node(state: GraphState) -> GraphState:
    """
    LangGraph node: Safety Gate.

    Classifies the user query and either:
    - Routes to emergency/reframe response (short-circuits the pipeline)
    - Passes through to the retrieval node (normal flow)

    This gate is INDEPENDENT of the main LLM — a jailbreak against the
    system prompt still has to clear this gate separately.
    """
    start = time.time()

    classification, response = classify_query(state.query)
    state.safety_classification = classification

    if classification != SafetyClassification.NORMAL:
        state.safety_response = response
        state.safety_event = classification.value
        state.final_response = response or ""
        logger.warning(
            "Safety gate triggered: classification=%s, query=%s",
            classification.value,
            state.query[:100],
        )
    else:
        logger.info("Safety gate passed: query classified as normal")

    state.timing["safety_gate"] = time.time() - start
    return state
