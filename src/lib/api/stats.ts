import { get } from "./client";

export interface LevelStatsItem {
  answered: number;
  correct: number;
  accuracy: number;
}

export interface RecentAttemptItem {
  id: string;
  test_set_id: string;
  mode: string;
  score: number | null;
  total: number;
  completed_at: string | null;
}

export interface StatsOverview {
  total_attempts: number;
  total_questions_answered: number;
  accuracy_rate: number;
  listening_accuracy: number;
  reading_accuracy: number;
  by_level: Record<string, LevelStatsItem>;
  streak_days: number;
  last_practice_at: string | null;
  recent_attempts: RecentAttemptItem[];
}

export function getStatsOverview(): Promise<StatsOverview> {
  return get<StatsOverview>("/api/stats/overview");
}
