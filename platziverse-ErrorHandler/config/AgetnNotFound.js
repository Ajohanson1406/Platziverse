'use strict'

class AgentNotFoundError extends Error {
  constructor (givenUuid, ...params) {
    super(...params)

    this.givenUuid = givenUuid
    this.code = 404

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AgentNotFoundError)
    }
    this.message = `Agent with UUID ${givenUuid} not found in DB`
  }
}

module.exports = AgentNotFoundError
