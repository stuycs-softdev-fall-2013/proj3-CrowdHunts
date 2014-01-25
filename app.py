from flask import Flask, render_template, redirect, request, abort
import test as db

app = Flask(__name__)

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
    #db query
    return render_template('user.html', user=usern)

# return geopic
# /streetview?lon=1&lat=1
@app.route('/jax/streetview')
def streetview():
    require_login()
    lat = request.args.get('lat')
    lon = request.args.get('lon')
    if not (lat and lon):
        abort(400)
    return db.pic_by_loc(lat, lon)

# return the next hunt goal
# /game/clue?lon=1&lat=1
@app.route('/jax/goal')
def clue():
    require_login()
    lat = request.args.get('lat')
    lon = request.args.get('lon')
    if not (lat and lon):
        abort(400)
    pass

# post a picture
# POST details:
## picture   = pic
## latitude  = lat
## longitude = lon
@app.route('/jax/addpic', methods=['POST'])
def save_geo_pic():
    require_login()
    pic = request.json['pic']
    lat = request.json['lat']
    lon = request.json['lon']
    db.add_geo_pic(lat, lon, pic)

### LOGIN FOLLOWS ###

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
        if db.is_valid_user(usern, passw):
            session['usern'] = usern
            return redirect('/')
        else:
            return render_template('login.html', error='Username and password do not match')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if 'usern' in session:
        return redirect('/')
    if request.method == 'GET':
        return render_template('register.html')
    else:
        usern = request.form['usern']
        passw = request.form['passw']
        if db.get_user(usern):
            db.add_user(usern, passw)
            session['usern'] = usern
            return redirect('/')
        else:
            return render_template('register.html', error='Username already exists')    

# params: func = function to be wrapped
# abort_on_fail = should abort when fails, defaults to False for redirect
def require_login():
    if 'usern' in session:
        abort(403)

@app.errorhandler(403)
def access_forbidden():
    return redirect('/login')

if __name__ == "__main__":
    app.debug = True
    app.run()
