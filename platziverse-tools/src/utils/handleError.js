'use strict'

const chalk = require('chalk')

function handleError(err) {
    console.error(`${chalk.red('[error]:')} ${err.message}`)
    console.error(err.stack)
}

module.exports = handleError