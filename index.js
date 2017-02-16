const promisify = require('yeps-promisify');
const debug = require('debug')('yeps:server');

module.exports = class {
    constructor() {
        debug('Server created');
        this.promises = [];
        this.error = null;
    }

    then(fn) {
        debug('New promise added');
        this.promises.push(fn);
        return this;
    }

    catch(fn) {
        debug('Error handler created');
        this.error = fn;
    }

    reject() {
        return Promise.reject();
    }

    resolve() {
        debug('Server started');
        return async (req, res) => {
            const context = { req, res, app: this };
            try {
                await promisify(context, [...this.promises]);
            } catch (error) {
                if (error && this.error) {
                    this.error(error, context);
                }
            }
        };
    }

    all(fns) {
        this.promises.push(async ctx => {
            await Promise.all(fns.map(fn => fn(ctx)));
        });
    }

    race(fns) {
        this.promises.push(async ctx => {
            await Promise.race(fns.map(fn => fn(ctx)));
        });
    }
};
