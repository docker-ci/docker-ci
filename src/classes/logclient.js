var _ = require('lodash');
var domain = require('wires-domain');
var Promise = require('promise')
var fs = require('fs');
var logger = require('log4js').getLogger('logclient')
var path = require('path')
domain.service("DockerLogClient", function($scope, WiresClient) {
   return function() {

      var currentDir = $scope.getArg("dir");
      var conf = {};
      conf.host = $scope.getArg('host', 'localhost:3335');
      conf.token = $scope.getArg('token', '1234');
      conf.container = $scope.getArg('container');

      // merging configuration
      var confFile = path.join(currentDir, 'logclient.conf');
      if (fs.existsSync(confFile)) {
         try {
            var data = JSON.parse(fs.readFileSync(confFile))
            if (_.isPlainObject(data)) {
               conf = _.merge(conf, data);
            }
         } catch(e){}
      }

      return WiresClient.send(conf.host, {
         command: "watch",
         token: conf.token,
         message: {
            container: conf.container
         },
         log: function(data) {
            if (data.status) {
               logger.info("Server says: " + data.status)
            } else {
               console.log(data.log)
            }
         }
      })
   }
})
