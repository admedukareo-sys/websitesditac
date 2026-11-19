import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getRegistrations, saveRegistrations, Registration, formatDateTime, SPMB_STAGES_LIST, SpmbStage, syncWithBackend } from '@/lib/storage';
import { getVisitorStats, getVisitorLogs, VisitorLog } from '@/lib/visitorTracking';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { exportSpmbToExcel } from '@/lib/spmbExcelExporter';
import { 
  Eye, Users, Globe, MapPin, ArrowRight, ShieldCheck, 
  Brain, FileText, Smile, Award, CheckCircle2, TrendingUp,
  Clock, ArrowUpRight, Filter, Sparkles, RefreshCw, FileSpreadsheet
} from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [regs, setRegs] = useState<Registration[]>([]);
  const [visitorStats, setVisitorStats] = useState(getVisitorStats());
  const [recentVisits, setRecentVisits] = useState<VisitorLog[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  const isPanitia = user?.role === 'PANITIA_SPMB';

  const loadData = () => {
    setRegs(getRegistrations());
    setVisitorStats(getVisitorStats());
    setRecentVisits(getVisitorLogs().slice(0, 5));
  };

  const handleRefresh = async () => {
    setIsSyncing(true);
    try {
      const remoteRegs = await api.getRegistrations();
      if (remoteRegs && Array.isArray(remoteRegs)) {
        const mappedRegs: Registration[] = remoteRegs.map((r: any) => ({
          id: Number(r.id),
          clientId: r.client_id || undefined,
          userId: Number(r.user_id || r.userId),
          studentName: r.student_name || r.studentName || '',
          nisn: r.nisn || '',
          nik: r.nik || '',
          birthPlace: r.birth_place || r.birthPlace || '',
          birthDate: r.birth_date || r.birthDate || '',
          gender: r.gender || 'L',
          address: r.address || '',
          fatherName: r.father_name || r.fatherName || '',
          motherName: r.mother_name || r.motherName || '',
          parentPhone: r.parent_phone || r.parentPhone || '',
          previousSchool: r.previous_school || r.previousSchool || '',
          status: r.status || 'DRAFT',
          spmbStage: r.spmb_stage || r.spmbStage || 'PENDAFTARAN',
          stifinResult: r.stifin_result || r.stifinResult || '',
          interviewChildNotes: r.interview_child_notes || r.interviewChildNotes || '',
          interviewParentNotes: r.interview_parent_notes || r.interviewParentNotes || '',
          graduationStatus: r.graduation_status || r.graduationStatus || 'PENDING',
          stageNote: r.stage_note || r.stageNote || '',
          rejectionReason: r.rejection_reason || r.rejectionReason || '',
          documentDriveUrl: r.document_drive_url || r.documentDriveUrl || '',
          fotoUrl: r.foto_url || r.fotoUrl || '',
          paymentProofUrl: r.payment_proof_url || r.paymentProofUrl || '',
          paymentStatus: r.payment_status || r.paymentStatus || 'UNPAID',
          programType: r.program_type || r.programType || 'BOARDING',
          infoSource: r.info_source || r.infoSource || 'Instagram / Facebook Official',
          reasonToJoin: r.reason_to_join || r.reasonToJoin || '',
          testScore: r.test_score !== null && r.test_score !== undefined ? Number(r.test_score) : (r.testScore ?? undefined),
          interviewNotes: r.interview_notes || r.interviewNotes || '',
          reRegistrationProofUrl: r.re_registration_proof_url || r.reRegistrationProofUrl || '',
          uniformSize: r.uniform_size || r.uniformSize || '',
          aktaUrl: r.akta_url || r.aktaUrl || '',
          kkUrl: r.kk_url || r.kkUrl || '',
          raporUrl: r.rapor_url || r.raporUrl || '',
          createdAt: r.created_at || r.createdAt || new Date().toISOString(),
          updatedAt: r.updated_at || r.updatedAt || new Date().toISOString(),
        }));
        setRegs(mappedRegs);
        saveRegistrations(mappedRegs);
      } else {
        loadData();
      }
    } catch (e) {
      console.warn('Dashboard sync error:', e);
      loadData();
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    loadData();
    handleRefresh();

    window.addEventListener('sdit_data_synced', loadData);
    window.addEventListener('sdit_visitor_updated', loadData);
    return () => {
      window.removeEventListener('sdit_data_synced', loadData);
      window.removeEventListener('sdit_visitor_updated', loadData);
    };
  }, []);

  const totalRegs = regs.length;
  const submittedRegs = regs.filter((r) => r.status === 'SUBMITTED').length;

  // SPMB Stage Calculations
  const getStageCount = (stageKey: SpmbStage) => {
    return regs.filter((r) => (r.spmbStage || 'PENDAFTARAN') === stageKey).length;
  };

  const stifinTestedCount = regs.filter((r) => Boolean(r.stifinResult && r.stifinResult.trim() !== '')).length;
  const passedGraduationCount = regs.filter((r) => r.graduationStatus === 'PASSED' || r.status === 'PASSED').length;
  const reRegisteredCount = regs.filter((r) => r.spmbStage === 'DAFTAR_ULANG' || r.spmbStage === 'SELESAI').length;

  // Icon mapping for stages
  const getStageIcon = (iconName: string) => {
    switch (iconName) {
      case 'FileText': return <FileText size={18} />;
      case 'Brain': return <Brain size={18} />;
      case 'Smile': return <Smile size={18} />;
      case 'Users': return <Users size={18} />;
      case 'Award': return <Award size={18} />;
      case 'CheckCircle2': return <CheckCircle2 size={18} />;
      default: return <Clock size={18} />;
    }
  };

  const stageColorSchemes = [
    { bg: 'from-blue-500 to-indigo-600', text: 'text-blue-600', light: 'bg-blue-50 border-blue-200', bar: 'bg-blue-500' },
    { bg: 'from-purple-500 to-pink-600', text: 'text-purple-600', light: 'bg-purple-50 border-purple-200', bar: 'bg-purple-500' },
    { bg: 'from-amber-500 to-orange-600', text: 'text-amber-600', light: 'bg-amber-50 border-amber-200', bar: 'bg-amber-500' },
    { bg: 'from-cyan-500 to-teal-600', text: 'text-cyan-600', light: 'bg-cyan-50 border-cyan-200', bar: 'bg-cyan-500' },
    { bg: 'from-emerald-500 to-green-600', text: 'text-emerald-600', light: 'bg-emerald-50 border-emerald-200', bar: 'bg-emerald-500' },
    { bg: 'from-teal-600 to-emerald-700', text: 'text-teal-700', light: 'bg-teal-50 border-teal-200', bar: 'bg-teal-600' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-3xl font-extrabold text-slate-800">
              {isPanitia ? 'Dashboard Panitia SPMB' : 'Admin & SPMB Dashboard'}
            </h1>
            <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border ${
              isPanitia 
                ? 'bg-amber-100 text-amber-900 border-amber-300' 
                : 'bg-emerald-100 text-emerald-900 border-emerald-300'
            }`}>
              {isPanitia ? 'Hak Akses: Panitia SPMB' : 'Super Admin'}
            </span>
          </div>
          <p className="text-slate-500 text-xs">
            {isPanitia 
              ? 'Kelola alur pendaftaran, tes STIFIn, observasi & wawancara, serta pengumuman seleksi calon siswa baru.'
              : 'Ringkasan aktivitas SPMB, pemetaan tahapan seleksi, dan lalu lintas kunjungan website SD IT Andalas Cendekia.'}
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-auto flex-wrap">
          <button
            onClick={() => {
              exportSpmbToExcel(regs, {
                scope: 'ALL',
                format: 'DETAIL',
                schoolName: 'SD IT ANDALAS CENDEKIA',
                academicYear: '2027/2028',
              });
            }}
            className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-3.5 py-2.5 rounded-xl text-xs transition-all shadow-md flex items-center gap-1.5 cursor-pointer hover:scale-[1.02] active:scale-95"
            title="Download seluruh data calon siswa SPMB ke file Microsoft Excel (.xls) lengkap & detail"
          >
            <FileSpreadsheet size={15} />
            <span>Export Excel</span>
          </button>

          <button
            onClick={handleRefresh}
            disabled={isSyncing}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-white border border-slate-200 text-slate-700 hover:text-emerald-700 hover:border-emerald-300 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
            title="Tarik data terbaru dari database MySQL"
          >
            <RefreshCw size={14} className={isSyncing ? 'animate-spin text-emerald-600' : ''} />
            <span>{isSyncing ? 'Menyinkronkan...' : 'Refresh Data'}</span>
          </button>

          <Link
            to="/admin/registrations"
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-all shadow-md flex items-center gap-2 shrink-0"
          >
            <Users size={16} />
            <span>Buka Data Pendaftar</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* Main KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Total Calon Siswa</div>
          <div className="text-4xl font-extrabold text-slate-900">{totalRegs}</div>
          <div className="mt-3 text-xs text-slate-500 flex items-center justify-between">
            <span>Daftar Formulir</span>
            <Link to="/admin/registrations" className="font-bold text-emerald-600 hover:underline inline-flex items-center gap-0.5">
              Lihat Detail &rarr;
            </Link>
          </div>
          <div className="absolute top-4 right-4 text-emerald-100 pointer-events-none">
            <Users size={48} />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Hasil Tes STIFIn</div>
          <div className="text-4xl font-extrabold text-purple-600">{stifinTestedCount}</div>
          <div className="mt-3 text-xs text-slate-500 flex items-center justify-between">
            <span>{totalRegs > 0 ? `${Math.round((stifinTestedCount / totalRegs) * 100)}% terpetakan` : 'Belum ada data'}</span>
            <Link to="/admin/registrations?stage=TES_STIFIN" className="font-bold text-purple-600 hover:underline inline-flex items-center gap-0.5">
              Input STIFIn &rarr;
            </Link>
          </div>
          <div className="absolute top-4 right-4 text-purple-100 pointer-events-none">
            <Brain size={48} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Lulus Seleksi Akhir</div>
          <div className="text-4xl font-extrabold text-emerald-600">{passedGraduationCount}</div>
          <div className="mt-3 text-xs text-slate-500 flex items-center justify-between">
            <span>{reRegisteredCount} Sudah Daftar Ulang</span>
            <Link to="/admin/registrations?stage=PENGUMUMAN" className="font-bold text-emerald-600 hover:underline inline-flex items-center gap-0.5">
              Pengumuman &rarr;
            </Link>
          </div>
          <div className="absolute top-4 right-4 text-emerald-100 pointer-events-none">
            <Award size={48} />
          </div>
        </div>

        {/* 4th Card: If Super Admin, show website traffic; if Panitia SPMB, show Berkas Waiting Verification */}
        {isPanitia ? (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Menunggu Verifikasi</div>
            <div className="text-4xl font-extrabold text-amber-500">{submittedRegs}</div>
            <div className="mt-3 text-xs text-slate-500 flex items-center justify-between">
              <span>Berkas Drive / Formulir</span>
              <Link to="/admin/registrations" className="font-bold text-amber-600 hover:underline inline-flex items-center gap-0.5">
                Verifikasi &rarr;
              </Link>
            </div>
            <div className="absolute top-4 right-4 text-amber-100 pointer-events-none">
              <Clock size={48} />
            </div>
          </div>
        ) : (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Kunjungan Website</div>
            <div className="text-4xl font-extrabold text-blue-600 flex items-center gap-2">
              <span>{visitorStats.totalVisits}</span>
              <Eye size={22} className="text-blue-400" />
            </div>
            <div className="mt-3 text-xs text-slate-500 flex items-center justify-between">
              <span>{visitorStats.uniqueVisitors} IP Unik</span>
              <Link to="/admin/visitors" className="font-bold text-blue-600 hover:underline inline-flex items-center gap-0.5">
                Analisis &rarr;
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* WIDGET UTAMA: GRAFIK ALUR & TAHAPAN PROSES SPMB */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
                <TrendingUp size={20} />
              </span>
              <h2 className="text-xl font-extrabold text-slate-800">
                Grafik Alur & Proses Tahapan SPMB
              </h2>
            </div>
            <p className="text-xs text-slate-500">
              Distribusi progres calon siswa baru melalui 6 tahapan seleksi penerimaan murid SD IT Andalas Cendekia.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="font-medium text-slate-500">Total Basis Data:</span>
            <span className="bg-slate-100 text-slate-800 font-bold px-3 py-1 rounded-full border border-slate-200 font-mono">
              {totalRegs} Calon Siswa
            </span>
          </div>
        </div>

        {/* Funnel Pipeline Visual Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 my-6">
          {SPMB_STAGES_LIST.map((stage, idx) => {
            const count = getStageCount(stage.key);
            const percent = totalRegs > 0 ? Math.round((count / totalRegs) * 100) : 0;
            const colors = stageColorSchemes[idx % stageColorSchemes.length];

            return (
              <div 
                key={stage.key}
                className={`p-4 rounded-2xl border transition-all hover:shadow-md flex flex-col justify-between ${colors.light}`}
              >
                <div>
                  {/* Step Badge */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="w-7 h-7 rounded-lg bg-white shadow-sm flex items-center justify-center font-extrabold text-xs text-slate-700 border border-slate-200">
                      {stage.stepNumber}
                    </span>
                    <span className={`p-1.5 rounded-lg bg-white/80 ${colors.text} shadow-sm`}>
                      {getStageIcon(stage.iconName)}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="font-extrabold text-sm text-slate-800 mb-1 leading-snug">
                    {stage.shortTitle}
                  </h3>
                  <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                    {stage.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200/60">
                  {/* Count & Percent */}
                  <div className="flex items-baseline justify-between mb-1.5">
                    <span className="text-2xl font-extrabold text-slate-900">{count}</span>
                    <span className="text-[11px] font-bold text-slate-500">{percent}%</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-200/80 rounded-full h-2 overflow-hidden mb-2.5">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${colors.bar}`}
                      style={{ width: `${percent}%` }}
                    ></div>
                  </div>

                  {/* Link Filter Button */}
                  <Link
                    to={`/admin/registrations?stage=${stage.key}`}
                    className="text-[11px] font-bold text-slate-700 hover:text-emerald-700 flex items-center gap-1 transition-colors group"
                  >
                    <span>Filter Pendaftar</span>
                    <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Funnel Progress Flow Diagram */}
        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200">
          <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Sparkles size={14} className="text-amber-500" />
            <span>Alur Kumulatif Penyelenggaraan SPMB</span>
          </div>

          <div className="space-y-3">
            {SPMB_STAGES_LIST.map((stage, idx) => {
              const count = getStageCount(stage.key);
              const percent = totalRegs > 0 ? Math.round((count / totalRegs) * 100) : 0;
              const colors = stageColorSchemes[idx % stageColorSchemes.length];

              return (
                <div key={stage.key} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs">
                  <div className="w-full sm:w-48 shrink-0 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-white border border-slate-300 text-slate-700 flex items-center justify-center font-bold text-[10px]">
                      {stage.stepNumber}
                    </span>
                    <span className="font-bold text-slate-800 truncate">{stage.title}</span>
                  </div>

                  {/* Bar */}
                  <div className="flex-1 bg-white rounded-xl p-1 border border-slate-200 flex items-center">
                    <div 
                      className={`h-4 rounded-lg bg-gradient-to-r ${colors.bg} transition-all duration-700 flex items-center justify-end px-2`}
                      style={{ width: `${Math.max(percent, 8)}%` }}
                    >
                      <span className="text-[10px] font-extrabold text-white">
                        {count} Siswa
                      </span>
                    </div>
                  </div>

                  <div className="w-16 text-right font-mono font-bold text-slate-600 shrink-0">
                    {percent}%
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Website Visitor Tracking (Hanya Ditampilkan untuk Super Admin) */}
      {!isPanitia && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
                <Globe className="text-emerald-600" size={20} />
                <span>Ringkasan Pengunjung Website Terbaru</span>
              </h2>
              <p className="text-slate-500 text-xs mt-0.5">Pencatatan real-time lokasi kota pengunjung dan halaman yang diakses.</p>
            </div>

            <Link 
              to="/admin/visitors"
              className="bg-emerald-800 hover:bg-emerald-900 text-white font-bold px-4 py-2 rounded-xl text-xs transition-colors flex items-center gap-1.5 shrink-0 shadow-sm"
            >
              <span>Buka Analisis Lengkap</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Top Location Card */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Lokasi Kota Terbanyak</span>
              <div className="space-y-2">
                {visitorStats.topCities.slice(0, 3).map((c, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-800 flex items-center gap-1">
                      <MapPin size={12} className="text-purple-600" /> {c.city}
                    </span>
                    <span className="font-mono text-purple-700 font-bold">{c.count} visit ({c.percent}%)</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Pages Card */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Halaman Terpopuler</span>
              <div className="space-y-2">
                {visitorStats.topPages.slice(0, 3).map((p, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs">
                    <span className="font-mono text-emerald-800 font-semibold bg-emerald-100/70 px-1.5 py-0.5 rounded text-[11px]">
                      {p.page}
                    </span>
                    <span className="font-mono text-emerald-700 font-bold">{p.count} views</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Device Distribution */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Kunjungan Hari Ini</span>
              <div className="text-3xl font-extrabold text-amber-600 mb-1">{visitorStats.todayVisits}</div>
              <p className="text-slate-500 text-[11px] font-medium">Kunjungan aktif pada hari ini.</p>
            </div>
          </div>

          {/* Recent Visits Mini Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 uppercase font-bold border-y border-slate-200">
                  <th className="py-2.5 px-4">Waktu</th>
                  <th className="py-2.5 px-4">Halaman</th>
                  <th className="py-2.5 px-4">Lokasi / Kota</th>
                  <th className="py-2.5 px-4">IP Address</th>
                  <th className="py-2.5 px-4">Perangkat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentVisits.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-4 font-medium text-slate-700">{formatDateTime(v.timestamp)}</td>
                    <td className="py-2.5 px-4 font-bold text-emerald-800">{v.pageTitle || v.page}</td>
                    <td className="py-2.5 px-4 text-purple-900 font-semibold">{v.city}, {v.region}</td>
                    <td className="py-2.5 px-4 font-mono text-slate-600">{v.ip}</td>
                    <td className="py-2.5 px-4 text-slate-600">{v.deviceType} ({v.os})</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
