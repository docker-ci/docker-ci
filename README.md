# docker-ci

Docker-ci is a very powerfull tool for orchestrating your containers. It does what it is told. Your can run test before running containers, pass multiple arguments with fallback values. There is nothing that cannot be done with docker.ci. Read up!

The code isn't in its best shape, so please contribute!


## Features
 * Simple step-by-step syntax
 * Easy work flow - kill, build, run, validate 
 * Parsing arguments with fallback values
 * Environmental variable set
 * Volume containers (based on easy box)
 * Fun!

## History and WHY

I ended up creating this tool, simple because there aren't analogues. There more your project grows, the more it demands. Running tests before the build, different enviroments. I started off with a simple script, that just launches containers. You can build a very complex structure within couple of minutes. The most interesting part - it's just a set of bash scripts, that's being called and analysed.

I will add more and more example, as soon as. Let's start with the theory

## Essential things to know

Directives (that's how i would like to call docker-ci commands) are essentially wrappers for bash commands.
This tool is not going to stop your container unless told. The way you build you application depepends only and only on your design preferences. This is a major difference between many other tools and docker-ci.

### Step by step execution

All your directives are executed one by one. If somethings failes - the whole build is considered a failure. 


### Installation

This script is written in python. It requires module called "colored". If for some reason this script did not install it, please do it manually, or help me out with a better installation script.
It works perfectly on debian machines. 

```bash
$ sudo wget -O - https://raw.githubusercontent.com/wiresjs/docker-ci/master/install.sh | bash
```


# Launching mongo + nginx + node app

The best way to understand the benefit of this tool is getting to a real complicated scenario.
Imagine that we need to have an nginx server, that proxies everything but public folder to our container. Static files aren't served by node. To make a bit more complicated - let's add mongo.

Launch it!

```bash
cd examples/nginx_mongo_node/
docker-ci run --verbose=true
```

It may take a while to launch it at first. (Due to all downloads)

---

Before we proceed, i would to like to put some fundumentals to your attention.

## Arguments and fallback values

Let's say we are running a scipt.

```bash
docker-ci run --env=production
```

We passed an argument "env" that can be used within an instruction file.

```python
${dir}/env/${env|test}
```

In this case, ${dir} will be replaced with current directory, and ${env|test} with production.
Say you want to have a default value - Just follow the syntax - ${env|test}!

```python
Users/user/project/env/test
```

## Working directory

Working directory has a macro called ${dir}. No need to specify a default value - it has it already - it's where your instruction file is located. It can be overriden, if you want to:

```bash
docker-ci run --dir=/home/user/project
```

## Instructions

```python
@cleanup
@run
	image 	: mongo
	name  	: mymongo
	command	: mongod
	wait  	: logs_match -> '.*waiting for connections on port 27017.*'

@volume
	name 	  : shared
	mount   : ${dir}/src/public						-> /data/public
	mount   : ${dir}/shared/nginx/sites-enabled 	-> /etc/nginx/conf.d
	mount   : ${dir}/shared/nginx/logs 				-> /var/log/nginx

@build
	tag 	: testapp
	path 	: .
	cache 	: true

@rm-f testapp

@run 
	env-file 	: ${dir}/env/${env|test}
	name   		: testapp
	image  		: testapp
	link   		: mymongo -> mongo
	daemon  	: true
	volume 		: shared


@rm-f nginx

@run
	image	: nginx
	name 	: nginx
	ports 	: 3000 -> 80
	volume 	: shared
	link    : testapp -> testapp
```
Let's go step by step, and check what is what!

## @cleanup
For starters, you always want to clean up stopped containers, they are pretty much useless, and take spaces.
A very convinient directive does it for you.

The output should be something like this

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

Docker-ci ALWAYS prints what it executes. So if you got confused, you can always follow the instruction's execution log.

Next - Why not launching mongo container?

## @run

To be noted: If your container is running, or it's just stopped - script is not going to do anything. It'll just tell you - Hey, this container is already running, probably i should not touch it.

Use @kill or @rm or @rm-f directives beforehand. (Described below) 

```python
@run
	image 	: mongo
	name  	: mymongo
	cmd	: mongod
	wait  	: logs_match -> '.*waiting for connections on port 27017.*'
```
Image and name are self-explanatory and required. Let's go throught all the possible options.

#### cmd

It is a command. Yes sherlock, you need to execute "grunt test"? This is the right place! small files for mongo?
It's all here

```python
cmd	: mongod --smallfiles
```

#### wait

On slow machines, you may notice - mongo container requires about a minute to get started. On a better machine you will probably get it right away. But just to be sure, docker-ci can read logs and match each line on container's start. It will wait the moment and procceed if found. (TO-DO: no timeout) 

#### env-file

Loads enviroment string from a specific file. In our case it looks like this.

```python
env-file 	: ${dir}/env/${env|test}
```

You will see the environment printed out in your console.

```bash
# Reading env file /Users/user/docker-ci/examples/nginx_mongo_node/env/test
  env: 'NODE_ENV' -> 'test'
```

If you have a bunch of enviroments that you project requires - this descriptor will probably make your life way much easier. Scale it up, and you have dev production and staging environment all set!

#### link

Link up your containers like so. 

```python
link   		: mymongo -> mongo
link   		: redis -> redis
```

Syntax is self-explanatory

    {which-container-name} -> {what-alias}
    
#### daemon
It's either true or false. It's nice to be Caption Obvious for a breif moment.

```python
daemon  	: true
```

If set to "false" docker-ci will print the output.

#### volume
Mounts previously described volume

```python
volume 		: shared
```
Scroll down to @volume directive, if you want to comprehend the magic

#### Mount

Mounts a directory. Yes. 

```python
	mount   : ${dir}/shared/nginx/logs 				-> /var/log/nginx
```
Don't overuse it. The official docker documentation does not recommend spoiling your containers up with alien directories. Use @volume. Of course, no one is to blame here if you go this way

## @volume
Volume container is just a convinience container. It uses [busy box image](https://registry.hub.docker.com/_/busybox/)

It downloads it from registry mounts up host directories, and we are ready to go!

```python
@volume
	name 	: shared
	mount 	: ${dir}/src/public						-> /data/public
	mount   : ${dir}/shared/nginx/sites-enabled 	-> /etc/nginx/conf.d
	mount   : ${dir}/shared/nginx/logs 				-> /var/log/nginx
```

This is what your console will say:

```bash
# Creating volume container 'shared'
  /Users/user/docker-ci/examples/nginx_mongo_node/src/public:/data/public
  /Users/user/docker-ci/examples/nginx_mongo_node/shared/nginx/sites-enabled:/etc/nginx/conf.d
  /Users/user/docker-ci/examples/nginx_mongo_node/shared/nginx/logs:/var/log/nginx
  docker run -v /Users/user/docker-ci/docker-ci/examples/nginx_mongo_node/src/public:/data/public -v /Users/user/docker-ci/docker-ci/examples/nginx_mongo_node/shared/nginx/sites-enabled:/etc/nginx/conf.d -v /Users/user/docker-ci/docker-ci/examples/nginx_mongo_node/shared/nginx/logs:/var/log/nginx --name shared busybox true
```

You don't need to bother about absolute paths docker required. That's the true beauty.

## @build
Probably the simpliest directive here

```python
@build
	tag 	: testapp
	path 	: .
	cache 	: true
```

Cache is true by default. So most likely you want it to be that way.

## @kill

Kills a container
```python
@kill testapp
```

## @rm

Removes a container
```python
@rm testapp
```
Will spit an error, if container is running. 

## @rm-f

Removes a container regardless of its state.
Personally I prefer this directive over @kill of @rm

```python
@rm-f testapp
```


# More to come
Please, contribute and help me out with the script!
Cheers!


   
