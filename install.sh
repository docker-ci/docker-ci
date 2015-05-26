#!/bin/bash
if ! type "docker-ci" > /dev/null; then
 	echo "# Installing docker-ci"
	echo "# Getting docker-ci script"
	wget https://raw.githubusercontent.com/docker-ci/docker-ci/master/docker-ci
	echo "# Moving to /usr/local/bin"
	mv ./docker-ci /usr/local/bin
	chmod +x /usr/local/bin/docker-ci
	echo "# Installation ok"
else
	echo "# docker-ci is already installed"	
	echo "Checking dependencies"
	echo "# Run docker-ci update to have the latest version"	
fi







