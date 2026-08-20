"""
Root entrypoint to seed the CIVICX database.
Usage:
    python seed.py
"""
import sys
import os

# Ensure workspace root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from backend.seed.seed_runner import seed_database

if __name__ == "__main__":
    seed_database()
