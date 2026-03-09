import { useState } from "react";

export default function FeedbackWidget({ T, L }) {
  const [open, setOpen]         = useState(false);
  const [r1, setR1]             = useState(0);
  const [hover1, setHover1]     = useState(0);
  const [r2, setR2]             = useState(0);
  const [hover2, setHover2]     = useState(0);
  const [comment, setComment]   = useState("");
  const [gender, setGender]     = useState("");
  const [age, setAge]           = useState("");
  const [submitted, setSubmit]  = useState(false);

  const handleSubmit = () => {
    if (!r1 || !r2) return;
    try { localStorage.setItem("pfl_feedback", JSON.stringify({ q1:r1, q2:r2, comment, gender, age, ts: new Date().toISOString() })); }
    catch {}
    setSubmit(true);
  };

  const StarRow = ({ value, hover, onSet, onHover }) => (
    <div style={{ display: "flex", gap: 4, margin: "8px 0 4px" }}>
      {[1,2,3,4,5].map(s => (
        <button key={s} onClick={() => onSet(s)} onMouseEnter={() => onHover(s)} onMouseLeave={() => onHover(0)}
          style={{ background: "none", border: "none", cursor: "pointer", fontSize: 22, transition: "transform .1s",
            transform: (hover || value) >= s ? "scale(1.2)" : "scale(1)",
            color: (hover || value) >= s ? T.amb : T.faint }}>★</button>
      ))}
    </div>
  );

  const sel = { width: "100%", background: T.surB, border: `1px solid ${T.bdr}`, borderRadius: 6,
    padding: "8px 10px", fontFamily: T.mono, fontSize: 12, color: T.text, outline: "none", marginTop: 5 };

  if (!open) return (
    <button onClick={() => setOpen(true)}
      style={{ position: "fixed", bottom: 28, left: 28, zIndex: 200, background: T.sur,
        border: `1px solid ${T.bdr}`, borderRadius: 12, padding: "9px 16px", cursor: "pointer",
        display: "flex", alignItems: "center", gap: 8, color: T.dim, fontFamily: T.body, fontSize: 12,
        boxShadow: `0 4px 16px ${T.shadow}`, transition: "all .2s" }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = T.amb; e.currentTarget.style.color = T.text; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = T.bdr; e.currentTarget.style.color = T.dim; }}>
      <span style={{ fontSize: 15 }}>★</span>{L.feedbackBtn}
    </button>
  );

  return (
    <div className="slide" style={{ position: "fixed", bottom: 20, left: 20, zIndex: 200, width: 340,
      background: T.sur, border: `1px solid ${T.bdrM}`, borderRadius: 14, padding: 22,
      boxShadow: `0 8px 40px ${T.shadow}`, maxHeight: "90vh", overflowY: "auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <span style={{ fontFamily: T.disp, fontSize: 15, fontWeight: 700, color: T.text }}>★ {L.feedbackTitle}</span>
        <button onClick={() => setOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: T.dim, fontSize: 18 }}>×</button>
      </div>
      {submitted ? (
        <div style={{ textAlign: "center", padding: "20px 0" }}>
          <div style={{ fontSize: 32, marginBottom: 10 }}>🎉</div>
          <p style={{ fontFamily: T.body, fontSize: 14, color: T.text, marginBottom: 4 }}>{L.thankYou}</p>
          <p style={{ fontFamily: T.body, fontSize: 12, color: T.dim }}>{L.thankYouSub}</p>
        </div>
      ) : (
        <>
          <div style={{ marginBottom: 14 }}>
            <p style={{ fontFamily: T.body, fontSize: 13, color: T.text, lineHeight: 1.5 }}>{L.feedbackQ1}</p>
            <StarRow value={r1} hover={hover1} onSet={setR1} onHover={setHover1} />
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontFamily: T.mono, fontSize: 10, color: T.faint }}>{L.feedbackNotAtAll}</span>
              <span style={{ fontFamily: T.mono, fontSize: 10, color: T.faint }}>{L.feedbackLotsHelp}</span>
            </div>
          </div>
          <div style={{ marginBottom: 14 }}>
            <p style={{ fontFamily: T.body, fontSize: 13, color: T.text, lineHeight: 1.5 }}>{L.feedbackQ2}</p>
            <StarRow value={r2} hover={hover2} onSet={setR2} onHover={setHover2} />
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontFamily: T.mono, fontSize: 10, color: T.faint }}>{L.feedbackNotAtAll}</span>
              <span style={{ fontFamily: T.mono, fontSize: 10, color: T.faint }}>{L.feedbackLotsHelp}</span>
            </div>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontFamily: T.mono, fontSize: 11, color: T.dim, display: "block", marginBottom: 4 }}>{L.feedbackGender}</label>
            <select value={gender} onChange={e => setGender(e.target.value)} style={sel}>
              <option value="">—</option>
              <option value="M">{L.genderM}</option>
              <option value="F">{L.genderF}</option>
              <option value="NB">{L.genderNB}</option>
              <option value="NA">{L.genderNA}</option>
            </select>
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontFamily: T.mono, fontSize: 11, color: T.dim, display: "block", marginBottom: 4 }}>{L.feedbackAge}</label>
            <select value={age} onChange={e => setAge(e.target.value)} style={sel}>
              <option value="">—</option>
              <option value="lt20">{L.ageLt20}</option>
              <option value="20-29">{L.age2029}</option>
              <option value="30-39">{L.age3039}</option>
              <option value="40-59">{L.age4059}</option>
              <option value="60+">{L.age60}</option>
            </select>
          </div>
          <div style={{ marginBottom: 18 }}>
            <label style={{ fontFamily: T.mono, fontSize: 11, color: T.dim, display: "block", marginBottom: 4 }}>{L.feedbackComment}</label>
            <textarea value={comment} onChange={e => setComment(e.target.value)}
              placeholder={L.feedbackCommentPlaceholder} rows={3}
              style={{ ...sel, resize: "vertical", minHeight: 72, fontFamily: T.body, lineHeight: 1.5 }} />
          </div>
          <button disabled={!r1 || !r2} onClick={handleSubmit}
            style={{ width: "100%", fontFamily: T.disp, fontSize: 13, fontWeight: 700,
              color: r1 && r2 ? "#fff" : T.dim, background: r1 && r2 ? T.amb : T.surB,
              border: "none", borderRadius: 8, padding: "11px", cursor: r1 && r2 ? "pointer" : "not-allowed",
              transition: "all .2s", opacity: r1 && r2 ? 1 : 0.5 }}>
            {L.submitFeedback}
          </button>
        </>
      )}
    </div>
  );
}
