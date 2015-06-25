var _ = require('lodash');
var domain = require('wires-domain');
var Promise = require('promise')


var args = {};
domain.service("$scope", function() {

   return {
      setArg: function(k, v) {
         args[k] = v;
      },
      getArg: function(k, defaultValue) {
         return args[k] !== undefined ? args[k] : defaultValue;
      },
      getArgs: function() {
         return args;
      }
   }
})
