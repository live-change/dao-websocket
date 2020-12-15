const EventEmitter = require('events');

class WebSocketServerConnection extends EventEmitter {
  constructor(request, origin) {
    super()
    this.headers = request.httpRequest.headers
    this.remoteAddress = request.httpRequest.connection.remoteAddress
    this.connection = request.accept(request.requestedProtocols[0] || null, origin || request.origin)
    this.connection.on('message', (message)=>{
      if (message.type === 'utf8') {
        this.emit('data', message.utf8Data)
      }
      else if (message.type === 'binary') {
        this.emit('binary', message.binaryData)
      }
    })
    this.connection.on('close', (reasonCode, description) => {
      this.emit('close', reasonCode, description)
    })
  }
  write(data) {
    this.connection.sendUTF(data)
  }
  close() {
    this.connection.close()
  }
}

module.exports = WebSocketServerConnection
