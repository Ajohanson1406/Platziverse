'use strict'

class NotAuthorizedError extends Error {
  constructor (...params) {
    super(...params)

    this.code = 403

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, NotAuthorizedError)
    }
    this.message = 'this user is not authorized to acces to requested content'
  }
}

module.exports = NotAuthorizedError
