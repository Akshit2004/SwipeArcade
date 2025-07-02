import React from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import Soduko from '../../games/Soduko/Soduko';
import SpaceShooter from '../../games/Space Shooter/SpaceShooter';
import './GamePlayer.css';

const gameMap = {
  'soduko': {
    component: Soduko,
    rules: Soduko.rules || []
  },
  'space-shooter': {
    component: SpaceShooter,
    rules: SpaceShooter.rules || []
  },
};

const GamePlayer = () => {
  const { slug } = useParams();
  const gameEntry = gameMap[slug];
  const GameComponent = gameEntry ? gameEntry.component : null;
  const rules = gameEntry ? gameEntry.rules : [];

  return (
    <div className="game-player">
      <Navbar />
      <div className="game-layout">
        <div className="game-canvas-container">
          {GameComponent ? <GameComponent /> : <div>Game not found.</div>}
        </div>
        <aside className="game-rules">
          <h3>Rules</h3>
          <ul>
            {rules.length > 0 ? rules.map((rule, idx) => (
              <li key={idx}>{rule}</li>
            )) : <li>No rules available.</li>}
          </ul>
        </aside>
      </div>
      <Footer />
    </div>
  );
};

export default GamePlayer;
