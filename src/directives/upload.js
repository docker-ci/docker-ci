var _ = require('lodash');
var domain = require('wires-domain');
var Promise = require('promise');

domain.service("directive.upload", function($scope, $log, Bash) {
   return function(dir) {
      var bash = new Bash("scp");

      var target = dir.requireOne("target").getValue();
      bash.add("-r", target);

      var server = dir.requireOne("to").getMap();
      bash.add(server[0] + ":" + server[1]);

      return bash.call({
         printOutput: true
      });
   };
});
