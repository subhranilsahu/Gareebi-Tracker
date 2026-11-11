import sqlite3
from pathlib import Path

# Project ke main folder ka path
BASE_DIR = Path(__file__).resolve().parent.parent

# Database file ka path
DATA_DIR = BASE_DIR / "data"
DATABASE_PATH = DATA_DIR / "gareebi.db"


def get_connection():
    DATA_DIR.mkdir(parents=True, exist_ok=True)

    connection = sqlite3.connect(DATABASE_PATH)
    connection.row_factory = sqlite3.Row

    return connection


def initialize_database():
    connection = get_connection()

    try:
        connection.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                full_name TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE,
                password_hash TEXT NOT NULL,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                currency TEXT NOT NULL DEFAULT 'INR',
                classification TEXT NOT NULL DEFAULT 'Student Account'
            )
        """)

        # Add preference columns to existing users table if missing
        user_columns = connection.execute(
            "PRAGMA table_info(users)"
        ).fetchall()

        user_column_names = [column["name"] for column in user_columns]

        if "currency" not in user_column_names:
            connection.execute("""
                ALTER TABLE users
                ADD COLUMN currency TEXT NOT NULL DEFAULT 'INR'
            """)

        if "classification" not in user_column_names:
            connection.execute("""
                ALTER TABLE users
                ADD COLUMN classification TEXT NOT NULL DEFAULT 'Student Account'
            """)

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
                transaction_time TEXT,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        """)

        # Existing database mein column missing ho toh add karo
        columns = connection.execute(
            "PRAGMA table_info(transactions)"
        ).fetchall()

        column_names = [column["name"] for column in columns]

        if "transaction_time" not in column_names:
            connection.execute("""
                ALTER TABLE transactions
                ADD COLUMN transaction_time TEXT
            """)

        connection.commit()

    finally:
        connection.close()


def add_transaction(user_id, tx_type, amount, category, note,
                    account, date, transaction_time):

    connection = get_connection()

    try:
        cursor = connection.execute("""
            INSERT INTO transactions
            (
                user_id, type, amount, category, note,
                account, date, transaction_time
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            user_id, tx_type, amount, category, note,
            account or "", date, transaction_time
        ))

        connection.commit()
        return cursor.lastrowid

    finally:
        connection.close()


def get_user_transactions(user_id):

    connection = get_connection()

    try:
        transactions = connection.execute("""
            SELECT
                id, type, amount, category, note,
                date, transaction_time, created_at
            FROM transactions
            WHERE user_id = ?
            ORDER BY id DESC
        """, (user_id,)).fetchall()

        return [dict(transaction) for transaction in transactions]

    finally:
        connection.close()


def update_transaction(user_id, transaction_id, tx_type, amount,
                       category, note, account, date, transaction_time):

    connection = get_connection()

    try:
        cursor = connection.execute("""
            UPDATE transactions
            SET
                type = ?,
                amount = ?,
                category = ?,
                note = ?,
                account = ?,
                date = ?,
                transaction_time = ?
            WHERE id = ? AND user_id = ?
        """, (
            tx_type, amount, category, note,
            account, date, transaction_time,
            transaction_id, user_id
        ))

        connection.commit()
        return cursor.rowcount

    finally:
        connection.close()


def delete_transaction(user_id, transaction_id):

    connection = get_connection()

    try:
        cursor = connection.execute("""
            DELETE FROM transactions
            WHERE id = ? AND user_id = ?
        """, (transaction_id, user_id))

        connection.commit()
        return cursor.rowcount

    finally:
        connection.close()



def get_user_profile(user_id):
    connection = get_connection()

    try:
        user = connection.execute("""
            SELECT id, full_name, email, created_at, currency, classification
            FROM users
            WHERE id = ?
        """, (user_id,)).fetchone()

        return dict(user) if user else None

    finally:
        connection.close()


def update_user_name(user_id, full_name):
    connection = get_connection()

    try:
        cursor = connection.execute("""
            UPDATE users
            SET full_name = ?
            WHERE id = ?
        """, (full_name, user_id))

        connection.commit()
        return cursor.rowcount

    finally:
        connection.close()



def update_user_preferences(user_id, currency, classification):
    connection = get_connection()

    try:
        cursor = connection.execute("""
            UPDATE users
            SET currency = ?, classification = ?
            WHERE id = ?
        """, (currency, classification, user_id))

        connection.commit()
        return cursor.rowcount

    finally:
        connection.close()
