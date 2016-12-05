var SockJS = require("sockjs-client")
var rd = require("reactive-dao")
var Connection = rd.ReactiveConnection

class SockJsConnection extends Connection {
  constructor(sessionId, url, settings) {
    super(sessionId, settings)
    this.url = url
    this.initialize()
  }

  initialize() {
    this.connection = new SockJS(this.url)
    var connection = this.connection
    connection.onopen = (function () {
      if (connection.readyState === SockJS.CONNECTING) return setTimeout(connection.onopen, 230)
      this.handleConnect()
    }).bind(this)
    connection.onclose = (function () {
      var ef = function () {
      }
      connection.onclose = ef
      connection.onmessage = ef
      connection.onheartbeat = ef
      connection.onopen = ef
      this.handleDisconnect()
    }).bind(this)
    this.connection.onmessage = (function (e) {
      console.info("INCOMING MESSAGE", e.data)
      var message = JSON.parse(e.data)
      this.handleMessage(message)
    }).bind(this)
    /*this.connection.onheartbeat = (function(){
     console.log('BULLET PING!')
     this.send({type:"ping"})
     }).bind(this)*/
  }

  send(message) {
    var data = JSON.stringify(message)
    console.info("OUTGOING MESSAGE", data)
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

module.exports = SockJsConnection
