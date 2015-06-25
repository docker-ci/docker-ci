var _ = require('lodash');
var domain = require('wires-domain');
var Promise = require('promise')


domain.service("directive.build", function(Bash) {
   return function(dir) {
      var tag = dir.requireOne("tag").getValue()
      var path = dir.getFirst("path", ".").getValue();

      var cache = dir.getFirst("cache", "true").getValue() === "true"

      var buider = new Bash("docker");
      buider.add("build", "-t", tag, path)
      if (!cache) {
         bash.add("--no-cache=true")
      }

      return buider.call({
         printOutput: true
      });
   }
})
