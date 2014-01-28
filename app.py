from flask import Flask, render_template, redirect, request, abort, jsonify, session, make_response
import crossdomain
from random import choice
import db

app = Flask(__name__)
app.secret_key = 'shh this is secret'

@app.route('/')
def index():
    return render_template('index.html')

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

# stop retrieval
# index is the current index
# /jax/getstop?questid=123&index=2
#
@app.route('/jax/getstop')
def stop():
    index = request.args.get('index')
    qid = request.args.get('questid')
    stop = db.get_stop(qid, index)
    ret = {'title':stop[0][0],
           'desc':stop[0][1],
           'lat':stop[0][2],
           'lon':stop[0][3],
           'panoid':stop[0][4],
           'questid':stop[0][5],
           'index':stop[0][6],
           'isfinal':stop[1]
    }
    return jsonify(**ret)

# quest retrieval
# /jax/getquest?panoid=abcd
# returns [(usern, title, desc, questid)]
@app.route('/jax/getquest')
def quest():
    panoid = request.args.get('panoid')
    res = db.get_quests_at_pano(panoid)
    ret = {'results':[{'usern':q[0], 'title':q[1], 'desc':q[2], 'questid':q[3]} for q in res]}
    return jsonify(**ret)

# POST keys:
# title
# desc
@app.route('/jax/new/start')
def new_start():
    session['new-meta'] = {'title':title, 'desc':desc}
    session['new-stops'] = []

# POST keys:
# title
# panoid
# lat
# lon
# desc
@app.route('/jax/new/addstop')
def new_stop():
    #add to session
    data = request.get_json()
    if 'new-stops' in session:
        session['new-stops'].append((data['title'],
                                    data['desc'],
                                    data['lat'],
                                    data['lon'],
                                    data['panoid']))
    

@app.route('/jax/new/end')
def new_end():
    quest = session.pop('new-stops')
    meta = session.pop('new-meta')
    db.add_quest(quest, meta, session['usern'])

# cancel a quest in progress
@app.route('/jax/new/cancel')
def new_cancel():
    session.pop('new-stops')
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
