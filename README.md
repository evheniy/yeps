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

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://raw.githubusercontent.com/evheniy/yeps/master/LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/evheniy/yeps.svg)](https://github.com/evheniy/yeps/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/evheniy/yeps.svg)](https://github.com/evheniy/yeps/network)
[![GitHub issues](https://img.shields.io/github/issues/evheniy/yeps.svg)](https://github.com/evheniy/yeps/issues)
[![Twitter](https://img.shields.io/twitter/url/https/github.com/evheniy/yeps.svg?style=social)](https://twitter.com/intent/tweet?text=Wow:&url=%5Bobject%20Object%5D)




Node http server is simple and fast. But it works with callbacks:

    const http = require('http');
    
    const server = http.createServer( (req, res) => {
      res.writeHead(200, {'Content-Type': 'text/plain'});
      res.end('okay');
    });

If we want to use promise (and async await):

    const http = require('http');
        
    const server = http.createServer( (req, res) => {
      Promise.resolve({ req, res })
        .then(ctx => {
          
            ctx.res.writeHead(200, {'Content-Type': 'text/plain'});
            ctx.res.end('okay');
          
            return ctx;
        });
    });
    
## And the same with yeps:

    npm i -S yeps

app.js

    const App = require('yeps');
    
    const app = module.exports = new App();
    
    app.then(async ctx => {
      ctx.res.writeHead(200, {'Content-Type': 'text/plain'});
      ctx.res.end('Ok');
    });
    
    app.catch(async (err, ctx) => {
      ctx.res.writeHead(500);
      ctx.res.end(err.message);
    });

bin/www

    #!/usr/bin/env node
    
    const http = require('http');
    const app = require('../app');

    http
        .createServer(app.resolve())
        .listen(parseInt(process.env.PORT || '3000', 10));
    
package.json

    "scripts": {
      "start": "node bin/www"
    }
    
## Promise like middleware

By default all app steps will be finished. Except one of them has rejected promise:

    app.then(async ctx => {
      
      ctx.res.writeHead(200);
      ctx.res.end('test');
      
      return app.reject();
      
    }).then(async () => {
      
      // it wont work
    
    }).catch(async () => {
    
      // it wont work
    
    });
    
#### [YEPS documentation](http://yeps.info/)
