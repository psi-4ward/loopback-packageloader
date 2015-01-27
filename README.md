# loopback-packageloader

Load loopback models and configs from different directories.

* `packages/*/loopback`
* `node_modules/*` if the package.json contains `loopback4angularModule:true`

## Install
```
npm install psi-4ward/loopback-packageloader
```

## Usage 
Edit your server.js like this

```javascript
var loopback = require('loopback');
var boot = require('loopback-boot');
var packageloader = require('loopback-packageloader');

var app = module.exports = loopback();

// generate a boot config that supports packages
var bootCfg = packageloader();

// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
boot(app, bootCfg);

// start the web server
app.listen(function() {
  app.emit('started');
  console.log('Web server listening at: %s', app.get('url'));
});
```

## Configuration
You can pass a config object as first param to `packageloader(objConfig)`
```javascript
var objConfig = {
  localPackages: [
    'packages/*/loopback',
    'server' // also support the "old" server directory
  ],
  foreignPackages: [
    // must include loopback4angularModule:true key in package.json
    'node_modules/*'
  ],
  loadCommonModels: true,    // load User, ACL, Roles etc models  
  appRootDir: __dirname,
  appConfigRootDir: '.',     // heres config.json
  env: 'development'         // is overwritten with process.env.NODE_ENV
};
```