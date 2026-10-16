export const categoryGroups = [
  { name: "Marketing", description: "Awareness, engagement, partnership, dan penawaran proposal.", subcategories: ["Online marketing", "Offline marketing", "B2S (business to school)", "B2G (business to government)"] },
  { name: "Event", description: "Acara dan kegiatan Timedoor Academy.", subcategories: ["Workshop", "Coding Camp", "Holiday Camp", "Life Skill-Lab", "Open Booth", "YCWC", "Bond Beyond Work", "Exhibition", "Techtrek", "Greetings", "PTM", "Badung Education Fair"] },
  { name: "Branch", description: "Pembukaan dan maintenance branch.", subcategories: ["Interior", "Exterior", "Grand Opening (GO)", "Branch Maintenance"] },
  { name: "Partnership", description: "Program kerja sama dengan bisnis dan pemerintah.", subcategories: ["Pelatihan Guru", "School Partnership"] },
  { name: "Campaign", description: "Promosi, awareness, engagement, dan program khusus.", subcategories: ["Promo Seasonal", "Friend Refferal", "Free Trial", "Diskon", "Coin Exchange / Gacha", "Beasiswa", "Star Student", "Parenting"] },
  { name: "Merchandise", description: "Merchandise dan material fisik untuk promosi, event, atau branding.", subcategories: ["Campus Visit", "Hampers Parcel"] },
  { name: "Courses", description: "Promosi dan materi visual program kursus.", subcategories: ["Book Cover", "Code Adventure", "Python developer", "IoT", "Software developer", "AI Engineer", "Roblox", "Design", "Comic", "Math", "Science", "English"] },
] as const;

export const mediaTypes = [
  "Ads", "Bag", "Balon", "Booklet", "Booth Design", "Bulletin Board", "Banner", "Baliho", "Box", "Brochure/Brosur", "Calendar", "Certificate", "Cover Buku", "E-Money Card", "Exterior", "Fan / hand fan", "Flyer", "Greeting Card", "Guide Book", "Header Letter/Kop Surat", "ID Card", "Interior", "Invoice", "Jacket Varsity", "Jam Dinding", "Keychain", "Kipas", "Kue/Cake", "Logo", "Medali", "Mousepad", "Money", "Mug", "Notepad", "Neonbox", "Newsletter", "Pamflet Lipat", "Pin", "Plakat", "Poster", "Presentation", "Property Foto", "Proposal", "Pouch", "Report Card", "Room Sign", "Social Media", "Spanduk", "Standing Banner (X-Banner)", "Sticker", "Signboard", "Standee", "T-Shirt", "Tumbler", "Topi/Cap", "Umbul-Umbul / Flag", "voucher", "Website", "Winner Board",
] as const;

export const categoryNames = categoryGroups.map((group) => group.name);

export const categoryTones: Record<string, { accent: string; soft: string; base: string }> = {
  Marketing: { accent: "#1450b5", soft: "#e8f1fe", base: "#d6e5fc" },
  Event: { accent: "#b54708", soft: "#fff1e0", base: "#fde3c6" },
  Branch: { accent: "#0b7a75", soft: "#e0f5f3", base: "#c5ebe7" },
  Partnership: { accent: "#6941c6", soft: "#f0ebfd", base: "#e1d7fa" },
  Campaign: { accent: "#c11574", soft: "#fde8f3", base: "#f9cfe6" },
  Merchandise: { accent: "#8a6a00", soft: "#fdf6d8", base: "#f8ebb0" },
  Courses: { accent: "#108513", soft: "#dbfddb", base: "#c3f3c3" },
};

export const fallbackTone = { accent: "#5b6270", soft: "#f0f2f8", base: "#e3e6ee" };
// Category bisa berisi beberapa nilai ("Marketing, Branch"); nada mengikuti yang pertama.
export const splitCategories = (category: string) => category.split(",").map((c) => c.trim()).filter(Boolean);
export const toneOf = (category: string) => categoryTones[splitCategories(category)[0] ?? ""] ?? fallbackTone;
