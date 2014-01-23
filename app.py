from flask import Flask, render_template

app = Flask(__name__)

@app.route('/')
def index():
    return "Yo, it's an index"

@app.route('/leaderboard')
def leaders():
    #db query
    return render_template('leaderboard.html')

# user profile page
@app.route('/u/<usern>')
def profile(usern):
    #db query
    return render_template('user.html', user=usern)

# return the next clue in a user's hunt, 
# should also increment user score
@app.route('/game/next_clue')
def nextloc():
    pass

# current user's current score
@app.route('/game/score')
def score():
    pass

# we should probably do the hashing in the database module, but until that's available:
from werkzeug.security import generate_password_hash, check_password_hash
@app.route('/login', methods=['GET', 'POST'])
def login():
    if 'usern' in session:
        return redirect('/')
    if request.method == 'GET':
        return render_template('login.html')
    else:
        # handle logging in / checking creds
        usern = request.form['usern']
        passw = request.form['passw']
        dbpass = None
        passw = check_password_hash(passw, dbpass)

# ditto on the password hashing
@app.route('/register', methods=['GET', 'POST'])
def register():
    if 'usern' in session:
        return redirect('/')
    if request.method == 'GET':
        return render_template('register.html')
    else:
        usern = request.form['usern']
        passw = request.form['passw']
        passw = generate_password_hash(passw)
    

from functools import wraps
def require_login(func):
    @wraps(func)
    def checker(*args, **kwargs):
        if 'usern' in session:
            return func(*args, **kwargs)
        return redirect('/login')
    return checker
        
    

if __name__ == "__main__":
    app.debug = True
    app.run()
