var _ = require('lodash');
var domain = require('wires-domain');
var Promise = require('promise')
var Class = require("wires-class");
var procstreams = require('procstreams');
var Stream = require('stream').Stream

domain.service("Bash", function($log) {
   return Class.extend({
      initialize: function(cmd) {
         this.cmd = cmd ? [cmd] : [];
      },
      add: function() {
         _.each(arguments, function(arg) {
            this.cmd.push(arg);
         }, this)
      },
      call: function(opts) {
         var opts = opts || {};
         var onStream = opts.onStream
         var onError = opts.onError;
         var pipes = opts.pipes || [];
         var ignoreErrors = opts.ignoreErrors;
         var printOutput = opts.printOutput;
         var self = this;
         return new Promise(function(resolve, reject) {
            var stream = new Stream()
            stream.writable = true
            stream.read = onStream
            stream.write = function(a) {
               if (printOutput) {
                  $log.bash("   %s", a.toString().trim())
               }
               onStream ? onStream(a.toString()) : null;
            }
            stream.end = function() {}


            var errStream = new Stream()
            errStream.writable = true
            errStream.write = function(a) {
               onError ? onError(a.toString()) : null;
            }
            errStream.end = function() {}
            var fullcmd = self.cmd.join(' ');

            $log.bash(fullcmd)
            var proc = procstreams(fullcmd).data(function(err, stdout, stderr) {
               if (err) {
                  if (ignoreErrors) {
                     return resolve();
                  }
                  return reject({
                     err: err,
                     out: (stderr ? stderr.toString() : undefined)
                  });
               }
               return resolve(stdout ? stdout.toString().split("\n") : undefined)
            })
            _.each(pipes, function(item) {
               proc = proc.pipe(item)
            })
            proc.pipe(stream, {
               stderr: errStream
            })
         });
      }
   })
})
