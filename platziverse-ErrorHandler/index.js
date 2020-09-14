'use strict'

//Config Function
const AgentNotFoundError = require('./config/AgetnNotFound')
const MetricNotFoundError = require('./config/MetricNotFoundError')
const NotAuthorizedError = require('./config/NotAuthorizedError')
const NotAuthenticatedError = require('./config/NotAuthenticatedError')

module.exports = {
    config: {
        AgentNotFoundError,
        MetricNotFoundError,
        NotAuthenticatedError,
        NotAuthorizedError

    }
}