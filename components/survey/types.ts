/** Discrete rating column (value shown / submitted; label optional). */
export type RatingScalePoint = {
  value: number;
  label?: string;
};

/** Show this question only when a prior single-select MCQ answer matches. */
export type SurveyVisibilityRule = {
  questionId: string;
  equals?: string;
  notEquals?: string;
};

export type SurveyMcqQuestion = {
  id: string;
  type: "mcq";
  question: string;
  options: string[];
  /** Select-many (e.g. “tick all that apply”). Answer is string[] or multi+other shape. */
  multiple?: boolean;
  /** When true, choices render as squares and “Other” appears with a string field. */
  other?: boolean;
  otherPlaceholder?: string;
  visibleWhen?: SurveyVisibilityRule;
};

export type SurveyTextQuestion = {
  id: string;
  type: "text";
  question: string;
  placeholder?: string;
  multiline?: boolean;
  visibleWhen?: SurveyVisibilityRule;
};

export type SurveyRatingTableQuestion = {
  id: string;
  type: "rating_table";
  question: string;
  /** Row labels (left column). */
  rows: string[];
  scale: {
    /** Columns left→right; `value` is what gets stored per row. */
    ratings: RatingScalePoint[];
  };
  visibleWhen?: SurveyVisibilityRule;
};

/** One choice per row from named columns (e.g. funding responsibility matrix). */
export type SurveyMatrixMcqQuestion = {
  id: string;
  type: "matrix_mcq";
  question: string;
  rows: string[];
  columns: string[];
  visibleWhen?: SurveyVisibilityRule;
};

export type SurveyQuestion =
  | SurveyMcqQuestion
  | SurveyTextQuestion
  | SurveyRatingTableQuestion
  | SurveyMatrixMcqQuestion;

/**
 * Static copy for a step (intro, instructions). Use `html` paragraphs only for
 * trusted author-controlled JSON — content is rendered as HTML (links, em, strong).
 */
export type SurveyInfoParagraph = { text: string } | { html: string };

export type SurveyPageInfo = {
  title?: string;
  subtitle?: string;
  paragraphs?: SurveyInfoParagraph[];
  footer?: string;
};

/** One screen: optional readable `info`, plus optional `questions`. */
export type SurveyPage = {
  info?: SurveyPageInfo;
  /** Section label shown above questions on this page (e.g. “SECTION A — …”). */
  heading?: string;
  questions?: SurveyQuestion[];
};

/**
 * Paginated survey: use `pages` — each item is one screen; page breaks are wherever you split the array.
 * Legacy single-page: omit `pages` and pass flat `questions`.
 */
export type SurveyDefinition = {
  pages?: SurveyPage[];
  /** Single-page shorthand when `pages` is omitted or empty. */
  questions?: SurveyQuestion[];
};

/** Answer for MCQ without `other`. */
export type McqSingleAnswer = string;

/** Answer for MCQ with `other`. */
export type McqWithOtherAnswer = {
  selected: string;
  /** Populated when user picks Other or types in the other field. */
  otherText?: string;
};

/** Answer for multi-select MCQ with `other`. */
export type McqMultiWithOtherAnswer = {
  selected: string[];
  otherText?: string;
};

/** Row label → selected scale value; omit a row until the respondent selects a rating. */
export type RatingTableAnswer = Partial<Record<string, number>>;

/** Row label → selected column label */
export type MatrixMcqAnswer = Record<string, string>;

export type SurveyAnswers = Record<
  string,
  | string
  | string[]
  | McqWithOtherAnswer
  | McqMultiWithOtherAnswer
  | RatingTableAnswer
  | MatrixMcqAnswer
>;

export function isMcqWithOtherAnswer(v: unknown): v is McqWithOtherAnswer {
  return (
    typeof v === "object" &&
    v !== null &&
    "selected" in v &&
    typeof (v as McqWithOtherAnswer).selected === "string"
  );
}

export function isMcqMultiWithOtherAnswer(
  v: unknown,
): v is McqMultiWithOtherAnswer {
  return (
    typeof v === "object" &&
    v !== null &&
    "selected" in v &&
    Array.isArray((v as McqMultiWithOtherAnswer).selected) &&
    (v as McqMultiWithOtherAnswer).selected.every((x) => typeof x === "string")
  );
}
