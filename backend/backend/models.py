from sqlalchemy.types import Integer, JSON
from backend.database import db


class PayloadModel(db.Model):
    id = db.Column(Integer, primary_key=True)
    data = db.Column(JSON, nullable=False)
