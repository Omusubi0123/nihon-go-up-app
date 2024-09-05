import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import App2 from './App2'
import App23 from './App3'

import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Router basename="/team1">
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/app2" element={<App2 />} />
        <Route path="/app3" element={<App23 />} />
      </Routes>
    </Router>
  </React.StrictMode>,
)
