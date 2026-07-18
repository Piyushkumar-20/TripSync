import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Users,
  MapPin,
  CalendarDays,
  Wallet,
  CheckSquare,
  Paperclip,
  MessageSquare,
  Plane,
  Pin,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

/* ─── Google Fonts (Space Grotesk + Inter used exclusively by this page) ─── */
const FONT_LINK_ID = "tripsync-landing-fonts";

function useInjectFonts() {
  useEffect(() => {
    if (document.getElementById(FONT_LINK_ID)) return;
    const link = document.createElement("link");
    link.id   = FONT_LINK_ID;
    link.rel  = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap";
    document.head.appendChild(link);
  }, []);
}

/* ─── Design tokens ─────────────────────────────────────────────────────── */
const C = {
  bg:        "#0F1410",
  bgRaised:  "#161D17",
  paper:     "#FAF6EC",
  paperDim:  "#EFE9D8",
  orange:    "#FF6B35",
  orangeDim: "#D9572A",
  teal:      "#2D5F4F",
  tealLight: "#4F8B77",
  ink:       "#1B231C",
  muted:     "#C9C2AE",
  mutedDark: "#7C8A7E",
  line:      "rgba(201,194,174,0.18)",
};

/* ─── Small reusable pieces ─────────────────────────────────────────────── */
function Stamp({ children, style }) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "6px 14px",
        borderRadius: 999,
        border: `1px solid ${C.orangeDim}`,
        color: C.orange,
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 12,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function Barcode() {
  const bars = useRef(
    Array.from({ length: 34 }).map(() => 2 + Math.round(Math.random() * 6))
  ).current;
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 28 }}>
      {bars.map((h, i) => (
        <span key={i} style={{ width: 2, height: h * 3, background: C.ink, opacity: 0.85 }} />
      ))}
    </div>
  );
}

function BoardingPass({ from, to, name, date, gate, seat, rotate, top, left, z, accent }) {
  return (
    <div
      style={{
        position: "absolute",
        top,
        left,
        zIndex: z,
        width: 320,
        transform: `rotate(${rotate}deg)`,
        boxShadow: "0 18px 40px rgba(0,0,0,0.45)",
        borderRadius: 10,
        overflow: "hidden",
        background: C.paper,
        display: "flex",
      }}
    >
      {/* Main stub */}
      <div style={{ flex: 1, padding: "16px 18px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 14 }}>
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 22, color: C.ink }}>{from}</span>
          <Plane size={14} color={accent} style={{ transform: "rotate(90deg)" }} />
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 22, color: C.ink }}>{to}</span>
        </div>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#5C5645", display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
          <span>PASSENGER</span>
          <span>DATE</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 500, fontSize: 14, color: C.ink }}>{name}</span>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: C.ink }}>{date}</span>
        </div>
        <Barcode />
      </div>
      {/* Tear stub */}
      <div style={{ width: 70, borderLeft: `2px dashed ${C.bg}`, padding: "16px 10px", display: "flex", flexDirection: "column", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#5C5645" }}>GATE</div>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 16, color: accent }}>{gate}</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#5C5645" }}>SEAT</div>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 16, color: C.ink }}>{seat}</div>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, desc, tag }) {
  return (
    <div
      style={{
        background: C.bgRaised,
        border: `1px solid ${C.line}`,
        borderRadius: 14,
        padding: "24px 24px 26px",
        position: "relative",
        transition: "border-color 0.2s ease, transform 0.2s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = `${C.orangeDim}60`;
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = C.line;
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      {tag && (
        <span style={{ position: "absolute", top: 18, right: 20, fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: "0.08em", color: C.mutedDark, border: `1px solid ${C.line}`, borderRadius: 999, padding: "3px 9px" }}>
          {tag}
        </span>
      )}
      <div style={{ width: 38, height: 38, borderRadius: 10, background: "rgba(255,107,53,0.12)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
        {icon}
      </div>
      <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 17, color: C.paper, margin: "0 0 8px" }}>{title}</h3>
      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, lineHeight: 1.6, color: C.muted, margin: 0 }}>{desc}</p>
    </div>
  );
}

function TicketStub({ label, sub, icon }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(250,246,236,0.04)", border: `1px solid ${C.line}`, borderRadius: 10, padding: "10px 14px" }}>
      {icon}
      <div>
        <div style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500, fontSize: 13, color: C.paper }}>{label}</div>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: C.mutedDark }}>{sub}</div>
      </div>
    </div>
  );
}

/* ─── Shared button styles ──────────────────────────────────────────────── */
const btnPrimary = {
  background: C.orange,
  color: C.bg,
  border: "none",
  borderRadius: 10,
  padding: "14px 24px",
  fontSize: 15,
  fontWeight: 600,
  fontFamily: "'Inter', sans-serif",
  display: "flex",
  alignItems: "center",
  gap: 8,
  cursor: "pointer",
  transition: "transform 0.15s ease, background 0.15s ease",
};

const btnGhost = {
  background: "transparent",
  color: C.paper,
  border: `1px solid ${C.line}`,
  borderRadius: 10,
  padding: "14px 24px",
  fontSize: 15,
  fontWeight: 500,
  fontFamily: "'Inter', sans-serif",
  cursor: "pointer",
  transition: "border-color 0.15s ease",
};

const btnNavPrimary = {
  background: C.orange,
  color: C.bg,
  border: "none",
  borderRadius: 999,
  padding: "9px 18px",
  fontSize: 14,
  fontWeight: 600,
  fontFamily: "'Inter', sans-serif",
  display: "flex",
  alignItems: "center",
  gap: 6,
  cursor: "pointer",
  transition: "transform 0.15s ease",
};

const btnNavGhost = {
  background: "transparent",
  color: C.muted,
  border: `1px solid ${C.line}`,
  borderRadius: 999,
  padding: "9px 18px",
  fontSize: 14,
  fontWeight: 500,
  fontFamily: "'Inter', sans-serif",
  cursor: "pointer",
  transition: "color 0.15s ease",
};

/* ─── Page ──────────────────────────────────────────────────────────────── */
export default function LandingPage() {
  useInjectFonts();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [pinned, setPinned] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setPinned(true), 700);
    return () => clearTimeout(t);
  }, []);

  const goRegister  = () => navigate("/register");
  const goLogin     = () => navigate("/login");
  const goDashboard = () => navigate("/dashboard");

  return (
    <div style={{ background: C.bg, minHeight: "100vh", fontFamily: "'Inter', sans-serif", color: C.paper }}>
      <style>{`
        @keyframes tsl-dropIn {
          from { opacity: 0; transform: translateY(-24px) rotate(var(--rot, 0deg)); }
          to   { opacity: 1; transform: translateY(0)     rotate(var(--rot, 0deg)); }
        }
        .tsl-pass-1 { animation: tsl-dropIn 0.6s ease-out 0.1s  both; }
        .tsl-pass-2 { animation: tsl-dropIn 0.6s ease-out 0.35s both; }
        .tsl-pass-3 { animation: tsl-dropIn 0.6s ease-out 0.6s  both; }
        .tsl-hover-lift:hover { transform: translateY(-2px) !important; }
        .tsl-nav-link:hover   { color: #FF6B35 !important; }
        .tsl-ghost:hover      { border-color: rgba(201,194,174,0.45) !important; }
      `}</style>

      {/* ── Navbar ─────────────────────────────────────────────────────── */}
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 48px", borderBottom: `1px solid ${C.line}`, position: "sticky", top: 0, zIndex: 50, background: C.bg + "ee", backdropFilter: "blur(12px)" }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: C.orange, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Plane size={16} color={C.bg} style={{ transform: "rotate(45deg)" }} />
          </div>
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 17 }}>TripSync</span>
        </div>

        {/* Links + CTA */}
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          <a href="#features" className="tsl-nav-link" style={{ color: C.muted, fontSize: 14, textDecoration: "none", fontFamily: "'Inter', sans-serif", transition: "color 0.15s ease" }}>Features</a>
          <a href="#how"      className="tsl-nav-link" style={{ color: C.muted, fontSize: 14, textDecoration: "none", fontFamily: "'Inter', sans-serif", transition: "color 0.15s ease" }}>How it works</a>
          <a href="/docs"     className="tsl-nav-link" style={{ color: C.muted, fontSize: 14, textDecoration: "none", fontFamily: "'Inter', sans-serif", transition: "color 0.15s ease" }}>Docs</a>

          {user ? (
            <button className="tsl-hover-lift" style={btnNavPrimary} onClick={goDashboard}>
              Dashboard <ArrowRight size={15} />
            </button>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <button className="tsl-ghost" style={btnNavGhost} onClick={goLogin}>Sign in</button>
              <button className="tsl-hover-lift" style={btnNavPrimary} onClick={goRegister}>
                Get started <ArrowRight size={15} />
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <section style={{ display: "grid", gridTemplateColumns: "1fr 480px", gap: 40, padding: "84px 48px 100px", alignItems: "center" }}>
        {/* Copy */}
        <div>
          <Stamp style={{ marginBottom: 22 }}>
            <Pin size={12} /> Built for groups, not solo travelers
          </Stamp>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 58, lineHeight: 1.06, margin: "0 0 22px", letterSpacing: "-0.01em" }}>
            One trip folder.
            <br />Everyone&apos;s
            <br /><span style={{ color: C.orange }}>pinned in.</span>
          </h1>
          <p style={{ fontSize: 16, lineHeight: 1.7, color: C.muted, maxWidth: 420, margin: "0 0 34px" }}>
            Stop emailing screenshots of hotel bookings. TripSync is the shared
            folder your group actually opens — tickets, day plans, costs, and
            comments, pinned in one place as you go.
          </p>
          <div style={{ display: "flex", gap: 14 }}>
            <button className="tsl-hover-lift" style={btnPrimary} onClick={goRegister}>
              Start a trip <ArrowRight size={16} />
            </button>
            <button className="tsl-ghost" style={btnGhost} onClick={goLogin}>
              Sign in
            </button>
          </div>
        </div>

        {/* Boarding pass stack */}
        <div style={{ position: "relative", height: 420 }}>
          <div className="tsl-pass-1" style={{ "--rot": "-7deg" }}>
            <BoardingPass from="DEL" to="CDG" name="P. KUMAR"  date="27 JUN" gate="A12" seat="14C" rotate={-7} top={10}  left={20} z={1} accent={C.teal} />
          </div>
          <div className="tsl-pass-2" style={{ "--rot": "4deg" }}>
            <BoardingPass from="CDG" to="FCO" name="A. SHARMA" date="03 JUL" gate="B07" seat="22A" rotate={4}  top={130} left={70} z={2} accent={C.orange} />
          </div>
          <div className="tsl-pass-3" style={{ "--rot": "-3deg" }}>
            <BoardingPass from="FCO" to="DEL" name="R. VERMA"  date="11 JUL" gate="C19" seat="9F"  rotate={-3} top={250} left={30} z={3} accent={C.tealLight} />
          </div>
          {/* "Pinned" notification */}
          <div style={{ position: "absolute", bottom: -6, left: 40, display: "flex", alignItems: "center", gap: 8, opacity: pinned ? 1 : 0, transition: "opacity 0.4s ease", fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: C.mutedDark }}>
            <Pin size={12} color={C.orange} /> Riya pinned this trip · just now
          </div>
        </div>
      </section>

      {/* ── Ticket stub strip ──────────────────────────────────────────── */}
      <section style={{ display: "flex", gap: 14, padding: "0 48px 70px", flexWrap: "wrap" }}>
        <TicketStub label="Europe Loop"        sub="14 DAYS · 3 TRAVELERS"   icon={<CalendarDays size={18} color={C.orange} />} />
        <TicketStub label="Eiffel Tower visit" sub="JUN 29 · 10:00 · $25"    icon={<MapPin       size={18} color={C.orange} />} />
        <TicketStub label="Shared budget"      sub="$1,240 OF $2,000 USED"   icon={<Wallet       size={18} color={C.orange} />} />
        <TicketStub label="Packing list"       sub="9 OF 14 PACKED"          icon={<CheckSquare  size={18} color={C.orange} />} />
      </section>

      {/* ── Features ───────────────────────────────────────────────────── */}
      <section id="features" style={{ padding: "20px 48px 90px" }}>
        <div style={{ marginBottom: 40, maxWidth: 560 }}>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: C.orange, letterSpacing: "0.08em", textTransform: "uppercase" }}>
            What&apos;s in the folder
          </span>
          <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 32, margin: "10px 0 0" }}>
            Everything a group trip actually needs
          </h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18 }}>
          <FeatureCard icon={<Users       size={19} color={C.orange} />} title="Roles, not chaos"        desc="Owners, editors, and viewers. Your cousin can suggest restaurants without accidentally deleting the flight times." />
          <FeatureCard icon={<MapPin      size={19} color={C.orange} />} title="Pin destinations"        desc="Drop in a place, a visit time, and what it costs. The itinerary builds itself as the group adds stops." />
          <FeatureCard icon={<CalendarDays size={19} color={C.orange} />} title="Day-by-day itinerary"   desc="Reorder activities between days. Everyone sees the same schedule, updated the moment someone makes a change." />
          <FeatureCard icon={<MessageSquare size={19} color={C.orange} />} title="Comments per day"      desc="Ask 'does this work for everyone?' right on the day it's about — not buried in a group chat from three weeks ago." />
          <FeatureCard icon={<CheckSquare size={19} color={C.orange} />} title="Shared checklists"       desc="Packing lists, to-dos, who's bringing the adapter. Tick it off and everyone sees it's handled." />
          <FeatureCard icon={<Paperclip   size={19} color={C.orange} />} title="Tickets & files"         desc="Boarding passes, hotel PDFs, visa scans — attached to the exact day they matter, not lost in email threads." />
        </div>
      </section>

      {/* ── Budget callout ─────────────────────────────────────────────── */}
      <section id="how" style={{ padding: "0 48px 90px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "center" }}>
        {/* Expense ledger card */}
        <div style={{ background: C.bgRaised, border: `1px solid ${C.line}`, borderRadius: 16, padding: 28 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 18 }}>
            <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 18 }}>Trip expenses</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: C.mutedDark }}>SPLIT 3 WAYS</span>
          </div>
          {[
            ["Eiffel Tower tickets",    "$25.00",  "Riya"],
            ["Hotel — 4 nights, Paris", "$612.00", "Pratik"],
            ["Train, Paris → Rome",     "$184.50", "Anjali"],
          ].map(([label, amount, who]) => (
            <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderTop: `1px solid ${C.line}` }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 500 }}>{label}</div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: C.mutedDark }}>paid by {who}</div>
              </div>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, color: C.orange }}>{amount}</span>
            </div>
          ))}
          <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 16, marginTop: 6, borderTop: `1px dashed ${C.line}` }}>
            <span style={{ fontSize: 14, color: C.muted }}>Total tracked</span>
            <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 16 }}>$821.50</span>
          </div>
        </div>

        {/* Copy */}
        <div>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: C.orange, letterSpacing: "0.08em", textTransform: "uppercase" }}>
            No more "who owes what"
          </span>
          <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 30, margin: "10px 0 16px", lineHeight: 1.2 }}>
            Every expense lands in one running ledger
          </h2>
          <p style={{ fontSize: 15, lineHeight: 1.7, color: C.muted, margin: "0 0 28px" }}>
            Log what you paid for, and TripSync keeps the shared total and
            per-person split visible to the whole group — so settling up
            after the trip takes five minutes, not a spreadsheet.
          </p>
          <button className="tsl-hover-lift" style={{ ...btnPrimary, borderRadius: 999, padding: "11px 22px", fontSize: 14 }} onClick={goRegister}>
            Start tracking expenses <ArrowRight size={15} />
          </button>
        </div>
      </section>

      {/* ── Bottom CTA ─────────────────────────────────────────────────── */}
      <section style={{ margin: "0 48px 80px", background: C.orange, borderRadius: 20, padding: "56px 60px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 30, color: C.bg, margin: "0 0 8px" }}>
            Your next group trip starts as one pin.
          </h2>
          <p style={{ color: "rgba(15,20,16,0.70)", fontSize: 15, margin: 0 }}>
            Free for groups up to 6. No card required.
          </p>
        </div>
        <button
          className="tsl-hover-lift"
          style={{ background: C.bg, color: C.paper, border: "none", borderRadius: 10, padding: "16px 28px", fontSize: 15, fontWeight: 600, fontFamily: "'Inter', sans-serif", display: "flex", alignItems: "center", gap: 8, cursor: "pointer", transition: "transform 0.15s ease", whiteSpace: "nowrap" }}
          onClick={goRegister}
        >
          Create your trip <ArrowRight size={16} />
        </button>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <footer style={{ borderTop: `1px solid ${C.line}`, padding: "24px 48px", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13, color: C.mutedDark }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 22, height: 22, borderRadius: 6, background: C.orange, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Plane size={11} color={C.bg} style={{ transform: "rotate(45deg)" }} />
          </div>
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, color: C.muted }}>TripSync</span>
        </div>
        <span>Built for groups who actually travel together.</span>
        <div style={{ display: "flex", gap: 24 }}>
          <button onClick={goLogin}    style={{ background: "none", border: "none", color: C.mutedDark, fontSize: 13, cursor: "pointer", fontFamily: "'Inter', sans-serif" }}>Sign in</button>
          <button onClick={goRegister} style={{ background: "none", border: "none", color: C.mutedDark, fontSize: 13, cursor: "pointer", fontFamily: "'Inter', sans-serif" }}>Get started</button>
        </div>
      </footer>
    </div>
  );
}
