# coding: utf-8
from flask import Flask, render_template
from werkzeug import ImmutableDict
import requests

class FlaskWithHamlish(Flask):
    jinja_options = ImmutableDict(
        extensions=['jinja2.ext.autoescape', 'jinja2.ext.with_', 'hamlish_jinja.HamlishExtension']
    )
app = FlaskWithHamlish(__name__) #インスタンス生成

@app.route('/')
def index():
    return render_template('index.haml')

if __name__ == "__main__":
    response = requests.post('http://127.0.0.1:5001/api/filters',data={})
    print('response code : ')
    print(response.status_code)
    # webサーバー立ち上げ
    app.run()