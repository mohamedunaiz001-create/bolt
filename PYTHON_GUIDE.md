# ⚡ BOLT - Complete Python-Based Project Guide

**BOLT** is a production-grade, full-stack UPSC Civil Services Examination preparation system and conversational academic mentor. The entire academic intelligence layer, analytical scoring, historical examination database, document extraction engine, and REST API backend are built in **Python 3.10+**.

---

## 🚀 Quick Start (Zero External Dependencies)

BOLT's core engine, CLI, REST API server, and SQLite persistence layer run directly on the **Python standard library**:

```bash
# 1. Launch the Interactive Terminal REPL
python3 main.py

# 2. Run the Full Python REST & Web Server (Port 8080 or custom port)
python3 main.py --serve --port 8080

# 3. Run the Automated Python Test Suite
python3 main.py --test

# 4. Ask the Claude-Grade AI Mentor directly
python3 main.py mentor --query "Explain Herbert Simon's Bounded Rationality"
```

---

## 📂 Python Project Architecture

```text
├── main.py                    # Root entry point (CLI, Server, REPL, Tests)
├── test_bolt.py               # Comprehensive Python unittest suite
├── requirements.txt           # Python dependency declarations
├── setup.py                   # Python package installer (pip install -e .)
├── pyproject.toml             # Modern pyproject configuration
│
└── python/
    ├── __init__.py            # Python package initializer
    ├── bolt_engine.py         # Multi-signal knowledge scoring & Ebbinghaus curve
    ├── bolt_chat.py           # Claude-grade conversational mentor with reasoning phases
    ├── bolt_db.py             # SQLite persistence (users, threads, logs, rubrics)
    ├── bolt_pyqs.py           # 1855-2026 Historical & Modern PYQ dataset & filters
    ├── bolt_materials.py      # PDF / DOCX / TXT extractor & UPSC MCQ generator
    ├── bolt_ncert.py          # Class 6-12 NCERT curriculum & chapter quizzes
    ├── bolt_server.py         # Full REST API server (HTTP, CORS, Static SPA fallback)
    ├── bolt_cli.py            # Master CLI tool & interactive terminal shell
    ├── bolt_train.py          # LoRA / QLoRA fine-tuning pipeline (PyTorch + TRL)
    ├── bolt_upsc.db           # SQLite database file
    └── ncert_data.json        # Structured NCERT curriculum database
```

---

## 🛠️ CLI Commands & Subcommands

BOLT provides a complete command-line interface:

### 1. Interactive Terminal Shell
```bash
python3 python/bolt_cli.py interactive
# Or simply:
python3 main.py
```

### 2. Conversational AI Mentor (Step-by-Step Reasoning)
```bash
python3 python/bolt_cli.py mentor --query "Explain Max Weber's Ideal-Type Bureaucracy"
```
Produces transparent multi-phase reasoning:
- **Phase 1**: Intent & Syllabus Mapping
- **Phase 2**: Theoretical & Thinker Synthesis
- **Phase 3**: Indian Administrative Reality & 2nd ARC
- **Phase 4**: UPSC Answer Structure Formulation

### 3. 1855–2026 Historical PYQs
```bash
# Search 19th Century ICS questions
python3 python/bolt_cli.py pyqs --era 19th_century

# Filter for peripheral areas (tribal laws, colonial civil services)
python3 python/bolt_cli.py pyqs --peripheral

# View dataset statistics
python3 python/bolt_cli.py pyqs --stats
```

### 4. Study Materials Processing & MCQ Generation
```bash
# Run demo on built-in 2nd ARC document sample
python3 python/bolt_cli.py materials --demo --questions 5

# Parse your own notes
python3 python/bolt_cli.py materials --file /path/to/notes.pdf --questions 10
```

### 5. NCERT Foundation Modules
```bash
# Summary of Class 6-12 coverage
python3 python/bolt_cli.py ncert --summary

# Fetch chapters for Class 11 Polity
python3 python/bolt_cli.py ncert --subject Polity --class-num 11

# Take a quiz for a specific chapter
python3 python/bolt_cli.py ncert --chapter-id ncert-polity-11-1
```

### 6. Rule-Based Mains Answer Evaluation
```bash
python3 python/bolt_cli.py evaluate \
  --question "Discuss the significance of Bounded Rationality in decision making." \
  --answer "Herbert Simon rejected classical economic man..." \
  --marks 15.0
```

### 7. SQLite Database Inspection
```bash
python3 python/bolt_cli.py db
```

---

## 🌐 Running as a Standalone Web & REST Server

You can launch the Python REST server on any port:

```bash
python3 main.py --serve --port 8080 --host 0.0.0.0
```

### REST API Endpoints:
- `GET  /api/health` - Server health check
- `GET  /api/python/status` - Python engine status & module diagnostics
- `GET  /api/syllabus` - Full UPSC Public Administration syllabus
- `GET  /api/timetable` - Daily study timetable slots
- `GET  /api/python/pyqs` - Query 1855-2026 historical PYQs with filters
- `GET  /api/python/ncert/chapters` - Class 6-12 NCERT chapters
- `GET  /api/python/ncert/quiz` - Chapter quiz MCQs
- `POST /api/bolt/chat` - Claude-grade AI mentor with step-by-step reasoning
- `POST /api/bolt/model-answer` - 15-marker model answer generator
- `POST /api/bolt/evaluate` - Rule-based 15-marker answer evaluation
- `POST /api/python/materials/process` - Material text extraction & MCQ generation
- `POST /api/auth/register` & `POST /api/auth/login` - SQLite user accounts

---

## 🧪 Testing

Run the built-in test suite:

```bash
python3 main.py --test
# Or using standard unittest:
python3 -m unittest test_bolt.py -v
```

All tests run in milliseconds using Python's standard `unittest` framework.
