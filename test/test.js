var assert = require("assert");
let chai = require("chai");
let chaiHttp = require("chai-http");
let server = require("../app");
let should = chai.should();

chai.use(chaiHttp);

describe("Connections", () => {
    describe("GET - List Connections", () => {
        it("Should list out all connections", (done) => {
            let list = [
                {
                    id: 1,
                    host: 'localhost',
                    database: 'test1',
                    port: 5432,
                    username: 'testuser1',
                    password: 'user1pass'
                },
                {
                    id: 2,
                    host: 'localhost',
                    database: 'test2',
                    port: 5432,
                    username: 'testuser2',
                    password: 'user2pass'
                },
                {
                    id: 3,
                    host: 'localhost',
                    database: 'test3',
                    port: 5432,
                    username: 'testuser3',
                    password: 'user3pass'
                }
            ]
            chai.request(server)
                .get("/connections/list")
                .end((err, result) => {
                    result.should.have.status(200);

                    result.body.results.length.should.eq(3);
                    chai.expect(result.body.results).to.eql(list);

                    console.log('Body: ', result.body);
                    done();
                });
        });
    });

    describe("POST - Test Connection", function() {
        it("Should connect to a database and return a success status and message", (done) => {
            let reqBody = {
                host: 'localhost',
                db: 'test1',
                port: 5432,
                user: 'testuser1',
                pass: 'user1pass'
            };

            chai.request(server)
                .post("/connections/test")
                .send(reqBody)
                .end((err, result) => {
                    result.should.have.status(200);

                    result.body.results.should.eq("Successfully logged in!");

                    chai.expect(result.body.error).to.be.false;
                    chai.expect(result.body.errorMessage).to.be.null;

                    console.log('Body: ', result.body);
                    done();
                });
        });

        it("Should fail to connection and return an error status (), error value of true, and error message", (done) => {
            let reqBody = {
                host: 'localhost',
                db: 'test1',
                port: 5432,
                user: 'testuser1',
                pass: 'pass1234'
            };

            chai.request(server)
                .post("/connections/test")
                .send(reqBody)
                .end((err, result) => {
                    result.should.have.status(500);

                    chai.expect(result.body.results).to.be.null;

                    chai.expect(result.body.error).to.be.true;
                    chai.assert.isString(result.body.errorMessage);
                    chai.expect(result.body.errorMessage).to.equal('password authentication failed for user "testuser1"')

                    console.log('Body: ', result.body);
                    done();
                });
        });
    });

    describe("POST - List Connection Stats", function() {
        it("Should connect to a database and return stats for that database and its tables", (done) => {
            let reqBody = {
                host: 'localhost',
                db: 'test1',
                port: 5432,
                user: 'testuser1',
                pass: 'user1pass'
            };

            chai.request(server)
                .post("/connections/1/stats")
                .send(reqBody)
                .end((err, result) => {
                    // Test response status code
                    result.should.have.status(200);

                    // Test response body results property lengths
                    result.body.results.stat_activity.length.should.eq(2);
                    result.body.results.stat_user_tables.length.should.eq(1);

                    // Test response body results property keys
                    chai.expect(result.body.results.stat_activity[0]).to.have.keys(
                        "database_name", "username", "application_name", "client_address", "client_hostname", "client_port", "process_start", "state", "backend_type"
                    );
                    chai.expect(result.body.results.stat_activity[1]).to.have.keys(
                        "database_name", "username", "application_name", "client_address", "client_hostname", "client_port", "process_start", "state", "backend_type"
                    );

                    // Test individual response body result property value types
                    chai.assert.isString(result.body.results.stat_activity[0].database_name);
                    chai.assert.isString(result.body.results.stat_activity[1].database_name);

                    chai.assert.isString(result.body.results.stat_activity[0].username);
                    chai.assert.isString(result.body.results.stat_activity[1].username);

                    chai.assert.isString(result.body.results.stat_activity[0].application_name);
                    chai.assert.isString(result.body.results.stat_activity[1].application_name);

                    chai.expect(result.body.results.stat_activity[0]).to.satisfy((obj) => {
                        let returnValue = true;
                        if (obj.client_address !== null) {
                            returnValue = typeof obj.client_address === "string";
                        }
                        if (obj.client_hostname !== null) {
                            returnValue = typeof obj.client_hostname === "string";
                        }
                        if (obj.client_port !== null) {
                            returnValue = typeof obj.client_port === "number";
                        }
                        if (obj.process_start !== null) {
                            returnValue = typeof obj.process_start === "string";
                        }
                        if (obj.state !== null) {
                            returnValue = typeof obj.state === "string";
                        }
                        if (obj.backend_type !== null) {
                            returnValue = typeof obj.backend_type === "string";
                        }
                        return returnValue;
                    });

                    chai.expect(result.body.results.stat_activity[1]).to.satisfy((obj) => {
                        console.log("obj: ", obj);
                        let returnValue = true;
                        if (obj.client_address !== null) {
                            returnValue = typeof obj.client_address === "string";
                        }
                        if (obj.client_hostname !== null) {
                            returnValue = typeof obj.client_hostname === "string";
                        }
                        if (obj.client_port !== null) {
                            returnValue = typeof obj.client_port === "number";
                        }
                        if (obj.process_start !== null) {
                            returnValue = typeof obj.process_start === "string";
                        }
                        if (obj.state !== null) {
                            returnValue = typeof obj.state === "string";
                        }
                        if (obj.backend_type !== null) {
                            returnValue = typeof obj.backend_type === "string";
                        }
                        return returnValue;
                    });

                    chai.expect(result.body.results.stat_user_tables[0]).to.have.keys(
                        "schema_name", "table_name", "rows_inserted", "rows_updated", "rows_deleted", "live_rows", "dead_rows", "rows_since_analyzed"
                    );

                    chai.assert.isString(result.body.results.stat_user_tables[0].schema_name);
                    chai.assert.isString(result.body.results.stat_user_tables[0].table_name);
                    chai.assert.isString(result.body.results.stat_user_tables[0].rows_inserted);
                    chai.assert.isString(result.body.results.stat_user_tables[0].rows_updated);
                    chai.assert.isString(result.body.results.stat_user_tables[0].rows_deleted);
                    chai.assert.isString(result.body.results.stat_user_tables[0].live_rows);
                    chai.assert.isString(result.body.results.stat_user_tables[0].dead_rows);
                    chai.assert.isString(result.body.results.stat_user_tables[0].rows_since_analyzed);

                    // Test response body error value (boolean) and error message
                    chai.expect(result.body.error).to.be.false;
                    chai.expect(result.body.errorMessage).to.be.null;

                    console.log("Body: ", result.body);
                    done();
                });
        });
    });
});