'use strict'

const chalk = require('chalk')
const http = require('http')
const express = require('express')

const port = process.env.PORT || 3000
const app = express()
const server = http.createServer(app)

server.listen(port, () => {
  console.log(`${chalk.green('Server is running in port 3000')}`)
})
