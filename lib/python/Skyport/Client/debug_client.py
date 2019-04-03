import Authentication  

from Skyport.Logger import getLogger


# create logger
logger = getLogger( "Debugging")


url ="https://sequencing.bio.anl.gov/cgi-bin/oAuth.cgi?action=data"
auth = Authentication.Authentication(host=url)
auth.token = "wLUHRrNwaUGbq1ugjRLqPQGEKZcjpdw1"
logger.debug('make call')
user = auth.get_user() 
logger.info("Logged in as " + str(user.login))