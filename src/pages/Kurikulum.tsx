import React, { useState, useEffect } from 'react';
import { BookOpen, CheckCircle2, Award, Sparkles, Star, Users, ShieldCheck, Heart, Laptop, Compass, Feather, Utensils, Globe, Music, Smile, Camera, Shield, Layers, Calendar, ChevronRight } from 'lucide-react';
import { getSiteCurriculum, CurriculumTahfidzItem } from '@/lib/storage';

export default function Kurikulum() {
  const [curriculumData, setCurriculumData] = useState<CurriculumTahfidzItem[]>([]);
  const [activeBiSqTab, setActiveBiSqTab] = useState<'metode' | 'fase' | 'karakter' | 'polisicilik'>('metode');

  const loadData = () => {
    setCurriculumData(getSiteCurriculum());
  };

  useEffect(() => {
    loadData();
    window.addEventListener('sdit_data_synced', loadData);
    return () => {
      window.removeEventListener('sdit_data_synced', loadData);
    };
  }, []);

  const priseList = [
    { code: '01', title: 'Little Star', level: 'Kelas 1 – 3', desc: 'Dasar-dasar kompetensi seluruh ekstrakurikuler berbasis Multiple Intelligences untuk menstimulasi potensi kecerdasan siswa.', icon: <Star className="text-amber-500" size={24} />, bg: 'bg-amber-50 border-amber-200' },
    { code: '02', title: 'Tekno Kids', level: 'Kelas 4 – 6', desc: 'Penguasaan dasar-dasar aplikasi komputer Microsoft Office dan dasar-dasar Robotic.', icon: <Laptop className="text-blue-600" size={24} />, bg: 'bg-blue-50 border-blue-200' },
    { code: '03', title: 'Bintang Komunikasi (BiKom)', level: 'Kelas 4 – 6', desc: 'Penguasaan dasar-dasar public speaking, keberanian tampil, dan kompetensi menjadi da’i cilik.', icon: <Sparkles className="text-purple-600" size={24} />, bg: 'bg-purple-50 border-purple-200' },
    { code: '04', title: 'Kreasi Ceria', level: 'Kelas 4 – 6', desc: 'Dasar-dasar seni kaligrafi Islami, dasar fotografi, dan kreativitas desain grafis menggunakan Canva.', icon: <Camera className="text-rose-600" size={24} />, bg: 'bg-rose-50 border-rose-200' },
    { code: '05', title: 'Nada Islami', level: 'Kelas 4 – 6', desc: 'Penguasaan seni nasyid Islami dan keindahan langgam bacaan Al-Qur’an (Tartil & Tilawah).', icon: <Music className="text-emerald-600" size={24} />, bg: 'bg-emerald-50 border-emerald-200' },
    { code: '06', title: 'Atlet Cilik', level: 'Kelas 4 – 6', desc: 'Penguasaan ketangkasan dan olahraga pilihan: Karate, Taekwondo, dan Sepak Bola.', icon: <Shield className="text-indigo-600" size={24} />, bg: 'bg-indigo-50 border-indigo-200' },
    { code: '07', title: 'Sahabat Bumi', level: 'Kelas 4 – 6', desc: 'Dasar-dasar kepedulian terhadap lingkungan hidup, penghijauan, dan pemanfaatan daur ulang sampah.', icon: <Compass className="text-teal-600" size={24} />, bg: 'bg-teal-50 border-teal-200' },
    { code: '08', title: 'Chef Cilik', level: 'Kelas 4 – 6', desc: 'Dasar-dasar penguasaan memasak, penyajian makanan sehat, dan tata cara kuliner adab Islam.', icon: <Utensils className="text-orange-600" size={24} />, bg: 'bg-orange-50 border-orange-200' },
    { code: '09', title: 'Penulis Cilik', level: 'Kelas 4 – 6', desc: 'Dasar-dasar penguasaan pembacaan dan penulisan karya sastra: puisi, pantun, cerpen, dll.', icon: <Feather className="text-cyan-600" size={24} />, bg: 'bg-cyan-50 border-cyan-200' },
  ];

  const bisqIndicators = [
    'Adab memulai & mengakhiri aktivitas',
    'Adab di kamar mandi',
    'Adab makan dan minum',
    'Adab berpakaian',
    'Mengucapkan salam',
    'Adab terhadap guru',
    'Rapi dan bersih',
    'Adab berada di masjid',
    'Berbuat baik / berbakti kepada orang tua',
    'Adab terhadap diri sendiri',
    'Adab malu',
    'Adab berteman',
    'Adab terhadap lawan jenis',
    'Bertanggung jawab',
    'Adab terhadap Al-Qur’an',
    'Disiplin',
    'Adab terhadap ilmu',
    'Adab sholat',
    'Sikap mandiri',
    'Visioner',
    'Peduli terhadap sesama',
    'Adab berbicara',
    'Bersungguh-sungguh',
    'Berdzikir kepada Allah dalam setiap keadaan'
  ];

  const indikatorUnggul = [
    'Mencapai nilai di atas KKM;',
    'Menjadi bintang (juara) pada bidang yang sesuai minat dan bakatnya;',
    'Mampu membaca Al-Qur\'an sesuai kaidah yang benar;',
    'Memiliki hafalan Al-Qur\'an minimal 2 juz;',
    'Hafal hadits (minimal 20 hadits) dan do\'a sehari-hari;',
    'Terampil mengoperasikan aplikasi komputer dan internet.'
  ];

  const indikatorKarakter = [
    'Memiliki aqidah yang lurus berdasarkan pemahaman ahlus sunnah wal jama’ah;',
    'Rajin beribadah sesuai dengan tuntunan Islam;',
    'Menerapkan adab dan akhlak Islami dalam kesaharian;',
    'Berbakti kepada kedua orang tua;',
    'Menghormati guru dan ilmu.'
  ];

  const multipleIntelligences = [
    { letter: 'S', name: 'Spasial-Visual', desc: 'Kepekaan warna, garis, bentuk, ruang, & visualiasi.' },
    { letter: 'L', name: 'Linguistik / Verbal', desc: 'Kemampuan olah kata, membaca, menulis, & kebahasaan.' },
    { letter: 'I', name: 'Interpersonal', desc: 'Kemampuan berinteraksi, kepekaan sosial, & empati.' },
    { letter: 'M', name: 'Musikal', desc: 'Kepekaan ritme, irama, nada, & seni suara.' },
    { letter: 'E', name: 'Eksistensial', desc: 'Kepekaan filosofis, spiritual, & hakikat kehidupan.' },
    { letter: 'N', name: 'Naturalis', desc: 'Kepekaan terhadap alam, flora, fauna, & lingkungan.' },
    { letter: 'B', name: 'Bodily / Kinestetis', desc: 'Keterampilan gerak tubuh, ketangkasan fisik, & olahraga.' },
    { letter: 'I', name: 'Intrapersonal', desc: 'Pemahaman diri, refleksi mental, & kontrol emosi.' },
    { letter: 'L', name: 'Logis Matematis', desc: 'Penalaran angka, logika sains, & pemecahan masalah.' },
  ];

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Header Banner */}
      <div className="bg-emerald-950 py-16 sm:py-20 text-center text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 opacity-90"></div>
        <div className="container mx-auto px-4 relative z-10 max-w-4xl">
          <span className="inline-block bg-amber-500 text-amber-950 px-4 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider mb-4 shadow">
            Kurikulum Khas SD IT Andalas Cendekia
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold mb-3">Unggul Berkarakter Al-Qur’an</h1>
          <p className="text-amber-300 font-semibold text-lg italic mb-2">"Integrasi Kurikulum Kemendikbud, Muatan Lokal, PRISE & Bi-SQ"</p>
          <p className="text-emerald-200 text-sm max-w-2xl mx-auto">
            Membimbing setiap anak menemukan potensi uniknya (Multiple Intelligences) dan membentuk kepribadian Islami yang bersinar dengan Al-Qur'an.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 max-w-6xl space-y-16">

        {/* Section 1: Filosofi & Landasan Kurikulum */}
        <section className="bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-slate-200/80">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <span className="text-emerald-700 bg-emerald-100 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3 inline-block">
              Filosofi & Landasan
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 mb-3">Landasan Kurikulum & Peran Hidup Manusia</h2>
            <p className="text-slate-600 text-sm">
              Kurikulum SD IT Andalas Cendekia disusun untuk mewujudkan manusia sebagaimana tujuan penciptaan dan peran hidupnya di dunia ini, serta mengembangkan manusia sesuai dengan potensi unik yang ada dalam dirinya.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
            {/* Peran 1: Abdullah */}
            <div className="bg-gradient-to-br from-emerald-900 to-emerald-950 text-white p-8 rounded-3xl shadow-md border border-emerald-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="w-10 h-10 rounded-2xl bg-amber-500 text-amber-950 font-black text-lg flex items-center justify-center">1</span>
                  <span className="text-xs font-bold uppercase tracking-wider bg-emerald-800 text-amber-300 px-3 py-1 rounded-full border border-amber-400/30">Hamba Allah</span>
                </div>
                <h3 className="text-2xl font-extrabold text-white mb-2">1. Abdullah</h3>
                <p className="text-emerald-200 text-xs mb-6">Mewujudkan ketaatan dan penghambaan diri secara penuh hanya kepada Allah SWT.</p>
                <div className="space-y-3 text-xs">
                  <div className="flex items-start gap-2.5 bg-emerald-900/80 p-3 rounded-xl border border-emerald-700/60">
                    <CheckCircle2 size={16} className="text-amber-400 shrink-0 mt-0.5" />
                    <span>Membentuk generasi yang berkepribadian Islam (shaleh dan shalehah).</span>
                  </div>
                  <div className="flex items-start gap-2.5 bg-emerald-900/80 p-3 rounded-xl border border-emerald-700/60">
                    <CheckCircle2 size={16} className="text-amber-400 shrink-0 mt-0.5" />
                    <span>Membekali penguasaan Tsaqofah Islam (generasi yang <em>Faqih fiddin</em>).</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Peran 2: Khalifah Fil Ardhi */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white p-8 rounded-3xl shadow-md border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="w-10 h-10 rounded-2xl bg-amber-500 text-amber-950 font-black text-lg flex items-center justify-center">2</span>
                  <span className="text-xs font-bold uppercase tracking-wider bg-slate-800 text-amber-300 px-3 py-1 rounded-full border border-amber-400/30">Pemimpin di Bumi</span>
                </div>
                <h3 className="text-2xl font-extrabold text-white mb-2">2. Khalifah Fil Ardhi</h3>
                <p className="text-slate-300 text-xs mb-6">Membekali keterampilan memakmurkan bumi dan menguasai iptek kehidupan.</p>
                <div className="space-y-3 text-xs">
                  <div className="flex items-start gap-2.5 bg-slate-900/80 p-3 rounded-xl border border-slate-700/60">
                    <CheckCircle2 size={16} className="text-amber-400 shrink-0 mt-0.5" />
                    <span>Membekali penguasaan Ilmu Kehidupan (IPTEK dan Keterampilan era modern).</span>
                  </div>
                  <div className="flex items-start gap-2.5 bg-slate-900/80 p-3 rounded-xl border border-slate-700/60">
                    <CheckCircle2 size={16} className="text-amber-400 shrink-0 mt-0.5" />
                    <span>Menstimulasi potensi unik sesuai bakat & Multiple Intelligences anak.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Multiple Intelligences (SLIM EN BIL) */}
        <section className="bg-gradient-to-br from-emerald-900 via-emerald-950 to-slate-950 text-white rounded-3xl p-8 sm:p-12 shadow-xl border border-emerald-800">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <span className="text-amber-400 bg-amber-400/10 border border-amber-400/30 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3 inline-block">
              Prof. Howard Gardner (Harvard University)
            </span>
            <h2 className="text-3xl font-extrabold text-white mb-3">Potensi Manusia: Multiple Intelligences</h2>
            <p className="text-emerald-200 text-sm">
              Setiap anak adalah unik! Kami menyadari dan memfasilitasi 9 ragam kecerdasan manusia (SLIM EN BIL) untuk melejitkan potensi setiap siswa hingga menjadi bintang bersinar dengan Al-Qur'an.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {multipleIntelligences.map((item, idx) => (
              <div key={idx} className="bg-emerald-900/40 backdrop-blur-md p-4 rounded-2xl border border-emerald-700/50 hover:border-amber-400/60 transition-all duration-300 flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-amber-500 text-amber-950 font-black text-lg flex items-center justify-center shrink-0 shadow">
                  {item.letter}
                </span>
                <div>
                  <h4 className="font-bold text-white text-sm">{item.name}</h4>
                  <p className="text-[11px] text-emerald-200 leading-tight">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 3: Struktur & Muatan Kurikulum */}
        <section className="bg-white rounded-3xl p-8 sm:p-10 shadow-sm border border-slate-200/80">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <span className="text-emerald-700 bg-emerald-100 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3 inline-block">
              Struktur Kurikulum Khas
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 mb-3">Struktur & Muatan Kurikulum Blueprint</h2>
            <p className="text-slate-600 text-sm">Kurikulum khas SDIT ANDALAS CENDEKIA 02 dirancang berbasis prinsip Islam dengan memadukan 3 komponen utama.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="bg-emerald-50/80 p-6 rounded-3xl border border-emerald-200">
              <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold mb-3 shadow">
                1
              </div>
              <h3 className="font-extrabold text-slate-900 text-base mb-2">Muatan Tsaqafah Islam</h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-3">
                Dasar & Inti Keislaman: Bahasa Arab (Nahwu, Sharaf, Retorika), Aqidah Islam, Al-Qur'an, Hadits, Fiqih, Sunnah Nabi, Tafsir & Sirah.
              </p>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full inline-block">
                Hafalan Min. 2 Juz (Juz 30 & 1)
              </span>
            </div>

            <div className="bg-blue-50/80 p-6 rounded-3xl border border-blue-200">
              <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold mb-3 shadow">
                2
              </div>
              <h3 className="font-extrabold text-slate-900 text-base mb-2">Sains, Teknologi & IPTEK</h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-3">
                Ilmu Kehidupan Modern: Matematika, IPA, IPS, Bahasa Indonesia, Bahasa Inggris, TIK / Aplikasi Komputer, & Mentoring.
              </p>
              <span className="text-[11px] font-bold text-blue-700 bg-blue-100 px-2.5 py-1 rounded-full inline-block">
                Penguasaan TIK & Literasi
              </span>
            </div>

            <div className="bg-amber-50/80 p-6 rounded-3xl border border-amber-200">
              <div className="w-10 h-10 rounded-2xl bg-amber-500 text-amber-950 flex items-center justify-center font-bold mb-3 shadow">
                3
              </div>
              <h3 className="font-extrabold text-slate-900 text-base mb-2">Pembentukan Kepribadian Islam</h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-3">
                Internalisasi Karakter & Budaya Sekolah: Bi-SQ (3HA), Ekstrakurikuler PRISE (9 Cabang), Diklat Polisi Cilik, & 5S.
              </p>
              <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2.5 py-1 rounded-full inline-block">
                Integrasi Sekolah, Pesantren & Masjid
              </span>
            </div>
          </div>

          {/* 5 Metode Pengembangan Kurikulum */}
          <div className="bg-slate-50 p-6 sm:p-8 rounded-3xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Layers className="text-emerald-600" size={20} />
              <span>5 Metode Pengembangan Kurikulum (Blueprint SDIT AC)</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
              <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-sm">
                <span className="font-bold text-emerald-800 block mb-1">1. Reduksi</span>
                <span className="text-slate-600">Mengurangi materi yang kurang relevan.</span>
              </div>
              <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-sm">
                <span className="font-bold text-blue-800 block mb-1">2. Adisi</span>
                <span className="text-slate-600">Menambahkan muatan Tsaqofah Islam & IPTEK.</span>
              </div>
              <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-sm">
                <span className="font-bold text-amber-800 block mb-1">3. Koreksi</span>
                <span className="text-slate-600">Mengoreksi materi bertentangan syariat.</span>
              </div>
              <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-sm">
                <span className="font-bold text-purple-800 block mb-1">4. Substitusi</span>
                <span className="text-slate-600">Mengganti narasi dengan nilai-nilai Islami.</span>
              </div>
              <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-sm">
                <span className="font-bold text-rose-800 block mb-1">5. Internalisasi</span>
                <span className="text-slate-600">Menanamkan aqidah & adab setiap KBM.</span>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Program Unggulan PRISE (9 Cabang Ekskul) */}
        <section className="bg-white rounded-3xl p-8 sm:p-10 shadow-sm border border-slate-200/80">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <span className="text-amber-600 bg-amber-100 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3 inline-block">
              Program Unggulan 1
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 mb-3">Program Rising Star Andalas Cendekia (PRISE)</h2>
            <p className="text-slate-600 text-sm">
              Ekstrakurikuler wajib berdasarkan minat dan bakat setiap siswa. Target program ini adalah siswa menjadi bintang berdasarkan potensinya masing-masing.
            </p>
          </div>

          {/* 2 Tahapan PRISE */}
          <div className="grid md:grid-cols-2 gap-6 mb-10">
            <div className="p-6 rounded-2xl bg-amber-50 border-2 border-amber-200 flex items-start gap-4">
              <span className="w-12 h-12 rounded-2xl bg-amber-500 text-amber-950 font-black text-xl flex items-center justify-center shrink-0">
                1
              </span>
              <div>
                <h3 className="text-lg font-bold text-amber-900 mb-1">Tahap Little Star (Kelas 1 – 3)</h3>
                <p className="text-xs text-slate-700 leading-relaxed">
                  Siswa kelas 1–3 mengikuti ekstrakurikuler Little Star yang berisi dasar-dasar kompetensi seluruh ekstrakurikuler berbasis Multiple Intelligences untuk menstimulasi potensi kecerdasan.
                </p>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-emerald-50 border-2 border-emerald-200 flex items-start gap-4">
              <span className="w-12 h-12 rounded-2xl bg-emerald-600 text-white font-black text-xl flex items-center justify-center shrink-0">
                2
              </span>
              <div>
                <h3 className="text-lg font-bold text-emerald-900 mb-1">Tahap Peminatan (Kelas 4 – 6)</h3>
                <p className="text-xs text-slate-700 leading-relaxed">
                  Siswa kelas 4–6 diarahkan memilih ekstrakurikuler peminatan berdasarkan Multiple Intelligences dan minat bakat siswa yang menonjol.
                </p>
              </div>
            </div>
          </div>

          {/* Grid 9 Cabang PRISE */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {priseList.map((item) => (
              <div key={item.code} className={`p-6 rounded-2xl border ${item.bg} hover:shadow-md transition-all duration-300 flex flex-col justify-between`}>
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-mono font-bold text-slate-400">{item.code}</span>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-white text-slate-700 border border-slate-200">{item.level}</span>
                  </div>
                  <div className="flex items-center gap-2.5 mb-2">
                    {item.icon}
                    <h4 className="font-bold text-slate-900 text-base">{item.title}</h4>
                  </div>
                  <p className="text-slate-600 text-xs leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 5: Program Unggulan Bi-SQ (Bina Siswa Qur'ani) */}
        <section className="bg-white rounded-3xl p-8 sm:p-10 shadow-sm border border-slate-200/80">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <span className="text-emerald-700 bg-emerald-100 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3 inline-block">
              Program Unggulan 2
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 mb-3">Bina Siswa Qur’ani (Bi-SQ)</h2>
            <p className="text-slate-600 text-sm">
              Kegiatan pembentukan kepribadian siswa berkarakter Al-Qur’an yang dilakukan setiap hari (Senin s.d Jum’at) melalui metode 3HA.
            </p>
          </div>

          {/* Bi-SQ Tabs */}
          <div className="flex flex-wrap justify-center gap-2 mb-8 border-b pb-4">
            <button
              onClick={() => setActiveBiSqTab('metode')}
              className={`px-5 py-2.5 rounded-full text-xs font-bold transition-colors ${
                activeBiSqTab === 'metode' ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              1. Metode 3HA (Urutan)
            </button>
            <button
              onClick={() => setActiveBiSqTab('fase')}
              className={`px-5 py-2.5 rounded-full text-xs font-bold transition-colors ${
                activeBiSqTab === 'fase' ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              2. 3 Fase Pelaksanaan
            </button>
            <button
              onClick={() => setActiveBiSqTab('karakter')}
              className={`px-5 py-2.5 rounded-full text-xs font-bold transition-colors ${
                activeBiSqTab === 'karakter' ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              3. 24 Indikator Karakter
            </button>
            <button
              onClick={() => setActiveBiSqTab('polisicilik')}
              className={`px-5 py-2.5 rounded-full text-xs font-bold transition-colors ${
                activeBiSqTab === 'polisicilik' ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              4. Polisi Cilik & Afirmasi
            </button>
          </div>

          {/* Tab 1: Metode 3HA */}
          {activeBiSqTab === 'metode' && (
            <div className="grid md:grid-cols-3 gap-6 animate-fadeIn">
              <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-2xl">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-black text-lg flex items-center justify-center mb-3">1</div>
                <h4 className="font-bold text-emerald-900 text-base mb-2">1. HAfalkan</h4>
                <p className="text-xs text-slate-700 leading-relaxed">
                  Guru melafalkan dalil atau do’a yang berkaitan dengan karakter yang akan dibentuk sebanyak 3 – 5 kali, siswa mendengarkan dan mengulangi.
                </p>
              </div>

              <div className="bg-amber-50 border border-amber-200 p-6 rounded-2xl">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-amber-950 font-black text-lg flex items-center justify-center mb-3">2</div>
                <h4 className="font-bold text-amber-900 text-base mb-2">2. HAyati</h4>
                <p className="text-xs text-slate-700 leading-relaxed">
                  Guru memberikan kisah atau contoh nyata berkaitan dengan implementasi dalil dan karakter, serta penugasan relevan target pemahaman siswa.
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 p-6 rounded-2xl">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-black text-lg flex items-center justify-center mb-3">3</div>
                <h4 className="font-bold text-blue-900 text-base mb-2">3. HAbituasi</h4>
                <p className="text-xs text-slate-700 leading-relaxed">
                  Guru memberikan daftar pembiasaan siswa di sekolah maupun rumah, dikontrol harian melalui Buku Jurnal Controlling Siswa.
                </p>
              </div>
            </div>
          )}

          {/* Tab 2: 3 Fase */}
          {activeBiSqTab === 'fase' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-4">
                <span className="px-3 py-1 bg-emerald-600 text-white font-bold text-xs rounded-full shrink-0">Bulan 1</span>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">Fase 1: Pondasi</h4>
                  <p className="text-xs text-slate-600">Pondasi (3HA), controlling dilakukan dengan mengedepankan pendekatan yang motivatif dan komitmen. (Hafalkan dalil 1, Hayati, Habituasi).</p>
                </div>
              </div>
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-4">
                <span className="px-3 py-1 bg-amber-500 text-amber-950 font-bold text-xs rounded-full shrink-0">Bulan 2</span>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">Fase 2: Pembentukan</h4>
                  <p className="text-xs text-slate-600">Pembentukan (3HA dan controlling). (Hafalkan dalil 2, dan pengulangan dalil 1, Hayati, Habituasi).</p>
                </div>
              </div>
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-4">
                <span className="px-3 py-1 bg-blue-600 text-white font-bold text-xs rounded-full shrink-0">Bulan 3</span>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">Fase 3: Pematangan & Dakwahkan</h4>
                  <p className="text-xs text-slate-600">Pematangan (3HA, controlling, dan mendakwahkan / saling mengingatkan yang lain). (Hafalkan dalil 3, pengulangan dalil 1 & 2, Hayati, Habituasi, dan Dakwahkan).</p>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: 24 Indikator Karakter */}
          {activeBiSqTab === 'karakter' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 animate-fadeIn">
              {bisqIndicators.map((karakter, idx) => (
                <div key={idx} className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <span>{karakter}</span>
                </div>
              ))}
            </div>
          )}

          {/* Tab 4: Polisi Cilik */}
          {activeBiSqTab === 'polisicilik' && (
            <div className="bg-gradient-to-r from-emerald-900 to-emerald-950 text-white p-6 sm:p-8 rounded-2xl border border-emerald-800 animate-fadeIn space-y-4">
              <div className="flex items-center gap-3">
                <ShieldCheck className="text-amber-400" size={28} />
                <h4 className="text-xl font-bold text-white">Diklat Singkat Polisi Cilik & Poster Afirmasi</h4>
              </div>
              <p className="text-xs text-emerald-100 leading-relaxed">
                Untuk menguatkan penerapan kedisiplinan dan peraturan di kalangan siswa, dibentuklah program <strong className="text-amber-300">"Diklat Singkat Polisi Cilik"</strong> untuk melahirkan kader penegak disiplin dari kalangan siswa di bawah tanggung jawab Waka Kesiswaan & supervisi Koordinator Level.
              </p>
              <p className="text-xs text-emerald-200 leading-relaxed">
                Selain itu, untuk mewujudkan lingkungan yang kondusif dengan budaya Al-Qur'an, dipasang <strong>poster afirmasi positif</strong> hafalan dalil di seluruh penjuru kampus sekolah.
              </p>
            </div>
          )}
        </section>

        {/* Section 6: Festival Sang Bintang (FeSTa) */}
        <section className="bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 text-amber-950 rounded-3xl p-8 sm:p-12 shadow-xl relative overflow-hidden">
          <div className="max-w-3xl">
            <span className="bg-amber-950 text-amber-300 px-3.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider mb-4 inline-block shadow">
              Ajang Puncak Tahunan
            </span>
            <h2 className="text-3xl sm:text-4xl font-black mb-4">Festival Sang Bintang (FeSTa)</h2>
            <p className="text-sm font-semibold mb-6 leading-relaxed text-amber-950">
              Kegiatan untuk mengasah dan men-<em>trigger</em> kemampuan seluruh siswa yang dikemas dengan kompetisi minat bakat, pameran hasil karya, dan penganugerahan (award).
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold">
              <div className="bg-amber-400/80 p-4 rounded-xl border border-amber-300/60">
                📅 Pelaksanaan: Bulan ke-9, 10, atau 11 pada setiap tahun ajaran.
              </div>
              <div className="bg-amber-400/80 p-4 rounded-xl border border-amber-300/60">
                🏆 Penganugerahan: Award siswa terbaik akademik, karakter & tahfizh.
              </div>
            </div>
          </div>
        </section>

        {/* Section 7: Indikator Profil Lulusan */}
        <section className="bg-white rounded-3xl p-8 sm:p-10 shadow-sm border border-slate-200/80">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <span className="text-emerald-700 bg-emerald-100 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3 inline-block">
              Target Output Lulusan
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 mb-3">Profil Lulusan SD IT Andalas Cendekia</h2>
            <p className="text-slate-600 text-sm">Standar ketercapaian siswa lulusan SD IT Andalas Cendekia.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Indikator Unggul */}
            <div className="bg-blue-50/70 border border-blue-200 p-6 sm:p-8 rounded-2xl">
              <h3 className="text-xl font-bold text-blue-900 mb-4 flex items-center gap-2 border-b border-blue-200 pb-3">
                <Award className="text-blue-600" size={24} />
                Indikator Unggul (6 Poin)
              </h3>
              <ul className="space-y-3">
                {indikatorUnggul.map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs text-slate-700">
                    <CheckCircle2 size={16} className="text-blue-600 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Indikator Berkarakter Al-Qur'an */}
            <div className="bg-emerald-50/70 border border-emerald-200 p-6 sm:p-8 rounded-2xl">
              <h3 className="text-xl font-bold text-emerald-900 mb-4 flex items-center gap-2 border-b border-emerald-200 pb-3">
                <BookOpen className="text-emerald-600" size={24} />
                Indikator Berkarakter Al-Qur’an (5 Poin)
              </h3>
              <ul className="space-y-3">
                {indikatorKarakter.map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs text-slate-700">
                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
