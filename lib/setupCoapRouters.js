/**
 * Created by quanpower on 14-8-23.
 */

var JSONStream = require('JSONStream');

var whoAmI = require('./whoAmI');
var config = require('../config');
var getData = require('./getData');
var logData = require('./logData');
var logEvent = require('./logEvent');
var register = require('./register');
var subscribe = require('./subscribe');
var getDevices = require('./getDevices');
var authDevice = require('./authDevice');
var unregister = require('./unregister');
var getSystemStatus = require('./getSystemStatus');
var updateFromClient = require('./updateFromClient');
var _ = require('lodash');

//psuedo middleware
function authorizeRequest(req, res, callback){
    var uuid = _.find(req.options, {name:'98'});
    var token = _.find(req.options, {name:'99'});
    if (uuid && uuid.value) {
        uuid = uuid.value.toString();
    }
    if (token && token.value) {
        token = token.value.toString();
    }
    authDevice(uuid, token, function (auth) {
        if (auth.authenticate) {
            callback(auth.device);
        }else{
            res.statusCode = 401;
            res.json({error: 'unauthorized'});
        }
    });
}

function errorResponse(error, res){
    if(error.code){
        res.statusCode = error.code;
        res.json(error);
    }else{
        res.statusCode = 400;
        res.json(400, error);
    }
}

function setupCoapRoutes(coapRouter, skynet){

    // coap get coap://localhost/status
    coapRouter.get('/status', function (req, res) {
        console.log(req);
        // if(config.broadcastActivity){
        //   skynet.sendActivity({ipAddress: req.rsinfo.address}, function(result){
        //   });
        // }
        skynet.sendActivity({ipAddress: req.rsinfo.address});

        getSystemStatus(function (data) {
            console.log(data);
            if(data.error) {
                res.statusCode = data.error.code;
                res.json(data.error);
            } else {
                res.statusCode = 200;
                res.json(data);
            }
        });
    });


    // coap get coap://localhost/ipaddress
    coapRouter.get('/ipaddress', function (req, res) {
        // if(config.broadcastActivity){
        //   skynet.sendActivity({ipAddress: req.rsinfo.address}, function(result){
        //   });
        // }
        skynet.sendActivity({ipAddress: req.rsinfo.address});

        res.json({ipAddress: req.rsinfo.address});
    });

    coapRouter.get('/devices', function (req, res) {
        console.log(req);
        authorizeRequest(req, res, function(fromDevice){
            // req.ipAddress = req.rsinfo.address
            // skynet.sendActivity(getActivity('devices',req, fromDevice));
            skynet.sendActivity({ipAddress: req.rsinfo.address});

            getDevices(fromDevice, req.query, false, function(data){
                if(data.error){
                    errorResponse(data.error, res);
                }else{
                    res.json(data);
                }
            });
        });
    });


    // coapRouter.get('/devices', function (req, res) {
    //   authorizeRequest(req, res, function(fromDevice){

    //     if(config.broadcastActivity){
    //       skynet.sendActivity({ipAddress: req.rsinfo.address}, function(result){
    //       });
    //     }

    //     authDevice(req.params.uuid, req.params.token, function (auth) {
    //       if (auth.authenticate) {
    //         getDevices(auth.device, req.query, false, function (data) {
    //           if(data.error) {
    //             res.statusCode = data.error.code;
    //             res.json(data.error);
    //           } else {
    //             res.json(data);
    //           }
    //         });
    //       }else{
    //         res.statusCode = 401;
    //         res.json({error: 'unauthorized'});
    //       }
    //     });

    //   });

    // });


    coapRouter.post('/devices', function (req, res) {
        // if(config.broadcastActivity){
        //   skynet.sendActivity({ipAddress: req.rsinfo.address}, function(result){
        //   });
        // }
        console.log(req);
        skynet.sendActivity({ipAddress: req.rsinfo.address});

        req.params.ipAddress = req.rsinfo.address
        register(req.params, function (data) {
            console.log(data);
            if(data.error) {
                res.statusCode = data.error.code;
                res.json(data.error);
            } else {
                res.json(data);
            }

        });
    });

    // // coap post coap://localhost/devices -p "devices=a1634681-cb10-11e3-8fa5-2726ddcf5e29&payload=test"
    // coapRouter.get('/whoAmI/:uuid', function (req, res) {
    //   if(config.broadcastActivity){
    //     skynet.sendActivity({ipAddress: req.rsinfo.address}, function(result){
    //     });
    //   }

    //   whoAmI(req.params.uuid, false, function (data) {
    //     console.log(data);
    //     if(data.error) {
    //       res.statusCode = data.error.code;
    //       res.json(data.error);
    //     } else {
    //       res.json(data);
    //     }

    //   });
    // });

    // coap get coap://localhost/devices/a1634681-cb10-11e3-8fa5-2726ddcf5e29
    coapRouter.get('/devices/:uuid', function (req, res) {
        // if(config.broadcastActivity){
        //   skynet.sendActivity({ipAddress: req.rsinfo.address}, function(result){
        //   });
        // }

        // whoAmI(req.params.uuid, false, function (data) {
        //   console.log(data);
        //   if(data.error) {
        //     res.statusCode = data.error.code;
        //     res.json(data.error);
        //   } else {
        //     res.json(data);
        //   }

        // });

        authorizeRequest(req, res, function(fromDevice){
            // skynet.sendActivity(getActivity('devices',req, fromDevice));
            skynet.sendActivity({ipAddress: req.rsinfo.address});
            getDevices(fromDevice, {uuid: req.params.uuid}, false, function(data){
                if(data.error){
                    errorResponse(data.error, res);
                }else{
                    res.json(data);
                }
            });
        });


    });


    coapRouter.put('/devices/:uuid', function (req, res) {
        // if(config.broadcastActivity){
        //   skynet.sendActivity({ipAddress: req.rsinfo.address}, function(result){
        //   });
        // }

        // authDevice(req.params.uuid, req.params.token, function (auth) {
        //   if (auth.authenticate) {
        //     updateFromClient(auth.device, req.params, function(result){
        //       if(result.error){
        //         res.statusCode = result.error.code;
        //         res.json(result.error);
        //       }else{
        //         res.json(result);
        //       }
        //     });
        //   }else{
        //     res.statusCode = 401;
        //     res.json({error: 'unauthorized'});
        //   }
        // });

        authorizeRequest(req, res, function(fromDevice){
            // skynet.sendActivity(getActivity('devices',req, fromDevice));
            skynet.sendActivity({ipAddress: req.rsinfo.address});
            updateFromClient(fromDevice, req.params, function(result){
                if(result.error){
                    errorResponse(result.error, res);
                }else{
                    res.json(result);
                }
            });
        });


    });


    coapRouter.delete('/devices/:uuid', function (req, res) {
        // if(config.broadcastActivity){
        //   skynet.sendActivity({ipAddress: req.rsinfo.address}, function(result){
        //   });
        // }

        // unregister(req.params.uuid, req.params, function (data) {
        //   console.log(data);
        //   if(data.error) {
        //     res.statusCode = data.error.code;
        //     res.json(data.error);
        //   } else {
        //     res.json(data);
        //   }
        // });

        authorizeRequest(req, res, function(fromDevice){
            // skynet.sendActivity(getActivity('devices',req, fromDevice));
            skynet.sendActivity({ipAddress: req.rsinfo.address});
            unregister(fromDevice, req.params.uuid, function(err, data){
                console.log(err, data);
                if(err){
                    errorResponse(err, res);
                } else {
                    res.json(data);
                }
            });
        });

    });


    coapRouter.get('/mydevices', function (req, res) {
        // if(config.broadcastActivity){
        //   skynet.sendActivity({ipAddress: req.rsinfo.address}, function(result){
        //   });
        // }

        // authDevice(req.params.uuid, req.query.token, function (auth) {
        //   if (auth.authenticate) {
        //     req.query.owner = req.params.uuid;
        //     delete req.query.token;
        //     getDevices(auth.device, req.query, true, function (data) {
        //       console.log(data);
        //       if(data.error) {
        //         res.statusCode = data.error.code;
        //         res.json(data.error);
        //       } else {
        //         res.json(data);
        //       }
        //     });
        //   } else {
        //     console.log("Device not found or token not valid");
        //     res.statusCode = 404;
        //     res.json({error: "Device not found or token not valid"});

        //   }
        // });

        authorizeRequest(req, res, function(fromDevice){
            // skynet.sendActivity(getActivity('mydevices',req, fromDevice));
            skynet.sendActivity({ipAddress: req.rsinfo.address});
            getDevices(fromDevice, {owner: fromDevice.uuid}, true, function(data){
                console.log(data);
                if(data.error){
                    errorResponse(data.error, res);
                } else {
                    res.json(data);
                }
            });
        });


    });


    // // coap get coap://localhost/authenticate/81246e80-29fd-11e3-9468-e5f892df566b?token=5ypy4rurayktke29ypbi30kcw5ovfgvi
    // coapRouter.get('/authenticate/:uuid', function(req, res){
    //   if(config.broadcastActivity){
    //     skynet.sendActivity({ipAddress: req.rsinfo.address}, function(result){
    //     });
    //   }

    //   authDevice(req.params.uuid, req.query.token, function(auth){
    //     if (auth.authenticate){
    //       res.json({uuid:req.params.uuid, authentication: true});
    //     } else {
    //       var regdata = {
    //         "error": {
    //           "message": "Device not found or token not valid",
    //           "code": 404
    //         }
    //       };
    //       res.statusCode = regdata.error.code;
    //       res.json({code: regdata.error.code, payload: {uuid:req.params.uuid, authentication: false}});

    //     }
    //   });
    // });


    // coapRouter.get('/gateway/:uuid', function (req, res) {
    //   if(config.broadcastActivity){
    //     skynet.sendActivity({ipAddress: req.rsinfo.address}, function(result){
    //     });
    //   }

    //   whoAmI(req.params.uuid, false, function (data) {
    //     console.log(data);
    //     res.statusCode = 302;
    //     if(data.error) {
    //       res.json({
    //         'location': 'http://skynet.im'
    //       });
    //     } else {
    //       res.json({
    //         'location': 'http://' + data.localhost + ":" + data.port
    //       });
    //     }
    //   });
    // });


    // echo '{"uuid": "ad698900-2546-11e3-87fb-c560cb0ca47b", "token": "g6jmsla14j2fyldi7hqijbylwmrysyv5", "method": "getSubdevices"}' | coap post 'coap://localhost:3000/gatewayConfig'
    coapRouter.post('/gatewayConfig', function(req, res){
        // if(config.broadcastActivity){
        //   skynet.sendActivity({ipAddress: req.rsinfo.address}, function(result){
        //   });
        // }

        // var body;
        // try {
        //   body = JSON.parse(req.body);
        // } catch(err) {
        //   console.log('error parsing', err, req.body);
        //   body = {};
        // }

        // skynet.gatewayConfig(body, function(result){
        //   if(result && result.error && result.error.code){
        //     res.statusCode = result.error.code;
        //     res.json(result.error);
        //   }else{
        //     res.json(result);
        //   }
        // });

        // logEvent(300, body);

        authorizeRequest(req, res, function(fromDevice){
            skynet.sendActivity({ipAddress: req.rsinfo.address});
            var body;
            try {
                body = JSON.parse(req.body);
            } catch(err) {
                console.log('error parsing', err, req.body);
                body = {};
            }

            skynet.gatewayConfig(body, function(result){
                if(result && result.error){
                    errorResponse(result.error, res);
                }else{
                    res.json(result);
                }
            });

            logEvent(300, body);
        });

    });


    // coap get coap://localhost/events/196798f1-b5d8-11e3-8c93-45a0c0308eaa -p "token=00cpk8akrmz8semisbebhe0358livn29"
    coapRouter.get('/events/:uuid', function (req, res) {
        // if(config.broadcastActivity){
        //   skynet.sendActivity({ipAddress: req.rsinfo.address}, function(result){
        //   });
        // }

        // console.log(req);
        // authDevice(req.params.uuid, req.params.token, function (auth) {
        //   if (auth.authenticate) {
        //     require('./lib/getEvents')(req.params.uuid, function (data) {
        //       console.log(data);
        //     if(data.error){
        //       res.statusCode = data.error.code;
        //       res.json(data.error);
        //     } else {
        //       res.json(data);
        //     }
        //     });
        //   } else {
        //     console.log("Device not found or token not valid");
        //     res.statusCode = 404;
        //     res.json({error: "Device not found or token not valid"});
        //   }
        // });

        authorizeRequest(req, res, function(fromDevice){
            skynet.sendActivity({ipAddress: req.rsinfo.address});
            logEvent(201, {fromUuid: fromDevice, uuid: req.params.uuid});
            getEvents(fromDevice.uuid, function(data){
                console.log(data);
                // io.sockets.in(req.params.uuid).emit('message', data)
                if(data.error){
                    errorResponse(data.error, res);
                } else {
                    res.json(data);
                }
            });
        });


    });


    // coap post coap://localhost/data/196798f1-b5d8-11e3-8c93-45a0c0308eaa -p "token=00cpk8akrmz8semisbebhe0358livn29&temperature=43"
    coapRouter.post('/data/:uuid', function(req, res){
        // if(config.broadcastActivity){
        //   skynet.sendActivity({ipAddress: req.rsinfo.address}, function(result){
        //   });
        // }

        // authDevice(req.params.uuid, req.query.token, function(auth){
        //   if (auth.authenticate){

        //     delete req.params.token;

        //     if(req.connection){
        //       req.params.ipAddress = req.connection.remoteAddress;
        //     }
        //     logData(req.params, function(data){
        //       console.log(data);
        //       if(data.error){
        //         res.statusCode = data.error.code;
        //         res.json(data.error);
        //       } else {

        //         // Send messsage regarding data update
        //         var message = {};
        //         message.payload = req.params;
        //         message.devices = req.params.uuid;

        //         console.log('message: ' + JSON.stringify(message));

        //         skynet.sendMessage(auth.device, message);

        //         res.json(data);
        //       }
        //     });

        //   } else {
        //     var regdata = {
        //       error: {
        //         "message": "Device not found or token not valid",
        //         "code": 404
        //       }
        //     };
        //     res.statusCode = regdata.error.code;
        //     res.json(regdata.error.code, {uuid:req.params.uuid, authentication: false});
        //   }
        // });

        authorizeRequest(req, res, function(fromDevice){
            skynet.sendActivity({ipAddress: req.rsinfo.address});
            delete req.params.token;

            req.params.ipAddress = getIP(req);
            logData(req.params, function(data){
                console.log(data);
                // io.sockets.in(data.uuid).emit('message', data)
                if(data.error){
                    errorResponse(data.error, res);
                } else {

                    // Send messsage regarding data update
                    var message = {};
                    message.payload = req.params;
                    // message.devices = req.params.uuid;
                    message.devices = "*";

                    console.log('message: ' + JSON.stringify(message));

                    skynet.sendMessage(fromDevice, message);

                    res.json(data);
                }
            });
        });

    });


    // coap get coap://localhost/data/196798f1-b5d8-11e3-8c93-45a0c0308eaa -p "token=00cpk8akrmz8semisbebhe0358livn29&limit=1"
    coapRouter.get('/data/:uuid', function(req, res){
        // if(config.broadcastActivity){
        //   skynet.sendActivity({ipAddress: req.rsinfo.address}, function(result){
        //   });
        // }

        // console.log(req.params);
        // console.log(req.query);

        // authDevice(req.params.uuid, req.query.token, function(auth){
        //   if (auth.authenticate == true){
        //     if(req.query.stream){

        //       var foo = JSONStream.stringify(open='\n', sep=',\n', close='\n\n');
        //       foo.on("data", function(data){
        //         console.log('DATA', data);
        //         return data;
        //       });

        //       getData(req)
        //         .pipe(foo)
        //         .pipe(res);

        //     } else {
        //       req.query = req.params;
        //       getData(req, function(data){
        //         console.log(data);
        //         if(data.error){
        //           res.statusCode = data.error.code;
        //           res.json(data.error);
        //         } else {
        //           res.json(data);
        //         }
        //       });
        //     }


        //   } else {
        //     console.log("Device not found or token not valid");
        //     res.statusCode = 404;
        //     res.json({error: "Device not found or token not valid"});

        //   }
        // });

        authorizeRequest(req, res, function(fromDevice){
            skynet.sendActivity({ipAddress: req.rsinfo.address});
            if(req.query.stream){

                var foo = JSONStream.stringify(open='\n', sep=',\n', close='\n\n');
                foo.on("data", function(data){
                    // data = data.toString() + '\r\n';
                    console.log('DATA', data);
                    return data;
                });
                getData(req)
                    .pipe(foo)
                    .pipe(res);

            } else {

                getData(req, function(data){
                    console.log(data);
                    if(data.error){
                        errorResponse(data.error, res);
                    } else {
                        res.json(data);
                    }
                });
            }
        });


    });

    // coap post coap://localhost/messages -p "devices=a1634681-cb10-11e3-8fa5-2726ddcf5e29&payload=test"
    coapRouter.post('/messages', function (req, res, next) {
        console.log(req);
        // if(config.broadcastActivity){
        //   skynet.sendActivity({ipAddress: req.rsinfo.address}, function(result){
        //   });
        // }

        // var body;
        // try {
        //   body = JSON.parse(req.payload);
        // } catch(err) {
        //   body = req.payload;
        // }
        // if (!body.devices){
        //   try {
        //     body = JSON.parse(req.params);
        //   } catch(err) {
        //     body = req.params;
        //   }
        // }
        // var devices = body.devices;
        // var message = {};
        // message.payload = body.payload;
        // message.devices = body.devices;

        // console.log('devices: ' + devices);
        // console.log('payload: ' + JSON.stringify(message));

        // skynet.sendMessage(devices, message);
        // res.json({devices:devices, payload: body.payload});

        // logEvent(300, message);

        authorizeRequest(req, res, function(fromDevice){
            skynet.sendActivity({ipAddress: req.rsinfo.address});
            var body;
            try {
                body = JSON.parse(req.params);
            } catch(err) {
                body = req.params;
            }
            if (!body.devices){
                try {
                    body = JSON.parse(req.params);
                } catch(err) {
                    body = req.params;
                }
            }
            var devices = body.devices;
            var message = {};
            message.payload = body.payload;
            message.devices = body.devices;
            message.subdevice = body.subdevice;
            message.topic = body.topic;

            console.log('payload: ' + JSON.stringify(message));

            skynet.sendMessage(fromDevice, message);
            res.json({devices:devices, subdevice: body.subdevice, payload: body.payload});

            logEvent(300, message);
        });


    });

    coapRouter.get('/subscribe/:uuid', function (req, res) {
        // if(config.broadcastActivity){
        //   skynet.sendActivity({ipAddress: req.rsinfo.address}, function(result){
        //   });
        // }

        // authDevice(req.params.uuid, req.query.token, function (auth) {
        //   console.log('auth', auth);
        //   if (auth.authenticate) {
        //     var foo = JSONStream.stringify(open='\n', sep=',\n', close='\n\n');

        //     subscribe(req.params.uuid)
        //       .pipe(foo)
        //       .pipe(res);

        //   } else {
        //     console.log("Device not found or token not valid");
        //     res.statusCode = 404;
        //     res.json({error: "Device not found or token not valid"});
        //   }
        // });

        authorizeRequest(req, res, function(fromDevice){
            skynet.sendActivity({ipAddress: req.rsinfo.address});
            logEvent(204, {fromUuid: fromDevice, uuid: req.params.uuid});
            var foo = JSONStream.stringify(open='\n', sep=',\n', close='\n\n');
            foo.on("data", function(data){
                console.log(data);
                data = data + '\r\n';
            });
            subscribe(req.params.uuid)
                .pipe(foo)
                .pipe(res);
        });

    });


}

module.exports = setupCoapRoutes;
