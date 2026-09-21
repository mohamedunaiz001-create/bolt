#!/usr/bin/env python3
"""
BOLT - UPSC Python SQLite Persistence Layer
Provides lightweight, reliable local database storage for:
- User accounts and authentication credentials
- Conversational chat threads and thought-process logs
- Syllabus topic mastery and multi-signal metrics
- Mains answer evaluations and score breakdowns
- Study timetable slots and revision tasks
"""

import os
import sqlite3
import hashlib
import json
import uuid
from datetime import datetime
from typing import Dict, List, Optional, Any, Tuple

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "bolt_upsc.db")


def get_db_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    """Initializes the database schema with necessary tables."""
    conn = get_db_connection()
    cur = conn.cursor()

    # Users Table
    cur.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        target_year INTEGER DEFAULT 2026,
        optional_subject TEXT DEFAULT 'Public Administration',
        role TEXT DEFAULT 'aspirant',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
    );
    """)

    # Chat Threads Table
    cur.execute("""
    CREATE TABLE IF NOT EXISTS chat_threads (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        title TEXT NOT NULL,
        mode TEXT DEFAULT 'public_admin',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users (id)
    );
    """)

    # Chat Messages Table
    cur.execute("""
    CREATE TABLE IF NOT EXISTS chat_messages (
        id TEXT PRIMARY KEY,
        thread_id TEXT NOT NULL,
        role TEXT NOT NULL,
        text TEXT NOT NULL,
        thought_process TEXT,
        reasoning_phases_json TEXT,
        mode TEXT,
        engine TEXT,
        timestamp TEXT,
        created_at TEXT NOT NULL,
        FOREIGN KEY (thread_id) REFERENCES chat_threads (id) ON DELETE CASCADE
    );
    """)

    # Syllabus Topic Mastery Table
    cur.execute("""
    CREATE TABLE IF NOT EXISTS syllabus_progress (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        topic_id TEXT NOT NULL,
        topic_name TEXT NOT NULL,
        paper TEXT NOT NULL,
        completion_pct REAL DEFAULT 0,
        knowledge_score REAL DEFAULT 0,
        mcq_accuracy REAL DEFAULT 0,
        attempts_count INTEGER DEFAULT 0,
        mains_avg_score REAL DEFAULT 0,
        status TEXT DEFAULT 'needs_revision',
        updated_at TEXT NOT NULL,
        UNIQUE(user_id, topic_id)
    );
    """)

    # Mains Answer Evaluations Table
    cur.execute("""
    CREATE TABLE IF NOT EXISTS mains_evaluations (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        question TEXT NOT NULL,
        answer TEXT NOT NULL,
        score REAL NOT NULL,
        max_marks REAL NOT NULL,
        subject TEXT NOT NULL,
        rubric_breakdown_json TEXT,
        feedback TEXT,
        evaluated_at TEXT NOT NULL
    );
    """)

    # NCERT Quiz Attempts Table
    cur.execute("""
    CREATE TABLE IF NOT EXISTS ncert_quiz_logs (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        chapter_id TEXT NOT NULL,
        score INTEGER NOT NULL,
        total_questions INTEGER NOT NULL,
        accuracy_pct REAL NOT NULL,
        attempted_at TEXT NOT NULL
    );
    """)

    # Timetable Slots Table
    cur.execute("""
    CREATE TABLE IF NOT EXISTS timetable_slots (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        day TEXT NOT NULL,
        start_time TEXT NOT NULL,
        end_time TEXT NOT NULL,
        topic TEXT NOT NULL,
        activity TEXT NOT NULL,
        paper TEXT NOT NULL,
        is_completed INTEGER DEFAULT 0
    );
    """)

    conn.commit()

    # Seed demo user if no users exist
    cur.execute("SELECT COUNT(*) FROM users")
    if cur.fetchone()[0] == 0:
        demo_id = "user-demo-1"
        now = datetime.utcnow().isoformat()
        pwd_hash = hashlib.sha256("upsc2026".encode("utf-8")).hexdigest()
        cur.execute("""
        INSERT INTO users (id, email, name, password_hash, target_year, optional_subject, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (demo_id, "aspirant@bolt.upsc", "Civil Services Aspirant", pwd_hash, 2026, "Public Administration", now, now))

        # Seed initial thread
        thread_id = "thread-diagnostic"
        cur.execute("""
        INSERT INTO chat_threads (id, user_id, title, mode, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?)
        """, (thread_id, demo_id, "UPSC Preparation Diagnostic & Strategy", "public_admin", now, now))

        # Seed initial message
        msg_id = "msg-init-1"
        welcome_text = "Welcome to BOLT - UPSC Conversational Academic Mentor powered by Python."
        cur.execute("""
        INSERT INTO chat_messages (id, thread_id, role, text, thought_process, mode, engine, timestamp, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (msg_id, thread_id, "assistant", welcome_text, "Initialized candidate greeting and readiness state.", "public_admin", "BOLT Python Engine", "Just now", now))

        conn.commit()

    conn.close()


def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode("utf-8")).hexdigest()


def register_user(email: str, password: str, name: str, optional_subject: str = "Public Administration") -> Dict[str, Any]:
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT id FROM users WHERE email = ?", (email.lower().strip(),))
    if cur.fetchone():
        conn.close()
        raise ValueError("User with this email already exists.")

    user_id = f"user-{uuid.uuid4().hex[:10]}"
    now = datetime.utcnow().isoformat()
    pwd_hash = hash_password(password)

    cur.execute("""
    INSERT INTO users (id, email, name, password_hash, target_year, optional_subject, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (user_id, email.lower().strip(), name.strip(), pwd_hash, 2026, optional_subject, now, now))
    conn.commit()
    conn.close()

    return {
        "id": user_id,
        "email": email,
        "name": name,
        "optional_subject": optional_subject,
        "target_year": 2026,
    }


def authenticate_user(email: str, password: str) -> Optional[Dict[str, Any]]:
    conn = get_db_connection()
    cur = conn.cursor()
    pwd_hash = hash_password(password)
    cur.execute("SELECT id, email, name, target_year, optional_subject, role FROM users WHERE email = ? AND password_hash = ?",
                (email.lower().strip(), pwd_hash))
    row = cur.fetchone()
    conn.close()
    if not row:
        return None
    return dict(row)


def get_user_threads(user_id: str) -> List[Dict[str, Any]]:
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("""
    SELECT t.id, t.title, t.mode, t.created_at, t.updated_at, COUNT(m.id) as message_count
    FROM chat_threads t
    LEFT JOIN chat_messages m ON t.id = m.thread_id
    WHERE t.user_id = ?
    GROUP BY t.id
    ORDER BY t.updated_at DESC
    """, (user_id,))
    rows = cur.fetchall()
    result = []
    for r in rows:
        thread_dict = dict(r)
        # Fetch last message snippet
        cur.execute("SELECT text FROM chat_messages WHERE thread_id = ? ORDER BY created_at DESC LIMIT 1", (r["id"],))
        last_m = cur.fetchone()
        thread_dict["lastSnippet"] = last_m["text"][:80] + "..." if last_m else "No messages"
        result.append(thread_dict)
    conn.close()
    return result


def get_thread_messages(thread_id: str) -> List[Dict[str, Any]]:
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("""
    SELECT id, role, text, thought_process, reasoning_phases_json, mode, engine, timestamp, created_at
    FROM chat_messages
    WHERE thread_id = ?
    ORDER BY created_at ASC
    """, (thread_id,))
    rows = cur.fetchall()
    conn.close()
    result = []
    for r in rows:
        d = dict(r)
        if d.get("reasoning_phases_json"):
            try:
                d["reasoningPhases"] = json.loads(d["reasoning_phases_json"])
            except Exception:
                d["reasoningPhases"] = []
        result.append(d)
    return result


def save_chat_message(thread_id: str, role: str, text: str, thought_process: str = "",
                      reasoning_phases: Optional[List[Any]] = None, mode: str = "public_admin",
                      engine: str = "BOLT Python Engine") -> Dict[str, Any]:
    conn = get_db_connection()
    cur = conn.cursor()
    msg_id = f"m-{uuid.uuid4().hex[:10]}"
    now = datetime.utcnow().isoformat()
    phases_json = json.dumps(reasoning_phases) if reasoning_phases else None
    timestamp = datetime.now().strftime("%I:%M %p")

    cur.execute("""
    INSERT INTO chat_messages (id, thread_id, role, text, thought_process, reasoning_phases_json, mode, engine, timestamp, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (msg_id, thread_id, role, text, thought_process, phases_json, mode, engine, timestamp, now))

    # Update thread's updated_at
    cur.execute("UPDATE chat_threads SET updated_at = ? WHERE id = ?", (now, thread_id))
    conn.commit()
    conn.close()

    return {
        "id": msg_id,
        "threadId": thread_id,
        "role": role,
        "text": text,
        "thoughtProcess": thought_process,
        "timestamp": timestamp,
        "mode": mode,
        "engine": engine,
    }


def create_thread(user_id: str, title: str = "New Conversation", mode: str = "public_admin") -> Dict[str, Any]:
    conn = get_db_connection()
    cur = conn.cursor()
    thread_id = f"thread-{uuid.uuid4().hex[:10]}"
    now = datetime.utcnow().isoformat()
    cur.execute("""
    INSERT INTO chat_threads (id, user_id, title, mode, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?)
    """, (thread_id, user_id, title, mode, now, now))
    conn.commit()
    conn.close()
    return {
        "id": thread_id,
        "userId": user_id,
        "title": title,
        "mode": mode,
        "createdAt": now,
        "updatedAt": now,
    }


def rename_thread(thread_id: str, new_title: str):
    conn = get_db_connection()
    cur = conn.cursor()
    now = datetime.utcnow().isoformat()
    cur.execute("UPDATE chat_threads SET title = ?, updated_at = ? WHERE id = ?", (new_title.strip(), now, thread_id))
    conn.commit()
    conn.close()


def delete_thread(thread_id: str):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("DELETE FROM chat_messages WHERE thread_id = ?", (thread_id,))
    cur.execute("DELETE FROM chat_threads WHERE id = ?", (thread_id,))
    conn.commit()
    conn.close()


def save_mains_evaluation(user_id: str, question: str, answer: str, score: float, max_marks: float,
                          subject: str, rubric: Dict[str, Any], feedback: str) -> str:
    conn = get_db_connection()
    cur = conn.cursor()
    eval_id = f"eval-{uuid.uuid4().hex[:10]}"
    now = datetime.utcnow().isoformat()
    cur.execute("""
    INSERT INTO mains_evaluations (id, user_id, question, answer, score, max_marks, subject, rubric_breakdown_json, feedback, evaluated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (eval_id, user_id, question, answer, score, max_marks, subject, json.dumps(rubric), feedback, now))
    conn.commit()
    conn.close()
    return eval_id


def get_db_statistics() -> Dict[str, Any]:
    init_db()
    conn = get_db_connection()
    cur = conn.cursor()
    stats = {}
    for table in ["users", "chat_threads", "chat_messages", "mains_evaluations", "ncert_quiz_logs", "syllabus_progress"]:
        cur.execute(f"SELECT COUNT(*) FROM {table}")
        stats[table] = cur.fetchone()[0]
    conn.close()
    return {
        "db_path": DB_PATH,
        "database_type": "SQLite3",
        "counts": stats,
    }


if __name__ == "__main__":
    init_db()
    print("[*] BOLT SQLite Database Initialized.")
    print(json.dumps(get_db_statistics(), indent=2))
