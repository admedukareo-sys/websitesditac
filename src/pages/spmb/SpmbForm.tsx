import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { 
  getRegistrationById, 
  getRegistrationsByUserId, 
  Registration, 
  updateRegistration, 
  createChildRegistration, 
  getSiteSettings,
  syncWithBackend
} from '@/lib/storage';
import { api } from '@/lib/api';
import { compressImage } from '@/lib/imageCompressor';
import { sendRegistrationEmail } from '@/lib/email';
import { Mail, CheckCircle2, ArrowLeft, User as UserIcon, FolderUp, FolderOpen, ExternalLink, Camera, Image, UploadCloud, Trash2, ShieldCheck, Lock, Save, Sparkles } from 'lucide-react';

export default function SpmbForm() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const regIdParam = searchParams.get('id');
  const [formData, setFormData] = useState<Partial<Registration>>({});
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [photoUploadError, setPhotoUploadError] = useState('');
  const [photoPreview, setPhotoPreview] = useState('');
  const settings = getSiteSettings();
  const academicYear = settings.spmbAcademicYear || '2027/2028';
  const defaultDriveFolder = 'https://drive.google.com/drive/folders/1dKcGp0m7HF9esxIqCpmvqWu0WDew7cYO?usp=sharing';

  useEffect(() => {
    if (!user) {
      navigate('/spmb/login');
      return;
    }

    let reg: Registration | null = null;
    if (regIdParam) {
      reg = getRegistrationById(regIdParam);
    }

    if (!reg) {
      if (regIdParam) {
        // ID anak spesifik diminta, tetapi belum ada di lokal. Sinkronkan dari backend atau buat anak baru
        syncWithBackend().then(() => {
          const found = getRegistrationById(regIdParam);
          if (found) {
            setFormData(found);
            setIsReadOnly(!['DRAFT', 'REJECTED'].includes(found.status));
          } else {
            const newChild = createChildRegistration(user.id, { id: Number(regIdParam) || Date.now() });
            setFormData(newChild);
          }
        });
        return;
      }

      // Hanya fallback ke userRegs[0] jika sama sekali TIDAK ADA regIdParam di URL
      const userRegs = getRegistrationsByUserId(user.id);
      if (userRegs.length > 0) {
        reg = userRegs[0];
      } else {
        reg = createChildRegistration(user.id);
      }
    }

    if (reg) {
      setFormData(reg);
      setIsReadOnly(!['DRAFT', 'REJECTED'].includes(reg.status));
    }
  }, [user, navigate, regIdParam]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePhotoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('Ukuran file foto maksimal 10MB. Silakan pilih foto dengan ukuran lebih kecil.');
      return;
    }

    setPhotoUploadError('');
    setIsUploadingPhoto(true);

    // 1. Tampilkan preview instan di UI
    const localPreview = URL.createObjectURL(file);
    setPhotoPreview(localPreview);

    try {
      // 2. Kompresi gambar client-side (resize ke max 1200px, kualitas 82%)
      const compressedFile = await compressImage(file, { maxWidth: 1200, maxHeight: 1200, quality: 0.82 });

      // 3. Upload file fisik ke server hosting backend (/api/uploads/spmb/)
      const res = await api.uploadFile(compressedFile, 'pas_foto');
      if (res.success && res.url) {
        setFormData((prev) => ({
          ...prev,
          fotoUrl: res.url,
        }));
      } else {
        // Fallback: simpan sebagai base64 utuh terkompresi
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(compressedFile);
        });
        setFormData((prev) => ({
          ...prev,
          fotoUrl: base64,
        }));
        if (res.message) {
          console.warn('[Upload Photo] Fallback to compressed base64:', res.message);
        }
      }
    } catch (err: any) {
      console.error('[Upload Photo] Error:', err);
      setPhotoUploadError('Gagal memproses upload foto.');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleRemovePhoto = () => {
    setPhotoPreview('');
    setFormData((prev) => ({
      ...prev,
      fotoUrl: '',
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (isUploadingPhoto) {
      alert('Foto sedang diunggah ke server. Mohon tunggu beberapa detik hingga upload selesai.');
      return;
    }
    setIsSubmitting(true);

    // Pastikan fotoUrl tidak bernilai blob: internal
    const cleanFotoUrl = (formData.fotoUrl && !formData.fotoUrl.startsWith('blob:')) ? formData.fotoUrl : '';

    const updatedReg = updateRegistration(user.id, {
      ...formData,
      fotoUrl: cleanFotoUrl,
      id: formData.id,
      clientId: formData.clientId || (formData.id ? String(formData.id) : undefined),
      documentDriveUrl: formData.documentDriveUrl || defaultDriveFolder,
      status: 'SUBMITTED',
    });

    // Otomatis kirim email bukti pendaftaran
    const childDisplayName = updatedReg.studentName || user.name;
    await sendRegistrationEmail({
      toEmail: user.email,
      toName: childDisplayName,
      subject: `Konfirmasi Formulir Pendaftaran SPMB - #${updatedReg.id} (${childDisplayName})`,
      registrationData: updatedReg,
    });

    setIsSubmitting(false);
    navigate('/spmb/dashboard', { state: { emailSent: true } });
  };

  const handleSaveDraft = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) return;
    if (isUploadingPhoto) {
      alert('Foto sedang diunggah ke server. Mohon tunggu beberapa detik hingga upload selesai.');
      return;
    }
    setIsSubmitting(true);
    updateRegistration(user.id, {
      ...formData,
      id: formData.id,
      clientId: formData.clientId || (formData.id ? String(formData.id) : undefined),
      documentDriveUrl: formData.documentDriveUrl || defaultDriveFolder,
      status: 'DRAFT',
    });
    setIsSubmitting(false);
    navigate('/spmb/dashboard');
  };

  if (!user) return null;

  return (
    <div className="bg-slate-50 min-h-screen py-6 sm:py-10">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="mb-4">
          <Link 
            to="/spmb/dashboard" 
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-emerald-700 bg-white px-3.5 py-2 rounded-xl shadow-xs border border-slate-200 transition-colors"
          >
            <ArrowLeft size={14} />
            <span>Kembali ke Dashboard SPMB (Daftar Calon Siswa)</span>
          </Link>
        </div>

        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-slate-100 p-4 sm:p-8">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 border-b pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-slate-800">Formulir Pendaftaran SPMB</h1>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full">
                  TA {academicYear}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Pendaftaran Calon Siswa #{formData.id || '-'} • Akun Orang Tua/Wali: <strong className="text-slate-700">{user.name}</strong>
              </p>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full font-semibold border border-emerald-200 shrink-0">
              <Mail size={14} />
              <span>{user.email}</span>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Data Diri Calon Siswa */}
            <section>
              <h2 className="text-xl font-semibold text-slate-800 border-b pb-2 mb-4 flex items-center justify-between">
                <span>Data Diri Calon Siswa (Anak)</span>
                <span className="text-xs font-normal text-slate-500">*Data anak yang didaftarkan</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Field Nama Calon Siswa (Anak) */}
                <div className="md:col-span-2 bg-gradient-to-r from-emerald-50/60 to-emerald-50/20 p-4 rounded-xl border border-emerald-200">
                  <label className="block text-sm font-bold text-emerald-950 mb-1">
                    Nama Lengkap Calon Siswa (Anak) <span className="text-red-500">*</span>
                  </label>
                  <p className="text-xs text-slate-600 mb-2">
                    Ketik nama lengkap anak Anda. Nama ini bisa berbeda dari nama akun Google SSO orang tua/wali.
                  </p>
                  <input 
                    type="text" 
                    name="studentName" 
                    value={formData.studentName || ''} 
                    onChange={handleChange} 
                    disabled={isReadOnly} 
                    required 
                    placeholder="Contoh: Muhammad Fatih Al-Faruq"
                    className="block w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg shadow-sm text-sm font-semibold text-slate-900 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-slate-100" 
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">NISN</label>
                  <input type="text" name="nisn" value={formData.nisn || ''} onChange={handleChange} disabled={isReadOnly} required className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-slate-100" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">NIK</label>
                  <input type="text" name="nik" value={formData.nik || ''} onChange={handleChange} disabled={isReadOnly} required className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-slate-100" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Tempat Lahir</label>
                  <input type="text" name="birthPlace" value={formData.birthPlace || ''} onChange={handleChange} disabled={isReadOnly} required className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-slate-100" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Tanggal Lahir</label>
                  <input type="date" name="birthDate" value={formData.birthDate || ''} onChange={handleChange} disabled={isReadOnly} required className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-slate-100" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700">Jenis Kelamin</label>
                  <select name="gender" value={formData.gender || ''} onChange={handleChange} disabled={isReadOnly} required className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-slate-100">
                    <option value="">Pilih...</option>
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700">
                    Alamat Lengkap Tempat Tinggal (Domisili) <span className="text-red-500">*</span>
                  </label>
                  <textarea 
                    name="address" 
                    value={formData.address || ''} 
                    onChange={handleChange} 
                    disabled={isReadOnly} 
                    required 
                    rows={3} 
                    placeholder="Contoh: Jl. Kampung Baru No. 12, RT 02/RW 01, Sikabau, Pulau Punjung"
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-slate-100 text-sm"
                  ></textarea>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700">
                    Jarak Tempat Tinggal (Rumah) ke Sekolah <span className="text-red-500">*</span>
                  </label>
                  <select 
                    name="distanceToSchool" 
                    value={formData.distanceToSchool || ''} 
                    onChange={handleChange} 
                    disabled={isReadOnly} 
                    required 
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-slate-100 bg-white text-sm"
                  >
                    <option value="">-- Pilih Perkiraan Jarak Rumah ke Sekolah --</option>
                    <option value="Kurang dari 1 km">Kurang dari 1 km</option>
                    <option value="1 – 3 km">1 – 3 km</option>
                    <option value="3 – 5 km">3 – 5 km</option>
                    <option value="5 – 10 km">5 – 10 km</option>
                    <option value="Lebih dari 10 km">Lebih dari 10 km</option>
                  </select>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Perkiraan jarak tempuh dari rumah ananda ke kampus SD IT Andalas Cendekia.
                  </p>
                </div>
              </div>
            </section>

            {/* Data Orang Tua */}
            <section>
              <h2 className="text-xl font-semibold text-slate-800 border-b pb-2 mb-4">
                Data Orang Tua / Wali
              </h2>

              <div className="space-y-6">
                {/* Data Ayah */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                    <span>Data Ayah Kandung</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700">
                        Nama Lengkap Ayah <span className="text-red-500">*</span>
                      </label>
                      <input 
                        type="text" 
                        name="fatherName" 
                        value={formData.fatherName || ''} 
                        onChange={handleChange} 
                        disabled={isReadOnly} 
                        required 
                        placeholder="Contoh: Hendra Wijaya"
                        className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-slate-100 bg-white text-sm" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700">
                        Pekerjaan Ayah <span className="text-red-500">*</span>
                      </label>
                      <select 
                        name="fatherOccupation" 
                        value={formData.fatherOccupation || ''} 
                        onChange={handleChange} 
                        disabled={isReadOnly} 
                        required 
                        className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-slate-100 bg-white text-sm"
                      >
                        <option value="">-- Pilih Pekerjaan Ayah --</option>
                        <option value="PNS / ASN">PNS / ASN</option>
                        <option value="TNI / Polri">TNI / Polri</option>
                        <option value="Pegawai BUMN / BUMD">Pegawai BUMN / BUMD</option>
                        <option value="Karyawan Swasta">Karyawan Swasta</option>
                        <option value="Wiraswasta / Wirausaha / Pedagang">Wiraswasta / Wirausaha / Pedagang</option>
                        <option value="Petani / Pekebun / Peternak">Petani / Pekebun / Peternak</option>
                        <option value="Nelayan">Nelayan</option>
                        <option value="Buruh / Pekerja Harian Lepas">Buruh / Pekerja Harian Lepas</option>
                        <option value="Guru / Dosen">Guru / Dosen</option>
                        <option value="Dokter / Tenaga Medis">Dokter / Tenaga Medis</option>
                        <option value="Pensiunan">Pensiunan</option>
                        <option value="Sudah Meninggal">Sudah Meninggal</option>
                        <option value="Tidak Bekerja">Tidak Bekerja</option>
                        <option value="Lainnya">Lainnya</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700">
                        Penghasilan Ayah / Bulan <span className="text-red-500">*</span>
                      </label>
                      <select 
                        name="fatherIncome" 
                        value={formData.fatherIncome || ''} 
                        onChange={handleChange} 
                        disabled={isReadOnly} 
                        required 
                        className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-slate-100 bg-white text-sm"
                      >
                        <option value="">-- Pilih Penghasilan Ayah --</option>
                        <option value="Kurang dari Rp 1.000.000">Kurang dari Rp 1.000.000</option>
                        <option value="Rp 1.000.000 - Rp 2.500.000">Rp 1.000.000 - Rp 2.500.000</option>
                        <option value="Rp 2.500.000 - Rp 5.000.000">Rp 2.500.000 - Rp 5.000.000</option>
                        <option value="Rp 5.000.000 - Rp 10.000.000">Rp 5.000.000 - Rp 10.000.000</option>
                        <option value="Lebih dari Rp 10.000.000">Lebih dari Rp 10.000.000</option>
                        <option value="Tidak Berpenghasilan">Tidak Berpenghasilan</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Data Ibu */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-teal-600"></span>
                    <span>Data Ibu Kandung</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700">
                        Nama Lengkap Ibu <span className="text-red-500">*</span>
                      </label>
                      <input 
                        type="text" 
                        name="motherName" 
                        value={formData.motherName || ''} 
                        onChange={handleChange} 
                        disabled={isReadOnly} 
                        required 
                        placeholder="Contoh: Siti Fatimah"
                        className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-slate-100 bg-white text-sm" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700">
                        Pekerjaan Ibu <span className="text-red-500">*</span>
                      </label>
                      <select 
                        name="motherOccupation" 
                        value={formData.motherOccupation || ''} 
                        onChange={handleChange} 
                        disabled={isReadOnly} 
                        required 
                        className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-slate-100 bg-white text-sm"
                      >
                        <option value="">-- Pilih Pekerjaan Ibu --</option>
                        <option value="Ibu Rumah Tangga (IRT)">Ibu Rumah Tangga (IRT)</option>
                        <option value="PNS / ASN">PNS / ASN</option>
                        <option value="TNI / Polri">TNI / Polri</option>
                        <option value="Pegawai BUMN / BUMD">Pegawai BUMN / BUMD</option>
                        <option value="Karyawan Swasta">Karyawan Swasta</option>
                        <option value="Wiraswasta / Wirausaha / Pedagang">Wiraswasta / Wirausaha / Pedagang</option>
                        <option value="Petani / Pekebun / Peternak">Petani / Pekebun / Peternak</option>
                        <option value="Guru / Dosen">Guru / Dosen</option>
                        <option value="Dokter / Bidan / Perawat / Medis">Dokter / Bidan / Perawat / Medis</option>
                        <option value="Buruh / Pekerja Harian Lepas">Buruh / Pekerja Harian Lepas</option>
                        <option value="Pensiunan">Pensiunan</option>
                        <option value="Sudah Meninggal">Sudah Meninggal</option>
                        <option value="Tidak Bekerja">Tidak Bekerja</option>
                        <option value="Lainnya">Lainnya</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700">
                        Penghasilan Ibu / Bulan <span className="text-red-500">*</span>
                      </label>
                      <select 
                        name="motherIncome" 
                        value={formData.motherIncome || ''} 
                        onChange={handleChange} 
                        disabled={isReadOnly} 
                        required 
                        className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-slate-100 bg-white text-sm"
                      >
                        <option value="">-- Pilih Penghasilan Ibu --</option>
                        <option value="Tidak Berpenghasilan / IRT">Tidak Berpenghasilan / IRT</option>
                        <option value="Kurang dari Rp 1.000.000">Kurang dari Rp 1.000.000</option>
                        <option value="Rp 1.000.000 - Rp 2.500.000">Rp 1.000.000 - Rp 2.500.000</option>
                        <option value="Rp 2.500.000 - Rp 5.000.000">Rp 2.500.000 - Rp 5.000.000</option>
                        <option value="Rp 5.000.000 - Rp 10.000.000">Rp 5.000.000 - Rp 10.000.000</option>
                        <option value="Lebih dari Rp 10.000.000">Lebih dari Rp 10.000.000</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Kontak WhatsApp Orang Tua */}
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    No. WhatsApp Aktif Orang Tua / Wali <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="tel" 
                    name="parentPhone" 
                    value={formData.parentPhone || ''} 
                    onChange={handleChange} 
                    disabled={isReadOnly} 
                    required 
                    placeholder="Contoh: 081234567890"
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-slate-100 bg-white text-sm" 
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Nomor WhatsApp ini digunakan untuk koordinasi tahapan seleksi observasi, wawancara, & pengumuman kelulusan.
                  </p>
                </div>
              </div>
            </section>

            {/* Asal Sekolah */}
            <section>
              <h2 className="text-xl font-semibold text-slate-800 border-b pb-2 mb-4">
                Pendidikan Terakhir / Asal Sekolah
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Nama Asal Sekolah (TK / RA / PAUD) <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    name="previousSchool" 
                    value={formData.previousSchool || ''} 
                    onChange={handleChange} 
                    disabled={isReadOnly} 
                    required 
                    placeholder="Contoh: TK Islam Terpadu Al-Kautsar"
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-slate-100 text-sm" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Alamat Lengkap Sekolah Asal <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    name="schoolAddress" 
                    value={formData.schoolAddress || ''} 
                    onChange={handleChange} 
                    disabled={isReadOnly} 
                    required 
                    placeholder="Contoh: Jl. Lintas Sumatera Km. 2, Pulau Punjung"
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-slate-100 text-sm" 
                  />
                </div>
              </div>
            </section>

            {/* Upload Pas Foto Calon Siswa */}
            <section className="bg-gradient-to-br from-emerald-50/70 to-teal-50/40 p-4 sm:p-6 rounded-2xl border-2 border-emerald-200/80 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-200 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs shrink-0">
                    <Camera size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-800">
                      Upload Foto Calon Siswa (Pas Foto)
                    </h2>
                    <p className="text-xs text-slate-500">
                      Unggah pas foto ananda berbusana muslim/rapi untuk kelengkapan administrasi
                    </p>
                  </div>
                </div>

                <div className="inline-flex items-center gap-1.5 bg-emerald-100/90 text-emerald-800 text-xs font-bold px-3 py-1.5 rounded-xl border border-emerald-200 shrink-0">
                  <Lock size={13} className="text-emerald-700" />
                  <span>Foto Terlindungi & Privat</span>
                </div>
              </div>

              {/* Two Column Upload & Preview Card */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
                {/* Photo Preview Frame */}
                <div className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl border border-emerald-200 shadow-xs text-center">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Preview Pas Foto
                  </span>

                  <div className="w-32 h-40 rounded-xl border-2 border-dashed border-emerald-300 bg-emerald-50/50 flex flex-col items-center justify-center overflow-hidden relative group shadow-inner">
                    {photoPreview || formData.fotoUrl ? (
                      <>
                        <img 
                          src={photoPreview || formData.fotoUrl} 
                          alt="Foto Calon Siswa" 
                          className="w-full h-full object-cover"
                        />
                        {!isReadOnly && (
                          <button
                            type="button"
                            onClick={handleRemovePhoto}
                            className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-red-600 text-white shadow-md hover:bg-red-700 transition-colors"
                            title="Hapus / Ganti Foto"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center p-3 text-emerald-700/60">
                        <UserIcon size={36} className="mb-1 text-emerald-500/70" />
                        <span className="text-[10px] font-bold">Pas Foto 3x4</span>
                        <span className="text-[9px] text-slate-400">Belum diunggah</span>
                      </div>
                    )}
                  </div>

                  {isUploadingPhoto ? (
                    <span className="mt-2 text-[10px] font-bold text-indigo-800 bg-indigo-100 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <UploadCloud size={12} className="animate-bounce" /> Mengunggah...
                    </span>
                  ) : (photoPreview || formData.fotoUrl) ? (
                    <span className="mt-2 text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle2 size={11} /> Foto Siap Tersimpan
                    </span>
                  ) : (
                    <span className="mt-2 text-[10px] text-amber-700 font-semibold bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
                      Wajib Diunggah
                    </span>
                  )}
                </div>

                {/* Upload Controls */}
                <div className="md:col-span-2 space-y-3.5">
                  <div>
                    <label className="block text-sm font-bold text-slate-800 mb-1">
                      Pilih Pas Foto Calon Siswa dari Perangkat Anda
                    </label>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handlePhotoFileChange}
                      disabled={isReadOnly || isUploadingPhoto}
                      className="block w-full text-xs text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-600 file:text-white hover:file:bg-emerald-700 file:cursor-pointer cursor-pointer border border-slate-200 rounded-xl bg-white p-1"
                    />
                    {isUploadingPhoto && (
                      <p className="text-[11px] text-indigo-600 font-semibold mt-1 flex items-center gap-1">
                        <UploadCloud size={13} className="animate-spin" /> Mengompresi dan mengunggah foto ke hosting...
                      </p>
                    )}
                    {photoUploadError && (
                      <p className="text-[11px] text-red-600 font-semibold mt-1">
                        ⚠️ {photoUploadError}
                      </p>
                    )}
                    <p className="text-[11px] text-slate-500 mt-1">
                      Format pas foto: JPG, JPEG, atau PNG (otomatis dikompresi & disimpan aman ke hosting). Dianjurkan pas foto formal berbusana muslim/rapi dengan latar belakang polos.
                    </p>
                  </div>

                  {/* Jaminan Privasi Box */}
                  <div className="p-3.5 bg-white/95 rounded-xl border border-emerald-200/90 space-y-1.5 shadow-2xs">
                    <div className="flex items-center gap-1.5 text-emerald-900 font-bold text-xs">
                      <ShieldCheck size={16} className="text-emerald-700 shrink-0" />
                      <span>Jaminan Privasi & Keamanan Foto Calon Siswa</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Demi menjaga kerahasiaan dan privasi keluarga pendaftar, pas foto yang diunggah tersimpan secara privat di sistem internal panitia SPMB dan <strong>tidak dapat diakses atau dilihat oleh pendaftar lain</strong>. Hanya Panitia SPMB resmi yang memiliki akses verifikasi berkas ini.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Survei Informasi & Alasan Memilih Sekolah */}
            <section className="bg-slate-50/80 p-4 sm:p-5 rounded-2xl border border-slate-200/80 space-y-4">
              <h2 className="text-lg font-bold text-slate-800 border-b pb-2 flex items-center justify-between">
                <span>Survei SPMB & Alasan Memilih Sekolah</span>
                <span className="text-[11px] text-slate-500 font-normal italic">*Survei internal</span>
              </h2>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Darimana Anda mengetahui informasi SPMB SD IT Andalas Cendekia?
                </label>
                <select 
                  name="infoSource" 
                  value={formData.infoSource || ''} 
                  onChange={handleChange} 
                  disabled={isReadOnly} 
                  required
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-xl shadow-sm focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-slate-100 text-sm bg-white"
                >
                  <option value="">-- Pilih Sumber Informasi --</option>
                  <option value="Instagram / Facebook Official">Instagram / Facebook Official</option>
                  <option value="Spanduk / Baliho / Banner">Spanduk / Baliho / Banner Jalan</option>
                  <option value="Brosur / Leaflet Informasi">Brosur / Leaflet Cetak</option>
                  <option value="Rekomendasi Alumni / Teman / Kerabat">Rekomendasi Alumni / Teman / Kerabat</option>
                  <option value="Sosialisasi Sekolah / Kunjungan TK">Sosialisasi Sekolah / Kunjungan TK</option>
                  <option value="Website Official Sekolah">Website Official Sekolah</option>
                  <option value="Lain-lain">Lain-lain</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Apa alasan Anda memilih SD IT Andalas Cendekia?
                </label>
                <textarea 
                  name="reasonToJoin" 
                  value={formData.reasonToJoin || ''} 
                  onChange={handleChange} 
                  disabled={isReadOnly} 
                  required
                  rows={3} 
                  placeholder="Contoh: Memiliki program khas Unggul Berkarakter Al-Qur'an, Multiple Intelligences (PRISE), dan pembentukan karakter Bi-SQ (3HA)..." 
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-xl shadow-sm focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-slate-100 text-sm bg-white"
                ></textarea>
              </div>
            </section>

            {!isReadOnly && (
              <div className="pt-6 border-t border-slate-200 space-y-4">
                {/* Email Notice Box */}
                <div className="flex items-start gap-3 bg-emerald-50 border border-emerald-200 text-emerald-950 p-3.5 sm:p-4 rounded-2xl text-xs sm:text-sm">
                  <Mail size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    Salinan bukti pendaftaran resmi akan otomatis dikirimkan ke email: <strong className="font-bold underline decoration-emerald-400">{user.email}</strong>
                  </p>
                </div>

                {/* Bottom Action Buttons */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
                  <button
                    type="button"
                    onClick={handleSaveDraft}
                    disabled={isSubmitting}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm py-3.5 px-5 rounded-2xl transition-all border border-slate-200 cursor-pointer active:scale-98 disabled:opacity-50 order-2 sm:order-1"
                  >
                    <Save size={16} />
                    <span>Simpan Draft (Lanjutkan Nanti)</span>
                  </button>

                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-extrabold text-sm sm:text-base py-4 px-8 rounded-2xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer order-1 sm:order-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0" />
                        <span>Menyimpan & Mengirim...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={20} className="stroke-[2.5] text-amber-300 shrink-0" />
                        <span>Simpan & Submit Formulir</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
            {isReadOnly && (
              <div className="pt-4 text-center text-amber-800 bg-amber-50 p-4 rounded-2xl border border-amber-200 text-xs sm:text-sm font-semibold">
                Formulir telah dikirim dan tidak dapat diubah (Status: {formData.status})
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
