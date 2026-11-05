from pathlib import Path
from flask import Flask, request, session, jsonify, render_template
from database import initialize_database
from auth import login_user, register_user

import secrets

# Create Flask application
# Project ke main folder ka path
BASE_DIR = Path(__file__).resolve().parent.parent

# Flask ko templates aur static folders ka exact location batana
app = Flask(
    __name__,
    template_folder=str(BASE_DIR / "templates"),
    static_folder=str(BASE_DIR / "static")
)

# Generate a secret key for session security
app.secret_key = secrets.token_hex(32)

# Initialize database
initialize_database()


# Display signup page
@app.route("/register", methods=["GET"])
def register_page():
    return render_template("register.html")


# Signup API route
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

    return jsonify({"message": result}), 201


# Login API route
@app.route("/login", methods=["POST"])
def login():

    data = request.get_json(silent=True) or {}

    email = data.get("email", "")
    password = data.get("password", "")

    success, result = login_user(email, password)

    if not success:
        return jsonify({"error": result}), 401

    session["user_id"] = result["id"]
    session["user_name"] = result["full_name"]

    return jsonify({
        "message": "Login successful",
        "user": result
    }), 200


# Protected dashboard route
@app.route("/dashboard")
def dashboard():

    if "user_id" not in session:
        return jsonify({"error": "Please login first"}), 401

    return jsonify({
        "message": "Welcome to your dashboard",
        "user_id": session["user_id"],
        "user_name": session["user_name"]
    })


# Logout route
@app.route("/logout", methods=["POST"])
def logout():

    session.clear()

    return jsonify({"message": "Logged out successfully"})


# Start application
if __name__ == "__main__":
    app.run(debug=True)