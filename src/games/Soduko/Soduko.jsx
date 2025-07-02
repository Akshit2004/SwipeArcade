import React, { useEffect, useState } from 'react';
import './Soduko.css';

const SUDOKU_API = 'https://sudoku-api.vercel.app/api/dosuku';

function serializeBoard(board) {
  // Serialize the board to a string for repeat detection
  return board.flat().join('');
}

const Soduko = () => {
  const [board, setBoard] = useState([]);
  const [original, setOriginal] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [invalidCells, setInvalidCells] = useState({});

  useEffect(() => {
    async function fetchBoard() {
      setLoading(true);
      setError('');
      try {
        let tries = 0;
        let fetched = null;
        let prevPuzzles = JSON.parse(localStorage.getItem('sudoku_puzzles') || '[]');
        do {
          const res = await fetch(SUDOKU_API);
          const data = await res.json();
          console.log('Sudoku API response:', data); // Debug log
          const puzzle = data?.newboard?.grids?.[0]?.value;
          if (!puzzle) throw new Error('Invalid puzzle data');
          const serialized = serializeBoard(puzzle);
          if (!prevPuzzles.includes(serialized)) {
            prevPuzzles.push(serialized);
            localStorage.setItem('sudoku_puzzles', JSON.stringify(prevPuzzles));
            fetched = puzzle;
            break;
          }
          tries++;
        } while (tries < 5);
        if (!fetched) throw new Error('Could not fetch a new puzzle.');
        setBoard(fetched);
        setOriginal(JSON.parse(JSON.stringify(fetched)));
      } catch (e) {
        setError('Failed to load puzzle.');
        console.error(e); // Debug log
      }
      setLoading(false);
    }
    fetchBoard();
  }, []);

  const handleInput = (row, col, value) => {
    if (original[row][col] !== 0) return; // Don't allow editing original clues
    const num = value === '' ? 0 : Math.max(0, Math.min(9, Number(value)));
    let invalid = false;
    let newInvalidCells = { ...invalidCells };
    // Check for duplicate in row or column
    if (num !== 0) {
      for (let i = 0; i < 9; i++) {
        if (i !== col && board[row][i] === num) {
          invalid = true;
          break;
        }
        if (i !== row && board[i][col] === num) {
          invalid = true;
          break;
        }
      }
    }
    if (invalid) {
      newInvalidCells[`${row},${col}`] = true;
    } else {
      delete newInvalidCells[`${row},${col}`];
    }
    setInvalidCells(newInvalidCells);
    const newBoard = board.map(r => [...r]);
    newBoard[row][col] = num;
    setBoard(newBoard);
  };

  const isComplete = () => {
    return board.every(row => row.every(cell => cell !== 0));
  };

  return (
    <div className="sudoku-wrapper" style={{ minHeight: 400 }}>
      <h2>Sudoku Puzzle</h2>
      {loading ? (
        <div className="sudoku-loading">Loading...</div>
      ) : error ? (
        <div className="sudoku-error">{error}</div>
      ) : board.length === 0 ? (
        <div className="sudoku-error">No puzzle loaded. Please refresh.</div>
      ) : (
        <div className="sudoku-board">
          {board.map((row, i) => (
            <div className="sudoku-row" key={i}>
              {row.map((cell, j) => (
                <input
                  key={j}
                  className={`sudoku-cell${original[i][j] !== 0 ? ' sudoku-fixed' : ''}${invalidCells[`${i},${j}`] ? ' sudoku-invalid' : ''}`}
                  type="text"
                  maxLength={1}
                  value={cell === 0 ? '' : cell}
                  onChange={e => handleInput(i, j, e.target.value.replace(/[^1-9]/g, ''))}
                  disabled={original[i][j] !== 0}
                />
              ))}
            </div>
          ))}
        </div>
      )}
      {isComplete() && !loading && !error && <div className="sudoku-complete">Puzzle Complete! 🎉</div>}
    </div>
  );
};

// Add Sudoku rules as a static property
Soduko.rules = [
  "Fill the grid so that every row, column, and 3x3 box contains the numbers 1 to 9 exactly once.",
  "No duplicate numbers are allowed in any row, column, or 3x3 box.",
  "Cells with gray background are fixed and cannot be changed.",
  "Click a cell and type a number (1-9) to fill it.",
  "A red outline means the number is invalid in its row or column."
];

export default Soduko;
