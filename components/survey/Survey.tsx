"use client";

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import type {
  MatrixMcqAnswer,
  McqMultiWithOtherAnswer,
  McqWithOtherAnswer,
  RatingTableAnswer,
  SurveyAnswers,
  SurveyDefinition,
  SurveyMatrixMcqQuestion,
  SurveyMcqQuestion,
  SurveyPage,
  SurveyPageInfo,
  SurveyQuestion,
  SurveyRatingTableQuestion,
  SurveyTextQuestion,
  SurveyVisibilityRule,
} from "./types";
import { isMcqMultiWithOtherAnswer, isMcqWithOtherAnswer } from "./types";
import { SurveyConsentIntroContent } from "./SurveyIntroConsent";

const OTHER_VALUE = "__survey_other__";

function pagesFromDefinition(def: SurveyDefinition): SurveyPage[] {
  if (def.pages && def.pages.length > 0) return def.pages;
  return [{ questions: def.questions ?? [] }];
}

function flattenQuestions(pages: SurveyPage[]): SurveyQuestion[] {
  return pages.flatMap((p) => p.questions ?? []);
}

function visibilityMatches(
  rule: SurveyVisibilityRule | undefined,
  answers: SurveyAnswers,
): boolean {
  if (!rule) return true;
  const raw = answers[rule.questionId];
  const comparable =
    typeof raw === "string"
      ? raw
      : isMcqWithOtherAnswer(raw)
        ? raw.selected
        : "";
  if (rule.equals !== undefined) return comparable === rule.equals;
  if (rule.notEquals !== undefined) return comparable !== rule.notEquals;
  return true;
}

function questionVisible(q: SurveyQuestion, answers: SurveyAnswers): boolean {
  return visibilityMatches(q.visibleWhen, answers);
}

function SurveyInfoSection({ info }: { info: SurveyPageInfo }) {
  return (
    <section className="survey-info" aria-label="Introduction">
      {info.title ? (
        <h1 className="survey-info-title">{info.title}</h1>
      ) : null}
      {info.subtitle ? (
        <h2 className="survey-info-subtitle">{info.subtitle}</h2>
      ) : null}
      {info.paragraphs?.map((block, i) => {
        if ("html" in block && block.html) {
          return (
            <div
              key={i}
              className="survey-info-html"
              dangerouslySetInnerHTML={{ __html: block.html }}
            />
          );
        }
        if ("text" in block && block.text) {
          return (
            <p key={i} className="survey-info-p">
              {block.text}
            </p>
          );
        }
        return null;
      })}
      {info.footer ? (
        <p className="survey-info-footer">{info.footer}</p>
      ) : null}
    </section>
  );
}

function isRatingTableAnswer(v: unknown): v is RatingTableAnswer {
  if (typeof v !== "object" || v === null) return false;
  if ("selected" in v) return false;
  const vals = Object.values(v as Record<string, unknown>);
  return vals.length > 0 && vals.every((x) => typeof x === "number");
}

function normalizeInitialAnswers(
  questions: SurveyQuestion[],
  initial?: Partial<SurveyAnswers>,
): SurveyAnswers {
  const out: Record<string, SurveyAnswers[string]> = {};

  for (const q of questions) {
    const seeded = initial?.[q.id];

    if (q.type === "matrix_mcq") {
      const seededObj =
        seeded !== undefined &&
        typeof seeded === "object" &&
        seeded !== null &&
        !Array.isArray(seeded) &&
        !("selected" in seeded)
          ? (seeded as Record<string, unknown>)
          : undefined;
      const rowAnswers: MatrixMcqAnswer = {};
      for (const row of q.rows) {
        const prev = seededObj?.[row];
        rowAnswers[row] = typeof prev === "string" ? prev : "";
      }
      out[q.id] = rowAnswers;
      continue;
    }

    if (q.type === "rating_table") {
      const existing =
        seeded !== undefined && isRatingTableAnswer(seeded)
          ? seeded
          : undefined;
      const rowAnswers: RatingTableAnswer = {};
      for (const row of q.rows) {
        const prev = existing?.[row];
        if (typeof prev === "number") {
          rowAnswers[row] = prev;
        }
      }
      out[q.id] = rowAnswers;
      continue;
    }

    if (q.type === "mcq" && q.multiple && q.other) {
      out[q.id] =
        seeded !== undefined && isMcqMultiWithOtherAnswer(seeded)
          ? seeded
          : { selected: [], otherText: "" };
      continue;
    }

    if (q.type === "mcq" && q.multiple) {
      out[q.id] =
        Array.isArray(seeded) && seeded.every((x) => typeof x === "string")
          ? seeded
          : [];
      continue;
    }

    if (q.type === "mcq" && q.other) {
      out[q.id] =
        seeded !== undefined && isMcqWithOtherAnswer(seeded)
          ? seeded
          : { selected: "", otherText: "" };
      continue;
    }

    if (q.type === "mcq") {
      out[q.id] =
        typeof seeded === "string" ? seeded : "";
      continue;
    }

    out[q.id] = typeof seeded === "string" ? seeded : "";
  }

  return out as SurveyAnswers;
}

type McqBlockValue =
  | string
  | McqWithOtherAnswer
  | string[]
  | McqMultiWithOtherAnswer;

function McqBlock({
  q,
  value,
  onChange,
}: {
  q: SurveyMcqQuestion;
  value: McqBlockValue;
  onChange: (next: McqBlockValue) => void;
}) {
  const hasOther = Boolean(q.other);
  const isMulti = Boolean(q.multiple);

  const displayLabel = (raw: string) =>
    raw === OTHER_VALUE ? "Other" : raw;

  if (isMulti) {
    const optionList = hasOther ? [...q.options, OTHER_VALUE] : q.options;
    const selectedArr: string[] = hasOther
      ? isMcqMultiWithOtherAnswer(value)
        ? value.selected
        : []
      : Array.isArray(value)
        ? value
        : [];
    const otherText =
      hasOther && isMcqMultiWithOtherAnswer(value)
        ? value.otherText ?? ""
        : "";

    const toggle = (opt: string) => {
      if (!hasOther) {
        const arr = Array.isArray(value) ? [...value] : [];
        const next = arr.includes(opt)
          ? arr.filter((x) => x !== opt)
          : [...arr, opt];
        onChange(next);
        return;
      }
      const cur = isMcqMultiWithOtherAnswer(value)
        ? [...value.selected]
        : [];
      const removing = cur.includes(opt);
      const nextSel = removing
        ? cur.filter((x) => x !== opt)
        : [...cur, opt];
      const nextOther =
        removing && opt === OTHER_VALUE ? "" : otherText;
      onChange({ selected: nextSel, otherText: nextOther });
    };

    const setMultiOtherText = (text: string) => {
      if (!hasOther) return;
      const cur = isMcqMultiWithOtherAnswer(value)
        ? [...value.selected]
        : [];
      const nextSel = cur.includes(OTHER_VALUE)
        ? cur
        : [...cur, OTHER_VALUE];
      onChange({ selected: nextSel, otherText: text });
    };

    return (
      <fieldset className="survey-fieldset">
        <legend className="survey-legend">{q.question}</legend>
        <div className="survey-options" role="group" aria-label={q.question}>
          {optionList.map((opt) => (
            <label key={opt} className="survey-option-label">
              <input
                type="checkbox"
                name={`${q.id}:${opt}`}
                className="survey-option-input"
                checked={selectedArr.includes(opt)}
                onChange={() => toggle(opt)}
              />
              <span
                className="survey-choice survey-choice--square"
                aria-hidden
              />
              <span className="survey-option-text">{displayLabel(opt)}</span>
            </label>
          ))}
        </div>
        {hasOther && selectedArr.includes(OTHER_VALUE) ? (
          <input
            type="text"
            className="survey-other-input"
            placeholder={q.otherPlaceholder ?? "Please specify"}
            value={otherText}
            onChange={(e) => setMultiOtherText(e.target.value)}
            aria-label="Other (please specify)"
          />
        ) : null}
      </fieldset>
    );
  }

  const selected =
    typeof value === "string"
      ? value
      : isMcqWithOtherAnswer(value)
        ? value.selected
        : "";
  const otherText =
    typeof value === "string" ? "" : isMcqWithOtherAnswer(value)
      ? value.otherText ?? ""
      : "";

  const pick = (opt: string) => {
    if (hasOther) {
      onChange({
        selected: opt,
        otherText: opt === OTHER_VALUE ? otherText : "",
      });
    } else {
      onChange(opt);
    }
  };

  const setOtherText = (text: string) => {
    if (!hasOther || typeof value === "string") return;
    if (!isMcqWithOtherAnswer(value)) return;
    onChange({ ...value, selected: OTHER_VALUE, otherText: text });
  };

  const optionList = hasOther
    ? [...q.options, OTHER_VALUE]
    : q.options;

  const shapeClass = hasOther
    ? "survey-choice survey-choice--square"
    : "survey-choice survey-choice--circle";

  return (
    <fieldset className="survey-fieldset">
      <legend className="survey-legend">{q.question}</legend>
      <div className="survey-options" role="radiogroup" aria-label={q.question}>
        {optionList.map((opt) => {
          const checked =
            hasOther && opt === OTHER_VALUE
              ? selected === OTHER_VALUE
              : selected === opt;
          return (
            <label key={opt} className="survey-option-label">
              <input
                type="radio"
                name={q.id}
                className="survey-option-input"
                checked={checked}
                onChange={() => pick(opt)}
              />
              <span className={shapeClass} aria-hidden />
              <span className="survey-option-text">{displayLabel(opt)}</span>
            </label>
          );
        })}
      </div>
      {hasOther && selected === OTHER_VALUE ? (
        <input
          type="text"
          className="survey-other-input"
          placeholder={q.otherPlaceholder ?? "Please specify"}
          value={otherText}
          onChange={(e) => setOtherText(e.target.value)}
          aria-label="Other (please specify)"
        />
      ) : null}
    </fieldset>
  );
}

function TextBlock({
  q,
  value,
  onChange,
}: {
  q: SurveyTextQuestion;
  value: string;
  onChange: (next: string) => void;
}) {
  const Tag = q.multiline ? "textarea" : "input";
  return (
    <div className="survey-field-block">
      <label className="survey-label" htmlFor={q.id}>
        {q.question}
      </label>
      <Tag
        id={q.id}
        className={
          q.multiline ? "survey-textarea" : "survey-input"
        }
        {...(q.multiline
          ? { rows: 4 }
          : { type: "text" })}
        placeholder={q.placeholder}
        value={value}
        onChange={(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
          onChange(e.target.value)
        }
      />
    </div>
  );
}

function RatingTableBlock({
  q,
  value,
  onChange,
}: {
  q: SurveyRatingTableQuestion;
  value: RatingTableAnswer;
  onChange: (next: RatingTableAnswer) => void;
}) {
  const ratings = q.scale.ratings;
  const sorted = useMemo(
    () => [...ratings].sort((a, b) => a.value - b.value),
    [ratings],
  );

  const setCell = (row: string, num: number) => {
    onChange({ ...value, [row]: num });
  };

  return (
    <fieldset className="survey-fieldset survey-rating-fieldset">
      <legend className="survey-legend">{q.question}</legend>
      <div className="survey-table-scroll">
        <table className="survey-rating-table">
          <thead>
            <tr>
              <th scope="col" className="survey-th-row survey-th-corner" />
              {sorted.map((pt) => (
                <th key={pt.value} scope="col" className="survey-th-num">
                  <span className="survey-th-value">{pt.value}</span>
                  {pt.label ? (
                    <span className="survey-th-label">{pt.label}</span>
                  ) : null}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {q.rows.map((row) => (
              <tr key={row}>
                <th scope="row" className="survey-row-label">
                  {row}
                </th>
                {sorted.map((pt) => (
                  <td key={pt.value} className="survey-rating-cell">
                    <label className="survey-rating-hit">
                      <input
                        type="radio"
                        className="survey-option-input"
                        name={`${q.id}:${row}`}
                        checked={value[row] === pt.value}
                        onChange={() => setCell(row, pt.value)}
                      />
                      <span
                        className="survey-choice survey-choice--circle survey-choice--inline"
                        aria-hidden
                      />
                    </label>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </fieldset>
  );
}

function MatrixMcqBlock({
  q,
  value,
  onChange,
}: {
  q: SurveyMatrixMcqQuestion;
  value: MatrixMcqAnswer;
  onChange: (next: MatrixMcqAnswer) => void;
}) {
  const fullValue = useMemo(() => {
    const o: MatrixMcqAnswer = {};
    for (const row of q.rows) {
      o[row] = value[row] ?? "";
    }
    return o;
  }, [q.rows, value]);

  const setCell = (row: string, col: string) => {
    onChange({ ...fullValue, [row]: col });
  };

  return (
    <fieldset className="survey-fieldset survey-matrix-fieldset">
      <legend className="survey-legend">{q.question}</legend>
      <div className="survey-table-scroll">
        <table className="survey-matrix-table">
          <thead>
            <tr>
              <th scope="col" className="survey-matrix-corner" />
              {q.columns.map((col) => (
                <th key={col} scope="col" className="survey-matrix-col-head">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {q.rows.map((row) => (
              <tr key={row}>
                <th scope="row" className="survey-matrix-row-label">
                  {row}
                </th>
                {q.columns.map((col) => (
                  <td key={col} className="survey-matrix-cell">
                    <label className="survey-matrix-hit">
                      <input
                        type="radio"
                        className="survey-option-input"
                        name={`${q.id}:${row}`}
                        checked={fullValue[row] === col}
                        onChange={() => setCell(row, col)}
                      />
                      <span
                        className="survey-choice survey-choice--circle survey-choice--inline"
                        aria-hidden
                      />
                    </label>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </fieldset>
  );
}

export type SurveyProps = {
  definition: SurveyDefinition;
  /** Starting answers (partial ok). */
  initialAnswers?: Partial<SurveyAnswers>;
  /** Called on every local change. */
  onAnswersChange?: (answers: SurveyAnswers) => void;
  onSubmit?: (answers: SurveyAnswers) => void | Promise<void>;
  submitLabel?: string;
  backLabel?: string;
  nextLabel?: string;
  /** Screen reader / visible progress: “Page 2 of 5”. */
  showPageIndicator?: boolean;
  className?: string;
};

export function Survey({
  definition,
  initialAnswers,
  onAnswersChange,
  onSubmit,
  submitLabel = "Submit",
  backLabel = "Back",
  nextLabel = "Next",
  showPageIndicator = true,
  className,
}: SurveyProps) {
  const pages = useMemo(
    () => pagesFromDefinition(definition),
    [definition],
  );
  const allQuestions = useMemo(() => flattenQuestions(pages), [pages]);

  const [answers, setAnswers] = useState<SurveyAnswers>(() =>
    normalizeInitialAnswers(allQuestions, initialAnswers),
  );
  const [pageIndex, setPageIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [introAgreed, setIntroAgreed] = useState(false);
  const [introConsentError, setIntroConsentError] = useState(false);
  const consentCheckboxId = useId();
  const formRef = useRef<HTMLFormElement>(null);

  const totalPages = pages.length;
  const currentPage = pages[pageIndex] ?? pages[0];
  const visibleStepQuestions = useMemo(() => {
    const stepQs = currentPage?.questions ?? [];
    return stepQs.filter((q) => questionVisible(q, answers));
  }, [currentPage, answers]);
  const isLastPage = pageIndex >= totalPages - 1;
  const progressPct =
    totalPages > 0 ? ((pageIndex + 1) / totalPages) * 100 : 100;

  const showBack = totalPages > 1 && pageIndex > 0;
  const showPrimary =
    (totalPages > 1 && !isLastPage) ||
    (totalPages === 1 && Boolean(onSubmit)) ||
    (totalPages > 1 && isLastPage && Boolean(onSubmit));
  const primaryLabel =
    totalPages > 1 && !isLastPage ? nextLabel : submitLabel;
  const showPager = showBack || showPrimary;

  useEffect(() => {
    if (pageIndex === 0) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [pageIndex]);

  const patch = useCallback(
    (id: string, next: SurveyAnswers[string]) => {
      setAnswers((prev) => {
        const merged = { ...prev, [id]: next };
        onAnswersChange?.(merged);
        return merged;
      });
    },
    [onAnswersChange],
  );

  const goBack = () => {
    setIntroConsentError(false);
    setPageIndex((i) => Math.max(0, i - 1));
  };

  const goNext = () => {
    setPageIndex((i) => Math.min(totalPages - 1, i + 1));
  };

  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isLastPage) {
      if (currentPage?.consentIntro && !introAgreed) {
        setIntroConsentError(true);
        return;
      }
      setIntroConsentError(false);
      goNext();
      return;
    }
    if (!onSubmit || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await Promise.resolve(onSubmit(answers));
    } finally {
      setIsSubmitting(false);
    }
  };

  const rootClass = ["survey-root", className].filter(Boolean).join(" ");

  return (
    <form
      ref={formRef}
      className={rootClass}
      onSubmit={handleFormSubmit}
      aria-label="Survey"
    >
      {totalPages > 1 ? (
        <div className="survey-progress-wrap">
          <div
            className="survey-progress-track"
            role="progressbar"
            aria-valuemin={1}
            aria-valuemax={totalPages}
            aria-valuenow={pageIndex + 1}
            aria-label={`Survey progress, page ${pageIndex + 1} of ${totalPages}`}
          >
            <div
              className="survey-progress-bar"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          {showPageIndicator ? (
            <p className="survey-page-indicator">
              Page {pageIndex + 1} of {totalPages}
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="survey-page" key={pageIndex}>
        {currentPage?.consentIntro ? (
          <SurveyConsentIntroContent
            checkboxId={consentCheckboxId}
            agreed={introAgreed}
            showConsentError={introConsentError}
            onAgreedChange={(next) => {
              setIntroAgreed(next);
              if (next) setIntroConsentError(false);
            }}
          />
        ) : null}
        {currentPage?.heading ? (
          <h2 className="survey-page-heading">{currentPage.heading}</h2>
        ) : null}
        {currentPage?.info ? (
          <SurveyInfoSection info={currentPage.info} />
        ) : null}
        {visibleStepQuestions.map((q) => {
          if (q.type === "mcq") {
            return (
              <McqBlock
                key={q.id}
                q={q}
                value={answers[q.id] as McqBlockValue}
                onChange={(next) => patch(q.id, next)}
              />
            );
          }
          if (q.type === "text") {
            return (
              <TextBlock
                key={q.id}
                q={q}
                value={String(answers[q.id] ?? "")}
                onChange={(next) => patch(q.id, next)}
              />
            );
          }
          if (q.type === "matrix_mcq") {
            return (
              <MatrixMcqBlock
                key={q.id}
                q={q}
                value={(answers[q.id] as MatrixMcqAnswer) || {}}
                onChange={(next) => patch(q.id, next)}
              />
            );
          }
          return (
            <RatingTableBlock
              key={q.id}
              q={q}
              value={answers[q.id] as RatingTableAnswer}
              onChange={(next) => patch(q.id, next)}
            />
          );
        })}
      </div>

      {showPager ? (
        <div className="survey-pager">
          {showBack ? (
            <button
              type="button"
              className="survey-btn-back"
              onClick={goBack}
            >
              {backLabel}
            </button>
          ) : (
            <span className="survey-pager-spacer" aria-hidden />
          )}
          <div className="survey-pager-primary">
            {showPrimary ? (
              <button
                type="submit"
                disabled={isSubmitting}
                className={
                  totalPages > 1 && !isLastPage
                    ? "survey-submit survey-submit-next"
                    : "survey-submit"
                }
              >
                {isSubmitting && isLastPage ? "Sending..." : primaryLabel}
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
    </form>
  );
}

export type { SurveyAnswers, SurveyDefinition } from "./types";
