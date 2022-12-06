import http from 'node:http'
import { WebSocketServer } from 'ws'

const DICTIONARY = [
  'i',
  'hello',
  'greeting',
  'success',
  'server',
  'ws',
  'live',
  'love',
  'name',
  'site',
]

let intervalId = null

const routing = {
  '/': { message: 'Server works fine'},
  '/ws': { message: 'Hello from WS'},
}
const server = http.createServer((req, res) => {
  const data = routing[req.url]
  res.end(JSON.stringify(data ?? { message: 'Route is not support' }))
})

server.listen(8000, () => {
  console.log('Server running on port 8000')
})

const ws = new WebSocketServer({ server })

ws.on('connection', (socket, req) => {
  const ip = req.socket.remoteAddress
  console.log('Connected', { ip })

  const data = JSON.stringify({ isConnected: true })
  socket.send(data, (error) => {
    console.log({ error })
  })

  socket.on('message', (message) => {
    const data = JSON.parse(message)
    if (data.isRun) {
      intervalId = runSendingMessages()
    }

    if (data.isStop && intervalId) {
      clearInterval(intervalId)
      intervalId = null
    }

    if (data.search) {
      socket.send(JSON.stringify({ 
        isExist: DICTIONARY.includes(data.search.toString().toLowerCase()),
        search: data.search,
      }))
    }

    console.log({ ip, data })
  })

  socket.on('close', ()=> {
    console.log('Disconnected', { ip })
  })


  function runSendingMessages() {
    const intervalId = setInterval(() => {
      const data = JSON.stringify({ timestamp: new Date().getTime()})
      console.log({ data });
      socket.send(data) 
    }, 2000)
    return intervalId
  }

})
