var glob = require('glob');
var fs = require('fs');
var path = require('path');
var _ = require('lodash');


var defaults = {
  localPackages: [
    'packages/*/loopback'
  ],
  foreignPackages: [
    // must include loopback4angularModule:true key in package.json
    'node_modules/*'
  ],
  loadCommonModels: true,
  appRootDir: path.normalize(__dirname + '/../..'),
  appConfigRootDir: '.',     // heres config.json
  env: 'development'
};


var bootCfg = {
  dsRootDir: false,               // heres datasources.json but we merge it
  bootDirs: [],                   // directories holding boot scripts
  modelSources: [],               // directories holding model files
  models: {},                     // model configuration
  dataSources: {},                // datasource configuration
  middleware: {}                  // middleware config
};


/**
 * Load all data from the package directory and merge it into bootCfg
 * @param {String} dir
 */
function loadPackage(dir) {
  // add directory holding models
  bootCfg.modelSources.push(dir + '/models');

  // add directory holding boot scripts
  bootCfg.bootDirs.push(dir + '/boot');

  // merge model-config.json
  _.merge(bootCfg.models, loadAndMergeConfig(dir + '/model-config.json'));

  // merge datasources.json
  _.merge(bootCfg.dataSources, loadAndMergeConfig(dir + '/datasources.json'));

  // merge middleware.json
  _.merge(bootCfg.middleware, loadAndMergeConfig(dir + '/middleware.json'));
}

/**
 * Load a the given file and merge
 * * .local.js and .local.json if exists
 * * .env.js and .env.json if exists where env is the NODE_ENV value or 'development'
 * @param {String} file
 * @returns {Object}
 */
function loadAndMergeConfig(file) {
  try {
    var config = require(file);
  }
  catch(e) {
    return {};
  }

  var localFile = file.replace(/\.json$/, '.local.');
  var envFile = file.replace(/\.json$/, '.' + bootCfg.env + '.');
  return _.merge(
    config,
    tryLoadjson(localFile+'js'),
    tryLoadjson(localFile+'json'),
    tryLoadjson(envFile+'js'),
    tryLoadjson(envFile+'json')
  );
}


/**
 * Load a json file or return an empty obj if loading fails
 * @param {String} file
 * @returns {Object}
 */
function tryLoadjson(file) {
  var content = {};
  try {
    return require(file);
  } catch(e) {}
  return content;
}


/**
 * Generate a boot config with package support
 * @param {Object} opts to replace the defaults object
 * @returns {Object}
 */
function run(opts) {
  if(!opts) opts = defaults;
  bootCfg.appRootDir = opts.appRootDir;
  bootCfg.appConfigRootDir = opts.appConfigRootDir;
  bootCfg.env = process.env.NODE_ENV || opts.env;

  // load loopback core modules
  if(opts.loadCommonModels) bootCfg.modelSources.push(opts.appRootDir + '/node_modules/loopback/common/models');

  // load foreign packages
  opts.foreignPackages.forEach(function(globPattern) {
    glob.sync(opts.appRootDir + '/' + globPattern).forEach(function(dir) {
      var packagejson = tryLoadjson(dir + '/' + 'package.json');
      if(packagejson.loopback4angularModule) loadPackage(dir)
    });
  });

  // load local packages
  opts.localPackages.forEach(function(globPattern) {
    glob.sync(opts.appRootDir + '/' + globPattern).forEach(loadPackage);
  });

  return bootCfg;
}

module.exports = run;
