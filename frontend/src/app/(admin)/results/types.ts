export type SubmissionColumn = {
  text: string;
};

export type SubmissionAnswer = {
  value: string | null;
  fieldOption?: {
    text?: string | null;
  } | null;
};

export type SubmissionRow = {
  answers: SubmissionAnswer[];
};

export type SubmissionTable = {
  data: SubmissionRow[];
  columns: SubmissionColumn[];
};
