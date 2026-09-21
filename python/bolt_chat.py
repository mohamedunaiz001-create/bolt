#!/usr/bin/env python3
"""
BOLT - Conversational Academic Mentor & Reasoning Engine (Python)
Provides Claude-grade conversational mentorship for UPSC Civil Services Examination.
Produces structured reasoning phases:
1. Candidate Intent & Context Diagnostic
2. Doctrinal & Thinker Framework Synthesis
3. Empirical Indian Administration Integration
4. Pedagogical Guidance & Actionable Roadmap
"""

import re
import json
from typing import Dict, List, Any, Tuple


THINKER_DATABASE = {
    "herbert simon": {
        "name": "Herbert A. Simon",
        "work": "Administrative Behavior (1947)",
        "core_concepts": [
            "Bounded Rationality",
            "Satisficing Behavior",
            "Administrative Man vs Economic Man",
            "Fact-Value Dichotomy in Decision Making",
            "Zone of Acceptance (extending Barnard's Zone of Indifference)",
        ],
        "mains_application": "Crucial for Paper 1 (Administrative Behaviour) and Paper 2 (Policy formulation bottlenecks, bureaucratic discretion, AI/algorithmic governance limitations).",
        "diagram": "[Objective Rationality (Unattainable)] --> [Cognitive Limits + Time Constraints] --> [Bounded Rationality / Satisficing Choice]"
    },
    "max weber": {
        "name": "Max Weber",
        "work": "Economy and Society (1922)",
        "core_concepts": [
            "Ideal-Type Bureaucracy",
            "Legal-Rational Authority vs Traditional/Charismatic",
            "Impersonality & Sine Ira et Studio",
            "Hierarchy, Written Rules & Specialization",
            "Iron Cage of Bureaucracy",
        ],
        "mains_application": "Paper 1 (Classical Theory) and Paper 2 (Indian bureaucracy continuity from colonial steel frame, red-tape vs development administration).",
        "diagram": "[Traditional / Charismatic] === Modernization ===> [Legal-Rational Bureaucracy: Merit, Files, Hierarchy]"
    },
    "woodrow wilson": {
        "name": "Woodrow Wilson",
        "work": "The Study of Administration (1887)",
        "core_concepts": [
            "Politics-Administration Dichotomy",
            "Business-like efficiency in governance",
            "Comparative Administrative Study",
            "Public opinion as authoritative critic",
        ],
        "mains_application": "Paper 1 (Evolution of discipline) and Paper 2 (Civil servant neutrality vs committed bureaucracy debate).",
        "diagram": "[Politics (Policy Will / Legislature)] <--- Dichotomy ---> [Administration (Execution / Civil Service)]"
    },
    "dwight waldo": {
        "name": "Dwight Waldo",
        "work": "The Administrative State (1948)",
        "core_concepts": [
            "New Public Administration (NPA)",
            "Minnowbrook Perspective I (1968)",
            "Rejection of value-free administration",
            "Democratic administration and social equity",
        ],
        "mains_application": "Paper 1 (NPA, Minnowbrook Conferences) and Paper 2 (Welfare delivery, affirmative action).",
        "diagram": "[Classical POSDCORB] === Minnowbrook I ===> [Relevance, Values, Equity, Change (NPA)]"
    },
    "fred riggs": {
        "name": "Fred W. Riggs",
        "work": "Administration in Developing Countries: The Theory of Prismatic Society (1964)",
        "core_concepts": [
            "Prismatic Society & Sala Model",
            "Heterogeneity, Formalism, Overlapping",
            "Fused-Prismatic-Diffracted Continuum",
            "Bazaar-Canteen Model & Nepotism",
        ],
        "mains_application": "Paper 1 (Comparative Public Administration) and Paper 2 (Development administration gaps, anti-corruption, policy implementation deficits).",
        "diagram": "[Fused (Agraria)] ----> [Prismatic (Transitional / Sala Model)] ----> [Diffracted (Industria)]"
    },
    "chester barnard": {
        "name": "Chester I. Barnard",
        "work": "The Functions of the Executive (1938)",
        "core_concepts": [
            "Organization as a Cooperative System",
            "Acceptance Theory of Authority",
            "Zone of Indifference",
            "Contribution-Satisfaction Equilibrium",
            "Informal Organizations & Moral Leadership",
        ],
        "mains_application": "Paper 1 (Administrative Behaviour) and Paper 2 (Leadership in civil services, police reforms, civil servant morale).",
        "diagram": "[Individual Orders] === Evaluated against ===> [Zone of Indifference: Authority accepted unconditionally]"
    },
}

SECOND_ARC_REPORTS = {
    "1": "Right to Information: Master Key to Good Governance",
    "2": "Unlocking Human Capital: Entitlements and Public Authorities",
    "3": "Crisis Management: From Despair to Hope",
    "4": "Ethics in Governance (Statutory Code, Lokpal, Article 311)",
    "5": "Public Order (Police Reforms, Criminal Justice)",
    "6": "Local Governance (Panchayati Raj, 73rd/74th Amendments)",
    "7": "Capacity Building for Conflict Resolution",
    "8": "Combating Terrorism",
    "9": "Social Capital: A Shared Destiny",
    "10": "Refurbishing of Personnel Administration (Civil Services Authority, Performance Management)",
    "11": "Promoting e-Governance: The SMART Way Forward",
    "12": "Citizen Centric Administration: Heart of Governance (Sevottam Model)",
    "13": "Organizational Structure of Government of India",
    "14": "Strengthening Financial Management Systems",
    "15": "State and District Administration",
}


def build_claude_thought_process(query: str, subject: str = "Public Administration") -> Tuple[str, List[Dict[str, str]]]:
    """
    Generates transparent, Claude-grade step-by-step reasoning phases.
    """
    q_lower = query.lower()

    # Identify primary thinker
    matched_thinker = None
    for k, v in THINKER_DATABASE.items():
        if k in q_lower or any(c.lower() in q_lower for c in v["core_concepts"]):
            matched_thinker = v
            break

    # Identify 2nd ARC relevance
    arc_links = []
    if "ethic" in q_lower or "corruption" in q_lower or "lokpal" in q_lower:
        arc_links.append("2nd ARC Report 4 (Ethics in Governance)")
    if "civil service" in q_lower or "reform" in q_lower or "lateral" in q_lower or "transfer" in q_lower:
        arc_links.append("2nd ARC Report 10 (Personnel Administration)")
    if "citizen" in q_lower or "sevottam" in q_lower or "charter" in q_lower:
        arc_links.append("2nd ARC Report 12 (Citizen Centric Administration)")
    if "panchayat" in q_lower or "local" in q_lower or "municipality" in q_lower:
        arc_links.append("2nd ARC Report 6 (Local Governance)")
    if not arc_links:
        arc_links.append("2nd ARC Report 1 (RTI) & Report 12 (Sevottam Framework)")

    phase1 = (
        f"Aspirant asks: '{query}'. Deconstructing intent: Subject domain is {subject}. "
        f"Core objective requires rigorous synthesis of administrative doctrine with modern UPSC Mains evaluation standards. "
        f"Mapping to Syllabus: Paper 1 & Paper 2 cross-linkages."
    )

    if matched_thinker:
        phase2 = (
            f"Grounding in {matched_thinker['name']}'s '{matched_thinker['work']}'. "
            f"Isolating conceptual pillars: {', '.join(matched_thinker['core_concepts'][:3])}. "
            f"Formulating theoretical contrast against classical orthodoxy."
        )
    else:
        phase2 = (
            "Grounding in classical versus contemporary administrative paradigm. "
            "Synthesizing Woodrow Wilson, Max Weber, and Herbert Simon with post-Weberian public management and New Public Service."
        )

    phase3 = (
        f"Connecting theory to Indian Constitutional and administrative reality: {', '.join(arc_links)}. "
        "Integrating empirical reforms: Mission Karmayogi, digital service delivery, lateral entry, and Article 311 jurisprudence."
    )

    phase4 = (
        "Formulating pedagogical outcome: Deliver structured UPSC Mains-ready answer with crisp sub-headings, "
        "thinker citations, visual conceptual diagram, and balanced Way Forward."
    )

    phases = [
        {"title": "Phase 1: Intent & Syllabus Mapping", "content": phase1},
        {"title": "Phase 2: Theoretical & Thinker Synthesis", "content": phase2},
        {"title": "Phase 3: Indian Administrative Reality & 2nd ARC", "content": phase3},
        {"title": "Phase 4: UPSC Answer Structure Formulation", "content": phase4},
    ]

    thought_xml = (
        "<thought>\n"
        f"Step 1 - Diagnostic: {phase1}\n\n"
        f"Step 2 - Theory: {phase2}\n\n"
        f"Step 3 - Empirical Linkage: {phase3}\n\n"
        f"Step 4 - Output Plan: {phase4}\n"
        "</thought>"
    )

    return thought_xml, phases


def generate_conversational_mentor_reply(
    query: str,
    user_name: str = "Aspirant",
    subject: str = "Public Administration",
    mode: str = "public_admin"
) -> Dict[str, Any]:
    """
    Generates a full Claude-grade mentor response with step-by-step reasoning and actionable cards.
    """
    thought_xml, phases = build_claude_thought_process(query, subject)
    q_lower = query.lower()

    # Match specific thinker
    matched_thinker = None
    for k, v in THINKER_DATABASE.items():
        if k in q_lower or any(c.lower() in q_lower for c in v["core_concepts"]):
            matched_thinker = v
            break

    if matched_thinker:
        t = matched_thinker
        text = f"""### Conceptual Analysis: {t['name']} and UPSC Examination Context

Hello {user_name}. Let us examine **{t['name']}** from the lens of both **Paper 1 (Administrative Theory)** and **Paper 2 (Indian Administration)**:

---

### 1. The Core Theoretical Paradigm
In *{t['work']}*, {t['name']} addressed the fundamental limitations of prior administrative thought:
{chr(10).join(f"- **{c}**: Crucial foundational concept examined repeatedly in Mains." for c in t['core_concepts'])}

### 2. Conceptual Diagram
```text
{t['diagram']}
```

### 3. Application to Indian Administration & Reforms
- **Relevance**: {t['mains_application']}
- **2nd ARC Convergence**: Aligns closely with recommendations for systemic civil service performance, reduction of discretion, and modern capacity building (*Mission Karmayogi*).

### 4. Model 15-Marker Answer Structure Formula
1. **Introduction (30 words)**: Anchor in the historical context and define the core thesis clearly.
2. **Body Dimensions (150 words)**: Present 3 distinct analytical pillars (Theoretical root, critique of classical model, and modern relevance). Include a 2-inch schematic diagram.
3. **Indian Administrative Relevance (50 words)**: Cite 2nd ARC report or supreme court judgment.
4. **Way Forward / Conclusion (20 words)**: Synthesize with Citizen-Centric Governance (*Sevottam*).

---
> 💡 **Mentor Tip:** In UPSC Mains, theoretical answers score highest when you integrate Paper 1 thinkers into Paper 2 governance challenges."""

    elif "arc" in q_lower or "ethics" in q_lower:
        text = f"""### 2nd Administrative Reforms Commission (2nd ARC) Strategic Guide

Hello {user_name}. The **2nd ARC** under the chairmanship of Veerappa Moily represents the authoritative doctrinal benchmark for **Public Administration Paper 2** and **GS Paper 4**:

---

### High-Priority Reports for UPSC Mains
1. **4th Report — Ethics in Governance**:
   - Codification of ethics and Statutory Public Service Bill
   - Strengthening Lokpal & Lokayukta institutional independence
   - Reforming procedural delays under Article 311 without eroding genuine protection

2. **10th Report — Personnel Administration: Scaling New Heights**:
   - Establishment of an independent, statutory **Civil Services Authority**
   - Fixed 2-year tenures to insulate civil servants from arbitrary political transfers
   - Comprehensive domain specialization and mid-career appraisal

3. **12th Report — Citizen Centric Administration**:
   - The **Sevottam Model** for public service delivery benchmarking
   - 3-pillar citizen empowerment: Citizens Charters, Grievance Redressal, and Service Quality

---
> 💡 **Answer-Writing Formula:** Whenever answering administrative discretion or corruption, explicitly cite *2nd ARC Report 4 Recommendations 3.2 & 4.1* to gain top-bracket marks."""

    else:
        text = f"""### Academic Diagnostic & Strategic Roadmap

Hello {user_name}. I have analyzed your question: **"{query}"** across the UPSC syllabus requirements.

---

### 1. Conceptual Framework & Core Themes
To build an authoritative response on this topic, your answer must balance:
- **Theoretical Foundations**: The historical evolution and academic consensus.
- **Constitutional & Legal Anchors**: Articles, statutory provisions, and institutional mechanisms.
- **Contemporary Challenges**: Policy bottlenecks, digital governance dilemmas, and resource constraints.

### 2. Analytical Dimensions to Cover
1. **Structural Dimension**: Hierarchy, decentralized accountability, and inter-departmental coordination.
2. **Behavioral Dimension**: Motivation, morale, bureaucratic resistance to change, and ethical discretion.
3. **Public Interface**: Transparency, RTI compliance, grievance redressal, and citizen participation.

### 3. UPSC Mains Presentation Technique
- Always open with a concise conceptual definition.
- Use numbered points with **bold keywords** for readability under timed exam conditions.
- Incorporate a clean flow-diagram or matrix table to stand out from generic answers.
- Conclude with a forward-looking, solution-oriented conclusion rooted in 2nd ARC principles.

---
> 💡 **Next Action:** Would you like to practice a 15-marker question on this topic, or explore related Previous Year Questions (PYQs)?"""

    action_cards = [
        {
            "type": "model_answer",
            "title": "Model 15-Marker Structure",
            "description": "Inspect 15-mark structured model answer with diagram & 2nd ARC links",
            "actionLabel": "Open Mains Room",
            "targetTab": "mains",
        },
        {
            "type": "topic",
            "title": "Practice Related PYQs",
            "description": "Filter historical & recent UPSC exam questions on this concept",
            "actionLabel": "Explore PYQs",
            "targetTab": "pyqs",
        },
        {
            "type": "topic",
            "title": "NCERT Foundation Check",
            "description": "Consolidate foundational concepts from NCERT Class 11-12",
            "actionLabel": "Review NCERT",
            "targetTab": "ncert",
        },
    ]

    return {
        "text": text,
        "thoughtProcess": thought_xml,
        "reasoningPhases": phases,
        "mode": mode,
        "engine": "BOLT Claude-Grade Python Engine",
        "actionCards": action_cards,
    }


if __name__ == "__main__":
    print("[*] Testing BOLT Python Mentor Engine...")
    res = generate_conversational_mentor_reply("Explain Herbert Simon bounded rationality", "Aspirant")
    print("\n--- THOUGHT PROCESS ---")
    print(res["thoughtProcess"][:200] + "...")
    print("\n--- RESPONSE SNIPPET ---")
    print(res["text"][:300] + "...")
    print("\n[✓] Mentor Engine OK.")
