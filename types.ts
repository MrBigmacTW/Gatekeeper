
export enum TrafficSignal {
  GREEN = "GREEN",
  YELLOW = "YELLOW",
  RED = "RED"
}

export interface RetentionPoint {
  second: string;
  percentage: number;
}

export interface TokenUsage {
  promptTokens: number;
  candidatesTokens: number;
  totalTokens: number;
  estimatedCost: string;
}

export interface AnalysisResult {
  totalScore: number;
  verdict: "PASS" | "FAIL";
  scrollAwayRate: "High" | "Medium" | "Low";
  threeSecondVerdict: string;
  metrics: {
    visualHook: TrafficSignal;
    visualHookReason: string;
    audio: TrafficSignal;
    audioReason: string;
    infoDensity: TrafficSignal;
    infoDensityReason: string;
    subtitle: TrafficSignal;
    subtitleReason: string;
    emotionalTrigger: TrafficSignal;
    emotionalTriggerReason: string;
  };
  retentionGraph: RetentionPoint[];
  qualitative: {
    xFactor: string;
    killer: string;
    actionableAdvice: string;
  };
  tokenUsage?: TokenUsage;
}

export interface User {
  email: string;
  name: string;
  picture?: string;
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  thumbnailUrl?: string; // Optional, might not persist well in local storage if large
  fileName: string;
  result: AnalysisResult;
}

export type ViewState = 'analyze' | 'history';

export interface AppState {
  status: 'idle' | 'analyzing' | 'complete' | 'error';
  videoFile: File | null;
  videoUrl: string | null;
  result: AnalysisResult | null;
  error: string | null;
  user: User | null;
  view: ViewState;
  history: HistoryItem[];
}
