var _ = require('lodash');
var domain = require('wires-domain');
var Promise = require('promise')
var countdown = require("countdown");

domain.service("DockerCi", function($waterfall, $scope, $log, Parser) {
   return {
      init: function() {
         var startTime = new Date();
         var argv = require('argh').argv;
         // Extracting arguments
         var command;
         var variables = {};
         _.each(argv, function(value, key) {
            if (key === "argv") {
               command = value;
            } else {
               $scope.setArg(key, value)
            }
         })


         var targetFile = $scope.getArg("file", "Docker.ci")

         // Setting it back in case of reusing
         $scope.setArg("file", targetFile)

         //         $log.important("Parsing file '%s'", targetFile)
         var parser = new Parser(targetFile);

         // Parsing and launching the waterfall
         parser.parse().then($waterfall).then(function() {
            $log.important("Success in %s", countdown(startTime, null, countdown.SECONDS |
                  countdown.MILLISECONDS)
               .toString())
         }).catch(function(msg) {
            var message = msg;
            if (msg) {
               if (msg.message) {
                  message = msg.message;
               }
               if (msg.out) {
                  message = msg.out
               }
            }
            $log.error("FAIL: %s", message);
         })
      }
   }
})
