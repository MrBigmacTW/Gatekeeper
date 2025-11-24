
import React from 'react';
import { AnalysisResult, TrafficSignal } from '../types';
import RetentionChart from './RetentionChart';
import { CheckCircleIcon, XCircleIcon, AlertIcon } from './Icons';

interface DashboardProps {
  result: AnalysisResult;
  hasFullAccess: boolean;
  onUnlock: () => void;
}

const SignalBadge = ({ status, label, reason }: { status: TrafficSignal; label: string; reason: string }) => {
  let colorClass = "";
  let Icon = null;

  switch (status) {
    case TrafficSignal.GREEN:
      colorClass = "bg-green-900/30 border-green-500/50 text-green-400";
      Icon = CheckCircleIcon;
      break;
    case TrafficSignal.YELLOW:
      colorClass = "bg-yellow-900/30 border-yellow-500/50 text-yellow-400";
      Icon = AlertIcon;
      break;
    case TrafficSignal.RED:
      colorClass = "bg-red-900/30 border-red-500/50 text-red-400";
      Icon = XCircleIcon;
      break;
  }

  return (
    <div className={`p-4 rounded-xl border ${colorClass} transition-all duration-300 hover:scale-[1.02]`}>
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-bold text-lg">{label}</h4>
        {Icon && <Icon className="w-6 h-6" />}
      </div>
      <p className="text-sm opacity-90 leading-relaxed">{reason}</p>
    </div>
  );
};

const Dashboard: React.FC<DashboardProps> = ({ result, hasFullAccess, onUnlock }) => {
  const isPass = result.verdict === "PASS";

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 animate-fade-in p-4 pb-20">
      
      {/* 1. FREE TIER: Hero Section (Always Visible) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Total Score */}
        <div className="md:col-span-1 glass-panel rounded-2xl p-8 flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500"></div>
          <span className="text-gray-400 uppercase tracking-widest text-xs font-bold mb-2">爆紅潛力 (Viral Potential)</span>
          <div className="relative">
            <svg className="w-40 h-40 transform -rotate-90">
              <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-gray-800" />
              <circle 
                cx="80" 
                cy="80" 
                r="70" 
                stroke="currentColor" 
                strokeWidth="10" 
                fill="transparent" 
                strokeDasharray={440} 
                strokeDashoffset={440 - (440 * result.totalScore) / 100} 
                className={isPass ? "text-green-500" : "text-purple-600"}
              />
            </svg>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
              <span className="text-5xl font-black text-white">{result.totalScore}</span>
            </div>
          </div>
          <div className="mt-4 text-center">
             {isPass ? (
                 <span className="inline-block px-4 py-1 rounded-full bg-green-500 text-black font-black transform -rotate-2 border-2 border-green-400 text-lg">通過 (PASS)</span>
             ) : (
                 <span className="inline-block px-4 py-1 rounded-full bg-red-600 text-white font-black transform rotate-2 border-2 border-red-500 text-lg">淘汰 (REJECTED)</span>
             )}
          </div>
        </div>

        {/* 3-Second Verdict & Scroll Rate */}
        <div className="md:col-span-2 glass-panel rounded-2xl p-8 flex flex-col justify-between">
           <div>
              <div className="flex items-center space-x-2 mb-4">
                  <span className="w-2 h-8 bg-purple-500 rounded-full"></span>
                  <h3 className="text-2xl font-bold text-white">3秒定生死 (The 3-Second Hook)</h3>
              </div>
              <p className="text-xl text-gray-200 font-medium mb-4">"{result.threeSecondVerdict}"</p>
           </div>
           
           <div className="mt-4 p-4 bg-gray-800/50 rounded-lg flex items-center justify-between border border-gray-700">
              <span className="text-gray-400 font-semibold">滑走率預測 (Scroll-Away Risk)</span>
              <span className={`text-xl font-bold ${
                  result.scrollAwayRate === 'High' ? 'text-red-500' : 
                  result.scrollAwayRate === 'Medium' ? 'text-yellow-500' : 'text-green-500'
              }`}>
                  {result.scrollAwayRate === 'High' ? '高風險 (High)' : 
                   result.scrollAwayRate === 'Medium' ? '中等風險 (Medium)' : '低風險 (Low)'}
              </span>
           </div>
        </div>
      </div>

      {/* 2. PAID TIER: Locked Content Container */}
      <div className="relative">
        
        {/* Lock Overlay */}
        {!hasFullAccess && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#0f0f11]/60 backdrop-blur-sm rounded-2xl border border-gray-700/50">
            <div className="p-8 glass-panel rounded-2xl border border-purple-500/30 text-center shadow-[0_0_50px_rgba(139,92,246,0.2)] transform transition-all hover:scale-105">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                 <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                 </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">解鎖完整分析報告</h3>
              <p className="text-gray-400 mb-6 max-w-sm">
                免費版僅提供基本評分。請聯繫管理員加入白名單以查看詳細圖表與 AI 建議。
              </p>
              {/* Button removed as unlocking is done via whitelist config now, but kept visual for effect */}
              <div className="bg-gray-800 text-gray-400 py-2 px-6 rounded-full text-sm">
                 需白名單權限
              </div>
            </div>
          </div>
        )}

        {/* Blurred Content */}
        <div className={`space-y-8 transition-all duration-500 ${!hasFullAccess ? 'filter blur-md opacity-50 select-none pointer-events-none' : ''}`}>
            
            {/* Traffic Light Grid */}
            <div>
                <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                    核心指標分析 (Core Metrics)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <SignalBadge status={result.metrics.visualHook} label="視覺鉤子 (Visual Hook)" reason={result.metrics.visualHookReason} />
                    <SignalBadge status={result.metrics.audio} label="聽覺體驗 (Audio)" reason={result.metrics.audioReason} />
                    <SignalBadge status={result.metrics.infoDensity} label="資訊密度 (Pacing)" reason={result.metrics.infoDensityReason} />
                    <SignalBadge status={result.metrics.subtitle} label="字幕 (Subtitles)" reason={result.metrics.subtitleReason} />
                    <SignalBadge status={result.metrics.emotionalTrigger} label="情緒觸發 (Emotion)" reason={result.metrics.emotionalTriggerReason} />
                </div>
            </div>

            {/* Retention Graph */}
            <div className="glass-panel rounded-2xl p-6 border border-gray-700">
                <h3 className="text-xl font-bold text-white mb-6">完播率預測 (Audience Retention Forecast)</h3>
                <RetentionChart data={result.retentionGraph} />
                <p className="mt-4 text-sm text-gray-500 text-center">基於相似內容演算法模擬 (Algorithm Simulation)</p>
            </div>

            {/* Critique Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass-panel rounded-2xl p-6 border-t-4 border-purple-500">
                    <h4 className="text-lg font-bold text-purple-400 mb-2 uppercase tracking-wider">亮點 (The X-Factor)</h4>
                    <p className="text-gray-200 text-lg leading-relaxed">{result.qualitative.xFactor}</p>
                </div>
                <div className="glass-panel rounded-2xl p-6 border-t-4 border-red-500">
                    <h4 className="text-lg font-bold text-red-400 mb-2 uppercase tracking-wider">致命傷 (The Killer)</h4>
                    <p className="text-gray-200 text-lg leading-relaxed">{result.qualitative.killer}</p>
                </div>
            </div>

            {/* Actionable Advice */}
            <div className="glass-panel rounded-2xl p-8 bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700">
                <h3 className="text-2xl font-bold text-white mb-4">🎬 導演筆記 (Director's Note)</h3>
                <p className="text-xl text-gray-200 font-medium leading-loose">
                    {result.qualitative.actionableAdvice}
                </p>
            </div>
        </div>
      </div>

      {/* Cost & Usage Info */}
      {result.tokenUsage && hasFullAccess && (
        <div className="mt-8 p-4 rounded-lg bg-gray-900/50 border border-gray-800 text-center text-gray-500 text-xs font-mono">
            <div className="flex flex-col md:flex-row justify-center items-center space-y-2 md:space-y-0 md:space-x-6">
                <span>💰 預估成本: <span className="text-green-400">${result.tokenUsage.estimatedCost} USD</span></span>
                <span>📊 輸入 Tokens: {result.tokenUsage.promptTokens.toLocaleString()}</span>
                <span>📝 輸出 Tokens: {result.tokenUsage.candidatesTokens.toLocaleString()}</span>
                <span>🧮 總計: {result.tokenUsage.totalTokens.toLocaleString()}</span>
            </div>
            <p className="mt-2 opacity-60 text-[10px]">*成本估算基於 Gemini 1.5 Flash 定價 ($0.075/1M input, $0.30/1M output).</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
