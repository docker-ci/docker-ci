var _ = require('lodash');
var domain = require('wires-domain');
var Promise = require('promise');

domain.service("$container", function(Bash) {
   return {
      isRunning: function(name) {
         //docker ps | grep mongo_node_test | awk '{print $1}'

         return new Promise(function(resolve, reject) {
            var bash = new Bash("docker");
            bash.add("ps");
            bash.call().then(function(lines) {

               var containerFound = false;
               _.each(lines, function(line) {
                  var expr = new RegExp("\\s" + name + "(\\s|$)", "img");
                  if (expr.exec(line)) {
                     return containerFound = true;
                  }
               });
               return resolve(containerFound);
            }).catch(function(e) {
               return reject(false);
            });
         });
      }
   };
});
