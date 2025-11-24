
import React, { useState, useCallback, useEffect } from 'react';
import { UploadIcon } from './components/Icons';
import Dashboard from './components/Dashboard';
import Auth from './components/Auth';
import History from './components/History';
import { analyzeVideo } from './services/geminiService';
import { saveHistory, getHistory, checkDailyQuota, incrementDailyQuota } from './services/storageService';
import { AppState, User, HistoryItem } from './types';
import { isUserAllowed } from './config/whitelist';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    status: 'idle',
    videoFile: null,
    videoUrl: null,
    result: null,
    error: null,
    user: null,
    view: 'analyze',
    history: []
  });

  const [showLoginModal, setShowLoginModal] = useState(false);

  // Computed property for full access (Whitelist)
  const isWhitelisted = state.user ? isUserAllowed(state.user.email) : false;
  
  // Non-whitelisted users get 2 free tries per day
  const DAILY_QUOTA = 2;

  // Load history when app starts or user changes
  useEffect(() => {
    // Only load history if user is logged in
    if (state.user) {
      const historyData = getHistory(state.user.email);
      setState(prev => ({ ...prev, history: historyData }));
    } else {
      setState(prev => ({ ...prev, history: [] }));
    }
  }, [state.user]);

  const handleLogin = (user: User) => {
    setState(prev => ({ ...prev, user }));
    setShowLoginModal(false);
  };

  const handleLogout = () => {
    setState(prev => ({
      ...prev,
      user: null,
      view: 'analyze',
      result: null,
      videoUrl: null,
      history: []
    }));
  };

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 1. Strict Login Check
    if (!state.user) {
      setShowLoginModal(true);
      // Reset the input so user can try again after login
      event.target.value = '';
      return;
    }

    // 2. Quota Check for Non-Whitelisted Users
    if (!isWhitelisted) {
      const quota = checkDailyQuota(state.user.email, DAILY_QUOTA);
      if (!quota.allowed) {
        setState(prev => ({ 
          ...prev, 
          error: `今日免費額度已用完 (${DAILY_QUOTA}/${DAILY_QUOTA})。請升級帳號或明日再來。` 
        }));
        return;
      }
    }

    if (file.size > 20 * 1024 * 1024) {
      setState(prev => ({ ...prev, error: "檔案過大。測試版請使用 20MB 以下的影片。" }));
      return;
    }

    const url = URL.createObjectURL(file);
    
    setState(prev => ({
      ...prev,
      status: 'analyzing',
      videoFile: file,
      videoUrl: url,
      result: null,
      error: null,
      view: 'analyze'
    }));

    try {
      const result = await analyzeVideo(file);
      
      // Save history
      const updatedHistory = saveHistory(state.user.email, file.name, result);
      
      // Increment usage if not whitelisted
      if (!isWhitelisted) {
        incrementDailyQuota(state.user.email);
      }
      
      setState(prev => ({ ...prev, status: 'complete', result, history: updatedHistory }));

    } catch (err: any) {
      console.error(err);
      setState(prev => ({ 
        ...prev, 
        status: 'error', 
        error: err.message || "分析失敗。請檢查 API Key 或稍後再試。" 
      }));
    }
  }, [state.user, isWhitelisted]);

  const handleReset = () => {
    if (state.videoUrl) URL.revokeObjectURL(state.videoUrl);
    setState(prev => ({
      ...prev,
      status: 'idle',
      videoFile: null,
      videoUrl: null,
      result: null,
      error: null,
    }));
  };

  const handleSelectHistoryItem = (item: HistoryItem) => {
    setState(prev => ({
      ...prev,
      status: 'complete',
      videoFile: null,
      videoUrl: null,
      result: item.result,
      error: null,
      view: 'analyze'
    }));
  };

  // Helper to show quota message
  const getQuotaMessage = () => {
    if (!state.user) return "請登入以開始分析";
    if (isWhitelisted) return "無限量使用 (Unlimited Access)";
    const quota = checkDailyQuota(state.user.email, DAILY_QUOTA);
    return `今日剩餘額度: ${quota.remaining} / ${DAILY_QUOTA}`;
  };

  return (
    <div className="min-h-screen bg-[#0f0f11] text-gray-100 flex flex-col items-center relative">
      
      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="relative w-full max-w-md">
            <button 
              onClick={() => setShowLoginModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white z-20"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <Auth onLogin={handleLogin} />
          </div>
        </div>
      )}

      {/* Header */}
      <header className="w-full py-4 px-8 border-b border-gray-800 bg-[#0f0f11]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setState(prev => ({...prev, view: 'analyze', status: 'idle', result: null, videoUrl: null}))}>
                <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center font-bold text-xl shadow-[0_0_15px_rgba(124,58,237,0.5)]">
                    G
                </div>
                <div>
                    <h1 className="text-xl font-bold tracking-tight hidden md:block">流量守門員 (Gatekeeper)</h1>
                </div>
            </div>

            {/* Navigation Tabs */}
            <nav className="flex space-x-1 bg-gray-900/50 p-1 rounded-lg border border-gray-800">
               <button 
                 onClick={() => setState(prev => ({...prev, view: 'analyze'}))}
                 className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${state.view === 'analyze' ? 'bg-gray-800 text-white shadow' : 'text-gray-400 hover:text-white'}`}
               >
                 分析器 (Analyzer)
               </button>
               <button 
                 onClick={() => setState(prev => ({...prev, view: 'history'}))}
                 className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${state.view === 'history' ? 'bg-gray-800 text-white shadow' : 'text-gray-400 hover:text-white'}`}
               >
                 歷史紀錄 (History)
               </button>
            </nav>
          </div>

          <div className="flex items-center space-x-4">
             {state.user ? (
               <div className="flex items-center space-x-4 animate-fade-in">
                 <div className="flex items-center space-x-2">
                    <img src={state.user.picture} alt={state.user.name} className="w-8 h-8 rounded-full border border-gray-600" />
                    <div className="flex flex-col text-left">
                      <span className="text-sm text-gray-200 leading-none">{state.user.name}</span>
                      <span className={`text-[10px] leading-none mt-1 ${isWhitelisted ? 'text-green-400' : 'text-yellow-500'}`}>
                        {isWhitelisted ? '專業版帳號 (Pro)' : '免費版帳號 (Free)'}
                      </span>
                    </div>
                 </div>
                 <button 
                    onClick={handleLogout}
                    className="text-xs text-red-400 hover:text-red-300 transition-colors border border-red-900/50 px-2 py-1 rounded"
                 >
                    登出 (Sign Out)
                 </button>
               </div>
             ) : (
               <button 
                  onClick={() => setShowLoginModal(true)}
                  className="bg-white text-black px-4 py-2 rounded-full text-sm font-bold hover:bg-gray-200 transition-colors flex items-center space-x-1"
               >
                  <span>登入 (Sign In)</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>
               </button>
             )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full flex-1 flex flex-col items-center p-4">
        
        {state.view === 'history' ? (
          <History history={state.history} onSelect={handleSelectHistoryItem} />
        ) : (
          /* Analyze View */
          <div className="w-full flex flex-col items-center justify-center min-h-[80vh]">
            
            {state.status === 'idle' && (
              <div className="w-full max-w-2xl text-center animate-fade-in-up">
                <h2 className="text-4xl md:text-6xl font-black mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 pb-2">
                  影片會爆紅嗎?
                </h2>
                <p className="text-xl text-gray-400 mb-8 max-w-lg mx-auto leading-relaxed">
                  上傳您的短影音。我們殘酷的 AI 演算法將預測您的觸及率。
                </p>

                {/* Quota/Status Badge */}
                <div className={`inline-flex items-center space-x-2 border px-3 py-1 rounded-full mb-8 ${
                    !state.user ? 'bg-gray-800 border-gray-700' :
                    isWhitelisted ? 'bg-green-900/20 border-green-500/30' : 'bg-yellow-900/20 border-yellow-500/30'
                }`}>
                     <span className={`w-2 h-2 rounded-full ${!state.user ? 'bg-gray-500' : isWhitelisted ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'}`}></span>
                     <span className={`text-xs font-bold uppercase tracking-wide ${!state.user ? 'text-gray-400' : isWhitelisted ? 'text-green-500' : 'text-yellow-500'}`}>
                        {getQuotaMessage()}
                     </span>
                </div>

                <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                    <div className="relative bg-[#1a1a20] rounded-xl border-2 border-dashed border-gray-600 hover:border-purple-500 transition-colors p-12 flex flex-col items-center justify-center">
                        <UploadIcon />
                        <label className="cursor-pointer">
                            <span className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 px-8 rounded-full shadow-lg transition-transform transform hover:scale-105 inline-block">
                                選擇影片檔案 (Select Video)
                            </span>
                            <input 
                                type="file" 
                                accept="video/mp4,video/quicktime,video/webm" 
                                className="hidden" 
                                onChange={handleFileUpload} 
                            />
                        </label>
                        <p className="mt-4 text-sm text-gray-500">支援 MP4, MOV, WebM (最大 20MB)</p>
                    </div>
                </div>
                
                {!state.user && (
                    <p className="mt-6 text-sm text-gray-500">
                        <span onClick={() => setShowLoginModal(true)} className="text-purple-400 hover:text-purple-300 cursor-pointer underline">登入</span> 以開始使用
                    </p>
                )}
              </div>
            )}

            {state.status === 'analyzing' && (
              <div className="text-center animate-pulse flex flex-col items-center">
                <div className="w-24 h-24 mb-6 relative">
                    <div className="absolute inset-0 rounded-full border-4 border-gray-700"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-t-purple-500 animate-spin"></div>
                </div>
                <h3 className="text-2xl font-bold mb-2">正在分析畫面...</h3>
                <p className="text-gray-400">Gemini 正在用嚴格的眼光審視您的內容</p>
                {state.videoUrl && (
                    <video 
                        src={state.videoUrl} 
                        className="mt-8 w-48 rounded-lg opacity-50 grayscale" 
                        autoPlay 
                        muted 
                        loop 
                        playsInline
                    />
                )}
              </div>
            )}

            {state.status === 'error' && (
              <div className="text-center max-w-md">
                <div className="w-16 h-16 bg-red-900/50 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <h3 className="text-xl font-bold text-red-400 mb-2">分析失敗 (Analysis Failed)</h3>
                <p className="text-gray-400 mb-6">{state.error}</p>
                <button 
                    onClick={handleReset}
                    className="px-6 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg font-medium transition-colors"
                >
                    再試一次
                </button>
              </div>
            )}

            {state.status === 'complete' && state.result && (
              <div className="w-full flex flex-col items-center">
                <div className="w-full max-w-6xl flex justify-between items-center mb-6 px-4">
                  <h3 className="text-gray-400">分析結果</h3>
                  <button 
                      onClick={handleReset}
                      className="text-sm px-4 py-2 rounded-full border border-gray-700 hover:bg-gray-800 transition-colors"
                  >
                      分析下一部
                  </button>
                </div>
                <Dashboard 
                  result={state.result} 
                  hasFullAccess={isWhitelisted} 
                  onUnlock={() => {}} // Remove unlock modal trigger since login is required now
                />
              </div>
            )}
          </div>
        )}
      </main>
      
      <footer className="w-full py-6 border-t border-gray-800 text-center text-gray-600 text-sm">
        <p>&copy; {new Date().getFullYear()} Viral Gatekeeper. Powered by Google Gemini API.</p>
      </footer>
    </div>
  );
};

export default App;
