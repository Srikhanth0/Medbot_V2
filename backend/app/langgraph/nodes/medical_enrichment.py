"""
Medical API Enrichment Node — RxNorm, OpenFDA, MedlinePlus integration.

These APIs are called BY THE LANGGRAPH ROUTER based on detected entities,
never freely by the LLM. The graph decides what to fetch and injects results
as cited context. This is what separates "a wrapper that might hallucinate a
drug interaction" from "a system that only states drug facts sourced from
OpenFDA's label text, with a citation."
"""

from __future__ import annotations

import logging
import re
import time

import httpx

from app.langgraph.state import GraphState, MedicalEnrichment

logger = logging.getLogger(__name__)

# Common medication names for entity detection
MEDICATION_PATTERN = re.compile(
    r"\b(aspirin|ibuprofen|acetaminophen|tylenol|advil|metformin|lisinopril|"
    r"atorvastatin|lipitor|amlodipine|omeprazole|losartan|gabapentin|"
    r"hydrochlorothiazide|sertraline|zoloft|metoprolol|albuterol|"
    r"amoxicillin|levothyroxine|prednisone|warfarin|insulin|"
    r"pantoprazole|furosemide|montelukast|escitalopram|duloxetine|"
    r"rosuvastatin|crestor|tamsulosin|meloxicam|tramadol|trazodone)\b",
    re.IGNORECASE,
)

# Common lab test patterns
LAB_TEST_PATTERN = re.compile(
    r"\b(hemoglobin|hba1c|a1c|glucose|creatinine|bun|alt|ast|"
    r"cholesterol|ldl|hdl|triglycerides|tsh|t3|t4|wbc|rbc|"
    r"platelets|hematocrit|albumin|bilirubin|potassium|sodium|"
    r"calcium|magnesium|iron|ferritin|vitamin\s*d|b12|folate|"
    r"psa|cbc|bmp|cmp|inr|ptt|esr|crp)\b",
    re.IGNORECASE,
)

HTTP_TIMEOUT = 10.0  # seconds


def detect_medical_entities(query: str) -> list[str]:
    """Detect medication names and lab tests in the user query."""
    entities = []

    med_matches = MEDICATION_PATTERN.findall(query)
    entities.extend([m.lower() for m in med_matches])

    lab_matches = LAB_TEST_PATTERN.findall(query)
    entities.extend([m.lower() for m in lab_matches])

    return list(set(entities))


async def query_rxnorm(drug_name: str) -> MedicalEnrichment | None:
    """
    Query RxNorm for medication name normalization.

    RxNorm is a free public REST API — no API key required.
    """
    url = "https://rxnav.nlm.nih.gov/REST/drugs.json"
    try:
        async with httpx.AsyncClient(timeout=HTTP_TIMEOUT) as client:
            resp = await client.get(url, params={"name": drug_name})
            resp.raise_for_status()
            data = resp.json()

        concepts = data.get("drugGroup", {}).get("conceptGroup", [])
        results = []
        for group in concepts:
            for prop in group.get("conceptProperties", [])[:3]:
                results.append(f"- {prop.get('name', '')} (RxCUI: {prop.get('rxcui', '')})")

        if results:
            result_text = (
                f"**RxNorm lookup for '{drug_name}':**\n"
                + "\n".join(results)
            )
            return MedicalEnrichment(
                source="rxnorm",
                query=drug_name,
                result=result_text,
                url=f"https://rxnav.nlm.nih.gov/REST/drugs.json?name={drug_name}",
            )
    except Exception as e:
        logger.warning("RxNorm query failed for '%s': %s", drug_name, e)

    return None


async def query_openfda(drug_name: str) -> MedicalEnrichment | None:
    """
    Query OpenFDA for drug label / interaction / recall info.

    OpenFDA is a free public REST API — no API key required.
    """
    url = "https://api.fda.gov/drug/label.json"
    try:
        async with httpx.AsyncClient(timeout=HTTP_TIMEOUT) as client:
            resp = await client.get(
                url,
                params={
                    "search": f'openfda.generic_name:"{drug_name}"',
                    "limit": 1,
                },
            )
            resp.raise_for_status()
            data = resp.json()

        results = data.get("results", [])
        if results:
            label = results[0]
            parts = []

            purpose = label.get("purpose", label.get("indications_and_usage", [""]))
            if purpose:
                text = purpose[0] if isinstance(purpose, list) else purpose
                parts.append(f"**Purpose:** {text[:500]}")

            warnings = label.get("warnings", [])
            if warnings:
                text = warnings[0] if isinstance(warnings, list) else warnings
                parts.append(f"**Warnings:** {str(text)[:500]}")

            interactions = label.get("drug_interactions", [])
            if interactions:
                text = interactions[0] if isinstance(interactions, list) else interactions
                parts.append(f"**Drug Interactions:** {str(text)[:500]}")

            if parts:
                result_text = (
                    f"**OpenFDA drug label for '{drug_name}':**\n"
                    + "\n".join(parts)
                )
                return MedicalEnrichment(
                    source="openfda",
                    query=drug_name,
                    result=result_text,
                    url=f"https://api.fda.gov/drug/label.json?search=openfda.generic_name:%22{drug_name}%22",
                )
    except Exception as e:
        logger.warning("OpenFDA query failed for '%s': %s", drug_name, e)

    return None


async def query_medlineplus(term: str) -> MedicalEnrichment | None:
    """
    Query MedlinePlus for plain-language condition/lifestyle explanations.

    MedlinePlus Connect is free, no key required — your best source for
    "explain simply."
    """
    url = "https://connect.medlineplus.gov/service"
    try:
        async with httpx.AsyncClient(timeout=HTTP_TIMEOUT) as client:
            resp = await client.get(
                url,
                params={
                    "mainSearchCriteria.v.cs": "2.16.840.1.113883.6.69",
                    "mainSearchCriteria.v.dn": term,
                    "informationRecipient.languageCode.c": "en",
                    "knowledgeResponseType": "application/json",
                },
            )
            resp.raise_for_status()
            data = resp.json()

        entries = data.get("feed", {}).get("entry", [])
        if entries:
            entry = entries[0]
            title = entry.get("title", {}).get("_value", "")
            summary = entry.get("summary", {}).get("_value", "")
            link = ""
            for lnk in entry.get("link", []):
                if lnk.get("rel") == "alternate":
                    link = lnk.get("href", "")
                    break

            if summary:
                # Strip HTML tags
                clean_summary = re.sub(r"<[^>]+>", "", summary)[:600]
                result_text = (
                    f"**MedlinePlus — {title}:**\n{clean_summary}"
                )
                return MedicalEnrichment(
                    source="medlineplus",
                    query=term,
                    result=result_text,
                    url=link,
                )
    except Exception as e:
        logger.warning("MedlinePlus query failed for '%s': %s", term, e)

    return None


async def medical_enrichment_node(state: GraphState) -> GraphState:
    """
    LangGraph node: Medical API Enrichment.

    Detects medical entities (medications, lab tests) in the query and
    enriches the context with data from RxNorm, OpenFDA, and MedlinePlus.

    These APIs are called by the graph based on detected entities, never
    freely by the LLM.
    """
    start = time.time()

    entities = detect_medical_entities(state.query)
    state.detected_entities = entities

    if not entities:
        logger.info("No medical entities detected in query")
        state.timing["medical_enrichment"] = time.time() - start
        return state

    logger.info("Detected medical entities: %s", entities)
    enrichments: list[MedicalEnrichment] = []

    for entity in entities[:3]:  # Limit to 3 entities to control latency
        # Query RxNorm for medications
        if MEDICATION_PATTERN.search(entity):
            rxnorm_result = await query_rxnorm(entity)
            if rxnorm_result:
                enrichments.append(rxnorm_result)

            openfda_result = await query_openfda(entity)
            if openfda_result:
                enrichments.append(openfda_result)

        # Query MedlinePlus for any medical term
        medline_result = await query_medlineplus(entity)
        if medline_result:
            enrichments.append(medline_result)

    state.medical_context = enrichments
    logger.info("Medical enrichment complete: %d results", len(enrichments))
    state.timing["medical_enrichment"] = time.time() - start
    return state
