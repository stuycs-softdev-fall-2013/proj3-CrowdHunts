from flask import Flask, render_template, redirect, request, abort, jsonify, session, make_response
import crossdomain
from random import choice
import test as db
import image_utils

app = Flask(__name__)
app.secret_key = 'shh this is secret'

@app.route('/')
def index():
    return "Yo, it's an index"

@app.route('/leaderboard')
def leaders():
    leaders = db.users_by_score()
    return render_template('leaderboard.html', leaders=leaders)

# user profile page
@app.route('/u/<usern>')
def profile(usern):
    user = db.get_user(usern)
    return render_template('user.html', user=usern)

@app.route('/play')
def play():
    require_login()
    return render_template('game.html')

@app.route('/test',methods=['GET','OPTIONS'])
@crossdomain.crossdomain(origin="*",headers='Content-Type,origin,accept,contentType')
def test():
    return render_template('test.html')

### AJAX ###

# quest retrieval
# /jax/getquest?lat=1&lon=1
@app.route('/jax/getquest')
def quest():
    #return db stuff
    pass

# POST keys:
# title
# desc
@app.route('/jax/new/start')
def new_start():
    session['new-meta'] = {'title':title, 'desc':desc}

# POST keys:
# panoid
# lat
# lon
# desc
# index
@app.route('/jax/new/addstop')
def new_stop():
    #add to session
    data = request.get_json()
    if 'new-tour' in session:
        session['new-tour'].append((data['desc'],
                                    data['lat'],
                                    data['lon'],
                                    data['panoid'],
                                    data['index']))
    

@app.route('/jax/new/end')
def new_end():
    session.pop('new-tour')
    session.pop('new-meta')
    # commit to db

# cancel a tour in progress
@app.route('/jax/new/cancel')
def new_cancel():
    session.pop('new-tour')
    session.pop('new-meta')

### LOGIN FOLLOWS ###

@app.route('/login', methods=['GET', 'POST'])
def login():
    if 'usern' in session:
        return redirect('/')
    if request.method == 'GET':
        return render_template('login.html',error="")
    else:
        # handle logging in / checking creds
        usern = request.form['usern']
        passw = request.form['passw']
        if db.is_valid_user(usern, passw):
            session['usern'] = usern
            return redirect('/')
        else:
            return render_template('login.html', error='Username and password do not match')

@app.route('/logout')
def logout():
    if 'usern' in session:
        session.pop('usern')
        return redirect('/')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if 'usern' in session:
        return redirect('/')
    if request.method == 'GET':
        return render_template('register.html',error="")
    else:
        usern = request.form['usern']
        passw = request.form['passw']
        if db.get_user(usern):
            return render_template('register.html', error='Username already exists')    
        else:
            db.add_user(usern, passw)
            session['usern'] = usern
            return redirect('/')

# call if a login is required. 
def require_login():
    if not 'usern' in session:
        abort(403)


# if access is denied, redirects to login
@app.errorhandler(403)
def access_forbidden(e):
    return redirect('/login')

if __name__ == "__main__":
    app.debug = True
    app.run()
