import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home/Home';
import GamePlayer from './pages/GamePlayer/GamePlayer';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/game/sudoku" element={<GamePlayer />} />
        <Route path="/game-player/soduko" element={<GamePlayer />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
