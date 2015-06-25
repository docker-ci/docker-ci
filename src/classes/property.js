var _ = require('lodash');
var domain = require('wires-domain');
var Promise = require('promise')
var Class = require('wires-class');

var execAll = require('regexp.execall');

// Main directive class
// Everything that starts with @
domain.service("Property", function(Statement, $scope, $error) {
   return Statement.extend({
      initialize: function(key, value, condition) {
         this._key = key;
         this._value = value;
         this.condition = condition;
      },
      getKey: function() {
         return this._key;
      },
      getMap: function() {
         if (!this._value) {
            return $error("Incorrent value in %s ", this._key);
         }
         var value = this.getValue();

         var s = value.match(/(\S+)\s*->\s*([\'"](.*)[\'"]$|(\S+))/im)
         if (!s) {
            return $error("Expecting a map ( key -> value ) in %s, got '%s'", this._key, value);
         }
         var k = s[1]
         var v = s[3]
         if (!v) {
            v = s[2]
         }
         return [k, v]
      },
      getValue: function() {
         var args = $scope.getArgs();
         var value = this._value;

         var data = execAll(/\$\{([^\}]+)/ig, value);
         _.each(data, function(item) {
            var r = item[0] + "}"
            var v = item[1];
            var s = v.split("|");
            var variable = s[0];
            var defaultValue;
            if (s.length === 2) {
               defaultValue = s[1];
            }
            var target;
            if ((target = $scope.getArg(variable))) {
               value = value.split(r).join(target);
            } else {
               if (defaultValue) {
                  value = value.split(r).join(defaultValue);
               }
            }
         });
         return value;
      }

   })
})
