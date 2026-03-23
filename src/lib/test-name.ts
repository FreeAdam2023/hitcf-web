/**
 * Generate a localized test name from type + raw name.
 * Extracts the number from the raw DB name (e.g. "听力测试 37" → 37)
 * and returns a translated string like "Listening Test 37".
 *
 * @param t - next-intl translation function
 * @param type - "listening" | "reading" | "speaking" | "writing"
 * @param rawName - the raw name from the database
 */
export function localizeTestName(
  t: (key: string, values?: Record<string, string | number>) => string,
  type: string,
  rawName: string,
): string {
  // Standard names: "听力测试 1" / "Compréhension Écrite test 01"
  const standardPattern = /^(?:听力测试|阅读测试|口语测试|写作测试|Compréhension\s+(?:Orale|Écrite)\s+test|Expression\s+(?:Orale|Écrite)\s+test)\s*(\d+)$/i;
  const match = rawName.match(standardPattern);
  if (match) {
    const num = match[1];
    const keyMap: Record<string, string> = {
      listening: "tests.listeningTestName",
      reading: "tests.readingTestName",
      speaking: "tests.speakingTestName",
      writing: "tests.writingTestName",
    };
    const key = keyMap[type];
    if (key) {
      return t(key, { num });
    }
  }

  // Supplementary tests: "听力补充测试 1" / "阅读补充测试 2"
  const suppPattern = /^(?:听力补充测试|阅读补充测试|Supplementary\s+(?:Listening|Reading)\s+Test)\s*(\d+)$/i;
  const suppMatch = rawName.match(suppPattern);
  if (suppMatch) {
    const num = suppMatch[1];
    const suppKeyMap: Record<string, string> = {
      listening: "tests.listeningSupplementaryName",
      reading: "tests.readingSupplementaryName",
    };
    const key = suppKeyMap[type];
    if (key) {
      return t(key, { num });
    }
  }

  // Random mock exam: "随机模考"
  if (rawName === "随机模考" || rawName === "Random Mock Exam") {
    return t("tests.randomMockExam");
  }

  return rawName;
}

/**
 * Get the localized topic string based on locale.
 * Falls back: locale-specific → French original.
 */
export function getLocalizedTopic(
  locale: string,
  topic?: string | null,
  topicZh?: string | null,
  topicEn?: string | null,
  topicAr?: string | null,
): string | null {
  switch (locale) {
    case "zh":
      return topicZh || topic || null;
    case "en":
      return topicEn || topic || null;
    case "ar":
      return topicAr || topic || null;
    default:
      return topic || null;
  }
}
