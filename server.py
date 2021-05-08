from flask import Flask
from flask import render_template

app = Flask(__name__)

@app.route('/')
@app.route('/index')
def index():
    return render_template('index.html')

@app.route('/ewald')
def ewald():
    return render_template('ewald.html')

app.run(debug=True)