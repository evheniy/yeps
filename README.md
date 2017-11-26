# Yet Another Event Promised Server


Simple promised node http request-response handler

[![NPM](https://nodei.co/npm/yeps.png)](https://npmjs.org/package/yeps)

[![npm version](https://badge.fury.io/js/yeps.svg)](https://badge.fury.io/js/yeps)
[![Build Status](https://travis-ci.org/evheniy/yeps.svg?branch=master)](https://travis-ci.org/evheniy/yeps)
[![Coverage Status](https://coveralls.io/repos/github/evheniy/yeps/badge.svg?branch=master)](https://coveralls.io/github/evheniy/yeps?branch=master)
[![Linux Build](https://img.shields.io/travis/evheniy/yeps/master.svg?label=linux)](https://travis-ci.org/evheniy/)
[![Windows Build](https://img.shields.io/appveyor/ci/evheniy/yeps/master.svg?label=windows)](https://ci.appveyor.com/project/evheniy/yeps)

[![Dependency Status](https://david-dm.org/evheniy/yeps.svg)](https://david-dm.org/evheniy/yeps)
[![devDependency Status](https://david-dm.org/evheniy/yeps/dev-status.svg)](https://david-dm.org/evheniy/yeps#info=devDependencies)
[![NSP Status](https://img.shields.io/badge/NSP%20status-no%20vulnerabilities-green.svg)](https://travis-ci.org/evheniy/yeps)

[![Known Vulnerabilities](https://snyk.io/test/github/evheniy/yeps/badge.svg)](https://snyk.io/test/github/evheniy/yeps)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://raw.githubusercontent.com/evheniy/yeps/master/LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/evheniy/yeps.svg)](https://github.com/evheniy/yeps/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/evheniy/yeps.svg)](https://github.com/evheniy/yeps/network)
[![GitHub issues](https://img.shields.io/github/issues/evheniy/yeps.svg)](https://github.com/evheniy/yeps/issues)
[![Twitter](https://img.shields.io/twitter/url/https/github.com/evheniy/yeps.svg?style=social)](https://twitter.com/intent/tweet?text=Wow:&url=%5Bobject%20Object%5D)

    
## How to install

    npm i -S yeps

## How to use

#### app.js

    const App = require('yeps');
    
    const app = module.exports = new App();
    
    app.then(async (ctx) => {
      ctx.res.statusCode = 200;
      ctx.res.setHeader('Content-Type', 'application/json');
      ctx.res.end('{"status":"OK"}');
    });
    
    app.catch(async (error, ctx) => {
      ctx.res.statusCode = 500;
      ctx.res.setHeader('Content-Type', 'application/json');
      ctx.res.end(JSON.stringify({ error }));
    });

#### bin/www

    #!/usr/bin/env node
    
    const http = require('http');
    const app = require('../app');

    http
      .createServer(app.resolve())
      .listen(parseInt(process.env.PORT || '3000', 10));
    
#### package.json

    "scripts": {
      "start": "node bin/www"
    }
    
## Breaking chain

    app.then(async (ctx) => {
      ctx.res.statusCode = 200;
      ctx.res.setHeader('Content-Type', 'application/json');
      ctx.res.end('{"status":"OK"}');
      
      return Promise.reject();
    }).then(async () => {
      // it won't work
    }).catch(async () => {
      // it won't work
    });
    
## Using router

    npm i -S yeps-router
    
#### app.js

    const App = require('yeps');
    const Router = require('yeps-router');
    
    const app = module.exports = new App();
    const router = new Router();
    
    router.get('/').then(async (ctx) => {
      ctx.res.statusCode = 200;
      ctx.res.setHeader('Content-Type', 'application/json');
      ctx.res.end('{"status":"OK"}');     
    });
    
    app.then(router.resolve());
    
## Using server

    npm i -S yeps-server
    
#### bin/www

    #!/usr/bin/env node
        
    const server = require('yeps-server');
    
    const app = require('../app');
    
    server.createHttpServer(app);
    
## Error handler

    npm i -S yeps-error yeps-logger
    
#### app.js

    const App = require('yeps');
    
    const error = require('yeps-error');
    const logger = require('yeps-logger');
    
    const app = module.exports = new App();
    
    app.all([
      error(),
      logger(),
    ]);
    

#### [YEPS documentation](http://yeps.info/)
