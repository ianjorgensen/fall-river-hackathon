var request = require('request');
var last;
var _ = require('underscore');
var bolusCalculator = require('./bolusCalculator');
var express = require('express');
var app = express();


var bc = bolusCalculator({
  ic: 11,
  isf: 40,
  target: 100,
  insulinActionTime: 2.5 * 60 * 60 * 1000,
  log:true
});

var getData = function(cb) {
  request('http://ba-cgm.azurewebsites.net/api/v1/entries/current.json', function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var data = JSON.parse(body);

      cb(null, data[0]);
    }

    return cb(error);
  });
};

setInterval(function() {
  getData(function(err, data) {
    if ((last && data && last.date != data.date) || !last && data) {
      console.log('Continous Correction Bolus');
      console.log('Reading: ', data.sgv + 'mg/dl');
      bc.bolus(null, data.sgv).toFixed(3);
      console.log('iob: ', bc.iob().toFixed(3));
      console.log('');
    }

    if (data) {
      last = data;
    }
  });
}, 300);

app.get('/carb/:value', function(request, response){
  var carbs = request.params.value;

  console.log('Carb Event: ', carbs);
  var bolus = bc.bolus(carbs).toFixed(1);
  var iob = bc.iob().toFixed(1);
  console.log('iob: ', iob);
  console.log('');

  response.send('carbs: ' + carbs +' bolus: ' + bolus + ' iob' + iob + 'boluses:' + JSON.stringify(bc.boluses()));
});

app.get('/iob', function(request, response){
  var iob = bc.iob().toFixed(3);

  console.log('Log iob');
  console.log('iob: ', iob);
  console.log('');

  response.send(' iob' + iob + 'boluses:' + JSON.stringify(bc.boluses()));
});

app.listen(3000);
