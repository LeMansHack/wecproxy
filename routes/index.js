var express = require('express');
var router = express.Router();
var Client = require('node-rest-client').Client;
var moment = require('moment');
var staticData = require('./../vendor/fiawec');


var lastRequest = 0;
var lastResponse = "";
/* GET home page. */
router.get('/', function(req, res) {
  
  // We need to find out when we last requested the resource
  var ticks = new Date().getTime();
  if(ticks - lastRequest < 10000) {
    // We will just use the cache
    lastResponse.fresh = false;
    res.json(lastResponse);
    return;
  }
  
  // We will make a new request. Take note of the time
  lastRequest = ticks;

  client = new Client();

  // direct way
  client.get("http://live.fiawec.com/proxy.php?file=1/live/data.js&t=" + ticks, function(data, response){

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
        var extraData = getExtraData(car[2]);

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
          bestTimeInMiliseconds: parseLapTime(car[8]),
          lastTimeInMiliseconds: parseLapTime(car[12]),
          pits: parseInt(car[16]),
          averageSpeed: parseFloat(car[1]),
          tires: car[6],
          wec: car[10],
          d1l1: car[14],
          d1l2: car[3],
          d2l1: car[7],
          d2l2: car[11],
          avg: car[15],
          team: extraData.team,
          number: extraData.number,
          category: extraData.category,
          carBrand: extraData.carBrand,
          carName: extraData.carName
        });
      }

      lastResponse = {
        track: track,
        cars: cars,
        fresh: true,
        ticks: ticks    
      };

      res.json(lastResponse);

  });

});

function parseTime(str) {
  var tokens = str.split(":");
  var hours = parseInt(tokens[0].replace(" ", ""));
  var min = parseInt(tokens[1].replace(" ", ""));
  var sec = parseInt(tokens[2].replace(" ", ""));

  return parseInt(sec + min*60 + hours*60*60);
}

function parseLapTime(str) {
  var tokens1 = str.split(":");
  var min = parseInt(tokens1[0].replace(" ", ""));
  var tokens2 = str.split(".");
  var sec = parseInt(tokens2[0].replace(" ", ""));
  var mil = parseInt(tokens2[1].replace(" ", ""));

  return parseInt(mil + sec*1000 + min*60*1000);
}

function getExtraData(id) {
  if(id == null)
    return {};
  var engageData = staticData.tabEngages[id];
  var teamData = staticData.tabTeams[engageData.team];
  var carData =  staticData.tabVehicules[engageData.voiture];
  var brand = staticData.tabMarques[carData.marque];
  var categoryData = staticData.tabCategories[engageData.categorie];
  return {
    team: teamData.nom,
    number: engageData.num,
    category: categoryData.nom,
    carBrand: brand,
    carName: carData.nom
  }
}

module.exports = router;
