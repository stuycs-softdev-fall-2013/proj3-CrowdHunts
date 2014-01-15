from flask import Flask

app = Flask(__name__)

@app.route('/')
def index():
    return "Yo, it's an index"


if __name__ == "__main__":
    app.debug = True
    app.run()
