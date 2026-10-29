import Image from "next/image";
import Link from "next/link";

const notionUrl =
  "https://app.notion.com/p/timedoor/Timedoor-Academy-Request-3068150cf41a80dcbfd0fd5eb9333607?source=copy_link";

const steps = [
  ["1", "Check the library", "Your asset may already exist."],
  ["2", "Write the brief", "Use the example as your guide."],
  ["3", "Submit once", "Spreadsheet row + WhatsApp message."],
  ["4", "Track in Notion", "Follow the queue and status on the Notion link."],
];

const cards = [
  { title: "Search the library", text: "Your asset may already exist. Check before you request.", href: "/", button: "Search designs" },
  { title: "Priority & scope", text: "See your queue time and what the design team handles.", href: "/panduan/priority", button: "View priority" },
  { title: "Request example", text: "See exactly what to write in your team spreadsheet.", href: "/panduan/request", button: "See the example", primary: true },
  { title: "FAQ & help", text: "Returned request, last-minute work, or contact the team.", href: "/panduan/help", button: "Get help" },
];

export default function GuideOverviewPage() {
  return (
    <>
      <section className="guide-hero">
        <p className="eyebrow">REQUEST GUIDE</p>
        <h2>Need a design? Write a clear request in 4 steps.</h2>
        <p>Check the library, follow the example, submit once, and track the result.</p>
        <div className="guide-actions">
          <Link href="/panduan/request" className="primary-button">See request example <span aria-hidden="true">→</span></Link>
          <Link href="/" className="control-button">Search designs first <span aria-hidden="true">→</span></Link>
        </div>
      </section>

      <ol className="guide-steps">
        {steps.map(([number, title, text]) => (
          <li key={number}><span>{number}</span><strong>{title}</strong><p>{text}</p></li>
        ))}
      </ol>

      <section className="guide-notion-card">
        <div className="guide-notion-copy">
          <p className="eyebrow">TRACK YOUR REQUEST</p>
          <h3>Timedoor Academy Creative&apos;s Task</h3>
          <p>Once the design team confirms your request, follow its queue and status on this Notion page. Look for the page with this cover and logo.</p>
          <a href={notionUrl} target="_blank" rel="noreferrer" className="primary-button">Open Notion page <span aria-hidden="true">↗</span></a>
        </div>
        <a href={notionUrl} target="_blank" rel="noreferrer" className="guide-notion-preview" aria-label="Open the Timedoor Academy Creative's Task page in Notion">
          <Image src="/notion-design-academy.png" alt="Timedoor Academy Creative's Task page in Notion, with the green Timedoor Academy logo" width={1807} height={484} sizes="(max-width: 760px) 100vw, 420px" />
        </a>
      </section>

      <h3 className="guide-heading">What do you want to do?</h3>
      <div className="guide-cards">
        {cards.map((card) => (
          <div key={card.href} className="guide-card">
            <strong>{card.title}</strong>
            <p>{card.text}</p>
            <Link href={card.href} className={card.primary ? "primary-button" : "control-button"}>{card.button} <span aria-hidden="true">→</span></Link>
          </div>
        ))}
      </div>
    </>
  );
}
