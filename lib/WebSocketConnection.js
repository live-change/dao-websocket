const WebSocket = require('universal-websocket-client');
const rd = require("reactive-dao")
const Connection = rd.ReactiveConnection
const debug = require('debug')('reactive-dao-ws')

class WebSocketConnection extends Connection {
  constructor(sessionId, url, settings) {
    super(sessionId, settings)
    this.url = url
    this.initialize()
  }

  initialize() {
    this.connection = new WebSocket(this.url, "reactive-observer", this.settings)
    var connection = this.connection
    connection.onopen = (function () {
      if (connection.readyState === WebSocket.CONNECTING) return setTimeout(connection.onopen, 230)
      this.handleConnect()
    }).bind(this)
    const disconnect = () => {
      let ef = function () {
      }
      connection.onclose = ef
      connection.onmessage = ef
      connection.onheartbeat = ef
      connection.onopen = ef
      connection.onerror = ef
      this.handleDisconnect()
    }
    connection.onclose = (function () {
      disconnect()
    }).bind(this)
    connection.onmessage = (function (e) {
      debug("INCOMING MESSAGE", e.data)
      var message = JSON.parse(e.data)
      this.handleMessage(message)
    }).bind(this)
    connection.onerror = (function() {
      disconnect()
    })
  }

  send(message) {
    var data = JSON.stringify(message)
    debug("OUTGOING MESSAGE", data)
    this.connection.send(data)
  }

  reconnect() {
    this.connection.close()
    if (this.autoReconnect) return;
    this.initialize()
  }

  dispose() {
    this.finished = true
    this.connection.close()
  }

}

module.exports = WebSocketConnection
