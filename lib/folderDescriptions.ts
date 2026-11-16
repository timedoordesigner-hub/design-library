// Default descriptions per top-level General folder, from the Video Ads description doc.
// Keys are normalized folder names (see key()). Drive descriptions still win over these.
const DESCRIPTIONS: Record<string, string> = {
  "grand opening": "Mengumumkan pembukaan cabang, memperkenalkan merek, membangun awareness, dan menarik pendaftar awal.",
  "extra coding": "Menonjolkan kelas coding tambahan di luar sekolah; menyasar orang tua yang mencari keterampilan ekstra bagi anak.",
  "gadget addiction solution": "Menggambarkan coding sebagai cara produktif menggunakan gadget; relevan bagi orang tua yang khawatir soal penggunaan gadget anak.",
  "prepare for the future": "Menekankan coding sebagai bekal masa depan dan pentingnya keterampilan digital sejak dini.",
  "students achievement": "Menampilkan prestasi siswa sebagai bukti kualitas program dan pembangun kepercayaan.",
  "hilmi yahya": "Mengawali dengan cuplikan podcast Hilmi Yahya, lalu memperkenalkan merek untuk membangun kredibilitas.",
  "trending topic": "Menggunakan berita hangat terkait pendidikan coding untuk memperluas jangkauan dan mendorong interaksi.",
  "comic design": "Mempromosikan program Comic Design.",
  hisensei: "Mempromosikan program Hisensei.",
  "coding hisensei": "Mempromosikan coding sambil menyertakan program Hisensei.",
  "market research": "Menguji respons audiens terhadap pesan atau konsep promosi.",
  "multimedia design": "Materi iklan kreatif dan umum sebagai stok promosi serbaguna; mencakup Creative Ads dan General Ads.",
  "fast result": "Menunjukkan anak dapat segera menghasilkan karya setelah belajar; cocok untuk audiens yang ingin melihat hasil nyata.",
  "learning tools": "Memperkenalkan alat dan platform belajar untuk menonjolkan metode yang modern dan menarik.",
  "fomo parents": "Mendorong orang tua bertindak dengan menampilkan risiko anak tertinggal.",
  "keren karya": "Memamerkan karya siswa untuk menarik minat anak dan menunjukkan hasil belajar.",
  "school prepare": "Menekankan coding sebagai persiapan menuju sekolah atau jenjang berikutnya.",
  "graphic ads": "Promosi berbasis desain grafis dengan tampilan konsisten untuk media sosial.",
  "success story": "Kisah sukses siswa atau alumni untuk membangun kepercayaan dan memotivasi calon siswa.",
  "penting coding": "Menjelaskan manfaat coding, terutama bagi orang tua yang belum memahaminya.",
  fomo: "Menciptakan kesan takut tertinggal agar audiens terdorong segera mendaftar.",
  "digital safety": "Membahas keamanan anak di dunia digital dan kepedulian terhadap keselamatan daring.",
  "peoples perspective": "Memuat pendapat orang tentang coding dan program untuk membangun kepercayaan melalui pengalaman nyata.",
  roblox: "Mengangkat Roblox untuk menarik anak yang menyukai game dan mengenalkan coding melalui game.",
  cyberbullying: "Mengedukasi tentang bahaya perundungan daring sekaligus menunjukkan kepedulian terhadap isu tersebut.",
  "belajar koding": "Ajakan langsung untuk mulai belajar coding dan mendaftar.",
  "screen time": "Membahas pengelolaan waktu layar agar lebih bermanfaat bagi anak.",
  "el barack": "Materi kolaborasi khusus untuk kampanye atau momen tertentu.",
  "ads motion": "Animasi atau motion graphic untuk menyampaikan pesan singkat secara visual.",
  achievement: "Menampilkan pencapaian siswa atau lembaga untuk memperkuat kredibilitas.",
  "pathway ads": "Menjelaskan jalur belajar dari tingkat dasar hingga mahir serta arah karier.",
  "parent relatable": "Menggambarkan situasi sehari-hari orang tua untuk membangun kedekatan emosional.",
  showcase: "Memamerkan hasil karya dan program untuk menunjukkan kualitas pembelajaran.",
  general: "Materi promosi umum yang dapat digunakan untuk beragam kebutuhan.",
  "static image": "Materi gambar diam, bukan video; cocok untuk unggahan cepat dan iklan berbayar.",
  map: "Menampilkan lokasi dan peta cabang agar calon siswa mudah menemukan lokasi.",
  "timedoor facade": "Menampilkan bagian depan dan fasilitas Timedoor untuk mengenalkan tempat belajar.",
  "short general": "Video pendek umum tanpa voice-over, menggunakan musik latar.",
  kampus: "Promosi program kampus dan mahasiswa untuk segmen pendidikan tinggi.",
};

// "01. [GO] Grand Opening" -> "grand opening"; "Student’s Achievement" -> "students achievement"
const key = (name: string) =>
  name
    .replace(/^\s*\d+\.\s*/, "")
    .replace(/\[[^\]]*\]\s*/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, "")
    .replace(/\s+/g, " ")
    .trim();

// Overseas subfolders. Keep identical to the text written in Drive; a Drive description wins over these.
const OVERSEAS_SUBFOLDERS: Record<string, string> = {
  // 01. Egypt
  "02. Edit - Video ADS Timedoor Academy x Cube Inc (3 Video: Online Safety, Study Habits, Patience & Process)":
    "Kolaborasi Timedoor Academy x Cube Inc. Tiga video bertema Online Safety, Study Habits, serta Patience & Process.",
  "03. Edit - Video Recruitment Management Trainee Timedoor Academy Egypt":
    "Video rekrutmen untuk posisi Management Trainee Timedoor Academy Egypt.",
  "04. Edit - Video Ads Egypt 2026 (3 Script, EN & Egypt)":
    "Video ads Egypt 2026 dari 3 script, tersedia dalam versi Egypt dan versi Inggris.",
  "Ver Egypt": "Versi bahasa Egypt dari ketiga script. Revisi voice-over ada di subfolder Revisi.",
  Revisi: "Revisi voice-over untuk ketiga script versi Egypt.",
  "Ver English": "Versi bahasa Inggris dari ketiga script.",
  "Edit – Video Ads Online Class Timedoor Academy MENA":
    "Video ads kelas online Timedoor Academy untuk pasar MENA, terdiri dari 3 video.",
  // 03. Philippines
  "01. PH ads - 01": "PH Ads 01: general ads dalam versi English, versi Philippines, dan versi musik saja.",
  "02. PH ads - 02": "PH Ads 02: Replacement Ads 1 dan 2, masing-masing dalam versi English dan Tagalog.",
  "03. PH ads - Summer ads for Koronadal City Branch": "Summer ads (Summer Coding Adventure) untuk cabang Koronadal City.",
  "04. PH ads - @March 2026": "Ads Philippines update Maret 2026.",
  "05. PH ads - @June 2026": "Ads Philippines Juni 2026: PH OFW Ads dan PH Online Ads.",
  "07. Edit - Rework Video Online Ads PH 2026 (2 Opsi, Versi EN & PH)":
    "Rework video online ads Philippines 2026. Dua opsi, masing-masing dalam versi English dan Philippines.",
  "08. Edit - Video Ads Offline PH 2026 Cabang Treehaus (2 Opsi, Versi EN & PH)":
    "Video ads offline Philippines 2026 untuk cabang Treehaus. Dua hook, masing-masing dalam versi English dan Philippines. Versi cabang YTC ada di subfolder.",
  "Video Ads Offline PH 2026 Cabang YTC":
    "Video ads offline Philippines 2026 untuk cabang YTC. Dua hook, masing-masing dalam versi English dan Philippines.",
  "09. Edit - Video Ads Robotics PH 2026 (2 Opsi)":
    "Video ads Robotics Philippines 2026 dengan 2 script. Versi revisi ada di folder ini, versi sebelumnya di archive.",
  // 04. Malaysia
  "01. Edit - Video Ads Malaysia Teens & Pro (EN + Mandarin)": "Video ads Malaysia untuk segmen Teens dan Pro, dalam versi English dan Mandarin.",
  "02. Edit - Video ADS MY ONLINE": "Video ads online Malaysia dengan 3 opsi.",
  // 06. Mena
  "01. Edit - Motion Video Ads MENA “Paper” (Iklan di Koran)":
    "Motion video ads MENA bertema iklan di koran (Paper), tersedia dalam format 1:1 dan 9:16.",
};
const subfolderKey = (name: string) => name.replace(/\s+/g, " ").trim().toLowerCase();
const OVERSEAS_MAP = new Map(Object.entries(OVERSEAS_SUBFOLDERS).map(([k, v]) => [subfolderKey(k), v]));

export const overseasSubfolderDescription = (name: string) => OVERSEAS_MAP.get(subfolderKey(name)) ?? "";

// "00." folders are containers (Branch Ads, Hisensei, ...), not ad categories.
export const folderDescription = (name: string) =>
  /^\s*00\./.test(name) ? "" : (DESCRIPTIONS[key(name)] ?? "");
