#!/usr/bin/env python3
"""
BOLT - UPSC Python HTTP Server (Standard Library)
Provides REST endpoints for syllabus analytics, evaluation, and AI mentor
"""

import json
import sys
import os
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
from bolt_engine import (
    calculate_topic_knowledge,
    analyze_student_progress,
    evaluate_mains_answer_rulebased,
)
from bolt_materials import (
    extract_material_content,
    generate_questions_from_text,
    generate_extractive_summary,
    detect_upsc_themes,
)
from bolt_pyqs import filter_pyqs, get_pyq_statistics
from bolt_ncert import (
    get_ncert_chapters,
    get_ncert_quiz_for_chapter,
    get_ncert_summary_stats,
)

PORT = 8080

SAMPLE_TOPICS = [
    {
        "id": "p1-1",
        "name": "Introduction & Meaning of Public Administration",
        "paper": "Paper 1",
        "unit": "Unit 1",
        "completionPercentage": 85,
        "knowledgeScore": 82,
        "mcqAccuracy": 85,
        "attemptsCount": 42,
        "mainsAverageScore": 10.5,
        "status": "strong",
        "keyThinkers": ["Woodrow Wilson", "L.D. White", "Dwight Waldo"],
        "commonMistakes": ["Confusing Wilsonian dichotomy with Waldo's administrative state"],
    },
    {
        "id": "p1-2",
        "name": "Administrative Thought & Thinkers",
        "paper": "Paper 1",
        "unit": "Unit 2",
        "completionPercentage": 58,
        "knowledgeScore": 54,
        "mcqAccuracy": 55,
        "attemptsCount": 24,
        "mainsAverageScore": 6.8,
        "status": "needs_revision",
        "keyThinkers": ["Herbert Simon", "Chester Barnard", "F.W. Taylor", "Max Weber"],
        "commonMistakes": ["Omitting Barnard's 'Zone of Indifference' in authority questions"],
    },
    {
        "id": "p2-1",
        "name": "Evolution of Indian Administration",
        "paper": "Paper 2",
        "unit": "Unit 1",
        "completionPercentage": 90,
        "knowledgeScore": 88,
        "mcqAccuracy": 90,
        "attemptsCount": 38,
        "mainsAverageScore": 11.2,
        "status": "strong",
        "keyThinkers": ["Kautilya", "Mughal Mansabdari", "British Colonial Legacy"],
        "commonMistakes": ["Overlooking Kautilya's Saptanga theory in modern ethical administration"],
    },
    {
        "id": "p2-2",
        "name": "Civil Services & Administrative Reforms",
        "paper": "Paper 2",
        "unit": "Unit 5",
        "completionPercentage": 52,
        "knowledgeScore": 48,
        "mcqAccuracy": 48,
        "attemptsCount": 18,
        "mainsAverageScore": 6.2,
        "status": "needs_revision",
        "keyThinkers": ["2nd ARC 10th Report", "Hota Committee", "Prakash Singh directives"],
        "commonMistakes": ["Not quoting Article 311 safeguards vs lateral entry debates"],
    },
]


class BoltAPIHandler(BaseHTTPRequestHandler):
    def _send_cors_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")

    def do_OPTIONS(self):
        self.send_response(200)
        self._send_cors_headers()
        self.end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        query = parse_qs(parsed.query)

        if parsed.path == "/api/python/status":
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self._send_cors_headers()
            self.end_headers()
            response = {
                "status": "active",
                "engine": "BOLT Python Engine 3.10",
                "features": [
                    "Syllabus Multi-Signal Knowledge Scoring",
                    "UPSC Public Administration Diagnostic Engine",
                    "Study Materials (PDF/DOCX) Processing & MCQ Generation",
                    "1855-2026 Historical & Modern PYQs with Peripheral Areas",
                    "NCERT Class 6-12 Curriculum & Quizzes",
                    "Rule-based & Thinker Evaluator",
                    "Spaced Repetition Scheduler",
                ],
            }
            self.wfile.write(json.dumps(response).encode("utf-8"))

        elif parsed.path == "/api/python/pyqs":
            era = query.get("era", ["all"])[0]
            peripheral = query.get("peripheral", ["false"])[0].lower() == "true"
            current_affairs = query.get("current_affairs", ["false"])[0].lower() == "true"
            search = query.get("search", [None])[0]
            subject = query.get("subject", [None])[0]

            questions = filter_pyqs(
                era=era,
                peripheral_only=peripheral,
                current_affairs_only=current_affairs,
                search_query=search,
                subject=subject,
            )
            stats = get_pyq_statistics()

            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self._send_cors_headers()
            self.end_headers()
            self.wfile.write(json.dumps({
                "count": len(questions),
                "stats": stats,
                "questions": questions,
            }).encode("utf-8"))

        elif parsed.path == "/api/python/ncert/chapters":
            subject = query.get("subject", [None])[0]
            class_num = int(query.get("class", [0])[0]) or None
            chapters = get_ncert_chapters(subject=subject, class_num=class_num)
            stats = get_ncert_summary_stats()

            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self._send_cors_headers()
            self.end_headers()
            self.wfile.write(json.dumps({
                "count": len(chapters),
                "stats": stats,
                "chapters": chapters,
            }).encode("utf-8"))

        elif parsed.path == "/api/python/ncert/quiz":
            chapter_id = query.get("chapterId", [None])[0]
            questions = get_ncert_quiz_for_chapter(chapter_id) if chapter_id else []

            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self._send_cors_headers()
            self.end_headers()
            self.wfile.write(json.dumps({
                "chapterId": chapter_id,
                "questions": questions,
            }).encode("utf-8"))

        elif parsed.path == "/api/python/analytics":
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self._send_cors_headers()
            self.end_headers()
            res = analyze_student_progress(SAMPLE_TOPICS)
            self.wfile.write(json.dumps(res).encode("utf-8"))
        else:
            self.send_response(404)
            self.end_headers()

    def do_POST(self):
        parsed = urlparse(self.path)
        content_length = int(self.headers.get("Content-Length", 0))
        post_data = self.rfile.read(content_length).decode("utf-8")
        body = json.loads(post_data) if post_data else {}

        if parsed.path == "/api/python/materials/process":
            raw_text = body.get("text", "")
            doc_title = body.get("title", "Uploaded Material")
            count = int(body.get("questionsCount", 5))

            summary = generate_extractive_summary(raw_text)
            themes = detect_upsc_themes(raw_text)
            questions = generate_questions_from_text(raw_text, doc_title, count)

            response = {
                "title": doc_title,
                "wordCount": len(raw_text.split()),
                "summary": summary,
                "detectedTags": themes["tags"],
                "peripheralAreas": themes["peripheralAreas"],
                "gsPaperMapping": themes["gsPaper"],
                "questions": questions,
            }
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self._send_cors_headers()
            self.end_headers()
            self.wfile.write(json.dumps(response).encode("utf-8"))

        elif parsed.path == "/api/python/evaluate":
            question = body.get("question", "")
            answer = body.get("answer", "")
            subject = body.get("subject", "Public Administration")
            result = evaluate_mains_answer_rulebased(question, answer, 15, subject)
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self._send_cors_headers()
            self.end_headers()
            self.wfile.write(json.dumps(result).encode("utf-8"))

        elif parsed.path == "/api/python/diagnostics":
            topics = body.get("topics", SAMPLE_TOPICS)
            result = analyze_student_progress(topics)
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self._send_cors_headers()
            self.end_headers()
            self.wfile.write(json.dumps(result).encode("utf-8"))
        else:
            self.send_response(404)
            self.end_headers()


def run_server():
    server_address = ("", PORT)
    httpd = HTTPServer(server_address, BoltAPIHandler)
    print(f"[*] BOLT Python API Server running on port {PORT}...")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping Python API server.")
        httpd.server_close()


if __name__ == "__main__":
    run_server()
