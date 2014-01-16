from flask import Flask, render_template

app = Flask(__name__)

@app.route('/')
def index():
    return "Yo, it's an index"

@app.route('/leaderboard')
def leaders():
    #db query
    return render_template('leaderboard.html')

@app.route('/u/<usern>')
def profile(usern):
    #db query
    return render_template('user.html')

if __name__ == "__main__":
    app.debug = True
    app.run()
