var _ = require('lodash');
var domain = require('wires-domain');
var Promise = require('promise')
var Class = require('wires-class');
var lineReader = require('line-reader');



domain.service("Parser", function($scope, Directive, Property) {

   return Class.extend({
      initialize: function(fname) {
         this.fname = fname;
         this.directives = [];
      },
      onLine: function(line) {

         var d = line.match(/^^@([^\s]+)(\s*)(\[if\s*([^\]]+)\])?(\s*)?(.*)/im);
         if (d) {
            this.directives.push(new Directive(d[1], d[6], d[4]))
         } else {
            if (this.directives.length > 0) {
               var directive = this.directives[this.directives.length - 1];
               var m = line.match(/^\s*([^\s]+)\s*(\[if\s*([^\]]+)\])?\s*:\s*(.*)/im);
               if (m) {
                  directive.addProperty(m[1], new Property(m[1], m[4], m[3]));
               }
            }
         }
      },
      parse: function(cb) {
         var self = this;
         return new Promise(function(resolve, reject) {
            lineReader.eachLine(self.fname, function(line, last) {
               try {
                  self.onLine(line)
               } catch (e) {
                  return reject(e);
               }
               if (last) {
                  return resolve(self.directives);
               }
            })
         })

      }
   })

});
