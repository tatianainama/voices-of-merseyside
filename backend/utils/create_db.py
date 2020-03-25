from backend.app import app
from backend.database import db

with app.app_context():
    db.create_all()
    print('DB created')