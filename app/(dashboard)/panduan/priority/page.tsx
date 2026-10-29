import Link from "next/link";

const priorities = [
  ["1st", "ASAP", "Team Expansion (opening a branch), Marketing, Curriculum, System Team", "high"],
  ["2nd", "~3 days", "Overseas, Hisensei, Playschool", "medium"],
  ["3rd", "~7 days", "HQ, Branch Manager, single-branch Team Expansion media request", "low"],
];

export default function GuidePriorityPage() {
  return (
    <>
      <section className="guide-intro">
        <h2>Where does your request fit?</h2>
        <p>Not sure if your request is a good fit? Check what the design team can help with, then find your team&apos;s usual queue time.</p>
      </section>

      <section className="guide-scope-panel">
        <p className="eyebrow">SCOPE CHECK</p>
        <h3>What can we help with?</h3>
        <p className="guide-scope-lead">You can send a request when it needs design work and you already have the main details ready: the purpose, content, references, and deadline.</p>
        <div className="guide-scope-list">
          <div className="guide-scope-included">
            <strong>Send it to us</strong>
            <p>Anything that needs a designer to create, edit, or shape the look.</p>
            <ul>
              <li>Flyers, banners, vouchers, certificates, social posts, and logos</li>
              <li>Video editing, motion, campaign, and branch materials</li>
            </ul>
          </div>
          <div className="guide-scope-self">
            <strong>Try it yourself first</strong>
            <p>Quick fixes are usually faster when your team does them directly.</p>
            <ul>
              <li>Swapping text in an existing Figma template</li>
              <li>Simple resizing, or when there is no clear direction yet</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="guide-priority-section">
        <h3 className="guide-heading">How long is the wait?</h3>
        <p className="guide-section-lead">Find your team below to see about how long your request usually waits in the queue.</p>
        <div className="guide-ranking-card">
          <div className="guide-ranking-head" aria-hidden="true">
            <span>Priority</span>
            <span>Usual wait</span>
            <span>Team</span>
          </div>
          <ol className="guide-ranking">
            {priorities.map(([rank, time, teams, tone]) => (
              <li key={rank} className={`guide-ranking-${tone}`}>
                <div className="guide-ranking-priority">
                  <strong>{rank}</strong>
                </div>
                <div className="guide-ranking-time">
                  <span>{time.replace(/^~\s*/, "")}</span>
                </div>
                <div className="guide-ranking-team">
                  <p>{teams}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
        <p className="guide-note">These are rough estimates, not delivery dates. The admin uses them to keep things fair across teams.</p>
      </section>

      <div className="guide-cta">
        <strong>Ready to write your request?</strong>
        <p>Next up: see where to log it and what to send on WhatsApp.</p>
        <Link href="/panduan/request" className="primary-button">Submit &amp; track <span aria-hidden="true">→</span></Link>
      </div>
    </>
  );
}
