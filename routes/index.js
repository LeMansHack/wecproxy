var express = require('express');
var router = express.Router();
var Client = require('node-rest-client').Client;
var moment = require('moment');
var staticData = require('./../vendor/fiawec');


/* GET home page. */
router.get('/', function(req, res) {
  

  client = new Client();

  // direct way
  client.get("http://live.fiawec.com/proxy.php?file=1/live/data.js&t=" + new Date().getTime(), function(data, response){

      // parsed response body as js object
      var uglyData = JSON.parse(data);

      // First object is global data
      var globalData = uglyData[1];
      var weatherData = globalData[11][0];
      
      var track = {
        localTime: globalData[3],
        flag: globalData[6],
        safetyCar: globalData[9] == 1,
        qualify: globalData[1] == 1,
        elapsedTimeInSeconds: parseTime(globalData[4]),
        remainingTimeInSeconds: parseTime(globalData[7]),
        //notification: globalData[8],
        logo: globalData[5],
        weather: {
          airTemp: weatherData[3],
          roadTemp: weatherData[6],
          humidity: weatherData[2],
          airPreassure: weatherData[5],
          windSpeed: weatherData[8],
          windDirection: weatherData[0],
          weatherType: weatherData[1],
          weatherIcon: weatherData[7]
        },
        isDay: globalData[12]
      };
      var cars = [];
      var carData = uglyData[0];

      var tmp = Object.keys(carData);
      for(var i = 1; i< tmp.length; i++) {
        var car = carData[tmp[i]];
        
        cars.push({
          pilot: car[0] == '' ? null : staticData.tabPilotes[car[0]],
          driverStatus: car[1],
          laps: car[2],
          time: car[3],
          timeDifference: car[4],
          bestTime: car[5],
          lastTime: car[6],
          nbStands: car[7],
          angSpeed: car[8],
          team: car[9] == '' ? null: staticData.tabTeams[car[9]],
          tires: car[10],
          wec: car[11],
          d1l1: car[12],
          d1l2: car[13],
          d2l1: car[14],
          d2l2: car[15],
          avg: car[16]
        });
      }

      res.json({
        track: track,
        cars: cars
      })

  });

});

function parseTime(str) {
  var tokens = str.split(":");
  var hours = parseInt(tokens[0].replace(" ", ""));
  var min = parseInt(tokens[1].replace(" ", ""));
  var sec = parseInt(tokens[2].replace(" ", ""));

  return parseInt(sec + min*60 + hours*60*60);
}

module.exports = router;
