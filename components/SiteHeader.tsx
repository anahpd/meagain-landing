"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { usePathname } from "next/navigation";

const navLinkStyle: CSSProperties = {
  textDecoration: "none",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
};

export function SiteHeader() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header className="site-header">
      <nav className="site-header-nav" aria-label="Primary">
        <Link className="logo" href="/">
          <img src="/meagain_icon.png" alt="MeAgain Icon" style={{ width: "36px", height: "auto" }} />
          <span>MeAgain</span>
        </Link>
        <div className="nav-actions">
          {isHome ? (
          <>
            <button type="button" className="nav-cta" onClick={() => scrollTo("waitlist")}>
              Register for early access
            </button>
            <button
              type="button"
              className="nav-cta"
              onClick={() => scrollTo("survey-section")}
              style={{ ...navLinkStyle, background: "var(--coral)", color: "#fff", border: "none", cursor: "pointer", fontFamily: "inherit" }}
            >
              Help shape MeAgain
            </button>
          </>
          ) : (
          <>
            <Link href="/#waitlist" className="nav-cta" style={navLinkStyle}>
              Register for early access
            </Link>
            <Link href="/" className="nav-cta" style={{ ...navLinkStyle, background: "var(--coral)", color: "#fff" }}>
              Home
            </Link>
          </>
          )}
        </div>
      </nav>
    </header>
  );
}
