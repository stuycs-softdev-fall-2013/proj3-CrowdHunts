import sqlite3 as sql
from werkzeug.security import generate_password_hash, check_password_hash
from math import *

'''
users
|username|password|num_plays|

'''
def init_db():
    conn=sql.connect('crowdhunts.db')
    c=conn.cursor()
    c.execute("""
    CREATE TABLE users (
    username text,
    password text,
    num_plays real
    )""")
    c.execute("CREATE TABLE start (title text, desc text, lat real, lon real, panoid text, tourid int, indx int)")
    c.execute("CREATE TABLE cmpnt (title text, desc text, lat real, lon real, panoid text, tourid int, indx int)")
    c.execute("CREATE TABLE end   (title text, desc text, lat real, lon real, panoid text, tourid int, indx int)")
    c.execute("CREATE TABLE tours (username text, title text, desc text, tourid int)")
    conn.commit()
    conn.close()
    return True




# USERS STUFF----------

#add user (for registering)
#@params: username, password
#@return: True
def add_user(usernm, passwd):
    conn=sql.connect('crowdhunts.db')
    c=conn.cursor()
    temp=(usernm,generate_password_hash(passwd))
    c.execute("INSERT INTO users VALUES (?,?,0)",temp)
    conn.commit()
    conn.close()
    return True

#update password
#@params: username, old password, new password
#@return: true if old pass correct, false otherwise
def updt_pass(usernm, old_pass, new_pass):
    conn=sql.connect('crowdhunts.db')
    c=conn.cursor()
    temp=(usernm,)
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
    conn=sql.connect('crowdhunts.db')
    c=conn.cursor()
    temp=(usernm,)
    c.execute("SELECT * FROM users WHERE username=?",temp)
    temp_user=c.fetchone()
    conn.close()
    if temp_user==None:
        return False
    return check_password_hash(temp_user[1],passwd)

# adds a number of plays to player's total plays
# @param: plays - number of plays to increase by
def add_plays(usern, plays):
    conn = sql.connect('crowdhunts.db')
    c = conn.cursor()
    temp = (plays, usern)
    c.execute("UPDATE users SET num_plays=num_plays+? WHERE username=?", temp)
    c.commit()
    conn.close()

# #add one game's stats
# #@params: username, num_plays
# #@return: True
# def add_stats(usernm, dist):
#     conn=sql.connect('crowdhunts.db')
#     c=conn.cursor()
#     temp=(usernm,)
#     c.execute("SELECT * FROM users WHERE username=?",temp)
#     temp_data=c.fetchone()
#     new_high_score=score
#     if score<temp_data[5]:
#         new_high_score=temp_data[5]
#     new_user_data=(temp_data[0],temp_data[1],temp_data[2]+dist,(temp_data[3]*(temp_data[4])+score)/(temp_data[4]+1),temp_data[4]+1, new_high_score)
#     c.execute("DELETE FROM users WHERE username=?", temp)
#     c.execute("INSERT INTO users VALUES (?,?,?,?,?,?)",new_user_data)
#     conn.commit()
#     conn.close()
#     return True

#simply getting user data in a tuple
#@params: username
#@return: tuple with data minus password, None is user doesn't exist
def get_user(usernm):
    conn=sql.connect('crowdhunts.db')
    c=conn.cursor()
    temp=(usernm,)
    c.execute("SELECT username, num_plays FROM users WHERE username=?", temp)
    temp_data=c.fetchone()
    return temp_data

#list of users by high score
#@params: none
#@return: list of all users by high score
def users_by_score():
    conn=sql.connect('crowdhunts.db')
    c=conn.cursor()
    templist=[]
    for row in c.execute("SELECT username, num_plays FROM users ORDER BY num_plays DESC"):
        templist.append(row)
    conn.close()
    return templist








#putting in tour data
#AGHHH
def add_tour(dic):
    conn=sql.connect('crowdhunts.db')
    c=conn.cursor()
    c.execute("SELECT tourid FROM tours DESC")
    tourid=c.fetchone()
    if tourid==None:
        tourid=0
    tourid+=1
    list_stops=dic['stops']
    list_info=dic['info']
    #adding stops shit
    temp_stop=list_stops[0]
    temp=(temp_stop[0],temp_stop[1],temp_stop[2],temp_stop[3],temp_stop[4],tourid, 0)
    c.execute("INSERT INTO start VALUES (?,?,?,?,?,?,?)",temp)
    conn.commit()
    for i in range(1,len(list_stops)-1):
         temp_stop=list_stops[i]
         temp=(temp_stop[0],temp_stop[1],temp_stop[2],temp_stop[3],temp_stop[4],tourid, i)
         c.execute("INSERT INTO cmpnt VALUES (?,?,?,?,?,?,?)",temp)
         conn.commit()
    temp_stop=list_stops[-1]
    temp=(temp_stop[0],temp_stop[1],temp_stop[2],temp_stop[3],temp_stop[4],tourid, -1)
    c.execute("INSERT INTO end VALUES (?,?,?,?,?,?,?)",temp)
    conn.commit()
    #adding info shit
    temp=(list_info[0],list_info[1],list_info[2],tourid)
    c.execute("INSERT INTO tours VALUES (?,?,?,?)", temp)
    conn.commit()
    conn.close()
    return True


def get_tour(tourid):
    pass #will return a dict like the one that add_tour takes in

def get_users_tours(username):
    pass #will return a list of tour tuples: [ (title, desc, tourid) ]

''' NOT SURE WHATS WRONG, SOMETHING WITH THE MAX INDX CHECKING SHIT OR SOMEWHERE THERE GAH
#getting the next step in a tour (index of start is 0, index of end is -1)
#@param: current index, tour id
#return: tuple of next step, or None if tour over
def get_next_stop( indx, tourid):
    if indx==-1:
        return None
    conn=sql.connect('crowdhunts.db')
    c=conn.cursor()
    tempp=(tourid,)
    c.execute("SELECT indx FROM cmpnt WHERE tourid=? ORDER BY indx DESC", tempp)
    next_indx=indx+1
    temp=c.fetchone()
    if temp==None:
        next_indx=-1
    max_indx=temp[0]
    if max_indx>=next_indx:
        next_indx=-1
    next_stop=None
    if next_indx==-1:
        temp=(tourid,)
        c.execute("SELECT * FROM end WHERE tourid=?",temp)
        temprow=c.fetchone()
        next_stop=temprow
    else:
        temp(next_indx,)
        c.execute("SELECT * FROM cmpnt WHERE indx=?",temp)
        temprow=c.fetchone()
        next_stop=temprow
    conn.close()
    return next_stop
'''











'''
# GEO_PIC STUFF----------

#adding a geo_pic
#@param: geolocation (lat long) and pic data (as blob)
#@return: true
def add_geo_pic(lati, longi, pic):
    conn=sql.connect('crowdhunts.db')
    c=conn.cursor()
    temp=(lati,longi,pic)
    c.execute("INSERT INTO geo_pic VALUES (?,?,?)",temp)
    conn.commit()
    conn.close()
    return True

#search for a geopic by location
#@param: geoloc (lat long)
#return: pic or None
def pic_by_loc(lati,longi):
    conn=sql.connect('crowdhunts.db')
    c=conn.cursor()
    temp=(lati,longi)
    c.execute("SELECT * FROM geo_pic WHERE latitude=? AND longitude=?",temp)
    tempdata=c.fetchone()
    conn.close()
    #    if tempdata==None:
    return tempdata
    #   return tempdata[2]

#search by proximity, get all in a certain radius of a certain point. (not really radius, more like a square)
#@param: center, "radius"
#@return: a list of geo_pics that are in the vicinity
def pics_in_prox(lati,longi,length):
    conn=sql.connect('crowdhunts.db')
    c=conn.cursor()
    temp=(lati, length, longi, length)
    templist=[]
    for row in c.execute("SELECT * FROM geo_pic WHERE abs(latitude-?) < ? AND abs(longitude-?) < ?", temp):
        templist.append(row)
    conn.close()
    return templist
    
#updating a geo_pic
#@precondition: geo_pic must exist at loc to update
#@param: lat, long, newpic
#@return: True cuz assuming precond
def updt_geo_pic(lati,longi,newpic):
    conn=sql.connect('crowdhunts.db')
    c=conn.cursor()
    temp=(newpic,lati,longi)
    c.execute("UPDATE geo_pic SET image=? WHERE latitude=? AND longitude=?",temp)
    conn.commit()
    conn.close()
    return True
'''
