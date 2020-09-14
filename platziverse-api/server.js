'use strict'

const debug = require('debug')('platizverse:api')
const chalk = require('chalk')
const http = require('http')
const express = require('express')

const {
    utils: { handleFatalError }
  } = require('platziverse-tools')

const api = require('./api')

const port = process.env.PORT || 3000
const app = express()
const server = http.createServer(app)

app.use('/api', api)

//Express Error Handler

app.use((err, req, res, next) => {
    debug(`Error: ${err.message}`)

    if(err.message.match(/not found/)) {
        return res.status(404).send({ error: err.message})
    }

    res.status(500).send({error: err.message})
})

process.on('uncaughtException', handleFatalError)
process.on('unhandledRejection', handleFatalError)

server.listen(port, () => {
  console.log(`${chalk.green('Server is running in port 3000')}`)
})
