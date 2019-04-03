import hashlib
import logging
import os
from pprint import pprint
import requests
import unittest

logger = logging.getLogger(__name__)

class GoogleAnalytics:

    # Environment variables are defined in app.yaml.
    GA_TRACKING_ID = 'UA-131728043-1'
    GA_URL = 'https://www.google-analytics.com/collect'

    def __init__(self , GA_TRACKING_ID=GA_TRACKING_ID , user='None' , enabled=True , userAgent='GA Python 0.1' , userRequest=None):

        self.__dict__.update(
            {
                'tracking_id' : GA_TRACKING_ID ,
                'enabled' : enabled ,
                'user' : anonymize_user(user) ,
                'user_agent' : userAgent ,
                'user_request' : userRequest
            }
        )
        if userRequest :
            self.user_agent = userRequest.headers.get('User-Agent')
            self.host = userRequest.headers.get('Host')
            self.language = userRequest.headers.get('Accept-Language')
        else :
            headers = requests.utils.default_headers()
            self.user_agent = headers.get('User-Agent')
            self.host = headers.get('Host')
            self.language = headers.get('Accept-Language')    
             
        
                
                    
    # [START track_event]
    def track_event(self, category, action, label=None, value=0 , dataSource="API" , ):

        if not self.enabled :
            return 0

        data = {
            'v': '1',  # API Version.
            'tid': GA_TRACKING_ID,  # Tracking ID / Property ID.
            # Anonymous Client Identifier. Ideally, this should be a UUID that
            # is associated with particular user, device, or browser instance.
            'cid': '555',
            't': 'event',  # Event hit type.
            'ec': category,  # Event category.
            'ea': action,  # Event action.
            'el': label,  # Event label.
            'ev': value,  # Event value, must be an integer
            'ua' : user_agent ,
            'aip' : True,
            'ds' : dataSource ,
        }

        return self.post(data)

        # response = requests.post( self.GA_URL, data=data)
        # return response.raise_for_status()

    def track_pageview(self, resource, user=None, label=None, value=0 , dataSource="API"):
        if not self.enabled :
            return 0

        if not resource:
            logger.error('Missing page/resource name')

        data = {
            'v': '1',  # API Version.
            'tid': self.tracking_id,  
            'cid': self.user,
            't': 'pageview',
            'dl' : resource ,
            'dh' : self.host ,
            'ua' : self.user_agent ,
            'aip' : True,
            'ds' : dataSource ,
        }

        data1 = {
            'v': '1',  # API Version.
            'tid': self.tracking_id,  
            'cid': self.user,
            't': 'pageview',
            'dl' : "/batch" ,
            'dh' : self.host ,
            'ua' : self.user_agent ,
            'aip' : True,
            'ds' : dataSource ,
        }

        return self.post(data)
    

    def post(self,data) :

        
        headers = requests.utils.default_headers()
        headers.update(
            {   
            'User-Agent': "mgrast-api/1.0",
            }
        )    
        
        response = requests.post( self.GA_URL, data=data , headers=headers)
        return (response , response.raise_for_status() )   

def anonymize_user(user) :
    sha = hashlib.sha256()
    sha.update(  str.encode(user) )
    return sha.hexdigest()


class TestGA(unittest.TestCase):

    def test_anonymize(self):
        string = "Unittest"
        shasum = "cd7f08f4de09a8b9b89f7f88f8bfc738c138129ace9b53a2229527f7c3ce65f2"
        self.assertEqual(shasum , anonymize_user(string))

    def test_ga_init(self):
        ga = GoogleAnalytics()
        self.assertEqual("GoogleAnalytics" , ga.__class__.__name__)

    def test_ga_submit(self):
        ga = GoogleAnalytics()
        (response, ERROR) = ga.track_pageview("/test/")
        self.assertFalse(ERROR)
        self.assertEqual(200, response.status_code)

    def test_ga_submit_pageview_user(self):

        for us in ['Unittest A' , "Unittest B"] :
            ga = GoogleAnalytics(user=us)
            (response, ERROR) = ga.track_pageview("/test/")
            self.assertFalse(ERROR)
            self.assertEqual(200, response.status_code)
            del(ga)    

    def test_ga_tracking_id(self):
        # test assing id
        tid="ABC"
        ga = GoogleAnalytics(GA_TRACKING_ID=tid)
        self.assertEqual(tid , ga.tracking_id)
        del(ga)

        # test default id
        ga = GoogleAnalytics()
        self.assertEqual(ga.GA_TRACKING_ID , ga.tracking_id)
        del(ga)
        
        




if __name__ == '__main__':
    unittest.main()
