<template>
  <div>
    <metric uuid="d775eb28-e2b6-4346-879f-2e90b4c888c7"
     type="callbackMetric"
     :socket ="socket"></metric>
    <agent
      v-for="agent in agents"
      :uuid="agent.uuid"
      :key="agent.uuid">
    </agent>
    <p v-if="error">{{error}}</p>
  </div>
</template>

<style>
  body {
    font-family: Arial;
    background: #f8f8f8;
    margin: 0;
  }
</style>

<script>

const io = require('socket.io-client')

const socket = io

module.exports = {
  data () {
    return {
      agents: [],
      error: null,
      socket
    }
  },

  mounted () {
    this.initialize()
  },

  methods: {
    initialize () {
    }
  }
}
</script>
