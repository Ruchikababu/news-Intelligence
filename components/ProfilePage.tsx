import React, { useState } from 'react';
import type { Translations, User } from '../types';

interface ProfilePageProps {
  t: Translations;
  currentUser: User | null;
  onLogin: (email: string, pass: string) => Promise<void>;
  onSignUp: (name: string, email: string, pass: string) => Promise<void>;
  onLogout: () => void;
}

type AuthMode = 'login' | 'signup';

export const ProfilePage: React.FC<ProfilePageProps> = ({ t, currentUser, onLogin, onSignUp, onLogout }) => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setStatus('');
    try {
      if (mode === 'login') {
        await onLogin(email, password);
        setStatus(t.loginSuccess);
      } else { // signup
        await onSignUp(name, email, password);
        setStatus(t.signupSuccess);
      }
      setName('');
      setEmail('');
      setPassword('');
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    }
  };

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    setError('');
    setStatus('');
    setName('');
    setEmail('');
    setPassword('');
  };

  if (currentUser) {
    return (
      <main className="p-6 md:p-10">
        <div className="max-w-md mx-auto bg-secondary p-8 rounded-lg shadow-lg text-center">
          <h2 className="text-3xl font-bold text-highlight mb-4">{t.yourProfile}</h2>
          <p className="text-text-secondary mb-2">{t.loggedInAs}:</p>
          <p className="text-xl font-semibold text-text-primary">{currentUser.name}</p>
          <p className="text-md text-text-secondary mb-6">{currentUser.email}</p>
          <button
            onClick={onLogout}
            className="w-full bg-red-600 text-white font-bold py-2 px-4 rounded-md hover:bg-red-700 transition-colors duration-200"
          >
            {t.logout}
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="p-6 md:p-10">
      <div className="max-w-md mx-auto bg-secondary p-8 rounded-lg shadow-lg">
        <div className="flex border-b border-accent mb-6">
          <button
            onClick={() => switchMode('login')}
            className={`flex-1 py-2 text-center font-semibold transition-colors ${mode === 'login' ? 'text-highlight border-b-2 border-highlight' : 'text-text-secondary'}`}
          >
            {t.login}
          </button>
          <button
            onClick={() => switchMode('signup')}
            className={`flex-1 py-2 text-center font-semibold transition-colors ${mode === 'signup' ? 'text-highlight border-b-2 border-highlight' : 'text-text-secondary'}`}
          >
            {t.signup}
          </button>
        </div>

        <h2 className="text-2xl font-bold text-center text-text-primary mb-2">{mode === 'login' ? t.login : t.signup}</h2>
        <p className="text-text-secondary text-center mb-6">{t.authPrompt}</p>

        <form onSubmit={handleAuthSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-text-secondary mb-1">{t.yourName}</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-accent border border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-highlight"
              />
            </div>
          )}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-text-secondary mb-1">{t.email}</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full bg-accent border border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-highlight"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-text-secondary mb-1">{t.password}</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete={mode === 'login' ? "current-password" : "new-password"}
              className="w-full bg-accent border border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-highlight"
            />
          </div>

          {error && <p className="text-red-400 text-sm text-center">{error}</p>}
          {status && <p className="text-green-400 text-sm text-center">{status}</p>}

          <button
            type="submit"
            className="w-full bg-highlight text-primary font-bold py-2 px-4 rounded-md hover:bg-teal-300 transition-colors duration-200"
          >
            {mode === 'login' ? t.login : t.signup}
          </button>
        </form>
      </div>
    </main>
  );
};
