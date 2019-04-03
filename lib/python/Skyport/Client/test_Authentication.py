
import os
import sys
import logging
import json
import yaml
import subprocess
from pprint import pprint
import requests
from time import gmtime, strftime
import unittest
from Authentication import Authentication

class TestSkyportAuthentication(unittest.TestCase):



    def test_set_token(self):
        
        auth = Authentication()
        auth.token = "TEST"
        self.assertEqual(auth.token , "TEST")

    def test_set_host_url(self) :

        auth = Authentication(host="http://auth_host")
        self.assertEqual(auth.host , "http://auth_host")  

    def test_connect_host(self) :
        auth = Authentication(host="http://auth_host" , token="TEST")

        response = None
        try:
            response = auth.get()
        except :    
            pass
            # logger.error("Connection error" )

        self.assertTrue(response and response.ok)
    
    def test_seq_center(self):

        url ="https://sequencing.bio.anl.gov/cgi-bin/oAuth.cgi?action=data"
        auth = Authentication(host=url)
        auth.token = "wLUHRrNwaUGbq1ugjRLqPQGEKZcjpdw1"
        response = auth.get() 
        self.assertEqual(response.status_code , 200)  
       
      


if __name__ == "__main__":
    unittest.main()