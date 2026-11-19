import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { 
  getRegistrationById, 
  getRegistrationsByUserId, 
  Registration, 
  updateRegistration, 
  getSiteSettings 
} from '@/lib/storage';
import { api } from '@/lib/api';
import { compressImage } from '@/lib/imageCompressor';
import { 
  ArrowLeft, 
  CheckCircle2, 
  Copy, 
  Check, 
  Upload, 
  CreditCard, 
  Landmark, 
  AlertCircle, 
  FileText, 
  Image as ImageIcon,
  Clock,
  Sparkles
} from 'lucide-react';

export default function SpmbPayment() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const regIdParam = searchParams.get('id');

  const [currentReg, setCurrentReg] = useState<Registration | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [proofPreview, setProofPreview] = useState<string>('');
  const [uploadedProofUrl, setUploadedProofUrl] = useState<string>('');
  const [isUploadingProof, setIsUploadingProof] = useState(false);
  const [proofUploadError, setProofUploadError] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const settings = getSiteSettings();
  const academicYear = settings.spmbAcademicYear || '2027/2028';
  const bankName = settings.bankName || 'Bank Nagari';
  const bankAccNo = settings.bankAccNo || '71050220008996';
  const bankAccName = settings.bankAccName || 'Yayasan Andalas Cendekia';
  const feeAmount = 'Rp 250.000';

  useEffect(() => {
    if (!user) {
      navigate('/spmb/login');
      return;
    }

    let reg: Registration | null = null;
    if (regIdParam) {
      reg = getRegistrationById(Number(regIdParam));
    }

    if (!reg) {
      const userRegs = getRegistrationsByUserId(user.id);
      if (userRegs.length > 0) {
        reg = userRegs[0];
      }
    }

    if (reg) {
      setCurrentReg(reg);
      if (reg.paymentProofUrl) {
        setProofPreview(reg.paymentProofUrl);
      }
    }
  }, [user, navigate, regIdParam]);

  const handleCopyAccount = () => {
    navigator.clipboard.writeText(bankAccNo.replace(/\s+/g, ''));
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('Ukuran file maksimal 10MB. Silakan pilih foto bukti transfer yang lebih kecil.');
      return;
    }

    setProofUploadError('');
    setIsUploadingProof(true);

    // 1. Tampilkan preview instan di layar
    const localUrl = URL.createObjectURL(file);
    setProofPreview(localUrl);

    try {
      // 2. Kompresi gambar client-side (resize ke max 1400px, kualitas 82%)
      const compressedFile = await compressImage(file, { maxWidth: 1400, maxHeight: 1400, quality: 0.82 });

      // 3. Upload file fisik ke server backend (/api/uploads/spmb/)
      const res = await api.uploadFile(compressedFile, 'bukti_transfer');
      if (res.success && res.url) {
        setUploadedProofUrl(res.url);
      } else {
        // Fallback: simpan sebagai base64 terkompresi penuh (bukan blob)
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(compressedFile);
        });
        setUploadedProofUrl(base64);
        if (res.message) {
          console.warn('[Upload Proof] Fallback to compressed base64:', res.message);
        }
      }
    } catch (err: any) {
      console.error('[Upload Proof] Error:', err);
      setProofUploadError('Gagal memproses gambar bukti transfer. Silakan pilih foto lain.');
    } finally {
      setIsUploadingProof(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !currentReg) return;

    if (isUploadingProof) {
      alert('Bukti transfer sedang diunggah ke server. Mohon tunggu beberapa detik hingga upload selesai.');
      return;
    }

    // Pastikan tidak menggunakan URL blob: internal yang tidak bisa dibuka oleh admin
    const finalProofUrl = (uploadedProofUrl && !uploadedProofUrl.startsWith('blob:'))
      ? uploadedProofUrl
      : (currentReg.paymentProofUrl && !currentReg.paymentProofUrl.startsWith('blob:') ? currentReg.paymentProofUrl : '');

    if (!finalProofUrl) {
      alert('File bukti transfer belum selesai diunggah atau belum dipilih. Silakan pilih foto kembali.');
      return;
    }

    setLoading(true);

    updateRegistration(user.id, {
      id: currentReg.id,
      paymentProofUrl: finalProofUrl,
      paymentStatus: 'PENDING',
    });

    setLoading(false);
    setToastMessage('Bukti transfer berhasil diunggah! Panitia SPMB akan segera memverifikasi pembayaran Anda.');
    setTimeout(() => {
      navigate('/spmb/dashboard');
    }, 1800);
  };

  if (!user) return null;

  const childName = currentReg?.studentName || user.name;

  return (
    <div className="bg-slate-50 min-h-screen py-10">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Navigation Back */}
        <div className="mb-4">
          <Link 
            to="/spmb/dashboard" 
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-emerald-700 bg-white px-3.5 py-2 rounded-xl shadow-xs border border-slate-200 transition-colors"
          >
            <ArrowLeft size={14} />
            <span>Kembali ke Dashboard Calon Siswa</span>
          </Link>
        </div>

        {/* Success Toast */}
        {toastMessage && (
          <div className="mb-6 bg-emerald-50 border border-emerald-300 text-emerald-900 p-4 rounded-2xl text-xs font-bold flex items-center gap-2.5 animate-fadeIn shadow-sm">
            <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 sm:p-8 space-y-7">
          
          {/* Header */}
          <div className="border-b border-slate-100 pb-5 text-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/80 text-emerald-800 text-xs font-extrabold mb-2 border border-emerald-200">
              <Sparkles size={13} className="text-emerald-600" />
              <span>SPMB SD IT Andalas Cendekia TA {academicYear}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Pembayaran Biaya Pendaftaran
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Calon Siswa: <strong className="text-slate-800 font-bold">{childName}</strong> • #{currentReg?.id ? `SPMB-${currentReg.id}` : '-'}
            </p>
          </div>

          {/* Nominal Transfer Box */}
          <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-2xl p-6 text-center shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
            <span className="text-emerald-100 text-xs font-bold uppercase tracking-wider block mb-1">
              Total Biaya Pendaftaran yang Harus Ditransfer:
            </span>
            <div className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              {feeAmount}
            </div>
            <p className="text-emerald-100/90 text-xs font-medium mt-1">
              (Dua Ratus Lima Puluh Ribu Rupiah)
            </p>
          </div>

          {/* Bank Destination Card */}
          <div className="bg-gradient-to-r from-emerald-50/80 to-teal-50/50 border-2 border-emerald-200 rounded-2xl p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-emerald-200 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                  <Landmark size={16} />
                </div>
                <div>
                  <h2 className="text-sm font-extrabold text-slate-900">
                    Rekening Resmi Bank Nagari
                  </h2>
                  <p className="text-[11px] text-slate-500">Tujuan transfer pembayaran pendaftaran</p>
                </div>
              </div>
              <span className="text-[11px] font-black uppercase tracking-wider bg-emerald-600 text-white px-2.5 py-0.5 rounded-full">
                {bankName}
              </span>
            </div>

            {/* Account Number with Copy */}
            <div className="bg-white rounded-xl p-4 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Nomor Rekening
                </span>
                <span className="text-xl sm:text-2xl font-mono font-black text-emerald-800 tracking-wider">
                  {bankAccNo}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopyAccount}
                className="inline-flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-xs cursor-pointer active:scale-95 shrink-0"
              >
                {copied ? <Check size={14} className="text-white" /> : <Copy size={14} />}
                <span>{copied ? 'Nomor Tersalin!' : 'Salin No. Rekening'}</span>
              </button>
            </div>

            {/* Account Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-white/80 p-3 rounded-xl border border-emerald-100">
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Atas Nama (a.n.)</span>
                <span className="font-extrabold text-slate-800 text-sm">{bankAccName}</span>
              </div>
              <div className="bg-white/80 p-3 rounded-xl border border-emerald-100">
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Status Pembayaran Calon Siswa</span>
                <span className={`inline-block font-bold text-xs mt-0.5 px-2 py-0.5 rounded-md ${
                  currentReg?.paymentStatus === 'VERIFIED' ? 'bg-emerald-100 text-emerald-800' :
                  currentReg?.paymentStatus === 'PENDING' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                }`}>
                  {currentReg?.paymentStatus === 'VERIFIED' ? '✓ Sudah Diverifikasi (Lunas)' :
                   currentReg?.paymentStatus === 'PENDING' ? '⏳ Menunggu Verifikasi Panitia' : 'Belum Dibayar'}
                </span>
              </div>
            </div>

            {/* Step Instructions */}
            <div className="text-[11px] text-slate-600 space-y-1 pt-2 border-t border-emerald-200">
              <p className="font-bold text-slate-800">Petunjuk Transfer & Pengunggahan Bukti:</p>
              <ol className="list-decimal list-inside space-y-0.5 text-slate-600">
                <li>Transfer sejumlah <strong>Rp 250.000</strong> ke rekening Bank Nagari di atas.</li>
                <li>Tuliskan berita transfer: <em>SPMB - {childName}</em>.</li>
                <li>Simpan struk / bukti transfer (ATM, M-Banking, atau Teller).</li>
                <li>Unggah foto bukti transfer melalui form di bawah ini dan klik <strong>Konfirmasi & Kirim Bukti</strong>.</li>
              </ol>
            </div>
          </div>

          {/* Upload Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-extrabold text-slate-800 mb-2">
                Unggah Bukti Transfer / Pembayaran <span className="text-red-500">*</span>
              </label>

              <div className="border-2 border-dashed border-emerald-300 rounded-2xl p-5 bg-emerald-50/30 text-center hover:bg-emerald-50/50 transition-colors">
                {proofPreview ? (
                  <div className="space-y-3">
                    <div className="max-w-xs mx-auto rounded-xl overflow-hidden shadow-md border border-emerald-200 bg-white">
                      <img 
                        src={proofPreview} 
                        alt="Bukti Transfer" 
                        className="w-full h-auto max-h-72 object-contain"
                      />
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <label className="inline-flex items-center gap-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-lg cursor-pointer transition-colors shadow-2xs">
                        <ImageIcon size={13} />
                        <span>Ganti Foto Bukti</span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={handleFileChange}
                          disabled={isUploadingProof}
                          className="hidden" 
                        />
                      </label>
                    </div>
                    {isUploadingProof ? (
                      <span className="text-[11px] text-indigo-700 font-bold flex items-center justify-center gap-1">
                        <div className="w-3 h-3 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                        Sedang mengompresi & mengunggah ke hosting...
                      </span>
                    ) : (
                      <span className="text-[11px] text-emerald-800 font-bold block">
                        ✓ Foto bukti transfer siap dikirim
                      </span>
                    )}
                    {proofUploadError && (
                      <span className="text-[11px] text-amber-700 font-semibold block">
                        ⚠️ {proofUploadError}
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2 py-4">
                    <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                      <Upload size={22} />
                    </div>
                    <div>
                      <label className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-xs cursor-pointer">
                        Pilih Foto Bukti Transfer
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={handleFileChange}
                          disabled={isUploadingProof}
                          className="hidden" 
                        />
                      </label>
                    </div>
                    {isUploadingProof ? (
                      <p className="text-[11px] text-indigo-600 font-semibold">
                        Mengunggah foto bukti ke server...
                      </p>
                    ) : (
                      <p className="text-[11px] text-slate-500">
                        Format file: JPG, JPEG, atau PNG (otomatis dikompresi & disimpan aman ke hosting)
                      </p>
                    )}
                    {proofUploadError && (
                      <p className="text-[11px] text-red-600 font-semibold">
                        ⚠️ {proofUploadError}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={loading || !proofPreview}
              className="w-full py-3.5 px-6 rounded-2xl font-extrabold text-sm text-white bg-emerald-600 hover:bg-emerald-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Mengunggah Bukti Pembayaran...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={18} />
                  <span>Konfirmasi & Kirim Bukti Transfer</span>
                </>
              )}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}
