var _ = require('underscore');
var bolusCalculator = require('./bolusCalculator');
var options = {log:false};

var foodBolus = function() {
  var bc = bolusCalculator(options);
  var bolus = bc.bolus(100);
  var expected = 10;

  if(bc.iob() === bolus && bolus === expected) {
    return console.log('foodBolus pass');
  }

  console.log('foodBolus fail');
}();

var correctionBolus = function() {
  var bc = bolusCalculator(options);
  var bolus = bc.bolus(null, 7.5);
  var expected = 5.108695652173912;

  if(bc.iob() === bolus && bolus === expected) {
    return console.log('correctionBolus pass');
  }

  console.log('correctionBolus fail');
}();

var bolus = function() {
  var bc = bolusCalculator(options);
  var bolus = bc.bolus(100, 7.5);
  var expected = 10 + 5.108695652173912;

  if(bc.iob() === bolus && bolus === expected) {
    return console.log('bolus pass');
  }

  console.log('bolus fail');
}();

var iob = function() {
  options = _.defaults({insulinActionTime:1000}, options);

  var bc = bolusCalculator(options);
  var bolus = bc.bolus(100, 7.5);
  var expected = 10 + 5.108695652173912;
  var expectedHalflifeIob = 7.524130434782608;

  setTimeout(function() {
    if(bc.iob() === expectedHalflifeIob && bolus === expected) {
      return console.log('iob pass');
    }

    console.log('iob fail');

  }, 500);
}();

var iobBolus = function() {

};

var iobStack = function() {

};
