import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Users, 
  CheckCircle2, 
  Quote, 
  FileText, 
  Landmark, 
  Mail, 
  Phone, 
  MapPin, 
  Sparkles, 
  Target
} from 'lucide-react';
import { getSiteSettings, getSiteTeachers, extractMapEmbedUrl, SiteSettings, TeacherItem } from '@/lib/storage';

export default function Profil() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [teacherList, setTeacherList] = useState<TeacherItem[]>([]);

  const loadData = () => {
    setSettings(getSiteSettings());
    const teachers = getSiteTeachers();
    setTeacherList(Array.isArray(teachers) ? teachers : []);
  };

  useEffect(() => {
    loadData();
    window.addEventListener('sdit_data_synced', loadData);
    return () => {
      window.removeEventListener('sdit_data_synced', loadData);
    };
  }, []);

  const schoolName = settings?.schoolName || 'SDIT ANDALAS CENDEKIA';
  const npsn = settings?.npsn || '10310802';
  const tagline = settings?.tagline || 'Sekolah Generasi Pemimpin Qur’ani';
  const address = settings?.address || 'JL. Kampung Baru No.36, RT 00/RW 00, Kel. Sikabau, Kec. Pulau Punjung, Kab. Dharmasraya, Prov. Sumatera Barat 27573';
  const phone = settings?.phone || '0812-6655-8123';
  const email = settings?.email || 'sditac1@gmail.com';
  const principalName = settings?.principalName || 'Rika Handayani, S.Pd.,Gr.';
  const principalTitle = settings?.principalTitle || 'Kepala Sekolah SD IT Andalas Cendekia';
  const principalMessage = settings?.principalMessage || "Assalamu'alaikum Warahmatullahi Wabarakatuh. Selamat datang di portal resmi SD IT Andalas Cendekia. Kami berkomitmen menyelenggarakan pendidikan dasar Islam terpadu yang membekali pendidikan agama, adab dan akhlak mulia, kecakapan hidup kekinian, serta penguasaan sains dan teknologi untuk membentuk Generasi Pemimpin Qur'ani.";
  const principalPhoto = settings?.principalPhotoUrl || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80';
  
  // Legal & Financial Profile data
  const skPendirian = settings?.skPendirian || '188.45/36/Kpts-C-PLP/2011';
  const tglSkPendirian = settings?.tglSkPendirian || '14/11/2011';
  const skIzinOperasional = settings?.skIzinOperasional || '421.1/102/DISDIKPORA/2011';
  const tglSkIzinOperasional = settings?.tglSkIzinOperasional || '28/09/2011';
  const yayasan = settings?.yayasan || 'Yayasan Andalas Cendekia';
  const bankName = settings?.bankName || 'Bank Nagari';
  const bankAccNo = settings?.bankAccNo || '71050220008996';
  const bankAccName = settings?.bankAccName || 'Yayasan Andalas Cendekia';
  const bankBranch = settings?.bankBranch || 'Dharmasraya';
  const npwp = settings?.npwp || '001276922203000';
  const accreditation = settings?.accreditation || 'Akreditasi A';

  // Stats
  const totalGuru = settings?.totalGuru || 47;
  const totalTendik = settings?.totalTendik || 11;
  const totalRombel = settings?.totalRombel || 24;

  // Visi, Misi & Belief
  const visi = settings?.visi || "Terwujudnya sekolah unggul berkarakter Al-Qur'an";
  const beliefText = settings?.beliefText || "Cerdas Penuh Ketaqwaan";
  const ayatQuote = settings?.ayatQuote || "“Kamu adalah umat terbaik yang dilahirkan untuk manusia, menyuruh kepada yang ma’ruf, dan mencegah dari yang munkar, dan beriman kepada Allah.” (QS. Ali Imran: 110)";

  const misiList = (settings?.misiList && settings.misiList.length > 0) ? settings.misiList : [
    'Menjadikan SDM Civitas Andalas Cendekia unggul, berkarakter Al-Qur\'an dan profesional.',
    'Menjadikan peserta didik yang berkarakter Al-Qur\'an dengan potensi yang Allah berikan kepadanya.',
    'Menyelenggarakan sekolah berbasis teknologi informasi.',
    'Menjadikan peserta didik yang menguasai teknologi informasi dan komunikasi.',
    'Membangun sinergi dengan stakeholder untuk penyelenggaraan pendidikan.'
  ];

  const tujuanList = (settings?.tujuanList && settings.tujuanList.length > 0) ? settings.tujuanList : [
    'Membentuk generasi yang berkepribadian Islam, baik dalam pola pikir maupun pola sikapnya.',
    'Membekali generasi agar menguasai Tsaqofah Islam yang memadai (Membaca/menulis Al-Qur’an, Bahasa Arab, Hafalan min. 2 Juz, Hadits & Fiqih).',
    'Membekali generasi agar menguasai ilmu sains teknologi dan seni yang memadai (Matematika, IPA, IPS, Bahasa Indonesia, Bahasa Inggris & TIK).',
    'Memfasilitasi keunikan 9 ragam kecerdasan siswa (Multiple Intelligences) melalui Program Rising Star (PRISE).',
    'Membentuk 10 karakter & budaya sekolah khas (Kalimat Thoyyibah, Doa Harian, Jujur, Disiplin, Tanggung Jawab, PD, Peduli, & 5S).',
    'Menyelenggarakan pembelajaran terpadu 3 pilar pembinaan generasi: Sekolah, Pesantren, dan Masjid (Full-Day School).'
  ];

  const mapEmbedUrl = extractMapEmbedUrl(settings?.mapEmbedUrl || 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15959.049618176378!2d101.5300!3d-0.9965!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e2b4f53580521ad%3A0x6b4fb4cb213192f6!2sPulau%20Punjung%2C%20Dharmasraya!5e0!3m2!1sid!2sid!4v1700000000000!5m2!1sid!2sid');

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Header Banner */}
      <div className="bg-emerald-950 py-14 sm:py-20 text-center text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 opacity-90"></div>
        <div className="container mx-auto px-4 relative z-10 max-w-4xl">
          <span className="inline-flex items-center gap-1.5 bg-amber-500/20 text-amber-300 border border-amber-400/40 px-4 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider mb-4 shadow-sm backdrop-blur-md">
            <Sparkles size={14} className="text-amber-400" />
            Halaman Profil & Visi Misi
          </span>
          <h1 className="text-3xl sm:text-5xl font-black mb-3 tracking-tight text-white drop-shadow-md">
            {schoolName}
          </h1>
          <p className="text-amber-300 font-bold text-lg sm:text-xl italic max-w-2xl mx-auto">
            "{tagline}"
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 sm:py-16 max-w-5xl space-y-12 sm:space-y-16">

        {/* ================= Bagian 1: Identitas Sekolah ================= */}
        <section id="identitas" className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-200/90 transition-all hover:shadow-md">
          <div className="flex items-center gap-3.5 mb-8 border-b border-slate-100 pb-5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shadow-inner">
              <Building2 size={26} />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">1. Identitas Sekolah</h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">Data Kelembagaan, Legalitas SK & Kontak Resmi</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
            {/* Kolom Kiri: Profil Kelembagaan */}
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg inline-block">
                Profil Utama Kelembagaan
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Nama Sekolah</span>
                  <span className="font-bold text-slate-900">{schoolName}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">NPSN</span>
                  <span className="font-bold text-emerald-700 font-mono bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200/80">{npsn}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Jenjang & Status</span>
                  <span className="font-bold text-slate-900">SD / Swasta ({accreditation})</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Naungan Yayasan</span>
                  <span className="font-bold text-slate-800">{yayasan}</span>
                </div>
                <div className="py-2 border-b border-slate-100">
                  <span className="text-slate-500 font-medium block mb-1 flex items-center gap-1.5">
                    <MapPin size={15} className="text-emerald-600" /> Alamat Lengkap
                  </span>
                  <span className="font-semibold text-slate-800 leading-relaxed block text-xs sm:text-sm">
                    {address}
                  </span>
                </div>
              </div>
            </div>

            {/* Kolom Kanan: Legalitas & Banking */}
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-amber-900 bg-amber-50 px-3 py-1.5 rounded-lg inline-block">
                Legalitas SK & Rekening Resmi
              </h3>

              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500 font-medium flex items-center gap-1.5">
                    <FileText size={15} className="text-amber-600" /> SK Pendirian
                  </span>
                  <span className="font-bold text-slate-800 text-xs font-mono">{skPendirian} ({tglSkPendirian})</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500 font-medium flex items-center gap-1.5">
                    <FileText size={15} className="text-amber-600" /> SK Izin Operasional
                  </span>
                  <span className="font-bold text-slate-800 text-xs font-mono">{skIzinOperasional} ({tglSkIzinOperasional})</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">NPWP Yayasan</span>
                  <span className="font-bold text-slate-800 font-mono text-xs">{npwp}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500 font-medium flex items-center gap-1.5">
                    <Mail size={15} className="text-emerald-600" /> Email & Telp
                  </span>
                  <span className="font-bold text-emerald-800 text-xs">{email} | {phone}</span>
                </div>
                
                {/* Bank Account Box */}
                <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200 mt-3">
                  <div className="text-xs font-extrabold text-emerald-900 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Landmark size={16} className="text-emerald-700" /> Rekening Resmi Pembayaran
                  </div>
                  <div className="text-sm font-black text-slate-900">
                    {bankName} - <span className="font-mono text-emerald-700">{bankAccNo}</span>
                  </div>
                  <div className="text-xs text-slate-600 font-semibold mt-0.5">
                    a.n. {bankAccName} ({bankBranch})
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Peta Lokasi Interaktif Sekolah */}
          {mapEmbedUrl && (
            <div className="mt-8 pt-6 border-t border-slate-100">
              <div className="flex items-center gap-2 mb-3">
                <MapPin size={18} className="text-emerald-600" />
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                  Peta Lokasi Interaktif Sekolah
                </h3>
              </div>
              <div className="w-full h-72 sm:h-96 rounded-2xl overflow-hidden border border-slate-200 shadow-sm relative bg-slate-100">
                <iframe
                  title="Peta Lokasi Sekolah"
                  src={mapEmbedUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen={true}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="w-full h-full"
                ></iframe>
              </div>
            </div>
          )}
        </section>

        {/* ================= Bagian 2: Sambutan Kepala Sekolah ================= */}
        <section id="sambutan" className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 text-white p-8 sm:p-12 rounded-3xl shadow-xl border border-emerald-800/80 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex items-center gap-3 mb-8 border-b border-emerald-800/80 pb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold border border-amber-400/30">
              <Quote size={20} />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-white">2. Sambutan Kepala Sekolah</h2>
              <p className="text-xs text-emerald-200">Pesan Pengantar Manajemen & Pimpinan Sekolah</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-8 sm:gap-10 items-center md:items-start">
            <div className="relative shrink-0">
              <div className="w-40 h-48 sm:w-48 sm:h-56 bg-amber-500 rounded-3xl overflow-hidden border-4 border-amber-400/60 shadow-2xl shadow-emerald-950/60 transform rotate-1 hover:rotate-0 transition-transform duration-300">
                <img 
                  src={principalPhoto} 
                  alt={principalName} 
                  className="object-cover w-full h-full" 
                />
              </div>
              <div className="absolute -bottom-3 -right-3 bg-amber-400 text-amber-950 font-extrabold text-[10px] uppercase px-3 py-1 rounded-full shadow-lg border border-amber-300">
                Kepala Sekolah
              </div>
            </div>

            <div className="space-y-4 text-center md:text-left flex-1">
              <div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-amber-300 mb-1">
                  {principalName}
                </h3>
                <p className="text-xs sm:text-sm font-semibold text-emerald-200 tracking-wide uppercase">
                  {principalTitle}
                </p>
              </div>

              <div className="bg-emerald-900/60 backdrop-blur-sm p-6 rounded-2xl border border-emerald-700/50 shadow-inner">
                <p className="text-emerald-50 text-sm sm:text-base leading-relaxed italic">
                  "{principalMessage}"
                </p>
              </div>

              <div className="flex items-center justify-center md:justify-start gap-2 text-xs font-bold text-amber-400">
                <Sparkles size={14} />
                <span>SD IT Andalas Cendekia - Mentransformasi Karakter Qur'ani Sejak Dini</span>
              </div>
            </div>
          </div>
        </section>

        {/* ================= Bagian 3: Visi, Misi & Tujuan Sekolah ================= */}
        <section id="visi-misi" className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-200/90 space-y-10">
          <div className="flex items-center gap-3.5 border-b border-slate-100 pb-5">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold shadow-inner">
              <Target size={26} />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">3. Visi, Misi & Tujuan Sekolah</h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">Arah Pandang, Landasan Nilai & Target Capaian Lulusan</p>
            </div>
          </div>

          {/* Landasan Ayat Al-Qur'an */}
          <div className="bg-gradient-to-r from-emerald-900 to-teal-950 text-white p-6 sm:p-8 rounded-2xl border border-emerald-800 shadow-md text-center relative overflow-hidden">
            <span className="text-amber-400 text-xs font-black uppercase tracking-widest block mb-2">Landasan Kitab Suci Al-Qur'an</span>
            <p className="text-sm sm:text-base font-serif italic text-emerald-100 max-w-3xl mx-auto leading-relaxed">
              {ayatQuote}
            </p>
            <div className="mt-4 inline-flex items-center gap-2 bg-amber-400 text-amber-950 px-4 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow">
              <Sparkles size={14} /> Belief Utama: "{beliefText}"
            </div>
          </div>

          {/* Visual Box Visi Utama */}
          <div className="bg-emerald-50/80 border-2 border-emerald-300 p-8 rounded-3xl text-center shadow-inner">
            <span className="text-xs font-black text-emerald-800 uppercase tracking-widest block mb-2">
              Visi Utama Sekolah
            </span>
            <h3 className="text-2xl sm:text-4xl font-black text-emerald-950 leading-tight">
              "{visi}"
            </h3>
          </div>

          {/* Misi & Tujuan Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Misi Sekolah */}
            <div className="bg-slate-50 p-6 sm:p-8 rounded-3xl border border-slate-200/80 space-y-5">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2.5 border-b border-slate-200 pb-4">
                <span className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-sm font-bold shadow">
                  M
                </span>
                Misi Sekolah
              </h3>
              <ul className="space-y-4">
                {misiList.map((misi, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-slate-700">
                    <span className="w-6 h-6 rounded-full bg-emerald-700 text-white font-black flex items-center justify-center shrink-0 mt-0.5 text-xs shadow-sm">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed font-semibold text-slate-800">{misi}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Tujuan Sekolah */}
            <div className="bg-slate-50 p-6 sm:p-8 rounded-3xl border border-slate-200/80 space-y-5">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2.5 border-b border-slate-200 pb-4">
                <span className="w-8 h-8 rounded-xl bg-amber-500 text-amber-950 flex items-center justify-center text-sm font-bold shadow">
                  T
                </span>
                Tujuan Sekolah & Target Pendidikan
              </h3>
              <ul className="space-y-3.5">
                {tujuanList.map((tujuan, idx) => (
                  <li key={idx} className="p-3.5 rounded-2xl bg-white border border-slate-200/90 text-xs sm:text-sm text-slate-700 leading-relaxed flex items-start gap-3 shadow-sm">
                    <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                    <span className="font-medium text-slate-800">{tujuan}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ================= Bagian 4: Data Kepemimpinan & Tenaga Pendidik ================= */}
        <section id="sdm" className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-200/90">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 border-b border-slate-100 pb-5">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold shadow-inner">
                <Users size={26} />
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900">4. Data Kepemimpinan & Tenaga Pendidik</h2>
                <p className="text-xs sm:text-sm text-slate-500 font-medium">Struktur Kepemimpinan, Guru & Tenaga Kependidikan {schoolName}</p>
              </div>
            </div>

            {/* Stats Summary Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full text-xs font-bold">
                {totalGuru} Guru
              </span>
              <span className="bg-blue-50 text-blue-800 border border-blue-200 px-3 py-1 rounded-full text-xs font-bold">
                {totalTendik} Tendik
              </span>
              <span className="bg-purple-50 text-purple-800 border border-purple-200 px-3 py-1 rounded-full text-xs font-bold">
                {totalRombel} Rombel
              </span>
            </div>
          </div>

          {/* Table Data Tenaga Pendidik */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-emerald-900 text-white text-xs uppercase font-extrabold border-b border-emerald-800">
                  <th className="py-4 px-4 text-center">No</th>
                  <th className="py-4 px-4">Nama Tenaga Pendidik</th>
                  <th className="py-4 px-4">Jabatan Struktural</th>
                  <th className="py-4 px-4">Mata Pelajaran / Bidang Tugas</th>
                  <th className="py-4 px-4 text-center">Strata</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs sm:text-sm text-slate-700 bg-white">
                {(Array.isArray(teacherList) ? teacherList : []).map((t, idx) => (
                  <tr key={t.id || idx} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-400 text-center w-12">{idx + 1}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">{t.name}</td>
                    <td className="py-3.5 px-4 font-bold text-emerald-700">{t.role}</td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium">{t.mapel}</td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="bg-slate-100 text-slate-800 border border-slate-200 px-3 py-0.5 rounded-full font-mono font-bold text-xs">
                        {t.strata || 'S1'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

      </div>
    </div>
  );
}
