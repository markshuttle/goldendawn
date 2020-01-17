# The GoldenDawn Alarm Clock

This is an idiosyncratic alarm clock. It does exactly what I want an alarm
clock to do. It is perfect for you if you want an alarm clock to do exactly
what it does.

GoldenDawn gives you the time, the current temperature from your Netatmo
weather station, and a 24 hour forecast from OpenWeather. It uses a deep red
colour to avoid blue light and preserve your night vision. Over the hour
before your alarm is set, it will raise the blue levels around that to
provide a gentle subliminal dawn.

Project this alarm clock on your ceiling at night, with a pico-laser
projector like the SONY MP-CL1A or the Nebra Anybeam so that you have no
stray light patch. Use a fanless projector and fanless compute stick to keep
the room silent at night. Perfect.

## How do use it

The alarm is packaged as a snap to use with Ubuntu's standard kiosk service.
It provides the UI as a web service. If you want a completely locked down
and autonomous system, use Ubuntu Core on your compute stick. Otherwise,
just use classic Ubuntu Server.


    sudo snap install mir-kiosk wpe-webkit-mir-kiosk goldendawn
    sudo snap connect wpe-webkit-mir-kiosk:wayland

Now you need to configure your alarm clock. A future version might use snap
configuration, but for now just create you config YAML as
/var/snap/goldendawn/common/config - here is an example.

    port: 8080
    netatmo:
      client_id: '5e086ebdaffea08bfc4eea85'
      client_secret: 'EQ5KMLndLaZrxI7xleSD97FgH7CaqUFJxz'
      username: 'xxx@yyy.com'
      password: 'XXX'
      station_id: '70:ee:50:xx:xx:xx'
    ows:
      app: '71c92ef0ec07c3c70ff8d5ad9e70ad63'
      city: '6942529'
    alarm:
      hour: 05
      minute: 45

The port and alarm are straightforward. You do not have to have an alarm.
The netatmo section should include your personal netatmo username and
password (the ones you use to log in to netatmo.com to see your
weatherstation there). The client_id and client_secret here are for this
app, please register your own app if you fork this project. station_id is
the mac address of your weather station, you will find it in your netatmo
settings.

The ows section is for the OpenWeather Service, which is where the forecast
comes from. THe city ID here is for Cape Town, check out OpenWeatherMap for
your own city ID at https://openweathermap.org/find  (as a clue check the
URL of the link to the city name).

If you restart the goldendawn snap now, you should see it as up and running:

    sudo service snap.goldendawn.alarumd status
    ● snap.goldendawn.alarumd.service - Service for snap application goldendawn.alarumd
       Loaded: loaded (/etc/systemd/system/snap.goldendawn.alarumd.service; enabled; vendor preset: enabled)
       Active: active (running) since Fri 2020-01-17 19:39:33 SAST; 2s ago
     Main PID: 14769 (python3)
        Tasks: 1 (limit: 4576)
       CGroup: /system.slice/snap.goldendawn.alarumd.service
               └─14769 /snap/goldendawn/4/usr/bin/python3 /snap/goldendawn/4/bin/alarumd.py

    Jan 17 19:39:33 localhost systemd[1]: Started Service for snap application goldendawn.alarumd.

Now you should configure the web kiosk to get its web page from goldendawn:

    sudo snap set wpe-webkit-mir-kiosk url=http://localhost:8080/
    sudo snap restart mir-kiosk
    sudo snap restart wpe-webkit-mir-kiosk

