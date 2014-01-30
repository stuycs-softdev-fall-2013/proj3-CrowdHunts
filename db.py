import sqlite3 as sql
from werkzeug.security import generate_password_hash, check_password_hash
from math import *

DB_NAME = 'crowdhunts.db'

'''
users
|username|password|num_plays|

'''
def init_db():
    conn=sql.connect(DB_NAME)
    c=conn.cursor()
    c.execute("""
    CREATE TABLE users (
    username text,
    password text,
    num_plays real
    )""")
    c.execute("CREATE TABLE stops (title text, desc text, lat real, lon real, panoid text, questid int, indx int)")
    c.execute("CREATE TABLE quests (username text, title text, desc text, num_stops int, questid integer primary key)")
    conn.commit()
    conn.close()
    return True

# USERS STUFF----------

#add user (for registering)
#@params: username, password
#@return: True
def add_user(usernm, passwd):
    conn=sql.connect(DB_NAME)
    c=conn.cursor()
    temp=(usernm.lower(),generate_password_hash(passwd))
    c.execute("INSERT INTO users VALUES (?,?,0)",temp)
    conn.commit()
    conn.close()
    return True

#update password
#@params: username, old password, new password
#@return: true if old pass correct, false otherwise
def updt_pass(usernm, old_pass, new_pass):
    conn=sql.connect(DB_NAME)
    c=conn.cursor()
    temp=(usernm.lower(),)
    c.execute("SELECT * FROM users WHERE username=?",temp)
    temp_user=c.fetchone()
    if temp_user==None:
        conn.close()
        return False
    if not check_password_hash(temp_user[1],old_pass):
        conn.close()
        return False
    temp=(generate_password_hash(new_pass),usernm)
    c.execute("UPDATE users SET password=? WHERE username=?",temp)
    conn.commit()
    conn.close()
    return True

#used for logging in, validating user
#@param: username, password
#@return: whether a registered account
def is_valid_user(usernm,passwd):
    conn=sql.connect(DB_NAME)
    c=conn.cursor()
    temp=(usernm.lower(),)
    c.execute("SELECT * FROM users WHERE username=?",temp)
    temp_user=c.fetchone()
    conn.close()
    if temp_user==None:
        return False
    return check_password_hash(temp_user[1],passwd)

# adds a number of plays to player's total plays
# @param: plays - number of plays to increase by
def add_plays(usern, plays):
    conn = sql.connect(DB_NAME)
    c = conn.cursor()
    temp = (plays, usern)
    c.execute("UPDATE users SET num_plays=num_plays+? WHERE username=?", temp)
    conn.commit()
    conn.close()

#simply getting user data in a tuple
#@params: username
#@return: tuple with data minus password, None is user doesn't exist
def get_user(usernm):
    conn=sql.connect(DB_NAME)
    c=conn.cursor()
    temp=(usernm,)
    c.execute("SELECT username, num_plays FROM users WHERE username=?", temp)
    temp_data=c.fetchone()
    return temp_data

#list of users by 
#@params: none
#@return: list of top 100 users by high score
def users_by_score():
    conn=sql.connect(DB_NAME)
    c=conn.cursor()
    templist=[]
    for row in c.execute("SELECT username, num_plays FROM users ORDER BY num_plays DESC LIMIT 100"):
        templist.append(row)
    conn.close()
    return templist


### QUESTS ###

# returns [(usern, title, desc, num_stops, questid)]
def get_quests_at_pano(panoid):
    conn = sql.connect(DB_NAME)
    c = conn.cursor()
    c.execute("SELECT quests.* FROM quests, stops WHERE quests.questid=stops.questid AND stops.panoid=? AND stops.indx=0", (panoid,))
    ret = c.fetchall()
    conn.close()
    return ret

# def get_quest(questid):
#     pass #will return a dict like the one that add_quest takes in

# returns [(title, desc, questid, num_stops)]
def get_users_quests(usern):
    conn = sql.connect(DB_NAME)
    c = conn.cursor()
    c.execute("SELECT title, desc, questid, num_stops FROM quests WHERE username=?", (usern,))
    ret = c.fetchall()
    conn.close()
    return ret

# params : qid - questid of quest
#        : index - index of stop
# returns ((title, desc, lat, lon, panoid, questid, index), isfinal)
def get_stop(qid, index):
    conn = sql.connect(DB_NAME) 
    c = conn.cursor()
    c.execute("SELECT * FROM stops WHERE questid=? AND indx=?", (int(qid), int(index)))
    ret = c.fetchone()
    c.execute("SELECT num_stops FROM quests WHERE questid=?", (int(qid),))
    l = c.fetchone()
    conn.close()
    return (ret,int(index) + 1 >= l[0])

def add_quest(stops, meta, usern):
    conn = sql.connect(DB_NAME)
    c = conn.cursor()
    vals = (usern, meta['title'], meta['desc'], len(stops))
    c.execute("INSERT INTO quests VALUES (?, ?, ?, ?, NULL)", vals)
    i = 0
    qid = c.lastrowid
    for s in stops:
        vals = (s[0], s[1], s[2], s[3], s[4], qid, i)
        c.execute("INSERT INTO stops VALUES (?, ?, ?, ?, ?, ?, ?)", vals)
        i+=1
    conn.commit()
    conn.close()
