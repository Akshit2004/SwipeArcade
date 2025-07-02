import React from 'react';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import Soduko from '../../games/Soduko/Soduko';
import './GamePlayer.css';

const GamePlayer = () => {
  return (
    <div className="game-player">
      <Navbar />
      <div className="game-canvas-container">
        <Soduko />
      </div>
      <Footer />
    </div>
  );
};

export default GamePlayer;
