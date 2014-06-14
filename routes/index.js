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
        localTime: moment(globalData[3], "HH:mm"),
        flag: globalData[6],
        safetyCar: globalData[9] == 1,
        qualify: globalData[1] == 1,
        elapsedTimeInSeconds: parseTime(globalData[4]),
        remainingTimeInSeconds: parseTime(globalData[7]),
        notification: globalData[2],
        logo: globalData[5],
        weather: {
          airTemp: parseFloat(weatherData[3]),
          roadTemp: parseFloat(weatherData[6]),
          humidity: parseFloat(weatherData[2]),
          airPreassure: parseFloat(weatherData[5]),
          windSpeed: parseFloat(weatherData[8]),
          windDirection: parseFloat(weatherData[0]),
          weatherType: weatherData[1],
          weatherIcon: weatherData[7],
          weatherIconUrl: "http://live.fiawec.com/_include/wec/images/meteo/"+weatherData[7]+".png"
        },
        isDay: globalData[12]
      };
      var cars = [];
      var carData = uglyData[0];

      var tmp = Object.keys(carData);
      for(var i = 1; i< tmp.length; i++) {
        var car = carData[tmp[i]];

        var pilot = car[5] == '' ? null : staticData.tabPilotes[car[5]];
        var team = car[2] == '' ? null : staticData.tabTeams[car[2]];

        cars.push({
          pilot: pilot == null ? null : {
            lastName: pilot.prenom,
            firstName: pilot.nom,
            country: staticData.tabPays[pilot.pays].en,
            birthday: pilot.birth,
            picture: "http://live.fiawec.com/wpphpFichiers/1/pilote/"+car[5]+"/" + pilot.pic,
            site: pilot.site,
            facebook: pilot.facebook,
            twitter: pilot.twitter
          },
          driverStatus: car[9],
          laps: parseInt(car[13]),
          time: car[0],
          timeDifference: car[4],
          bestTime: car[8],
          lastTime: car[12],
          pits: car[16],
          angSpeed: car[1],
          team: team,
          tires: car[6],
          wec: car[10],
          d1l1: car[14],
          d1l2: car[3],
          d2l1: car[7],
          d2l2: car[11],
          avg: car[15]
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
