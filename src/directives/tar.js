var _ = require('lodash');
var domain = require('wires-domain');
var Promise = require('promise');

domain.service("directive.tar", function($scope, $log, Bash) {
   return function(dir) {
      var folder = dir.requireOne("folder").getValue();
      var target = dir.requireOne("target").getValue();
      var bash = new Bash("tar");
      bash.add("-zcvf", target, "-C", folder, ".");
      return bash.call({
         printOutput: true
      });
   };
});
