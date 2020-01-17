

var sound = new Audio("blackbird.mp3");
var alarmTime = null;
var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

var timediv = document.getElementById('time');
var datediv = document.getElementById('date');
var tempdiv = document.getElementById('temp');
var alarmdiv = document.getElementById('alarm');
var forecastdiv = document.getElementById('forecast');

function updateAlarm() {
  fetch('alarm')
  .then((response) => response.json())
  .then((alarm) => {
    if (alarm.hour=='UNSET' || alarm.minute=='UNSET') {
      alarmTime=null;
      alarmdiv.innerHTML = '&#x1f514; --:--'
      }
    else {
      hour = parseInt(alarm.hour)%24;
      minute = parseInt(alarm.minute)%60;
      alarmdiv.innerHTML = '&#x1f514; ' + addZero(hour) + ':' + addZero(minute);
      currentTime = new Date();
      alarmTime = new Date(
        currentTime.getFullYear(), currentTime.getMonth(),
        currentTime.getDate(), hour, minute, 0);
      if (alarmTime < currentTime) { alarmTime.setDate(alarmTime.getDate()+1) };
    };
  })
  .catch(function() {
    // catch any errors
    console.log('An error occurred updating the alarm');
    alarmdiv.innerHTML = '&#x1f514; xx:xx'
    })
  };

// set the background to a colour based on the alarm
function checkAlarm() {
  if ( alarmTime == null ) {
    document.body.style.background = '#000000';
    return;
    }
  currentTime = new Date();
  timeDelta = alarmTime - currentTime;
  brightest = 150;
  blue_ramp = 1000*60*60;
  grey_ramp = 1000*60*10;
  blue = '00';
  gr = '00';
  if ( timeDelta < blue_ramp ) { // approaching alarm
    blue = Math.trunc(((1 - (timeDelta/blue_ramp))*brightest)).toString(10);
    if ( timeDelta < grey_ramp ) {
      gr = Math.trunc(((1 - (timeDelta/grey_ramp))*brightest)).toString(10);
      };
    document.body.style.background = 'rgb('+gr+', '+gr+', '+blue+')';
    }
  else if ( timeDelta > 23*1000*60*60 ) { // just past alarm
    timeDelta -= 23*60*60*1000;
    timeDelta = Math.min(grey_ramp, timeDelta);
    gr = Math.trunc((timeDelta/grey_ramp)*brightest).toString(10);
    document.body.style.background = 'rgb('+gr+', '+gr+', '+gr+')';
    }
  else { document.body.style.background = '#000000' };
  };

function setTime() {
  var date = new Date();
  timediv.textContent = timeString(date);
  datediv.textContent = dayString(date);
  }

function getTemp() {
  fetch('netatmo')
  .then((response) => response.json())
  .then((data) => {
    var fetch_init = {
      headers:
        { 'Authorization': 'Bearer ' + data.token }
      };
    fetch('https://api.netatmo.com/api/getstationsdata?device_id='+encodeURIComponent(data.station_id),
      fetch_init)
    .then((response) => response.json())
    .then((data) => {
      var x;
      for (x of data.body.devices[0].modules) {
        if ( x['type'] == 'NAModule1' ) {
          tempdiv.innerHTML = x.dashboard_data.Temperature + '&deg;C';
          };
        };
    })
    .catch((error) => {
      tempdiv.innerHTML = 'n/a';
      console.error('Netatmo Error:', error);
    });
  })
  .catch((error) => {
    console.error('Netatmo error:', error);
    tempdiv.innerHTML = 'xx';
  });
}

function getForecast() {
  fetch('ows')
  .then((response) => response.json())
  .then((ows) => {
    fetch('https://api.openweathermap.org/data/2.5/forecast?id=' + ows.city +
    '&appid=' + ows.app + '&cnt=8&units=metric')
    .then(function(resp) { return resp.json() }) // Convert data to json
    .then(function(data) {
      var fchtml = ""
      var x;
      var y;
      for (x of data.list) {
        for (y of x.weather) {
          fchtml += "<i class='owi owi-" + y.icon + "'></i>&nbsp;"
        }
      };
      forecastdiv.innerHTML = fchtml;
    });
  })
  .catch(function() {
    // catch any errors
    console.log('An error occurred setting the forecast');
    forecastdiv.innerHTML = 'n/a';
  });
}

// set the time and date as fast as possible, then get weather
setTime();
getTemp();
getForecast();
updateAlarm();

// display current time every second
var currentTimer = '';
var delay = 1000 - new Date().getMilliseconds();
setTimeout( function() {
  currentTimer = setInterval(setTime, 1000);
  }, delay);
// update the temperature every 10 minutes
var tempTimer = setInterval(getTemp, 1000*60*10);
// update weather hourly
var fcTimer = setInterval(getForecast, 1000*60*60);
// update the alarm every minute
var alarmTimer = setInterval(updateAlarm, 1000*60*1);
// update the background colour every 2 seconds
var lightTimer = setInterval(checkAlarm, 1000*2);

// Ensure formatting of times
function addZero(time) {
  return (time < 10) ? "0" + time : time;
}

// Get a string for a date
function timeString(date) {
  return addZero(date.getHours()) + ":" + addZero(date.getMinutes());
}

function dayString(date) {
  return days[date.getDay()] + ", " + date.getDate() + " " + months[date.getMonth()] + " " + date.getFullYear();
}

function shortDayString(date) {
  return dayString(date).substring(0,3);
}

