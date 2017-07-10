const promisify = require('yeps-promisify');
const debug = require('debug')('yeps:server');

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

  reject() {
    debug('Reject');

    return Promise.reject();
  }

  resolve() {
    debug('Server started');

    return async (req, res) => {
      const context = { req, res, app: this };

      debug(context);

      try {
        await promisify(context, this.promises);
        debug('End promisify');
      } catch (error) {
        debug('Error');
        debug(error);

        await Promise.all(this.error.map(fn => fn(error, context)));
      }
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
