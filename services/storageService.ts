
import { HistoryItem, AnalysisResult } from '../types';

const STORAGE_KEY_PREFIX = 'viral_gatekeeper_history_';
const QUOTA_KEY_PREFIX = 'viral_gatekeeper_quota_';

export const saveHistory = (email: string | 'guest', fileName: string, result: AnalysisResult) => {
  const key = `${STORAGE_KEY_PREFIX}${email}`;
  const existingData = localStorage.getItem(key);
  const history: HistoryItem[] = existingData ? JSON.parse(existingData) : [];

  const newItem: HistoryItem = {
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    fileName,
    result
  };

  // Prepend new item (newest first)
  const updatedHistory = [newItem, ...history];
  
  // Limit to last 50 items to prevent storage quota issues
  if (updatedHistory.length > 50) {
    updatedHistory.length = 50;
  }

  localStorage.setItem(key, JSON.stringify(updatedHistory));
  return updatedHistory;
};

export const getHistory = (email: string | 'guest'): HistoryItem[] => {
  const key = `${STORAGE_KEY_PREFIX}${email}`;
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

export const clearHistory = (email: string | 'guest') => {
  const key = `${STORAGE_KEY_PREFIX}${email}`;
  localStorage.removeItem(key);
};

// Quota Management
export const checkDailyQuota = (email: string, limit: number): { allowed: boolean; remaining: number } => {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const key = `${QUOTA_KEY_PREFIX}${email}_${today}`;
  
  const countStr = localStorage.getItem(key);
  const count = countStr ? parseInt(countStr, 10) : 0;

  return {
    allowed: count < limit,
    remaining: Math.max(0, limit - count)
  };
};

export const incrementDailyQuota = (email: string) => {
  const today = new Date().toISOString().split('T')[0];
  const key = `${QUOTA_KEY_PREFIX}${email}_${today}`;
  
  const countStr = localStorage.getItem(key);
  const count = countStr ? parseInt(countStr, 10) : 0;
  
  localStorage.setItem(key, (count + 1).toString());
};
