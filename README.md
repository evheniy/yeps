# Yet Another Event Promised Server


Simple promised node http request-response handler

[![npm version](https://badge.fury.io/js/yeps.svg)](https://badge.fury.io/js/yeps)
[![Build Status](https://travis-ci.org/evheniy/yeps.svg?branch=master)](https://travis-ci.org/evheniy/yeps)
[![Coverage Status](https://coveralls.io/repos/github/evheniy/yeps/badge.svg?branch=master)](https://coveralls.io/github/evheniy/yeps?branch=master)
[![Dependency Status](https://david-dm.org/evheniy/yeps.svg)](https://david-dm.org/evheniy/yeps)
[![devDependency Status](https://david-dm.org/evheniy/yeps/dev-status.svg)](https://david-dm.org/evheniy/yeps#info=devDependencies)
[![NSP Status](https://img.shields.io/badge/NSP%20status-no%20vulnerabilities-green.svg)](https://travis-ci.org/evheniy/yeps)
[![License](https://img.shields.io/npm/l/yeps.svg?style=flat-square)]()

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
    
## And the same with yaps:

    npm i -S yaps

app.js

    const App = require('yaps');
    
    const app = module.exports = new App();
    
    app.then(async ctx => {
      ctx.res.writeHead(200, {'Content-Type': 'text/plain'});
      ctx.res.end('okay');
    });
    
    app.catch(async (err, ctx) => {
      ctx.res.writeHead(500);
      ctx.res.end(err.message);
    });

bin/www

    #!/usr/bin/env node
    
    const http = require('http');
    const app = require('../app');

    const server = http.createServer(app.resolve());
    
    server.listen(process.env.PORT);
    
package.json

    "scripts": {
      "start": "NODE_ENV=production PORT=3000 node --harmony bin/www"
    }
    
## Promise like middleware

By default all app steps will be finished. Except one of them has rejected promise:

    app.then(async ctx => {
      ctx.res.writeHead(200);
      ctx.res.end('test');
      
      return app.reject(); // or return Promise.reject()
    });
    
    app.then(async () => {
      // it wont work
    });
    
    app.catch(async () => {
      // it wont work
    });