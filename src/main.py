
# Import Flask and render_template
from flask import Flask, render_template

# Create Flask application
app = Flask(
    __name__,
    template_folder="../templates",
    static_folder="../static"
)


# Homepage route
@app.route("/")
def dashboard():

    # Display the existing HTML dashboard
    return render_template("index.html")


# Run the application
if __name__ == "__main__":
    app.run(debug=True)
