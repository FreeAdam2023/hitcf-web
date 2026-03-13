import { get } from "./client";
import type { StatsHistory } from "./types";

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

export function getStatsHistory(): Promise<StatsHistory> {
  return get<StatsHistory>("/api/stats/history");
}

export interface DailyCheckinSection {
  questions_answered: number;
  correct: number;
  attempts: number;
}

export interface DailyCheckinData {
  date: string;
  user_name: string;
  streak_days: number;
  listening: DailyCheckinSection;
  reading: DailyCheckinSection;
  writing: { tasks_completed: number; best_score: number };
  speaking: {
    practice_count: number;
    conversation_count: number;
    best_score: number;
  };
  vocabulary_saved: number;
  total_practice_minutes: number;
  verification_hash: string;
  generated_at: string;
}

export function fetchDailyCheckin(): Promise<DailyCheckinData> {
  return get<DailyCheckinData>("/api/stats/daily-checkin");
}
