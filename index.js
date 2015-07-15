#!/usr/bin/env node

var _ = require('lodash');
var domain = require('wires-domain');
var server = require('wires-client')
var Promise = require('promise')
var path = require("path");
require('require-all')(__dirname + '/src');

domain.require(function(DockerCi, Bash, $scope) {
   var rootPath = path.join("/", process.cwd());
   $scope.setArg("dir", rootPath)
   DockerCi.init();
})
