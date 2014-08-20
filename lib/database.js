/**
 * Created by quanpower on 14-8-20.
 */

var config = require('./../config');
var path = require('path');

if(config.mongo && config.mongo.databaseUrl){

    var mongojs = require('mongojs');
    var db = mongojs(config.mongo.databaseUrl);
    module.exports = {
        devices: db.collection('devices'),
        events: db.collection('events'),
        data: db.collection('data')
    };

} else {

    var Datastore = require('nedb');//node embedded database
    var devices = new Datastore({
            filename: path.join(__dirname, '/../devices.db'),
            autoload: true }
    );
    var events = new Datastore({
            filename: path.join(__dirname, '/../events.db'),
            autoload: true }
    );
    var data = new Datastore({
            filename: path.join(__dirname, '/../data.db'),
            autoload: true }
    );

    module.exports = {
        devices: devices,
        events: events,
        data: data
    };
}
