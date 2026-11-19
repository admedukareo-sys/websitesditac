import React, { useEffect, useState } from 'react';
import { getRegistrations, saveRegistrations, getUsers, saveUsers, updateRegistrationById, Registration, formatDateTime } from '@/lib/storage';
import { api } from '@/lib/api';
import { compressImage } from '@/lib/imageCompressor';
import { CheckCircle2, Clock, Eye, X, Landmark, FileText, Check, RefreshCw, ExternalLink, AlertCircle, Upload, UploadCloud } from 'lucide-react';

interface CombinedReg extends Registration {
  userName: string;
  userEmail: string;
}

function resolveImageUrl(url?: string | null): string {
  if (!url) return '';
  const trimmed = url.trim();
  if (trimmed.startsWith('data:') || trimmed.startsWith('blob:')) {
    return trimmed;
  }
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  const filename = trimmed.split('/').pop()?.split('?')[0];
  if (filename && (filename.endsWith('.jpg') || filename.endsWith('.jpeg') || filename.endsWith('.png') || filename.endsWith('.webp') || filename.endsWith('.pdf'))) {
    return `/api/index.php?action=view_file&name=${encodeURIComponent(filename)}`;
  }
  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
}

function handleImageError(e: React.SyntheticEvent<HTMLImageElement, Event>, originalUrl: string) {
  const img = e.currentTarget;
  if (!img.dataset.retried) {
    img.dataset.retried = 'true';
    const filename = originalUrl.split('/').pop()?.split('?')[0];
    if (filename && !originalUrl.startsWith('data:') && !originalUrl.startsWith('blob:')) {
      img.src = `/api/index.php?action=view_file&name=${encodeURIComponent(filename)}`;
      return;
    }
  }
}

export default function AdminPayments() {
  const [list, setList] = useState<CombinedReg[]>([]);
  const [selectedProof, setSelectedProof] = useState<{ url: string; name: string; regId: number } | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isUploadingAdminProof, setIsUploadingAdminProof] = useState(false);
  const [adminUploadMsg, setAdminUploadMsg] = useState('');
  const [imgLoadError, setImgLoadError] = useState(false);

  const loadDataFromCache = () => {
    const regs = getRegistrations();
    const users = getUsers();
    const filtered = regs
      .filter((r) => ['PENDING', 'VERIFIED', 'UNPAID'].includes(r.paymentStatus))
      .map((r) => {
        const u = users.find((usr) => Number(usr.id) === Number(r.userId));
        return {
          ...r,
          userName: (r as any).userName || (u ? u.name : 'Unknown'),
          userEmail: (r as any).userEmail || (u ? u.email : '-'),
        };
      })
      .sort((a, b) => {
        const order = { PENDING: 0, UNPAID: 1, VERIFIED: 2 };
        return (order[a.paymentStatus as keyof typeof order] ?? 3) - (order[b.paymentStatus as keyof typeof order] ?? 3);
      });
    setList(filtered);
  };

  const handleRefresh = async () => {
    setIsSyncing(true);
    try {
      const [remoteRegs, remoteUsers] = await Promise.all([
        api.getRegistrations(),
        api.getUsers(),
      ]);

      const usersPool = (remoteUsers && Array.isArray(remoteUsers) && remoteUsers.length > 0)
        ? remoteUsers
        : getUsers();

      if (remoteUsers && Array.isArray(remoteUsers) && remoteUsers.length > 0) {
        saveUsers(remoteUsers);
      }

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
        saveRegistrations(mappedRegs);

        const filtered = remoteRegs
          .filter((r: any) => ['PENDING', 'VERIFIED', 'UNPAID'].includes(r.payment_status || r.paymentStatus))
          .map((r: any) => {
            const u = usersPool.find((usr: any) => Number(usr.id) === Number(r.user_id || r.userId));
            return {
              ...r,
              id: Number(r.id),
              studentName: r.student_name || r.studentName || '',
              userName: r.user_name || r.userName || (u ? u.name : 'Unknown'),
              userEmail: r.user_email || r.userEmail || (u ? u.email : '-'),
              paymentStatus: r.payment_status || r.paymentStatus || 'UNPAID',
              paymentProofUrl: r.payment_proof_url || r.paymentProofUrl || '',
            };
          })
          .sort((a: any, b: any) => {
            const order = { PENDING: 0, UNPAID: 1, VERIFIED: 2 };
            return (order[a.paymentStatus as keyof typeof order] ?? 3) - (order[b.paymentStatus as keyof typeof order] ?? 3);
          });
        setList(filtered);
      } else {
        loadDataFromCache();
      }
    } catch (e) {
      console.warn('Sync failed:', e);
      loadDataFromCache();
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    loadDataFromCache();
    handleRefresh();

    window.addEventListener('sdit_data_synced', handleRefresh);
    return () => {
      window.removeEventListener('sdit_data_synced', handleRefresh);
    };
  }, []);

  const handleVerify = async (id: number) => {
    setIsSyncing(true);
    await api.saveRegistration({ id, paymentStatus: 'VERIFIED' });
    updateRegistrationById(id, { paymentStatus: 'VERIFIED' });
    await handleRefresh();
  };

  const handleAdminProofUpload = async (e: React.ChangeEvent<HTMLInputElement>, targetRegId?: number) => {
    const file = e.target.files?.[0];
    const regId = targetRegId || selectedProof?.regId;
    if (!file || !regId) return;

    setIsUploadingAdminProof(true);
    setAdminUploadMsg('Mengompresi & mengunggah bukti ke hosting...');

    try {
      const compressed = await compressImage(file, { maxWidth: 1400, maxHeight: 1400, quality: 0.85 });
      const res = await api.uploadFile(compressed, 'bukti_transfer');
      let finalUrl = '';
      if (res.success && res.url) {
        finalUrl = res.url;
      } else {
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(compressed);
        });
        finalUrl = base64;
      }

      updateRegistrationById(regId, {
        paymentProofUrl: finalUrl,
        paymentStatus: 'PENDING',
      });
      await api.saveRegistration({
        id: regId,
        paymentProofUrl: finalUrl,
        paymentStatus: 'PENDING',
      });

      setSelectedProof((prev) => prev ? { ...prev, url: finalUrl } : null);
      setImgLoadError(false);
      setAdminUploadMsg('Bukti transfer berhasil diperbarui & tersimpan!');
      loadDataFromCache();
      setTimeout(() => setAdminUploadMsg(''), 4000);
    } catch (err: any) {
      console.error('[Admin Upload] Error:', err);
      setAdminUploadMsg('Gagal mengunggah bukti: ' + (err.message || 'Error'));
    } finally {
      setIsUploadingAdminProof(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800">Verifikasi Pembayaran SPMB</h1>
          <p className="text-xs text-slate-500 mt-1">
            Rekening Resmi: <strong>Bank Nagari 71050220008996</strong> a.n. <strong>Yayasan Andalas Cendekia</strong> (Nominal: Rp 250.000)
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={isSyncing}
          className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-white border border-slate-200 text-slate-700 hover:text-emerald-700 hover:border-emerald-300 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50 self-start sm:self-auto shrink-0"
          title="Tarik data pembayaran terbaru dari database MySQL"
        >
          <RefreshCw size={14} className={isSyncing ? 'animate-spin text-emerald-600' : ''} />
          <span>{isSyncing ? 'Menyinkronkan...' : 'Refresh Data'}</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-600">
              <th className="px-6 py-4">Calon Siswa & Wali</th>
              <th className="px-6 py-4">Nominal & Bank</th>
              <th className="px-6 py-4">Bukti Transfer</th>
              <th className="px-6 py-4">Status Pembayaran</th>
              <th className="px-6 py-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {list.map((reg) => (
              <tr key={reg.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-extrabold text-slate-900 text-sm">
                    {reg.studentName || reg.userName}
                  </div>
                  {reg.studentName && reg.studentName !== reg.userName && (
                    <div className="text-slate-600 font-medium">Wali: {reg.userName}</div>
                  )}
                  <div className="text-slate-400 font-mono text-[11px]">{reg.userEmail}</div>
                  <div className="text-emerald-700 font-mono text-[10px] mt-0.5">#SPMB-{reg.id}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="font-black text-slate-900 text-sm">Rp 250.000</div>
                  <div className="text-slate-600 text-[11px] flex items-center gap-1 mt-0.5">
                    <Landmark size={12} className="text-emerald-700" />
                    <span>Bank Nagari (71050220008996)</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  {reg.paymentProofUrl ? (
                    <div className="flex items-center gap-2">
                      <img 
                        src={resolveImageUrl(reg.paymentProofUrl)} 
                        alt="Bukti Transfer" 
                        onError={(e) => handleImageError(e, reg.paymentProofUrl!)}
                        onClick={() => {
                          setImgLoadError(false);
                          setSelectedProof({ url: reg.paymentProofUrl!, name: reg.studentName || reg.userName, regId: reg.id });
                        }}
                        className="w-12 h-14 object-cover rounded-lg border border-slate-200 shadow-xs cursor-pointer hover:opacity-90 hover:ring-2 hover:ring-emerald-500 transition-all" 
                        title="Klik untuk memperbesar bukti transfer"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImgLoadError(false);
                          setSelectedProof({ url: reg.paymentProofUrl!, name: reg.studentName || reg.userName, regId: reg.id });
                        }}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 cursor-pointer"
                      >
                        <Eye size={12} />
                        <span>Lihat Bukti</span>
                      </button>
                      <label 
                        className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-600 hover:text-indigo-700 bg-slate-100 hover:bg-indigo-50 px-2 py-1 rounded-lg border border-slate-200 cursor-pointer transition-colors" 
                        title="Upload ulang / ganti bukti transfer"
                      >
                        <Upload size={11} />
                        <span>Ganti</span>
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleAdminProofUpload(e, reg.id)} />
                      </label>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400 italic text-[11px]">Belum unggah</span>
                      <label className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-700 hover:text-indigo-800 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 cursor-pointer transition-colors" title="Upload bukti transfer langsung sebagai admin">
                        <Upload size={11} />
                        <span>Upload</span>
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleAdminProofUpload(e, reg.id)} />
                      </label>
                    </div>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                    reg.paymentStatus === 'VERIFIED' ? 'bg-emerald-100 text-emerald-800' : 
                    reg.paymentStatus === 'PENDING' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {reg.paymentStatus === 'VERIFIED' && <CheckCircle2 size={12} className="text-emerald-600" />}
                    {reg.paymentStatus === 'PENDING' && <Clock size={12} className="text-amber-600" />}
                    <span>
                      {reg.paymentStatus === 'VERIFIED' ? 'Sudah Diverifikasi (Lunas)' : 
                       reg.paymentStatus === 'PENDING' ? 'Menunggu Verifikasi' : 'Belum Bayar'}
                    </span>
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  {reg.paymentStatus === 'PENDING' && (
                    <button 
                      onClick={() => handleVerify(reg.id)}
                      className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl transition-all shadow-xs cursor-pointer"
                    >
                      <Check size={13} />
                      <span>Verifikasi Sekarang</span>
                    </button>
                  )}
                  {reg.paymentStatus === 'VERIFIED' && (
                    <span className="text-xs text-emerald-700 font-extrabold flex items-center justify-end gap-1">
                      <CheckCircle2 size={14} /> Terverifikasi Lunas
                    </span>
                  )}
                  {reg.paymentStatus === 'UNPAID' && (
                    <span className="text-slate-400 text-[11px] italic">Menunggu Pembayaran</span>
                  )}
                </td>
              </tr>
            ))}
            {list.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-slate-400">
                  Belum ada data pembayaran calon siswa.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Proof Lightbox Modal */}
      {selectedProof && (() => {
        const isTruncated = (selectedProof.url.startsWith('data:') && selectedProof.url.length < 50000) ||
          selectedProof.url.startsWith('blob:');

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fadeIn">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl relative space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">Bukti Transfer Pembayaran</h3>
                  <p className="text-xs text-slate-500">Calon Siswa: <strong>{selectedProof.name}</strong></p>
                </div>
                <button 
                  onClick={() => setSelectedProof(null)}
                  className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500 cursor-pointer"
                  title="Tutup"
                >
                  <X size={18} />
                </button>
              </div>

              {adminUploadMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-900 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                  <span>{adminUploadMsg}</span>
                </div>
              )}

              {isTruncated && (
                <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-2xl text-amber-900 text-xs flex items-start gap-2.5 shadow-2xs">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-bold text-amber-950">Foto Bukti Terpotong di Database Server Lama</p>
                    <p className="text-[11px] text-amber-800 leading-relaxed">
                      Data gambar bukti pendaftar ini sebelumnya terpotong oleh batasan kolom database MySQL lama sehingga hanya muncul garis hitam tipis / tidak utuh.
                    </p>
                    <p className="text-[11px] text-amber-900 font-semibold">
                      💡 <strong>Solusi Cepat:</strong> Anda dapat langsung mengunggah foto bukti transfer yang jelas (misal dari WhatsApp wali) menggunakan tombol <strong>"Upload Ulang Bukti"</strong> di bawah.
                    </p>
                  </div>
                </div>
              )}

              <div className="max-h-[65vh] overflow-auto rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center p-2 min-h-[180px]">
                {isTruncated || imgLoadError ? (
                  <div className="text-center p-6 text-slate-400">
                    <AlertCircle size={36} className="mx-auto mb-2 text-amber-500/80" />
                    <p className="text-xs font-bold text-slate-600">
                      {isTruncated ? 'Foto Bukti Terpotong di Database Server Lama' : 'Gambar tidak dapat dimuat atau rusak'}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">Silakan klik "Upload Ulang Bukti" di bawah</p>
                  </div>
                ) : (
                  <img 
                    src={resolveImageUrl(selectedProof.url)} 
                    alt="Bukti Transfer Penuh" 
                    onError={(e) => {
                      handleImageError(e, selectedProof.url);
                      if ((e.currentTarget as HTMLImageElement).dataset.retried === 'true') {
                        setTimeout(() => setImgLoadError(true), 1200);
                      }
                    }}
                    className="max-w-full max-h-[60vh] object-contain rounded-lg shadow-2xs"
                  />
                )}
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 border-t pt-3">
                <div className="flex items-center gap-2">
                  <label className="inline-flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl cursor-pointer transition-all shadow-xs disabled:opacity-50">
                    {isUploadingAdminProof ? (
                      <>
                        <UploadCloud size={14} className="animate-spin" />
                        <span>Mengunggah...</span>
                      </>
                    ) : (
                      <>
                        <Upload size={14} />
                        <span>Upload Ulang Bukti</span>
                      </>
                    )}
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleAdminProofUpload} 
                      disabled={isUploadingAdminProof}
                    />
                  </label>

                  {!isTruncated && !imgLoadError && (
                    <a 
                      href={selectedProof.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-200 transition-colors"
                    >
                      <ExternalLink size={13} />
                      <span>Buka di Tab Baru</span>
                    </a>
                  )}
                </div>

                <button
                  onClick={() => setSelectedProof(null)}
                  className="bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs px-5 py-2 rounded-xl transition-colors cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
