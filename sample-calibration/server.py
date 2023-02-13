import flask
from flask_cors import CORS
from flask import request

app = flask.Flask(
        __name__,
        template_folder='templates',
        static_folder='static')

CORS(app)

@app.route('/', methods=['GET'])
def index():
    return flask.render_template('index.html')

@app.route('/calibration', methods=['GET'])
def calibration():
    return flask.render_template('calibration.html')

@app.route('/robots.txt')
@app.route('/tfjs/model.json')
@app.route('/tfjs/group1-shard1of1.bin')
@app.route('/model/sumaho.gltf')
def static_from_root():
    return flask.send_from_directory(app.static_folder, request.path[1:])

if __name__ == '__main__':
    app.run(debug=True, port=8001)