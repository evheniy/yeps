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

    resolve() {
        debug('Server started');
        return (req, res) => {
            this.context = { req, res };
            return Promise.resolve()
                .then(() => promisify(this.context, this.promises))
                .catch(error => {
                    if (this.error) {
                        debug('Custom error handler');
                        this.error(error, this.context);
                    } else {
                        this.context.res.writeHead(500);
                        this.context.res.end('Internal Server Error');
                    }
                });
        };
    }
};
