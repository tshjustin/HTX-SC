export interface FeedbackEntry {
  instruct: string;
  'output-o1': string;
  'output-qwen': string;
  flag: number | null;
  Feedback: string | null;
}

export type FeedbackFlag = 0 | 1 | 2 | null; // 0 = o1, 1 = qwen, 2 = neither