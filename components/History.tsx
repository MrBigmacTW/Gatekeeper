
import React from 'react';
import { HistoryItem, TrafficSignal } from '../types';

interface HistoryProps {
  history: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
}

const History: React.FC<HistoryProps> = ({ history, onSelect }) => {
  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500 animate-fade-in">
        <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-lg">尚無歷史紀錄</p>
        <p className="text-sm">開始分析影片來建立您的資料庫</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto py-8 animate-fade-in">
      <h2 className="text-2xl font-bold text-white mb-6 px-4">分析資料庫 (Archive)</h2>
      <div className="grid gap-4 px-4">
        {history.map((item) => {
          const isPass = item.result.verdict === 'PASS';
          const date = new Date(item.timestamp).toLocaleDateString();
          const time = new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

          return (
            <div 
              key={item.id}
              onClick={() => onSelect(item)}
              className="glass-panel p-4 rounded-xl border border-gray-700 hover:border-purple-500 cursor-pointer transition-all duration-200 hover:bg-gray-800/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
            >
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-1">
                  <span className={`px-2 py-0.5 text-xs font-bold rounded ${
                    isPass ? 'bg-green-900/50 text-green-400 border border-green-500/30' : 'bg-red-900/50 text-red-400 border border-red-500/30'
                  }`}>
                    {isPass ? '通過' : '淘汰'}
                  </span>
                  <span className="text-xs text-gray-500 font-mono">{date} {time}</span>
                </div>
                <h3 className="font-semibold text-gray-200 truncate max-w-md">{item.fileName}</h3>
                <p className="text-sm text-gray-400 mt-1 line-clamp-1">{item.result.qualitative.xFactor}</p>
              </div>

              <div className="flex items-center space-x-6 w-full md:w-auto justify-between md:justify-end">
                <div className="text-center">
                    <span className="block text-xs text-gray-500 uppercase">總分</span>
                    <span className={`text-xl font-black ${
                        item.result.totalScore >= 80 ? 'text-green-400' : 
                        item.result.totalScore >= 60 ? 'text-yellow-400' : 'text-red-400'
                    }`}>{item.result.totalScore}</span>
                </div>

                <div className="flex items-center space-x-2">
                    {/* Tiny traffic lights */}
                    <div className={`w-3 h-3 rounded-full ${item.result.metrics.visualHook === TrafficSignal.GREEN ? 'bg-green-500' : item.result.metrics.visualHook === TrafficSignal.YELLOW ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
                    <div className={`w-3 h-3 rounded-full ${item.result.metrics.audio === TrafficSignal.GREEN ? 'bg-green-500' : item.result.metrics.audio === TrafficSignal.YELLOW ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
                    <div className={`w-3 h-3 rounded-full ${item.result.metrics.infoDensity === TrafficSignal.GREEN ? 'bg-green-500' : item.result.metrics.infoDensity === TrafficSignal.YELLOW ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
                </div>

                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default History;
