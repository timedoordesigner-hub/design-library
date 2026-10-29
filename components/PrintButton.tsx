"use client";

export function PrintButton() {
  return <button type="button" className="primary-button" onClick={() => window.print()}>Save as PDF</button>;
}
