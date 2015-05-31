## Be Consecutive

Docker-ci runs your commands in sequence: kills, removes, creates volume, runs, builds - many other commands are available. They are simple, powerful and bring convinience to your build

```python
@cleanup
@kill mymongo
@rm mymongo
@run
	name	: mymongo
	image   : mongo:2.6.9
```


## Be Flexible

Pass your own variables, define fallback values, make conditional statements. In other words - make your build script flexible!

```python
@run 
   ports : ${port|80} -> 8080
```

If not defined, port 80 will be routed

```bash
docker-ci run --port=3001
```

## Be Tested

Running scripts before deployment was never that easy. Pick a build, execute a command.
Docker-ci will keep track on what's happening, and kill further execution if "0" code detected.

```python
@run
	image 		: myapp
	image 		: myapp_test
	link  		: mongo_for_tests -> mongo
	daemon 		: false
	cmd 		: grunt test
@rm-f myapp_test
```


## Be Continuous


Your environmental variables are stored in files. Create some - dev, staging, production, and your continuous delivery is set up. 

```python
@run
	env-file 	: ${dir}/env/${env|dev}
```

And you certainly want to have a fallback environment, if nothing is passed


## Be Sure


Be sure your container has launched. Special option "wait" will read container's logs and search for a "green light"

```python
@run 
	image 			: mongo:2.6.9
	name  			: mymongo
 	wait    		: logs_match -> '.*waiting for connections on port 27017.*'
```


---

## Examples

#### [Launching node application with mongodb in 5 minutes](/how-to-launch-node-application-with-mongodb-using-docker-ci)
Probably the best way to get along with docker-ci is to try it right way. It's simple and easy. 

#### [Nginx proxy - static + node app](/nginx-app-static-files-and-node-application)
Launching nginx server that proxies static files from the public folder and proxies the rest to the node application.







