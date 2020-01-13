

var sound = new Audio("blackbird.mp3");
// XXX allow passing an alarm time and city ID in the goldendawn service
var alarmTime = "06:00"
var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

var timediv = document.getElementById('time');
var datediv = document.getElementById('date');
var tempdiv = document.getElementById('temp');
var forecastdiv = document.getElementById('forecast');


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
    console.log('An error occurred');
    forecastdiv.innerHTML = 'n/a';
  });
}

// set the time and date as fast as possible, then get weather
setTime();
getTemp();
getForecast();

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

