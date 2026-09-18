#!/usr/bin/env python3
"""
BOLT - UPSC Python Master Command Line Tool (CLI)
Provides command-line commands for:
  - Document parsing & quiz generation
  - 1855-2026 PYQ retrieval with peripheral areas & current affairs filters
  - NCERT Class 6-12 foundational syllabus and quizzes
  - Student analytics & knowledge scoring
"""

import sys
import os
import json
import argparse

# Add local directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from bolt_engine import analyze_student_progress, evaluate_mains_answer_rulebased
from bolt_materials import extract_material_content, generate_questions_from_text
from bolt_pyqs import filter_pyqs, get_pyq_statistics
from bolt_ncert import get_ncert_chapters, get_ncert_quiz_for_chapter, get_ncert_summary_stats


def main():
    parser = argparse.ArgumentParser(
        description="BOLT UPSC Master Python Engine (1855-2026 PYQs, Materials, NCERT & Analytics)",
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    subparsers = parser.add_subparsers(dest="subcommand", help="Module command to execute")

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

    # Subcommand: status
    subparsers.add_parser("status", help="Print Python engine architecture status")

    args = parser.parse_args()

    if args.subcommand == "pyqs":
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
        res = analyze_student_progress([])
        print(json.dumps(res, indent=2))

    elif args.subcommand == "status" or not args.subcommand:
        status = {
            "engine": "BOLT Unified Python Engine",
            "version": sys.version.split()[0],
            "architecture": "Python 3.10 Micro-Services & Standard Library Core",
            "modules": {
                "materials": "PDF / DOCX / TXT extractor & question generator",
                "pyqs": "1855-2026 Comprehensive PYQ database with Peripheral Areas & Current Affairs",
                "ncert": "Class 6-12 Foundation Curriculum & Chapter Quizzes",
                "analytics": "Diagnostic multi-signal scoring & Ebbinghaus curve",
            },
            "status": "Operational & Ready",
        }
        print(json.dumps(status, indent=2))


if __name__ == "__main__":
    main()
