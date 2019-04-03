from flask_restful import Api , Resource , reqparse
from flask import current_app
from flask import request
from GoogleAnalytics import GoogleAnalytics
import json

users = [
    {
        "name" : "a" ,
        "age" : 10 ,
        "occupation" : "Tester"
    },
     {
        "name" : "b" ,
        "age" : 20 ,
        "occupation" : "Tester"
    }

]

class User(Resource):
    
    ga = GoogleAnalytics()   

    def get(self , login = None ):

        (response, ERROR) = self.ga.track_pageview("/" + request.endpoint)

        if login :
            for user in users:
                if (login == user['name']):
                    user['agent'] = request.headers.get('User-Agent')
                    user['header'] = json.dumps({k:v for k, v in request.headers }) 
                    user['base_url'] = request.base_url
                    user['path'] = request.path
                    user['script_root'] = request.endpoint
                    user['url_root'] = request.url_root
                    return  user, 200
        return current_app.config['SECRET_KEY'] , 404

    def put(self,login):
        return "not implemented" , 404

    def post(self,login) : 
        return "not implemend" , 404

    def delete(self,login):
        return "not implemented" , 404         