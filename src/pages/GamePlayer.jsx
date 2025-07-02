import React, { useEffect, useRef } from 'react';
import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';
import './GamePlayer.css';

const GamePlayer = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    // Responsive canvas size
    const setCanvasSize = () => {
      const width = Math.min(window.innerWidth * 0.9, 400);
      const height = width;
      canvas.width = width;
      canvas.height = height;
      drawSudokuPreview(ctx, width, height);
    };
    window.addEventListener('resize', setCanvasSize);
    setCanvasSize();
    return () => window.removeEventListener('resize', setCanvasSize);
  }, []);

  // Simple Sudoku grid drawing
  function drawSudokuPreview(ctx, width, height) {
    ctx.clearRect(0, 0, width, height);
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    // Draw grid
    for (let i = 0; i <= 9; i++) {
      ctx.beginPath();
      ctx.moveTo((width / 9) * i, 0);
      ctx.lineTo((width / 9) * i, height);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, (height / 9) * i);
      ctx.lineTo(width, (height / 9) * i);
      ctx.stroke();
    }
    // Draw bold lines for 3x3 boxes
    ctx.lineWidth = 4;
    for (let i = 0; i <= 9; i += 3) {
      ctx.beginPath();
      ctx.moveTo((width / 9) * i, 0);
      ctx.lineTo((width / 9) * i, height);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, (height / 9) * i);
      ctx.lineTo(width, (height / 9) * i);
      ctx.stroke();
    }
    // Example numbers
    ctx.font = `${width / 18}px Arial`;
    ctx.fillStyle = '#1976d2';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const example = [
      [5, '', '', '', 7, '', '', '', ''],
      ['', '', '', 1, 9, 5, '', '', ''],
      ['', 9, 8, '', '', '', '', 6, ''],
      ['', '', '', '', 6, '', '', '', 3],
      [4, '', '', 8, '', 3, '', '', 1],
      [7, '', '', '', 2, '', '', '', 6],
      ['', 6, '', '', '', '', 2, 8, ''],
      ['', '', '', 4, 1, 9, '', '', 5],
      ['', '', '', '', 8, '', '', 7, 9],
    ];
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (example[r][c]) {
          ctx.fillText(
            example[r][c],
            (c + 0.5) * (width / 9),
            (r + 0.5) * (height / 9)
          );
        }
      }
    }
  }

  return (
    <div className="game-player">
      <Navbar />
      <div className="game-canvas-container">
        <canvas ref={canvasRef} className="game-canvas" />
      </div>
      <Footer />
    </div>
  );
};

export default GamePlayer;
