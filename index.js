#!/usr/bin/env node

var _ = require('lodash');
var domain = require('wires-domain');
var Promise = require('promise')

require('require-all')(__dirname + '/src');

domain.require(function(DockerCi, Bash, $scope) {

   $scope.setArg("dir", process.cwd())
   DockerCi.init();
})
