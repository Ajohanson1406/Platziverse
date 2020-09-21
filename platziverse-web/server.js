'use strict'

const debug = require('debug')('platziverse:web')
const chalk = require('chalk')
const http = require('http')
const path = require('path')
const express = require('express')
const socketio = require('socket.io')

const { utils: { handleFatalError, pipe } } = require('platziverse-tools')
const PlatziverseAgent = require('platziverse-agent')

const port = process.env.PORT || 8080
const app = express()
const server = http.createServer(app)

const io = socketio(server)
const agent = new PlatziverseAgent()

app.use(express.static(path.join(__dirname, 'public')))

// Socket.io // Web Socket

io.on('connect', socket => {
    debug(`Connected ${socket.id}`)

    pipe(agent, socket)
})

if(!module.parent) {
    process.on('uncaughtException', handleFatalError)
    process.on('unhandledRejection', handleFatalError)
}

server.listen(port, () => {
    console.log(`${chalk.green('platziverse-web')} Server is listening in 8080`)
    agent.connect()
})

