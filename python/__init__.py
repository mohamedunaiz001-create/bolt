"""
BOLT - UPSC Civil Services Preparation & AI Mentorship Engine
Comprehensive Python Package
"""

__version__ = "3.10.0"
__author__ = "BOLT UPSC Academic Intelligence"

from .bolt_engine import (
    calculate_topic_knowledge,
    analyze_student_progress,
    evaluate_mains_answer_rulebased,
)
from .bolt_materials import (
    extract_material_content,
    generate_questions_from_text,
    generate_extractive_summary,
    detect_upsc_themes,
)
from .bolt_pyqs import filter_pyqs, get_pyq_statistics, ALL_PYQS
from .bolt_ncert import (
    get_ncert_chapters,
    get_ncert_quiz_for_chapter,
    get_ncert_summary_stats,
)
