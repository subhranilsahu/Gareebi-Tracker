
from flask import Flask, render_template

# Configure Flask template and static folders
app = Flask(
    __name__,
    template_folder="../templates",
    static_folder="../static"
)


# Home page
@app.route("/")
def home():
    return render_template("index.html")


# Run the application
if __name__ == "__main__":
    app.run(debug=True)