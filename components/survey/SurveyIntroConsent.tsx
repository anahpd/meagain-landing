"use client";

const PRIVACY_URL = "https://www.mymeagain.ie/privacy-policy";
const ANA_LINKEDIN =
  "https://www.linkedin.com/in/ana-d-7273b765/";

const BULLET_POINTS = [
  "All responses are completely anonymous. We do not collect your name, email address, or any information that could identify you.",
  "No question is mandatory — answer only what you are comfortable with.",
  "You may stop or close this survey at any time without consequence. No account or login is required.",
  "Responses are stored securely on the MeAgain website and are accessible only to the MeAgain team. They will not be shared with third parties. Anonymised and aggregated findings may be used to inform MeAgain's product development, communications, and research.",
  "This is a discovery survey — it does not provide medical advice or diagnosis.",
] as const;

export type SurveyConsentIntroContentProps = {
  checkboxId: string;
  agreed: boolean;
  showConsentError: boolean;
  onAgreedChange: (next: boolean) => void;
};

/** Copy + bullets + consent for survey page 1 (used inside {@link Survey}). */
export function SurveyConsentIntroContent({
  checkboxId,
  agreed,
  showConsentError,
  onAgreedChange,
}: SurveyConsentIntroContentProps) {
  return (
    <section
      className="survey-intro"
      aria-labelledby="survey-intro-heading"
    >
      <h2 id="survey-intro-heading" className="survey-intro-title">
        Understanding the Impact of Treatment-Induced Menopause Following
        Breast Cancer Treatment
      </h2>

      <p className="survey-intro-p">
        MeAgain is an early-stage digital health company based in Co. Dublin,
        founded by Ana Dinho, a breast cancer survivor. Diagnosed with breast
        cancer during Covid-19, Ana experienced sudden, severe
        treatment-induced menopause symptoms when she started Tamoxifen. It took
        her almost two years to find the right help. That experience is the
        reason MeAgain exists.
      </p>
      <p className="survey-intro-p">
        We are building practical, clinically informed support for women
        experiencing treatment-induced menopause following breast cancer
        treatment, because too many women are going through this alone and
        unprepared.
      </p>
      <p className="survey-intro-p">
        This survey is part of our discovery to understand the real impact of
        treatment-induced menopause and to ensure what we build genuinely
        reflects the experiences of the women it is designed for.{" "}
        <strong>Your voice matters.</strong>
      </p>

      <p className="survey-intro-before">Before you begin, please read:</p>
      <ul className="survey-intro-list">
        {BULLET_POINTS.map((t, i) => (
          <li key={i}>{t}</li>
        ))}
        <li>
          For full details on how we handle your data please review our Privacy Policy at{" "}
          <a
            href={PRIVACY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="survey-intro-link"
          >
            www.mymeagain.ie/privacy-policy
          </a>
          .
        </li>
      </ul>

      <p className="survey-intro-p survey-intro-collab">
        If you are interested in learning more or exploring collaboration, we
        would love to hear from you — please connect with{" "}
        <a
          href={ANA_LINKEDIN}
          target="_blank"
          rel="noopener noreferrer"
          className="survey-intro-link"
        >
          Ana Dinho on LinkedIn
        </a>{" "}
        or email:{" "}
        <a href="mailto:hello@mymeagain.ie" className="survey-intro-link">
          hello@mymeagain.ie
        </a>
      </p>

      <p className="survey-intro-time">
        <strong>Estimated time: 5–8 minutes</strong>
      </p>

      <div
        className={
          showConsentError
            ? "survey-intro-consent-field survey-intro-consent-field--invalid"
            : "survey-intro-consent-field"
        }
      >
        <label className="survey-intro-consent" htmlFor={checkboxId}>
          <input
            id={checkboxId}
            type="checkbox"
            className="survey-intro-checkbox"
            checked={agreed}
            aria-invalid={showConsentError}
            aria-describedby={
              showConsentError ? "survey-consent-error" : undefined
            }
            onChange={(e) => onAgreedChange(e.target.checked)}
          />
          <span className="survey-intro-consent-text">
            I agree to participate in this survey. I understand that my
            participation is entirely voluntary and that I can stop or close this
            survey at any time without consequence. As all responses are
            completely anonymous, individual responses cannot be identified or
            removed. I have read and understood the information above.
          </span>
        </label>
        {showConsentError ? (
          <p id="survey-consent-error" className="survey-intro-consent-hint" role="alert">
            Please tick the box above to continue.
          </p>
        ) : null}
      </div>
    </section>
  );
}
