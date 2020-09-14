'use strict'

class MetricNotFoundError extends Error {
  constructor (givenUuid, type, ...params) {
    super(...params)

    this.givenUuid = givenUuid
    this.type = type || null
    this.code = 404

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, MetricNotFoundError)
    }
    this.message = (type) ? `Metrics of Agent with UUID ${givenUuid} and type ${type} not 
        found in DB` : `Agent with UUID ${givenUuid} not found in DB`
  }
}

module.exports = MetricNotFoundError
