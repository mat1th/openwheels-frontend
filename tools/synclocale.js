var path      = require('path');
var colors    = require('colors');
var fs        = require('fs');
var parseArgs = require('minimist');

var defaults = { base: 'src/assets/locale' };

if (process.argv[2] === 'sync') {
  main(parseArgs(process.argv.slice(3)));
}

module.exports = main;

function main (opts) {
  var base   = opts['base'] || defaults.base;
  var source = opts['source'];
  var target = opts['target'];
  var saveAs = opts['save_as'];

  var cwd = process.cwd();
  var src = require(path.join(cwd, base, source));
  var trg = require(path.join(cwd, base, target));

  var additions = missing(src, trg);
  var removals  = missing(trg, src);

  // PROCESS

  additions.forEach(function (key) {
    trg[key] = src[key];
    console.log(opts.source + ' -> ' + opts.target + ' | ' + ('ADD ').green + '"' + key + '"');
  });
  removals.forEach(function (key) {
    delete trg[key];
    console.log(opts.source + ' -> ' + opts.target + ' | ' + ('REMOVE ').red   + '"' + key + '"');
  });

  // WARN

  identicals(src, trg).filter(function (key) {
    return additions.indexOf(key) <= 0;
  }).forEach(function (key) {
    console.log(opts.source + ' -> ' + opts.target + ' | ' + ('WARNING, IDENTICAL ').white + '"' + key + '": "' + src[key] + '"');
  });
  blanks(src).forEach(function (key) {
    console.log(opts.source + ' WARNING NO VALUE ' + '"' + key + '": "' + src[key] + '"');
  });

  // SAVE

  if (saveAs) {
    if (additions.length || removals.length) {
      fs.writeFileSync(path.join(cwd, base, saveAs), JSON.stringify(trg, null, 4));
      console.log('Saved as ' + path.join(cwd, base, saveAs));
    } else {
      console.log('No changes (not saved)');
    }
  }
}

function missing (a, b) {
  return Object.keys(a).filter(function (key) {
    return !b.hasOwnProperty(key);
  });
}

function blanks (a) {
  return Object.keys(a).filter(function (key) {
    return !a[key];
  });
}

function identicals (a, b) {
  return Object.keys(a).filter(function (key) {
    return a[key] === b[key];
  });
}
