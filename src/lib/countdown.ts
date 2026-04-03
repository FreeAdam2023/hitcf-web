/**
 * Countdown utility functions for exam date feature.
 */

/** Map days-until-exam to a phase message key. */
export function getPhaseMessage(days: number): string {
  if (days < 0) return "phasePast";
  if (days === 0) return "phaseToday";
  if (days <= 7) return "phaseReady";
  if (days <= 14) return "phaseFinal";
  if (days <= 30) return "phaseSprint";
  if (days <= 60) return "phaseSteady";
  return "phaseRelax";
}

/** Calculate days between today and a date string (YYYY-MM-DD). */
export function getDaysUntil(dateStr: string): number {
  const target = new Date(dateStr + "T00:00:00");
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((target.getTime() - todayStart.getTime()) / (1000 * 60 * 60 * 24));
}

/** Return the cancel deadline (14 days before exam) as YYYY-MM-DD. */
export function getCancelDeadline(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() - 14);
  return d.toISOString().slice(0, 10);
}

/** Exam center info for countdown display. */
export const EXAM_CENTERS: Record<string, { address: string; mapsUrl: string; registrationUrl: string }> = {
  ottawa: {
    address: "352 MacLaren St, Ottawa, ON K2P 0M6",
    mapsUrl: "https://maps.google.com/?q=Alliance+Fran%C3%A7aise+d'Ottawa+352+MacLaren+St",
    registrationUrl: "https://af.ca/ottawa/en/exam-type-details/?examinationTypeId=5",
  },
  toronto: {
    address: "24 Spadina Rd, Toronto, ON M5R 2S7",
    mapsUrl: "https://maps.google.com/?q=Alliance+Fran%C3%A7aise+de+Toronto+24+Spadina+Rd",
    registrationUrl: "https://www.alliance-francaise.ca/en/exams/tests/informations-about-tcf-canada/tcf-canada",
  },
  montreal: {
    address: "1425 Blvd René-Lévesque O, Montréal, QC H3G 1T7",
    mapsUrl: "https://maps.google.com/?q=Alliance+Fran%C3%A7aise+de+Montr%C3%A9al+1425+Ren%C3%A9-L%C3%A9vesque",
    registrationUrl: "https://www.afmontreal.ca/en/exam-type-details/?examinationTypeId=5",
  },
  vancouver: {
    address: "6161 Cambie St, Vancouver, BC V5Z 3B2",
    mapsUrl: "https://maps.google.com/?q=Alliance+Fran%C3%A7aise+de+Vancouver+6161+Cambie+St",
    registrationUrl: "https://www.alliancefrancaise.ca/products/ciep-tcf-canada-full-exam/",
  },
  calgary: {
    address: "710 10 Ave SW #101, Calgary, AB T2R 0B3",
    mapsUrl: "https://maps.google.com/?q=Alliance+Fran%C3%A7aise+de+Calgary+710+10+Ave+SW",
    registrationUrl: "https://www.afcalgary.ca/exams/tcf/tcf-registrations-open/",
  },
};

export const CITY_OPTIONS = ["ottawa", "toronto", "montreal", "vancouver", "calgary"] as const;
