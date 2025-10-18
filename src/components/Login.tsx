// src/components/Login.tsx

import React, { useState } from 'react';
import { User, Lock } from 'lucide-react';

interface Props {
  onLogin: (isLoggedIn: boolean) => void;
}

const Login: React.FC<Props> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Your login credentials remain the same
    if (username === 'samyuktha123' && password === '2013') {
      onLogin(true);
    } else {
      setError('Invalid username or password');
    }
  };

  return (
    // Main container with a dark, gradient background
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900">
      
      {/* "Glass" Login Form Container */}
      <div className="max-w-sm w-full bg-black/20 backdrop-blur-lg rounded-2xl shadow-xl p-8 space-y-8">
        
        {/* User Icon Placeholder */}
        <div className="flex justify-center">
          <div className="h-24 w-24 bg-white/10 rounded-full flex items-center justify-center">
            <User className="h-12 w-12 text-white/50" />
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {/* Username Field */}
          <div className="relative flex items-center">
            <User className="absolute left-3 h-5 w-5 text-white/40" />
            <input
              id="username"
              name="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full pl-10 bg-transparent border-0 border-b-2 border-white/20 focus:border-white/60 focus:ring-0 py-2 text-lg text-white placeholder:text-white/40 transition-colors"
              placeholder="Username"
              required
            />
          </div>

          {/* Password Field */}
          <div className="relative flex items-center">
            <Lock className="absolute left-3 h-5 w-5 text-white/40" />
            <input
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 bg-transparent border-0 border-b-2 border-white/20 focus:border-white/60 focus:ring-0 py-2 text-lg text-white placeholder:text-white/40 transition-colors"
              placeholder="Password"
              required
            />
          </div>

          {error && <p className="text-red-400 text-sm text-center !mt-4">{error}</p>}

          {/* Login Button */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 rounded-xl transition-all duration-300 text-lg shadow-lg !mt-10"
          >
            LOGIN
          </button>

        </form>
      </div>
    </div>
  );
};

export default Login;