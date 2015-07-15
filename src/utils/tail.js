var _ = require('lodash');
var domain = require('wires-domain');
var Promise = require('promise')
var fs = require('fs')
var logger = require('log4js').getLogger('logclient')


domain.service("$tail", function() {
   return function(f, cb, errorcb) {
      return new Promise(function(resolve, reject) {
         var startByte = 0;
         fs.stat(f, function(err, stats) {
            if (err) {
               return reject(err);
            }
            startByte = stats.size;
         });
         var watcher = fs.watchFile(f, { persistent: true, interval: 0 }, function(curr, prev) {
            fs.stat(f, function(err, stats) {
               if (err){
                  return errorcb({message : "You application has been re-deployed"});
               }
               fs.createReadStream(f, {
                  start: startByte,
                  end: stats.size
               }).addListener("data", function(lines) {
                  cb(lines.toString());
                  startByte = stats.size;
               });
            });
         });

         return resolve({
            unwatch : function(){
               logger.info("Unwatching");
               fs.unwatchFile(f);
            }
         })
      })
   }
})
