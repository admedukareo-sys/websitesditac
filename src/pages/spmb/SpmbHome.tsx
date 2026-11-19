import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, FileText, CreditCard, Laptop, Clock, AlertCircle } from 'lucide-react';
import { getSiteSettings, SiteSettings } from '@/lib/storage';

export default function SpmbHome() {
  const [settings, setSettings] = useState<SiteSettings>(getSiteSettings());

  useEffect(() => {
    setSettings(getSiteSettings());
    const handleSync = () => setSettings(getSiteSettings());
    window.addEventListener('sdit_data_synced', handleSync);
    return () => window.removeEventListener('sdit_data_synced', handleSync);
  }, []);

  const academicYear = settings.spmbAcademicYear || '2027/2028';
  const isWaitlist = settings.spmbHidePayment ?? true;
  const statusText = settings.spmbStatusText || (isWaitlist ? 'Daftar Tunggu' : 'Telah Dibuka');

  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        
        {/* Banner Pengumuman Daftar Tunggu */}
        {isWaitlist && (
          <div className="mb-8 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 rounded-2xl p-5 text-white shadow-md border border-amber-400/30 flex items-start gap-4 animate-fadeIn">
            <div className="p-2 bg-white/20 backdrop-blur rounded-xl shrink-0">
              <Clock size={24} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="font-extrabold text-sm uppercase tracking-wider">Status SPMB TA {academicYear}</span>
                <span className="bg-amber-950/60 text-amber-200 text-[11px] font-extrabold px-3 py-0.5 rounded-full border border-amber-400/30">
                  {statusText}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-amber-50 font-medium leading-relaxed">
                {settings.spmbWaitlistNotice || `Pendaftaran SPMB SD IT Andalas Cendekia Tahun Ajaran ${academicYear} saat ini membuka kuota Daftar Tunggu. Seluruh fitur rincian & bukti pembayaran disembunyikan sementara.`}
              </p>
            </div>
          </div>
        )}

        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-emerald-100/80 text-emerald-800 text-xs font-extrabold px-4 py-1.5 rounded-full mb-3 border border-emerald-200 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
            <span>Tahun Ajaran {academicYear}</span>
          </div>
          <h1 className="text-4xl font-bold text-slate-800 mb-4">Portal SPMB Online</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Sistem Penerimaan Murid Baru SD IT Andalas Cendekia Tahun Ajaran {academicYear}.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Pendaftar Baru</h2>
            <p className="text-slate-600 mb-8">
              Silakan buat akun pendaftaran terlebih dahulu untuk memulai proses pendaftaran siswa baru Tahun Ajaran {academicYear}.
            </p>
            <Link 
              to="/spmb/register" 
              className="w-full block text-center bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 rounded-xl transition-colors shadow-sm"
            >
              Buat Akun Pendaftaran
            </Link>
          </div>
          
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Sudah Punya Akun?</h2>
            <p className="text-slate-600 mb-8">
              Masuk menggunakan Email dan Password yang telah didaftarkan untuk melengkapi data atau mengecek status pendaftaran.
            </p>
            <Link 
              to="/spmb/login" 
              className="w-full block text-center bg-white border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50 font-medium py-3 rounded-xl transition-colors"
            >
              Login Calon Siswa / Admin
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 mb-12">
          <h2 className="text-2xl font-bold text-slate-800 mb-8 text-center">Alur Pendaftaran SPMB {academicYear}</h2>
          
          <div className="grid md:grid-cols-4 gap-6 relative">
            <div className="hidden md:block absolute top-10 left-1/8 right-1/8 h-0.5 bg-emerald-100 -z-10 w-[75%] mx-auto"></div>
            
            <div className="text-center relative z-10">
              <div className="w-20 h-20 mx-auto bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4 shadow-sm border-4 border-white">
                <Laptop size={32} />
              </div>
              <h3 className="font-bold text-slate-800 mb-2">1. Registrasi Akun</h3>
              <p className="text-sm text-slate-600">Buat akun dengan email aktif dan isi formulir pendaftaran awal.</p>
            </div>
            
            <div className="text-center relative z-10">
              <div className="w-20 h-20 mx-auto bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4 shadow-sm border-4 border-white">
                <FileText size={32} />
              </div>
              <h3 className="font-bold text-slate-800 mb-2">2. Isi Form & Pas Foto</h3>
              <p className="text-sm text-slate-600">Lengkapi data diri calon siswa dan unggah pas foto formal anak.</p>
            </div>
            
            <div className="text-center relative z-10">
              <div className="w-20 h-20 mx-auto bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4 shadow-sm border-4 border-white">
                <CreditCard size={32} />
              </div>
              <h3 className="font-bold text-slate-800 mb-2">3. Pembayaran Rp 250.000</h3>
              <p className="text-sm text-slate-600">
                Transfer ke Bank Nagari <strong>71050220008996</strong> a.n. <strong>Yayasan Andalas Cendekia</strong> dan upload bukti transfer.
              </p>
            </div>
            
            <div className="text-center relative z-10">
              <div className="w-20 h-20 mx-auto bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4 shadow-sm border-4 border-white">
                <CheckCircle2 size={32} />
              </div>
              <h3 className="font-bold text-slate-800 mb-2">4. Seleksi & Hasil</h3>
              <p className="text-sm text-slate-600">Ikuti tes akademik/tahfidz lalu cek hasil kelulusan di dashboard.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
