var express = require('express');
var createError = require('http-errors');
var pgp = require('pg-promise')(/* no options */);
var router = express.Router();
var decibelAppDB = pgp('postgres://decibel:admin1234@localhost:5432/decibel-app');

/* GET list - list out all connections */
router.get('/list', function(req, res, next) {
    decibelAppDB.any('SELECT * from connections')
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
        });
});

/* POST test - test a connection using credentials passed in */
router.post('/test', function(req, res, next) {
    var user = req.body.user;
    var pass = req.body.pass;
    var host = req.body.host;
    var port = req.body.port;
    var db = req.body.db;
    var connectionString = `postgres://${user}:${pass}@${host}:${port}/${db}`;
    var db = pgp(connectionString);

    db.connect()
        .then(function (obj) {
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
        });
})

/* POST :id/audit - list out audit records for a connection AFTER date passed in (frontend current time) and update last checked audit connection */
router.post('/:id/audit', function(req, res, next) {
    console.log(req.params);
    // @TODO: Get audit records based on date passed in and connection info (need to think on this)
    // @TODO: Update last checked audit timestamp for connection
    // @TODO: Return audit records
    res.json({
        'results': 'results go here!',
        'error': false,
        'errorMessage': null,
        'status': 200
    });
});

module.exports = router;