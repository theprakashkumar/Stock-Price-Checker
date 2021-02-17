const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function () {
    test('Viewing one stock: GET request to /api/stock-prices/', (done) => {
        chai.request(server)
            .get('/api/stock-prices')
            .query({
                stock: 'goog'
            })
            .end(function (err, res) {
                assert.equal(res.status, 200);
                assert.equal(res.body.stockData.stock, 'GOOG');
                assert.typeOf(res.body.stockData.price, 'number');
                done();
            });
    })

    test('Viewing one stock and liking it: GET request to /api/stock-prices/', (done) => {
        chai.request(server)
            .get('/api/stock-prices')
            .query({
                stock: 'goog',
                like: true
            })
            .end(function (err, res) {
                assert.equal(res.status, 200);
                assert.equal(res.body.stockData.stock, 'GOOG');
                assert.typeOf(res.body.stockData.price, 'number');
                assert.typeOf(res.body.stockData.likes, 'number');
                done();
            });
    })

    test('Viewing the same stock and liking it again: GET request to /api/stock-prices/', (done) => {
        chai.request(server)
            .get('/api/stock-prices')
            .query({
                stock: 'goog',
                like: true
            })
            .end(function (err, res) {
                assert.equal(res.status, 200)
                assert.equal(res.body.stockData.stock, 'GOOG')
                console.log(res.body.stockData.likes + " like should not be increased by 1 because same id!")
                done();
            });
    })

    test('Viewing two stocks: GET request to /api/stock-prices/', (done) => {
        chai.request(server)
            .get('/api/stock-prices')
            .query({
                stock: ['goog', 'msft']
            })
            .end(function (err, res) {
                assert.equal(res.status, 200)
                console.log(res.body)
                assert.equal(res.body.stockData[0].stock, 'GOOG');
                assert.equal(res.body.stockData[1].stock, 'MSFT');
                done();
            });
    })

    test('Viewing two stocks and liking them: GET request to /api/stock-prices/', (done) => {
        chai.request(server)
            .get('/api/stock-prices')
            .query({
                stock: ['goog', 'msft'],
                like: true
            })
            .end(function (err, res) {
                assert.equal(res.status, 200)
                console.log(res.body)
                assert.equal(res.body.stockData[0].stock, 'GOOG');
                assert.equal(res.body.stockData[1].stock, 'MSFT');
                assert.property(res.body.stockData[0], 'rel_likes');
                assert.property(res.body.stockData[1], 'rel_likes');
                done();
            });
    })
});