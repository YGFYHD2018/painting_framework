# coding: utf-8
from flask import Flask, render_template
from flask_cors import CORS
from werkzeug import ImmutableDict

class FlaskWithHamlish(Flask):
    jinja_options = ImmutableDict(
        extensions=['jinja2.ext.autoescape', 'jinja2.ext.with_', 'hamlish_jinja.HamlishExtension']
    )
app = FlaskWithHamlish(__name__) #インスタンス生成
CORS(app)

@app.route('/')
def index():
    return render_template('index.haml')

if __name__ == "__main__":
    # webサーバー立ち上げ
    app.run()