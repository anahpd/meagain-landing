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
    <nav>
      <Link className="logo" href="/" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <img src="/meagain_icon.png" alt="MeAgain Icon" style={{ width: "36px", height: "auto" }} />
        <span>MeAgain</span>
      </Link>
      <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
        {isHome ? (
          <>
            <button type="button" className="nav-cta" onClick={() => scrollTo("waitlist")}>
              Register for early access
            </button>
            <Link
              href="/survey"
              className="nav-cta"
              style={{ ...navLinkStyle, background: "var(--coral)", color: "#fff" }}
            >
              Help shape MeAgain
            </Link>
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
  );
}
