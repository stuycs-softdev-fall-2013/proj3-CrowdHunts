import sqlite3 as sql


'''
initializes 2 db's

users
|username|password|total_dist|avg_score|num_plays|

geo_pic
|latitutde|longitude|image|
'''
def init_db():
    conn=sql.connect('crowdhunts.db')
    c=conn.cursor()
    c.execute("""
CREATE TABLE users (
username text,
password text,
total_dist real,
avg_score real,
num_plays real
)""")
    c.execute("CREATE TABLE geo_pic (latitude real, longitude real, image blob)")
    conn.close()

#add user
#@params: username, password
#@return: True
def add_user(usernm, passwd):
    conn=sql.connect('crowdhunts.db')
    c=conn.cursor()
    temp=(usernm,passwd)
    c.execute("INSERT INTO users VALUES (?,?,0,0,0)",temp)
    conn.commit()
    conn.close()
    return True

#update password
#@params: username, old password, new password
#@return: true if old pass correct, false otherwise
def updt_pass(usernm, old_pass, new_pass):
    conn=sql.connect('crowdhunts.db')
    c=conn.cursor()
    temp=(usernm,old_pass)
    c.execute("SELECT * FROM users WHERE username=? AND password=?",temp)
    temp_user=c.fetchone()
    if temp_user==None:
        conn.close()
        return False
    temp=(new_pass,usernm)
    c.execute("UPDATE users SET password=? WHERE username=?",temp)
    conn.commit()
    conn.close()
    return True
