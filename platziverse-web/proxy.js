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
    } catch (error) {
        return next(error)
    }
    res.send(results)
})

api.get('/agent/:uuid', (req, res) => {

})

api.get('/metrics/:uuid', (req, res) => {

})

api.get('/metrics/:uuid/:type', (req,res) => {

})

module.exports = api