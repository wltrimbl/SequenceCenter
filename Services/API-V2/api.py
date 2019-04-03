from flask import Flask
from flask_restful import Api , Resource , reqparse

from resources.User import User
import GoogleAnalytics

class Base(Resource):

    def get(self):
        
        resources = {
            "resources" : [
                { "name" : "user" }
            ]
        }

        return  resources , 200
  

    def put(self,login):
        return "not implemented" , 404

    def post(self,login) : 
        return "not implemend" , 404

    def delete(self,login):
        return "not implemented" , 404     




       

app = Flask(__name__)
app.config.from_json("api-config.json")
api = Api(app)

api.add_resource(Base, '/')
api.add_resource(User, '/user/' , '/user/<string:login>')


# start as main or flask run --host 0.0.0.0
if __name__ == '__main__': 
    app.run(host='0.0.0.0' , debug=True)