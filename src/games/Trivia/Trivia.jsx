import React, { useState, useEffect } from 'react';
import './Trivia.css';

const Trivia = () => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [gameState, setGameState] = useState('loading'); // loading, playing, finished
  const [timeLeft, setTimeLeft] = useState(15);
  const [answerRevealed, setAnswerRevealed] = useState(false);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);

  useEffect(() => {
    fetchQuestions();
  }, []);

  useEffect(() => {
    let timer;
    if (gameState === 'playing' && timeLeft > 0 && !answerRevealed) {
      timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    } else if (timeLeft === 0 && !answerRevealed) {
      handleTimeUp();
    }
    return () => clearTimeout(timer);
  }, [timeLeft, gameState, answerRevealed]);

  const fetchQuestions = async () => {
    try {
      const response = await fetch('https://opentdb.com/api.php?amount=10&type=multiple');
      const data = await response.json();
      
      if (data.results) {
        const formattedQuestions = data.results.map(q => ({
          question: decodeHTML(q.question),
          correct_answer: decodeHTML(q.correct_answer),
          incorrect_answers: q.incorrect_answers.map(decodeHTML),
          category: decodeHTML(q.category),
          difficulty: q.difficulty
        }));
        setQuestions(formattedQuestions);
        setGameState('playing');
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
    }
  };

  const decodeHTML = (html) => {
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
  };

  const handleTimeUp = () => {
    setAnswerRevealed(true);
    setStreak(0);
    setTimeout(() => {
      nextQuestion();
    }, 2000);
  };

  const handleAnswerClick = (answer) => {
    if (answerRevealed) return;
    
    setSelectedAnswer(answer);
    setAnswerRevealed(true);
    
    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = answer === currentQuestion.correct_answer;
    
    if (isCorrect) {
      setScore(score + 1);
      setStreak(streak + 1);
      setMaxStreak(Math.max(maxStreak, streak + 1));
    } else {
      setStreak(0);
    }

    setTimeout(() => {
      nextQuestion();
    }, 2000);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setAnswerRevealed(false);
      setTimeLeft(15);
    } else {
      setGameState('finished');
    }
  };

  const restartGame = () => {
    setCurrentQuestionIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setGameState('loading');
    setTimeLeft(15);
    setAnswerRevealed(false);
    setStreak(0);
    setMaxStreak(0);
    fetchQuestions();
  };

  const getScoreMessage = () => {
    const percentage = (score / questions.length) * 100;
    if (percentage >= 90) return "🎉 GENIUS! Outstanding performance!";
    if (percentage >= 70) return "🌟 Excellent! You're really smart!";
    if (percentage >= 50) return "👍 Good job! Keep it up!";
    if (percentage >= 30) return "📚 Not bad! Room for improvement!";
    return "💪 Keep learning! Practice makes perfect!";
  };

  if (gameState === 'loading') {
    return (
      <div className="trivia-container">
        <div className="loading-screen">
          <div className="loading-spinner"></div>
          <h2>Loading Questions...</h2>
          <p>Preparing your trivia challenge!</p>
        </div>
      </div>
    );
  }

  if (gameState === 'finished') {
    return (
      <div className="trivia-container">
        <div className="game-finished">
          <div className="final-score-card">
            <h1 className="game-over-title">Game Complete!</h1>
            <div className="score-display">
              <div className="final-score">{score}/{questions.length}</div>
              <div className="score-percentage">{Math.round((score / questions.length) * 100)}%</div>
            </div>
            <div className="score-message">{getScoreMessage()}</div>
            <div className="stats">
              <div className="stat">
                <span className="stat-label">Best Streak</span>
                <span className="stat-value">{maxStreak}</span>
              </div>
            </div>
            <button className="restart-btn" onClick={restartGame}>
              🎯 Play Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  if (!currentQuestion) return null;

  const allAnswers = [...currentQuestion.incorrect_answers, currentQuestion.correct_answer].sort();

  return (
    <div className="trivia-container">
      <div className="game-header">
        <div className="progress-section">
          <div className="question-counter">
            Question {currentQuestionIndex + 1} of {questions.length}
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
            ></div>
          </div>
        </div>
        
        <div className="game-stats">
          <div className="score">Score: {score}</div>
          <div className="streak">🔥 {streak}</div>
          <div className={`timer ${timeLeft <= 5 ? 'timer-warning' : ''}`}>
            ⏱️ {timeLeft}s
          </div>
        </div>
      </div>

      <div className="question-section">
        <div className="category-badge">{currentQuestion.category}</div>
        <div className={`difficulty-badge difficulty-${currentQuestion.difficulty}`}>
          {currentQuestion.difficulty.toUpperCase()}
        </div>
        
        <h2 className="question-text">{currentQuestion.question}</h2>
        
        <div className="answers-grid">
          {allAnswers.map((answer, index) => {
            let className = 'answer-btn';
            
            if (answerRevealed) {
              if (answer === currentQuestion.correct_answer) {
                className += ' correct';
              } else if (answer === selectedAnswer) {
                className += ' incorrect';
              } else {
                className += ' disabled';
              }
            }
            
            return (
              <button
                key={index}
                className={className}
                onClick={() => handleAnswerClick(answer)}
                disabled={answerRevealed}
              >
                <span className="answer-letter">{String.fromCharCode(65 + index)}</span>
                <span className="answer-text">{answer}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Export rules for the GamePlayer component
Trivia.rules = [
  "Answer 10 multiple-choice trivia questions",
  "You have 15 seconds per question",
  "Select the correct answer from 4 options",
  "Build streaks for bonus excitement!",
  "Questions cover various topics and difficulties",
  "Try to get the highest score possible!"
];

export default Trivia;
