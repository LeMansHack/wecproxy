var express = require('express');
var router = express.Router();
var Client = require('node-rest-client').Client;

/* GET home page. */
router.get('/', function(req, res) {
  

  client = new Client();

  // direct way
  client.get("http://live.fiawec.com/proxy.php?file=1/live/data.js&t=" + new Date().getTime(), function(data, response){

      // parsed response body as js object
      var uglyData = JSON.parse(data);

      // First object is global data
      var globalData = uglyData[0];
      var weatherData = globalData[10][0];

      var track = {
        localTime: globalData[0],
        flag: globalData[1],
        safetyCar: globalData[2] == 1,
        qualify: globalData[3] == 1,
        elapsedTime: globalData[4],
        remainingTime: globalData[5],
        notification: globalData[7],
        logo: globalData[8],
        weather: {
          airTemp: weatherData[0],
          roadTemp: weatherData[1],
          humidity: weatherData[2],
          airPreassure: weatherData[3],
          windSpeed: weatherData[4],
          windDirection: weatherData[5],
          weatherType: weatherData[6],
          weatherIcon: weatherData[8]
        },
        isDay: globalData[11]
      };
      var cars = [];
      for(var i = 1; i< uglyData.length; i++) {
        cars.push(uglyData[i]);
      }

      res.json({
        track: track,
        cars: cars
      })

  });

});

module.exports = router;
