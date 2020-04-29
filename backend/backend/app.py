import os

from pathlib import Path

import waitress

from backend.api import Payload
from backend.database import db

from flask import Flask
from flask_restful import Api


def create_app():
    app = Flask(__name__)
    DB_PATH = os.environ.get('DB_PATH', '/home/david/tanya.db')
    app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{DB_PATH}'
    db.init_app(app)

    api = Api(app)
    api.add_resource(Payload, '/')

    if not Path(DB_PATH).exists():
        with app.app_context():
            db.create_all()
    return app

def start(prod=True):
    app = create_app()

    if prod:
        waitress.serve(app, host='0.0.0.0', port=5001)
    else:
        app.run(debug=True, port=5001)


if __name__ == '__main__':
    start(prod=False)
