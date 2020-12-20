"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const restify = require("restify");
const Util_1 = require("../Util");
const InsightFacade_1 = require("../controller/InsightFacade");
const IInsightFacade_1 = require("../controller/IInsightFacade");
class Server {
    constructor(port) {
        Util_1.default.info("Server::<init>( " + port + " )");
        this.port = port;
    }
    stop() {
        Util_1.default.info("Server::close()");
        const that = this;
        return new Promise(function (fulfill) {
            that.rest.close(function () {
                fulfill(true);
            });
        });
    }
    start() {
        const that = this;
        return new Promise(function (fulfill, reject) {
            try {
                Util_1.default.info("Server::start() - start");
                that.rest = restify.createServer({
                    name: "insightUBC",
                });
                that.rest.use(restify.bodyParser({ mapFiles: true, mapParams: true }));
                that.rest.use(function crossOrigin(req, res, next) {
                    res.header("Access-Control-Allow-Origin", "*");
                    res.header("Access-Control-Allow-Headers", "X-Requested-With");
                    return next();
                });
                that.rest.get("/echo/:msg", Server.echo);
                that.rest.put("/dataset/:id/:kind", Server.putDataset);
                that.rest.del("/dataset/:id", Server.deleteDataset);
                that.rest.post("/query", Server.postQuery);
                that.rest.get("/datasets", Server.getDatasets);
                that.rest.get("/.*", Server.getStatic);
                that.rest.listen(that.port, function () {
                    Util_1.default.info("Server::start() - restify listening: " + that.rest.url);
                    fulfill(true);
                });
                that.rest.on("error", function (err) {
                    Util_1.default.info("Server::start() - restify ERROR: " + err);
                    reject(err);
                });
            }
            catch (err) {
                Util_1.default.error("Server::start() - ERROR: " + err);
                reject(err);
            }
        });
    }
    static echo(req, res, next) {
        Util_1.default.trace("Server::echo(..) - params: " + JSON.stringify(req.params));
        try {
            const response = Server.performEcho(req.params.msg);
            Util_1.default.info("Server::echo(..) - responding " + 200);
            res.json(200, { result: response });
        }
        catch (err) {
            Util_1.default.error("Server::echo(..) - responding 400");
            res.json(400, { error: err });
        }
        return next();
    }
    static performEcho(msg) {
        if (typeof msg !== "undefined" && msg !== null) {
            return `${msg}...${msg}`;
        }
        else {
            return "Message not provided";
        }
    }
    static getStatic(req, res, next) {
        const publicDir = "frontend/public/";
        Util_1.default.trace("RoutHandler::getStatic::" + req.url);
        let path = publicDir + "index.html";
        if (req.url !== "/") {
            path = publicDir + req.url.split("/").pop();
        }
        fs.readFile(path, function (err, file) {
            if (err) {
                res.send(500);
                Util_1.default.error(JSON.stringify(err));
                return next();
            }
            res.write(file);
            res.end();
            return next();
        });
    }
    static putDataset(req, res, next) {
        Util_1.default.trace("Server::put(..) - params: " + JSON.stringify(req.params));
        try {
            let id = req.params.id;
            let kind = req.params.kind;
            if (kind === "courses") {
                kind = IInsightFacade_1.InsightDatasetKind.Courses;
            }
            else if (kind === "rooms") {
                kind = IInsightFacade_1.InsightDatasetKind.Rooms;
            }
            else {
                kind = "invalid";
            }
            let content = req.body.toString("base64");
            Server.if.addDataset(id, content, kind).then((ret) => {
                Util_1.default.info("Server::put(..) - responding 200");
                res.json(200, { result: ret });
                return next();
            }).catch((err) => {
                Util_1.default.error("Server::put(..) - responding 400 " + err.message);
                res.json(400, { error: err.message });
                return next();
            });
        }
        catch (err) {
            Util_1.default.error("Server::put(..) - responding 400");
            res.json(400, { error: err });
            return next();
        }
    }
    static deleteDataset(req, res, next) {
        Util_1.default.trace("Server::delete(..) - params: " + JSON.stringify(req.params));
        try {
            let id = req.params.id;
            Server.if.removeDataset(id).then((ret) => {
                Util_1.default.info("Server::delete(..) - responding 200");
                res.json(200, { result: ret });
                return next();
            }).catch((err) => {
                if (err instanceof IInsightFacade_1.InsightError) {
                    Util_1.default.error("Server::delete(..) - responding 400");
                    res.json(400, { error: err.message });
                }
                else if (err instanceof IInsightFacade_1.NotFoundError) {
                    Util_1.default.error("Server::delete(..) - responding 404");
                    res.json(404, { error: err.message });
                }
                return next();
            });
        }
        catch (err) {
            Util_1.default.error("Server::delete(..) - responding 400");
            res.json(400, { error: err });
            return next();
        }
    }
    static postQuery(req, res, next) {
        Util_1.default.trace("Server::post(..)");
        try {
            let queryStr = req.body;
            if (typeof queryStr === "string") {
                queryStr = JSON.parse(queryStr);
            }
            Server.if.performQuery(queryStr).then((ret) => {
                Util_1.default.info("Server::post(..) - responding 200");
                res.json(200, { result: ret });
                return next();
            }).catch((err) => {
                Util_1.default.info("Server::post(..) - responding 400");
                res.json(400, { result: err.message });
                return next();
            });
        }
        catch (err) {
            Util_1.default.error("Server::post(..) - responding 400");
            res.json(400, { error: err });
            return next();
        }
    }
    static getDatasets(req, res, next) {
        Util_1.default.trace("Server::get(..)");
        try {
            Server.if.listDatasets().then((datasets) => {
                Util_1.default.info("Server::get(..) - responding 200");
                res.json(200, { result: datasets });
                return next();
            });
        }
        catch (err) {
            Util_1.default.error("Server::get(..) - responding 400");
            res.json(400, { error: err });
            return next();
        }
    }
}
exports.default = Server;
Server.if = new InsightFacade_1.default();
//# sourceMappingURL=Server.js.map