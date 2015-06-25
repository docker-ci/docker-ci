var _ = require('lodash');
var domain = require('wires-domain');
var Promise = require('promise')

domain.service("directive.kill", function($scope, $log, Bash) {
   return function(dir) {
      var name = dir.value;
      if (!name) {
         return $error("Name is required (@kill mycontainername)")
      }

      var bash = new Bash("docker");
      bash.add("kill", name);
      return bash.call();
   }
});
