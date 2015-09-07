var _ = require('lodash');
var domain = require('wires-domain');
var Promise = require('promise');

domain.service("directive.untar", function($scope, $log, $mkdir, Bash) {
   return function(dir) {
      var folder = dir.requireOne("folder").getValue();
      var target = dir.requireOne("target").getValue();
      var bash = new Bash("tar");
      //tar -C DIRECTORY -xvf file.tar
      bash.add("-C", folder);
      bash.add("-xvf", target);

      return $mkdir(folder).then(function() {
         return bash.call({
            printOutput: true
         });
      });

   };
});
