import sys
import logging

  
  
def getLogger(name) :
  

  if not name :
    name = __name__

  logger = None
  logger = logging.getLogger(name)
  logger.setLevel(logging.DEBUG)


  # create file handler which logs even debug messages
  fh = logging.FileHandler('error.log')
  fh.setLevel(logging.DEBUG)
  # create console handler with a higher log level
  ch = logging.StreamHandler()
  ch.setLevel(logging.INFO)
  # create formatter and add it to the handlers
  formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
  fh.setFormatter(formatter)
  ch.setFormatter(formatter)
  # add the handlers to the logger
  logger.addHandler(fh)
  logger.addHandler(ch)
  
  return logger 
  
    
class Logger():
    """Logging class"""
    
    def __init__(self, name ):

        if not name :
            name = __name__
        logger = None
        logger = logging.getLogger(name)
        logger.setLevel(logging.DEBUG)


        # create file handler which logs even debug messages
        fh = logging.FileHandler('error.log')
        fh.setLevel(logging.DEBUG)
        # create console handler with a higher log level
        ch = logging.StreamHandler()
        ch.setLevel(logging.DEBUG)
        # create formatter and add it to the handlers
        formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
        fh.setFormatter(formatter)
        ch.setFormatter(formatter)
        # add the handlers to the logger
        logger.addHandler(fh)
        logger.addHandler(ch)
        
        self.logger = logger
        self.consol = ch
        self.file   = fh
    
  
    def debug(self,data):
        self.logger.debug(data)

    def info(self,data):
        self.logger.info(data)

    def setLevel(self, consolLog=False , fileLog=False , level = logging.DEBUG ):

        if consolLog :
            self.consol.setLevel(level)
        if fileLog :
            self.file.setLevel(level)  