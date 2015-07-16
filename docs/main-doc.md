# Docker-ci documentation

## Installation and requirements (NODEJS)

You need to have the latest nodejs version installed.  

```bash
npm install -g docker-ci
```

Please, note, that the first version of docker-ci is written in python. Consider updating as soon as possible.
Nodejs version is a stable and maintanable release. Contribution is greatly appreciated. 

## Arguments

Let's say we are running a scipt.

```bash
docker-ci run --env=production
```

We passed an argument "env" that can be used within an instruction file.

```python
${dir}/env/${env|test}
```

In this case, ${dir} will be replaced with current directory, and ${env|test} with production.

If "env" was is not defined - you can always set a fallback value, that will be tranformed into following beautiful string:

```python
# ${dir}/env/${env|test} going to be:
Users/user/project/env/test
```

## Working directory

Working directory has a macro called ${dir}. No need to specify a default value - it has it already - it's where your instruction file is located. It can be overriden, if you want:

```bash
docker-ci run --dir=/home/user/project
```

## Removing stopped containers

```python
@cleanup
```
For starters, you always want to clean up stopped containers, they are pretty much useless, and take space.
A very convinient directive does it for you.

The output should look something like this

```bash
# Launching
# Cleaning up
# Remove all stopped containers
  docker ps -a -q
  docker rm c903bb62090f
  docker rm 392304b72d2a
  docker rm 5ffc1b5ddea6
  docker rm 3cc6289c8cd6
```

## Define

Define your dynamic variables for convinience naming

```python
@define
   foo : ${name|test}_my_project
```

You can use them anywhere. Set a fallback value if you need one.

```python
@build
   name : ${foo|my_name}
```


## Building

Probably the simpliest directive here

```python
@build
	tag 	: testapp
	path 	: .
	cache 	: true
```

Cache is true by default. Most likely you want to keep it that way

## Volumes

Volume container is just a convinience container. It uses [busy box image](https://registry.hub.docker.com/_/busybox/)

It downloads it from registry mounts up host directories, and we are ready to go!

```python
@volume
	name 	: shared
	mount 	: ${dir}/src/public						-> /data/public
	mount   : ${dir}/shared/nginx/sites-enabled 	-> /etc/nginx/conf.d
	mount   : ${dir}/shared/nginx/logs 				-> /var/log/nginx
```

You don't need to bother about absolute paths that docker required. That's the true beauty.


## Running containers

To be noted: If your container is already running, or it's just stopped - script is not going to do anything. It'll just tell you - Hey, this container is already running, probably i should not touch it.

Use @kill or @rm or @rm-f directives beforehand. (Described below) 

Example: 

```python
@run
	image 	: mongo
	name  	: mymongo
	cmd	    : mongod
	wait  	: logs_match -> '.*waiting for connections on port 27017.*'
```
Image and name are self-explanatory and required. Let's go throught all possible options.

### cmd


It is a command. Yes sherlock, you need to execute "grunt test"? This is the right place! small files for mongo?
It's all here

```python
cmd	: mongod --smallfiles
```

### wait


You may notice on slow machines - mongo container requires about a minute to get started. On a better machine you will probably get it right away. But just to be sure, docker-ci can read logs and match each line on container's start. It will poll the logs and procceed when match is found.

```python
wait  	: logs_match -> '.*waiting for connections on port 27017.*'
```
### env

YOu can set an environment variable right in place

```python
env  	: foo -> bar
```


### env-file

Loads enviroments from a specific file.

```python
env-file 	: ${dir}/env/${env|test}
```

You will see the environment printed out in your console.

```bash
# Reading env file /Users/user/docker-ci/examples/nginx_mongo_node/env/test
  env: 'NODE_ENV' -> 'test'
```

If you have a bunch of enviroments that you project requires - this descriptor will probably make your life way much easier. Scale it up, and you have dev production and staging environment all set!

Define your variables in a file like so:
```
MY_ENV          = production
SOME_OTHER_ENV  = 'long string with spaces'
JUST_A_NUMBER   = 10
```


### link


Following syntax is self-explanatory


```python
link   		: mymongo -> mongo
link   		: redis -> redis
```

    
### daemon

It's either true or false. It's nice to be Caption Obvious for a breif moment.

```python
daemon  	: true
```

If set to "false" docker-ci will print the output.

### volume

Mounts previously described volume

```python
volume 		: shared
```

### Mount

Mounts a directory. 

```python
	mount   : ${dir}/shared/nginx/logs 				-> /var/log/nginx
```
Don't overuse it. The official docker documentation does not recommend spoiling your containers up with alien directories. Use @volume. Of course, no one is to blame here if you go this way


## Exec
Runs a command on a running container.

```python
@exec
	name   : mymongo
	cmd    : mongorestore --drop -d mydb /current_dump
```


## Remote Logging (new feature)
Docker-ci offerts a great solution to container logging. Start a server and connect from anywhere to see live logs

### Starting a server

Log server works only on linux machines. Don't try running it in boot2docker (this is not going to work, unless you mount a directory and point server to the container's folder)

```python
docker-ci log-server
```
Server watches for /var/lib/docker/containers folder

Configuration

* --port (3335 by default)
* --token (1234 by default)
* --folder (/var/lib/docker/containers by default)


### Connecting to server

Gives a list of available containers

```python
docker-ci logs
[2015-07-16 10:25:10.209] [INFO] WiresClient - Creating a connection to localhost:3335
[2015-07-16 10:25:10.441] [INFO] WiresClient - Connected localhost.com:3335
[2015-07-16 10:25:10.660] [INFO] WiresClient - Job finished for  NkPujHxK @localhost:3335 -> "Available Containers:\n  morrr_pushd\n  blog_engine\n  morrr_app_app4\n  mongo_blogs\n  morrr_app_app1\n  pushd_redis\n  mongo_board\n  mongo_app1\n  mongo_app2\n  morrr_app_app2\n  morrr_app_migration_app3\n  shared_app3\n  morrr_app_app3\n  mongo_app3\n  mongo_test_app2\n  mongo_test_app3\n  board"
[2015-07-16 10:25:10.661] [INFO] WiresClient - Disconnected from  localhost:3335
Available Containers:
  app_nginx
  app_node
  app_redis
```

Specifiy a container name to start watching logs

```python
docker-ci logs --container app_node
```

### Configuring client

Create "logclient.conf" in your project.

Store this information for your own convinience.

```python
{
	"token" : "123",
	"host"	: "mydev.host.com:3335"
}
```
Each time you run "docker-ci logs" it will try read configuration from the current folder.


