
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
        # Users table
        connection.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                full_name TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE,
                password_hash TEXT NOT NULL,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # Transactions table
        connection.execute("""
            CREATE TABLE IF NOT EXISTS transactions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                type TEXT NOT NULL,
                amount REAL NOT NULL,
                category TEXT NOT NULL,
                note TEXT,
                account TEXT NOT NULL,
                date TEXT NOT NULL,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        """)

        connection.commit()

    finally:
        connection.close()


def add_transaction(user_id, tx_type, amount, category, note, account, date):

    connection = get_connection()

    try:
        cursor = connection.execute("""
            INSERT INTO transactions
            (user_id, type, amount, category, note, account, date)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (user_id, tx_type, amount, category, note, account, date))

        connection.commit()
        return cursor.lastrowid

    finally:
        connection.close()


def get_user_transactions(user_id):

    connection = get_connection()

    try:
        transactions = connection.execute("""
            SELECT id, type, amount, category, note, account, date
            FROM transactions
            WHERE user_id = ?
            ORDER BY id DESC
        """, (user_id,)).fetchall()

        return [dict(transaction) for transaction in transactions]

    finally:
        connection.close()
        