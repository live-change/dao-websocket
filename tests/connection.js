const test = require('blue-tape')
const testServerDao = require('reactive-dao/tests/testServerDao.js')
const ReactiveDao = require("reactive-dao")
const WebSocketServer = require('websocket').server
var http = require('http')

const rdws = require("../index.js")

test("time value", (t) => {
  t.plan(4)
  let sessionId = ""+Math.random()

  let port = Math.floor(9000 + Math.random() * 1000)

  let httpServer
  let server
  let client
  t.test('create connection', (t) => {
    t.plan(2)
    server = new ReactiveDao.ReactiveServer(testServerDao.promised)

    httpServer = http.createServer(function(request, response) {
      console.log('Received request for ' + request.url);
      response.writeHead(404);
      response.end();
    })
    httpServer.listen(port, function() {
      console.log('Server is listening on port',port);
    })

    let wsServer = new WebSocketServer({ httpServer, autoAcceptConnections: false })
    wsServer.on("request",(request) => {
      t.pass("WebSocket request made")
      let serverConnection = new rdws.server(request)
      server.handleConnection(serverConnection)
    })

    setTimeout(()=> {
      client = new rdws.client({ sessionId }, "ws://localhost:"+port+'/ws', {
        onConnect: () => t.pass("connected"),
        delay: 50
      })
    }, 100)

  })

  let timeObservable, timeObserver, ticks = 0
  t.test('observe server time value', (t) => {
    t.plan(5)

    timeObservable = client.observable(['test','time'], ReactiveDao.ObservableValue)
    timeObserver = {
      set(time){
        ticks++
        t.pass("got tick: "+time)
      }
    }
    timeObservable.observe(timeObserver)
  })

  t.test('unobserve server time value', (t) => {
    t.plan(1)
    timeObservable.unobserve(timeObserver)
    let currTicks = ticks
    setTimeout(() => currTicks = ticks, 60)
    setTimeout(() => t.assert(currTicks == ticks), 200)
  })

  t.test('disconnect from server', (t) => {
    t.plan(1)
    client.settings.onDisconnect = () => {
      t.pass("disconnected")
      t.end()
      process.exit();
    }
    client.dispose()
  })

});