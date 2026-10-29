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
        <h2>Priority & scope</h2>
        <p>Find your team&apos;s queue time, then check the design team can take the request.</p>
      </section>

      <h3 className="guide-heading">Queue priority</h3>
      <div className="guide-cards guide-cards-3">
        {priorities.map(([rank, time, teams, tone]) => (
          <div key={rank} className={`guide-card guide-priority guide-priority-${tone}`}>
            <span className="guide-priority-rank">{rank} priority</span>
            <strong>{time}</strong>
            <p>{teams}</p>
          </div>
        ))}
      </div>
      <p className="guide-note">Expected queue time, not a guaranteed delivery date. The admin uses it to balance requests across teams.</p>

      <h3 className="guide-heading">Scope check</h3>
      <div className="guide-cards">
        <div className="guide-card guide-scope-yes">
          <strong>The design team handles</strong>
          <ul>
            <li>New designs: flyers, banners, vouchers, certificates, social posts, logos</li>
            <li>Video editing, motion, campaign and branch materials</li>
            <li>Requests with a clear purpose, content, and expected output</li>
          </ul>
        </div>
        <div className="guide-card guide-scope-self">
          <strong>Try it yourself first</strong>
          <ul>
            <li>Swapping text in an existing Figma template</li>
            <li>Simple resizing that needs no design skill</li>
            <li>“Make a simple banner, anything works” with no direction</li>
          </ul>
        </div>
      </div>

      <div className="guide-cta">
        <strong>Know your priority?</strong>
        <p>Next, use the example to write your request in the team spreadsheet.</p>
        <Link href="/panduan/request" className="primary-button">See request example <span aria-hidden="true">→</span></Link>
      </div>
    </>
  );
}
