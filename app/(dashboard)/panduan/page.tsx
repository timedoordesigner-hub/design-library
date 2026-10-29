import Image from "next/image";
import Link from "next/link";

const notionUrl =
  "https://app.notion.com/p/timedoor/Timedoor-Academy-Request-3068150cf41a80dcbfd0fd5eb9333607?source=copy_link";

const steps = [
  { title: "Check the library", text: "Your asset may already exist. Search the Design Library before you request something new.", href: "/", button: "Search designs first" },
  { title: "Write the brief", text: "Describe the purpose, content, size, and deadline. Use the example as your guide.", href: "/panduan/request#brief", button: "Open brief example", primary: true },
  { title: "Submit once", text: "Add one row to your team spreadsheet, then send one WhatsApp message tagging @Timedoor Designer.", href: "/panduan/request", button: "How to submit" },
  { title: "Track in Notion", text: "After the design team confirms, follow the queue and status on the Notion page.", href: notionUrl, button: "Open Notion page", external: true },
];

const cards = [
  { title: "Search the library", text: "Your asset may already exist. Check before you request.", href: "/", button: "Search designs" },
  { title: "Priority & scope", text: "See your queue time and what the design team handles.", href: "/panduan/priority", button: "View priority" },
  { title: "Submit & track", text: "Spreadsheet, brief example, WhatsApp message, and Notion tracking in one page.", href: "/panduan/request", button: "See how", primary: true },
  { title: "FAQ & help", text: "Returned request, last-minute work, or contact the team.", href: "/panduan/help", button: "Get help" },
];

export default function GuideOverviewPage() {
  return (
    <>
      <section className="guide-hero">
        <p className="eyebrow">REQUEST GUIDE</p>
        <h2>Need a design? Write a clear request in 4 steps.</h2>
        <p>Check the library, follow the example, submit once, and track the result.</p>
      </section>

      <ol className="guide-steps">
        {steps.map((step, index) => {
          const className = step.primary ? "primary-button" : "control-button";
          const label = <>{step.button} <span aria-hidden="true">{step.external ? "↗" : "→"}</span></>;
          return (
            <li key={step.title}>
              <span>{index + 1}</span>
              <div>
                <strong>{step.title}</strong>
                <p>{step.text}</p>
                {step.external
                  ? <a href={step.href} target="_blank" rel="noreferrer" className={className}>{label}</a>
                  : <Link href={step.href} className={className}>{label}</Link>}
              </div>
            </li>
          );
        })}
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
