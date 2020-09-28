'use strict'

const express = require('express')
const request = require('request-promise-native') 
const asyncify = require('express-asyncify')

const {config} = require('platziverse-tools')

const api = asyncify(express.Router())

api.get('/agents', async(req,res,next) => {
    const options = {
        method: 'GET',
        url: `${config.proxy.endpoint}/api/agents`,
        headers: {
            'Authorization': `Bearer ${config.proxy.apiToken}`
        },
        json: true
    }
    let results 
    try {
        results = await request(options)
    } catch (e) {
        return next(new Error(e.error.error))
    }
    res.send(results)
})

api.get('/agent/:uuid', async(req, res,next) => {

    const { uuid } = req.params

    const options = {
        method: 'GET',
        url: `${config.proxy.endpoint}/api/agent/${uuid}`,
        headers: {
            'Authorization': `Bearer ${config.proxy.apiToken}`
        },
        json:true
    }

    let result 
    try {
        result = await request(options)
    } catch (e) {
        return next(new Error(e.error.error))
    }

    res.send(result)
})

api.get('/metrics/:uuid', async(req, res,next) => {
    const { uuid } = req.params

    const options = {
        method: 'GET',
        url: `${config.proxy.endpoint}/api/metrics/${uuid}`,
        headers: {
            'Authorization': `Bearer ${config.proxy.apiToken}`
        },
        json:true
    }

    let result 
    try {
        result = await request(options)
    } catch (e) {
        return next(new Error(e.error.error))
    }

    res.send(result)
})

api.get('/metrics/:uuid/:type', async(req,res,next) => {
    const { uuid, type } = req.params

    const options = {
        method: 'GET',
        url: `${config.proxy.endpoint}/api/metrics/${uuid}/${type}`,
        headers: {
            'Authorization': `Bearer ${config.proxy.apiToken}`
        },
        json:true
    }

    let result 
    try {
        result = await request(options)
    } catch (e) {
        return next(new Error(e.error.error))
    }

    res.send(result)
})

module.exports = api