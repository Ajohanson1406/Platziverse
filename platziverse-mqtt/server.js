"use strict"

const net = require('net')
const debug = require('debug')('platziverse:mqtt')
const chalk = require('chalk')

const database = require('plativerse-db')
const { utils: { parsePayload, handleFatalError, handleError}, config } = require('platziverse-tools')

// Aedes is a barebone MQTT server that can run on any stream servers
// See https://github.com/moscajs/aedes
// redisPersistence to make aedes backend with redis
// https://www.npmjs.com/package/aedes-persistence-redis

const redisPersistence = require('aedes-persistence-redis')
const aedes = require('aedes')({
    persistence: redisPersistence({
        port: 6379,
        host: '127.0.0.1',
        family: 4,
        maxSessionDelivery: 100
    })
})

// This is the database setup
const databaseconfig = {
    ...config.db,
    logging: (msg) => debug(msg)
}

// The server is implemented with core module `net` that expose a createServer method
// The net module provides an asynchronous network API for creating stream-based
// TCP or IPC servers (net.createServer()) and clients (net.createConnection()).
// See https://nodejs.org/api/net.html#net_event_connection

const server = ( net.createServer(aedes.handle))

//to store the clients connected

const clients = new Map()

let Agent
let Metric

server.listen(1883, (err) => {
    if(!err) {
        console.log(`${chalk.cyan('[platziverse:mqtt]:')} server is runnig`)
    } else {
        handleFatalError(err)
    }
})
