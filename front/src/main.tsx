import React from 'react'
import ReactDOM from 'react-dom/client'
import Mvp1 from './pages/mvp1'
import Mvp2 from './pages/mvp2'
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { ChakraProvider } from '@chakra-ui/react';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ChakraProvider>
      <Router basename="/">
        <Routes>
          <Route path="/" element={<Navigate to="/input" replace />} />
          <Route path="/input" element={<Mvp1 />} />
          <Route path="/output" element={<Mvp2 />} />
        </Routes>
      </Router>
    </ChakraProvider>
  </React.StrictMode>,
)
