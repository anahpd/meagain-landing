import type {
  MatrixMcqAnswer,
  RatingTableAnswer,
  SurveyAnswers,
  SurveyDefinition,
  SurveyMatrixMcqQuestion,
  SurveyMcqQuestion,
  SurveyPage,
  SurveyQuestion,
  SurveyRatingTableQuestion,
  SurveyTextQuestion,
} from "./types";
import { isMcqMultiWithOtherAnswer, isMcqWithOtherAnswer } from "./types";

/** Must match `Survey.tsx` sentinel for “Other” MCQ option. */
const OTHER_SENTINEL = "__survey_other__";

/** Empty string = not selected; any non-empty string (we use `"1"`) = selected. */
export type CompactMcqOptions = Record<string, string>;

export type ReadableQuestion =
  | {
      code: string;
      /** e.g. `A1_How old were you when…` */
      code_with_question: string;
      id: string;
      kind: "text";
      question: string;
      /** Always present; empty string when skipped or whitespace-only. */
      answer: string;
    }
  | {
      code: string;
      code_with_question: string;
      id: string;
      kind: "single_choice";
      question: string;
      /** Option label → `""` or `"1"` (selected). */
      options: CompactMcqOptions;
      /** Selected option label, or `""` if unanswered. */
      answer: string;
      /** Always present; free text when Other is selected, otherwise `""`. */
      other_details: string;
    }
  | {
      code: string;
      code_with_question: string;
      id: string;
      kind: "multiple_choice";
      question: string;
      options: CompactMcqOptions;
      /** Selected labels in questionnaire order; empty array if none. */
      answers: string[];
      /** Always present; free text when Other is selected, otherwise `""`. */
      other_details: string;
    }
  | {
      code: string;
      code_with_question: string;
      id: string;
      kind: "rating_grid";
      question: string;
      scale_summary: string;
      /** Symptom row → chosen scale value, or null if unanswered. */
      row_values: Record<string, number | null>;
    }
  | {
      code: string;
      code_with_question: string;
      id: string;
      kind: "matrix";
      question: string;
      /** Programme row → chosen column label, or "" if none. */
      row_values: Record<string, string>;
    };

export type ReadableSection = {
  section_heading: string;
  section_code: string;
  questions: ReadableQuestion[];
};

/** Stored in `survey_responses.responses` — keep small; section bodies live in `responses_a`… columns. */
export type SurveyResponsesMeta = {
  submitted_at_iso: string;
  by_question_key: Record<string, unknown>;
};

/**
 * Human-oriented snapshot (compact). Prefer `buildSurveyDbInsertRow` for inserts so sections are split across columns.
 */
export type ReadableSurveyPayload = SurveyResponsesMeta & {
  sections: ReadableSection[];
};

function pagesFromDefinition(def: SurveyDefinition): SurveyPage[] {
  if (def.pages && def.pages.length > 0) return def.pages;
  return [{ questions: def.questions ?? [] }];
}

function sectionCodeFromHeading(
  heading: string | undefined,
  ordinal: number,
): string {
  if (!heading) return `S${ordinal + 1}`;
  const m = heading.match(/SECTION\s+([A-Za-z]+)/);
  return m ? m[1].toUpperCase() : `S${ordinal + 1}`;
}

/** Trim leading “10.” / “27a.” style numbering from JSON question strings */
export function stripQuestionNumberPrefix(question: string): string {
  return question.replace(/^\s*\d+[a-z]?[\.)]\s*/i, "").trim();
}

function buildQuestionKey(code: string, question: string): string {
  const q = stripQuestionNumberPrefix(question).replace(/\s+/g, " ").trim();
  return `${code}_${q}`;
}

function summarizeQuestion(q: ReadableQuestion): unknown {
  switch (q.kind) {
    case "text":
      return q.answer.trim() ? q.answer : "(no answer)";
    case "single_choice":
      return {
        options: q.options,
        answer: q.answer,
        other_details: q.other_details,
      };
    case "multiple_choice":
      return {
        options: q.options,
        answers: q.answers,
        other_details: q.other_details,
      };
    case "rating_grid":
      return {
        scale_summary: q.scale_summary,
        rows: q.row_values,
      };
    case "matrix":
      return q.row_values;
    default:
      return null;
  }
}

function formatTextQuestion(
  q: SurveyTextQuestion,
  raw: SurveyAnswers[string],
  code: string,
): ReadableQuestion {
  const answer =
    typeof raw === "string" && raw.trim() ? raw.trim() : "";
  return {
    code,
    code_with_question: buildQuestionKey(code, q.question),
    id: q.id,
    kind: "text",
    question: q.question,
    answer,
  };
}

function formatMcqQuestion(
  q: SurveyMcqQuestion,
  raw: SurveyAnswers[string],
  code: string,
): ReadableQuestion {
  const cq = buildQuestionKey(code, q.question);

  if (q.multiple) {
    const selected = new Set<string>();
    let otherDetails = "";

    if (q.other && isMcqMultiWithOtherAnswer(raw)) {
      for (const s of raw.selected) {
        if (s === OTHER_SENTINEL)
          otherDetails = raw.otherText?.trim() ?? "";
        else selected.add(s);
      }
    } else if (Array.isArray(raw)) {
      for (const s of raw) selected.add(s);
    }

    const options: CompactMcqOptions = {};
    for (const label of q.options) {
      options[label] = selected.has(label) ? "1" : "";
    }

    let otherSelected = false;
    if (q.other) {
      otherSelected =
        isMcqMultiWithOtherAnswer(raw) &&
        raw.selected.includes(OTHER_SENTINEL);
      options.Other = otherSelected ? "1" : "";
    }

    const answers: string[] = [];
    for (const label of q.options) {
      if (selected.has(label)) answers.push(label);
    }
    if (q.other && otherSelected) answers.push("Other");

    return {
      code,
      code_with_question: cq,
      id: q.id,
      kind: "multiple_choice",
      question: q.question,
      options,
      answers,
      other_details: q.other ? otherDetails : "",
    };
  }

  let selectedLabel: string | null = null;
  let otherDetails = "";

  if (q.other && isMcqWithOtherAnswer(raw)) {
    selectedLabel =
      raw.selected === OTHER_SENTINEL
        ? "Other"
        : raw.selected.trim()
          ? raw.selected
          : null;
    otherDetails = raw.otherText?.trim() ?? "";
  } else if (typeof raw === "string" && raw.trim()) {
    selectedLabel = raw.trim();
  }

  const options: CompactMcqOptions = {};
  for (const label of q.options) {
    options[label] = selectedLabel === label ? "1" : "";
  }

  if (q.other) {
    options.Other =
      isMcqWithOtherAnswer(raw) && raw.selected === OTHER_SENTINEL
        ? "1"
        : "";
  }

  const answer = selectedLabel ?? "";

  return {
    code,
    code_with_question: cq,
    id: q.id,
    kind: "single_choice",
    question: q.question,
    options,
    answer,
    other_details: q.other ? otherDetails : "",
  };
}

function formatRatingTable(
  q: SurveyRatingTableQuestion,
  raw: SurveyAnswers[string],
  code: string,
): ReadableQuestion {
  const sorted = [...q.scale.ratings].sort((a, b) => a.value - b.value);
  const table: RatingTableAnswer =
    raw &&
    typeof raw === "object" &&
    !Array.isArray(raw) &&
    !("selected" in raw)
      ? (raw as RatingTableAnswer)
      : {};

  const scale_summary = sorted
    .map((pt) => (pt.label ? `${pt.value} (${pt.label})` : String(pt.value)))
    .join(" · ");

  const row_values: Record<string, number | null> = {};
  for (const row of q.rows) {
    const val = table[row];
    row_values[row] = typeof val === "number" ? val : null;
  }

  return {
    code,
    code_with_question: buildQuestionKey(code, q.question),
    id: q.id,
    kind: "rating_grid",
    question: q.question,
    scale_summary,
    row_values,
  };
}

function formatMatrixMcq(
  q: SurveyMatrixMcqQuestion,
  raw: SurveyAnswers[string],
  code: string,
): ReadableQuestion {
  const table: MatrixMcqAnswer =
    raw &&
    typeof raw === "object" &&
    !Array.isArray(raw) &&
    !("selected" in raw)
      ? (raw as MatrixMcqAnswer)
      : {};

  const row_values: Record<string, string> = {};
  for (const row of q.rows) {
    row_values[row] = table[row]?.trim() ?? "";
  }

  return {
    code,
    code_with_question: buildQuestionKey(code, q.question),
    id: q.id,
    kind: "matrix",
    question: q.question,
    row_values,
  };
}

function formatQuestion(
  q: SurveyQuestion,
  answers: SurveyAnswers,
  code: string,
): ReadableQuestion {
  const raw = answers[q.id];
  if (q.type === "mcq") return formatMcqQuestion(q, raw, code);
  if (q.type === "text") return formatTextQuestion(q, raw, code);
  if (q.type === "rating_table") return formatRatingTable(q, raw, code);
  return formatMatrixMcq(q, raw, code);
}

/**
 * Turns internal answer IDs into section-grouped, human-readable structures for storage / reporting.
 */
export function buildReadableSurveyPayload(
  definition: SurveyDefinition,
  answers: SurveyAnswers,
): ReadableSurveyPayload {
  const pages = pagesFromDefinition(definition);
  const sections: ReadableSection[] = [];
  const by_question_key: Record<string, unknown> = {};

  let sectionOrdinal = 0;

  for (const page of pages) {
    const qs = page.questions ?? [];
    if (qs.length === 0) continue;

    const section_heading = page.heading ?? `Section ${sectionOrdinal + 1}`;
    const section_code = sectionCodeFromHeading(page.heading, sectionOrdinal);
    sectionOrdinal += 1;

    const questions: ReadableQuestion[] = [];
    let n = 1;
    for (const q of qs) {
      const code = `${section_code}${n}`;
      n += 1;
      const rq = formatQuestion(q, answers, code);
      questions.push(rq);
      by_question_key[rq.code_with_question] = summarizeQuestion(rq);
    }

    sections.push({
      section_heading,
      section_code,
      questions,
    });
  }

  return {
    submitted_at_iso: new Date().toISOString(),
    sections,
    by_question_key,
  };
}

export type SurveySectionColumnPayload = {
  section_heading: string;
  section_code: string;
  questions: ReadableQuestion[];
};

/**
 * Row shape for `survey_responses`: slim `responses` + one jsonb column per section (`responses_a` …).
 * Avoids one oversized JSON value (UI limits / easier browsing).
 */
export function buildSurveyDbInsertRow(
  definition: SurveyDefinition,
  answers: SurveyAnswers,
): Record<string, unknown> {
  const full = buildReadableSurveyPayload(definition, answers);
  const row: Record<string, unknown> = {
    responses: {
      submitted_at_iso: full.submitted_at_iso,
      by_question_key: full.by_question_key,
    } satisfies SurveyResponsesMeta,
  };

  for (const s of full.sections) {
    const col = `responses_${s.section_code.toLowerCase()}`;
    const payload: SurveySectionColumnPayload = {
      section_heading: s.section_heading,
      section_code: s.section_code,
      questions: s.questions,
    };
    row[col] = payload;
  }

  return row;
}
