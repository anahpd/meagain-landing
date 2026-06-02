"use client";

import { useState } from "react";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"patient" | "hospital">("patient");
  const [email, setEmail] = useState("");

  const handleSignup = () => {
    if (email && email.includes("@")) {
      alert("Thank you — you’re on the early access list. I’ll be in touch as we progress towards the first pilot group.");
      setEmail("");
    } else {
      alert("Please enter a valid email address.");
    }
  };

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <nav>
        <a className="logo" href="#">MeAgain</a>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <button className="nav-cta" onClick={() => scrollTo("waitlist")}>Register for early access</button>
          <button className="nav-cta" style={{ background: "var(--coral)" }} onClick={() => scrollTo("survey-section")}>Help shape MeAgain</button>
        </div>
      </nav>

      <div className="site">
        <section className="hero">
          <span className="hero-tag">Breast cancer · Treatment-induced menopause · Ireland</span>
          <h1>When breast cancer treatment suddenly pushes your body into menopause and no one prepares you for it</h1>
          <p>
            A simple, structured way to help you prepare for and manage menopause symptoms during treatment — so you can feel more like yourself and stay on treatment.<br/>
            <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>Evidence-informed and designed for women with breast cancer.</span>
          </p>
        </section>

        <div className="stat-row">
          <div className="stat">
            <div className="stat-num">15%</div>
            <div className="stat-label">of women said they discontinue treatment due to unmanaged menopause symptoms</div>
          </div>
          <div className="stat">
            <div className="stat-num">54%</div>
            <div className="stat-label">of women said they were not informed about menopause before starting treatment</div>
          </div>
          <div className="stat">
            <div className="stat-num">83%</div>
            <div className="stat-label">of women said they would use MeAgain if offered through their hospital pathway</div>
          </div>
        </div>
        <div className="stat-source">Source: MeAgain early-stage survey with women affected by breast cancer (Ireland, April 2026)</div>

        <section className="section">
          <div className="section-tag">The problem</div>
          <h2>Cancer treatment can trigger sudden, severe menopause</h2>
          <div className="problem-box">
            <p>Chemotherapy, surgery, and hormone-blocking therapies can push a woman's body into menopause overnight. Unlike natural menopause, this is abrupt, medically complex, and often never explained. HRT — the most common treatment — is usually not suitable for women with breast cancer. Many women are left completely unsupported at the most vulnerable moment of their lives.</p>
          </div>
          <div className="quote"><p>&quot;My body shifted into full menopause overnight. I didn&apos;t recognise myself physically or emotionally.&quot;</p></div>
          <div className="quote"><p>&quot;I felt my whole life came crashing down. I felt isolated and alone.&quot;</p></div>
        </section>

        <section className="section">
          <div className="section-tag">The solution</div>
          <h2>Two structured forms of support, designed for this moment</h2>
          <div className="pathways">
            <div className="pathway-card">
              <div className="pathway-num">1</div>
              <h3>Preparation support</h3>
              <p>Designed for women before treatment begins. Personalised, self-paced digital support to reduce fear, build understanding, and help women feel ready when their body starts to change.</p>
            </div>
            <div className="pathway-card">
              <div className="pathway-num">2</div>
              <h3>Stabilisation support</h3>
              <p>Structured digital support designed to address the symptoms that affect daily functioning most — helping women feel like themselves again and stay on treatment.</p>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="section-tag">Why MeAgain</div>
          <h2>Nothing else is designed for this</h2>
          <div className="diff-grid">
            <div className="diff-item">
              <h4>Cancer-aware by design</h4>
              <p>Designed specifically for medically induced menopause, with the women it serves at the heart of its development — not adapted from a general menopause or wellness platform.</p>
            </div>
            <div className="diff-item">
              <h4>Preparation and stabilisation</h4>
              <p>Designed to support women before treatment begins and throughout — addressing the gap that exists between diagnosis and recovery that no current service fills.</p>
            </div>
            <div className="diff-item">
              <h4>Pathway-integrated</h4>
              <p>Designed to sit within existing hospital breast cancer pathways — reaching women at the point of need, not reliant on self-discovery.</p>
            </div>
            <div className="diff-item">
              <h4>Safe and evidence-informed</h4>
              <p>Designed to complement — not replace — medical care. Non-hormonal and grounded in approaches appropriate for women undergoing breast cancer treatment.</p>
            </div>
          </div>
          <div className="insight-row">
            <div className="insight">
              <div className="insight-num">30%</div>
              <div className="insight-label">of women said their concerns were only somewhat addressed by existing services</div>
            </div>
            <div className="insight">
              <div className="insight-num">40%</div>
              <div className="insight-label">of women said their concerns were not taken seriously at all</div>
            </div>
          </div>
          <div className="insight-source">Source: MeAgain early-stage survey with women affected by breast cancer (Ireland, April 2026)</div>
        </section>

        <section className="section" id="audience-section">
          <div className="section-tag">Who it&apos;s for</div>
          <h2>Supporting women through every stage of treatment</h2>
          <div className="audience-grid">
            <div className="audience-col">
              <button 
                className={`audience-tab ${activeTab === "patient" ? "active" : ""}`} 
                onClick={() => { setActiveTab("patient"); scrollTo("audience-section"); }}
              >
                For women affected by breast cancer
              </button>
              <div className="audience-card patient">
                <h3>Before, during and after treatment</h3>
                <ul>
                  <li>Understand what is happening to your body</li>
                  <li>Know what is safe and what you can do today</li>
                  <li>Practical guidance for the symptoms affecting your daily life</li>
                  <li>Access from home, at your own pace</li>
                  <li>Shaped by someone who has lived this</li>
                </ul>
              </div>
            </div>

            <div className="audience-col" style={{ marginTop: "10px" }}>
              <button 
                className={`audience-tab ${activeTab === "hospital" ? "active" : ""}`} 
                onClick={() => { setActiveTab("hospital"); scrollTo("audience-section"); }}
              >
                For clinical teams
              </button>
              <div className="audience-card hospital">
                <h3>For breast cancer units and oncology teams</h3>
                <ul>
                  <li>Ensure every woman receives dedicated menopause support alongside her cancer care</li>
                  <li>Help women stay on treatment by addressing the symptoms that make it hardest to continue</li>
                  <li>Measurable improvements in wellbeing and treatment completion rates</li>
                  <li>Provide a seamless, joined-up support pathway from diagnosis through recovery</li>
                </ul>
                <p style={{ fontSize: "15px", color: "var(--teal-dark)", marginTop: "16px", lineHeight: 1.6, fontWeight: 500 }}>
                  We are engaging with clinical teams to explore early collaboration as the programme is developed. Interested in shaping MeAgain or learning more? We’d love to hear from you.
                </p>
                <div style={{ marginTop: "16px" }}>
                  <button 
                    style={{ background: "var(--teal-dark)", color: "#fff", border: "none", padding: "10px 18px", borderRadius: "20px", fontSize: "13px", cursor: "pointer" }} 
                    onClick={() => window.location.href = "mailto:hello@mymeagain.ie?subject=Clinical collaboration"}
                  >
                    Express interest
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="section-tag">Trusted by</div>
          <h2>Clinical collaboration and validation</h2>
          <div className="trust-row">
            <div className="trust-badge">
              <strong>Beaumont Hospital &amp; RCSI</strong>
              Co-developed a clinical research questionnaire with RCSI on treatment-induced menopause in breast cancer, submitted for ethics approval (Beaumont Hospital)
            </div>
            <div className="trust-badge">
              <strong>Dr Ghazala Aziz-Scott</strong>
              Menopause and hormone health expert with 20+ years of clinical experience — provided early expert input on gaps in menopause support within breast cancer care
            </div>
            <div className="trust-badge">
              <strong>Local Enterprise Office</strong>
              - Supported through LEO mentoring programme
              - Awarded a Feasibility Study Grant (June 2026) to fund independent B2B market research with healthcare professionals across Ireland's breast cancer care pathway
            </div>
          </div>
        </section>

        <section className="cta-section" id="waitlist">
          <h2>Get early access to MeAgain</h2>
          <p>Register your interest to be part of the first group of women shaping MeAgain. Over the next few months, you’ll receive updates and opportunities to contribute, with early access to the first pilot as it becomes available.</p>
          <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "-8px" }}>You’ll hear directly from us — no spam, just occasional updates as we build.</p>
          <div className="form-row">
            <input 
              type="email" 
              placeholder="Your email address" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSignup()}
            />
            <button onClick={handleSignup}>Join early access</button>
          </div>
          <p className="unsub">No spam. <a href="mailto:hello@mymeagain.ie?subject=Unsubscribe&body=Please remove me from the MeAgain waitlist.">Unsubscribe any time</a></p>
        </section>

        <div className="survey-banner" id="survey-section">
          <h3 style={{ fontSize: "16px", fontWeight: 500, color: "var(--teal-dark)", fontFamily: "Arial, sans-serif" }}>Help shape MeAgain</h3>
          <p>If you’d like to help shape MeAgain sooner, you can share your experience in a short 5-minute survey.<br/><strong>Join early access above, or contribute now by taking the survey.</strong></p>
          <a className="survey-btn" href="https://forms.gle/ijFAyApvii9Z38Y28" target="_blank" rel="noopener noreferrer">Take the survey</a>
        </div>

      </div>

      <footer>
        <p>MeAgain · Dublin, Ireland</p>
        <p><a href="https://www.mymeagain.ie">www.mymeagain.ie</a> · <a href="mailto:hello@mymeagain.ie">hello@mymeagain.ie</a></p>
        <p style={{ marginTop: "4px" }}>Non-diagnostic. Designed to complement, not replace, medical care.</p>
      </footer>
    </>
  );
}
