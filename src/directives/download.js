var _ = require('lodash');
var domain = require('wires-domain');
var Promise = require('promise');

domain.service("directive.download", function($scope, $log, $mkdir, Bash) {
   return function(dir) {
      var bash = new Bash("scp");

      var server = dir.requireOne("from").getMap();
      bash.add("-r", server[0] + ":" + server[1]);

      var localDir = dir.requireOne("to").getValue();
      bash.add(localDir);

      if (localDir[localDir.length - 1] === "/") {
         return $mkdir(localDir).then(function() {
            return bash.call({
               printOutput: true
            });
         });
      } else {
         return bash.call({
            printOutput: true
         });
      }
   };
});
