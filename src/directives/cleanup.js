var _ = require('lodash');
var domain = require('wires-domain');
var Promise = require('promise')


domain.service("directive.cleanup", function($scope, $log, Bash) {
   return function(directive) {
      return new Promise(function(resolve, reject) {
         $log.info("Removing stopped containers")

         // Executing
         var bash = new Bash("docker ps -a -q");
         bash.call().then(function(lines) {
            return domain.each(lines, function(containerId) {
               // Each line represents container id
               if (containerId) {
                  return new Promise(function(done, fail) {
                     var killer = new Bash("docker");
                     killer.add("rm", containerId);
                     killer.call().then(function() {
                        $log.detail("%s (%s)", containerId, "removed");
                        return done();
                     }).catch(function() {
                        $log.detail("%s (%s)", containerId, "is running")
                        return done();
                     });
                  })
               }
            })
         }).then(resolve).catch(reject);
      })
   }
});
