import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import UrlShortener from './components/UrlShortener';
import Statistics from './components/Statistics';
import Redirect from './components/Redirect';

const theme = createTheme();

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<UrlShortener />} />
          <Route path="/statistics" element={<Statistics />} />
          <Route path="/:shortcode" element={<Redirect />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
