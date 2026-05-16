"use client";

import {
  Survey,
  buildSurveyDbInsertRow,
  type SurveyAnswers,
  type SurveyDefinition,
} from "@/components/survey";
import surveyDefinition from "@/components/survey/questions.json";
import { supabase } from "@/lib/supabase";
import { useState } from "react";

const SURVEY_DEFINITION = surveyDefinition as SurveyDefinition;

export default function SurveyPage() {
  const [complete, setComplete] = useState(false);

  const handleSurveySubmit = async (answers: SurveyAnswers) => {
    const row = buildSurveyDbInsertRow(SURVEY_DEFINITION, answers);
    const { error } = await supabase.from("survey_responses").insert([row]);

    if (error) {
      console.error("Survey submit error:", error, answers);
      alert(
        "We could not save your responses just now. Please try again in a moment, or email hello@mymeagain.ie with your feedback.",
      );
      throw error;
    }

    setComplete(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <main className="survey-route">
      <div className="survey-route-inner">
        <header className="survey-route-header">
          <h1 className="survey-route-title">Help shape MeAgain</h1>
          <p className="survey-route-lede">
            Thank you for contributing. Your responses are anonymous and optional questions can be skipped.
            Estimated time: about 5–8 minutes.
          </p>
        </header>

        {complete ? (
          <div className="survey-route-card survey-route-card--done">
            <p className="survey-route-done-msg">
              Thank you — your responses were submitted successfully.
            </p>
            <p className="survey-route-done-sub">
              Your input will inform support programmes for women managing early-onset menopause following breast
              cancer treatment.
            </p>
          </div>
        ) : (
          <div className="survey-route-card">
            <Survey
              definition={SURVEY_DEFINITION}
              onSubmit={handleSurveySubmit}
              submitLabel="Submit responses"
              className="survey-route-form"
            />
          </div>
        )}
      </div>
    </main>
  );
}
