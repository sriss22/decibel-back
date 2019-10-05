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

/* Helper function to build sql queries for postgres statistics views */
function getStatQueries(req, res, next) {
    req.pg_stat_activity_sql = "SELECT datname as database_name, usename as username, application_name, client_addr as client_address, client_hostname, client_port, backend_start as process_start, state, backend_type FROM pg_stat_activity WHERE datname = ${db}";
    req.pg_stat_user_tables_sql = "SELECT schemaname as schema_name, relname as table_name, n_tup_ins as rows_inserted,	n_tup_upd as rows_updated, n_tup_del as rows_deleted, n_live_tup as live_rows, n_dead_tup as dead_rows,	n_mod_since_analyze as rows_since_analyzed FROM pg_stat_user_tables";
    next();
}

/* GET list - list out all connections */
router.get('/list', function(req, res, next) {
    decibelAppDB.manyOrNone('SELECT * FROM connections')
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
router.post('/test', buildConnection, function(req, res, next) {
    var db = pgp(req.connectionString);

    db.connect()
        .then(function(obj) {
            console.log('obj: ', obj);
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

/* POST :id/stats - list out db stats using postgres built in views */
router.post('/:id/stats', buildConnection, getStatQueries, function(req, res, next) {
    var db = pgp(req.connectionString);

    db.task(function(t) {
        return t.manyOrNone(req.pg_stat_activity_sql, { db: req.body.db })
            .then(function(stat_activity_data){
                if (stat_activity_data) {
                    return t.manyOrNone(req.pg_stat_user_tables_sql)
                        .then(function(stat_user_tables_data) {
                            return {
                                stat_activity: stat_activity_data,
                                stat_user_tables: stat_user_tables_data
                            }
                        })
                        .catch(function(error) {
                            throw new Error(error.message);
                        });
                }
                return []; // no data found
            })
            .catch(function(error) {
                throw new Error(error.message);
            })
    })
    .then(function(results) {
        res.json({
            results,
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