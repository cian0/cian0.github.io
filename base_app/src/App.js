import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import RockPaperScissors from './components/RockPaperScissors';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/rock-paper-scissors" element={<RockPaperScissors />} />
      </Routes>
    </Router>
  );
};

export default App;