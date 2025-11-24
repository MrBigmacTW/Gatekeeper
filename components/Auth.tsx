
import React, { useState } from 'react';
import { isUserAllowed } from '../config/whitelist';
import { User } from '../types';

interface AuthProps {
  onLogin: (user: User) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [emailInput, setEmailInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Simulate network delay for realism
    setTimeout(() => {
      if (!emailInput) {
        setError("請輸入 Email 地址。");
        setIsLoading(false);
        return;
      }

      // In this version, we allow login even if not whitelisted, 
      // but the App.tsx will handle quota limits.
      onLogin({
        email: emailInput,
        name: emailInput.split('@')[0], // Simulate a name
        picture: `https://ui-avatars.com/api/?name=${emailInput}&background=random`
      });

      setIsLoading(false);
    }, 800);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] w-full animate-fade-in-up">
      <div className="glass-panel p-8 rounded-2xl max-w-md w-full border border-gray-700 shadow-2xl relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-600 rounded-full blur-[80px] opacity-40"></div>
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-600 rounded-full blur-[80px] opacity-40"></div>

        <div className="relative z-10 text-center">
          <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6 border border-gray-600 shadow-inner">
             <svg className="w-8 h-8 text-white" viewBox="0 0 24 24">
                <path fill="currentColor" d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/>
             </svg>
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-2">需要登入 (Login Required)</h2>
          <p className="text-gray-400 mb-8 text-sm">
            請輸入 Google 帳號以繼續。<br/>
            (白名單用戶享完整權限，其他用戶每日限 2 次)
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="email"
                placeholder="name@example.com"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                required
              />
            </div>

            {error && (
              <div className="p-3 bg-red-900/30 border border-red-500/50 rounded-lg text-red-400 text-sm flex items-center">
                <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-white hover:bg-gray-100 text-gray-900 font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>使用 Google 帳號登入</span>
                </>
              )}
            </button>
          </form>
          
          <p className="mt-6 text-xs text-gray-600">
            *模擬模式: 輸入 whitelist.ts 中的 Email 可獲得完整權限
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
