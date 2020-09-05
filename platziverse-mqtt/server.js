'use strict'

const net = require('net')
const debug = require('debug')('platziverse:mqtt')
const chalk = require('chalk')

const database = require('platziverse-db')
const { utils: { parsePayload, handleFatalError, handleError }, config } = require('platziverse-tools')

// Aedes is a barebone MQTT server that can run on any stream servers
// See https://github.com/moscajs/aedes
// redisPersistence to make aedes backend with redis
// https://www.npmjs.com/package/aedes-persistence-redis

const redisPersistence = require('aedes-persistence-redis')
const aedes = require('aedes')({
  persistence: redisPersistence({
    port: 6379,
    host: 'localhost',
    family: 4,
    maxSessionDelivery: 100
  })
})

// This is the database setup
const databaseconfig = {
  ...config.db,
  logging: (msg) => debug(msg)
}

// The server is implemented with core module `net` that expose a createServer method
// The net module provides an asynchronous network API for creating stream-based
// TCP or IPC servers (net.createServer()) and clients (net.createConnection()).
// See https://nodejs.org/api/net.html#net_event_connection

const server = (net.createServer(aedes.handle))

// to store the clients connected

const clients = new Map()

let Agent
let Metric

server.listen(1883, (err) => {
  if (!err) {
    console.log(`${chalk.cyan('[platziverse:mqtt]:')} server is runnig`)
  } else {
    handleFatalError(err)
  }
})

server.on('listening', async () => {
  try {
    // Initializes Agent and Metric services
    const services = await database(databaseconfig)
    Agent = services.Agent
    Metric = services.Metric
  } catch (err) {
    handleError(err)
  }
})

aedes.on('client', (client) => {
  debug(`[Client connected]: ${client.id}`)
})

aedes.on('publish', async (packet, client) => {
  debug(`[Received]: ${packet.topic}`)

  // If the topic is `agent/message` makes process to save the agent
  // int the database else just log the topic

  if (packet.topic === 'agent/message') {
    debug(`[Payload]: ${packet.payload}`)

    const payload = parsePayload(packet.payload)

    if (payload) {
      let agent
      try {
        agent = await Agent.createOrUpdate({
          ...payload.agent,
          connected: true
        })
        debug(`[Saved-Agent]: ${agent.id}`)
      } catch (error) {
        handleError(error)
      }

      // if doesn't exist store the agent
      if (!clients.get(client.id)) {
        clients.set(client.id, agent)
        // publish the connected agent
        aedes.publish({
          topic: 'agent/connected',
          payload: JSON.stringify({
            agent: {
              uuid: agent.uuid,
              name: agent.name,
              hostname: agent.hostname,
              pid: agent.pid,
              connected: agent.connected
            }
          })
        })
      }

      // Here the logic to store metrics
      // With map we try to save the metrics parallelly.
      // `map` accepts a sync callback so it returns an array of promises
      // then wait until all the promises are solved and store them into
      // `resolvedPromises` array. At the end log all the ids of each metric
      // saved and it associate agent

      try {
        const promises = payload.metrics.map(async (metric) => {
          const createMetric = await Metric.create(agent.uuid, metric)
          return createMetric
        })

        const resolvedPromises = await Promise.all(promises)

        resolvedPromises.forEach((metric) => {
          debug(
            `[saved-metric]: Metric ${metric.id} saved with Agent ${agent.uuid}`
          )
        })
      } catch (error) {
        handleError(error)
      }
    }
  } else {
    debug(`[Payload]: ${packet.payload}`)
  }
})

aedes.on('clientDisconnect', async (client) => {
  debug(`[Client Disconnected]: ${client.id}`)

  // Try to find the client in the clients connected list

  const agent = clients.get(client.id)

  if (agent) {
    try {
      await Agent.createOrUpdate({ ...agent, connected: false })
    } catch (error) {
      handleError(error)
    }

    // Delete agent from the clients connected list

    clients.delete(client.id)

    aedes.publish({
      topic: 'agent/disconnected',
      payload: JSON.stringify({
        agent: {
          uuid: agent.uuid
        }
      })
    })

    debug(
       `[Report]: Client ${client.id} associated to Agent ${agent.uuid} marked as disconnected`
    )
  }
})
