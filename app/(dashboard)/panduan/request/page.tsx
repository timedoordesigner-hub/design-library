import Image from "next/image";
import Link from "next/link";
import { ImageIcon, VideoIcon } from "@/components/Icons";

const designExample = [
  ["Request type", "New design"],
  ["Task title", "Flyer Partnership Indogrosir (A5)"],
  ["Team / branch", "Marketing — Gorontalo"],
  ["Requester & contact", "Alya — +62 823-9671-2840"],
  ["Priority", "2nd — ~3 days"],
  ["Needed by", "20 November 2026"],
  ["Purpose", "A flyer for parents shopping at Indogrosir Gorontalo. The flyer promotes a free trial and a registration discount."],
  ["Content", "Main text: Belanja di Indogrosir, Diskon di Timedoor!\nPrograms: Coding, Roblox, English, Math\nPromo code: IDTD2025\nCTA: Book a free trial"],
  ["Size & output", "A5, print-ready PDF + high-resolution PNG/JPG"],
  ["Files & references", "Logo: [link]\nFull copy: [Google Docs link]\nReference: [link]"],
  ["Expected output", "1 print-ready flyer + 1 digital version for WhatsApp."],
];

const editExample = [
  ["Request type", "Edit video"],
  ["Task title", "Offline Design Class Ads — 2 versions"],
  ["Purpose", "Meta / Instagram ads for parents interested in design classes."],
  ["Footage", "Main footage: [link]\nExtra footage: [link]\nVO folder: [link]"],
  ["Technical rules", "9:16, 20–30 seconds, MP4, ads-ready"],
  ["Editing notes", "Highlight kids working on design and teacher interaction. Make one Sukomanunggal version and one All Branch version."],
  ["Expected output", "2 videos: 1 branch-specific + 1 All Branch version."],
];

type ExampleProps = {
  kind: "design" | "edit";
  label: string;
  title: string;
  rows: string[][];
  open?: boolean;
};

function ExampleBlock({ kind, label, title, rows, open }: ExampleProps) {
  return (
    <details className={`guide-example-block is-${kind}`} open={open}>
      <summary>
        <span className="guide-example-icon">{kind === "design" ? <ImageIcon /> : <VideoIcon />}</span>
        <span className="guide-example-title">
          <small>{label}</small>
          <strong>{title}</strong>
        </span>
        <span className="guide-example-toggle" aria-hidden="true" />
      </summary>
      <dl className="guide-example-list">
        {rows.map(([rowLabel, value]) => (
          <div key={rowLabel}>
            <dt>{rowLabel}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
    </details>
  );
}

export default function GuideRequestPage() {
  return (
    <>
      <section className="guide-intro">
        <p className="eyebrow">HOW TO WRITE YOUR REQUEST</p>
        <h2>Use this example when filling your team spreadsheet.</h2>
        <p>This page is a guide, not a form to submit. Replace the sample text with your real information, then add it to your team&apos;s spreadsheet.</p>
        <div className="guide-actions">
          <a href="https://www.canva.com/design/DAHDzr-I1kM/Sh3tsb6emYGDFRsTsUdo-w/edit" target="_blank" rel="noreferrer" className="primary-button">Open Design Request Template <span aria-hidden="true">↗</span></a>
          <Link href="#submit" className="control-button">See what happens next <span aria-hidden="true">↓</span></Link>
        </div>
      </section>

      <section className="guide-example-intro">
        <div>
          <span className="guide-example-badge">WHAT A GOOD REQUEST LOOKS LIKE</span>
          <h3>Give the team enough detail to execute without guessing.</h3>
        </div>
        <p>Short, specific bullet points work better than “please make something nice”. You do not need to use these exact words.</p>
      </section>

      <div className="guide-example-stack">
        <ExampleBlock kind="design" label="NEW DESIGN" title="Partnership flyer" rows={designExample} open />
        <ExampleBlock kind="edit" label="EDIT VIDEO" title="Branch ads video" rows={editExample} />
      </div>

      <section className="guide-checklist">
        <h3>Before you send it</h3>
        <ul>
          <li><b>Purpose:</b> why is this needed and where will it be used?</li>
          <li><b>Content:</b> what exact text, data, CTA, address, or contact must appear?</li>
          <li><b>Format:</b> what size, duration, ratio, file type, and quantity?</li>
          <li><b>References:</b> are the source files, copy, logo, and examples linked?</li>
          <li><b>Deadline:</b> is the date real and does it match your team&apos;s priority?</li>
        </ul>
      </section>

      <h3 className="guide-heading" id="submit">After the brief: submit &amp; track</h3>
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
        <li>
          <span>2</span>
          <div>
            <strong>Message WhatsApp, tag @Timedoor Designer</strong>
            <p>Send it to your team or branch WA group. Include the spreadsheet link plus the row or point number. Use this format:</p>
            <blockquote>Hi kak @Timedoor Designer, could you help with [request type] for [team/branch name]? Full details: [link], point/row no. [X]. Needed by: [date]. Thank you!</blockquote>
            <figure className="guide-figure">
              <Image src="/guide-whatsapp-example.png" alt="Example WhatsApp messages tagging @Timedoor Designer with a spreadsheet link and row number" width={5407} height={1338} sizes="(max-width: 960px) 100vw, 800px" />
              <figcaption>Real example: spreadsheet link, tab or row number, and a clear ask.</figcaption>
            </figure>
          </div>
        </li>
        <li>
          <span>3</span>
          <div>
            <strong>Wait for confirmation</strong>
            <p>Once the brief is clear and approved, the design team replies with the task title and Notion link. That means the request is officially in the system.</p>
          </div>
        </li>
        <li>
          <span>4</span>
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
