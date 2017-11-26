const debug = require('debug')('yeps:core');
const promisify = require('yeps-promisify');

module.exports = class {
  constructor() {
    debug('Server created');

    this.promises = [];
    this.error = [];
  }

  then(fn) {
    debug('New promise added');

    this.promises.push(fn);

    return this;
  }

  catch(fn) {
    debug('Error handler added');

    this.error.push(fn);

    return this;
  }

  reject(message) {
    debug('Reject');

    return Promise.reject(message);
  }

  resolve() {
    debug('Server started');

    return async (req, res) => {
      debug('Request');

      const app = this;
      const context = { req, res, app };

      try {
        await promisify(context, this.promises);
        debug('Promises length:', this.promises.length);
      } catch (error) {
        debug('Error:', error);

        if (error) {
          debug('Running error handler');

          await Promise.all(this.error.map(fn => fn(error, context)));
        }
      }
      debug('End promisify');
    };
  }

  all(fns) {
    debug('all');

    this.promises.push(async (ctx) => {
      await Promise.all(fns.map(fn => fn(ctx)));
    });

    return this;
  }

  race(fns) {
    debug('race');

    this.promises.push(async (ctx) => {
      await Promise.race(fns.map(fn => fn(ctx)));
    });

    return this;
  }
};
