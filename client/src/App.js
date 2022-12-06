import { useEffect, useState } from 'react'
import { w3cwebsocket as W3CWebSocket } from 'websocket'
import { Button, Input } from 'reactstrap'

import './App.css'
import { useListeningLocalStorage } from './hooks/useLocalStorage'

const client = new W3CWebSocket('ws://localhost:8000', 'echo-protocol')

const  App = () => {
  const [search, setSearch] = useState('')
  const [serverData, setServerData] = useState(null)
  // const [serverData] = useListeningLocalStorage(['search', 'timestamp', 'isExist' ])

  const runHandler = () => {
    console.log('Run Clicked')
    client.send(JSON.stringify({ isRun: true }))
  }

  const stopHandler = () => {
    console.log('Run Clicked')
    const newServerData = { ...serverData }
    delete newServerData.timestamp
    setServerData(Object.keys(newServerData).length === 0 ? null : newServerData)

    client.send(JSON.stringify({ isStop: true }))
  }

  const inputHandler = (e) => setSearch(e.target.value)

  client.onerror = function() {
    console.log('Connection Error')
  }
  
  client.onopen = function() {
    console.log('WebSocket Client Connected')
  }
  
  client.onclose = function() {
    console.log('echo-protocol Client Closed')
  }
  
  client.onmessage = function(e) {
    if (typeof e.data === 'string') {
        console.log("Received from the Server: '" + e.data + "'")
    }
    const data = JSON.parse(e.data)
    if (data.hasOwnProperty('timestamp') || data.hasOwnProperty('isExist') || data.hasOwnProperty('search')) {
      Object.entries(data).forEach(d => {
        localStorage.setItem(d[0], d[1])
        setServerData(prev => ({
          ...prev,
          [d[0]]: d[0] === 'timestamp' ? new Date(d[1]).toGMTString() : d[1],
        }))
    })
    }
  }

  useEffect(() => {
    console.log({ search })
    if (search === '') setServerData(null)
    else {
      client.send(JSON.stringify({ search }))
    }

    return () => localStorage.clear()
  }, [search])

  useEffect(() => {
    console.log({ serverData })
  }, [serverData])
  

  return (
    <div className="App">
      <section>
        <Input className='m-1' onChange={inputHandler}/>
        <Button className='m-1' onClick={runHandler}>Run</Button>
        <Button className='m-1' onClick={stopHandler}>Stop</Button>
      </section>

      <sections>
        <h1>Server information:</h1>
        { serverData !== null &&
          <div>{JSON.stringify(serverData)}</div>
        }
      </sections>

    </div>
  )
}

export default App