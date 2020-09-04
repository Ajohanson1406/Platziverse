'use strict'

//Utils function
const handleError = require('./utils/handleError')
const handleFatalError = require('./utils/handleFatalError')
const parsePayload = require('./utils/parsePayload');

//Config obj

const config = require('./config')

module.exports = {
    config,
    utils: {
        handleError,
        handleFatalError,
        parsePayload,
        config
    }
}