import Link from "next/link";

const roles = [
  ["01", "Requester", ["Writes the request in the team spreadsheet with complete, accurate details."], "guide-role-requester"],
  ["02", "Design team", ["Admin manages: reviews the scope, priority, and readiness before it enters the queue.", "Design team executes: creates the asset, asks questions when needed, and updates the status."], "guide-role-admin"],
] as const;

const faqs = [
  ["Why was my request returned?", "The brief may be missing direction, required information, usable source material, or may be a task you can complete yourself. Update the spreadsheet row, then resend the request."],
  ["What if the request is last-minute?", "Use the same process. Include the real deadline and reason, then check the Design Library for an asset you can adapt."],
  ["What if the requirements change?", "Update your team spreadsheet and follow up in WhatsApp. Do not change the brief silently or message the designer personally."],
];

const guideLinks = [
  ["Search the library", "Your asset may already exist. Check before you request.", "/", "Search designs", false],
  ["Priority & scope", "See your queue time and what the design team handles.", "/panduan/priority", "View priority", false],
  ["Submit & track", "Spreadsheet, WhatsApp message, and Notion tracking in one page.", "/panduan/request", "See how", false],
] as const;

export default function GuideHelpPage() {
  return (
    <>
      <section className="guide-intro">
        <h2>FAQ & help</h2>
        <p>Quick answers, who does what, and how to reach the design team.</p>
      </section>

      <h3 className="guide-heading">Who does what</h3>
      <ol className="guide-roles">
        {roles.map(([number, name, text, tone]) => (
          <li key={name} className={tone}>
            <span>{number}</span>
            <strong>{name}</strong>
            {text.map((line) => <p key={line}>{line}</p>)}
          </li>
        ))}
      </ol>

      <div className="guide-help-grid">
        <section>
          <h3 className="guide-heading">Common questions</h3>
          <div className="guide-faq">
            {faqs.map(([question, answer]) => (
              <details key={question}>
                <summary>{question}</summary>
                <p>{answer}</p>
              </details>
            ))}
          </div>

          <div className="guide-help-cta">
            <div>
              <strong>Still need help?</strong>
              <p>Ask the design team directly on WhatsApp.</p>
            </div>
            <a href="https://wa.me/6283197186360" target="_blank" rel="noreferrer" className="primary-button">Chat on WhatsApp <span aria-hidden="true">↗</span></a>
          </div>
        </section>

        <section>
          <h3 className="guide-heading">What do you want to do?</h3>
          <div className="guide-cards">
            {guideLinks.map(([title, text, href, button, primary]) => (
              <div key={href} className="guide-card">
                <strong>{title}</strong>
                <p>{text}</p>
                <Link href={href} className={primary ? "primary-button" : "control-button"}>{button} <span aria-hidden="true">→</span></Link>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
