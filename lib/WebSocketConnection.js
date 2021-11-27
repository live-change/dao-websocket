const WebSocket = require('universal-websocket-client');
const rd = require("@live-change/dao")
const Connection = rd.ReactiveConnection
const debug = require('debug')('reactive-dao-ws')

class WebSocketConnection extends Connection {
  constructor(credentials, url, settings) {
    super(credentials, settings)
    this.url = url
    this.initialize()
  }

  initialize() {
    debug("connecting...")
    this.connection = new WebSocket(this.url, "reactive-observer", this.settings)
    let connection = this.connection
    connection.onopen = (function () {
      debug("connection open")
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
      debug("connection close")
      disconnect()
    }).bind(this)
    connection.onmessage = (function (e) {
      debug("INCOMING MESSAGE", e.data)
      const message = JSON.parse(e.data)
      this.handleMessage(message)
    }).bind(this)
    connection.onerror = (function(err) {
      debug("connection error", err.message)
      disconnect()
    })
  }

  send(message) {
    const data = JSON.stringify(message)
    debug("OUTGOING MESSAGE", data)
    this.connection.send(data)
  }

  reconnect() {
    debug("reconnect")
    this.connection.close()
    if (this.autoReconnect) return;
    this.initialize()
  }

  dispose() {
    debug("close")
    super.dispose()
    this.connection.close()
  }

  closeConnection() {
    this.connection.close()
  }

}

module.exports = WebSocketConnection
