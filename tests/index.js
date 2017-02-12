const chai = require('chai');
const chaiHttp = require('chai-http');
const http = require('http');
const expect = chai.expect;
const App = require('../index');

chai.use(chaiHttp);
let app;

describe('YAPS test', () => {

    beforeEach(() => {
        app = new App();
    });

    it('should test promise', async () => {

        const text = 'okay';
        const contentType = 'text/plain';
        let isTestFinished = false;

        app.then(async ctx => {
            ctx.res.writeHead(200, {'Content-Type': contentType});
            ctx.res.end(text);
        });

        await chai.request(http.createServer(app.resolve()))
            .get('/')
            .send()
            .then(res => {
                expect(res).to.have.status(200);
                expect(res.text).to.be.equal(text);
                expect(res.headers['content-type']).to.be.equal(contentType);
                isTestFinished = true;
            });

        return expect(isTestFinished).is.true;
    });

    it('should test chain of promises', async () => {

        const text = 'okay';
        const contentType = 'text/plain';
        let isTestFinished = false;

        app.then(async ctx => {
            ctx.headers = {};
            ctx.headers['Content-Length'] = 4;
        }).then(async ctx => {
            ctx.headers['Content-Type'] = contentType;
        });

        app.then(async ctx => {
            ctx.res.writeHead(200, ctx.headers);
            ctx.res.end(text);
        });

        await chai.request(http.createServer(app.resolve()))
            .get('/')
            .send()
            .then(res => {
                expect(res).to.have.status(200);
                expect(res.text).to.be.equal(text);
                expect(res.headers['content-type']).to.be.equal(contentType);
                expect(res.headers['content-length']).to.be.equal('4');
                isTestFinished = true;
            });

        return expect(isTestFinished).is.true;
    });

    it('should test error handler', async () => {

        const text = 'error';
        let isTestFinished = false;

        app.then(async () => {
            return Promise.reject(new Error(text));
        });

        app.catch(async (err, ctx) => {
            ctx.res.writeHead(200);
            ctx.res.end(err.message);
        });

        await chai.request(http.createServer(app.resolve()))
            .get('/')
            .send()
            .then(res => {
                expect(res).to.have.status(200);
                expect(res.text).to.be.equal(text);
                isTestFinished = true;
            });

        return expect(isTestFinished).is.true;
    });

    it('should test breaking of promises chain', async () => {

        let isTestFinished = false;
        let isTestOk = true;

        app.then(async ctx => {
            ctx.res.writeHead(200);
            ctx.res.end('test');

            return app.reject();
        });

        app.then(async () => {
            isTestOk = false;
        });

        app.catch(async () => {
            isTestOk = false;
        });

        await chai.request(http.createServer(app.resolve()))
            .get('/')
            .send()
            .then(res => {
                expect(res).to.have.status(200);
                isTestFinished = true;
            });

        expect(isTestOk).is.true;

        return expect(isTestFinished).is.true;
    });

});
