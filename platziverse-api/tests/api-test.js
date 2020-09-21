
'use strict'

const test = require('ava')
const util = require('util')
const request = require('supertest')
const sinon = require('sinon')
const proxyquire = require('proxyquire')
const config = require('platziverse-tools/src/config')
const { agentFixtures, metricFixtures } = require('platziverse-test')

const auth = require('../auth')

const sign = util.promisify(auth.sign)



let sandbox = null
let server = null
let dbStub = null
let token = null
let notAuthToken  = null
const AgentStub = {}
const MetricStub = {}
const uuid = 'yyy-yyy-yyy'
const wrongUuid = 'xxx'
const type = "ram"


test.beforeEach(async () => {
  sandbox = sinon.createSandbox()

  dbStub = sandbox.stub()
  dbStub.returns(Promise.resolve({
    Agent: AgentStub,
    Metric: MetricStub
  }))

  // Agent Stub findConnected
  AgentStub.findConnected = sandbox.stub()
  AgentStub.findConnected.returns(Promise.resolve(agentFixtures.connected))

  // Agent Stub findByUuid
  AgentStub.findByUuid = sandbox.stub()
  AgentStub.findByUuid.returns(Promise.resolve(agentFixtures.byUuid(uuid)))
  AgentStub.findByUuid.withArgs(wrongUuid).returns(Promise.resolve(agentFixtures.byUuid(wrongUuid)))

  // Metric Stub findByUuid
  MetricStub.findByAgentUuid = sandbox.stub()
  MetricStub.findByAgentUuid.returns(Promise.resolve(metricFixtures.findByAgentUuid(uuid)))
  MetricStub.findByAgentUuid.withArgs(wrongUuid).returns(Promise.resolve(null))

  //Metric findByTypeAgentUuid
  MetricStub.findByTypeAgentUuid = sandbox.stub()
  MetricStub.findByTypeAgentUuid.withArgs(type, uuid).returns(Promise.resolve(metricFixtures.findByTypeAgentUuid(type, uuid)))
  MetricStub.findByTypeAgentUuid.withArgs(type, wrongUuid).returns(Promise.resolve(null))

  token = await sign({admin: true, username: 'platzi'}, config.auth.secret)
  notAuthToken = await sign({ permissions: ['metrics:read']}, config.auth.secret)


  const api = proxyquire('../api', {
    'platziverse-db': dbStub
  })

  server = proxyquire('../server.js', {
    './api': api
  })
})

test.afterEach(() => {
  sandbox && sinon.restore()
})

test.serial.cb('/api/agents', t => {
  request(server)
    .get('/api/agents')
    .set('Authorization', `Bearer ${token}`)
    .expect(200)
    .expect('Content-Type', /json/)
    .end((err, res) => {
      t.falsy(err, 'should not return an error')
      const body = JSON.stringify(res.body)
      const expected = JSON.stringify(agentFixtures.connected)
      t.deepEqual(body, expected, 'response body should be the expected')
      t.end()
    })
})

test.serial.cb('/api/agents -not authorized', t => {
  request(server)
    .get('/api/agents')
    .set('Authorization', `Bearer ${notAuthToken}`)
    .expect(500)
    .expect('Content-Type', /json/)
    .end((err, res) => {
      t.falsy(err, 'should not return an error')
      const body = res.body
      t.regex(body.error, /Not Authorized/, 'Error Should have not authorized phrase')
      t.end()
    })
})

// Agent test
test.serial.cb('/api/agent/:uuid', t => {
  request(server)
    .get('/api/agent/:uuid')
    .set('Authorization', `Bearer ${token}`)
    .expect(200)
    .expect('Content-Type', /json/)
    .end((err, res) => {
      t.falsy(err, 'Should not return an error')
      const body = JSON.stringify(res.body)
      const expected = JSON.stringify(agentFixtures.byUuid(uuid))
      t.deepEqual(body, expected, 'response body should be the expected')
      t.end()
    })
})
test.serial.cb('/api/agent/:uuid - not found', t => {
  request(server)
    .get(`/api/agent/${wrongUuid}`)
    .set('Authorization', `Bearer ${token}`)
    .expect(404)
    .expect('Content-Type', /json/)
    .end((err, res) => {
      if (err) {
        console.log(err)
      }
      t.truthy(res.body.error, 'Should not be an error')
      t.regex(res.body.error, /not found/, 'Error should contains not found')
      t.end()
    })
})

// Metric test
test.serial.cb('/api/metrics/:uuid', t => {
  request(server)
  .get(`/api/metrics/${uuid}`)
  .set('Authorization', `Bearer ${token}`)
  .expect(200)
  .expect('Content-Type', /json/)
  .end((err, res) => {
    t.falsy(err, 'Should not return an error')
    const body = JSON.stringify(res.body)
    const expected = JSON.stringify(metricFixtures.findByAgentUuid(uuid))
    t.deepEqual(body, expected, 'response body should be the expected')
    t.end()
    })
})

test.serial.cb('/api/metrics/:uuid - not authorized', t => {
  request(server)
  .get(`/api/metrics/${uuid}`)
  .set('Authorization', `Bearer ${notAuthToken}`)
  .expect(500)
  .expect('Content-Type', /json/)
  .end((err, res) => {
    t.falsy(err, 'Should not return an error')
    const body = res.body
    t.regex(body.error, /Not Authorized/, 'Error Should have not authorized phrase')
    t.end()
    })
})

test.serial.cb('/api/metrics/:uuid -not found', t => {
  request(server)
  .get(`/api/metrics/${wrongUuid}`)
  .set('Authorization', `Bearer ${token}`)
  .expect(404)
  .expect('Content-Type', /json/)
  .end((err, res) => {
    if (err) {
      console.log(err)
    }
    t.truthy(res.body.error, 'Should not be an error')
    t.regex(res.body.error, /not found/, 'Error should contains not found')
    t.end()
  })
})

test.serial.cb('/api/metrics/:uuid/:type', t => {
  request(server)
  .get(`/api/metrics/${uuid}/${type}`)
  .set('Authorization', `Bearer ${token}`)
  .expect(200)
  .expect('Content-Type', /json/)
  .end((err, res) => {
    t.falsy(err, 'Should not return an error')
    let body = JSON.stringify(res.body)
    let expected = JSON.stringify(metricFixtures.findByTypeAgentUuid(type, uuid))
    t.deepEqual(body, expected, 'body should return the expected')
    t.end()
  })
})
test.serial.cb('/api/metrics/:uuid/:type -not found', t=> {
  request(server)
  .get(`/api/metrics/${wrongUuid}/${type}`)
  .set('Authorization', `Bearer ${token}`)
  .expect(404)
  .expect('Content-Type', /json/)
  .end((err, res) => {
    if (err) {
      console.log(err)
    }
    t.truthy(res.body.error, 'Should not be an error')
    t.regex(res.body.error, /not found/, 'Error should contains not found')
    t.end()
  })
})
