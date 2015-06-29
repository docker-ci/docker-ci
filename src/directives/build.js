var _ = require('lodash');
var domain = require('wires-domain');
var Promise = require('promise')


domain.service("directive.build", function(Bash) {
   return function(dir) {
      var tag = dir.requireOne("tag").getValue()
      var path = dir.getFirst("path", ".").getValue();

      var cache = dir.getFirst("cache", "true").getValue() === "true"

      var buider = new Bash("docker");
      buider.add("build")
      if (!cache) {
         buider.add("--no-cache=true")
      }

      buider.add("-t", tag, path);

      return buider.call({
         printOutput: true
      });
   }
})
