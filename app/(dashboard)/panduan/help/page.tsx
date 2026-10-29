const roles = [
  ["Requester", "Provides accurate information in the team spreadsheet."],
  ["Admin", "Checks scope and priority."],
  ["Design team", "Creates the asset and updates the status."],
];

const faqs = [
  ["Why was my request returned?", "The brief may have no direction, missing information, poor source material, or a task you can do yourself. Complete the form and resend it."],
  ["What if the request is last-minute?", "Submit it through the same process, include the deadline and the reason, and check Design Pool for an asset you can adapt."],
  ["What if the requirements change?", "Update your team spreadsheet and follow up in WhatsApp. Do not change the brief silently or message the designer personally."],
];

export default function GuideHelpPage() {
  return (
    <>
      <section className="guide-intro">
        <h2>FAQ & help</h2>
        <p>Quick answers, who does what, and how to reach the design team.</p>
      </section>

      <h3 className="guide-heading">Who does what</h3>
      <div className="guide-cards guide-cards-3">
        {roles.map(([name, text]) => (
          <div key={name} className="guide-card">
            <strong>{name}</strong>
            <p>{text}</p>
          </div>
        ))}
      </div>

      <h3 className="guide-heading">FAQ</h3>
      <div className="guide-faq">
        {faqs.map(([question, answer]) => (
          <details key={question}>
            <summary>{question}</summary>
            <p>{answer}</p>
          </details>
        ))}
      </div>

      <div className="guide-cta">
        <strong>Still stuck?</strong>
        <p>Ask the design team directly on WhatsApp: +62 831-9718-6360.</p>
        <a href="https://wa.me/6283197186360" target="_blank" rel="noreferrer" className="primary-button">Chat on WhatsApp <span aria-hidden="true">↗</span></a>
      </div>
    </>
  );
}
