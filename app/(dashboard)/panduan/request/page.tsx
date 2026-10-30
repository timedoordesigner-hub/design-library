import Image from "next/image";
import { ImageIcon, VideoIcon } from "@/components/Icons";
import { briefExamples, briefHref } from "@/lib/briefExamples";

export default function GuideRequestPage() {
  return (
    <>
      <section className="guide-intro">
        <p className="eyebrow">SUBMIT &amp; TRACK</p>
        <h2>Write it, send it, track it.</h2>
        <p>Log your brief in your team spreadsheet, send one WhatsApp message, and follow the result in Notion. The design team will confirm the request and share the task link.</p>
      </section>

      <h3 className="guide-heading" id="submit">Step by step</h3>
      <ol className="guide-submit">
        <li>
          <span>1</span>
          <div>
            <strong>Log your request in your team&apos;s spreadsheet</strong>
            <p>Every team or branch keeps its own order-list spreadsheet, so all requests from one team live in one place and are easy to trace.</p>
            <ul>
              <li>Already have a spreadsheet? Follow the same format. Ask your Team Lead or Branch Manager.</li>
              <li>New team or branch? Duplicate the template first.</li>
            </ul>
            <a href="https://www.canva.com/design/DAHDzr-I1kM/Sh3tsb6emYGDFRsTsUdo-w/edit" target="_blank" rel="noreferrer" className="control-button">Open Design Request Template <span aria-hidden="true">↗</span></a>
          </div>
        </li>
        <li id="brief">
          <span>2</span>
          <div>
            <strong>Write your brief clearly</strong>
            <p>Open the example that matches your work. It opens in a new tab as a Google Doc, so you can read it next to your spreadsheet. You do not need to use the exact same words.</p>
            <div className="guide-example-stack">
              {Object.entries(briefExamples).map(([slug, example]) => (
                <a key={slug} href={briefHref(slug, example)} target="_blank" rel="noreferrer" className={`guide-example-link is-${example.kind}`}>
                  <span className="guide-example-icon">{example.kind === "design" ? <ImageIcon /> : <VideoIcon />}</span>
                  <span className="guide-example-title">
                    <small>{example.label}</small>
                    <strong>{example.title}</strong>
                  </span>
                  <span className="guide-example-open">Open example <span aria-hidden="true">↗</span></span>
                </a>
              ))}
            </div>
            <p>Before you send it, check that your row covers:</p>
            <ul>
              <li><b>Purpose:</b> why is this needed and where will it be used?</li>
              <li><b>Content:</b> what exact text, data, CTA, address, or contact must appear?</li>
              <li><b>Format:</b> what size, duration, ratio, file type, and quantity?</li>
              <li><b>References:</b> are the source files, copy, logo, and examples linked?</li>
              <li><b>Deadline:</b> is the date real and does it match your team&apos;s priority?</li>
            </ul>
          </div>
        </li>
        <li>
          <span>3</span>
          <div>
            <strong>Message WhatsApp, tag @Timedoor Designer</strong>
            <p>Send it to your team or branch WA group. Include the spreadsheet link plus the row or point number.</p>
            <figure className="guide-figure">
              <Image src="/guide-whatsapp-example.png" alt="Example WhatsApp messages tagging @Timedoor Designer with a spreadsheet link and row number" width={5407} height={1338} sizes="(max-width: 960px) 100vw, 800px" />
              <figcaption>Real example: spreadsheet link, tab or row number, and a clear ask.</figcaption>
            </figure>
          </div>
        </li>
        <li>
          <span>4</span>
          <div>
            <strong>Wait for confirmation</strong>
            <p>Once the brief is clear and approved, the design team replies with the task title, deadline estimate, and Notion link. That means the request is officially in the system.</p>
            <figure className="guide-figure guide-confirmation-figure">
              <Image src="/guide-confirmation-example.png" alt="Example WhatsApp confirmation with a Notion task link and estimated deadline" width={1065} height={295} sizes="(max-width: 960px) 100vw, 1065px" />
              <figcaption>Example confirmation: task link, estimated deadline, and update promise.</figcaption>
            </figure>
          </div>
        </li>
        <li>
          <span>5</span>
          <div>
            <strong>Track progress in Notion</strong>
            <p>Check the design team&apos;s queue and status in the Timedoor Academy Request page on Notion. No personal DMs or repeated follow-ups.</p>
            <a href="https://app.notion.com/p/timedoor/Timedoor-Academy-Request-3068150cf41a80dcbfd0fd5eb9333607?source=copy_link" target="_blank" rel="noreferrer" className="control-button">Open Notion page <span aria-hidden="true">↗</span></a>
            <a href="https://app.notion.com/p/timedoor/Timedoor-Academy-Request-3068150cf41a80dcbfd0fd5eb9333607?source=copy_link" target="_blank" rel="noreferrer" className="guide-notion-preview">
              <Image src="/notion-design-academy.png" alt="Timedoor Academy Creative's Task page in Notion, with the green Timedoor Academy logo" width={1807} height={484} sizes="(max-width: 960px) 100vw, 600px" />
            </a>
          </div>
        </li>
      </ol>
    </>
  );
}
