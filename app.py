from flask import Flask, render_template, redirect, request, abort, jsonify, session, make_response
import crossdomain
from random import choice
import db

app = Flask(__name__)
app.secret_key = 'shh this is secret'

@app.route('/')
def index():
    if not 'usern' in session:
        return render_template('index.html')
    else:
        return redirect('/home')

@app.route('/home')
def home():
    if not 'usern' in session:
        return redirect('/')
    else:
        return render_template('home.html')

# not very fun. we won't mention it, but we'll leave it there in case anyone's interested
@app.route('/leaderboard')
def leaders():
    leaders = db.users_by_score()
    return render_template('leaderboard.html', leaders=leaders)

@app.route('/play')
def play():
    require_login()
    return render_template('Game.html')

@app.route('/play/<questNum>')
def quest(questNum):
    require_login()
    return render_template('quest.html',questNum=questNum)

@app.route('/create/tour')
def createToure():
    require_login()
    return render_template('tourInit.html')

@app.route('/create/edit')
def editQuest():
    return render_template("tourEdit.html")

@app.route('/test',methods=['GET','OPTIONS'])
@crossdomain.crossdomain(origin="*",headers='Content-Type,origin,accept,contentType')
def test():
    return render_template('test.html')

### AJAX ###

@app.route("/tour")
def tour():
    return render_template("tourPlay.html")


# GET on finish quest
# include questid as parameter
# /jax/finishquest?questid=1
@app.route('/jax/finishquest')
def finishquest():
    if 'questid' in request.args:
        db.add_plays(session['usern'], 1)
        ret = {'num_quests':db.get_user(session['usern'])[1]}
        return jsonify(**ret)
    ret = {'error':'questid missing'}
    return jsonify(**ret)

# stop retrieval
# index is next index
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
    } if stop[0] else {'error':'index out of bounds'}
    return jsonify(**ret)

# quest retrieval
# /jax/getquest?panoid=abcd
# returns [(usern, title, desc, questid)]
@app.route('/jax/getquest')
def getQuest():
    panoid = request.args.get('panoid')
    res = db.get_quests_at_pano(panoid)
    ret = {'results':[{'usern':q[0], 'title':q[1], 'desc':q[2], 'num_stops':q[3], 'questid':q[4]} for q in res]}
    return jsonify(**ret)

# POST keys:
# title
# desc
@app.route('/jax/new/start', methods=['POST'])
def new_start():
    data = request.form
    session['new-meta'] = {'title':data['title'],
                           'desc':data['desc']}
    session['new-stops'] = []
    ret = {'received':True}
    return jsonify(**ret)

# POST keys:
# title
# panoid
# lat
# lon
# desc
@app.route('/jax/new/addstop', methods=['POST'])
def new_stop():
    #add to session

    data = request.form
    print data
    if 'new-stops' in session:
        stop = (data['title'],
             data['desc'],
             float(data['lat']),
             float(data['lon']),
             data['panoid'])
        print 'stop received:', stop
        session['new-stops'].append(stop)
        print 'session:', session  
    ret = {'received':True}
    return jsonify(**ret)
    
# GET me
@app.route('/jax/new/end')
def new_end():
    quest = session.pop('new-stops')
    meta = session.pop('new-meta')
    print 'quest =', quest
    print 'meta =', meta
    print 'usern =', session['usern']
    db.add_quest(quest, meta, session['usern'])
    ret = {'received':True}
    return jsonify(**ret)

# cancel a quest in progress
@app.route('/jax/new/cancel')
def new_cancel():
    session.pop('new-stops')
    session.pop('new-meta')
    ret = {'received':True}
    return jsonify(**ret)

### LOGIN FOLLOWS ###

@app.route('/login', methods=['GET', 'POST'])
def login():
    if 'usern' in session:
        return redirect('/home')
    if request.method == 'GET':
        return render_template('login.html',error="")
    else:
        # handle logging in / checking creds
        usern = request.form['usern']
        passw = request.form['passw']
        if db.is_valid_user(usern, passw):
            session['usern'] = usern
            return redirect('/home')
        else:
            return render_template('login.html', error='Username and password do not match')

@app.route('/logout')
def logout():
    if 'usern' in session:
        session.clear()
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
