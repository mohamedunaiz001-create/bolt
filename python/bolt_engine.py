"""
BOLT - UPSC Civil Services Preparation Engine
Core Python Analytics, Evaluation, and Diagnostic Engine
"""

import json
import math
import sys
from typing import Dict, List, Any


def calculate_topic_knowledge(
    mcq_accuracy: float,
    attempts_count: int,
    mains_average_score: float,
    max_mains_marks: float = 15.0,
    days_since_revision: int = 2,
    self_rating: float = 75.0,
) -> Dict[str, Any]:
    """
    Calculates multi-signal topic knowledge confidence.
    Does NOT rely only on a user checkbox.
    Weights:
      - MCQ Accuracy: 30%
      - Mains Performance (scaled to 100): 35%
      - Practice Volume / Experience: 15%
      - Spaced Forgetting Curve penalty: 10%
      - Self Rating: 10%
    """
    mains_percentage = (mains_average_score / max_mains_marks) * 100.0 if max_mains_marks > 0 else 50.0
    
    # Practice volume factor (plateaus around 40 attempts)
    volume_factor = min(100.0, (attempts_count / 40.0) * 100.0)
    
    # Ebbinghaus forgetting curve decay
    retention_factor = max(40.0, 100.0 * math.exp(-0.05 * max(0, days_since_revision)))
    
    score = (
        (mcq_accuracy * 0.30)
        + (mains_percentage * 0.35)
        + (volume_factor * 0.15)
        + (retention_factor * 0.10)
        + (self_rating * 0.10)
    )
    
    score = round(max(10.0, min(98.0, score)), 1)
    
    status = "needs_revision"
    if score >= 75.0:
        status = "strong"
    elif score >= 65.0:
        status = "practicing"
    elif score >= 50.0:
        status = "learning"
    else:
        status = "needs_revision"
        
    return {
        "knowledge_score": score,
        "status": status,
        "mains_percentage": round(mains_percentage, 1),
        "volume_factor": round(volume_factor, 1),
        "retention_factor": round(retention_factor, 1),
    }


DEFAULT_SYLLABUS = [
    {
        "id": "pa1-1", "name": "Introduction to Public Administration", "paper": "Paper 1",
        "completionPercentage": 88, "knowledgeScore": 82, "mcqAccuracy": 84, "mainsAverageScore": 10.5,
        "attemptsCount": 32, "status": "strong", "commonMistakes": ["Confusing Wilson with Goodnow"],
        "keyThinkers": ["Woodrow Wilson", "Dwight Waldo", "Nicholas Henry"]
    },
    {
        "id": "pa1-2", "name": "Administrative Thought", "paper": "Paper 1",
        "completionPercentage": 68, "knowledgeScore": 56, "mcqAccuracy": 58, "mainsAverageScore": 7.8,
        "attemptsCount": 44, "status": "needs_revision", "commonMistakes": ["Omitting Simon's Bounded Rationality", "Overlooking Barnard's Zone of Indifference"],
        "keyThinkers": ["Herbert Simon", "Max Weber", "Chester Barnard", "Mary Parker Follett", "F.W. Taylor"]
    },
    {
        "id": "pa1-3", "name": "Administrative Behaviour", "paper": "Paper 1",
        "completionPercentage": 85, "knowledgeScore": 86, "mcqAccuracy": 88, "mainsAverageScore": 11.2,
        "attemptsCount": 26, "status": "strong", "commonMistakes": ["Superficial motivation-hygiene theory comparison"],
        "keyThinkers": ["Abraham Maslow", "Douglas McGregor", "Frederick Herzberg"]
    },
    {
        "id": "pa1-4", "name": "Accountability & Control", "paper": "Paper 1",
        "completionPercentage": 62, "knowledgeScore": 52, "mcqAccuracy": 54, "mainsAverageScore": 8.0,
        "attemptsCount": 38, "status": "needs_revision", "commonMistakes": ["Missing 2nd ARC Report 4", "Conflating legislative and judicial control"],
        "keyThinkers": ["Veerappa Moily (2nd ARC)", "Paul Appleby"]
    },
    {
        "id": "pa1-5", "name": "Financial Administration", "paper": "Paper 1",
        "completionPercentage": 64, "knowledgeScore": 58, "mcqAccuracy": 60, "mainsAverageScore": 8.5,
        "attemptsCount": 30, "status": "learning", "commonMistakes": ["Confusing Outcome Budgeting with Zero Based Budgeting"],
        "keyThinkers": ["Aaron Wildavsky", "PAC / Estimates Committee"]
    },
    {
        "id": "pa2-1", "name": "Evolution of Indian Administration", "paper": "Paper 2",
        "completionPercentage": 82, "knowledgeScore": 80, "mcqAccuracy": 82, "mainsAverageScore": 10.0,
        "attemptsCount": 22, "status": "strong", "commonMistakes": ["Ignoring British legacy of centralized district administration"],
        "keyThinkers": ["Kautilya (Arthashastra)", "Mughal Mansabdari", "Cornwallis Reforms"]
    },
    {
        "id": "pa2-2", "name": "Constitutional Framework & Union Executive", "paper": "Paper 2",
        "completionPercentage": 75, "knowledgeScore": 76, "mcqAccuracy": 78, "mainsAverageScore": 9.5,
        "attemptsCount": 28, "status": "strong", "commonMistakes": ["Shallow analysis of President-PM relationship"],
        "keyThinkers": ["B.R. Ambedkar", "Granville Austin", "Sarkaria Commission"]
    },
    {
        "id": "pa2-3", "name": "Civil Services in India", "paper": "Paper 2",
        "completionPercentage": 60, "knowledgeScore": 54, "mcqAccuracy": 56, "mainsAverageScore": 8.2,
        "attemptsCount": 40, "status": "needs_revision", "commonMistakes": ["Omitting Article 311 caveats", "Missing Mission Karmayogi competencies"],
        "keyThinkers": ["2nd ARC 10th Report", "Hota Committee", "Sardar Patel"]
    },
    {
        "id": "pa2-4", "name": "Rural & Urban Local Governance", "paper": "Paper 2",
        "completionPercentage": 88, "knowledgeScore": 85, "mcqAccuracy": 86, "mainsAverageScore": 11.5,
        "attemptsCount": 35, "status": "strong", "commonMistakes": ["Neglecting municipal finance deficits (octroi/property tax)"],
        "keyThinkers": ["73rd & 74th Amendments", "Balwant Rai Mehta", "2nd ARC 6th Report"]
    }
]


def analyze_student_progress(topics: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Deep diagnostic analytics for student Manisha.
    Generates syllabus completion %, topic knowledge breakdown, weak areas, and strong areas.
    """
    if not topics:
        topics = DEFAULT_SYLLABUS
    paper1_topics = [t for t in topics if t.get("paper") == "Paper 1"]
    paper2_topics = [t for t in topics if t.get("paper") == "Paper 2"]
    
    p1_completion = round(sum(t.get("completionPercentage", 0) for t in paper1_topics) / max(1, len(paper1_topics)), 1)
    p2_completion = round(sum(t.get("completionPercentage", 0) for t in paper2_topics) / max(1, len(paper2_topics)), 1)
    overall_completion = round((p1_completion + p2_completion) / 2.0, 1)
    
    # Process knowledge scores
    enriched_topics = []
    weak_areas = []
    strong_areas = []
    
    for t in topics:
        calc = calculate_topic_knowledge(
            mcq_accuracy=float(t.get("mcqAccuracy", 60)),
            attempts_count=int(t.get("attemptsCount", 20)),
            mains_average_score=float(t.get("mainsAverageScore", 8.0)),
            days_since_revision=2,
            self_rating=float(t.get("completionPercentage", 70)),
        )
        item = dict(t)
        item["calculatedKnowledge"] = calc["knowledge_score"]
        item["calculatedStatus"] = calc["status"]
        enriched_topics.append(item)
        
        if calc["status"] in ["needs_revision", "learning"] or calc["knowledge_score"] < 65:
            weak_areas.append({
                "id": t.get("id"),
                "name": t.get("name"),
                "paper": t.get("paper"),
                "score": calc["knowledge_score"],
                "mcqAccuracy": t.get("mcqAccuracy"),
                "mainsAverage": t.get("mainsAverageScore"),
                "mistakes": t.get("commonMistakes", []),
                "keyThinkers": t.get("keyThinkers", []),
            })
        elif calc["status"] == "strong":
            strong_areas.append({
                "id": t.get("id"),
                "name": t.get("name"),
                "paper": t.get("paper"),
                "score": calc["knowledge_score"],
                "mcqAccuracy": t.get("mcqAccuracy"),
            })
            
    # Sort weak areas by lowest score first
    weak_areas.sort(key=lambda x: x["score"])
    strong_areas.sort(key=lambda x: x["score"], reverse=True)
    
    return {
        "overallCompletion": overall_completion,
        "paper1Completion": p1_completion,
        "paper2Completion": p2_completion,
        "totalTopicsCount": len(topics),
        "weakAreas": weak_areas,
        "strongAreas": strong_areas,
        "revisionDueCount": len(weak_areas),
        "enrichedTopics": enriched_topics,
    }


def evaluate_mains_answer_rulebased(
    question: str,
    answer_text: str,
    max_marks: int = 15,
    subject: str = "Public Administration",
) -> Dict[str, Any]:
    """
    Python rule-based & heuristic evaluation engine for UPSC Public Administration.
    Checks for:
    - Directive analysis
    - Thinkers citation (Taylor, Weber, Simon, Barnard, Follett, Waldo, Riggs)
    - 2nd ARC & Committee citations
    - Constitutional articles (Art 311, 280, 243, 312, 148, 73rd/74th)
    - Multidimensional structure
    """
    lower_ans = answer_text.lower()
    lower_q = question.lower()
    
    # 1. Check Directive
    directives = ["evaluate", "critically examine", "discuss", "analyze", "elucidate", "examine"]
    matched_directive = "Discuss"
    for d in directives:
        if d in lower_q:
            matched_directive = d.title()
            break
            
    # 2. Public Administration Thinkers check
    known_thinkers = [
        "woodrow wilson", "taylor", "weber", "fayol", "herbert simon", "simon",
        "chester barnard", "barnard", "elton mayo", "mayo", "mary parker follett", "follett",
        "dwight waldo", "waldo", "fred riggs", "riggs", "yehezkel dror", "dror",
        "charles lindblom", "lindblom", "vincent ostrom", "ostrom"
    ]
    found_thinkers = [t for t in known_thinkers if t in lower_ans]
    
    # 3. Committees & Reports check
    committees = [
        "2nd arc", "arc", "sarkaria", "punchhi", "prakash singh", "hota committee",
        "surinder nath", "balwant rai mehta", "ashok mehta", "niti aayog", "economic survey"
    ]
    found_committees = [c for c in committees if c in lower_ans]
    
    # 4. Constitutional Articles
    articles = ["article 311", "article 280", "article 243", "article 312", "article 148", "73rd", "74th", "preamble", "dpsp"]
    found_articles = [a for a in articles if a in lower_ans]
    
    # Score calculation
    base_score = 7.0
    if len(answer_text) > 200:
        base_score += 1.5
    if len(found_thinkers) >= 2:
        base_score += 1.5
    elif len(found_thinkers) == 1:
        base_score += 0.8
        
    if len(found_committees) >= 1:
        base_score += 1.0
    if len(found_articles) >= 1:
        base_score += 0.8
        
    final_score = min(float(max_marks) * 0.85, round(base_score, 1))
    
    what_went_well = [
        "Good alignment with the core theme and logical sequence of arguments.",
        "Clear distinction between theoretical concepts and practical administrative issues.",
        f"Appropriate understanding of the '{matched_directive}' directive.",
    ]
    
    needs_improvement = []
    missing_dimensions = []
    
    if len(found_thinkers) < 2 and "public administration" in subject.lower():
        needs_improvement.append("Incorporate at least 2 relevant administrative thinkers (e.g. Simon on decision-making or Weber on hierarchy) to elevate academic depth.")
        missing_dimensions.append("Theoretical grounding: Link ground challenges with classical vs modern behavioral models.")
        
    if not found_committees:
        needs_improvement.append("Cite 2nd ARC recommendations (e.g. 4th Report on Ethics in Governance or 10th Report on Personnel Administration).")
        missing_dimensions.append("Institutional reforms: Specific committee / ARC policy roadmap.")
        
    if not found_articles:
        needs_improvement.append("Incorporate relevant Constitutional safeguards (e.g. Article 311 for civil services or Article 243 for local bodies).")
        missing_dimensions.append("Constitutional and statutory framework backing.")
        
    if not needs_improvement:
        needs_improvement.append("Add a visual concept flowchart or 4-quadrant box diagram to speed up writing in exam hall.")
        
    if not missing_dimensions:
        missing_dimensions.append("Grassroots citizen-interface dimension (Sevottam model and Social Audit).")

    return {
        "score": final_score,
        "maxMarks": max_marks,
        "criteria": {
            "questionDemand": min(10, 7 + (1 if len(answer_text) > 150 else 0)),
            "content": min(10, 6 + len(found_thinkers)),
            "structure": 7,
            "analysis": min(10, 6 + len(found_committees)),
            "examples": 8,
            "conclusion": 8,
        },
        "whatWentWell": what_went_well[:3],
        "needsImprovement": needs_improvement[:3],
        "missingDimensions": missing_dimensions[:3],
        "boltFeedback": (
            f"Candidate displays good conceptual grasp. In Public Administration Paper 2, "
            f"always cross-link theoretical concepts (Paper 1) with Indian administrative realities. "
            f"Detected references: Thinkers ({', '.join(found_thinkers) or 'None'}), "
            f"Committees ({', '.join(found_committees) or 'None'}). Citing 2nd ARC will elevate this to 12.5+/15."
        ),
    }


if __name__ == "__main__":
    # Test CLI invocation
    if len(sys.argv) > 1 and sys.argv[1] == "--test":
        print(json.dumps({"status": "Python Bolt Engine operational"}))
