# The GoldenDawn Alarm Clock

This is an idiosyncratic alarm clock. It does exactly what I want an alarm
clock to do. It is perfect for you if you want an alarm clock to do exactly
what it does.

GoldenDawn gives you the time, the current temperature from your Netatmo
weather station, and a 24 hour forecast from OpenWeather. It uses a deep red
colour to avoid blue light and preserve your night vision. Over an hour
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


snap install mir-kiosk wpe-webkit-mir-kiosk goldendawn

