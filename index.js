const promisify = require('yeps-promisify');
const debug = require('debug')('yeps:server');

module.exports = class {
    constructor() {
        debug('Server created');
        this.promises = [];
        this.error = null;
        this.context = {};
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
            this.context = { req, res };
            try {
                await promisify(this.context, this.promises);
            } catch (error) {
                if (error && this.error) {
                    this.error(error, this.context);
                }
            }
        };
    }
};
