
import sqlite3
import re

from werkzeug.security import generate_password_hash, check_password_hash
from database import get_connection


def register_user(full_name, email, password):

    # Remove unnecessary spaces
    full_name = full_name.strip()
    email = email.strip().lower()

    # Validate required fields
    if not full_name or not email or not password:
        return False, "All fields are required."

    # Validate email format
    email_pattern = r"^[^\s@]+@[^\s@]+\.[^\s@]+$"

    if not re.match(email_pattern, email):
        return False, "Please enter a valid email address."

    # Basic password length check
    if len(password) < 8:
        return False, "Password must be at least 8 characters."

    # Hash password before saving
    password_hash = generate_password_hash(password)

    connection = get_connection()

    try:
        # Save new user in database
        connection.execute(
            """
            INSERT INTO users (full_name, email, password_hash)
            VALUES (?, ?, ?)
            """,
            (full_name, email, password_hash)
        )

        connection.commit()

        return True, "Account created successfully."

    except sqlite3.IntegrityError:
        return False, "Email already registered."

    finally:
        connection.close()


def login_user(email, password):

    # Clean email input
    email = email.strip().lower()

    # Check required fields
    if not email or not password:
        return False, "Email and password are required."

    connection = get_connection()

    try:
        # Find user using email
        user = connection.execute(
            "SELECT * FROM users WHERE email = ?",
            (email,)
        ).fetchone()

        # Check if user exists
        if user is None:
            return False, "Invalid email or password."

        # Verify entered password against stored hash
        if not check_password_hash(user["password_hash"], password):
            return False, "Invalid email or password."

        return True, {
            "id": user["id"],
            "full_name": user["full_name"],
            "email": user["email"]
        }

    finally:
        connection.close()
