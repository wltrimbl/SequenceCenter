from flask import Flask
from flask import request

import json
import urllib2
from pprint import pprint

from Skyport.Logger import Logger


app     = Flask(__name__)
logger  = Logger(__name__)

authentication_service_url = None


@app.route('/')
def hello_world():
    return 'Hello, World!'


@app.route('/share/')
def share():
    
    email       = None
    items       = []
    item_type   = None
    share_type  = None
    message     = None
    
    parameters = [ 
        'action=modrights' ,
        "dynamic='" + str(message) + "'" ,
        "email=" + str(email)  ,
        "type=" + str(item_type) ,
    ]
    
    logger.info("Sharing")
    # add items
    for item in items :
        parameters.push( "item=" + item )

    url_parameter = "&".join( parameters )

    # req = urllib2.Request(url)
    # res = urllib2.urlopen(req)
    # obj = json.loads(res.read())
    return 'TEST\n'


@app.route("/share/project/<project>")
def project():
    pass


@app.route('/share/files/')
def share_files():
    return "<p>FILES</p>"


@app.route('/node/')
def node():
    pass


# jQuery.ajax({ url: RetinaConfig.auth_url + "?action=modrights&dynamic="+dynamic+"&email="+email+"&type="+dataType+"&item="+entries[0]+"&view=1&edit="+(assign ? "1" : "0")+"&add=1&owner="+(shareType == "admin" ? 1 : 0),
# jQuery.ajax({ url: RetinaConfig.auth_url + "?action=modrights&dynamic="+dynamic+"&email="+email+"&type="+dataType+"&item="+currentFileShareItems.join('&item=')+"&view=1&edit="+(assign ? "1" : "0")+"&add=1&owner="+(shareType == "admin" ? 1 : 0),







# #pprint(obj)
# url = 'http://api.mg-rast.org/search?project_name=neon&limit=900'
# print("metagenome_id\tproject_name\tPI_organization\torganization\tPI_lastname")

# while (url is not None) :
#     req = urllib2.Request(url)
#     res = urllib2.urlopen(req)
#     obj = json.loads(res.read())
    
  
#     for mgm in obj['data'] :
#         print(mgm['metagenome_id'] + "\t" + mgm['project_name'] + "\t" + mgm['PI_organization'] + "\t" + (mgm['organization'] if mgm['organization'] else  'none') + "\t" + mgm['PI_lastname'])

#     if 'next' in obj and obj['next'] :  
#         url = obj['next']
#     else:
#         url = None     