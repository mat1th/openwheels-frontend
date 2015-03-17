var synclocale = require('../synclocale');

module.exports = function (grunt) {

  grunt.registerMultiTask('synclocale', function (target) {
    var options = this.options();
    var data    = this.data;

    synclocale({
      base   : data.base    || options.base,
      source : data.source  || options.source,
      target : data.target  || options.target,
      save_as: data.save_as || options.save_as
    });
  });

};
