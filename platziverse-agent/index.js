'use strict'

const debug = require('debug')('platziverse:agent')
const os = require('os')
const util = require('util')
const mqtt = require('mqtt')
const defaults = require('defaults')
const EventEmmitter = require('events')
const {
    utils: { parsePayload }
  } = require('platziverse-tools')
const uuid = require('uuid')



const options = {
    name: 'untitled',
    username: 'platzi',
    interval: 5000,
    mqtt: {
        host: 'mqtt://localhost'
    }
}


class PlatziverseAgent extends EventEmmitter {
    constructor (opts) {
        super()
        this._options = defaults(opts, options)
        this._started = false
        this._timer = null
        this._client = null
        this._AgentId = null
        this._Metric = new Map()
    }

    addMetric(type, fn) {
        this._Metric.set(type, fn)
    }

    removeMetric(type) {
        this._Metric.delete(type)
    }

    connect() {
        if(!this._started) {
            const opts = this._options
            this._client = mqtt.connect(opts.mqtt.host)
            this._started = true

            this._client.subscribe('agent/message')
            this._client.subscribe('agent/connected')
            this._client.subscribe('agent/disconnected')

            this._client.on('connect', () => {
                this._AgentId = uuid.v4()

                this.emit('connected', this._AgentId)

                this._timer = setInterval(async() => {
                    if(this._Metric.size > 0) {
                        const message = {
                            agent: {
                                uuid: this._AgentId,
                                username: opts.username,
                                name: opts.name,
                                hostname: os.hostname() || 'localhost',
                                pid: process.pid
                            },
                            metrics : [],
                            timesstamp: new Date().getTime()
                        }

                        for (let [metric, fn] of this._Metric) {
                            if(fn.length === 1) {
                                fn = util.promisify(fn)
                            }
    
                            message.metrics.push({
                                type: metric,
                                value: await Promise.resolve(fn())
                            })
                        }
                        debug('Sending', message)
                        this._client.publish('agent/message', JSON.stringify(message))
                        this.emit('message', message)
                    }
                }, opts.interval )
            })

            this._client.on('message', (topic, payload) => {
                payload = parsePayload(payload)

                let broadcast = false
                switch (topic) {
                    case 'agent/connected':
                    case 'agent/disconnected':
                    case 'agent/message':

                    broadcast = payload && payload.agent && payload.agent.uuid != this._AgentId
                    break
                }

                if(broadcast) {
                    this.emit(topic, payload)
                }
            })

            this._client.on('error', () => this.disconnect())
        }
    }

    disconnect(){
        if(!this._started) {
            clearInterval(this._timer)
            this._started = false
            this.emit('disconnected')
            this._client.end()
        }
    }
}

module.exports = PlatziverseAgent