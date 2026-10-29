"use client";

import { useMemo, useState } from "react";

type Kind = "design" | "edit";
type Field = {
  key: string;
  label: string;
  hint?: string;
  placeholder?: string;
  type?: "text" | "area" | "date" | "select";
  options?: string[];
  required?: boolean;
  wide?: boolean;
};
type Values = Record<string, string>;

const PREFIX: Record<Kind, string> = { design: "Design – ", edit: "Edit – " };

const requestFields: Field[] = [
  { key: "team", label: "Team / branch", placeholder: "e.g. Marketing, Gorontalo Branch", required: true },
  { key: "requester", label: "Requester & contact", placeholder: "Name, WhatsApp number", required: true },
  { key: "priority", label: "Your team's priority", hint: "See the Priority table above.", type: "select", options: ["1st – ASAP", "2nd – ~3 days", "3rd – ~7 days"], required: true },
  { key: "deadline", label: "Needed by", hint: "Real deadline, not a wish date.", type: "date", required: true },
  { key: "sheet", label: "Team spreadsheet link", placeholder: "https://docs.google.com/spreadsheets/…", required: true },
  { key: "row", label: "Row / point number", placeholder: "e.g. 24", required: true },
];

const briefFields: Record<Kind, Field[]> = {
  design: [
    { key: "title", label: "Task title", hint: "Name + size, e.g. “Flyer Kerjasama Indogrosir (A5)”.", placeholder: "Flyer Partnership Indogrosir (A5)", required: true, wide: true },
    { key: "description", label: "Short description", hint: "1–2 sentences: what it is, where and how it is used.", type: "area", required: true, wide: true },
    { key: "context", label: "Context", hint: "1–3 sentences: why this is being made. Helps set tone and priority.", type: "area", required: true, wide: true },
    { key: "content", label: "Content details", hint: "Bullet points, not paragraphs: main text, sub text, promo code, CTA, contact number, address.", type: "area", required: true, wide: true },
    { key: "size", label: "Size & output format", hint: "Be specific: A5, 6×1m banner, 4:5 post, 9:16 story, 16:9 TV banner. Not “standard size”.", placeholder: "A5, print-ready + digital PNG/JPG", required: true },
    { key: "files", label: "Files & references", hint: "Copy document, logo, past design, reference links.", type: "area", required: true },
    { key: "notes", label: "Additional notes", hint: "Optional: target audience, placement, what must stay legible.", type: "area", wide: true },
    { key: "output", label: "Expected output", hint: "Exactly what should be delivered, and how many.", type: "area", required: true, wide: true },
  ],
  edit: [
    { key: "title", label: "Task title", hint: "Name + versions, e.g. “Video Ads Egypt (2 versions)”.", placeholder: "Offline Design Class Ads (2 versions)", required: true, wide: true },
    { key: "description", label: "Short description", hint: "1–2 sentences: what needs to be edited.", type: "area", required: true, wide: true },
    { key: "purpose", label: "Purpose, usage & audience", hint: "Where it is used (Meta Ads, IG Ads, WA broadcast, branch TV, YouTube, videotron, internal recap) and who it is for.", type: "area", required: true, wide: true },
    { key: "footage", label: "Footage & file sources", hint: "Links: main footage, extra footage, VO folder, script document.", type: "area", required: true, wide: true },
    { key: "script", label: "Script / voice over", hint: "Link + notes, e.g. “video 1 has no VO, just music”.", type: "area", required: true },
    { key: "tech", label: "Technical rules", hint: "Duration, aspect ratio, resolution, max file size.", type: "area", required: true },
    { key: "notes", label: "Editing notes", hint: "Set expectations: “footage is limited”, “keep original audio, add soft music”.", type: "area", wide: true },
    { key: "output", label: "Expected output", hint: "Exactly what should be delivered, and how many.", type: "area", required: true, wide: true },
  ],
};

const examples: Record<Kind, { name: string; values: Values }[]> = {
  design: [
    {
      name: "Partnership flyer",
      values: {
        title: "Flyer Kerjasama Timedoor Academy × Indogrosir (A5)",
        description: "A5 flyer for the Timedoor Academy × Indogrosir partnership, handed out to parents shopping at Indogrosir Gorontalo.",
        context: "Many parents don't get the full promo explained at checkout. The flyer bridges that gap, inviting them to a free trial and a registration discount at Timedoor Academy Gorontalo.",
        content: "- Main text: “Belanja di Indogrosir, Diskon di Timedoor!”\n- Sub text bubbles: Coding, Roblox, English, Math\n- Promo code: IDTD2025\n- How to redeem: (1) save the flyer or remember the code (2) visit Timedoor Academy Gorontalo for a free trial (3) join a class and mention the code (4) get Rp50,000 off registration\n- Closing CTA: “Tunggu apa lagi? Ayo belanja di Indogrosir dan dapatkan diskon belajar di Timedoor!”\n- Admin contact (Gorontalo): +62 823-9671-2840",
        size: "A5, print-ready + digital (high-res PNG/JPG)",
        files: "- Logo asset: [link]\n- Longer copy: [GDocs link]",
        notes: "Primary audience is parents shopping at Indogrosir. Promo code and discount must stay clearly legible.",
        output: "1 print-ready A5 flyer + 1 digital file for WhatsApp / social sharing.",
      },
    },
    {
      name: "Branch opening banner",
      values: {
        title: "Banner: Sentul Branch Opening (6×1m)",
        description: "Horizontal banner announcing that Timedoor Academy is now open at Plaza Niaga 2, Sentul.",
        context: "Placed around Sentul City so residents and passersby notice the branch is officially open.",
        content: "- Headline (largest): “Timedoor Academy Now Open In Plaza Niaga 2!”\n- Sub info: “Coding & AI Class for Kids and Teens”\n- Address: Sentul City, Ruko, Jl. Plaza Niaga II No.27 Blok G, Citaringgul, Kabupaten Bogor, Jawa Barat 16810\n- WhatsApp admin: 081258886263\n- Optional CTA: “Coba kelas trial gratis sekarang!”",
        size: "6m × 1m horizontal, outdoor use",
        files: "- Previous banner (if redesigning): [link]\n- Logo asset: [link]",
        notes: "Lead with “Now Open in Plaza Niaga 2”. Address and WhatsApp number must be large and readable from a distance. Highlight only Coding & AI programs. Stay on-brand but high-contrast for outdoor visibility.",
        output: "1 print-ready 6×1m banner.",
      },
    },
    {
      name: "Social carousel",
      values: {
        title: "Parents Education Post: Why Learn Coding (Bangladesh)",
        description: "Carousel social post educating Bangladeshi parents on why coding matters for their kids.",
        context: "Part of an educational campaign for the Bangladesh market, building trust in Timedoor's programs.",
        content: "- Main title: “Why Your Child Should Learn Coding”\n- Slide 1: hook\n- Slides 2–5: key reasons / benefits\n- Last slide: CTA (contact admin / book a trial)\n- Full copy: [Sheet link, “Bangladesh” tab]",
        size: "Carousel, 4:5 or 1:1 (match the team's feed standard)",
        files: "- Draft Canva pages 1–9: [link]\n- Student photo folder: [link]\n- Bangladesh-look reference: [link]",
        notes: "Images in the Canva draft can be swapped or removed if not relevant. Use faces representative of the Bangladesh market. Tone: educational, clean, parent-friendly.",
        output: "1 carousel set (1–6 slides, depending on the sheet's content).",
      },
    },
  ],
  edit: [
    {
      name: "Branch ads video",
      values: {
        title: "Offline Design Class Ads (Sukomanunggal & All Branch)",
        description: "Edit a promo video for the offline design class in 2 versions: one for Sukomanunggal branch, one for all branches.",
        purpose: "Video ads on Meta / IG Ads, targeting parents interested in design classes for kids.",
        footage: "- Main Sukomanunggal class footage: [link]\n- Extra footage: [link]\n- Other-branch footage for variety (optional): [link]\n- VO folder: [link]",
        script: "Full script in GDocs: [link]. VO is already recorded. Sukomanunggal version uses the branch-specific script / VO, All Branch version uses the general one.",
        tech: "9:16, ~20–30 sec, MP4, ads-ready",
        notes: "Highlight kids working on design at the computer plus teacher interaction. Sukomanunggal version prioritizes that branch's footage; All Branch can mix multiple branches consistently.",
        output: "2 videos: 1 Sukomanunggal-specific, 1 All Branch version.",
      },
    },
    {
      name: "Class recap",
      values: {
        title: "Timedoor Life Skill Lab: Public Speaking Recap",
        description: "Short recap video of the Public Speaking class, sent to parents via WhatsApp as documentation.",
        purpose: "Parent-facing documentation, shared by admin via WhatsApp.",
        footage: "- Class footage folder: [link]",
        script: "No VO required. Light BGM is fine as long as it doesn't cover important moments.",
        tech: "30–60 sec, MP4, WhatsApp-friendly file size",
        notes: "Low effort, footage is limited: just pick the best moments. Focus on kids practicing / presenting, classroom interaction and expressions. Optional short opening slide with the Timedoor Life Skill Lab logo.",
        output: "1 recap video, ready to send via WhatsApp.",
      },
    },
    {
      name: "Videotron",
      values: {
        title: "SkillLab Financial Literacy Videotron (KBP)",
        description: "Short video for a videotron display featuring the Financial Literacy SkillLab workshop.",
        purpose: "Videotron display in the Kota Baru Parahyangan (KBP) area, showing the workshop atmosphere.",
        footage: "- SkillLab Financial Literacy footage folder: [link]",
        script: "No VO required. Short music track if the videotron operator allows it.",
        tech: "Max 15 sec, 720×360 resolution, max 20MB, MP4 (or per videotron's own spec)",
        notes: "No complex editing needed: show kids doing the financial simulation activity. Most footage is portrait, so a 3-column portrait grid fits the 720×360 canvas.",
        output: "1 videotron file per the spec above.",
      },
    },
  ],
};

const kinds: { id: Kind; title: string; text: string }[] = [
  { id: "design", title: "New design", text: "Built from scratch: flyer, banner, voucher, certificate, social post, X-banner, mural, badge, logo." },
  { id: "edit", title: "Edit video / design", text: "Not from scratch: trim or summarize a video, swap VO, swap footage, resize, combine footage." },
];

const fmtDate = (value: string) => {
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
};

export function BriefBuilder() {
  const [kind, setKind] = useState<Kind>("design");
  const [values, setValues] = useState<Values>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [attempted, setAttempted] = useState(false);
  const [copied, setCopied] = useState("");
  const [step, setStep] = useState(0);
  const [showExamples, setShowExamples] = useState(false);

  const fields = briefFields[kind];
  const all = useMemo(() => [...requestFields, ...fields], [fields]);
  const val = (key: string) => (values[key] ?? "").trim();
  const activeFields = step === 0 ? requestFields : fields;
  const activeMissing = activeFields.filter((f) => f.required && !val(f.key));
  const stepLabels = ["Request details", kind === "design" ? "Design brief" : "Edit brief", "Review & copy"];
  const required = all.filter((f) => f.required);
  const missing = required.filter((f) => !val(f.key));
  const done = required.length - missing.length;
  const prefix = PREFIX[kind];
  const title = val("title") ? `${prefix}${val("title")}` : "";

  const set = (key: string, value: string) => setValues((v) => ({ ...v, [key]: value }));
  const invalid = (f: Field) => f.required && !val(f.key) && (attempted || touched[f.key]);

  const briefText = () => {
    const line = (f: Field) => (val(f.key) ? (val(f.key).includes("\n") ? `${f.label}:\n${val(f.key)}` : `${f.label}: ${f.key === "deadline" ? fmtDate(val(f.key)) : val(f.key)}`) : null);
    return [title, "", ...requestFields.map(line), "", ...fields.filter((f) => f.key !== "title").map(line)]
      .filter((l) => l !== null)
      .join("\n")
      .replace(/\n{3,}/g, "\n\n");
  };

  const chatText = () =>
    `Hi kak @Timedoor Designer, could you help with ${title || "[request type]"} for ${val("team") || "[team / branch]"}? Full details: ${val("sheet") || "[link]"}, point/row no. ${val("row") || "[X]"}. Needed by: ${val("deadline") ? fmtDate(val("deadline")) : "[date]"}. Thank you!`;

  const copy = async (id: string, text: string) => {
    if (missing.length) {
      setAttempted(true);
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      setCopied(id);
    } catch {
      setCopied("error");
    }
    setTimeout(() => setCopied(""), 2200);
  };

  const reset = () => {
    setValues({});
    setTouched({});
    setAttempted(false);
  };

  const load = (example: Values) => setValues((v) => ({ ...v, ...example }));

  const nextStep = () => {
    setAttempted(true);
    if (activeMissing.length > 0) return;
    setAttempted(false);
    setStep((current) => Math.min(2, current + 1));
  };

  const previousStep = () => {
    setAttempted(false);
    setStep((current) => Math.max(0, current - 1));
  };

  const renderField = (f: Field) => {
    const bad = invalid(f);
    const common = {
      id: `brief-${f.key}`,
      value: values[f.key] ?? "",
      placeholder: f.placeholder,
      onBlur: () => setTouched((t) => ({ ...t, [f.key]: true })),
      className: `builder-input ${bad ? "is-invalid" : ""}`,
      "aria-invalid": bad || undefined,
    };
    return (
      <div key={f.key} className={`builder-field ${f.wide ? "wide" : ""}`}>
        <label htmlFor={common.id} className="builder-label">
          {f.label}
          {f.required ? <span className="builder-req" aria-label="required">*</span> : <span className="builder-opt">optional</span>}
        </label>
        {f.hint && <span className="builder-hint">{f.hint}</span>}
        {f.type === "area" ? (
          <textarea {...common} rows={f.wide ? 4 : 3} onChange={(e) => set(f.key, e.target.value)} />
        ) : f.type === "select" ? (
          <select {...common} onChange={(e) => set(f.key, e.target.value)}>
            <option value="">Select…</option>
            {f.options?.map((o) => <option key={o}>{o}</option>)}
          </select>
        ) : f.key === "title" ? (
          <div className="builder-prefixed"><span>{prefix}</span><input {...common} type="text" onChange={(e) => set(f.key, e.target.value)} /></div>
        ) : (
          <input {...common} type={f.type === "date" ? "date" : "text"} onChange={(e) => set(f.key, e.target.value)} />
        )}
        {bad && <span className="builder-error" role="alert">This is required so the admin can review it.</span>}
      </div>
    );
  };

  const sheetRows = [...requestFields, ...fields.filter((f) => f.key !== "title")];

  return (
    <div className="guide-builder">
      <div className="builder-types" role="radiogroup" aria-label="Request type">
        {kinds.map((k) => (
          <button key={k.id} type="button" role="radio" aria-checked={kind === k.id} className={`builder-type ${kind === k.id ? "active" : ""}`} onClick={() => { setKind(k.id); setStep(0); }}>
            <strong>{k.title}</strong>
            <small>{k.text}</small>
          </button>
        ))}
      </div>

      <div className="builder-stepper" aria-label="Form steps">
        {stepLabels.map((label, index) => <button key={label} type="button" className={step === index ? "active" : step > index ? "done" : ""} onClick={() => index <= step && setStep(index)}><span>{index + 1}</span>{label}</button>)}
      </div>

      {step < 2 && <div className="builder-example-toggle"><button type="button" className="control-button" onClick={() => setShowExamples((open) => !open)}>{showExamples ? "Hide examples" : "Show examples"}</button><span>Use an example if you want a starting point.</span>{showExamples && <div className="builder-examples">{examples[kind].map((ex) => <button key={ex.name} type="button" className="control-button" onClick={() => { load(ex.values); setShowExamples(false); }}>{ex.name}</button>)}<button type="button" className="builder-reset" onClick={reset}>Clear form</button></div>}</div>}

      <div className={`builder-body ${step === 2 ? "is-review" : ""}`}>
        <form className="builder-form" onSubmit={(e) => e.preventDefault()} noValidate>
          {step === 0 && <fieldset className="builder-group"><legend><span>1</span>Request details</legend><p className="builder-group-lead">Start with the basics. This tells the admin who is requesting what, for which team, and by when.</p><div className="builder-grid">{requestFields.map(renderField)}</div></fieldset>}
          {step === 1 && <fieldset className="builder-group"><legend><span>2</span>{kind === "design" ? "Design brief" : "Edit brief"}</legend><p className="builder-group-lead">Give the team enough detail to execute without guessing. Short bullet points are better than a vague paragraph.</p><div className="builder-grid">{fields.map(renderField)}</div></fieldset>}
          {step === 2 && <div className="builder-review-card"><span className="eyebrow">READY TO SEND?</span><h4>Review your brief</h4><p>Check the preview, then copy the full brief into your team spreadsheet. Copy the WhatsApp message only after the spreadsheet row is ready.</p><div className="builder-review-checks"><span>✓ Request details</span><span>✓ Brief information</span><span>✓ Admin-ready format</span></div></div>}

          <div className="builder-footer">
            <button type="button" className="builder-back" onClick={step === 0 ? reset : previousStep}>{step === 0 ? "Clear form" : "← Back"}</button>
            <p>{step < 2 ? `${done}/${required.length} required fields complete` : "All details are ready to review"}</p>
            {step < 2 ? <button type="button" className="primary-button" onClick={nextStep}>Continue <span aria-hidden="true">→</span></button> : <div><button type="button" className="control-button" onClick={() => copy("chat", chatText())}>{copied === "chat" ? "Message copied ✓" : "Copy WhatsApp message"}</button><button type="button" className="primary-button" onClick={() => copy("brief", briefText())}>{copied === "brief" ? "Brief copied ✓" : "Copy full brief"}</button></div>}
          </div>
          {attempted && activeMissing.length > 0 && step < 2 && <p className="builder-missing" role="alert">Complete {activeMissing.length} required {activeMissing.length === 1 ? "field" : "fields"} on this step before continuing.</p>}
          {copied === "error" && <p className="builder-missing" role="alert">Copy failed. Select the text manually.</p>}
        </form>

        {step === 2 && <aside className="builder-aside" aria-label="Brief preview"><div className="builder-sheet"><span className="eyebrow">WHAT THE ADMIN WILL SEE</span><h4 className={title ? "" : "is-empty"}>{title || `${prefix}[Request name]`}</h4><dl>{sheetRows.map((f) => { const value = val(f.key); return <div key={f.key} className={!value && f.required ? "is-missing" : ""}><dt>{f.label}</dt><dd className={value ? "" : "is-empty"}>{value ? (f.key === "deadline" ? fmtDate(value) : value) : f.required ? "Required" : "—"}</dd></div>; })}</dl></div><p className="builder-next">Paste the full brief into your team spreadsheet row, then send the WhatsApp message to your team group.</p></aside>}
      </div>
    </div>
  );
}
