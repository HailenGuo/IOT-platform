/**
 * Created by quanpower on 14-8-22.
 */

var config = require('./../config');

var securityModuleName = config.securityImpl || './../lib/simpleAuth';

module.exports = require(securityModuleName);
