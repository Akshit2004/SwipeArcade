import React from 'react';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import Soduko from '../../games/Soduko/Soduko';
import './GamePlayer.css';

const GamePlayer = () => {
  // Fetch rules from the game component
  const rules = Soduko.rules || [];
  return (
    <div className="game-player">
      <Navbar />
      <div className="game-layout">
        <div className="game-canvas-container">
          <Soduko />
        </div>
        <aside className="game-rules">
          <h3>Rules</h3>
          <ul>
            {rules.map((rule, idx) => (
              <li key={idx}>{rule}</li>
            ))}
          </ul>
        </aside>
      </div>
      <Footer />
    </div>
  );
};

export default GamePlayer;
