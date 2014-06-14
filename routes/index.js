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
      //var weatherData = globalData[10][0];
      
      var track = {
        localTime: globalData[0],
        flag: globalData[1],
        safetyCar: globalData[2] == 1,
        qualify: globalData[3] == 1,
        elapsedTime: globalData[4],
        remainingTime: globalData[5],
        notification: globalData[7],
        logo: globalData[8],
        // weather: {
        //   airTemp: weatherData[0],
        //   roadTemp: weatherData[1],
        //   humidity: weatherData[2],
        //   airPreassure: weatherData[3],
        //   windSpeed: weatherData[4],
        //   windDirection: weatherData[5],
        //   weatherType: weatherData[6],
        //   weatherIcon: weatherData[8]
        // },
        isDay: globalData[11]
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

module.exports = router;
