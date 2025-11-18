import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { AuthProvider } from './context/authContext'
import { SocketProvider } from './context/socketContext'
import { ChatProvider } from './context/chatContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <SocketProvider>
        <ChatProvider>
          <App />
        </ChatProvider>
      </SocketProvider>
    </AuthProvider>
  </React.StrictMode>,
)
