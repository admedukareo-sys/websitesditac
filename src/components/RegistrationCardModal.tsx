import React, { useState } from 'react';
import { Registration, User, getSiteSettings } from '@/lib/storage';
import { sendRegistrationEmail } from '@/lib/email';
import { resolveImageUrl } from '@/pages/admin/AdminRegistrations';
import { X, Printer, Mail, CheckCircle2, ShieldCheck } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  registration: Registration;
}

export default function RegistrationCardModal({ isOpen, onClose, user, registration }: Props) {
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailStatus, setEmailStatus] = useState<string | null>(null);
  const settings = getSiteSettings();
  const academicYear = settings.spmbAcademicYear || '2027/2028';

  if (!isOpen) return null;

  const handleSendEmail = async () => {
    setSendingEmail(true);
    setEmailStatus(null);

    const childName = registration.studentName || user.name;
    const res = await sendRegistrationEmail({
      toEmail: user.email,
      toName: childName,
      subject: `Formulir Pendaftaran SPMB SD IT Andalas Cendekia - #${registration.id} (${childName})`,
      registrationData: registration,
    });

    setSendingEmail(false);
    setEmailStatus(res.message);
    setTimeout(() => setEmailStatus(null), 6000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto border border-slate-200">
        
        {/* Modal Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors print:hidden"
        >
          <X size={20} />
        </button>

        {/* Status Toast */}
        {emailStatus && (
          <div className="mb-6 bg-emerald-50 border border-emerald-300 text-emerald-800 p-4 rounded-2xl text-xs font-bold flex items-center gap-2 print:hidden">
            <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
            <span>{emailStatus}</span>
          </div>
        )}

        {/* Printable Card Header */}
        <div className="border-b-2 border-emerald-900 pb-6 mb-6 text-center">
          <img 
            src="/logo.png" 
            alt="Logo Official SD IT Andalas Cendekia" 
            className="h-16 w-auto object-contain mx-auto mb-2"
          />
          <h2 className="text-2xl font-extrabold text-slate-900 uppercase">{settings.schoolName || 'SD IT ANDALAS CENDEKIA'}</h2>
          <p className="text-xs font-bold text-amber-600 italic mb-1">"{settings.tagline || 'Unggul Berkarakter Al-Qur’an'}"</p>
          <p className="text-[11px] text-slate-500">
            {settings.address || 'JL. Kampung Baru No.36, Kel. Sikabau, Kec. Pulau Punjung, Kab. Dharmasraya'} | Telp: {settings.phone || '0811-6696-990'} | NPSN: {settings.npsn || '10310802'}
          </p>
        </div>

        {/* Title */}
        <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-center mb-6">
          <h3 className="text-base font-extrabold text-emerald-900">KARTU BUKTI PENDAFTARAN SPMB {academicYear}</h3>
          <p className="text-xs text-emerald-700 font-mono">No. Registrasi: #SPMB-{registration.id}</p>
        </div>

        {/* Data Summary Grid + Pas Foto */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs mb-8 items-start">
          <div className="sm:col-span-2 grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Nama Lengkap Calon Siswa</span>
                <span className="font-bold text-slate-900 text-sm">{registration.studentName || user.name}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Orang Tua / Wali (Akun)</span>
                <span className="font-semibold text-slate-800">{user.name}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Email Registrasi</span>
                <span className="font-semibold text-slate-800">{user.email}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">NISN</span>
                <span className="font-semibold text-slate-800">{registration.nisn || '-'}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">NIK</span>
                <span className="font-semibold text-slate-800">{registration.nik || '-'}</span>
              </div>
            </div>

            <div className="space-y-2">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Jenjang Pendidikan</span>
                <span className="font-semibold text-slate-800">SD IT Andalas Cendekia</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Asal Sekolah / TK</span>
                <span className="font-semibold text-slate-800">{registration.previousSchool || '-'}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">No. HP Orang Tua</span>
                <span className="font-semibold text-slate-800">{registration.parentPhone || '-'}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Status Berkas</span>
                <span className="font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded text-[11px] inline-block">{registration.status}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Status Pembayaran</span>
                <span className="font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded text-[11px] inline-block">{registration.paymentStatus}</span>
              </div>
            </div>
          </div>

          {/* Pas Foto Calon Siswa (3x4) */}
          <div className="flex flex-col items-center justify-center p-3 rounded-2xl border-2 border-dashed border-emerald-300 bg-emerald-50/40 text-center">
            {registration.fotoUrl ? (
              <img 
                src={resolveImageUrl(registration.fotoUrl)} 
                alt={registration.studentName || 'Pas Foto'} 
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = 'none';
                }}
                className="w-24 h-32 object-cover rounded-xl shadow-xs border border-emerald-200"
              />
            ) : (
              <div className="w-24 h-32 rounded-xl bg-slate-100 border border-slate-200 flex flex-col items-center justify-center text-slate-400 p-2 text-center">
                <span className="text-[10px] font-bold">Pas Foto 3x4</span>
                <span className="text-[9px] text-slate-400 mt-1">Belum Terpasang</span>
              </div>
            )}
            <span className="text-[10px] text-slate-600 font-bold mt-2">Pas Foto Calon Siswa</span>
          </div>
        </div>

        {/* Payment Transfer Notice Box */}
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-4 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-900 block">
                Instruksi Pembayaran Biaya Pendaftaran: Rp 250.000
              </span>
              <div className="text-xs text-slate-800 mt-1">
                Transfer ke <strong>Bank Nagari</strong> No. Rek: <span className="font-mono font-black text-emerald-800 text-sm">71050220008996</span> a.n. <strong>Yayasan Andalas Cendekia</strong>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                *Wajib mengunggah foto / screenshot bukti transfer di menu Pembayaran pada Dashboard SPMB.
              </p>
            </div>
            <div className="shrink-0 sm:text-right">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">Status Bayar</span>
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full inline-block mt-0.5 ${
                registration.paymentStatus === 'VERIFIED' ? 'bg-emerald-100 text-emerald-800' :
                registration.paymentStatus === 'PENDING' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
              }`}>
                {registration.paymentStatus === 'VERIFIED' ? '✓ Lunas & Terverifikasi' :
                 registration.paymentStatus === 'PENDING' ? '⏳ Menunggu Verifikasi' : 'Belum Dibayar'}
              </span>
            </div>
          </div>
        </div>

        {/* Buttons (Hidden when printing) */}
        <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row justify-between gap-3 print:hidden">
          <button
            onClick={handleSendEmail}
            disabled={sendingEmail}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-3 rounded-full transition-colors flex items-center justify-center gap-2 shadow disabled:opacity-50"
          >
            <Mail size={16} />
            <span>{sendingEmail ? 'Mengirim ke Email...' : 'Kirim Formulir ke Email Saya'}</span>
          </button>

          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs px-5 py-3 rounded-full transition-colors flex items-center justify-center gap-2 shadow"
            >
              <Printer size={16} />
              <span>Cetak / Simpan PDF</span>
            </button>
            <button
              onClick={onClose}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-5 py-3 rounded-full transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
