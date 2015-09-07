var _ = require('lodash');
var domain = require('wires-domain');
var Promise = require('promise');
domain.service("$mkdir", function(Bash) {
   return function(path) {
      if (!path) {
         throw {
            status: 400,
            message: "Path should be provided"
         };
      }
      var bash = new Bash("mkdir");
      bash.add("-p", path);
      return bash.call({
         printOutput: true
      });
   };
});

domain.service("directive.mkdir", function($scope, $mkdir) {
   return function(dir) {
      return $mkdir(dir.getValue());
   };
});
