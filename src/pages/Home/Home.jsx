import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import Soduko from '../../games/Soduko/Soduko';
import './Home.css';

const Home = () => {
  // Sample games data - you can replace this with real data later
  const [games] = useState([
    {
      id: 1,
      title: "Soduko",
      description: "Challenge your mind with intricate Soduko",
      category: "Puzzle",
      image: "🧩",
      difficulty: "Medium",
      playTime: "5-10 min"
    },
    {
      id: 2,
      title: "Speed Racer",
      description: "Fast-paced racing adventure",
      category: "Racing",
      image: "🏎️",
      difficulty: "Easy",
      playTime: "3-5 min"
    },
    {
      id: 3,
      title: "Word Quest",
      description: "Expand your vocabulary in this word game",
      category: "Word",
      image: "📚",
      difficulty: "Hard",
      playTime: "10-15 min"
    },
    {
      id: 4,
      title: "Space Shooter",
      description: "Defend Earth from alien invasion",
      category: "Action",
      image: "🚀",
      difficulty: "Medium",
      playTime: "7-12 min"
    },
    {
      id: 5,
      title: "Memory Game",
      description: "Test and improve your memory skills",
      category: "Brain",
      image: "🧠",
      difficulty: "Easy",
      playTime: "2-4 min"
    },
    {
      id: 6,
      title: "Tower Defense",
      description: "Strategically defend your base",
      category: "Strategy",
      image: "🏰",
      difficulty: "Hard",
      playTime: "15-20 min"
    }
  ]);

  const [selectedCategory, setSelectedCategory] = useState('All');
  const categories = ['All', 'Puzzle', 'Racing', 'Word', 'Action', 'Brain', 'Strategy'];
  const navigate = useNavigate();

  const filteredGames = selectedCategory === 'All' 
    ? games 
    : games.filter(game => game.category === selectedCategory);

  const getDifficultyColor = (difficulty) => {
    switch(difficulty) {
      case 'Easy': return '#27ae60';
      case 'Medium': return '#f39c12';
      case 'Hard': return '#e74c3c';
      default: return '#95a5a6';
    }
  };

  const slugify = (str) => str.toLowerCase().replace(/ /g, '-');

  return (
    <div className="home">
      <Navbar />
      
      {/* Games Section */}
      <section className="games-section" id="games">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Game Collection</h2>
            <p className="section-subtitle">Choose from our diverse collection of instant-play games</p>
          </div>

          {/* Category Filter */}
          <div className="category-filter">
            {categories.map(category => (
              <button
                key={category}
                className={`filter-btn ${selectedCategory === category ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Games Grid */}
          <div className="games-grid">
            {filteredGames.map(game => (
              <div 
                key={game.id} 
                className="game-card"
                onClick={() => navigate(`/gameplayer/${slugify(game.title)}`)}
                style={{ cursor: 'pointer' }}
              >
                <div className="game-icon">
                  {game.image}
                </div>
                <div className="game-info">
                  <h3 className="game-title">{game.title}</h3>
                  <p className="game-description">{game.description}</p>
                  <div className="game-meta">
                    <span className="game-category">{game.category}</span>
                    <span 
                      className="game-difficulty" 
                      style={{color: getDifficultyColor(game.difficulty)}}
                    >
                      {game.difficulty}
                    </span>
                    <span className="game-time">⏱️ {game.playTime}</span>
                  </div>
                </div>
                {/* Show Sudoku game if Puzzle Master is selected */}
                {game.title === 'Puzzle Master' && selectedCategory === 'Puzzle' && (
                  <div style={{marginTop: '16px'}}>
                    <Soduko />
                  </div>
                )}
                <button 
                  className="play-button"
                  tabIndex={-1}
                >
                  Play Now
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <h2 className="section-title">Why SwipeArcade?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3>Instant Play</h3>
              <p>No downloads, no installations. Just click and play instantly in your browser.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📱</div>
              <h3>Mobile Friendly</h3>
              <p>Perfect responsive design that works seamlessly on all devices.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🎨</div>
              <h3>Modern Design</h3>
              <p>Beautiful, intuitive interface designed for the best gaming experience.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🚀</div>
              <h3>Growing Library</h3>
              <p>New games added regularly to keep the experience fresh and exciting.</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;