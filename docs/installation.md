# Docker-ci Installation


This script is written in python. This simple installation script puts docker-ci script into /usr/local/bin
folder. 

## Script install

```bash
$ wget -O - https://raw.githubusercontent.com/wiresjs/docker-ci/master/install.sh | bash
```

Please, don't use sudo permissions. This script does not require any. 

## Manual install

If you are not able to install through this script, please do it manually 

```bash
wget https://raw.githubusercontent.com/wiresjs/docker-ci/master/docker-ci
cp docker-ci /usr/local/bin
```

## Automatic updates

An addition, script requires permissions to write into home directory to this file /home/{user}/.docker-ci-meta
It stores user settings and version information.

Docker-ci does automatic update once a day. It fetches data from the github and compares local version with server's. If it does not suit you for some reason,you can disable it.

```bash
docker-ci config --auto-update=false
```

However i would recommend leaving it like it is,  due to often script updates (They don't involve any vital or critical changes that affect your build process, but include bug fixes and new features instead). Nothing unstable is released.

Docker ci is in beta testing now, with general availability slated for July 2015.
Contribution is highly appericiated

Check out [docs](http://docker-ci.org/docs)
