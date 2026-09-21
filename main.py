#!/usr/bin/env python3
"""
BOLT - UPSC Civil Services Academic Mentorship & Intelligence Engine
Root Entry Point

Usage:
  python main.py                     # Launch interactive terminal shell (REPL)
  python main.py --serve             # Run Python HTTP & REST API server (port 8080)
  python main.py --serve --port 3000 # Run server on specific port
  python main.py --mentor "..."      # Query Claude-grade mentor directly
  python main.py --status            # Display engine architecture status
  python main.py --test              # Run comprehensive Python test suite
  python main.py --pyqs --era modern # Query 1855-2026 PYQ dataset
"""

import sys
import os
import argparse

# Add repository root and python directory to path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, BASE_DIR)
sys.path.insert(0, os.path.join(BASE_DIR, "python"))

from python.bolt_cli import main as cli_main, run_interactive_shell
from python.bolt_server import run_server
from python.bolt_chat import generate_conversational_mentor_reply
import python.bolt_db as bolt_db


def run_tests():
    import unittest
    import test_bolt
    suite = unittest.TestLoader().loadTestsFromModule(test_bolt)
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    sys.exit(0 if result.wasSuccessful() else 1)


def main():
    if len(sys.argv) == 1:
        # Default with no arguments: interactive shell
        run_interactive_shell()
        return

    # Check for simple flags
    if "--serve" in sys.argv or "-s" in sys.argv:
        port = 8080
        if "--port" in sys.argv:
            try:
                p_idx = sys.argv.index("--port") + 1
                port = int(sys.argv[p_idx])
            except (ValueError, IndexError):
                pass
        run_server(port=port)
        return

    if "--test" in sys.argv:
        run_tests()
        return

    # Otherwise delegate directly to bolt_cli.py
    cli_main()


if __name__ == "__main__":
    main()
