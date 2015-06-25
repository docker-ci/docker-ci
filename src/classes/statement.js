var _ = require('lodash');
var domain = require('wires-domain');
var Promise = require('promise')
var Class = require("wires-class")

domain.service("Statement", function($scope) {
   return Class.extend({
      initialize: function() {},
      isActive: function() {

         if (!this.condition)
            return true;

         if (this.condition[0] === "!") {
            var c = this.condition.slice(1, this.condition.length);
            return $scope.getArg(c) === undefined;
         } else {
            return $scope.getArg(this.condition) !== undefined ? true : false;
         }
      }
   })
})
