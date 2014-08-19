/**
 * Created by quanpower on 14-8-19.
 */

module.exports = {
    port: 3000,
    //tls: {
    //  sslPort: 443,
    //  cert: "/certs/server.crt",
    //  key: "/certs/server.key"
    //},
    log: true,
    // MongoDB is optional. Comment this section out if not desired.
    mongo: {
        databaseUrl: "mongodb://user:pass@adam.mongohq.com:1337/smartlinkcloud"
    },
    // REDIS is optional. It's used for scaling session and sockets horizontally. Comment this section out if not desired.
    redis: {
        host: "127.0.0.1",
        port: "6379",
        password: "abcdef"
    },
    // ElasticSearch is optional. It's used to analyze data. Comment this section out if not desired.
    elasticSearch: {
        host: "localhost",
        port: "9200"
    },
    // this smartlinkcloud cloud's uuid
    uuid: 'xxxx-my-cloud's-uuid-xxxx',
        token: 'xxx ---  my token ---- xxxx',
    broadcastActivity: false,
    // if you want to resolve message up to another smartlinkcloud server:
    parentConnection: {
    uuid: 'xxxx-my-uuid-on-parent-server-xxxx',
        token: 'xxx-my-token-on-parent-server-xxxx',
        server: 'smartlinkcloud.im',
        port: 80
},
rateLimits: {
    message: 10, // 10 transactions per user per second
        data: 10, // 10 transactions per user per second
        connection: 2, // 2 transactions per IP per second
        query: 2, // 2 transactions per user per second
        whoami: 10, // 10 transactions per user per second
        unthrottledIps: ["54.186.134.252"] // allow unlimited transactions from these IP addresses
},
plivo: {
    authId: "abc",
        authToken: "123"
},
urbanAirship: {
    key: "abc",
        secret: "123"
},
coap: {
    port: 5683,
        host: "localhost"
},
//these settings are for the mqtt server, and smartlinkcloud mqtt client
mqtt: {
    databaseUrl: "mongodb://user:pass@adam.mongohq.com:1337/smartlinkcloud",
        port: 1883,
        smartlinkcloudPass: "Very big random password 34lkj23orfjvi3-94ufpvuha4wuef-a09v4ji0rhgouj"
},
yo: {
    token: "your yo token from http://yoapi.justyo.co/"
}
};
