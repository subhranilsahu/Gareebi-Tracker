
from pathlib import Path
from datetime import timedelta

from flask import (
    Flask,
    request,
    session,
    jsonify,
    render_template,
    redirect,
    url_for
)

from database import (
    initialize_database,
    add_transaction,
    get_user_transactions
)

from auth import login_user, register_user

import secrets


# Project root directory
BASE_DIR = Path(__file__).resolve().parent.parent

# Flask application setup
app = Flask(
    __name__,
    template_folder=str(BASE_DIR / "templates"),
    static_folder=str(BASE_DIR / "static")
)

# Session security key
app.secret_key = secrets.token_hex(32)

# Persistent session configuration (30 days)
app.config["SESSION_PERMANENT"] = True
app.permanent_session_lifetime = timedelta(days=30)

# Initialize database
initialize_database()


# Landing page
@app.route("/")
@app.route("/landing.html")
def landing_page():


    print("LANDING PAGE REQUEST RECEIVED")
    print("SESSION:", dict(session))
    print("USER AGENT:", request.headers.get("User-Agent"))


    if "user_id" in session:
        return redirect(url_for("dashboard"))

    return render_template("landing.html")


# Signup page
@app.route("/register", methods=["GET"])
@app.route("/signup.html", methods=["GET"])
def register_page():

    if "user_id" in session:
        return redirect(url_for("dashboard"))

    return render_template("signup.html")


# Signup API
@app.route("/register", methods=["POST"])
def register():

    data = request.get_json(silent=True) or {}

    full_name = data.get("full_name", "")
    email = data.get("email", "")
    password = data.get("password", "")

    success, result = register_user(full_name, email, password)

    if not success:
        if result == "Email already registered.":
            return jsonify({"error": result}), 409

        return jsonify({"error": result}), 400

    # Automatically log in after successful signup
    success, user = login_user(email, password)

    if success:
        session.permanent = True
        session["user_id"] = user["id"]
        session["user_name"] = user["full_name"]

    return jsonify({
        "message": result,
        "redirect": url_for("dashboard")
    }), 201


# Login page
@app.route("/login", methods=["GET"])
@app.route("/login.html", methods=["GET"])
def login_page():

    if "user_id" in session:
        return redirect(url_for("dashboard"))

    return render_template("login.html")


# Login API
@app.route("/login", methods=["POST"])
def login():

    data = request.get_json(silent=True) or {}

    email = data.get("email", "")
    password = data.get("password", "")

    success, result = login_user(email, password)

    if not success:
        return jsonify({"error": result}), 401

    session.permanent = True
    session["user_id"] = result["id"]
    session["user_name"] = result["full_name"]

    return jsonify({
        "message": "Login successful",
        "user": result,
        "redirect": url_for("dashboard")
    }), 200


# Protected dashboard page
@app.route("/dashboard")
def dashboard():

    if "user_id" not in session:
        return redirect(url_for("login_page"))

    return render_template(
        "dashboard.html",
        user_name=session["user_name"]
    )


# Save transaction API
@app.route("/transactions", methods=["POST"])
def save_transaction():

    if "user_id" not in session:
        return jsonify({"error": "Please login first."}), 401

    data = request.get_json(silent=True) or {}

    tx_type = data.get("type")
    amount = data.get("amount")
    category = data.get("category", "").strip()
    note = data.get("note", "").strip()
    account = data.get("account", "").strip()
    date = data.get("date", "").strip()

    if tx_type not in ("income", "expense"):
        return jsonify({"error": "Invalid transaction type."}), 400

    try:
        if isinstance(amount, bool):
            raise ValueError

        amount = float(amount)

        if amount <= 0:
            raise ValueError

    except (TypeError, ValueError):
        return jsonify({"error": "Please enter a valid amount."}), 400

    if not category or not account or not date:
        return jsonify({"error": "Category, account and date are required."}), 400

    transaction_id = add_transaction(
        session["user_id"],
        tx_type,
        amount,
        category,
        note,
        account,
        date
    )

    return jsonify({
        "message": "Transaction saved successfully.",
        "transaction_id": transaction_id
    }), 201


# Fetch logged-in user's transactions
@app.route("/transactions", methods=["GET"])
def fetch_transactions():

    if "user_id" not in session:
        return jsonify({"error": "Please login first."}), 401

    transactions = get_user_transactions(session["user_id"])

    return jsonify({
        "transactions": transactions
    }), 200


# Logout API
@app.route("/logout", methods=["POST"])
def logout():

    session.clear()

    return jsonify({
        "message": "Logged out successfully",
        "redirect": url_for("landing_page")
    })


# Start Flask server
if __name__ == "__main__":
    app.run(debug=True)
