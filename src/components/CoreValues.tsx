import React, { useState } from 'react';
import { BookOpen, Globe, Cpu, X, ArrowRight, CheckCircle2, Sparkles, Star, Award, Heart } from 'lucide-react';

interface ValueDetail {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  badge: string;
  colorBg: string;
  colorText: string;
  colorBorder: string;
  gradientBadge: string;
  description: string;
  points: string[];
  fullContent: string;
}

const values: ValueDetail[] = [
  {
    id: 'peran-hidup',
    title: 'Peran Hidup Manusia',
    subtitle: 'Abdullah & Khalifah Fil Ardhi',
    icon: <BookOpen size={32} />,
    badge: '🌟 Hamba & Pemimpin',
    colorBg: 'bg-gradient-to-br from-emerald-50 via-teal-50/50 to-emerald-100/40 hover:from-emerald-100 hover:to-teal-100/80',
    colorText: 'text-emerald-800',
    colorBorder: 'border-emerald-200/80',
    gradientBadge: 'from-emerald-600 to-teal-600',
    description: 'Landasan kurikulum disusun untuk mewujudkan manusia sesuai tujuan penciptaan dan peran hidup mulia di dunia ini.',
    points: [
      'Membentuk generasi berkepribadian Islam (shaleh & shalehah).',
      'Membekali penguasaan Tsaqofah Islam (generasi Faqih fiddin).',
      'Membekali penguasaan Ilmu Kehidupan (IPTEK & Keterampilan).'
    ],
    fullContent: 'Kurikulum SD IT Andalas Cendekia berlandaskan dua peran hidup utama manusia: sebagai Abdullah (hamba Allah) dan Khalifah Fil Ardhi (pemimpin di bumi). Pendidikan diintegrasikan untuk melahirkan generasi yang bertakwa sekaligus terampil menguasai ilmu kehidupan era modern.'
  },
  {
    id: 'multiple-intelligences',
    title: 'Multiple Intelligences',
    subtitle: 'Ragam Kecerdasan Unik (SLIM EN BIL)',
    icon: <Globe size={32} />,
    badge: '🚀 9 Potensi Bintang',
    colorBg: 'bg-gradient-to-br from-amber-50 via-orange-50/50 to-amber-100/40 hover:from-amber-100 hover:to-orange-100/80',
    colorText: 'text-amber-800',
    colorBorder: 'border-amber-200/80',
    gradientBadge: 'from-amber-500 to-orange-500',
    description: 'Berdasarkan penemuan Prof. Howard Gardner (Harvard & Boston Univ.), setiap anak unik dan memiliki keunggulan bintang.',
    points: [
      'Menstimulasi 9 kecerdasan (SLIM EN BIL) sejak usia dini.',
      'Peminatan ekstrakurikuler disesuaikan minat & bakat siswa.',
      'Setiap siswa difasilitasi menjadi bintang bersinar sesuai potensinya.'
    ],
    fullContent: 'SLIM EN BIL melingkupi 9 ragam kecerdasan: Spasial-Visual, Linguistik/Verbal, Interpersonal, Musikal, Eksistensial, Naturalis, Bodily/Kinestetis, Intrapersonal, dan Logis Matematis. Pembelajaran dan peminatan di SD IT Andalas Cendekia disesuaikan agar setiap anak menemukan keunggulan uniknya.'
  },
  {
    id: 'program-unggulan',
    title: 'Program Unggulan Khas',
    subtitle: 'PRISE, Bi-SQ (3HA) & Festival FeSTa',
    icon: <Cpu size={32} />,
    badge: '🏆 Karakter Al-Qur’an',
    colorBg: 'bg-gradient-to-br from-sky-50 via-indigo-50/50 to-blue-100/40 hover:from-sky-100 hover:to-indigo-100/80',
    colorText: 'text-blue-800',
    colorBorder: 'border-blue-200/80',
    gradientBadge: 'from-blue-600 to-indigo-600',
    description: 'Program khas yang memadukan Kurikulum Nasional, Muatan Lokal, dan Pembinaan Karakter Al-Qur’an terpadu.',
    points: [
      'PRISE: Little Star (Kelas 1-3) & Peminatan 9 Cabang (Kelas 4-6).',
      'Bi-SQ: Internalisasi 24 Karakter Al-Qur’an dengan Metode 3HA.',
      'FeSTa: Festival Sang Bintang untuk unjuk karya & penganugerahan.'
    ],
    fullContent: 'Metode 3HA (HAfalkan, HAyati, HAbituasi) diterapkan pada materi pembentukan karakter Al-Qur’an. Didukung oleh Diklat Singkat Polisi Cilik untuk menegakkan kedisiplinan serta perayaan tahunan Festival Sang Bintang (FeSTa) sebagai ajang apresiasi karya siswa.'
  }
];

export default function CoreValues() {
  const [selectedPillar, setSelectedPillar] = useState<ValueDetail | null>(null);

  const values7 = [
    { title: '1. Basmalah', desc: 'Memulai setiap sesuatu dengan basmalah' },
    { title: '2. Syukur', desc: 'Senantiasa bersyukur atas nikmat Allah' },
    { title: '3. Berpikir Positif', desc: 'Husnudzon & optimis dalam bertindak' },
    { title: '4. Cita-Cita Tinggi', desc: 'Memiliki visi & ambisi kebaikan tinggi' },
    { title: '5. Ibadah & Doa', desc: 'Tekun beribadah dan berdoa' },
    { title: '6. Sungguh-Sungguh', desc: 'Man jadda wajada dalam bekerja' },
    { title: '7. Kaizen (Perbaikan)', desc: 'Perbaikan berkelanjutan setiap hari' }
  ];

  return (
    <section className="py-24 bubbly-bg relative overflow-hidden">
      {/* Decorative Blob Shapes */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-amber-200/30 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-200/30 rounded-full blur-3xl -z-10 pointer-events-none" />

      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 text-emerald-800 bg-emerald-100/90 border border-emerald-300 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider mb-4 shadow-sm">
            <Sparkles size={14} className="text-amber-500 animate-spin" style={{ animationDuration: '6s' }} />
            <span>Blue Print Pendidikan SDIT AC</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-3 tracking-tight leading-tight">
            Terwujudnya Sekolah Unggul <span className="gradient-text-cheerful">Berkarakter Al-Qur’an</span>
          </h2>
          <p className="text-amber-600 font-extrabold text-sm sm:text-base mb-4 flex items-center justify-center gap-1.5">
            <Star size={16} className="fill-amber-500 text-amber-500" />
            <span>Belief Sekolah: "Cerdas Penuh Ketaqwaan"</span>
            <Star size={16} className="fill-amber-500 text-amber-500" />
          </p>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
            Mengoptimalkan keunikan potensi <strong>Multiple Intelligences (SLIM EN BIL)</strong>, Program <strong>Rising Star (PRISE)</strong>, dan <strong>Bina Siswa Qur’ani (Bi-SQ)</strong> dengan metode 3HA.
          </p>
        </div>

        {/* 7 Values Grid Strip */}
        <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 text-white rounded-3xl p-6 sm:p-8 mb-16 shadow-xl border border-emerald-800">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6 border-b border-emerald-800/80 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500 text-amber-950 flex items-center justify-center font-black">
                <Heart size={20} fill="currentColor" />
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-white">7 Value SDIT Andalas Cendekia</h3>
                <p className="text-xs text-amber-300">Nilai-nilai kepribadian utama yang ditanamkan dalam keseharian siswa.</p>
              </div>
            </div>
            <span className="text-[11px] font-extrabold text-emerald-200 bg-emerald-900/80 px-3 py-1 rounded-full border border-emerald-700">
              QS. Ali Imran: 110
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
            {values7.map((v, i) => (
              <div key={i} className="bg-emerald-900/50 hover:bg-emerald-800/80 p-3.5 rounded-2xl border border-emerald-700/60 transition-all duration-300 text-center">
                <span className="font-black text-amber-400 text-xs block mb-1">{v.title}</span>
                <span className="text-[11px] text-emerald-100/90 leading-tight block">{v.desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 3 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {values.map((pillar) => (
            <div 
              key={pillar.id}
              className={`p-8 rounded-3xl border ${pillar.colorBorder} ${pillar.colorBg} transition-all duration-500 card-hover-pop shadow-md hover:shadow-2xl flex flex-col justify-between relative overflow-hidden group`}
            >
              {/* Badge top right */}
              <div className="absolute top-5 right-5">
                <span className={`text-[11px] font-black text-white px-3 py-1 rounded-full bg-gradient-to-r ${pillar.gradientBadge} shadow-md`}>
                  {pillar.badge}
                </span>
              </div>

              <div>
                <div className={`w-16 h-16 rounded-2xl bg-white shadow-lg flex items-center justify-center mb-6 ${pillar.colorText} group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 ring-4 ring-white/60`}>
                  {pillar.icon}
                </div>
                <h3 className="text-2xl font-black text-slate-800 mb-1.5">{pillar.title}</h3>
                <p className="text-xs font-bold text-slate-500 mb-4 uppercase tracking-wider">{pillar.subtitle}</p>
                <p className="text-slate-600 text-sm leading-relaxed mb-6 font-medium">
                  {pillar.description}
                </p>

                <ul className="space-y-3 mb-8">
                  {pillar.points.map((pt, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-xs font-medium text-slate-700">
                      <CheckCircle2 size={18} className={`shrink-0 mt-0.5 ${pillar.colorText}`} />
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => setSelectedPillar(pillar)}
                className={`inline-flex items-center gap-2 font-black text-sm ${pillar.colorText} hover:translate-x-1 transition-transform mt-auto pt-4 border-t border-slate-200/60`}
              >
                <span>Pelajari Selengkapnya</span> 
                <ArrowRight size={18} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Pillar Detail Modal */}
      {selectedPillar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-8 shadow-2xl relative border border-slate-100 overflow-hidden">
            <button 
              onClick={() => setSelectedPillar(null)}
              className="absolute top-6 right-6 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors"
            >
              <X size={20} />
            </button>

            <div className={`w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-5 ${selectedPillar.colorText}`}>
              {selectedPillar.icon}
            </div>

            <span className={`inline-block text-xs font-bold text-white px-3.5 py-1 rounded-full bg-gradient-to-r ${selectedPillar.gradientBadge} mb-3`}>
              {selectedPillar.badge}
            </span>

            <h3 className="text-2xl font-black text-slate-900 mb-1">{selectedPillar.title}</h3>
            <p className="text-sm font-bold text-slate-500 mb-6">{selectedPillar.subtitle}</p>

            <div className="prose prose-slate text-sm leading-relaxed mb-6">
              <p className="text-slate-700 font-medium mb-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">{selectedPillar.fullContent}</p>
              <h4 className="font-extrabold text-slate-800 mb-3 flex items-center gap-2">
                <Award size={18} className="text-amber-500" /> Target & Keunggulan Pembelajaran:
              </h4>
              <ul className="space-y-2.5">
                {selectedPillar.points.map((pt, i) => (
                  <li key={i} className="flex items-center gap-2.5 text-slate-700 font-medium">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0"></span>
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-4 border-t flex justify-end">
              <button
                onClick={() => setSelectedPillar(null)}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-sm px-6 py-3 rounded-full shadow-lg shadow-emerald-600/20 transition-all"
              >
                Tutup Jendela
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
