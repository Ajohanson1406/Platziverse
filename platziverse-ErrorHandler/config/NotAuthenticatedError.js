'use strict'

class NotAuthenticatedError extends Error {
  constructor (givenUuid, ...params) {
    super(...params)

    this.givenUuid = givenUuid
    this.code = 401

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, NotAuthenticatedError)
    }
    this.message = 'User is not authenticated'
  }
}

module.exports = NotAuthenticatedError
