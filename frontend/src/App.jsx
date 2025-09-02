// src/App.jsx
import { useState } from 'react';
import './App.css';
import LoginPage from './components/LoginPage';
import EvaluationPage from './components/EvaluationPage';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [evaluatorName, setEvaluatorName] = useState('');

  const handleLoginSuccess = (name) => {
    setEvaluatorName(name);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setEvaluatorName('');
  };

  return (
    <div className="app-container">
      {isLoggedIn ? (
        <EvaluationPage evaluatorName={evaluatorName} onLogout={handleLogout} />
      ) : (
        <LoginPage onLoginSuccess={handleLoginSuccess} />
      )}
    </div>
  );
}

export default App;