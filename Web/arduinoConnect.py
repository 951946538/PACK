
import requests
from urllib.request import urlopen
from urllib.error import URLError
import sys
 


def internet_on(url):
    try:
        urlopen(url, timeout=1)
        return True
    except URLError as err: 
        return False


def sendDepthMap(txtFile):
    if internet_on('http://esp8266-webupdate.local/'):
        print("sending data ")
        with open(txtFile, 'rb') as f:
            r = requests.post('http://esp8266-webupdate.local/upload', files={txtFile: f})
            print(r.text)
            print(r)

    else :
        print("can't connect to arduino server")



if __name__ == "__main__":
    txtFile = str(sys.argv[1])
    sendDepthMap(txtFile)
        