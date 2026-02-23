// Pagination
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

// Auth / User
export interface SubscriptionInfo {
  plan: string | null;
  status: string | null;
  current_period_end: string | null;
  trial_end: string | null;
}

export interface UserResponse {
  id: string;
  email: string;
  name: string | null;
  role: string;
  subscription: SubscriptionInfo;
  created_at: string;
  last_login_at: string | null;
}

// Test Sets
export interface TestSetItem {
  id: string;
  code: string;
  name: string;
  type: "listening" | "reading" | "speaking" | "writing";
  question_count: number;
  time_limit_minutes: number;
  is_free: boolean;
  order: number;
}

export interface TestSetDetail extends TestSetItem {
  serie_number: number | null;
  created_at: string;
  updated_at: string;
}

// Questions
export interface Option {
  key: string;
  text: string;
}

export interface QuestionBrief {
  id: string;
  question_number: number;
  type: "listening" | "reading" | "speaking" | "writing";
  level: string | null;
  audio_url: string | null;
  transcript: string | null;
  passage: string | null;
  question_text: string | null;
  options: Option[];
}

export interface SentenceTranslation {
  fr: string;
  zh: string;
  is_key?: boolean;
}

export interface DistractorAnalysis {
  text: string | null;
  trap_type: string | null;
  analysis: string | null;
}

export interface VocabularyItem {
  word: string | null;
  meaning: string | null;
  freq: string | null;
}

export interface Explanation {
  sentence_translation: SentenceTranslation[] | null;
  correct_reasoning: string | null;
  distractors: Record<string, DistractorAnalysis> | null;
  exam_skill: string | null;
  trap_pattern: string | null;
  vocabulary: VocabularyItem[] | null;
  similar_tip: string | null;
}

export interface QuestionDetail extends QuestionBrief {
  correct_answer: string | null;
  explanation: Explanation | null;
}

// Wrong Answers
export interface WrongAnswerItem {
  id: string;
  question_id: string;
  test_set_id: string;
  wrong_count: number;
  consecutive_correct: number;
  last_selected: string | null;
  last_wrong_at: string;
  is_mastered: boolean;
  question_number: number | null;
  question_type: "listening" | "reading" | null;
  level: string | null;
  question_text: string | null;
}

// Attempts
export interface CreateAttemptRequest {
  test_set_id: string;
  mode: "practice" | "exam" | "speed_drill";
}

export interface SubmitAnswerRequest {
  question_id: string;
  question_number: number;
  selected: string;
  time_spent_seconds?: number;
}

export interface AnswerResponse {
  question_id: string;
  question_number: number;
  selected: string | null;
  is_correct: boolean | null;
  correct_answer?: string | null;
  time_spent_seconds?: number | null;
  level?: string | null;
}

export interface AttemptResponse {
  id: string;
  test_set_id: string;
  test_set_name?: string | null;
  test_set_type?: string | null;
  mode: string;
  score: number | null;
  total: number;
  answered_count: number;
  flagged_questions: number[];
  status: "in_progress" | "completed" | "abandoned";
  started_at: string;
  completed_at: string | null;
}

export interface AttemptDetail extends AttemptResponse {
  test_set_name?: string | null;
  test_set_type?: string | null;
  answers: AnswerResponse[];
}

// Attempt creation response
export interface CreateAttemptResponse {
  id: string;
  test_set_id: string;
  mode: string;
  total: number;
  status: string;
  started_at: string;
}

// Complete attempt response
export interface CompleteAttemptResponse {
  id: string;
  score: number | null;
  total: number;
  answered_count: number;
  status: string;
  started_at: string | null;
  completed_at: string | null;
}

// Review types (for detailed post-exam review)
export interface ReviewAnswer {
  question_id: string;
  question_number: number;
  selected: string | null;
  is_correct: boolean | null;
  correct_answer: string | null;
  time_spent_seconds: number | null;
  level: string | null;
  type: string | null;
  question_text: string | null;
  options: Option[];
  passage: string | null;
  transcript: string | null;
  audio_url: string | null;
  explanation: Explanation | null;
}

// Stats History
export interface AccuracyTrendItem {
  attempt_id: string;
  score: number;
  total: number;
  accuracy: number;
  completed_at: string;
  mode: string;
  test_set_type: string | null;
}

export interface DailyPracticeItem {
  date: string;
  count: number;
}

export interface StatsHistory {
  accuracy_trend: AccuracyTrendItem[];
  daily_practice: DailyPracticeItem[];
  level_radar: Record<string, { answered: number; correct: number; accuracy: number }>;
}

// Wrong Answer Detail
export interface WrongAnswerStats {
  total: number;
  mastered: number;
  unmastered: number;
}

export interface WrongAnswerDetailQuestion {
  question_number: number | null;
  type: string | null;
  level: string | null;
  question_text: string | null;
  passage: string | null;
  transcript: string | null;
  audio_url: string | null;
  options: Option[];
  correct_answer: string | null;
  explanation: Explanation | null;
}

export interface WrongAnswerDetail {
  id: string;
  question_id: string;
  test_set_id: string;
  wrong_count: number;
  consecutive_correct: number;
  last_selected: string | null;
  is_mastered: boolean;
  question: WrongAnswerDetailQuestion | null;
}

export interface AttemptReview {
  id: string;
  test_set_id: string;
  test_set_name: string | null;
  test_set_type: string | null;
  mode: string;
  score: number | null;
  total: number;
  answered_count: number;
  flagged_questions: number[];
  status: string;
  started_at: string;
  completed_at: string | null;
  answers: ReviewAnswer[];
}
