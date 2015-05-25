In essence docker-ci or Docker Continuous integration is just a set of bash commands, that are ran and processed. 

After you have installed your environment, and checked https://github.com/wiresjs/docker-ci/tree/master/examples
examples, i believe we can get to business right away.

```python
@cleanup
@rm-f mymongo
@run
	name	: mymongo
	image   : mongo:2.6.9
	cmd     : mongod --smallfiles
	wait    : logs_match -> '.*waiting for connections on port 27017.*'
```

Self explanatory, right? 

Cleaning up dead containers, force removing running container with name "mymongo" and finally launching mongo (version 2.6.9).
Also we want to be sure it's up and running, so we check for logs. 
If you machine is slow (you are running somewhere in cloud using micro instance) that becomes very handy. 

You instructions are always self-explanatory. Docker-ci does not do any magic. Let's run and see what we get!
```
docker-ci run

# Launching
# Cleaning up
# Remove all stopped containers
  docker ps -a -q
  docker rm 0ecc4936f863
  docker rm fd1d082ec94e
  docker rm 392304b72d2a
  docker rm 5ffc1b5ddea6
  docker rm 3cc6289c8cd6
# Removing container with name 'mymongo'
  docker ps -a
  'mymongo' is not running
# Checking status of 'mymongo' container 
  docker ps -a
  Container mymongo is not running
# Launching mymongo from mongo:2.6.9 
  docker run --name mymongo -d mongo:2.6.9 mongod --smallfiles
  docker ps -a
  Waiting for logs (mymongo) to match '.*waiting for connections on port 27017.*'
  docker logs 3fa78f4b0652
  Match found
     -> 2015-05-17T18:55:30.931+0000 [initandlisten] waiting for connections on port 27017
  docker ps -a
```

If you don't want to restart your mongo container each time you run the script - just remove @rm-f directive. 
Container won't be killed nor restarted. (Unless you want it).
Docker-ci looks up for running containers and checks their health. 

Simply put, @run directive launches container only after checking it's health. Container is not running - fire it up! Although, you might encounter an error, if container's name is taken. No worries, you can soft remove is using @rm directive.


And certainly we want to build our application. (Check examples/mongo_node)

```python
@build
	tag   :  mongo_node_test
	path  : ./.
```

This is probably the simpliest of all commands. 

It's time to run this image!

```python
@rm-f mongo_node_test
@run 
	image	: mongo_node_test
	name	: mongo_node_test
	cmd	: node app.js
	link	: mymongo -> mongo
	ports	: 80 -> 3000
	daemon	: true
```

First thing we need to do is to remove existing one. Unless we want to keep it running, of course. 
Linking mongo container, forwarding ports and finally!

```bash
# Launching
# Cleaning up
# Remove all stopped containers
  docker ps -a -q
  docker rm 0319abd26768
  docker rm 44f68911d95f
# Removing container with name 'mymongo'
  docker ps -a
  'mymongo' is not running
# Checking status of 'mymongo' container 
  docker ps -a
  Container mymongo is not running
# Launching mymongo from mongo:2.6.9 
  docker run --name mymongo -d mongo:2.6.9 mongod --smallfiles
  docker ps -a
  Waiting for logs (mymongo) to match '.*waiting for connections on port 27017.*'
  docker logs 6d54c6b69e6b
  Match found
     -> 2015-05-17T19:43:01.075+0000 [initandlisten] waiting for connections on port 27017
  docker ps -a
# Build image mongo_node_test on path ./. 
  docker build -t mongo_node_test ./.
Sending build context to Docker daemon 1.255 MB kB
   Sending build context to Docker daemon
   Step 0 : FROM readytalk/nodejs
   ---> 1f7fb16e3480
   Step 1 : WORKDIR /app
   ---> Using cache
   ---> a1718d43ea2e
   Step 2 : COPY ./src/ ./
   ---> Using cache
   ---> 9b4964469dcc
   Step 3 : RUN npm install
   ---> Using cache
   ---> ac49d5e42d0d
   Step 4 : EXPOSE 3000
   ---> Using cache
   ---> 218894b3bb73
   Successfully built 218894b3bb73
# Removing container with name 'mongo_node_test'
  docker ps -a
  'mongo_node_test' is not running
# Checking status of 'mongo_node_test' container 
  docker ps -a
  Container mongo_node_test is not running
# Launching mongo_node_test from mongo_node_test 
  docker run --link mymongo:mongo --name mongo_node_test -p 80:3000 -d mongo_node_test node app.js
```

Docker-ci always prints commands it executes. 


