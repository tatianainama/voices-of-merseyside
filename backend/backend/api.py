import csv
import os

from flask import request, make_response, send_from_directory
from flask_restful import Resource

from backend.database import db
from backend.models import PayloadModel
from backend.voices_to_csv import headers, map_entry_to_rows


class Payload(Resource):
    def get(self):
        ret = []
        for entry in PayloadModel.query.order_by("id"):
            item = entry.data
            item.update(id=entry.id)
            ret.append(item)
        return ret

    def post(self):
        data = request.get_json()
        if data is None:
            return make_response('', 400)
        p = PayloadModel(data=data)
        db.session.add(p)
        db.session.commit()

        return make_response('', 201)


class CSVExport(Resource):
    def get(self):
        ret = []
        with open('tanya.csv', 'w') as csvfile:
            writer = csv.writer(csvfile, delimiter=',')
            writer.writerow(headers)
            for entry in PayloadModel.query.order_by("id"):
                for subentry in map_entry_to_rows(entry.data, entry.id):
                    writer.writerow(subentry)
        return send_from_directory(os.getcwd(), 'tanya.csv', as_attachment=True)
