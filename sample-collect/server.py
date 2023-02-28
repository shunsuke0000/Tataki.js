import flask

from flask_cors import CORS

from flask import request
import pandas as pd
import pickle
import datetime
from flask import jsonify
import json

from flask import g
import sqlite3

app = flask.Flask(
        __name__,
        template_folder='templates',
        static_folder='static')

CORS(app)

def get_db():
    if 'db' not in g:
        # データベースをオープンしてFlaskのグローバル変数に保存
        g.db = sqlite3.connect('TestDB.sqlite3')
    return g.db

@app.route('/', methods=['GET'])
def index():
    return flask.render_template('index.html')

@app.route('/collect', methods=['GET'])
# @flask_login.login_required
def collect():
    return flask.render_template('collect.html')

@app.route('/collectAPI', methods=['POST'])
def collectAPI():
    print()
    print('@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@')
    if request.method == 'POST':
        data = request.json
        # print(type(data))


        print(len(data['AX']))

        AX = data['AX']
        AY = data['AY']
        AZ = data['AZ']
        RX = data['RX']
        RY = data['RY']
        RZ = data['RZ']
        Time = list(map( lambda x: x-data['arrTime'][0], data['arrTime'] ))

        AX = ','.join((map(str, AX)))
        AY = ','.join((map(str, AY)))
        AZ = ','.join((map(str, AZ)))
        RX = ','.join((map(str, RX)))
        RY = ','.join((map(str, RY)))
        RZ = ','.join((map(str, RZ)))
        Time = ','.join((map(str, Time)))

        kindsSumaho = data['kindsSumaho']
        orientation = data['orientation']
        kindsTataki = data['kindsTataki']

        # print(AX)
        # print(Time)
        # print(kindsSumaho)
        # print(orientation)
        # print(kindsTataki)

        # データベースを開く
        conn = get_db()
        curs = conn.cursor()
        
        # 初回のみ
        # print('===== CREATE TABLE')
        # # テーブルを作成する
        # curs.execute('CREATE TABLE tataki ('
        #             'id INTEGER PRIMARY KEY AUTOINCREMENT, '
        #             'kindsSumaho VARCHAR,'
        #             'orientation VARCHAR,'
        #             'kindsTataki VARCHAR,'
        #             'AX,'
        #             'AY,'
        #             'AZ,'
        #             'RX,'
        #             'RY,'
        #             'RZ,'
        #             'Time)')
        # # 作成したテーブルをコミットする
        # conn.commit()

        print('===== INSERT')
        # データを追加する
        # プレースホルダーを使ってデータを追加する
        insert_sql = 'INSERT INTO tataki(kindsSumaho, orientation, kindsTataki, AX, AY, AZ, RX, RY, RZ, Time) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
        curs.execute(insert_sql, (kindsSumaho, orientation, kindsTataki, AX, AY, AZ, RX, RY, RZ, Time))
        # コミットする
        conn.commit()

        # カーソルとコネクションをクローズする
        curs.close()
        conn.close()


        # picleバージョン
        # # df =  pd.DataFrame(data)
        # # df['time'] = df['arrTime'] - df['arrTime'][0]
        # # print(df)

        # dt_now = datetime.datetime.now()
        # dt_now = dt_now.strftime('%Y-%m-%d-%H-%M-%S-%f')
        # file_name = dt_now + '.pickle'
        # file_name = 'test.pickle'

        # with open(file_name, 'wb') as web:
        #     print(file_name)
        #     pickle.dump(data , web)

    return data


@app.route('/robots.txt')
@app.route('/tfjs/model.json')
@app.route('/tfjs/group1-shard1of1.bin')
def static_from_root():
    return flask.send_from_directory(app.static_folder, request.path[1:])

if __name__ == '__main__':
    app.run(debug=True)