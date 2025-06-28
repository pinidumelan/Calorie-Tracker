
import React, { useState } from 'react';
import { User } from '../types';

interface LoginPageProps {
  onLogin: (user: User) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      onLogin({ email });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md p-8 space-y-8 bg-gray-800 rounded-xl shadow-2xl">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-teal-400">NutriVision AI</h1>
          <p className="mt-2 text-gray-400">Your personal AI-powered nutrition guide.</p>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="relative">
            <input
              id="email"
              name="email"
              type="email"
              required
              className="peer h-10 w-full bg-gray-700 border-2 border-gray-600 text-gray-100 placeholder-transparent rounded-lg focus:outline-none focus:border-teal-400 p-2"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <label
              htmlFor="email"
              className="absolute left-2 -top-5 text-gray-400 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-2 peer-focus:-top-5 peer-focus:text-teal-400 peer-focus:text-sm"
            >
              Email address
            </label>
          </div>
          <div className="relative">
            <input
              id="password"
              name="password"
              type="password"
              required
              className="peer h-10 w-full bg-gray-700 border-2 border-gray-600 text-gray-100 placeholder-transparent rounded-lg focus:outline-none focus:border-teal-400 p-2"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <label
              htmlFor="password"
              className="absolute left-2 -top-5 text-gray-400 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-2 peer-focus:-top-5 peer-focus:text-teal-400 peer-focus:text-sm"
            >
              Password
            </label>
          </div>
          <div>
            <button
              type="submit"
              className="w-full py-3 px-4 text-lg font-semibold rounded-lg text-gray-900 bg-teal-400 hover:bg-teal-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-teal-400 transition-all duration-300"
            >
              {isSignUp ? 'Sign Up' : 'Log In'}
            </button>
          </div>
        </form>
        <p className="text-sm text-center text-gray-400">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}
          <button onClick={() => setIsSignUp(!isSignUp)} className="ml-1 font-medium text-teal-400 hover:text-teal-300">
            {isSignUp ? 'Log In' : 'Sign Up'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
