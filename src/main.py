
from flask import Flask, request, session, jsonify
from database import initialize_database
from auth import login_user, register_user

import secrets

# Create Flask application
app = Flask(__name__)

# Generate a secret key for session security
app.secret_key = secrets.token_hex(32)

# Initialize database
initialize_database()


# Signup route
@app.route("/register", methods=["POST"])
def register():

    # Get signup details from frontend
    data = request.get_json(silent=True) or {}

    full_name = data.get("full_name", "")
    email = data.get("email", "")
    password = data.get("password", "")

    # Register new user
    success, result = register_user(
        full_name,
        email,
        password
    )

    # Handle registration errors
    if not success:

        if result == "Email already registered.":
            return jsonify({"error": result}), 409

        return jsonify({"error": result}), 400

    return jsonify({
        "message": result
    }), 201


# Login route
@app.route("/login", methods=["POST"])
def login():

    # Get email and password from request
    data = request.get_json(silent=True) or {}

    email = data.get("email", "")
    password = data.get("password", "")

    # Verify login details
    success, result = login_user(email, password)

    if not success:
        return jsonify({"error": result}), 401

    # Store user details in session
    session["user_id"] = result["id"]
    session["user_name"] = result["full_name"]

    return jsonify({
        "message": "Login successful",
        "user": result
    }), 200


# Protected dashboard route
@app.route("/dashboard")
def dashboard():

    # Check whether user is logged in
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

    # Clear the user's session
    session.clear()

    return jsonify({"message": "Logged out successfully"})


# Start application
if __name__ == "__main__":
    app.run(debug=True)
