import http from 'node:http'
import { randomUUID } from 'node:crypto'

import { WebSocketServer } from 'ws'

const connections = new Map()

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

const routing = {
  '/': { message: 'Server works fine'},
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
      const uuid = getUuid()
      connections.set(uuid, runSendingMessages())
      socket.send(JSON.stringify({ uuid }))
    }

    if (data.isReconnect) {
      const uuid = data.uuid
      if (connections.has(uuid)) {
        clearInterval(connections.get(uuid))
        connections.set(uuid, runSendingMessages())
        socket.send(JSON.stringify({ uuid }))
      }
      // clearInterval(intervalId)
      // intervalId = null
    }

    if (data.isStop) {
      const uuid = data.uuid
      clearInterval(connections.get(uuid))
      connections.delete(uuid)
      console.log({ connections })
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
      socket.send(data)
    }, 1000)
    return intervalId
  }
})

function getUuid() {
  return randomUUID()
}
