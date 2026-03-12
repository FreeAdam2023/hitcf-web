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
  ui_language: string;
  subscription: SubscriptionInfo;
  exam_date: string | null;
  watermark_visible?: boolean;
  created_at: string;
  last_login_at: string | null;
}

// Test Sets
export interface TestSetItem {
  id: string;
  code: string;
  name: string;
  type: "listening" | "reading" | "speaking" | "writing";
  exam_type?: string;
  question_count: number;
  time_limit_minutes: number;
  is_free: boolean;
  order: number;
  source_date: string | null;
}

export interface WritingTopicItem {
  question_id: string;
  question_text: string;
  passage: string;
  test_set_id: string;
  source_date: string | null;
  test_set_name: string;
  is_free: boolean;
  word_limit: string | null;
  topic: string | null;
  topic_zh: string | null;
}

export interface TestSetDetail extends TestSetItem {
  serie_number: number | null;
  created_at: string;
  updated_at: string;
}

// Audio Timestamps (Whisper-generated)
export interface AudioSegment {
  text: string;
  start: number;
  end: number;
  sentence_index: number | null;
  en?: string | null;
  zh?: string | null;
  ar?: string | null;
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
  question_text_zh?: string | null;
  question_text_en?: string | null;
  question_text_ar?: string | null;
  options: Option[];
  topic?: string | null;
  topic_zh?: string | null;
  has_image?: boolean;
  audio_timestamps?: AudioSegment[] | null;
  /** Source test set name (for cross-set practice like speed drill / mock exam) */
  test_set_name?: string | null;
  /** Original question number within its source test set */
  original_question_number?: number | null;
}

export interface SentenceTranslation {
  fr: string;
  en: string;
  zh?: string;
  /** Locale-resolved translation (set by backend based on user's locale) */
  native?: string;
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

export interface OptionTranslation {
  en: string;
  zh?: string;
  /** Locale-resolved translation (set by backend based on user's locale) */
  native?: string;
}

export interface Explanation {
  sentence_translation: SentenceTranslation[] | null;
  correct_reasoning: string | null;
  distractors: Record<string, DistractorAnalysis> | null;
  exam_skill: string | null;
  trap_pattern: string | null;
  vocabulary: VocabularyItem[] | null;
  similar_tip: string | null;
  transcript_en: string | null;
  transcript_zh: string | null;
  /** Transcript in user's locale (set by backend) */
  transcript_native: string | null;
  option_translations: Record<string, OptionTranslation> | null;
  /** Which locale this explanation was serialized for */
  locale?: string;
}

export interface SentenceAnalysisCollocation {
  phrase: string;
  meaning: string;
  meaning_en: string;
  example: string;
}

export interface SentenceAnalysisGrammar {
  name: string;
  name_zh: string;
  rule: string;
  note: string;
}

export interface SentenceAnalysis {
  sentence: string;
  structure: string;
  structure_en: string;
  tense: string | null;
  tense_zh: string | null;
  tense_note: string | null;
  collocations: SentenceAnalysisCollocation[];
  grammar: SentenceAnalysisGrammar[];
}

export interface GrammarCardExample {
  fr: string;
  en: string;
  zh: string;
}

export interface GrammarCard {
  slug: string;
  name: string;
  name_zh: string;
  name_en: string;
  category: string;
  level: string;
  rule: string;
  rule_zh: string;
  explanation: string;
  explanation_en: string;
  examples: GrammarCardExample[];
  irregulars: string | null;
  tags: string[];
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
  created_at: string | null;
  is_mastered: boolean;
  question_number: number | null;
  question_type: "listening" | "reading" | null;
  level: string | null;
  question_text: string | null;
  test_set_name: string | null;
}

// Attempts
export interface ActiveAttemptResponse {
  id: string;
  test_set_id: string;
  mode: string;
  total: number;
  answered_count: number;
  status: string;
  started_at: string;
}

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
  is_mock_exam?: boolean;
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
  filtered_question_ids?: string[];
  previously_answered_ids?: string[];
}

// Attempt creation response
export interface CreateAttemptResponse {
  id: string;
  test_set_id: string;
  mode: string;
  total: number;
  status: string;
  started_at: string;
  previously_answered_ids?: string[];
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
  /** Original question number within its source test set (differs from question_number in speed drill) */
  original_question_number?: number | null;
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
  has_image: boolean;
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
  is_mock_exam?: boolean;
  mode: "practice" | "exam" | "speed_drill";
  score: number | null;
  total: number;
  answered_count: number;
  flagged_questions: number[];
  status: string;
  started_at: string;
  completed_at: string | null;
  answers: ReviewAnswer[];
}

// Writing Hints
export interface WritingHintCard {
  angle: string;
  title_fr: string;
  title_native: string;
  key_phrases: string[];
  brief: string;
}

// Writing Sidebar
export interface WritingSidebarItem {
  test_set_id: string;
  name: string;
  combinaison_number: number | null;
  status: "not_started" | "in_progress" | "completed";
  best_score: number | null;
  question_count: number;
}

// Writing Grading
export interface CriterionFeedback {
  score: number;
  feedback: string;
  highlights: string[];
}

export interface CorrectionItem {
  original: string;
  corrected: string;
  explanation: string;
}

export interface VocabSuggestionItem {
  original: string;
  suggestion: string;
  reason: string;
}

export interface WritingFeedback {
  adequation: CriterionFeedback;
  coherence: CriterionFeedback;
  vocabulaire: CriterionFeedback;
  grammaire: CriterionFeedback;
  total_score: number;
  estimated_nclc: string;
  estimated_level: string;
  overall_comment: string;
  corrections: CorrectionItem[];
  vocab_suggestions: VocabSuggestionItem[];
}

export interface WritingGradeResponse {
  id: string;
  user_id: string;
  question_id: string;
  test_set_id: string;
  task_number: number;
  essay_text: string;
  word_count: number;
  feedback: WritingFeedback;
  created_at: string;
}

export type WritingSubmissionItem = WritingGradeResponse;

// Writing Attempts
export interface WritingAttemptResponse {
  id: string;
  user_id: string;
  test_set_id: string;
  mode: "practice" | "exam";
  status: "in_progress" | "grading" | "completed" | "abandoned";
  essays: Record<string, { text: string; word_count: number }>;
  total_score: number | null;
  average_nclc: string | null;
  started_at: string;
  completed_at: string | null;
  time_limit_seconds: number;
  submission_ids: string[];
}

export interface WritingAttemptResults {
  id: string;
  test_set_id: string;
  mode: "practice" | "exam";
  status: string;
  total_score: number | null;
  average_nclc: string | null;
  started_at: string;
  completed_at: string | null;
  time_limit_seconds: number;
  tasks: WritingAttemptTaskResult[];
}

export interface WritingAttemptTaskResult {
  task_number: number;
  essay_text: string;
  word_count: number;
  feedback: WritingFeedback | null;
}

// Speaking Attempts
export interface SpeakingAttemptResponse {
  id: string;
  user_id: string;
  test_set_id: string;
  question_id: string;
  mode: "practice" | "exam";
  status: "in_progress" | "completed" | "abandoned";
  transcript: string;
  duration_seconds: number;
  scores: {
    accuracy: number;
    fluency: number;
    completeness: number;
    prosody: number;
    overall: number;
  } | null;
  word_scores: Array<{
    word: string;
    accuracy: number;
    errorType: string;
  }>;
  started_at: string;
  completed_at: string | null;
  prep_time_seconds: number;
  speaking_time_seconds: number;
  test_set_name: string | null;
}

// Speaking Conversations (AI Examiner)
export interface ConversationTurnResponse {
  role: "user" | "examiner";
  text: string;
  timestamp: string;
  pronunciation_scores: Record<string, number> | null;
  word_scores: Array<{ word: string; accuracy: number; errorType: string }>;
}

export interface SpeakingCriterionFeedbackResponse {
  score: number;
  feedback: string;
  highlights: string[];
}

export interface SpeakingEvaluationResponse {
  prononciation: SpeakingCriterionFeedbackResponse;
  fluidite: SpeakingCriterionFeedbackResponse;
  grammaire: SpeakingCriterionFeedbackResponse;
  vocabulaire: SpeakingCriterionFeedbackResponse;
  accomplissement: SpeakingCriterionFeedbackResponse;
  adequation_sociolinguistique: SpeakingCriterionFeedbackResponse;
  total_score: number;
  estimated_nclc: string;
  estimated_level: string;
  overall_comment: string;
  corrections: Array<{ original: string; corrected: string; explanation: string }>;
  vocab_suggestions: Array<{ original: string; suggestion: string; reason: string }>;
}

export interface SceneBriefing {
  scenario: string;
  your_role: string;
  examiner_role: string;
  target_duration: string;
  tache_type: number;
}

export interface SpeakingConversationResponse {
  id: string;
  user_id: string;
  test_set_id: string | null;
  question_id: string | null;
  tache_type: number;
  status: "pending" | "active" | "completed" | "abandoned";
  turns: ConversationTurnResponse[];
  turn_count: number;
  scene_briefing: SceneBriefing | null;
  prep_time_seconds: number;
  speaking_time_seconds: number;
  duration_seconds: number;
  evaluation: SpeakingEvaluationResponse | null;
  azure_scores: Record<string, number> | null;
  started_at: string;
  conversation_started_at: string | null;
  completed_at: string | null;
}

export interface BeginConversationResponse {
  examiner_text: string;
  turn_count: number;
}

export interface TurnResponse {
  examiner_text: string;
  turn_count: number;
}

// Saved Words
export interface SavedWordItem {
  id: string;
  word: string;
  source_type: string | null;
  test_set_id: string | null;
  test_set_name: string | null;
  question_number: number | null;
  sentence: string | null;
  created_at: string;
  // Joined from vocabulary_cards:
  meaning_zh: string | null;
  meaning_en: string | null;
  meaning_native: string | null;
  ipa: string | null;
  cefr_level: string | null;
  part_of_speech: string | null;
  audio_url: string | null;
  display_form: string | null;
  gender: string | null;
  article: string | null;
}

export interface SavedWordStats {
  total: number;
  by_source_type: Record<string, number>;
}

// Nihao French Words
export interface NihaoWordItem {
  id: string;
  word: string;
  display_form: string;
  level: string;
  lesson: number;
  lesson_title: string | null;
  theme: string | null;
  example_fr: string | null;
  example_zh: string | null;
  part_of_speech: string | null;
  gender: string | null;
  ipa: string | null;
  meaning_zh: string | null;
  meaning_en: string | null;
  cefr_level: string | null;
  audio_url: string | null;
}

export interface NihaoFilters {
  levels: string[];
  lessons: { lesson: number; level: string; lesson_title: string | null }[];
  themes: string[];
}

export interface NihaoStats {
  total: number;
  by_level: Record<string, number>;
}

// Theme Words (thematic vocabulary pool)
export interface ThemeWordItem {
  id: string;
  word: string;
  display_form: string;
  tag: string;
  tag_zh: string;
  tag_category: string;
  meaning_zh: string | null;
  meaning_en: string | null;
  example_fr: string | null;
  example_zh: string | null;
  part_of_speech: string | null;
  gender: string | null;
  ipa: string | null;
  cefr_level: string | null;
  audio_url: string | null;
}

export interface ThemeTagInfo {
  tag: string;
  tag_zh: string;
  tag_category: string;
  count: number;
}

export interface ThemeFilters {
  tags: ThemeTagInfo[];
  categories: string[];
}

export interface ThemeStats {
  total: number;
  by_category: Record<string, { word_count: number; tag_count: number }>;
}

// Vocabulary Card
export interface ConjugationTable {
  je: string;
  tu: string;
  il: string;
  nous: string;
  vous: string;
  ils: string;
}

export interface AdjectiveForms {
  masculine_singular: string;
  feminine_singular: string;
  masculine_plural: string;
  feminine_plural: string;
}

export interface VocabularyCardData {
  word: string;
  display_form: string;
  ipa: string | null;
  part_of_speech: string | null;
  gender: string | null;
  article: string | null;
  plural_form?: string | null;
  meaning_en: string | null;
  meaning_zh: string | null;
  /** Meaning in the user's requested locale */
  meaning_native: string | null;
  /** Polysemy: up to 4 common senses */
  senses?: { zh: string; en: string; native?: string }[];
  /** Which locale this response was serialized for */
  locale?: string;
  // Verb
  verb_group?: number;
  present?: ConjugationTable;
  passe_compose?: ConjugationTable;
  imparfait?: ConjugationTable;
  futur_simple?: ConjugationTable;
  conditionnel?: ConjugationTable;
  subjonctif?: ConjugationTable;
  past_participle?: string;
  auxiliary?: string;
  // Adjective
  adjective_forms?: AdjectiveForms;
  // Other
  examples: { fr: string; en: string; zh?: string; native?: string }[];
  cefr_level: string | null;
  audio_url: string | null;
  // Word family (if the word belongs to a curated group)
  word_family?: {
    group_key: string;
    label_zh: string;
    label_en: string;
    emoji: string;
    members: { word: string; display: string; display_full: string; meaning_zh: string }[];
    current_word: string;
  };
}
