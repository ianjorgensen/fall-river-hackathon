var _ = require('underscore');
var sys = require('sys');
var exec = require('child_process').exec;
/*
add storing and reading to file make as command line
*/
module.exports = function(options) {
  options = _.defaults(options || {}, {
    ic: 10,
    isf: 2.3,
    target: 5.5,
    insulinActionTime: 4 * 60 * 60 * 1000,
    pumpStepSize: 0.025
  });

  var boluses = options.boluses || [];

  var calculator = {
      bolus: function(carbs, bg, iob) {
        var bolusFood = carbs/options.ic;
        var bolusCorrection = bg ? ((bg - options.target)/options.isf)  - iob : 0;
        var bolus = bolusFood + bolusCorrection;

        if (bolus < 0) {
          bolus = 0;
        }

        // convert to pump increments
        var increments = Math.round(bolus/options.pumpStepSize);

        bolus = increments * options.pumpStepSize;

        if (options.log) {
          console.log('food bolus:', bolusFood);
          console.log('correction bolus:', bolusCorrection);
          console.log('bolus:', bolus.toFixed(3));
        }

        return bolus;
      },
      iob: function(bolus) {
        var timePast = Date.now() - bolus.time;

        if (timePast > options.insulinActionTime) {
          return 0;
        }

        var timeRatio = options.insulinActionTime/(options.insulinActionTime-timePast);
        //console.log('calculator iob', options.insulinActionTime, timePast, timeRatio);

        return bolus.value / timeRatio;
      }
  };

  var iob = function() {
    var iob = 0;

    for (var i in boluses) {
        iob = iob + calculator.iob(boluses[i]);
    }

    return iob;
  };

  var bolus = function(carbs, bg) {
    var bolus = calculator.bolus(carbs, bg, iob());

    boluses.push({
      value: bolus,
      time: Date.now()
    });

    console.log('Sending bolus');

    /*path sudo ./../../decoding-carelink/bin/mm-bolus.py --serial 913995 --port /dev/ttyUSB0 --554 0.2 */
    exec("sudo ./../../decoding-carelink/bin/mm-bolus.py --serial 913995 --port /dev/ttyUSB0 --554 " + bolus, function(error, stdout, stderr) {
      console.log(error, stdout, stderr);
    });

    return bolus;
  };

  return {
    boluses: function() {
      return boluses;
    },
    bolus: bolus,
    iob: iob
  };
};
