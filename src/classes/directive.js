var _ = require('lodash');
var domain = require('wires-domain');
var Promise = require('promise')
var Class = require('wires-class');


// Main directive class
// Everything that starts with @
domain.service("Directive", function(Statement, Property, $error, $scope) {
   return Statement.extend({
      initialize: function(key, value, condition) {
         this.name = key;
         this.value = value;
         this.condition = condition;

         this.properties = {};
      },
      getValue: function() {
         if (!this.value)
            return;
         return new Property("value", this.value).getValue();
      },
      requireAll: function(property) {
         if (!this.properties[property]) {
            return $error("'%s' is required by @%s", property, this.name)
         }
         return this.getAll(property);
      },
      requireOne: function(property) {
         var list = this.requireAll(property);

         return list[0]
      },
      getFirst: function(property, defaultValue) {
         var list = this.getAll(property);
         if (list.length > 0) {
            return list[0]
         }
         if (defaultValue) {
            return new Property(property, defaultValue);
         }
      },
      getAll: function(property) {
         if (this.properties[property]) {
            var list = this.properties[property]
            var data = [];
            _.each(list, function(pr) {
               if (pr.isActive()) {
                  data.push(pr);
               }
            })
            return data;
         }
         return [];
      },
      addProperty: function(key, property) {
         if (!this.properties[key]) {
            this.properties[key] = [];
         }
         this.properties[key].push(property);
      }
   })
})
