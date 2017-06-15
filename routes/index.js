var express = require('express');
var router = express.Router();
var Client = require('node-rest-client').Client;
var moment = require('moment');
var staticData = require('./../vendor/fiawec');


var fakeFlagStatus = null;

var lastRequest = 0;
var lastResponse = "";
/* GET home page. */
router.get('/', function(req, res) {
  
  getData(function(data) {
    res.json(data);
  });

});

router.get('/setflagstatus/:status', function(req, res) {
  fakeFlagStatus = req.params.status;

  res.send("Set");
});

router.get('/deleteflagstatus', function(req, res) {
  fakeFlagStatus = null;

  res.send("Deleted");
});


router.get('/flagstatus', function(req, res) {
  getData(function(data) {
    
    if(fakeFlagStatus) {
      res.send(fakeFlagStatus);
      return;
    }

    res.set('Content-Type', 'text/plain');
    if(data.track.flag == 1 || data.track.safetyCar == 1) {
      res.send("1");      
    } else {
      res.send("0");
    }
  });
});

function getData(done) {
  // We need to find out when we last requested the resource
  var ticks = new Date().getTime();
  if(ticks - lastRequest < 10000) {
    // We will just use the cache
    lastResponse.fresh = false;
    done(lastResponse);
    return;
  }
  
  // We will make a new request. Take note of the time
  lastRequest = ticks;

  client = new Client();

  // direct way
  client.get("http://www.fiawec.com/ecm/live/WEC/__data.json?_=" + ticks, function(data, response){
      // parsed response body as js object
      var params = JSON.parse(data.params);
      var entries = JSON.parse(data.entries);
      var driverResult = JSON.parse(data.driversResult);
      //console.log(params);
      //console.log(entries);
      //console.log(driverResult);
      
      var track = {
        localTime: parseInt(params.timestamp),
        flag: getRaceState(params.racestate),
        raceState: params.racestate,
        safetyCar: (params.safetycar === "true"),
        qualify: null,
        elapsedTime: null,
        remainingTime: null,
        elapsedTimeInSeconds: params.elapsedTime,
        remainingTimeInSeconds: params.remaining,
        notification: null,
        logo: params.svg,
        eventName: params.eventName,
        weather: {
          airTemp: parseFloat(params.airTemp),
          roadTemp: parseFloat(params.trackTemp),
          humidity: parseFloat(params.humidity),
          airPreassure: parseFloat(params.pressure),
          windSpeed: parseFloat(params.windSpeed),
          windDirection: parseFloat(params.windDirection),
          weatherType: params.weather,
          weatherIcon: '',
          weatherIconUrl: ''
        },
        isDay: null
      };
      var cars = [];
      var carData = entries;

      var tmp = Object.keys(carData);
      for(var i = 0; i< tmp.length; i++) {
        var car = carData[tmp[i]];

        //var pilot = car[5] == '' ? null : staticData.tabPilotes[car[5]];
        //var extraData = getExtraData(car[2]);

        cars.push({
          pilot: {
            lastName: '',
            firstName: car.driver,
            country: '',
            birthday: '',
            picture: '',
            site: '',
            facebook: '',
            twitter: ''
          },
          driverStatus: getDriverState(car.state),
          laps: parseInt(car.lap),
          time: car.lastPassingTime,
          timeDifference: car.gap,
          bestTimeInMiliseconds: parseLapTime(car.bestlap),
          lastTimeInMiliseconds: parseLapTime(car.lastlap),
          pits: car.pitstop,
          averageSpeed: parseFloat(car.speed),
          tires: car.tyre,
          wec: car.isWEC,
          d1l1: car.d1l1,
          d1l2: car.d2l1,
          d2l1: null,
          d2l2: null,
          avg: car.av_time,
          team: car.team,
          number: car.number,
          category: car.category,
          carBrand: '',
          carName: car.car,
          position: car.position,
          ranking: car.ranking,
          categoryPosition: car.categoryPosition,
          sector: car.sector,
          currentSector1: car.currentSector1,
          currentSector2: car.currentSector2,
          currentSector3: car.currentSector3,
          bestSector1: car.bestSector1,
          bestSector2: car.bestSector2,
          bestSector3: car.bestSector3
        });
      }

      lastResponse = {
        track: track,
        cars: cars,
        fresh: true,
        ticks: ticks    
      };

      done(lastResponse);

  });
}

function parseTime(str) {
  var tokens = str.split(":");
  var hours = parseInt(tokens[0].replace(" ", ""));
  var min = parseInt(tokens[1].replace(" ", ""));
  var sec = parseInt(tokens[2].replace(" ", ""));

  return parseInt(sec + min*60 + hours*60*60);
}

function parseLapTime(str) {
  if(!str) {
    return 0;
  }

  var tokens1 = str.split(":");
  var min = parseInt(tokens1[0].replace(" ", ""));
  var sec = 0;
  var mil = 0;

  var tokens2 = tokens1[1].split(".");
  sec = parseInt(tokens2[0].replace(" ", ""));
  if(tokens2.length == 2) {
    mil = parseInt(tokens2[1].replace(" ", ""));
  }

  return parseInt(mil + sec*1000 + min*60*1000);
}

function getDriverState(status) {
  switch(status) {
      case "In":
        return 4;
        break;
      case "Out":
        return 3;
        break;
      case "Run":
        return 2;
          break;
      default:
        return 0;
        break;
  }
}

function getRaceState(state) {
  switch (state) {
      case "green":
        return 2;
      case "red":
        return 3;
      case "checked":
        return 4;
      case "yellow":
        return 5;
      case "full-yellow":
        return 6;
      default:
        return 0;
  }
}

module.exports = router;
