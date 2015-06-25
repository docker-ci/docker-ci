var _ = require('lodash');
var domain = require('wires-domain');
var Promise = require('promise')

domain.service("directive.volume", function($scope, $log, Bash) {
   return function(dir) {
      var volumeName = dir.requireOne("name").getValue()
      $log.info("Creating volume '%s'", volumeName);

      var bash = new Bash("docker")
      bash.add("run")

      _.each(dir.getAll('mount'), function(item) {
         var map = item.getMap();
         bash.add("-v", map[0] + ":" + map[1]);
      })

      bash.add('--name', volumeName, "busybox", "true");

      return bash.call({
         printOutput: true
      })
   }
})
