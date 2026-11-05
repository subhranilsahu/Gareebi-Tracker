
import sqlite3
from pathlib import Path

# Project ke main folder ka path
BASE_DIR = Path(__file__).resolve().parent.parent

# Database file ka path
DATA_DIR = BASE_DIR / "data"
DATABASE_PATH = DATA_DIR / "gareebi.db"


def get_connection():
    # Data folder nahi hai toh create kar do
    DATA_DIR.mkdir(parents=True, exist_ok=True)

    # Database se connection establish karo
    connection = sqlite3.connect(DATABASE_PATH)

    # Rows ko column names ke through access kar sakenge
    connection.row_factory = sqlite3.Row

    return connection


def initialize_database():

    connection = get_connection()

    try:
        # Users table create karo
        connection.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                full_name TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE,
                password_hash TEXT NOT NULL,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
        """)

        connection.commit()

    finally:
        connection.close()
