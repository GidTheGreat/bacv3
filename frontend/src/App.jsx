import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
//import './App.css'

import Layout from './UI/UILayout'
import TransientMsg from './UI/transientMessage'

//import html2canvas from 'html2canvas'

function App() {
  
  return (
    <>
      {<TransientMsg/>}
      <Layout />

    </>
  )
}

export default App
