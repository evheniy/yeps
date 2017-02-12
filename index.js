const promisify = require('yeps-promisify');
const debug = require('debug')('yeps:server');

module.exports = class {
    constructor() {
        debug('Server created');
        this.promises = [];
    }

    then(f) {
        this.promises.push(f);
        return this;
    }

    callback() {
        debug('Server started');
        debug(this.promises);
        return (req, res) => Promise.resolve({req, res}).then(ctx => promisify(ctx, this.promises));
    }
};
