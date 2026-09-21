#!/usr/bin/env python3
"""
BOLT - Comprehensive Python Test Suite
Verifies all core Python engine modules, database persistence, and analytics.
Zero external test dependencies required (runs with standard unittest).
"""

import sys
import os
import unittest
import json

# Add project root and python directory to path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, BASE_DIR)
sys.path.insert(0, os.path.join(BASE_DIR, "python"))

from python.bolt_engine import (
    calculate_topic_knowledge,
    analyze_student_progress,
    evaluate_mains_answer_rulebased,
    DEFAULT_SYLLABUS,
)
from python.bolt_materials import (
    detect_upsc_themes,
    generate_questions_from_text,
    generate_extractive_summary,
)
from python.bolt_pyqs import filter_pyqs, get_pyq_statistics, ALL_PYQS
from python.bolt_ncert import get_ncert_chapters, get_ncert_quiz_for_chapter, get_ncert_summary_stats
from python.bolt_chat import generate_conversational_mentor_reply, build_claude_thought_process
import python.bolt_db as bolt_db


class TestBoltEngine(unittest.TestCase):
    def test_knowledge_scoring_bounds(self):
        """Knowledge score must stay strictly between 10.0 and 98.0."""
        score_low = calculate_topic_knowledge(0, 0, 0, 15, 30, 0)
        self.assertGreaterEqual(score_low["knowledge_score"], 10.0)
        self.assertEqual(score_low["status"], "needs_revision")

        score_high = calculate_topic_knowledge(100, 50, 15, 15, 0, 100)
        self.assertLessEqual(score_high["knowledge_score"], 98.0)
        self.assertEqual(score_high["status"], "strong")

    def test_student_progress_analysis(self):
        """Analytics must identify weak and strong topics from syllabus."""
        analytics = analyze_student_progress(DEFAULT_SYLLABUS)
        self.assertIn("overallCompletion", analytics)
        self.assertIn("weakAreas", analytics)
        self.assertIn("strongAreas", analytics)
        self.assertGreater(len(analytics["weakAreas"]), 0)

    def test_mains_evaluation(self):
        """Rule-based evaluation must award rubric marks and provide constructive feedback."""
        question = "Critically analyze Herbert Simon's concept of Bounded Rationality in decision making."
        answer = (
            "Herbert Simon in Administrative Behavior challenged classical economic man. "
            "He introduced Administrative Man who satisfices rather than maximizes because of cognitive limits and time constraints. "
            "In Indian governance, this is reflected in administrative discretion, RTI, and 2nd ARC recommendations."
        )
        result = evaluate_mains_answer_rulebased(question, answer, 15.0, "Public Administration")
        self.assertIn("score", result)
        self.assertGreater(result["score"], 5.0)
        self.assertEqual(result["maxMarks"], 15.0)
        self.assertIn("criteria", result)
        self.assertIn("boltFeedback", result)


class TestBoltMaterials(unittest.TestCase):
    def test_theme_detection(self):
        """Theme detection must identify UPSC GS papers and peripheral tags."""
        sample_doc = (
            "The 2nd Administrative Reforms Commission recommended statutory Civil Services Authority. "
            "Under the Fifth Schedule, tribal customary self-governance and PESA empower Gram Sabhas with resource rights."
        )
        themes = detect_upsc_themes(sample_doc)
        self.assertIn("Public Administration", themes["tags"])
        self.assertIn("Paper 1 / Paper 2", themes["gsPaper"])
        self.assertTrue(len(themes["peripheralAreas"]) > 0)

    def test_mcq_generation(self):
        """Must generate structured MCQs with 4 options and correct answer."""
        text = "Lord Macaulay headed the 1854 Committee which established the open competitive examination for the Indian Civil Service in 1855."
        qs = generate_questions_from_text(text, "Colonial Civil Services", 2)
        self.assertGreaterEqual(len(qs), 1)
        q = qs[0]
        self.assertIn("options", q)
        self.assertEqual(len(q["options"]), 4)
        self.assertIn("correctOption", q)


class TestBoltPYQs(unittest.TestCase):
    def test_pyqs_filtering(self):
        """PYQ filtering must return historical 19th century and modern questions."""
        stats = get_pyq_statistics()
        self.assertGreater(stats["totalQuestions"], 5)

        nineteenth_century = filter_pyqs(era="19th_century")
        self.assertGreaterEqual(len(nineteenth_century), 1)
        self.assertEqual(nineteenth_century[0]["era"], "19th_century")

        peripheral = filter_pyqs(peripheral_only=True)
        self.assertTrue(all(q.get("isPeripheralArea") for q in peripheral))


class TestBoltNCERT(unittest.TestCase):
    def test_ncert_chapters_retrieval(self):
        """Must retrieve NCERT foundational syllabus chapters."""
        stats = get_ncert_summary_stats()
        self.assertGreater(stats["totalChapters"], 0)

        polity_ch = get_ncert_chapters(subject="Polity")
        self.assertGreaterEqual(len(polity_ch), 1)


class TestBoltMentor(unittest.TestCase):
    def test_mentor_step_by_step_reasoning(self):
        """Mentor response must include <thought> XML block and structured reasoning phases."""
        res = generate_conversational_mentor_reply("Explain Max Weber legal rational authority", "Candidate")
        self.assertIn("<thought>", res["thoughtProcess"])
        self.assertIn("</thought>", res["thoughtProcess"])
        self.assertEqual(len(res["reasoningPhases"]), 4)
        self.assertIn("Weber", res["text"])


class TestBoltDatabase(unittest.TestCase):
    def setUp(self):
        bolt_db.init_db()

    def test_database_lifecycle(self):
        """Tests user registration, auth, chat thread creation, and message persistence."""
        test_email = f"test_{os.urandom(4).hex()}@upsc.test"
        user = bolt_db.register_user(test_email, "secret123", "Test Candidate")
        self.assertIsNotNone(user["id"])

        auth_user = bolt_db.authenticate_user(test_email, "secret123")
        self.assertIsNotNone(auth_user)
        self.assertEqual(auth_user["email"], test_email)

        # Thread & message
        thread = bolt_db.create_thread(user["id"], "Administrative Thought Revision")
        self.assertIsNotNone(thread["id"])

        msg = bolt_db.save_chat_message(
            thread["id"],
            role="user",
            text="How does Chester Barnard define authority?",
            thought_process="Candidate asking about acceptance theory",
        )
        self.assertIsNotNone(msg["id"])

        messages = bolt_db.get_thread_messages(thread["id"])
        self.assertEqual(len(messages), 1)
        self.assertEqual(messages[0]["text"], "How does Chester Barnard define authority?")


if __name__ == "__main__":
    unittest.main(verbosity=2)
