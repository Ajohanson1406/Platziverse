'use strict'

require('dotenv').config()
const debug = require('debug')('platziverse:tools')

const config = {
    dev: process.env.NODE_ENV !== 'production',
    apiPort: process.env.API_PORT || 3001,
    clientPort: process.env.CLIENT_PORT || 8080,
    auth: {
        secret: process.env.SECRET || 'platzi',
        algorithms: ['HS256']
    },

    db: {
    database: process.env.DB_NAME || 'plstziverse',
    username: process.env.DB_USER || 'platzi',
    password: process.env.DB_PASS || 'platzi',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: s => debug(s)
    },

    proxy: {
        endpoint: process.env.API_ENDPOINT || 'http://localhost:3000',
        serverHost: process.env.SERVER_HOST || 'http://localhost:8080',
        apiToken: process.env.API_TOKEN || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InBsYXR6aSIsImFkbWluIjp0cnVlLCJwZXJtaXNzaW9ucyI6WyJtZXRyaWNzOnJlYWQiXSwiaWF0IjoxNjAwNzI1MTk0fQ.BHW184DJ2_EvHgAxistOdHsxY2r09oC3K7uw5qln9hE'
    }
}

module.exports = config