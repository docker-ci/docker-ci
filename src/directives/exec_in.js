var _ = require('lodash');
var domain = require('wires-domain');
var Promise = require('promise')


domain.service("directive.exec", function($scope, $log, Bash) {
   return function(dir) {
      var name = dir.requireOne("name").getValue()
      var cmd = dir.requireOne("cmd").getValue()
      var bash = new Bash("docker")
      bash.add("exec -t", name, cmd)
      return bash.call({
         printOutput: true
      })
   }
})
