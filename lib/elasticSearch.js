/**
 * Created by quanpower on 14-8-21.
 */

var config = require('./../config');

if(config.elasticSearch){
    var elasticsearch = require('elasticsearch');
    var client = new elasticsearch.Client({
        host: config.elasticSearch.host + ':' + config.elasticSearch.port
    });
    module.exports = client;
}
