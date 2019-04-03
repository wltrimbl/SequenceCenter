
import os
import sys
from Skyport.Logger import getLogger
import json
import yaml
import subprocess
from pprint import pprint
import requests
from time import gmtime, strftime
# import unittest

# logging.basicConfig(level=logging.DEBUG)
logger = getLogger(__name__)




class User() :
    
    def __init__(self) :

        self.token = None
        self.login = None
        self.first_name = None
        self.last_name = None
        self.full_name = None
        self.email = None
        self.comment = None
        self.role = None

class Authentication:

    # logger.setLevel(logging.INFO)

    def __init__(self, host=None , token=None) :

        self.host : None
        self.token : None

        if host : 
            self.host = host
        if token :
            self.token = token     

    def get_user(self) :
        user = User()
        response = self.get()
        if response.ok :
            u =response.json()
            user.first_name = u['name'].split(" ")[0]
            user.last_name = u['name'].split(" ")[-1]
            user.full_name = u['name']
            user.email = u['email']
            user.admin = u['admin']
            user.role = 'Admin' if u['admin'] else 'User'
            user.token = u['token']
            user.login = u['login']
        else :
            logger.error("Could not retrieve user")
            logger.error(response.content)

        return  user 
          

        



    def get(self) :

        debug = 1

        headers = requests.utils.default_headers()
        headers.update(
            {   
            'User-Agent': "mgrast-auth-client/0.1",
            'Auth' : self.token ,
            }
        )    
        
        if self.host :
            response = requests.get( self.host , params=None , headers=headers)
        else: 
            logger.error("Can not authenticate, missing host url")    

        if debug :
            logger.debug(response.json())
            logger.debug(response.headers)
        return response   



