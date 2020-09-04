'use strict'

function parsePayload(payload) {
    let parsePayload

    if(payload instanceof Buffer) {
        parsePayload = payload.toString()
    }

    try {
        parsePayload = JSON.parse(parsePayload)
    } catch (err) {
        parsePayload = null
    }

    return parsePayload
}

module.exports = parsePayload