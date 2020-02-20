#! /usr/bin/env python3

# Serve up the content and data for a web alarm clock that provides netatmo
# temperature and an openweathermap forecast.

import http.server
import socketserver
import posixpath
from urllib.parse import unquote
import yaml
import os
import sys
import netatmo

# config from persistent YAML file
config = None
try:
  config_path = os.environ['SNAP_COMMON']+'/config'
except KeyError:
  print('Trying local config file')
  config_path = './common/config'
try:
  with open(config_path) as file:
    config = yaml.safe_load(file)
    if config is None:
      print('Empty configuration file')
      config = {}
except IOError:
  print('Error reading config file')
try: port = int(config['port'])
except (KeyError, ValueError):
  print('Defaulting to port 8080')
  port = 8080

try: client_id = config['netatmo']['client_id']
except KeyError:
  print('ERROR: No Netatmo client_id provided.')
  sys.exit(1)
try: client_secret = config['netatmo']['client_secret']
except KeyError:
  print('ERROR: No Netatmo client_secret provided.')
  sys.exit(1)
try: username = config['netatmo']['username']
except KeyError:
  print('ERROR: No Netatmo username provided.')
  sys.exit(1)
try: password = config['netatmo']['password']
except KeyError:
  print('ERROR: No Netatmo password provided.')
  sys.exit(1)
try: station_id = config['netatmo']['station_id']
except KeyError:
  print('ERROR: No Netatmo station_id provided.')
  sys.exit(1)
try: ows_app = config['ows']['app']
except KeyError:
  print('ERROR: No OWS app provided.')
  sys.exit(1)
try: ows_city = config['ows']['city']
except KeyError:
  print('ERROR: No OWS city ID provided.')
  sys.exit(1)
try: alarm_hour = int(config['alarm']['hour'])%24
except (KeyError, TypeError, ValueError):
  print('No alarm hour')
  alarm_hour = 'UNSET'
try: alarm_minute = int(config['alarm']['minute'])%60
except (KeyError, TypeError, ValueError):
  print('No alarm minute')
  alarm_minute = 'UNSET'

# initialise netatmo
ws = netatmo.WeatherStation( {
        'client_id': client_id,
        'client_secret': client_secret,
        'username': username,
        'password': password,
        'default_station': station_id } )

# Handler serves alarm static content in the /ui/ directory, and /weather
# gets a JSON struct with the current temperature and forecast along with
# details of the relevant data source for each.

class AlarumHandler(http.server.SimpleHTTPRequestHandler):

  def translate_path(self, path):
    # Courtesy of http://louistiao.me/posts/python-simplehttpserver-recipe-serve-specific-directory/
    path = posixpath.normpath(unquote(path))
    words = path.split('/')
    words = filter(None, words)
    # /ui/ depends on whether we are a snap
    try:
      path = os.environ['SNAP']+'/ui/'
    except KeyError:
      path = './ui/'
    for word in words:
      drive, word = os.path.splitdrive(word)
      head, word = os.path.split(word)
      if word in (os.curdir, os.pardir):
        continue
      path = os.path.join(path, word)
    return path

  def do_GET(self):
    "Provide static UI content, or a weather data set."
    if self.path == "/netatmo":
        self.na_token = bytes(
          '{ "station_id": "' + station_id + '",' + \
          '  "token": "' + ws.access_token + '"}', 'UTF-8')
        self.send_response(200)
        self.send_header("Content-type", "application/json")
        self.send_header("Content-length", len(self.na_token))
        self.end_headers()
        self.wfile.write(self.na_token)
    elif self.path == "/ows":
        self.ows = bytes(
          '{ "app": "' + ows_app + '",' + \
          '  "city": "' + ows_city + '"}', 'UTF-8')
        self.send_response(200)
        self.send_header("Content-type", "application/json")
        self.send_header("Content-length", len(self.ows))
        self.end_headers()
        self.wfile.write(self.ows)
    elif self.path == "/alarm":
        self.alarm = bytes(
          '{ "hour": "' + str(alarm_hour) + '",' + \
          '  "minute": "' + str(alarm_minute) + '"}', 'UTF-8')
        self.send_response(200)
        self.send_header("Content-type", "application/json")
        self.send_header("Content-length", len(self.alarm))
        self.end_headers()
        self.wfile.write(self.alarm)
    else:
        http.server.SimpleHTTPRequestHandler.do_GET(self)

Handler = AlarumHandler
with socketserver.TCPServer(("", port), Handler) as httpd:
  print("Weather and alarm service listening on port", port)
  httpd.serve_forever()
