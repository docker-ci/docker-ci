var _ = require('lodash');
var domain = require('wires-domain');
var Promise = require('promise')

domain.service("directive.define", function($scope, $log) {

   return function(directive) {

      _.each(directive.properties, function(list, name) {
         var property = list[0];
         var value = property.getValue()
         var key = property.getKey();
         $log.info("Define %s as '%s'", key, value);
         $scope.setArg(key, value);
      })
   }
})
