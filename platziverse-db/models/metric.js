'use strict'

const Sequelize = require('sequelize')
const setupDatabse = require('../lib/db')

module.exports = function setupMetricModel (config) {
  const sequelize = setupDatabse(config)

  return sequelize.define('metric', {
    type: {
      type: Sequelize.STRING,
      allowNull: false
    },
    value: {
      type: Sequelize.TEXT,
      allowNull: false
    }
  })
}
