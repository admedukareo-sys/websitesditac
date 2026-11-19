import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { 
  getRegistrationsByUserId, 
  Registration, 
  updateRegistration, 
  createChildRegistration, 
  formatDateTime, 
  getSiteSettings, 
  SiteSettings,
  SpmbStage,
  SPMB_STAGES_LIST,
  syncWithBackend
} from '@/lib/storage';
import RegistrationCardModal from '@/components/RegistrationCardModal';
import { 
  Mail, Printer, CheckCircle2, Calendar, Clock, Info, Plus, 
  UserPlus, Users, Sparkles, BookOpen, ChevronRight, FileText, School,
  FolderOpen, FolderUp, AlertCircle, ExternalLink, Brain, Smile, Award, Landmark, CreditCard
} from 'lucide-react';

const getStageStepNumber = (stageKey?: SpmbStage) => {
  switch (stageKey) {
    case 'PENDAFTARAN': return 1;
    case 'TES_STIFIN': return 2;
    case 'WAWANCARA_ANAK': return 3;
    case 'WAWANCARA_ORTU': return 4;
    case 'PENGUMUMAN': return 5;
    case 'DAFTAR_ULANG': return 6;
    case 'SELESAI': return 7;
    default: return 1;
  }
};

const getStageIcon = (iconName: string) => {
  switch (iconName) {
    case 'FileText': return <FileText size={15} />;
    case 'Brain': return <Brain size={15} />;
    case 'Smile': return <Smile size={15} />;
    case 'Users': return <Users size={15} />;
    case 'Award': return <Award size={15} />;
    case 'CheckCircle2': return <CheckCircle2 size={15} />;
    default: return <Clock size={15} />;
  }
};

export default function SpmbDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [selectedCardReg, setSelectedCardReg] = useState<Registration | null>(null);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [showEmailNotice, setShowEmailNotice] = useState(false);
  const [settings, setSettings] = useState<SiteSettings>(getSiteSettings());

  const loadData = () => {
    if (!user) return;
    setSettings(getSiteSettings());

    let list = getRegistrationsByUserId(user.id);
    if (list.length === 0) {
      const defaultReg = updateRegistration(user.id, { 
        status: 'DRAFT', 
        paymentStatus: 'UNPAID',
        studentName: user.name || ''
      });
      list = [defaultReg];
    }
    setRegistrations(list);
  };

  useEffect(() => {
    if (!user) {
      navigate('/spmb/login');
      return;
    }
    if (user.role === 'ADMIN') {
      navigate('/admin');
      return;
    }

    loadData();

    // Sinkronkan data dari MySQL di background agar jika ada anak kedua selalu muncul
    syncWithBackend().then(() => loadData());

    window.addEventListener('sdit_data_synced', loadData);

    if (location.state && (location.state as any).emailSent) {
      setShowEmailNotice(true);
    }

    return () => {
      window.removeEventListener('sdit_data_synced', loadData);
    };
  }, [user, navigate, location.state]);

  const handleAddNewChild = () => {
    if (!user) return;
    const newChild = createChildRegistration(user.id);
    navigate(`/spmb/dashboard/form?id=${newChild.id}`);
  };

  if (!user || registrations.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
        <div className="text-center font-medium text-slate-500 flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
          <span>Memuat Dashboard Calon Siswa...</span>
        </div>
      </div>
    );
  }

  const academicYear = settings.spmbAcademicYear || '2027/2028';
  const isWaitlist = settings.spmbHidePayment ?? true;

  const statusColors = {
    DRAFT: 'bg-slate-100 text-slate-800 border-slate-300',
    SUBMITTED: 'bg-blue-50 text-blue-800 border-blue-200',
    VERIFIED: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    REJECTED: 'bg-red-50 text-red-800 border-red-200',
    PASSED: 'bg-amber-50 text-amber-800 border-amber-200',
    FAILED: 'bg-red-50 text-red-800 border-red-200',
    REGISTERED: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  };

  const statusLabel = {
    DRAFT: 'Draft (Belum Submit)',
    SUBMITTED: isWaitlist ? `Daftar Tunggu (TA ${academicYear})` : 'Menunggu Verifikasi Berkas',
    VERIFIED: 'Berkas Lulus, Siap Tes',
    REJECTED: 'Berkas Ditolak / Perlu Perbaikan',
    PASSED: 'Selamat! Lulus Seleksi',
    FAILED: 'Tidak Lulus',
    REGISTERED: 'Siswa Resmi Terdaftar',
  };

  const primaryDraftChild = registrations.find(c => c.status === 'DRAFT' || c.status === 'REJECTED') || registrations[0];
  const isAnyDraft = registrations.some(c => c.status === 'DRAFT' || c.status === 'REJECTED');

  return (
    <div className="bg-slate-50 min-h-screen py-10">
      <div className="container mx-auto px-4 max-w-5xl">
        
        {/* Email Sent Notification Notice */}
        {showEmailNotice && (
          <div className="mb-6 bg-emerald-600 text-white p-4 rounded-2xl shadow-lg flex items-center justify-between animate-fadeIn">
            <div className="flex items-center gap-3">
              <CheckCircle2 size={24} className="text-amber-300 shrink-0" />
              <div>
                <h4 className="font-bold text-sm">Formulir Pendaftaran Berhasil Dikirim!</h4>
                <p className="text-xs text-emerald-100">
                  Salinan bukti pendaftaran resmi telah otomatis dikirimkan ke email <strong>{user.email}</strong>.
                </p>
              </div>
            </div>
            <button 
              onClick={() => setShowEmailNotice(false)}
              className="text-emerald-200 hover:text-white text-xs font-bold px-2 py-1 cursor-pointer"
            >
              Tutup
            </button>
          </div>
        )}

        {/* Dashboard Top Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800">
                  Dashboard Pendaftaran SPMB
                </h1>
                <span className="bg-emerald-100 text-emerald-800 font-extrabold text-xs px-3 py-1 rounded-full border border-emerald-200">
                  TA {academicYear}
                </span>
              </div>
              <p className="text-slate-600 text-sm">
                Akun Orang Tua / Wali: <strong className="text-emerald-700">{user.name}</strong> ({user.email})
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Silakan lengkapi formulir pendaftaran calon siswa di bawah ini untuk memulai proses seleksi.
              </p>
            </div>

            {/* Main Action di Paling Atas */}
            <div className="flex flex-wrap items-center gap-3">
              {isAnyDraft ? (
                <>
                  <Link
                    to={`/spmb/dashboard/form?id=${primaryDraftChild.id}`}
                    className="bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold text-sm sm:text-base px-6 py-3.5 rounded-2xl transition-all shadow-md hover:shadow-lg flex items-center gap-2.5 shrink-0"
                  >
                    <FileText size={20} className="stroke-[2.5]" />
                    <span>Lengkapi Formulir Anak Ini</span>
                    <ChevronRight size={18} />
                  </Link>
                  <button
                    onClick={handleAddNewChild}
                    className="bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-800 font-bold text-xs sm:text-sm px-4 py-3.5 rounded-2xl transition-all border border-slate-200 flex items-center gap-2 shrink-0 cursor-pointer"
                  >
                    <Plus size={16} className="text-emerald-700 stroke-[3]" />
                    <span>+ Daftarkan Anak Lainnya</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleAddNewChild}
                    className="bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold text-sm sm:text-base px-6 py-3.5 rounded-2xl transition-all shadow-md hover:shadow-lg flex items-center gap-2.5 shrink-0 cursor-pointer"
                  >
                    <Plus size={18} className="stroke-[3]" />
                    <span>+ Daftarkan Anak Kedua / Lainnya</span>
                  </button>
                  <Link
                    to={`/spmb/dashboard/form?id=${primaryDraftChild.id}`}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs sm:text-sm px-4 py-3.5 rounded-2xl transition-all border border-slate-200 flex items-center gap-2 shrink-0"
                  >
                    <FileText size={16} />
                    <span>Lihat Formulir Ananda</span>
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Quick Notice Banner */}
          <div className="mt-6 pt-5 border-t border-slate-100 flex items-start gap-3 bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100 text-xs text-emerald-900">
            <Sparkles size={18} className="text-emerald-600 shrink-0 mt-0.5" />
            <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="font-bold block mb-0.5">
                  {isAnyDraft ? 'Langkah Pertama Pendaftaran:' : 'Status Pendaftaran SPMB:'}
                </span>
                <p className="text-emerald-800 leading-relaxed">
                  {isAnyDraft 
                    ? 'Klik tombol "Lengkapi Formulir Anak Ini" di atas untuk mengisi data diri ananda, data orang tua/wali, serta mengunggah pas foto calon siswa.'
                    : 'Formulir pendaftaran ananda telah dikirimkan. Anda dapat memantau tahapan proses seleksi calon siswa pada kartu di bawah ini.'}
                </p>
              </div>
              {isAnyDraft && (
                <Link
                  to={`/spmb/dashboard/form?id=${primaryDraftChild.id}`}
                  className="inline-flex items-center gap-1.5 font-bold text-emerald-700 hover:text-emerald-800 bg-white px-3.5 py-2 rounded-xl border border-emerald-200 shadow-2xs shrink-0 self-start sm:self-auto text-xs"
                >
                  <span>Isi Formulir Sekarang</span>
                  <ChevronRight size={14} />
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Banner Instruksi Pembayaran Bank Nagari */}
        <div className="mb-6 bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-950 text-white rounded-3xl p-5 sm:p-6 shadow-md border border-emerald-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center shrink-0 border border-white/20">
              <Landmark size={22} className="text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-200">
                  Pembayaran Biaya Pendaftaran SPMB TA {academicYear}
                </span>
                <span className="bg-amber-400 text-amber-950 text-[10px] font-black px-2.5 py-0.5 rounded-full">
                  Rp 250.000 / Anak
                </span>
              </div>
              <p className="text-xs sm:text-sm text-emerald-50 leading-relaxed font-medium">
                Transfer ke <strong>Bank Nagari</strong> No. Rek: <span className="font-mono font-black text-amber-300 text-sm sm:text-base tracking-wider">71050220008996</span> a.n. <strong>Yayasan Andalas Cendekia</strong>.
              </p>
              <p className="text-[11px] text-emerald-300/90 mt-0.5">
                *Setelah melakukan transfer, silakan klik tombol <strong>"Bayar & Upload Bukti"</strong> pada kartu masing-masing anak di bawah ini.
              </p>
            </div>
          </div>
          <Link
            to="/spmb/dashboard/payment"
            className="inline-flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-300 text-amber-950 font-extrabold text-xs px-5 py-3 rounded-2xl transition-all shadow-md active:scale-95 shrink-0"
          >
            <CreditCard size={15} />
            <span>Upload Bukti Bayar ↗</span>
          </Link>
        </div>

        {/* Section Title */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users size={20} className="text-emerald-700" />
            <h2 className="text-lg font-bold text-slate-800">
              Daftar Calon Siswa yang Didaftarkan ({registrations.length} Anak)
            </h2>
          </div>
        </div>

        {/* Children Registrations Cards List */}
        <div className="space-y-6 mb-8">
          {registrations.map((child, index) => {
            const childDisplayName = child.studentName?.trim() || `Calon Siswa #${child.id} (Nama Belum Diisi)`;
            const isChildDraft = child.status === 'DRAFT';

            return (
              <div 
                key={child.id} 
                className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-slate-100 hover:border-emerald-200 transition-all"
              >
                {/* Child Card Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
                  <div className="flex items-start gap-4">
                    {child.fotoUrl ? (
                      <img 
                        src={child.fotoUrl} 
                        alt={childDisplayName} 
                        className="w-12 h-14 object-cover rounded-2xl border-2 border-emerald-300 shadow-xs shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-extrabold text-lg shrink-0 border border-emerald-200">
                        {index + 1}
                      </div>
                    )}
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="text-xl font-bold text-slate-900">
                          {childDisplayName}
                        </h3>
                        <span className="font-mono text-xs bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full font-semibold border border-slate-200">
                          #SPMB-{child.id}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Calendar size={13} className="text-emerald-600" />
                          Terdaftar: {formatDateTime(child.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Status Badge & Top Button */}
                  <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                    <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold border ${statusColors[child.status] || statusColors.DRAFT}`}>
                      {statusLabel[child.status] || child.status}
                    </span>
                    <Link 
                      to={`/spmb/dashboard/form?id=${child.id}`}
                      className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-xs shrink-0 active:scale-95"
                    >
                      <FileText size={14} />
                      <span>{isChildDraft || child.status === 'REJECTED' ? 'Lengkapi Formulir Anak Ini' : 'Lihat / Edit Formulir'}</span>
                    </Link>
                  </div>
                </div>

                {/* Top Alert Banner for Draft / Rejected */}
                {(isChildDraft || child.status === 'REJECTED') && (
                  <div className="mt-5 p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-400 text-amber-950 flex items-center justify-center shrink-0 font-bold shadow-xs">
                        <FileText size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-amber-950 text-sm">
                          {child.status === 'REJECTED' ? 'Formulir Perlu Perbaikan' : 'Formulir Calon Siswa Ini Belum Dilengkapi (Draft)'}
                        </h4>
                        <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                          {child.status === 'REJECTED'
                            ? (child.rejectionReason || 'Silakan periksa catatan panitia dan perbarui data formulir.')
                            : 'Silakan isi data diri calon siswa, orang tua, dan berkas sekarang agar dapat segera diproses oleh panitia SPMB.'}
                        </p>
                      </div>
                    </div>
                    <Link 
                      to={`/spmb/dashboard/form?id=${child.id}`}
                      className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold text-xs sm:text-sm px-5 py-2.5 rounded-xl transition-all shadow-md shrink-0"
                    >
                      <FileText size={15} />
                      <span>Lengkapi Formulir Anak Ini →</span>
                    </Link>
                  </div>
                )}

                {/* Child Card Info Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 py-5 text-xs border-b border-slate-100">
                  <div className="space-y-0.5">
                    <span className="text-slate-400 block font-bold uppercase text-[10px]">NISN / NIK</span>
                    <span className="font-bold text-slate-800">
                      {child.nisn ? `${child.nisn}` : '-'}
                    </span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-slate-400 block font-bold uppercase text-[10px]">Asal Sekolah / TK</span>
                    <span className="font-bold text-slate-800 truncate block">
                      {child.previousSchool || '-'}
                    </span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-slate-400 block font-bold uppercase text-[10px]">Jenis Kelamin</span>
                    <span className="font-bold text-slate-800">
                      {child.gender === 'L' ? 'Laki-laki' : child.gender === 'P' ? 'Perempuan' : '-'}
                    </span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-slate-400 block font-bold uppercase text-[10px]">Status Pembayaran</span>
                    <span className={`font-bold ${
                      child.paymentStatus === 'VERIFIED' ? 'text-emerald-600' : 
                      child.paymentStatus === 'PENDING' ? 'text-amber-600' : 'text-red-500'
                    }`}>
                      {child.paymentStatus === 'VERIFIED' ? '✓ Lunas' :
                       child.paymentStatus === 'PENDING' ? '⏳ Menunggu Verifikasi' : 'Belum Bayar (Rp 250rb)'}
                    </span>
                  </div>
                  <div className="space-y-0.5 col-span-2 sm:col-span-1">
                    <span className="text-slate-400 block font-bold uppercase text-[10px]">Pas Foto Calon Siswa</span>
                    {child.fotoUrl ? (
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="w-5 h-5 rounded-full overflow-hidden bg-emerald-100 shrink-0 border border-emerald-300 inline-block shadow-2xs">
                          <img src={child.fotoUrl} alt="Foto" className="w-full h-full object-cover" />
                        </span>
                        <span className="font-bold text-emerald-700 text-[11px]">✓ Foto Tersimpan</span>
                      </div>
                    ) : (
                      <span className="text-amber-700 font-bold text-[11px] flex items-center gap-1">
                        Belum Diunggah
                      </span>
                    )}
                  </div>
                </div>

                {/* 6-Stage SPMB Stepper / Timeline */}
                {(() => {
                  const childCurrentStep = getStageStepNumber(child.spmbStage);
                  const activeStageConfig = SPMB_STAGES_LIST[Math.min(childCurrentStep - 1, 5)] || SPMB_STAGES_LIST[0];

                  return (
                    <div className="py-5 border-b border-slate-100">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                        <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                          <Sparkles size={14} className="text-amber-500" />
                          <span>Tahapan Proses Seleksi SPMB Ananda</span>
                        </span>
                        <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 self-start sm:self-auto">
                          Tahap {Math.min(childCurrentStep, 6)} dari 6: {activeStageConfig.shortTitle}
                        </span>
                      </div>

                      {/* Horizontal Stepper Progress */}
                      <div className="relative mb-4">
                        <div className="hidden sm:block absolute top-1/2 left-0 right-0 h-1 bg-slate-200 -translate-y-1/2 z-0"></div>
                        <div 
                          className="hidden sm:block absolute top-1/2 left-0 h-1 bg-emerald-500 -translate-y-1/2 z-0 transition-all duration-500"
                          style={{ width: `${Math.min(((childCurrentStep - 1) / 5) * 100, 100)}%` }}
                        ></div>

                        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2.5 relative z-10">
                          {SPMB_STAGES_LIST.map((stage) => {
                            const isCompleted = stage.stepNumber < childCurrentStep;
                            const isCurrent = stage.stepNumber === childCurrentStep;

                            return (
                              <div 
                                key={stage.key}
                                className={`flex flex-col items-center text-center p-2.5 sm:p-2 rounded-2xl transition-all ${
                                  isCurrent
                                    ? 'bg-amber-50/90 border-2 border-amber-400 shadow-sm ring-2 ring-amber-200/50'
                                    : isCompleted
                                    ? 'bg-emerald-50/60 border border-emerald-200'
                                    : 'bg-slate-50/60 border border-slate-200'
                                }`}
                              >
                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-extrabold text-xs mb-1.5 transition-all ${
                                  isCurrent
                                    ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30 ring-4 ring-amber-100 animate-pulse'
                                    : isCompleted
                                    ? 'bg-emerald-600 text-white shadow-xs'
                                    : 'bg-white text-slate-400 border border-slate-300'
                                }`}>
                                  {isCompleted ? <CheckCircle2 size={16} /> : stage.stepNumber}
                                </div>
                                <span className={`text-[11px] leading-tight block font-bold ${
                                  isCurrent ? 'text-amber-950 font-extrabold' : isCompleted ? 'text-emerald-900' : 'text-slate-500'
                                }`}>
                                  {stage.shortTitle}
                                </span>
                                <span className="text-[10px] mt-0.5 font-medium">
                                  {isCompleted ? (
                                    <span className="text-emerald-700 font-bold">Selesai ✓</span>
                                  ) : isCurrent ? (
                                    <span className="text-amber-700 font-extrabold">Aktif •</span>
                                  ) : (
                                    <span className="text-slate-400">Menunggu</span>
                                  )}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Active Stage Detailed Note & Schedule Box */}
                      <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50/80 via-teal-50/60 to-emerald-50/80 border border-emerald-200">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="p-1.5 rounded-lg bg-emerald-600 text-white shrink-0">
                              {getStageIcon(activeStageConfig.iconName)}
                            </span>
                            <div>
                              <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider block">
                                Informasi Tahapan Berjalan:
                              </span>
                              <h4 className="font-extrabold text-xs text-slate-900">
                                {activeStageConfig.title}
                              </h4>
                            </div>
                          </div>

                          <span className="text-[11px] text-emerald-800 font-semibold bg-white/80 px-2.5 py-1 rounded-xl border border-emerald-200 self-start sm:self-auto">
                            Status: {child.status === 'DRAFT' ? 'Pengisian Formulir' : child.graduationStatus === 'PASSED' ? 'Lulus Seleksi' : 'Proses Panitia SPMB'}
                          </span>
                        </div>

                        <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                          {activeStageConfig.desc}
                        </p>

                        {/* Announcement / Custom Schedule Note from Committee */}
                        {child.stageNote && (
                          <div className="mt-3 bg-white p-3.5 rounded-xl border border-amber-300 shadow-xs flex items-start gap-2.5">
                            <Sparkles size={16} className="text-amber-600 shrink-0 mt-0.5" />
                            <div>
                              <span className="font-extrabold text-xs text-amber-950 block">Pesan & Jadwal dari Panitia SPMB:</span>
                              <p className="text-xs text-slate-700 mt-0.5 leading-relaxed font-medium">
                                {child.stageNote}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* STIFIn Result Badge (if already tested) */}
                        {child.stifinResult && (
                          <div className="mt-3 bg-white p-3.5 rounded-xl border border-purple-200 shadow-xs flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2.5">
                              <div className="p-2 rounded-xl bg-purple-600 text-white shrink-0">
                                <Brain size={16} />
                              </div>
                              <div>
                                <span className="text-[10px] uppercase font-bold text-purple-700 tracking-wider block">Hasil Tes Bakat STIFIn Ananda:</span>
                                <h5 className="font-extrabold text-xs text-purple-950">{child.stifinResult}</h5>
                              </div>
                            </div>
                            <span className="text-[10px] font-bold text-purple-800 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200 shrink-0">
                              Terpetakan
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}

                {/* Status Notice per Child */}
                <div className="pt-4 pb-2">
                  {child.status === 'DRAFT' && (
                    <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center gap-2">
                      <Clock size={16} className="text-amber-600 shrink-0" />
                      <span>Formulir untuk anak ini masih berupa <strong>Draft</strong>. Silakan klik tombol <strong>"Lengkapi Formulir Anak Ini"</strong> di atas untuk melengkapi nama, data diri, dan mengajukan formulir.</span>
                    </div>
                  )}

                  {child.status === 'SUBMITTED' && (
                    <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-xs text-blue-900 flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-blue-600 shrink-0" />
                      <span>
                        {isWaitlist 
                          ? `Formulir anak ini telah terkirim dan masuk dalam Daftar Tunggu (Waitlist) TA ${academicYear}.`
                          : 'Formulir anak ini telah terkirim dan saat ini sedang menunggu verifikasi panitia SPMB.'}
                      </span>
                    </div>
                  )}

                  {child.status === 'REJECTED' && (
                    <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-900">
                      <p className="font-bold text-red-800">Catatan Perbaikan Formulir:</p>
                      <p className="text-red-700 mt-0.5">{child.rejectionReason || 'Periksa kembali kelengkapan berkas/data diri.'}</p>
                    </div>
                  )}

                  {(child.graduationStatus === 'PASSED' || child.status === 'PASSED') && (
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center shrink-0">
                          <Award size={22} className="text-amber-300" />
                        </div>
                        <div>
                          <h4 className="font-extrabold text-sm">Alhamdulillah! Ananda {childDisplayName} Lulus Seleksi 🎉</h4>
                          <p className="text-emerald-100 text-xs mt-0.5">Dinyatakan diterima sebagai calon santri/siswa baru SD IT Andalas Cendekia TA {academicYear}.</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => alert(`Daftar ulang untuk ananda ${childDisplayName} berhasil dikonfirmasi! Panitia SPMB akan segera menghubungi Ayah/Bunda via WhatsApp untuk fitting seragam dan administrasi.`)}
                        className="bg-amber-400 hover:bg-amber-300 text-amber-950 font-extrabold text-xs px-5 py-2.5 rounded-xl shadow transition-transform active:scale-95 cursor-pointer shrink-0"
                      >
                        Konfirmasi Daftar Ulang
                      </button>
                    </div>
                  )}

                  {child.graduationStatus === 'FAILED' && (
                    <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-900 flex items-start gap-2.5">
                      <AlertCircle size={18} className="text-red-600 shrink-0 mt-0.5" />
                      <div>
                        <h5 className="font-bold">Pengumuman Hasil Seleksi SPMB</h5>
                        <p className="mt-0.5">Mohon maaf, ananda belum memenuhi kriteria penerimaan pada periode seleksi ini. Terima kasih banyak atas kepercayaan dan partisipasi Ayah/Bunda.</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Child Card Action Buttons */}
                <div className="mt-4 pt-3 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <Link 
                      to={`/spmb/dashboard/form?id=${child.id}`}
                      className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-xs"
                    >
                      <FileText size={14} />
                      <span>{isChildDraft || child.status === 'REJECTED' ? 'Lengkapi Formulir Anak Ini' : 'Lihat / Edit Data Formulir'}</span>
                    </Link>

                    {!isChildDraft && (
                      <button
                        onClick={() => {
                          setSelectedCardReg(child);
                          setIsCardModalOpen(true);
                        }}
                        className="inline-flex items-center gap-1.5 border border-emerald-600 text-emerald-700 hover:bg-emerald-50 font-bold text-xs px-5 py-2.5 rounded-xl transition-colors cursor-pointer"
                      >
                        <Printer size={14} />
                        <span>Cetak Bukti Pendaftaran</span>
                      </button>
                    )}
                  </div>

                  {child.paymentStatus === 'UNPAID' && (
                    <Link
                      to={`/spmb/dashboard/payment?id=${child.id}`}
                      className="inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-xs shrink-0 active:scale-95"
                    >
                      <CreditCard size={14} />
                      <span>Bayar Rp 250rb & Upload Bukti</span>
                    </Link>
                  )}
                  {child.paymentStatus === 'PENDING' && (
                    <Link
                      to={`/spmb/dashboard/payment?id=${child.id}`}
                      className="inline-flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-xs shrink-0"
                    >
                      <Clock size={14} className="text-blue-600" />
                      <span>Lihat / Ganti Bukti Transfer</span>
                    </Link>
                  )}
                  {child.paymentStatus === 'VERIFIED' && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-2 rounded-xl border border-emerald-200">
                      <CheckCircle2 size={14} className="text-emerald-600" />
                      <span>Biaya Rp 250.000 Lunas</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Section Paling Bawah: Daftarkan Anak Lainnya */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100">
              <UserPlus size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h3 className="text-base sm:text-lg font-extrabold text-slate-800">
                  Ingin Mendaftarkan Anak Lainnya?
                </h3>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Satu Akun untuk Semua Buah Hati
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-xl">
                Jika Anda memiliki lebih dari 1 anak yang ingin mendaftar ke SD IT Andalas Cendekia, Anda tidak perlu membuat akun baru. Cukup gunakan tombol di samping untuk mendaftarkan anak lainnya. Nama setiap anak dapat diatur masing-masing pada formulir.
              </p>
            </div>
          </div>

          <button
            onClick={handleAddNewChild}
            className="bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-sm px-6 py-3.5 rounded-2xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2.5 shrink-0 cursor-pointer"
          >
            <Plus size={18} className="stroke-[3]" />
            <span>+ Daftarkan Anak Lainnya</span>
          </button>
        </div>

        {/* Global Waitlist / Info Box */}
        {isWaitlist && (
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl p-6 sm:p-7 shadow-sm border border-amber-200">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-200/80 text-amber-900 flex items-center justify-center shrink-0">
                <Clock size={20} />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-extrabold text-amber-950">
                  Status Penerimaan SPMB: Mode Daftar Tunggu (Waitlist)
                </h3>
                <p className="text-xs text-amber-900 leading-relaxed">
                  {settings.spmbWaitlistNotice || 'Pendaftaran SPMB saat ini dalam status Daftar Tunggu. Anda tidak perlu membayar biaya pendaftaran saat ini. Pengumuman kuota dan jadwal tes seleksi akan diinformasikan panitia melalui WhatsApp dan Email.'}
                </p>
                <div className="pt-2 text-[11px] text-amber-800 font-semibold">
                  Pertanyaan seputar SPMB? Hubungi Panitia Resmi di WhatsApp: 0811-6696-990.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Card Preview & Print for Selected Child */}
        {selectedCardReg && (
          <RegistrationCardModal 
            isOpen={isCardModalOpen}
            onClose={() => {
              setIsCardModalOpen(false);
              setSelectedCardReg(null);
            }}
            user={user}
            registration={selectedCardReg}
          />
        )}

      </div>
    </div>
  );
}
