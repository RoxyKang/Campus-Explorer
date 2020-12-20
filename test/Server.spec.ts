import Server from "../src/rest/Server";

import InsightFacade from "../src/controller/InsightFacade";
import chai = require("chai");
import chaiHttp = require("chai-http");
import Response = ChaiHttp.Response;
import { expect } from "chai";
import Log from "../src/Util";
import * as fs from "fs-extra";

describe("Facade D3", function () {
    let facade: InsightFacade = null;
    let server: Server = null;

    chai.use(chaiHttp);

    before(function () {
        facade = new InsightFacade();
        server = new Server(4321);
        // TODO: start server here once and handle errors properly
        // try {
        //     server.start();
        // } catch (e) {
        //     Log.error(e);
        // }
    });

    after(function () {
        // TODO: stop server here once!
        // try {
        //     server.stop();
        // } catch (e) {
        //     Log.error(e);
        // }
    });

    beforeEach(function () {
        // might want to add some process logging here to keep track of what"s going on
        Log.test(`BeforeTest: ${this.currentTest.title}`);
    });

    afterEach(function () {
        // might want to add some process logging here to keep track of what"s going on
        Log.test(`After: ${this.test.parent.title}`);
    });

    // Sample on how to format PUT requests

    // it("PUT test for courses dataset - sucess", function () {
    //     this.timeout(30000);
    //     try {
    //         return chai.request("http://localhost:4321")
    //             .put("/dataset/courses/courses")
    //             .send(fs.readFileSync("./test/data/courses.zip"))
    //             .set("Content-Type", "application/x-zip-compressed")
    //             .then(function (res: Response) {
    //                 // some logging here please!
    //                 expect(res.status).to.be.equal(200);
    //             })
    //             .catch(function (err) {
    //                 // some logging here please!
    //                 Log.info(err);
    //                 expect.fail();
    //             });
    //     } catch (err) {
    //         // and some more logging here!
    //         Log.error(err);
    //     }
    // });
    //
    // it("POST test for courses dataset - success", function () {
    //     // server.stop();
    //     // server.start();
    //     let query: any = {
    //         WHERE: {
    //             GT: {
    //                 courses_avg: 97
    //             }
    //         },
    //         OPTIONS: {
    //             COLUMNS: [
    //                 "courses_dept",
    //                 "courses_avg"
    //             ],
    //             ORDER: "courses_avg"
    //         }
    //     };
    //     try {
    //         return chai.request("http://localhost:4321")
    //             .post("/query")
    //             .send(query)
    //             .then(function (res: Response) {
    //                 // some logging here please!
    //                 expect(res.status).to.be.equal(200);
    //             })
    //             .catch(function (err) {
    //                 // some logging here please!
    //                 Log.info(err);
    //                 expect.fail();
    //             });
    //     } catch (err) {
    //         // and some more logging here!
    //         Log.error(err);
    //     }
    // });
    //
    // it("POST test for courses dataset - fail", function () {
    //     let query: any = {
    //         WHERE: {
    //             G: {
    //                 courses_avg: 97
    //             }
    //         },
    //         OPTIONS: {
    //             COLUMNS: [
    //                 "courses_dept",
    //                 "courses_avg"
    //             ],
    //             ORDER: "courses_avg"
    //         }
    //     };
    //     try {
    //         return chai.request("http://localhost:4321")
    //             .post("/query")
    //             .send(query)
    //             .then(function (res: Response) {
    //                 // some logging here please!
    //                 expect.fail();
    //             })
    //             .catch(function (err) {
    //                 // some logging here please!
    //                 expect(err.status).to.be.equal(400);
    //             });
    //     } catch (err) {
    //         // and some more logging here!
    //         Log.error(err);
    //     }
    // });

    //
    // it("PUT test for courses dataset - sucess - rooms", function () {
    //     try {
    //         return chai.request("http://localhost:4321")
    //             .put("/dataset/rooms/rooms")
    //             .send(fs.readFileSync("./test/data/rooms.zip"))
    //             .set("Content-Type", "application/x-zip-compressed")
    //             .then(function (res: Response) {
    //                 // some logging here please!
    //                 expect(res.status).to.be.equal(200);
    //             })
    //             .catch(function (err) {
    //                 // some logging here please!
    //                 Log.info(err);
    //                 expect.fail();
    //             });
    //     } catch (err) {
    //         // and some more logging here!
    //         Log.error(err);
    //     }
    // });
    //
    // // it("PUT test for courses dataset - fail - added dataset", function () {
    // //     try {
    // //         return chai.request("http://localhost:4321")
    // //             .put("/dataset/coursesSmall/courses")
    // //             .send("./test/data/coursesSmall.zip")
    // //             .set("Content-Type", "application/x-zip-compressed")
    // //             .then(function (res: Response) {
    // //                 // some logging here please!
    // //                 expect.fail();
    // //             })
    // //             .catch(function (err) {
    // //                 // some logging here please!
    // //                 Log.info(err);
    // //                 expect(err.status).to.be.equal(400);
    // //             });
    // //     } catch (err) {
    // //         // and some more logging here!
    // //         Log.error(err);
    // //     }
    // // });
    // //
    // // it("PUT test for courses dataset - fail - invalid dataset id", function () {
    // //     try {
    // //         return chai.request("http://localhost:4321")
    // //             .put("/dataset/_/courses")
    // //             .send("./test/data/coursesSmall.zip")
    // //             .set("Content-Type", "application/x-zip-compressed")
    // //             .then(function (res: Response) {
    // //                 // some logging here please!
    // //                 expect.fail();
    // //             })
    // //             .catch(function (err) {
    // //                 // some logging here please!
    // //                 Log.info(err);
    // //                 expect(err.status).to.be.equal(400);
    // //             });
    // //     } catch (err) {
    // //         // and some more logging here!
    // //         Log.error(err);
    // //     }
    // // });
    //
    // it("DEL test for courses dataset - success", function () {
    //     try {
    //         return chai.request("http://localhost:4321")
    //             .del("/dataset/courses")
    //             .then(function (res: Response) {
    //                 // some logging here please!
    //                 expect(res.status).to.be.equal(200);
    //             })
    //             .catch(function (err) {
    //                 // some logging here please!
    //                 Log.info(err);
    //                 expect.fail();
    //             });
    //     } catch (err) {
    //         // and some more logging here!
    //     }
    // });
    //
    // it("DEL test for courses dataset - fail - not added dataset 404", function () {
    //     try {
    //         return chai.request("http://localhost:4321")
    //             .del("/dataset/notexist")
    //             .then(function (res: Response) {
    //                 // some logging here please!
    //                 expect.fail();
    //             })
    //             .catch(function (err) {
    //                 // some logging here please!
    //                 Log.info(err);
    //                 expect(err.status).to.be.equal(404);
    //             });
    //     } catch (err) {
    //         // and some more logging here!
    //     }
    // });
    //
    // it("DEL test for courses dataset - fail - invalid dataset id 400", function () {
    //     try {
    //         return chai.request("http://localhost:4321")
    //             .del("/dataset/_")
    //             .then(function (res: Response) {
    //                 // some logging here please!
    //                 expect.fail();
    //             })
    //             .catch(function (err) {
    //                 // some logging here please!
    //                 Log.info(err);
    //                 expect(err.status).to.be.equal(400);
    //             });
    //     } catch (err) {
    //         // and some more logging here!
    //     }
    // });

    // The other endpoints work similarly. You should be able to find all instructions at the chai-http documentation
});
