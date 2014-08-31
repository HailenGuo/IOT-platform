/**
 * Created by quanpower on 14-8-31.
 */

/**
 * Copyright 2013 IBM Corp.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/

var express = require('express');
var util = require('util');
var when = require('when');

var createUI = require("./ui");
var redNodes = require("./nodes");
var comms = require("./comms");

var app = null;
var nodeApp = null;
var server = null;
var settings = null;
var storage = null;

function createServer(_server,_settings) {
    server = _server;
    settings = _settings;
    comms.init(_server,_settings);
    storage = require("./storage");
    app = createUI(settings);
    nodeApp = express();

    app.get("/nodes",function(req,res) {
        res.send(redNodes.getNodeConfigs());
    });

    app.get("/flows",function(req,res) {
        res.json(redNodes.getFlows());
    });

    app.post("/flows",
        express.json(),
        function(req,res) {
            var flows = req.body;
            redNodes.setFlows(flows).then(function() {
                res.send(204);
            }).otherwise(function(err) {
                util.log("[red] Error saving flows : "+err);
                res.send(500,err.message);
            });
        },
        function(error,req,res,next) {
            res.send(400,"Invalid Flow");
        }
    );

    app.post("/nodes",
        express.json(),
        function(req,res) {
            var node = req.body;
            if (!node.file && !node.module) {
                res.send(400,"Invalid request");
                return;
            }
            redNodes.addNode(node).then(function(info) {
                comms.publish("node/added",info,false);
                util.log("[red] Added node types:");
                for (var j=0;j<info.length;j++) {
                    for (var i=0;i<info[j].types.length;i++) {
                        util.log("[red] - "+info[j].types[i]);
                    }
                }
                res.json(info);
            }).otherwise(function(err) {
                res.send(400,err.toString());
            });
        },
        function(err,req,res,next) {
            res.send(400,err);
        }
    );

    app.delete("/nodes/:id",
        function(req,res) {
            var id = req.params.id;
            try {
                var info = redNodes.removeNode(id);
                comms.publish("node/removed",info,false);
                util.log("[red] Removed node types:");
                for (var i=0;i<info.types.length;i++) {
                    util.log("[red] - "+info.types[i]);
                }
                res.json(info);
            } catch(err) {
                res.send(400,err.toString());
            }
        },
        function(err,req,res,next) {
            res.send(400,err);
        }
    );

    app.get("/nodes/:id", function(req,res) {
        var id = req.params.id;
        var config = redNodes.getNodeConfig(id);
        if (config) {
            res.send(config);
        } else {
            res.send(404);
        }
    });

}

function start() {
    var defer = when.defer();

    storage.init(settings).then(function() {
        console.log("\nWelcome to Node-RED\n===================\n");
        if (settings.version) {
            util.log("[red] Version: "+settings.version);
        }
        util.log("[red] Loading palette nodes");
        redNodes.init(settings,storage);
        redNodes.load().then(function() {
            var nodes = redNodes.getNodeList();
            var nodeErrors = nodes.filter(function(n) { return n.err!=null;});
            if (nodeErrors.length > 0) {
                util.log("------------------------------------------");
                if (settings.verbose) {
                    for (var i=0;i<nodeErrors.length;i+=1) {
                        util.log("["+nodeErrors[i].name+"] "+nodeErrors[i].err);
                    }
                } else {
                    util.log("[red] Failed to register "+nodeErrors.length+" node type"+(nodeErrors.length==1?"":"s"));
                    util.log("[red] Run with -v for details");
                }
                util.log("------------------------------------------");
            }
            defer.resolve();

            redNodes.loadFlows();
        });
        comms.start();
    }).otherwise(function(err) {
        defer.reject(err);
    });

    return defer.promise;
}

function stop() {
    redNodes.stopFlows();
    comms.stop();
}

module.exports = {
    init: createServer,
    start: start,
    stop: stop
}

module.exports.__defineGetter__("app", function() { return app });
module.exports.__defineGetter__("nodeApp", function() { return nodeApp });
module.exports.__defineGetter__("server", function() { return server });
