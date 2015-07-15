var _ = require('lodash');
var domain = require('wires-domain');
var Promise = require('promise')
var server = require('wires-server')
var logger = require('log4js').getLogger('logserver')

var walk = require('walk')
var fs = require("fs");
var path = require('path');

var containerFolder;
domain.service("DockerLogServer", function($scope) {
   return function() {
      var port = $scope.getArg('port', 3335);
      var token = $scope.getArg('token', '1234');
      containerFolder = $scope.getArg('folder', '/var/lib/docker/containers');

      logger.info("Initiating log server")
      logger.info("port: " + port)
      logger.info("token: " + token)
      logger.info("containers folder: " + containerFolder)
      logger.info("-----------------")


      server(3335, "1234", "logserver");
   }
})
domain.service("$jsonifyInput", function() {
   return function(data){
      return new Promise(function(resolve, reject){
         var strLines = data.toString();
         var lines = strLines.split(/\r?\n/);
         var validList = [];
         _.each(lines, function(line) {
            try {
               validList.push(JSON.parse(line));
            } catch (e) {
            }
         });
         return resolve(validList)
      })
   }
});

// Getting recent logs from a file
domain.service("$recentLogs", function($jsonifyInput) {
   return function(file, bytesSlice) {
      return new Promise(function(resolve, reject) {
         var startByte = 0;

         fs.stat(file, function(err, stats) {
            if (err){
               return reject(err);
            }
            if (stats.size > bytesSlice) {
               startByte = stats.size - bytesSlice;
            }
            fs.createReadStream(file, {
               start: startByte,
               end: stats.size
            }).addListener("data", function(data) {

               $jsonifyInput(data).then(function(json){
                  return resolve(json)
               }).catch(reject);
            });
         });
      })
   }
})

//docker-ci log-server --folder '/Users/nc/work/docker-ci/docker-ci/test-containers'
domain.service("logserver.watch", function($recentLogs,$jsonifyInput, $tail) {
   return function(message, api) {
      var watcher;
      var connected = true;
      var targetFile;
      api.onDisconnect = function() {
         logger.info("Client disconnected")
         connected = false;
         if (watcher) {
            logger.info("Stopped watching for " + targetFile)
            watcher.unwatch();
         }
      }
      if (!connected)
         return;

      var message = message || {};
      var targetContainer = message.container;

      return new Promise(function(resolve, reject) {
         walker = walk.walk(containerFolder, {});
         var apps = {};
         walker.on("file", function(root, fileStats, next) {
            // Grab Available containers and log path's

            try {
               if (fileStats.name === "config.json") {
                  var fullPath = path.join(root, fileStats.name)
                  var json = JSON.parse(fs.readFileSync(fullPath))
                  var containerName = json["Name"].split('/').join('');
                  var containerLogFile = json["LogPath"];
                  if (containerLogFile[0] !== "/") {
                     containerLogFile = path.join(root, containerLogFile)
                  }
                  apps[containerName] = containerLogFile;
               }
               next();
            } catch (e) {
               return reject(e)
            }
         });
         walker.on("errors", function(e) {
            return reject({
               status: 500,
               message: "Error"
            })
         })
         walker.on("end", function() {
            if ( !targetContainer){
               return resolve('Available Containers:\n  ' + _.keys(apps).join('\n  '))
            }
            if (!apps[targetContainer]) {
               return reject({
                  status: 400,
                  message: targetContainer + " was not found or not running"
               })
            }
            api.log({
               status: "Getting the latest 5kb from " + targetContainer,
            })
            // Get the recent 5kb of logs from a file
            $recentLogs(apps[targetContainer], 5000).then(function(logs){
               _.each(logs, function(item){
                  api.log({
                     log: item.log || item,
                     time: item.time || new Date()
                  })
               })
               targetFile = apps[targetContainer]
               $tail(apps[targetContainer], function(data){
                  // After we get binary data
                  // We need to to convert it into json array
                  $jsonifyInput(data).then(function(list){
                     // Sending each line to the client
                     _.each(list, function(item){
                        api.log({
                           log: item.log || item,
                           time: item.time || new Date()
                        })
                     });
                  }).catch(reject);
               },
               // error handler (file has been removed)
               function(msg){
                  return reject(msg)
               }).then(function(_watcher){
                  // Storing the watcher to stop watching
                  watcher = _watcher;
               }).catch(reject)
            }).catch(reject)
         })
      })
   }
})
