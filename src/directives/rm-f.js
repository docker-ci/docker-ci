var _ = require('lodash');
var domain = require('wires-domain');
var Promise = require('promise')



domain.service("$removeContainer", function($error, $log, Bash) {
   return function(dir, force) {
      var name = dir.getValue();
      if (!name) {
         return $error("Name is required (@rm%s mycontainername)", (force ? "-f" : ''))
      }

      return new Promise(function(resolve, reject) {
         var bash = new Bash("docker");
         bash.add("rm");
         if (force) {
            bash.add('-f')
         }
         bash.add(name);

         return bash.call().then(function() {
            $log.bash("Container '%s' was removed", name);
            return resolve();
         }).catch(function() {
            $log.bash("Container '%s' is not running", name)
            return resolve();
         });
      })
   }
})
domain.service("directive.rm-f", function($removeContainer) {
   return function(dir) {
      return $removeContainer(dir, true);
   }
});

domain.service("directive.rm", function($removeContainer) {
   return function(dir) {
      return $removeContainer(dir, true);
   }
})
