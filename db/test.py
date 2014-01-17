import sqlite3 as sql



def init_db():
    conn=sql.connect('crowdhunts.db')
    c=conn.cursor()
    c.execute("CREATE TABLE users (username text,password test, total_dist real, avg_score real)")
    c.execute("CREATE TABLE geo_pic (latitude real, longitude real, image blob)")
    conn.close()
