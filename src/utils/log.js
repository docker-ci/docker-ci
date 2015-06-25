var _ = require('lodash');
var domain = require('wires-domain');
var Promise = require('promise')

var vsprintf = require('sprintf').vsprintf;
var sliced = require("sliced");

var colors = {
   HEADER: '\033[95m',
   OKBLUE: '\033[94m',
   OKGREEN: '\033[92m',
   WARNING: '\033[93m',
   RED: '\033[41m',
   GRAY: '\033[37m',
   BROWN: '\033[33m',
   MAGENTA: '\033[45m',
   SETTING: '\033[1m',
   FAIL: '\033[91m',
   ENDC: '\033[0m',
   BOLD: '\033[1m',
   UNDERLINE: '\033[4m'
}


domain.service("$log", function() {
   return {
      _print: function(str, args) {
         console.log(vsprintf(str, args || []));
      },
      important: function(str) {
         this._print(colors.HEADER + str + colors.ENDC, sliced(arguments, 1));
      },
      action: function(str) {
         this._print(colors.OKGREEN + str + colors.ENDC, sliced(arguments, 1));
      },
      info: function(str) {
         this._print("  " + colors.GRAY + str + colors.ENDC, sliced(arguments, 1));
      },
      bash: function(str) {
         this._print("     " + colors.GRAY + str + colors.ENDC, sliced(arguments, 1));
      },
      highlight: function(str) {
         this._print("     " + colors.UNDERLINE + str + colors.ENDC, sliced(arguments, 1));
      },
      setting: function(str) {
         this._print("     " + str, sliced(arguments, 1));
      },
      detail: function(str) {
         this._print("       " + colors.GRAY + str + colors.ENDC, sliced(arguments, 1));
      },
      error: function(str) {
         this._print(colors.RED + str + colors.ENDC, sliced(arguments, 1));
      }
   }
})
