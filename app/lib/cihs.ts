export type Rating = 1 | 2 | 3 | 4 | 5;
export type Answers = Record<number, Rating | undefined>;

export const QUESTIONS: { id: number; text: string }[] = [
  { id: 1, text: "When someone disagrees with ideas important to me, it feels like a personal attack." },
  { id: 2, text: "I can separate my ego from my intellect." },
  { id: 3, text: "I feel small when others disagree with me on topics close to my heart." },
  { id: 4, text: "I welcome different ways of thinking about important topics." },
  { id: 5, text: "I become defensive when someone disagrees with me about something important." },
  { id: 6, text: "I am willing to change my mind once it's made up about an important topic." },
  { id: 7, text: "I question my own opinions because they could be wrong." },
  { id: 8, text: "I am open to revising my important beliefs in the face of new information." },
  { id: 9, text: "I am willing to change my opinions on the basis of compelling reason." },
  { id: 10, text: "I reconsider my opinions when presented with new evidence." },
  { id: 11, text: "I accept that my beliefs and attitudes may be wrong." },
  { id: 12, text: "I'm willing to change my mind once it's made up about an important topic." },
  { id: 13, text: "Even when I disagree, I can recognize that others have sound points." },
  { id: 14, text: "I respect that there are ways of thinking other than my own." },
  { id: 15, text: "I value hearing opinions that differ from mine." },
  { id: 16, text: "I can learn valuable things from people with whom I disagree." },
  { id: 17, text: "I recognize the value in opinions that are different from my own." },
  { id: 18, text: "For the most part, others have more to learn from me than I have to learn from them." },
  { id: 19, text: "I am more informed than most people." },
  { id: 20, text: "When I am confident in a belief, there is little chance it is wrong." },
  { id: 21, text: "I tend to think my opinions are better than other people's opinions." },
  { id: 22, text: "I am likely to overestimate my own knowledge." },
];

export const REVERSE_SCORED = new Set([1, 3, 5, 18, 19, 20, 21]);

export const SUBSCALES = [
  { key: "A", name: "Independence of Intellect & Ego", range: [1, 6] as const, divisor: 6 },
  { key: "B", name: "Openness to Revising Viewpoint", range: [7, 12] as const, divisor: 6 },
  { key: "C", name: "Respect for Others' Viewpoints", range: [13, 17] as const, divisor: 5 },
  { key: "D", name: "Lack of Overconfidence", range: [18, 22] as const, divisor: 5 },
] as const;

export const SCALE_LABELS: { value: Rating; label: string; short: string }[] = [
  { value: 1, label: "Strongly Disagree", short: "SD" },
  { value: 2, label: "Disagree", short: "D" },
  { value: 3, label: "Neutral", short: "N" },
  { value: 4, label: "Agree", short: "A" },
  { value: 5, label: "Strongly Agree", short: "SA" },
];

export function finalScore(itemId: number, raw: Rating): number {
  return REVERSE_SCORED.has(itemId) ? 6 - raw : raw;
}

export type SubscaleResult = {
  key: string;
  name: string;
  sum: number;
  average: number;
  divisor: number;
  complete: boolean;
};

export type Results = {
  subscales: SubscaleResult[];
  overall: { sum: number; average: number; complete: boolean };
  answeredCount: number;
};

export function computeResults(answers: Answers): Results {
  const subscales: SubscaleResult[] = SUBSCALES.map((s) => {
    let sum = 0;
    let answered = 0;
    for (let id = s.range[0]; id <= s.range[1]; id++) {
      const v = answers[id];
      if (v !== undefined) {
        sum += finalScore(id, v);
        answered += 1;
      }
    }
    const complete = answered === s.divisor;
    return {
      key: s.key,
      name: s.name,
      sum,
      average: complete ? sum / s.divisor : 0,
      divisor: s.divisor,
      complete,
    };
  });

  let overallSum = 0;
  let overallAnswered = 0;
  for (let id = 1; id <= 22; id++) {
    const v = answers[id];
    if (v !== undefined) {
      overallSum += finalScore(id, v);
      overallAnswered += 1;
    }
  }
  const overallComplete = overallAnswered === 22;

  return {
    subscales,
    overall: {
      sum: overallSum,
      average: overallComplete ? overallSum / 22 : 0,
      complete: overallComplete,
    },
    answeredCount: overallAnswered,
  };
}

export type InterpretationBand = {
  min: number;
  max: number;
  level: string;
  summary: string;
  tone: "very-high" | "strong" | "moderate" | "lower" | "rigid";
};

export const BANDS: InterpretationBand[] = [
  { min: 4.5, max: 5.0, level: "Very High", summary: "Exceptional openness and very low ego-attachment to ideas.", tone: "very-high" },
  { min: 3.8, max: 4.4999, level: "Strong", summary: "You generally handle disagreement well and value new data.", tone: "strong" },
  { min: 3.0, max: 3.7999, level: "Moderate", summary: "You are open in some areas but may get defensive in others.", tone: "moderate" },
  { min: 2.0, max: 2.9999, level: "Lower", summary: "You may struggle with \"being right\" over \"getting it right.\"", tone: "lower" },
  { min: 0, max: 1.9999, level: "Rigid", summary: "Strong patterns of defensiveness; high risk of intellectual blind spots.", tone: "rigid" },
];

export function interpret(average: number): InterpretationBand {
  return BANDS.find((b) => average >= b.min && average <= b.max) ?? BANDS[BANDS.length - 1];
}
