import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import ReactDOM from "react-dom/client";
import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from './theme.js';

import { registerSW } from 'virtual:pwa-register'


// ─────────────────────────────────────────────
// PWA UPDATE HANDLING
// ─────────────────────────────────────────────

let updateSW

updateSW = registerSW({
  immediate: true,

  onNeedRefresh() {
    showUpdateMessage()
  },

  onOfflineReady() {
    console.log('BAC is ready to work offline')
  }
})


// Check for a new service worker whenever the app
// comes back into the foreground.
document.addEventListener('visibilitychange', async () => {
  //console.log("visibility change", document.visibilityState)
  if (document.visibilityState !== 'visible') return

  if (!('serviceWorker' in navigator)) return

  try {
    const registration = await navigator.serviceWorker.ready

    await registration.update()

  } catch (error) {
    // Offline or network unavailable.
    // Keep running the currently installed version.
    console.log('Could not check for app update:', error)
  }
})


// ─────────────────────────────────────────────
// UPDATE NOTIFICATION
// ─────────────────────────────────────────────

function showUpdateMessage() {
  //updateSW(true)
  const message = document.createElement('div')

  message.textContent =
    'New version available — Empty Cache and Hard Reload when ready.'

  Object.assign(message.style, {
    position: 'fixed',
    bottom: '20px',
    left: '20px',
    right: '20px',
    zIndex: '999999',
    padding: '14px 18px',
    borderRadius: '10px',
    background: '#111',
    color: '#fff',
    textAlign: 'center'
  })

  document.body.appendChild(message)

  setTimeout(() => {
    message.remove()
  }, 5000)
}





ReactDOM.createRoot(document.getElementById("root")).render(
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <StrictMode>
      <App />
    </StrictMode>
  </ThemeProvider>
);


