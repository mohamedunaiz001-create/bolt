#!/usr/bin/env python3
"""
BOLT UPSC Python Interactive CLI & Terminal Assistant
Usage: python3 python/bolt_cli.py
"""

import json
import sys
from bolt_engine import (
    analyze_student_progress,
    evaluate_mains_answer_rulebased,
    calculate_topic_knowledge,
)

SAMPLE_TOPICS = [
    {
        "id": "p1-1",
        "name": "Introduction & Meaning of Public Administration",
        "paper": "Paper 1",
        "completionPercentage": 85,
        "knowledgeScore": 82,
        "mcqAccuracy": 85,
        "attemptsCount": 42,
        "mainsAverageScore": 10.5,
        "status": "strong",
    },
    {
        "id": "p1-2",
        "name": "Administrative Thought & Thinkers (Simon, Weber, Taylor)",
        "paper": "Paper 1",
        "completionPercentage": 58,
        "knowledgeScore": 54,
        "mcqAccuracy": 55,
        "attemptsCount": 24,
        "mainsAverageScore": 6.8,
        "status": "needs_revision",
    },
    {
        "id": "p2-1",
        "name": "Evolution of Indian Administration (Kautilya to Modern)",
        "paper": "Paper 2",
        "completionPercentage": 90,
        "knowledgeScore": 88,
        "mcqAccuracy": 90,
        "attemptsCount": 38,
        "mainsAverageScore": 11.2,
        "status": "strong",
    },
    {
        "id": "p2-2",
        "name": "Civil Services & Administrative Reforms (2nd ARC, Lateral Entry)",
        "paper": "Paper 2",
        "completionPercentage": 52,
        "knowledgeScore": 48,
        "mcqAccuracy": 48,
        "attemptsCount": 18,
        "mainsAverageScore": 6.2,
        "status": "needs_revision",
    },
]


def print_banner():
    print("=" * 60)
    print(" ⚡ BOLT UPSC - Python Academic Intelligence CLI")
    print(" Public Administration & GS Preparation Engine")
    print("=" * 60)


def run_cli():
    print_banner()
    while True:
        print("\n[Menu Options]")
        print("1. Run Academic Diagnostics for Aspirant (Syllabus, Weak/Strong Areas)")
        print("2. Evaluate Public Administration Mains Answer")
        print("3. Test Multi-Signal Knowledge Scoring Algorithm")
        print("4. Exit")
        
        choice = input("\nEnter choice [1-4]: ").strip()
        if choice == "1":
            print("\nComputing Python diagnostics...")
            res = analyze_student_progress(SAMPLE_TOPICS)
            print(f"\n📊 Syllabus Completion:")
            print(f"   • Overall: {res['overallCompletion']}%")
            print(f"   • Paper 1: {res['paper1Completion']}%")
            print(f"   • Paper 2: {res['paper2Completion']}%")
            print(f"\n⚠️  Weak Areas (Need Revision):")
            for w in res["weakAreas"]:
                print(f"   - {w['name']} ({w['paper']}): Knowledge Score {w['score']}% (MCQ: {w['mcqAccuracy']}%)")
            print(f"\n✅ Strong Areas:")
            for s in res["strongAreas"]:
                print(f"   + {s['name']} ({s['paper']}): Knowledge Score {s['score']}%")

        elif choice == "2":
            print("\n--- Public Administration Mains Evaluator ---")
            q = input("Question Prompt: ") or "Evaluate the impact of Herbert Simon's Bounded Rationality on administrative decision making."
            print("\nEnter candidate answer text (or press Enter for default sample):")
            ans = input("> ")
            if not ans.strip():
                ans = "Herbert Simon introduced bounded rationality replacing classical economic man with administrative man who satisfices. Chester Barnard also argued for informal organization."
            res = evaluate_mains_answer_rulebased(q, ans, 15, "Public Administration")
            print(f"\n🎯 Score Awarded: {res['score']} / {res['maxMarks']}")
            print(f"⚡ Bolt Feedback: {res['boltFeedback']}")
            print("What went well:")
            for item in res["whatWentWell"]:
                print(f"  ✓ {item}")
            print("Needs improvement:")
            for item in res["needsImprovement"]:
                print(f"  ! {item}")

        elif choice == "3":
            print("\nTesting Knowledge Scoring:")
            acc = float(input("MCQ Accuracy % (e.g. 65): ") or 65)
            att = int(input("Attempts count (e.g. 25): ") or 25)
            mains = float(input("Mains average out of 15 (e.g. 8.5): ") or 8.5)
            score = calculate_topic_knowledge(acc, att, mains)
            print(f"Calculated Topic Knowledge: {score['knowledge_score']}% -> Status: {score['status']}")

        elif choice == "4":
            print("Exiting Bolt CLI. Happy prep!")
            break
        else:
            print("Invalid selection.")


if __name__ == "__main__":
    run_cli()
