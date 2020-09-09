'use strict'

const debug = require('debug')('platziverse:agent')
const mqtt = require('mqtt')
const defaults = require('defaults')
const EventEmmitter = require('events')


const options = {
    name: 'untiled',
    username: 'platzi',
    interval: 5000,
    mqtt: {
        host: 'mqtt://localhost'
    }
}


class PlatziverseAgent extends EventEmmitter {
    constructor (opts) {
        super()
        this._options = defaults(opts)
        this._started = false
        this._timer = null
        this._client = null
    }

    connect() {
        if(!this._started) {
            const opts = this._options
            this._client = mqtt.connect(opts.mqtt.host)
            this._started = true

            this._client.subscribe('agent/message')
            this._client.subscribe('agent/connected')
            this._client.subscribe('agent/disconnected')

            this.emit('connected')

            const opts = this._options
            this._timer = setInterval(() => {
                this.emit('agent/message', 'this is a message')
            }, opts.interval )
        }
    }

    disconnect(){
        if(!this._started) {
            clearInterval(this._timer)
            this._started = false
            this.emit('disconnected')
        }
    }
}

module.exports = PlatziverseAgent