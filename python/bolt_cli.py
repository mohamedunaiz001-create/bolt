#!/usr/bin/env python3
"""
BOLT - UPSC Python Master Command Line Tool (CLI) & Interactive Terminal Shell
Provides command-line commands for:
  - Document parsing & quiz generation
  - 1855-2026 PYQ retrieval with peripheral areas & current affairs filters
  - NCERT Class 6-12 foundational syllabus and quizzes
  - Student analytics & multi-signal knowledge scoring
  - Mains answer evaluation against 15-mark rubrics
  - Conversational AI Mentor with transparent Claude-grade reasoning
  - Interactive Terminal Shell (REPL)
  - SQLite database management
  - HTTP Server launcher
"""

import sys
import os
import json
import argparse

# Add local directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from bolt_engine import analyze_student_progress, evaluate_mains_answer_rulebased, DEFAULT_SYLLABUS
from bolt_materials import extract_material_content, generate_questions_from_text
from bolt_pyqs import filter_pyqs, get_pyq_statistics, ALL_PYQS
from bolt_ncert import get_ncert_chapters, get_ncert_quiz_for_chapter, get_ncert_summary_stats
from bolt_chat import generate_conversational_mentor_reply
import bolt_db


BANNER = """
======================================================================
  ⚡ BOLT AI - UPSC Civil Services Academic Mentor & Python Engine
  Python 3.10 | 1855-2026 PYQs | NCERT 6-12 | SQLite Persistence
======================================================================
"""


def run_interactive_shell():
    """Interactive command-line shell for aspirants."""
    print(BANNER)
    print("Type 'help' for available commands, 'exit' or 'quit' to exit.\n")

    while True:
        try:
            cmd_input = input("\033[1;34mbolt-upsc>\033[0m ").strip()
            if not cmd_input:
                continue

            if cmd_input in ["exit", "quit", "q"]:
                print("Exiting BOLT Python shell. Happy studying!")
                break

            elif cmd_input == "help":
                print("""
Available Commands:
  status                 Show system architecture and database status
  pyqs [era]             Search 1855-2026 PYQs (eras: 19th_century, modern, all)
  ncert                  List NCERT foundation chapters
  analytics              Run syllabus diagnostic and readiness scoring
  mentor <question>      Ask BOLT AI Mentor (with step-by-step reasoning)
  evaluate <text>        Evaluate a Mains answer sample
  db                     Display SQLite database statistics
  clear                  Clear the terminal screen
  exit                   Exit shell
""")

            elif cmd_input == "clear":
                os.system("clear" if os.name == "posix" else "cls")

            elif cmd_input == "status":
                stats = bolt_db.get_db_statistics()
                pyq_stats = get_pyq_statistics()
                print(f"Engine: BOLT Unified Python Engine 3.10")
                print(f"Total PYQs: {pyq_stats['totalQuestions']} (1855-2026)")
                print(f"Database: {stats['db_path']}")
                print(f"Users: {stats['counts']['users']}, Threads: {stats['counts']['chat_threads']}")

            elif cmd_input.startswith("pyqs"):
                parts = cmd_input.split()
                era = parts[1] if len(parts) > 1 else "all"
                results = filter_pyqs(era=era)
                print(f"\nFound {len(results)} questions for era '{era}':\n")
                for q in results[:3]:
                    print(f"[{q['id']}] ({q['year']}) - {q['topic']}")
                    print(f"Q: {q['questionText'][:160]}...")
                    print(f"Correct: {q['correctOption']}\n")
                if len(results) > 3:
                    print(f"... and {len(results) - 3} more. Run CLI for full JSON output.")

            elif cmd_input.startswith("mentor"):
                query = cmd_input[6:].strip()
                if not query:
                    print("Usage: mentor <your question for BOLT AI>")
                    continue
                print("\n\033[1;33m[BOLT Thinking Process...]\033[0m")
                reply = generate_conversational_mentor_reply(query, "Aspirant")
                for phase in reply["reasoningPhases"]:
                    print(f"\033[1;36m▶ {phase['title']}\033[0m\n  {phase['content']}\n")
                print("\033[1;32m[Mentor Response]\033[0m")
                print(reply["text"])
                print()

            elif cmd_input.startswith("evaluate"):
                user_answer = cmd_input[8:].strip()
                if not user_answer:
                    print("Usage: evaluate <your answer text to evaluate>")
                    continue
                sample_q = "Discuss the significance of Bounded Rationality in decision making."
                res = evaluate_mains_answer_rulebased(sample_q, user_answer, 15, "Public Administration")
                print(f"\nEvaluated Score: {res['score']}/{res['maxMarks']} ({res['percentage']}%)")
                print(f"Band: {res['band']}")
                print(f"Feedback: {res['feedback']}\n")

            elif cmd_input == "ncert":
                stats = get_ncert_summary_stats()
                print(f"Total NCERT Chapters: {stats['totalChapters']}")
                print(f"Classes: {stats['classesCovered']}, Subjects: {list(stats['subjectBreakdown'].keys())}")

            elif cmd_input == "analytics":
                diag = analyze_student_progress(DEFAULT_SYLLABUS)
                print(f"Overall Completion: {diag['overallCompletion']}%")
                print(f"Paper 1: {diag['paper1Completion']}%, Paper 2: {diag['paper2Completion']}%")
                print(f"Weak Topics: {', '.join(w['name'] for w in diag['weakTopics'])}")

            elif cmd_input == "db":
                print(json.dumps(bolt_db.get_db_statistics(), indent=2))

            else:
                print(f"Unknown command: '{cmd_input}'. Type 'help' for instructions.")

        except KeyboardInterrupt:
            print("\nType 'exit' to quit.")
        except Exception as e:
            print(f"Error: {e}")


def main():
    parser = argparse.ArgumentParser(
        description="BOLT UPSC Master Python Engine (1855-2026 PYQs, Materials, NCERT & Analytics)",
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    subparsers = parser.add_subparsers(dest="subcommand", help="Module command to execute")

    # Subcommand: interactive
    subparsers.add_parser("interactive", help="Launch interactive terminal shell")

    # Subcommand: pyqs
    pyq_parser = subparsers.add_parser("pyqs", help="1855-2026 PYQ database engine")
    pyq_parser.add_argument("--era", choices=["19th_century", "early_20th_century", "post_independence", "modern", "all"], default="all")
    pyq_parser.add_argument("--peripheral", action="store_true", help="Filter for peripheral area questions")
    pyq_parser.add_argument("--current-affairs", action="store_true", help="Filter for current affairs integration")
    pyq_parser.add_argument("--search", help="Search keyword")
    pyq_parser.add_argument("--stats", action="store_true", help="Print PYQ dataset stats")

    # Subcommand: materials
    mat_parser = subparsers.add_parser("materials", help="Process PDF/DOCX/TXT and generate questions")
    mat_parser.add_argument("--file", help="Path to study material file (.pdf, .docx, .txt)")
    mat_parser.add_argument("--questions", type=int, default=5, help="Number of questions to generate")
    mat_parser.add_argument("--demo", action="store_true", help="Use built-in 2nd ARC document sample")

    # Subcommand: ncert
    ncert_parser = subparsers.add_parser("ncert", help="NCERT Class 6-12 foundation module")
    ncert_parser.add_argument("--subject", choices=["Polity", "History", "Geography", "Economy", "Science", "all"], default="all")
    ncert_parser.add_argument("--class-num", type=int, choices=[6, 7, 8, 9, 10, 11, 12])
    ncert_parser.add_argument("--chapter-id", help="Chapter ID to fetch quiz")
    ncert_parser.add_argument("--summary", action="store_true", help="Print NCERT module summary")

    # Subcommand: analytics
    subparsers.add_parser("analytics", help="Run student diagnostic analytics")

    # Subcommand: mentor
    mentor_parser = subparsers.add_parser("mentor", help="Ask BOLT Conversational AI Mentor")
    mentor_parser.add_argument("--query", required=True, help="Question or topic for the mentor")
    mentor_parser.add_argument("--user", default="Aspirant", help="User candidate name")
    mentor_parser.add_argument("--subject", default="Public Administration", help="Subject domain")

    # Subcommand: evaluate
    eval_parser = subparsers.add_parser("evaluate", help="Evaluate a Mains answer against 15-marker rubric")
    eval_parser.add_argument("--question", required=True, help="Mains question text")
    eval_parser.add_argument("--answer", required=True, help="Candidate written answer text")
    eval_parser.add_argument("--marks", type=float, default=15.0, help="Total question marks")
    eval_parser.add_argument("--subject", default="Public Administration", help="Subject domain")

    # Subcommand: db
    subparsers.add_parser("db", help="View SQLite database statistics and tables")

    # Subcommand: serve
    serve_parser = subparsers.add_parser("serve", help="Launch Python HTTP REST server")
    serve_parser.add_argument("--port", type=int, default=8080, help="Port to listen on")
    serve_parser.add_argument("--host", default="0.0.0.0", help="Host to bind to")

    # Subcommand: status
    subparsers.add_parser("status", help="Print Python engine architecture status")

    args = parser.parse_args()

    if args.subcommand == "interactive":
        run_interactive_shell()

    elif args.subcommand == "pyqs":
        if args.stats:
            print(json.dumps(get_pyq_statistics(), indent=2))
        else:
            res = filter_pyqs(
                era=args.era,
                peripheral_only=args.peripheral,
                current_affairs_only=args.current_affairs,
                search_query=args.search,
            )
            print(json.dumps({"total": len(res), "questions": res}, indent=2))

    elif args.subcommand == "materials":
        if args.demo or not args.file:
            sample_text = (
                "The 2nd Administrative Reforms Commission (10th Report) recommended the creation of a statutory Civil Services Authority "
                "to oversee senior appointments, transfers, and tenures. Arbitrary transfers undermine civil servant morale and public accountability. "
                "Under the Fifth Schedule, tribal customary self-governance and PESA empower Gram Sabhas with resource ownership."
            )
            extracted = {
                "filename": "Sample_UPSC_Notes.txt",
                "fileType": "TXT",
                "wordCount": len(sample_text.split()),
                "summary": sample_text,
                "detectedTags": ["Public Administration", "Polity & Governance"],
                "peripheralAreas": ["Tribal Customary Laws & PESA Peripheral Provisions"],
                "gsPaperMapping": ["GS 2"],
            }
            qs = generate_questions_from_text(sample_text, "Sample UPSC Notes", args.questions)
            print(json.dumps({"extracted": extracted, "questions": qs}, indent=2))
        else:
            extracted = extract_material_content(args.file)
            qs = generate_questions_from_text(extracted["rawText"], extracted["filename"], args.questions)
            print(json.dumps({"extracted": extracted, "questions": qs}, indent=2))

    elif args.subcommand == "ncert":
        if args.summary:
            print(json.dumps(get_ncert_summary_stats(), indent=2))
        elif args.chapter_id:
            qs = get_ncert_quiz_for_chapter(args.chapter_id)
            print(json.dumps({"chapterId": args.chapter_id, "questions": qs}, indent=2))
        else:
            chapters = get_ncert_chapters(subject=args.subject, class_num=args.class_num)
            print(json.dumps({"total": len(chapters), "chapters": chapters}, indent=2))

    elif args.subcommand == "analytics":
        res = analyze_student_progress(DEFAULT_SYLLABUS)
        print(json.dumps(res, indent=2))

    elif args.subcommand == "mentor":
        reply = generate_conversational_mentor_reply(args.query, args.user, args.subject)
        print(json.dumps(reply, indent=2))

    elif args.subcommand == "evaluate":
        eval_res = evaluate_mains_answer_rulebased(args.question, args.answer, args.marks, args.subject)
        print(json.dumps(eval_res, indent=2))

    elif args.subcommand == "db":
        print(json.dumps(bolt_db.get_db_statistics(), indent=2))

    elif args.subcommand == "serve":
        from bolt_server import run_server
        run_server(port=args.port, host=args.host)

    elif args.subcommand == "status" or not args.subcommand:
        status = {
            "engine": "BOLT Unified Python Engine",
            "version": sys.version.split()[0],
            "architecture": "Python 3.10 Micro-Services & Standard Library Core",
            "database": bolt_db.get_db_statistics(),
            "modules": {
                "materials": "PDF / DOCX / TXT extractor & question generator",
                "pyqs": "1855-2026 Comprehensive PYQ database with Peripheral Areas & Current Affairs",
                "ncert": "Class 6-12 Foundation Curriculum & Chapter Quizzes",
                "analytics": "Diagnostic multi-signal scoring & Ebbinghaus curve",
                "mentor": "Claude-Grade conversational reasoning and thinker synthesis",
                "database": "SQLite persistence for threads, evaluations, and progress",
            },
            "status": "Operational & Ready",
        }
        print(json.dumps(status, indent=2))


if __name__ == "__main__":
    main()
