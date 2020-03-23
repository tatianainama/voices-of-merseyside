from flask import request, make_response
from flask_restful import Resource

from backend.database import db
from backend.models import PayloadModel


class Payload(Resource):
    def get(self):
        return [item.data for item in PayloadModel.query.all()]

    def post(self):
        data = request.get_json()
        if data is None:
            return make_response('', 400)
        p = PayloadModel(data=data)
        db.session.add(p)
        db.session.commit()

        return make_response('', 201)
