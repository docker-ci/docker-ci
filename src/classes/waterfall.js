var _ = require('lodash');
var domain = require('wires-domain');
var Promise = require('promise')

domain.service("$waterfall", function($scope, $log) {
   return function(directives) {

      return new Promise(function(resolve, reject) {

         domain.each(directives, function(directive) {
            var serviceName = "directive." + directive.name;

            // require service and execute
            if (domain.isServiceRegistered(serviceName)) {

               if (directive.isActive()) {
                  $log.action("@%s", directive.name)
                  return domain.require(serviceName, function(service) {
                     return service(directive);
                  })
               }
            }
         }).then(resolve).catch(reject);

      })
   }
})
