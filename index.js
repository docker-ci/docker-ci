#!/usr/bin/env node

var _ = require('lodash');
var domain = require('wires-domain');
var server = require('wires-client');
var Promise = require('promise');
var path = require("path");
var moment = require("moment");
require('require-all')(__dirname + '/src');

domain.require(function(DockerCi, Bash, $scope) {
   var rootPath = path.join("/", process.cwd());
   $scope.setArg("dir", rootPath);
   $scope.setArg("datetime", moment().format('DD-MMMM-YYYY-hh_mm'));
   DockerCi.init();
});
