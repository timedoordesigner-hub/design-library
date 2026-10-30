export type BriefExample = {
  kind: "design" | "edit";
  label: string;
  title: string;
  rows: string[][];
  docUrl: string;
};

// Opens the Google Doc directly; falls back to the internal PDF-style page.
export const briefHref = (slug: string, example: BriefExample) => example.docUrl || `/brief-example/${slug}`;

export const briefExamples:Record<string, BriefExample> = {
  design: {
    kind: "design",
    label: "DESIGN",
    title: "Flyer B2S Modular Summit 2026",
    docUrl: "https://docs.google.com/document/d/1qlJqd_-EkRCDZ0KCYqPW-sd-6p-3T7Fq339fogF-s2c/edit?pli=1&tab=t.adm2ppknkhu2",
    rows: [
      ["Task title", "Flyer B2S Modular Summit 2026"],
      ["Team / branch", "Marketing / Gorontalo"],
      ["Requester", "Alya"],
      ["Deadline", "20 November 2026"],
      ["Purpose", "A flyer for parents shopping at Indogrosir Gorontalo. The flyer promotes a free trial and a registration discount."],
      ["Content", "Main text: Belanja di Indogrosir, Diskon di Timedoor!\nPrograms: Coding, Roblox, English, Math\nPromo code: IDTD2025\nCTA: Book a free trial"],
      ["References", "Link your logo, full copy, and a visual reference.\nNo reference yet? Ask ChatGPT or another AI tool for visual ideas, then paste the link or screenshot here."],
      ["Size & output", "A5, print-ready PDF + high-resolution PNG/JPG\n1 print-ready flyer + 1 digital version for WhatsApp."],
    ],
  },
  video: {
    kind: "edit",
    label: "EDIT",
    title: "Motion Video Playschool",
    docUrl: "https://docs.google.com/document/d/1RrTAoBw8b91LoxkU406xXgDo7qV7IMN87LIzn8bCyWs/edit?tab=t.t30r7hwzmvtd",
    rows: [
      ["Task title", "Motion Video Playschool"],
      ["Purpose", "Meta / Instagram ads for parents interested in design classes."],
      ["Footage", "Main footage: [link]\nExtra footage: [link]\nVO folder: [link]"],
      ["Technical rules", "9:16, 20–30 seconds, MP4, ads-ready"],
      ["Editing notes", "Highlight kids working on design and teacher interaction. Make one Sukomanunggal version and one All Branch version."],
      ["Expected output", "2 videos: 1 branch-specific + 1 All Branch version."],
    ],
  },
};
