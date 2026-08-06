"""
LangGraph State Machine definition for MedBot.

Connects nodes:
safety_gate -> (conditional) -> intent_router -> (conditional)
                                                   ├─► use_rag=False ──► prompt_constructor
                                                   └─► use_rag=True  ──► retrieval ──► medical_enrichment ──► prompt_constructor
                                                                                                                   │
                                                                                                                   ▼
                                                                                                               generation ──► post_check ──► END
"""

from __future__ import annotations

import logging
from typing import Any

from langgraph.graph import StateGraph, END

from app.langgraph.nodes.generation import generation_node
from app.langgraph.nodes.intent_router import intent_router_node
from app.langgraph.nodes.medical_enrichment import medical_enrichment_node
from app.langgraph.nodes.post_check import post_check_node
from app.langgraph.nodes.prompt_constructor import prompt_constructor_node
from app.langgraph.nodes.retrieval import retrieval_node
from app.langgraph.nodes.safety_gate import safety_gate_node
from app.langgraph.state import GraphState, SafetyClassification

logger = logging.getLogger(__name__)


def route_after_safety(state: GraphState) -> str:
    """Routing function after safety gate node."""
    if state.safety_classification != SafetyClassification.NORMAL:
        return "end"
    return "intent_router"


def route_after_intent(state: GraphState) -> str:
    """Routing function after intent router node."""
    if not state.use_rag:
        return "prompt_constructor"
    return "retrieval"


def build_medbot_graph(pool: Any = None) -> Any:
    """
    Build and compile the Agentic RAG LangGraph workflow for MedBot.
    """
    workflow = StateGraph(GraphState)

    # Define nodes
    workflow.add_node("safety_gate", safety_gate_node)
    workflow.add_node("intent_router", intent_router_node)

    # Wrap retrieval node with db pool dependency
    async def wrapped_retrieval(state: GraphState) -> GraphState:
        return await retrieval_node(state, pool) if pool else state

    workflow.add_node("retrieval", wrapped_retrieval)
    workflow.add_node("medical_enrichment", medical_enrichment_node)
    workflow.add_node("prompt_constructor", prompt_constructor_node)
    workflow.add_node("generation", generation_node)
    workflow.add_node("post_check", post_check_node)

    # Entry point
    workflow.set_entry_point("safety_gate")

    # Conditional edge after safety gate
    workflow.add_conditional_edges(
        "safety_gate",
        route_after_safety,
        {
            "end": END,
            "intent_router": "intent_router",
        },
    )

    # Conditional edge after intent router (skip RAG if use_rag is False)
    workflow.add_conditional_edges(
        "intent_router",
        route_after_intent,
        {
            "prompt_constructor": "prompt_constructor",
            "retrieval": "retrieval",
        },
    )

    # RAG branch
    workflow.add_edge("retrieval", "medical_enrichment")
    workflow.add_edge("medical_enrichment", "prompt_constructor")

    # Generation & Post-check
    workflow.add_edge("prompt_constructor", "generation")
    workflow.add_edge("generation", "post_check")
    workflow.add_edge("post_check", END)

    app = workflow.compile()
    return app
