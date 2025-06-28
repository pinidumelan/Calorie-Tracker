
import React, { useState } from 'react';
import LoginPage from './components/LoginPage';
import NutritionCheckerPage from './components/NutritionCheckerPage';
import { User } from './types';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white selection:bg-teal-500 selection:text-white">
      {currentUser ? (
        <NutritionCheckerPage user={currentUser} onLogout={handleLogout} />
      ) : (
        <LoginPage onLogin={handleLogin} />
      )}
    </div>
  );
};

export default App;
