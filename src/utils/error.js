var _ = require('lodash');
var domain = require('wires-domain');
var Promise = require('promise')
var sliced = require("sliced");
var vsprintf = require('sprintf').vsprintf;

domain.service("$error", function() {
   return function(message) {
      throw {
         message: vsprintf(message || "An error occured", sliced(arguments, 1))
      }
   }
})
