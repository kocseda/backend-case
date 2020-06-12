const libs = process.cwd() + '/libs/';
const record = require('../app');
var supertest = require("supertest");
const config = require(libs + 'config');
var server = supertest.agent("http://localhost:" + config.get('port'));

const completeData = {
    "startDate": "2015-01-26",
    "endDate": "2019-02-02",
    "minCount": 10,
    "maxCount": 3000
}

const incompleteData = {
    "endDate": "2019-02-02",
    "maxCount": 3000
}

const invalidData = {
    "startDate": "2023-01-26",
    "endDate": "2019-02-02",
    "minCount": 10,
    "maxCount": 3000
}

//this test is for when all required fields are given in request body and records are found.
describe('Record Success', function () {
    it('should have records field', function (done) {
        server
            .post('/record/getrecords')
            .send(completeData)
            .end(function (err, res) {
                expect(res.statusCode).toEqual(200);
                expect(res.body).toHaveProperty('records');
                done();
            });
    });
});

//this test is for when not all required field are given in request body.
describe('Record Failure', function () {
    it('should have give error', function (done) {
        server
            .post('/record/getrecords')
            .send(incompleteData)
            .end(function (err, res) {
                expect(res.statusCode).toEqual(500);
                expect(res.body).toHaveProperty('error');
                expect(res.body.error).toEqual('Please specify all the required fields.');
                done();
            });
    });
});

//this test if for when no records are found.
describe('Record Not Found', function () {
    it('should have give not found error.', function (done) {
        server
            .post('/record/getrecords')
            .send(invalidData)
            .end(function (err, res) {
                expect(res.statusCode).toEqual(404);
                expect(res.body).toHaveProperty('error');
                expect(res.body.error).toEqual('Record not found');
                done();
            });
    });
});