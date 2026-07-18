import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, ArrowRight, Plane, ChevronRight,
  Users, MapPin, Wallet, Paperclip, Zap, Shield,
  HelpCircle, BookOpen, Bell, Search, Lock, Key,
  FileText, BarChart2, Mail, AlertCircle, Lightbulb,
} from "lucide-react";

const FONT_LINK_ID = "tripsync-landing-fonts";
function useInjectFonts() {
  useEffect(() => {
    if (document.getElementById(FONT_LINK_ID)) return;
    const link = document.createElement("link");
    link.id = FONT_LINK_ID;
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap";
    document.head.appendChild(link);
  }, []);
}

const C = {
  bg:        "#0F1410",
  bgRaised:  "#161D17",
  bgHover:   "#1C2620",
  paper:     "#FAF6EC",
  orange:    "#FF6B35",
  orangeDim: "#D9572A",
  teal:      "#2D5F4F",
  tealLight: "#4F8B77",
  ink:       "#1B231C",
  muted:     "#C9C2AE",
  mutedDark: "#7C8A7E",
  line:      "rgba(201,194,174,0.18)",
};

const NAV_H = 65;

const NAV = [
  {
    group: "Overview",
    items: [
      { id: "introduction",    label: "Introduction",          icon: <BookOpen   size={14} /> },
      { id: "getting-started", label: "Getting Started",       icon: <ArrowRight size={14} /> },
    ],
  },
  {
    group: "Core Features",
    items: [
      { id: "first-trip",      label: "Creating Your First Trip", icon: <Plane    size={14} /> },
      { id: "trip-management", label: "Trip Management",          icon: <FileText size={14} /> },
      { id: "destinations",    label: "Destinations",             icon: <MapPin   size={14} /> },
      { id: "members-roles",   label: "Members & Roles",          icon: <Users    size={14} /> },
    ],
  },
  {
    group: "Money",
    items: [
      { id: "expenses", label: "Expense Management",   icon: <Wallet    size={14} /> },
      { id: "balances", label: "Splitting & Balances", icon: <BarChart2 size={14} /> },
    ],
  },
  {
    group: "Files & Collaboration",
    items: [
      { id: "documents",     label: "Documents & File Uploads", icon: <Paperclip size={14} /> },
      { id: "realtime",      label: "Real-time Collaboration",  icon: <Zap       size={14} /> },
      { id: "notifications", label: "Notifications",            icon: <Bell      size={14} /> },
      { id: "search",        label: "Search & Filters",         icon: <Search    size={14} /> },
    ],
  },
  {
    group: "Security",
    items: [
      { id: "permissions", label: "Permissions & Access Control", icon: <Lock   size={14} /> },
      { id: "privacy",     label: "Privacy & Security",           icon: <Shield size={14} /> },
    ],
  },
  {
    group: "Help",
    items: [
      { id: "faq",             label: "FAQ",                icon: <HelpCircle  size={14} /> },
      { id: "troubleshooting", label: "Troubleshooting",    icon: <AlertCircle size={14} /> },
      { id: "shortcuts",       label: "Keyboard Shortcuts", icon: <Key         size={14} /> },
    ],
  },
  {
    group: "Product",
    items: [
      { id: "changelog", label: "Changelog",         icon: <FileText  size={14} /> },
      { id: "roadmap",   label: "Roadmap",           icon: <Lightbulb size={14} /> },
      { id: "contact",   label: "Contact & Support", icon: <Mail      size={14} /> },
    ],
  },
];

const ALL_IDS = NAV.flatMap(g => g.items.map(i => i.id));

function H1({ children }) {
  return <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 34, color: C.paper, margin: "0 0 12px", letterSpacing: "-0.01em", lineHeight: 1.15 }}>{children}</h1>;
}
function H2({ children }) {
  return <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 22, color: C.paper, margin: "40px 0 12px", letterSpacing: "-0.005em" }}>{children}</h2>;
}
function H3({ children }) {
  return <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 16, color: C.paper, margin: "28px 0 8px" }}>{children}</h3>;
}
function P({ children, style }) {
  return <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, lineHeight: 1.75, color: C.muted, margin: "0 0 16px", ...style }}>{children}</p>;
}
function Lead({ children }) {
  return <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 17, lineHeight: 1.7, color: C.muted, margin: "0 0 28px", borderLeft: "3px solid #FF6B35", paddingLeft: 16 }}>{children}</p>;
}
function Code({ children }) {
  return <code style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, background: "rgba(255,107,53,0.1)", color: C.orange, borderRadius: 5, padding: "2px 7px", border: "1px solid rgba(255,107,53,0.2)" }}>{children}</code>;
}
function Divider() {
  return <hr style={{ border: "none", borderTop: "1px solid rgba(201,194,174,0.18)", margin: "40px 0" }} />;
}
function Section({ id, children }) {
  return <section id={id} style={{ paddingTop: 8, scrollMarginTop: NAV_H + 24 }}>{children}</section>;
}

function Callout({ icon, title, children, color }) {
  const col = color || C.orange;
  return (
    <div style={{ background: col + "18", border: "1px solid " + col + "35", borderRadius: 10, padding: "16px 20px", margin: "20px 0", display: "flex", gap: 14 }}>
      <div style={{ color: col, flexShrink: 0, paddingTop: 2 }}>{icon || <Lightbulb size={16} />}</div>
      <div>
        {title && <div style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 14, color: C.paper, marginBottom: 4 }}>{title}</div>}
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, lineHeight: 1.65, color: C.muted }}>{children}</div>
      </div>
    </div>
  );
}

function Steps({ steps }) {
  return (
    <ol style={{ listStyle: "none", margin: "20px 0", padding: 0 }}>
      {steps.map((s, i) => (
        <li key={i} style={{ display: "flex", gap: 16, marginBottom: 18, alignItems: "flex-start" }}>
          <div style={{ flexShrink: 0, width: 28, height: 28, borderRadius: "50%", background: "rgba(255,107,53,0.12)", border: "1px solid rgba(217,87,42,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: C.orange, fontWeight: 600 }}>
            {i + 1}
          </div>
          <div style={{ paddingTop: 4 }}>
            <div style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 14, color: C.paper, marginBottom: 4 }}>{s.title}</div>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, lineHeight: 1.65, color: C.muted }}>{s.desc}</div>
          </div>
        </li>
      ))}
    </ol>
  );
}

function Table({ cols, rows }) {
  return (
    <div style={{ overflowX: "auto", margin: "20px 0", borderRadius: 10, border: "1px solid rgba(201,194,174,0.18)" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid rgba(201,194,174,0.18)" }}>
            {cols.map(c => (
              <th key={c} style={{ textAlign: "left", padding: "10px 16px", fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: C.mutedDark, letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 500, background: C.bgRaised }}>
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} style={{ borderBottom: ri < rows.length - 1 ? "1px solid rgba(201,194,174,0.18)" : "none" }}>
              {row.map((cell, ci) => (
                <td key={ci} style={{ padding: "12px 16px", fontFamily: "'Inter', sans-serif", fontSize: 14, color: ci === 0 ? C.paper : C.muted, fontWeight: ci === 0 ? 500 : 400 }}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Badge({ children, color }) {
  const col = color || C.tealLight;
  return <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, background: col + "18", color: col, borderRadius: 999, padding: "3px 10px", border: "1px solid " + col + "35", letterSpacing: "0.04em" }}>{children}</span>;
}

function BulletList({ items }) {
  return (
    <ul style={{ margin: "0 0 20px", paddingLeft: 20 }}>
      {items.map(item => (
        <li key={item} style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, color: C.muted, lineHeight: 1.7, marginBottom: 6 }}>{item}</li>
      ))}
    </ul>
  );
}

export default function DocsPage() {
  useInjectFonts();
  const navigate = useNavigate();
  const [active, setActive] = useState("introduction");
  const contentRef = useRef(null);
  const apiDocsUrl = `${(import.meta.env.VITE_API_URL || "").replace(/\/$/, "")}/api-docs`;

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActive(e.target.id);
        }
      },
      { rootMargin: "-" + (NAV_H + 40) + "px 0px -60% 0px", threshold: 0 }
    );
    ALL_IDS.forEach(id => {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, []);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div style={{ background: C.bg, minHeight: "100vh", fontFamily: "'Inter', sans-serif", color: C.paper }}>
      <style>{`
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(201,194,174,0.18); border-radius: 99px; }
        .docs-link:hover { background: #1C2620 !important; color: #FAF6EC !important; }
        .docs-link.active { background: rgba(255,107,53,0.1) !important; color: #FF6B35 !important; }
        .tsl-nav-link:hover { color: #FF6B35 !important; }
      `}</style>

      {/* Navbar */}
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 48px", height: NAV_H, borderBottom: "1px solid rgba(201,194,174,0.18)", position: "sticky", top: 0, zIndex: 50, background: C.bg + "f2", backdropFilter: "blur(14px)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <button onClick={() => navigate("/")} style={{ display: "flex", alignItems: "center", gap: 8, background: "none", border: "none", cursor: "pointer", padding: 0 }}>
            <div style={{ width: 28, height: 28, borderRadius: 7, background: C.orange, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Plane size={14} color={C.bg} style={{ transform: "rotate(45deg)" }} />
            </div>
            <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 16, color: C.paper }}>TripSync</span>
          </button>
          <span style={{ color: "rgba(201,194,174,0.3)", fontSize: 18 }}>/</span>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: C.orange }}>docs</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <button onClick={() => navigate("/")} className="tsl-nav-link" style={{ background: "none", border: "none", cursor: "pointer", color: C.muted, fontSize: 14, fontFamily: "'Inter', sans-serif", display: "flex", alignItems: "center", gap: 6, transition: "color 0.15s" }}>
            <ArrowLeft size={14} /> Back to home
          </button>
          <button onClick={() => window.open(apiDocsUrl, "_blank", "noopener,noreferrer")} className="tsl-nav-link" style={{ background: "none", border: "none", cursor: "pointer", color: C.muted, fontSize: 14, fontFamily: "'Inter', sans-serif", display: "flex", alignItems: "center", gap: 6, transition: "color 0.15s" }}>
            <BookOpen size={14} /> API docs
          </button>
          <button onClick={() => navigate("/register")} style={{ background: C.orange, color: C.bg, border: "none", borderRadius: 999, padding: "8px 18px", fontSize: 13, fontWeight: 600, fontFamily: "'Inter', sans-serif", cursor: "pointer" }}>
            Get started
          </button>
        </div>
      </nav>

      {/* Layout */}
      <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", minHeight: "calc(100vh - " + NAV_H + "px)" }}>

        {/* Sidebar */}
        <aside style={{ position: "sticky", top: NAV_H, height: "calc(100vh - " + NAV_H + "px)", overflowY: "auto", padding: "28px 0 40px", borderRight: "1px solid rgba(201,194,174,0.18)" }}>
          {NAV.map(group => (
            <div key={group.group} style={{ marginBottom: 4 }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: C.mutedDark, padding: "10px 20px 6px", fontWeight: 500 }}>
                {group.group}
              </div>
              {group.items.map(item => (
                <button
                  key={item.id}
                  className={"docs-link" + (active === item.id ? " active" : "")}
                  onClick={() => scrollTo(item.id)}
                  style={{ width: "100%", textAlign: "left", background: "transparent", border: "none", cursor: "pointer", padding: "8px 20px", display: "flex", alignItems: "center", gap: 9, fontFamily: "'Inter', sans-serif", fontSize: 13.5, color: active === item.id ? C.orange : C.muted, transition: "background 0.12s, color 0.12s" }}
                >
                  <span style={{ opacity: 0.7 }}>{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </div>
          ))}
        </aside>

        {/* Content */}
        <main ref={contentRef} style={{ padding: "44px 64px 100px", maxWidth: 800 }}>

          <Section id="introduction">
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: C.orange, letterSpacing: "0.08em", textTransform: "uppercase" }}>Documentation</span>
              <ChevronRight size={12} color={C.mutedDark} />
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: C.mutedDark }}>Introduction</span>
            </div>
            <H1>Welcome to TripSync</H1>
            <Lead>TripSync is a collaborative trip-planning platform built for groups. One shared space for your itinerary, expenses, files, and the people you are traveling with.</Lead>
            <P>Whether you are planning a weekend road trip or a month-long international adventure, TripSync keeps everyone aligned from the first destination pin to the final expense split.</P>
            <H2>What TripSync does</H2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, margin: "20px 0 28px" }}>
              {[
                ["Shared Itinerary", "Pin destinations with dates, times, and estimated costs."],
                ["Expense Tracking", "Log what everyone paid and see who owes what, automatically."],
                ["File Storage", "Attach boarding passes, hotel PDFs, and visa scans to your trip."],
                ["Role-based Access", "Control who can edit vs. who can only view your trip."],
                ["Real-time Sync", "Any change a member makes appears instantly for everyone."],
                ["Team Collaboration", "Add and manage members, assign roles, and stay in sync."],
              ].map(([title, desc]) => (
                <div key={title} style={{ background: C.bgRaised, border: "1px solid rgba(201,194,174,0.18)", borderRadius: 10, padding: "16px 18px" }}>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 13.5, color: C.paper, marginBottom: 6 }}>{title}</div>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: C.mutedDark, lineHeight: 1.55 }}>{desc}</div>
                </div>
              ))}
            </div>
            <Callout icon={<BookOpen size={15} />} title="New to TripSync?">
              Start with Getting Started below to create your account and launch your first trip in under five minutes.
            </Callout>
          </Section>

          <Divider />

          <Section id="getting-started">
            <H1>Getting Started</H1>
            <Lead>Create your account and be inside your first trip in under five minutes.</Lead>
            <H2>Create an account</H2>
            <Steps steps={[
              { title: "Go to the register page", desc: "Click Get started on the homepage or navigate directly to the registration page." },
              { title: "Fill in your details", desc: "Enter your full name, email address, and a password (minimum 8 characters, must include an uppercase letter and a digit)." },
              { title: "Sign in", desc: "After registering, sign in with your email and password. Your session stays active automatically - no re-login every 15 minutes." },
            ]} />
            <H2>Your dashboard</H2>
            <BulletList items={[
              "See all trips you own or belong to.",
              "View upcoming trip dates and member counts at a glance.",
              "Navigate to a specific trip to see its full details.",
              "Manage your profile and settings from the sidebar.",
            ]} />
            <Callout icon={<Zap size={15} />} title="Sessions stay alive">
              TripSync uses a refresh-token system. Your access token refreshes silently every 15 minutes, so you stay logged in for up to 7 days without doing anything.
            </Callout>
          </Section>

          <Divider />

          <Section id="first-trip">
            <H1>Creating Your First Trip</H1>
            <Lead>A trip is the top-level container for your entire travel plan - destinations, members, expenses, and files all live inside it.</Lead>
            <H2>Create a trip</H2>
            <Steps steps={[
              { title: "Click New Trip", desc: "From the Trips page or the dashboard, click the New Trip button to open the creation dialog." },
              { title: "Add the basics", desc: "Give your trip a title, a short description, start date, and end date." },
              { title: "Set a cover image (optional)", desc: "Paste a URL for a cover photo. This appears at the top of your trip page." },
              { title: "Create", desc: "Click Create Trip. You will be taken directly into your new trip workspace." },
            ]} />
            <H2>What happens automatically</H2>
            <BulletList items={[
              "You become the Owner of the trip.",
              "The trip status is set based on dates: Upcoming, Active, or Completed.",
              "An empty destination list, expense ledger, and file store are ready for you.",
            ]} />
          </Section>

          <Divider />

          <Section id="trip-management">
            <H1>Trip Management</H1>
            <Lead>Edit, organise, and delete trips. Control metadata and track status as your travel dates approach.</Lead>
            <H2>Trip status</H2>
            <Table
              cols={["Status", "Condition"]}
              rows={[
                [<Badge color={C.tealLight} key="u">Upcoming</Badge>, "Today is before the start date."],
                [<Badge color={C.orange} key="a">Active</Badge>,      "Today is between start and end dates."],
                [<Badge color={C.mutedDark} key="c">Completed</Badge>, "Today is after the end date."],
              ]}
            />
            <H2>Editing a trip</H2>
            <P>Only the <Code>Owner</Code> or members with the <Code>Editor</Code> role can edit trip details. Click Edit Trip on the trip details page to update the title, description, dates, or cover image.</P>
            <H2>Deleting a trip</H2>
            <P>Only the <Code>Owner</Code> can delete a trip. Deleting a trip permanently removes all its destinations, expenses, members, and documents. This action cannot be undone.</P>
            <Callout icon={<AlertCircle size={15} />} title="Irreversible action" color={C.orangeDim}>
              Deleting a trip cannot be reversed. Download any important documents before proceeding.
            </Callout>
          </Section>

          <Divider />

          <Section id="destinations">
            <H1>Destinations</H1>
            <Lead>Build a day-by-day itinerary by pinning places to your trip. Each destination captures where, when, and how much.</Lead>
            <H2>Adding a destination</H2>
            <Steps steps={[
              { title: "Open the Destinations tab", desc: "Inside your trip, click the Destinations tab." },
              { title: "Click Add Destination", desc: "Fill in the name, an optional description, visit date, visit time, and estimated cost." },
              { title: "Save", desc: "The destination appears in the list, sorted by date and time. All members see it instantly." },
            ]} />
            <H2>Editing and deleting</H2>
            <P>Click the edit icon on any destination card to update its details. Use the delete icon to remove it. See Permissions and Access Control for role restrictions.</P>
            <H2>Estimated cost</H2>
            <P>The estimated cost field is informational only. Log actual costs in the Expenses tab.</P>
          </Section>

          <Divider />

          <Section id="members-roles">
            <H1>Members &amp; Roles</H1>
            <Lead>Invite your travel companions and control exactly what each person can do inside the trip.</Lead>
            <H2>Roles overview</H2>
            <Table
              cols={["Role", "Who has it", "What they can do"]}
              rows={[
                ["Owner",  "Trip creator",   "Full access. Can edit, delete, manage all members, and all content."],
                ["Editor", "Invited member", "Can add or edit destinations, expenses, and documents. Cannot delete the trip."],
                ["Viewer", "Invited member", "Read-only access. Can see all content but cannot make changes."],
              ]}
            />
            <H2>Adding a member</H2>
            <Steps steps={[
              { title: "Open the Members tab", desc: "Inside your trip, click the Members tab." },
              { title: "Click Add Member", desc: "Enter the email address of the person you want to invite. They must already have a TripSync account." },
              { title: "Assign a role", desc: "Choose Editor or Viewer from the dropdown, then confirm." },
            ]} />
            <Callout icon={<Users size={15} />} title="Inviting by email">
              The person you invite must have already registered on TripSync. Inviting an unregistered email will return a user not found error.
            </Callout>
          </Section>

          <Divider />

          <Section id="expenses">
            <H1>Expense Management</H1>
            <Lead>Log what each person paid for. TripSync tracks the running total and calculates per-person shares automatically.</Lead>
            <H2>Adding an expense</H2>
            <Steps steps={[
              { title: "Open the Expenses tab", desc: "Click the Expenses tab inside your trip." },
              { title: "Click Add Expense", desc: "Fill in the title, amount, category, and an optional note." },
              { title: "Confirm", desc: "The expense is logged under your name as the payer. The share amount is calculated instantly." },
            ]} />
            <H2>Expense categories</H2>
            <Table
              cols={["Category", "Use for"]}
              rows={[
                ["Food",      "Restaurants, groceries, coffee, snacks."],
                ["Hotel",     "Accommodation, Airbnb, hostels."],
                ["Transport", "Flights, trains, buses, taxis, fuel."],
                ["Shopping",  "Souvenirs, clothing, gear."],
                ["Other",     "Anything that does not fit the above."],
              ]}
            />
          </Section>

          <Divider />

          <Section id="balances">
            <H1>Expense Splitting &amp; Balances</H1>
            <Lead>TripSync splits every expense equally across all trip members and shows each person running balance.</Lead>
            <H2>How splitting works</H2>
            <div style={{ background: C.bgRaised, border: "1px solid rgba(201,194,174,0.18)", borderRadius: 10, padding: "14px 20px", margin: "16px 0 20px", fontFamily: "'JetBrains Mono', monospace", fontSize: 14, color: C.orange }}>
              shareAmount = totalAmount / numberOfMembers
            </div>
            <P>Every member - regardless of who paid - owes that share amount. The person who paid gets credit for the full amount.</P>
            <H2>Reading balances</H2>
            <Table
              cols={["Field", "Meaning"]}
              rows={[
                ["Paid",    "Total amount this member has paid across all expenses."],
                ["Owes",    "Total share this member owes across all expenses."],
                ["Balance", "Paid minus Owes. Positive means others owe them. Negative means they owe others."],
              ]}
            />
            <Callout icon={<Wallet size={15} />} title="Equal split only">
              TripSync currently splits all expenses equally. Custom splits are on the roadmap.
            </Callout>
          </Section>

          <Divider />

          <Section id="documents">
            <H1>Documents &amp; File Uploads</H1>
            <Lead>Attach boarding passes, hotel bookings, visa copies, and any other travel files directly to your trip.</Lead>
            <H2>Uploading a document</H2>
            <Steps steps={[
              { title: "Open the Documents tab", desc: "Click the Documents tab inside your trip." },
              { title: "Click Upload", desc: "Select a file from your device. Files are uploaded to cloud storage." },
              { title: "Confirm", desc: "The file name is preserved. All trip members can immediately see and download it." },
            ]} />
            <H2>Supported files</H2>
            <P>TripSync accepts any file type: PDFs, images (JPG, PNG), Word documents, spreadsheets, and more.</P>
            <Callout icon={<Paperclip size={15} />} title="Files are trip-scoped">
              Documents uploaded to a trip are visible to all trip members. There are no private files within a trip.
            </Callout>
          </Section>

          <Divider />

          <Section id="realtime">
            <H1>Real-time Collaboration</H1>
            <Lead>When multiple members have a trip open at the same time, every change appears on everyone screen instantly - no refresh needed.</Lead>
            <H2>How it works</H2>
            <P>TripSync uses WebSocket connections (via Socket.io) to keep all open trip sessions in sync. When you open a trip, your browser joins a private channel for that trip. Any change is broadcast to everyone in the channel within milliseconds.</P>
            <H2>What syncs in real time</H2>
            <Table
              cols={["Action", "Who sees the update"]}
              rows={[
                ["Add, edit, or delete an expense",     "All members currently viewing the trip."],
                ["Add, edit, or delete a destination",  "All members currently viewing the trip."],
                ["Add, update, or remove a member",     "All members currently viewing the trip."],
                ["Upload or delete a document",         "All members currently viewing the trip."],
              ]}
            />
            <Callout icon={<Zap size={15} />} title="No refresh needed">
              Changes made by any member propagate to all open sessions automatically. If you ever suspect data is stale, a manual refresh will always bring you up to date.
            </Callout>
          </Section>

          <Divider />

          <Section id="notifications">
            <H1>Notifications</H1>
            <Lead>Stay informed about changes to your trips, even when you are not actively viewing them.</Lead>
            <H2>In-app notifications</H2>
            <P>Real-time updates are delivered while you have a trip page open. When you navigate away, changes made by other members are loaded fresh when you return.</P>
            <H2>Email notifications</H2>
            <BulletList items={[
              "Account registration confirmation.",
              "Password reset requests.",
              "Email verification (if enabled by admin).",
            ]} />
            <Callout icon={<Bell size={15} />} title="Coming soon">
              Push notifications and email alerts for trip events are on the roadmap.
            </Callout>
          </Section>

          <Divider />

          <Section id="search">
            <H1>Search &amp; Filters</H1>
            <Lead>Quickly find the trip or content you need across your workspace.</Lead>
            <H2>Searching trips</H2>
            <P>On the Trips page, use the search bar to filter trips by title. The search is live - results update as you type.</P>
            <H2>Filtering by status</H2>
            <BulletList items={[
              "All - shows every trip you are a member of.",
              "Upcoming - trips that have not started yet.",
              "Active - trips currently in progress.",
              "Completed - trips that have ended.",
            ]} />
            <Callout icon={<Search size={15} />} title="Coming soon">
              Full-text search across destinations, expenses, and documents is planned for a future release.
            </Callout>
          </Section>

          <Divider />

          <Section id="permissions">
            <H1>Permissions &amp; Access Control</H1>
            <Lead>A full breakdown of what each role can and cannot do inside TripSync.</Lead>
            <Table
              cols={["Action", "Owner", "Editor", "Viewer"]}
              rows={[
                ["View trip details",   "Yes", "Yes", "Yes"],
                ["Edit trip details",   "Yes", "Yes", "No"],
                ["Delete trip",         "Yes", "No",  "No"],
                ["Add member",          "Yes", "Yes", "No"],
                ["Update member role",  "Yes", "Yes", "No"],
                ["Remove member",       "Yes", "Yes", "No"],
                ["Add destination",     "Yes", "Yes", "No"],
                ["Edit destination",    "Yes", "Yes", "No"],
                ["Delete destination",  "Yes", "Yes", "No"],
                ["Add expense",         "Yes", "Yes", "No"],
                ["Delete expense",      "Yes", "Yes", "No"],
                ["Upload document",     "Yes", "Yes", "No"],
                ["Delete document",     "Yes", "Yes", "No"],
              ]}
            />
          </Section>

          <Divider />

          <Section id="faq">
            <H1>FAQ</H1>
            <Lead>Answers to the most common questions.</Lead>
            {[
              { q: "Can I be part of multiple trips at the same time?", a: "Yes. You can be a member of as many trips as you want. All trips appear on your Trips page." },
              { q: "Can I invite someone who does not have a TripSync account?", a: "No. The person must already have a registered TripSync account. Share the sign-up link with them first." },
              { q: "Is expense splitting always equal?", a: "Yes, currently TripSync divides every expense equally among all members. Custom per-person splits are planned." },
              { q: "Can I see changes made while I was offline?", a: "Yes. When you open a trip page, all data is fetched fresh from the server so you will always see the latest state." },
              { q: "How do I reset my password?", a: "Click Forgot password on the login page, enter your email, and follow the link sent to your inbox. The link expires after 15 minutes." },
              { q: "Can I delete my account?", a: "Account deletion is not yet available through the UI. Contact support to request account removal." },
            ].map(({ q, a }) => (
              <div key={q} style={{ marginBottom: 28 }}>
                <H3>{q}</H3>
                <P style={{ margin: 0 }}>{a}</P>
              </div>
            ))}
          </Section>

          <Divider />

          <Section id="troubleshooting">
            <H1>Troubleshooting</H1>
            <Lead>Solutions to common issues.</Lead>
            {[
              {
                title: "I am not seeing real-time updates from other members",
                steps: ["Check your internet connection.", "Refresh the trip page - data is fetched fresh on every load.", "Make sure both users are viewing the same trip (same Trip ID in the URL).", "If the issue persists, log out and log back in to re-establish the socket connection."],
              },
              {
                title: "I got a user not found error when adding a member",
                steps: ["The email address you entered does not match any registered TripSync account.", "Ask the person to register first, then try adding them again."],
              },
              {
                title: "My session expired and I was logged out",
                steps: ["This should not happen under normal usage - sessions last 7 days.", "If you were logged out early, your browser may be blocking cookies. Ensure cookies are enabled.", "Private or incognito mode clears cookies when the window closes."],
              },
              {
                title: "A file upload failed",
                steps: ["Check your internet connection.", "Ensure the file is not corrupted or 0 bytes.", "Try a different browser or disable extensions that might be blocking the upload."],
              },
            ].map(({ title, steps }) => (
              <div key={title} style={{ marginBottom: 32 }}>
                <H3>{title}</H3>
                <ol style={{ margin: "8px 0 0", paddingLeft: 20 }}>
                  {steps.map(s => <li key={s} style={{ fontFamily: "'Inter', sans-serif", fontSize: 14.5, color: C.muted, lineHeight: 1.7, marginBottom: 6 }}>{s}</li>)}
                </ol>
              </div>
            ))}
          </Section>

          <Divider />

          <Section id="shortcuts">
            <H1>Keyboard Shortcuts</H1>
            <Lead>Speed up navigation and common actions with these shortcuts.</Lead>
            <Callout icon={<Key size={15} />} title="Platform note">
              On macOS, replace <Code>Ctrl</Code> with <Code>Cmd</Code> for all shortcuts below.
            </Callout>
            <Table
              cols={["Shortcut", "Action"]}
              rows={[
                ["Ctrl + K", "Open quick search / command palette (coming soon)."],
                ["Esc",      "Close any open dialog or modal."],
                ["Tab",      "Move focus between tabs on the trip details page."],
                ["Enter",    "Confirm or submit the focused form or dialog."],
              ]}
            />
          </Section>

          <Divider />

          <Section id="changelog">
            <H1>Changelog</H1>
            <Lead>What has changed in recent releases.</Lead>
            {[
              { version: "v1.3.0", date: "June 2026",  badge: "Latest", changes: ["Real-time collaboration via WebSocket.", "Automatic token refresh - sessions last 7 days.", "Socket reconnect handling."] },
              { version: "v1.2.0", date: "May 2026",   badge: null,     changes: ["Document management via Cloudinary.", "Expense balance breakdown per member.", "Role-based access control throughout."] },
              { version: "v1.1.0", date: "April 2026", badge: null,     changes: ["Expense tracking with categories, payer, and notes.", "Destination management with date, time, and cost.", "Member management - invite by email, assign roles, remove members."] },
              { version: "v1.0.0", date: "March 2026", badge: null,     changes: ["Initial release.", "Trip creation with title, description, and date range.", "User authentication with JWT access and refresh tokens."] },
            ].map(({ version, date, badge, changes }) => (
              <div key={version} style={{ marginBottom: 32, display: "flex", gap: 28 }}>
                <div style={{ flexShrink: 0, width: 100, textAlign: "right" }}>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: C.orange, fontWeight: 500 }}>{version}</div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: C.mutedDark, marginTop: 4 }}>{date}</div>
                  {badge && <div style={{ marginTop: 8 }}><Badge color={C.tealLight}>{badge}</Badge></div>}
                </div>
                <div style={{ flex: 1, borderLeft: "2px solid rgba(201,194,174,0.18)", paddingLeft: 24 }}>
                  <ul style={{ margin: 0, paddingLeft: 16 }}>
                    {changes.map(c => <li key={c} style={{ fontFamily: "'Inter', sans-serif", fontSize: 14.5, color: C.muted, lineHeight: 1.7, marginBottom: 8 }}>{c}</li>)}
                  </ul>
                </div>
              </div>
            ))}
          </Section>

          <Divider />

          <Section id="roadmap">
            <H1>Roadmap</H1>
            <Lead>What is coming next to TripSync.</Lead>
            {[
              { status: "In Progress", color: C.orange,    items: ["Command palette (Ctrl+K) for quick navigation.", "Push notifications for trip events."] },
              { status: "Planned",     color: C.tealLight, items: ["Custom expense splits - define per-person percentages.", "Trip templates.", "Comments on destinations and expenses.", "Mobile app (iOS and Android).", "Ownership transfer between members.", "Full-text search across all trip content."] },
              { status: "Considering", color: C.mutedDark, items: ["Calendar export (iCal / Google Calendar).", "Map view for destinations.", "Budget caps with overage warnings.", "Public trip sharing (view-only link)."] },
            ].map(({ status, color, items }) => (
              <div key={status} style={{ marginBottom: 28 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: color }} />
                  <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 16, color: C.paper }}>{status}</span>
                </div>
                <BulletList items={items} />
              </div>
            ))}
          </Section>

          <Divider />

          <Section id="privacy">
            <H1>Privacy &amp; Security</H1>
            <Lead>How TripSync handles your data and keeps your account safe.</Lead>
            <H2>Authentication</H2>
            <BulletList items={[
              "Access token: a short-lived JWT (15 minutes) sent in the Authorization header, stored in localStorage.",
              "Refresh token: a longer-lived JWT (7 days) stored in an httpOnly cookie, inaccessible to JavaScript.",
              "On each request the access token is verified. If expired, the refresh token silently issues a new one.",
              "On logout, the refresh token is invalidated server-side.",
            ]} />
            <H2>Passwords</H2>
            <P>Passwords are hashed using <Code>bcrypt</Code> with a salt factor of 10. Plain-text passwords are never stored.</P>
            <H2>Data storage</H2>
            <P>Trip data is stored in MongoDB. Uploaded files are stored on Cloudinary. Neither is accessible without authentication.</P>
            <Callout icon={<Shield size={15} />} title="Report a security issue">
              If you discover a security vulnerability, contact us at <Code>security@tripsync.app</Code> before disclosing publicly.
            </Callout>
          </Section>

          <Divider />

          <Section id="contact">
            <H1>Contact &amp; Support</H1>
            <Lead>We are here to help. Reach out through any of the channels below.</Lead>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, margin: "24px 0 32px" }}>
              {[
                { icon: <Mail size={20} color={C.orange} />,      title: "Email support",    desc: "support@tripsync.app",  sub: "We respond within 24 hours." },
                { icon: <FileText size={20} color={C.orange} />,  title: "Bug reports",      desc: "GitHub Issues",         sub: "For technical bugs and feature requests." },
                { icon: <Lightbulb size={20} color={C.orange} />, title: "Feature requests", desc: "roadmap@tripsync.app",  sub: "Share ideas for what to build next." },
                { icon: <Shield size={20} color={C.orange} />,    title: "Security issues",  desc: "security@tripsync.app", sub: "Responsible disclosure only, please." },
              ].map(({ icon, title, desc, sub }) => (
                <div key={title} style={{ background: C.bgRaised, border: "1px solid rgba(201,194,174,0.18)", borderRadius: 12, padding: "20px 22px" }}>
                  <div style={{ marginBottom: 12 }}>{icon}</div>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 14, color: C.paper, marginBottom: 4 }}>{title}</div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: C.orange, marginBottom: 4 }}>{desc}</div>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12.5, color: C.mutedDark }}>{sub}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 48, padding: "28px 32px", background: C.bgRaised, border: "1px solid rgba(201,194,174,0.18)", borderRadius: 16, textAlign: "center" }}>
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 22, color: C.paper, marginBottom: 8 }}>Ready to plan your next trip?</div>
              <P style={{ marginBottom: 20, textAlign: "center" }}>Free for groups up to 6. No card required.</P>
              <button onClick={() => navigate("/register")} style={{ background: C.orange, color: C.bg, border: "none", borderRadius: 999, padding: "12px 28px", fontSize: 15, fontWeight: 600, fontFamily: "'Inter', sans-serif", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8 }}>
                Get started <ArrowRight size={15} />
              </button>
            </div>
          </Section>

        </main>
      </div>
    </div>
  );
}
