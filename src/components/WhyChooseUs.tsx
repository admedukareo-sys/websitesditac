import React, { useState, useEffect } from 'react';
import { CheckCircle2, Clock, ShieldCheck, Award, Sparkles, Users, GraduationCap, Building, Landmark } from 'lucide-react';
import { getSiteAdvantages, getSiteSettings, AdvantageItem, SiteSettings } from '@/lib/storage';

export default function WhyChooseUs() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [reasons, setReasons] = useState<AdvantageItem[]>([]);

  useEffect(() => {
    setSettings(getSiteSettings());
    setReasons(getSiteAdvantages());

    const handleSync = () => {
      setSettings(getSiteSettings());
      setReasons(getSiteAdvantages());
    };

    window.addEventListener('sdit_data_synced', handleSync);
    return () => {
      window.removeEventListener('sdit_data_synced', handleSync);
    };
  }, []);

  const totalSiswa = settings?.totalSiswa || 86;
  const totalGuru = settings?.totalGuru || 7;
  const totalRombel = settings?.totalRombel || 6;
  const luasLahan = settings?.luasLahan || '2.500 m²';

  return (
    <section className="py-24 bg-white relative overflow-hidden">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Animated Cheerful Stat Badges Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-20">
          <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-50 to-teal-100/60 border border-emerald-200/80 text-center shadow-sm card-hover-pop">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mx-auto mb-3 shadow-md">
              <Users size={24} />
            </div>
            <h3 className="text-3xl font-black text-emerald-950 mb-1">{totalSiswa}</h3>
            <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Siswa Aktif</p>
          </div>

          <div className="p-6 rounded-3xl bg-gradient-to-br from-amber-50 to-orange-100/60 border border-amber-200/80 text-center shadow-sm card-hover-pop">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-amber-950 flex items-center justify-center mx-auto mb-3 shadow-md">
              <GraduationCap size={24} />
            </div>
            <h3 className="text-3xl font-black text-amber-950 mb-1">{totalGuru}</h3>
            <p className="text-xs font-bold text-amber-700 uppercase tracking-wider">Guru Berdedikasi</p>
          </div>

          <div className="p-6 rounded-3xl bg-gradient-to-br from-sky-50 to-blue-100/60 border border-blue-200/80 text-center shadow-sm card-hover-pop">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center mx-auto mb-3 shadow-md">
              <Building size={24} />
            </div>
            <h3 className="text-3xl font-black text-blue-950 mb-1">{totalRombel} Rombel</h3>
            <p className="text-xs font-bold text-blue-700 uppercase tracking-wider">Rombongan Belajar</p>
          </div>

          <div className="p-6 rounded-3xl bg-gradient-to-br from-purple-50 to-pink-100/60 border border-purple-200/80 text-center shadow-sm card-hover-pop">
            <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center mx-auto mb-3 shadow-md">
              <Landmark size={24} />
            </div>
            <h3 className="text-3xl font-black text-purple-950 mb-1">{luasLahan}</h3>
            <p className="text-xs font-bold text-purple-700 uppercase tracking-wider">Luas Lahan (Wakaf)</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Why Choose Us Reasons */}
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 text-emerald-800 bg-emerald-100/90 border border-emerald-300 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider mb-4 shadow-sm">
              <Award size={14} className="text-amber-500" />
              <span>Keunggulan Utama Sekolah</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-6 leading-tight">
              Mengapa Memilih <span className="gradient-text-cheerful">SD IT Andalas Cendekia?</span>
            </h2>
            <p className="text-slate-600 text-base mb-8 leading-relaxed font-medium">
              Kami berkomitmen menyelenggarakan pendidikan dasar Islam terpadu terbaik yang memadukan keunikan potensi siswa (Multiple Intelligences), pembentukan karakter Al-Qur’an (Bi-SQ 3HA), dan program keunggulan (PRISE).
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {reasons.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3.5 p-5 rounded-3xl bg-slate-50 border border-slate-200/80 hover:border-emerald-300 hover:bg-emerald-50/60 transition-all duration-300 shadow-sm hover:shadow-md card-hover-pop">
                  <div className="w-9 h-9 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-md">
                    <CheckCircle2 size={20} />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm mb-1">{item.title}</h3>
                    <p className="text-slate-600 text-xs leading-relaxed font-medium">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Working Hours Card */}
          <div className="lg:col-span-5">
            <div className="bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-950 text-white rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden border border-emerald-700/60">
              <div className="absolute top-0 right-0 w-40 h-40 bg-amber-400/10 rounded-full blur-3xl pointer-events-none"></div>

              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-amber-400 text-amber-950 flex items-center justify-center font-black shadow-lg">
                  <Clock size={28} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white">Jam Operasional</h3>
                  <p className="text-xs text-amber-300 font-bold">Layanan Administrasi & Informasi SPMB</p>
                </div>
              </div>

              <p className="text-emerald-100 text-xs mb-6 leading-relaxed border-b border-emerald-800/80 pb-6 font-medium">
                Tim layanan informasi dan pendaftaran kami siap melayani kebutuhan Anda dengan ramah pada jam operasional kerja berikut:
              </p>

              <div className="space-y-4 text-xs font-semibold">
                <div className="flex items-center justify-between py-2 border-b border-emerald-800/60">
                  <span className="text-emerald-200">Senin – Kamis</span>
                  <span className="font-extrabold text-amber-300 bg-emerald-950 px-3.5 py-1 rounded-full border border-emerald-700">07:30 AM – 03:30 PM</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-emerald-800/60">
                  <span className="text-emerald-200">Jumat</span>
                  <span className="font-extrabold text-amber-300 bg-emerald-950 px-3.5 py-1 rounded-full border border-emerald-700">07:30 AM – 02:30 PM</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-emerald-800/60">
                  <span className="text-emerald-200">Sabtu (Klub & SPMB)</span>
                  <span className="font-extrabold text-amber-300 bg-emerald-950 px-3.5 py-1 rounded-full border border-emerald-700">08:00 AM – 12:00 PM</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-emerald-200">Minggu & Libur Nasional</span>
                  <span className="font-extrabold text-red-300 bg-red-950/60 px-3.5 py-1 rounded-full border border-red-800/50">Tutup</span>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-emerald-800/80 flex items-center gap-3 bg-emerald-950/80 p-4 rounded-2xl border border-emerald-700/40">
                <ShieldCheck className="text-amber-400 shrink-0" size={26} />
                <div className="text-[11px] text-emerald-200">
                  <span className="font-bold text-white block mb-0.5">Sertifikasi Standar Mutu Pendidikan</span>
                  ISO 9001:2015 Certified • Akreditasi A (Unggul)
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
