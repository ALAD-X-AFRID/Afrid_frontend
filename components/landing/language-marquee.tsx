"use client";

const LANGUAGES = [
  "Swahili", "Yoruba", "Amharic", "Igbo", "Hausa", "Zulu", "Shona",
  "Wolof", "Twi", "Lingala", "Somali", "Malagasy", "Xhosa", "Bambara",
  "Oromo", "Fula", "Kinyarwanda", "Ewe", "Tigrinya", "Akan",
  "Kikuyu", "Luganda", "Tigrinya", "Moore", "Dagbani", "Kasem",
  "Tiv", "Nupe", "Ebira", "Bemba", "Nyanja", "Chewa", "Sango",
  "Kongo", "Luba", "Maasai", "Kalenjin", "Sidamo", "Hadiyya",
  "Tamazight", "Kabyle", "Tachelhit", "Ndebele", "Sotho", "Tswana",
];

export default function LanguageMarquee() {
  return (
    <div className="relative w-full overflow-hidden py-6 border-y border-white/[0.06] bg-white/[0.01]">
      <div className="marquee-track flex items-center gap-8 whitespace-nowrap">
        {[...LANGUAGES, ...LANGUAGES].map((lang, i) => (
          <div key={i} className="flex items-center gap-8">
            <span className="text-lg sm:text-xl font-bold text-white/20 hover:text-[#b27bff] transition-colors duration-300">
              {lang}
            </span>
            <span className="text-[#39e0ff]/30">✦</span>
          </div>
        ))}
      </div>
    </div>
  );
}
