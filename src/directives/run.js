var _ = require('lodash');
var domain = require('wires-domain');
var Promise = require('promise')
var fs = require("fs");

/*

def launchContainer(name,
		mount = None,
		link = None,
		ports = None,
		daemon = None,
		image = None,
		env = [],
		volumesFrom = None,
		command = None
	):
	bash = Bash( "docker" )
	bash.add("run")

	if link != None:
		for l in link:
			bash.add('--link')
			bash.add("%s:%s" % (l[0], l[1]) )

	if volumesFrom:
		bash.add("--volumes-from")
		bash.add(volumesFrom)


	bash.add("--name")
	bash.add(name)

	if mount != None:
		for mnt in mount:
			bash.add('-v')
			bash.add("%s:%s" % (mnt[0], mnt[1]) )

	if ports != None:
		for p in ports:
			bash.add("-p")
			bash.add("%s:%s" % (p[0], p[1]) )

	for envName, envValue in env.iteritems():
		bash.add("--env");
		bash.add("%s=%s" % (envName,envValue) );
	printOutput = True
	if daemon != None and daemon == True:
		printOutput = False
		bash.add("-d")
	if image != None:
		bash.add(image);
	else:
		bash.add(name);

	if command:
		bash.add(command)
*/

var logsAwaiting = function(containerName, regexp) {
   return new Promise(function(resolve, reject) {
      domain.require(function(Bash, $log) {

         var poll = function() {
            var bash = new Bash("docker");
            bash.add("logs", containerName);
            $log.detail("Trying to match %s in '%s' logs ", regexp, containerName)
            bash.call().then(function(logs) {
               var found = false;
               _.each(logs, function(line) {
                  if (regexp.exec(line)) {
                     found = line;
                  }
               })
               if (found) {
                  $log.detail("Got it %s", found.trim())
                  return resolve();
               } else {
                  poll();
               }
            }).catch(function(msg) {
               return reject(msg)
            })
         }
         poll();
      })
   })
}

domain.service("directive.run", function(Bash, $log, $container) {
   return function(dir) {
      var name = dir.requireOne("name").getValue();
      var image = dir.getFirst("image").getValue();

      var daemon = dir.getFirst("daemon", "true").getValue() === "true";

      $log.bash("Checking status of '%s'", name)
      return $container.isRunning(name).then(function(isRunning) {
         if (isRunning) {
            return $log.bash("Container '%s' is already running", name)
         }
         $log.bash("Launching '%s'", name)
         var bash = new Bash("docker")
         bash.add("run")

         // Links
         _.each(dir.getAll('link'), function(item) {
            var map = item.getMap();
            bash.add('--link')
            bash.add(map[0] + ":" + map[1]);
         })

         // volumes
         var volume = dir.getFirst("volume")

         if (volume) {
            bash.add("--volumes-from")
            bash.add(volume.getValue());
         }
         // name
         bash.add('--name', name);

         // mount
         _.each(dir.getAll('mount'), function(item) {
            var map = item.getMap();
            bash.add("-v", map[0] + ":" + map[1]);
         })

         // ports
         _.each(dir.getAll('ports'), function(item) {
            var map = item.getMap();
            bash.add("-p", map[0] + ":" + map[1]);
         })

         // environ
         var envFile = dir.getFirst("env-file")
         var envs = [];
         if (envFile) {
            var filepath = envFile.getValue();
            $log.highlight("Reading %s", filepath)
            if (!fs.existsSync(filepath)) {
               throw {
                  message: "No such file: " + filepath
               }
            }

            var filedata = fs.readFileSync(filepath).toString()
            var lines = filedata.split(/\r?\n/);
            _.each(lines, function(line) {
               var matched = line.match(/([\S]+)\s*=\s*(.*)$/im);
               if (matched) {
                  var key = matched[1];
                  var value = matched[2]
                  envs.push({
                     key: key,
                     value: value
                  })
                  $log.setting("\t%s : %s", key, value)
               }
            });
         }

         // hardcoded envs
         _.each(dir.getAll('env'), function(item) {
            var map = item.getMap();
            envs.push({
               key: map[0],
               value: map[1]
            })
         })

         _.each(envs, function(item) {
            bash.add("--env", item.key + "=" + item.value);
         })

         if (daemon) {
            bash.add("-d");
         }
         if (image) {
            bash.add(image)
         } else {
            bash.add(name)
         }

         var cmd = dir.getFirst("cmd");
         if (cmd) {
            bash.add(cmd.getValue());
         }

         // checking for wait directive
         var waitDescriptor = dir.getFirst("wait");

         return new Promise(function(resolve, reject) {
            return bash.call({
               printOutput: daemon === false
            }).then(function() {

               if (waitDescriptor) {
                  var waitMap = waitDescriptor.getMap();
                  if (waitMap) {
                     var what = waitMap[0]
                        // Logs to match
                     if (what === "logs_match") {
                        var regexp = new RegExp(waitMap[1]);
                        return logsAwaiting(name, regexp)
                     }
                  }
               }

            }).then(function() {
               return resolve();
            }).catch(reject)
         })

      });
   }
})
