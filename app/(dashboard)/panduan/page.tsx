import Image from "next/image";
import Link from "next/link";

const notionUrl =
  "https://app.notion.com/p/timedoor/Timedoor-Academy-Request-3068150cf41a80dcbfd0fd5eb9333607?source=copy_link";

const steps = [
  { title: "Check the library", text: "Your asset may already exist. Search the Design Library before you request something new.", href: "/", button: "Search designs first", image: "/guide-step-1.png" },
  { title: "Write the brief", text: "Describe the purpose, content, size, and deadline. Use the example as your guide.", href: "/panduan/request#brief", button: "Open brief example", image: "/guide-step-2.png" },
  { title: "Submit once", text: "Add one row to your team spreadsheet, then send one WhatsApp message tagging @Timedoor Designer.", href: "/panduan/request", button: "How to submit", image: "/guide-step-3.png" },
  { title: "Track in Notion", text: "After the design team confirms, follow the queue and status on the Notion page.", href: notionUrl, button: "Open Notion page", external: true, image: "/guide-step-4.png" },
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
        {steps.map((step, index) => (
          <li key={step.title}>
            <span>{index + 1}</span>
            <strong>{step.title}</strong>
          </li>
        ))}
      </ol>

      <div className="guide-breakdown">
        {steps.map((step, index) => {
          const className = "control-button";
          const label = <>{step.button} <span aria-hidden="true">{step.external ? "↗" : "→"}</span></>;
          return (
            <article key={step.title}>
              <div>
                <small>Step {index + 1}</small>
                <strong>{step.title}</strong>
                <p>{step.text}</p>
                {step.external
                  ? <a href={step.href} target="_blank" rel="noreferrer" className={className}>{label}</a>
                  : <Link href={step.href} className={className}>{label}</Link>}
              </div>
              <div className="guide-breakdown-image">
                <Image src={step.image} alt={`Example for step ${index + 1}: ${step.title}`} fill sizes="(max-width: 760px) 100vw, 320px" />
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}
