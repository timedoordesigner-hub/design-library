import { notFound } from "next/navigation";
import { PrintButton } from "@/components/PrintButton";
import { briefExamples } from "@/lib/briefExamples";

// Known slugs are prerendered at build time; Cache Components rejects unknown params outside Suspense.
export function generateStaticParams() {
  return Object.keys(briefExamples).map((kind) => ({ kind }));
}

// Paper-style page meant to open in a new tab; "Save as PDF" uses the browser print dialog.
export default async function BriefExamplePage({ params }: PageProps<"/brief-example/[kind]">) {
  const { kind } = await params;
  const example = briefExamples[kind];
  if (!example) notFound();

  return (
    <div className="brief-doc-bg">
      <div className="brief-doc-bar">
        <span>{example.title}.pdf</span>
        <PrintButton />
      </div>
      <article className="brief-doc">
        <header>
          <p className="brief-doc-brand">TIMEDOOR ACADEMY · DESIGN REQUEST</p>
          <small>{example.label}</small>
          <h1>{example.title}</h1>
          <p>Example brief. Copy the details that apply into your team spreadsheet.</p>
        </header>
        <dl>
          {example.rows.map(([label, value]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
        <aside className="brief-doc-note">
          <div className="brief-doc-note-head">
            <span aria-hidden="true">✓</span>
            <div>
              <strong>Why this is a good brief</strong>
              <p>The design team can start right away without asking follow-up questions.</p>
            </div>
          </div>
          <ul className="brief-doc-note-points">
            <li><b>Clear purpose</b> Says why it is needed and who it is for.</li>
            <li><b>Exact content</b> Text, CTA, and details are written out.</li>
            <li><b>Ready to start</b> Size, references, and deadline are included.</li>
          </ul>
          <p className="brief-doc-note-more">More good examples</p>
          <div className="brief-doc-note-links">
            {Object.values(briefExamples).map((other) => (
              <a key={other.title} href={other.docUrl} target="_blank" rel="noreferrer">
                <small>{other.label}</small>
                {other.title} <span aria-hidden="true">↗</span>
              </a>
            ))}
          </div>
        </aside>
        <footer>Timedoor Academy Design Library · Request Guide</footer>
      </article>
    </div>
  );
}
