var express = require('express');
var createError = require('http-errors');
var pgp = require('pg-promise')(/* no options */);
var router = express.Router();
var decibelAppDB = pgp('postgres://decibel:admin1234@localhost:5432/decibel-app');

/* Helper function to build connection string for a db connection */
function buildConnection(req, res, next) {
    var user = req.body.user;
    var pass = req.body.pass;
    var host = req.body.host;
    var port = req.body.port;
    var dbName = req.body.db;
    req.connectionString = `postgres://${user}:${pass}@${host}:${port}/${dbName}`;
    next();
}

/* GET list - list out all connections */
router.get('/list', function(req, res, next) {
    decibelAppDB.any('SELECT * FROM connections')
        .then(function(data) {
            res.json({
                'results': data,
                'error': false,
                'errorMessage': null,
                'status': 200
            });
        })
        .catch(function(error) {
            next(createError(500, error.message));
        })
        .finally(decibelAppDB.$pool.end);
});

/* POST test - test a connection using credentials passed in */
router.post('/test', buildConnection, function(req, res, next) {
    var db = pgp(req.connectionString);

    db.connect()
        .then(function(obj) {
            obj.done();
            res.json({
                'results': 'Successfully logged in!',
                'error': false,
                'errorMessage': null,
                'status': 200
            });
        })
        .catch(function (error) {
            next(createError(500, error.message));
        })
        .finally(db.$pool.end);
})

/* POST :id/audit - list out audit records for a connection in date range passed in */
router.post('/:id/audit', buildConnection, function(req, res, next) {
    var db = pgp(req.connectionString);
    var begin = req.body.begin;
    var end = req.body.end;

    db.any('SELECT * FROM db_audit WHERE occurred_at >= ${begin} AND occurred_at <= ${end}', { begin, end })
        .then(function(data) {
            res.json({
                'results': data,
                'error': false,
                'errorMessage': null,
                'status': 200
            });
        })
        .catch(function(error) {
            next(createError(500, error.message));
        })
        .finally(db.$pool.end);
});

module.exports = router;