var express = require('express');
var router = express.Router();
var Client = require('node-rest-client').Client;

/* GET home page. */
router.get('/', function(req, res) {
  

  client = new Client();

  // direct way
  client.get("http://live.fiawec.com/proxy.php?file=1/live/data.js", function(data, response){
      // parsed response body as js object
      res.json(JSON.parse(data));
  });
});

module.exports = router;
