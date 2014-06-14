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
      var cars = [];
      for(var i = 1; i< uglyData.length; i++) {
        cars.push(uglyData[i]);
      }

      res.json({
        track: globalData,
        cars: cars
      })

  });

});

module.exports = router;
