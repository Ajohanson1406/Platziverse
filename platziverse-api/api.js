'use strict'

const debug = require('debug')('platziverse:api:routes')
const express = require('express')
const asyncify = require('express-asyncify')
const auth = require('express-jwt')
const guards = require('express-jwt-permissions')()
const db = require('platziverse-db')

const { config } = require('platziverse-tools')

const api = asyncify(express.Router())

let services, Agent, Metric

api.use('*', async (req, res, next) => {
  debug('Connecting to DB')
  if (!services) {
    try {
      services = await db(config.db)
    } catch (error) {
      return next(error)
    }
    Agent = services.Agent
    Metric = services.Metric
  }
  next()
})

api.get('/agents', auth(config.auth), async (req, res, next) => {
  const { user } = req

  if (!user || !user.username) {
    return next(new Error('Not Authorized'))
  }

  let agents = []

  try {
    if (user.admin) {
      agents = await Agent.findConnected()
    } else {
      agents = await Agent.findByUsername(user.username)
    }
  } catch (e) {
    return next(e)
  }
  res.send(agents)
})

api.get('/agent/:uuid', auth(config.auth), async (req, res, next) => {
  const { uuid } = req.params
  const { user } = req

  debug(`Request to /agent/${uuid}`)

  if (!user || !user.username) {
    return next(new Error('Not Authorized'))
  }
  let agent
  try {
    agent = await Agent.findByUuid(uuid)
  } catch (e) {
    return next(e)
  }
  if (!agent) {
    return next(new Error(`Agent not found with [uuid] ${uuid}`))
  }

  res.send(agent)
})


api.get('/metrics/:uuid', auth(config.auth), guards.check(['metrics: read']), async (req, res, next) => {
  const { uuid } = req.params
  const { user } = req

  debug(`Request to /metrics/${uuid}`)

  if (!user || !user.username) {
    return next(new Error('Not Authorized'))
  }

  let metric = []

  try {
    metric = await Metric.findByAgentUuid(uuid)
  } catch (e) {
    return next(e)
  }

  if (!metric || metric.length === 0) {
    return next(new Error(`Metrics not found to the agent with uuid ${uuid}`))
  }
  res.send(metric)
})

api.get('/metrics/:uuid/:type', auth(config.auth), async (req, res, next) => {
  const { uuid, type } = req.params

  debug(`Request to /metrics/${uuid}/${type}`)

  let metrics = []

  try {
    metrics = await Metric.findByTypeAgentUuid(type, uuid)
  } catch (e) {
    return next(e)
  }
  if (!metrics || metrics.length === 0) {
    return next(new Error(`Metrics not found to the agent with uuid ${uuid} and type ${type}`))
  }
  res.send(metrics)
})

module.exports = api
