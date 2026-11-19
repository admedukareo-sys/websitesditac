import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { 
  getRegistrations, 
  saveRegistrations,
  getUsers, 
  saveUsers,
  updateRegistrationById, 
  deleteRegistrationById, 
  addRegistrationByAdmin, 
  formatDateTime,
  getSiteSettings,
  saveSiteSettings,
  SiteSettings,
  Registration,
  SpmbStage,
  SPMB_STAGES_LIST,
  savePanitiaUser,
  deleteUserById,
  User as StorageUser,
  syncWithBackend
} from '@/lib/storage';
import { exportSpmbToExcel } from '@/lib/spmbExcelExporter';
import { compressImage } from '@/lib/imageCompressor';
import { 
  Plus, Edit2, Trash2, Search, Filter, X, CheckCircle, Clock, AlertCircle, 
  BarChart3, PieChart, Layers, HelpCircle, FileText, Share2, Eye, Building2, User, Sparkles, Calendar, Settings, ShieldAlert,
  FolderOpen, FolderUp, ExternalLink, Brain, Smile, Users as UsersIcon, Award, CheckCircle2, ShieldCheck, UserCheck, KeyRound, RefreshCw,
  FileSpreadsheet, Printer, Download, Phone, MessageCircle, MapPin, BookOpen, Upload, UploadCloud, Camera
} from 'lucide-react';

interface CombinedReg extends Registration {
  userName: string;
  userEmail: string;
}

const STIFIN_OPTIONS = [
  { value: 'Sensing Introvert (Si)', label: 'Sensing Introvert (Si) - Pengingat Handal & Praktisi Tekun' },
  { value: 'Sensing Extrovert (Se)', label: 'Sensing Extrovert (Se) - Petualang Tangguh & Atletik' },
  { value: 'Thinking Introvert (Ti)', label: 'Thinking Introvert (Ti) - Pakar Logika & Mandiri' },
  { value: 'Thinking Extrovert (Te)', label: 'Thinking Extrovert (Te) - Pemimpin Organisatoris & Manajerial' },
  { value: 'Intuiting Introvert (Ii)', label: 'Intuiting Introvert (Ii) - Konseptor Visioner & Penemu' },
  { value: 'Intuiting Extrovert (Ie)', label: 'Intuiting Extrovert (Ie) - Penggagas Kreatif & Pengusaha' },
  { value: 'Feeling Introvert (Fi)', label: 'Feeling Introvert (Fi) - Pemimpin Karismatik & Berbudi' },
  { value: 'Feeling Extrovert (Fe)', label: 'Feeling Extrovert (Fe) - Komunikator Ulung & Pengayom' },
  { value: 'Insting (In)', label: 'Insting (In) - Serba Bisa & Penolong Spontan' },
];

export function resolveImageUrl(url?: string | null): string {
  if (!url) return '';
  const trimmed = url.trim();
  if (trimmed.startsWith('data:') || trimmed.startsWith('blob:')) {
    return trimmed;
  }
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  // Jika path /uploads/spmb/ atau nama file gambar, arahkan ke endpoint view_file fail-safe
  const filename = trimmed.split('/').pop()?.split('?')[0];
  if (filename && (filename.endsWith('.jpg') || filename.endsWith('.jpeg') || filename.endsWith('.png') || filename.endsWith('.webp') || filename.endsWith('.pdf'))) {
    return `/api/index.php?action=view_file&name=${encodeURIComponent(filename)}`;
  }
  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
}

export function isBrokenOrTruncatedImage(url?: string | null): boolean {
  if (!url) return false;
  const trimmed = url.trim();
  // String base64 yang kurang dari 50.000 karakter pasti terpotong oleh batasan VARCHAR(500) database lama
  if (trimmed.startsWith('data:image/') && trimmed.length < 50000) return true;
  if (trimmed.startsWith('blob:')) return true;
  return false;
}

export function handleImageError(e: React.SyntheticEvent<HTMLImageElement, Event>, originalUrl: string) {
  const img = e.currentTarget;
  if (!img.dataset.retried) {
    img.dataset.retried = 'true';
    const filename = originalUrl.split('/').pop()?.split('?')[0];
    if (filename && !originalUrl.startsWith('data:') && !originalUrl.startsWith('blob:')) {
      img.src = `/api/index.php?action=view_file&name=${encodeURIComponent(filename)}`;
      return;
    }
  }
  // Jika retry juga gagal atau base64 rusak, sembunyikan gambar agar fallback muncul rapi
  img.style.display = 'none';
  const fallback = img.nextElementSibling as HTMLElement;
  if (fallback) fallback.style.display = 'flex';
}

export default function AdminRegistrations() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialStage = (searchParams.get('stage') as SpmbStage) || 'ALL';

  const [list, setList] = useState<CombinedReg[]>([]);
  const [allUsers, setAllUsers] = useState<StorageUser[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [stageFilter, setStageFilter] = useState<string>(initialStage);
  const [activeMainTab, setActiveMainTab] = useState<'LIST' | 'ANALYTICS' | 'PANITIA'>('LIST');

  // Analytics Specific Filters
  const [analyticsSource, setAnalyticsSource] = useState<string>('ALL');
  const [analyticsStatus, setAnalyticsStatus] = useState<string>('ALL');

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingReg, setEditingReg] = useState<CombinedReg | null>(null);
  const [studentDetailReg, setStudentDetailReg] = useState<CombinedReg | null>(null);
  const [stageModalReg, setStageModalReg] = useState<CombinedReg | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<{ url: string; name: string; regId?: number } | null>(null);
  const [isModalPhotoError, setIsModalPhotoError] = useState(false);
  const [uploadingPhotoRegId, setUploadingPhotoRegId] = useState<number | null>(null);
  const [uploadingProofRegId, setUploadingProofRegId] = useState<number | null>(null);
  const [adminMediaMsg, setAdminMediaMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [detailActiveTab, setDetailActiveTab] = useState<'BIODATA' | 'PARENTS' | 'SELECTION' | 'SURVEY'>('BIODATA');
  
  // Export Excel Modal States
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportScope, setExportScope] = useState<'ALL' | 'FILTERED'>('ALL');
  const [exportFormat, setExportFormat] = useState<'DETAIL' | 'RINGKAS'>('DETAIL');

  // Form States for Stage & Selection Modal
  const [editSpmbStage, setEditSpmbStage] = useState<SpmbStage>('PENDAFTARAN');
  const [editStifinResult, setEditStifinResult] = useState('');
  const [editInterviewChildNotes, setEditInterviewChildNotes] = useState('');
  const [editInterviewParentNotes, setEditInterviewParentNotes] = useState('');
  const [editGraduationStatus, setEditGraduationStatus] = useState<'PENDING' | 'PASSED' | 'FAILED'>('PENDING');
  const [editStageNote, setEditStageNote] = useState('');

  // Form States for Panitia User Management (Super Admin)
  const [panitiaName, setPanitiaName] = useState('');
  const [panitiaEmail, setPanitiaEmail] = useState('');
  const [panitiaPassword, setPanitiaPassword] = useState('');

  // Form States for Add
  const [newName, setNewName] = useState('');
  const [newStudentName, setNewStudentName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newSchool, setNewSchool] = useState('');
  const [newNisn, setNewNisn] = useState('');
  const [newInfoSource, setNewInfoSource] = useState('Instagram / Facebook Official');
  const [newReasonToJoin, setNewReasonToJoin] = useState('');
  const [newStatus, setNewStatus] = useState<Registration['status']>('SUBMITTED');
  const [newPaymentStatus, setNewPaymentStatus] = useState<Registration['paymentStatus']>('PENDING');
  const [newDocumentDriveUrl, setNewDocumentDriveUrl] = useState('');
  const [newSpmbStage, setNewSpmbStage] = useState<SpmbStage>('PENDAFTARAN');

  // Form States for Edit
  const [editStudentName, setEditStudentName] = useState('');
  const [editDocumentDriveUrl, setEditDocumentDriveUrl] = useState('');
  const [editStatus, setEditStatus] = useState<Registration['status']>('DRAFT');
  const [editInfoSource, setEditInfoSource] = useState('');
  const [editReasonToJoin, setEditReasonToJoin] = useState('');
  const [editSchool, setEditSchool] = useState('');
  const [editReason, setEditReason] = useState('');

  // SPMB Site Settings Quick Controls
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(getSiteSettings());

  const handleTogglePayment = (hide: boolean) => {
    const updated = {
      ...siteSettings,
      spmbHidePayment: hide,
      spmbStatusText: hide ? 'Daftar Tunggu' : 'Telah Dibuka',
    };
    setSiteSettings(updated);
    saveSiteSettings(updated);
    window.dispatchEvent(new Event('sdit_data_synced'));
  };

  const handleUpdateAcademicYear = (year: string) => {
    const updated = {
      ...siteSettings,
      spmbAcademicYear: year,
    };
    setSiteSettings(updated);
    saveSiteSettings(updated);
    window.dispatchEvent(new Event('sdit_data_synced'));
  };

  const handleUpdateDriveFolder = (url: string) => {
    const updated = {
      ...siteSettings,
      spmbDriveFolderUrl: url,
    };
    setSiteSettings(updated);
    saveSiteSettings(updated);
    window.dispatchEvent(new Event('sdit_data_synced'));
  };

  const [isSyncing, setIsSyncing] = useState(false);
  const [dbStatus, setDbStatus] = useState<{
    connected: boolean;
    dbName: string;
    count: number;
    lastSync: string;
    error?: string;
  }>({
    connected: true,
    dbName: 'andalas4_sdit',
    count: 0,
    lastSync: '',
  });

  const loadDataFromCache = () => {
    setSiteSettings(getSiteSettings());
    const regs = getRegistrations();
    const users = getUsers();
    setAllUsers(users);
    const combined: CombinedReg[] = regs.map((r) => {
      const u = users.find((usr) => Number(usr.id) === Number(r.userId));
      return {
        ...r,
        userName: (r as any).userName || (u ? u.name : (r.studentName || 'Siswa')),
        userEmail: (r as any).userEmail || (u ? u.email : '-'),
      };
    });
    setList(combined);
  };

  const fetchDirectFromDatabase = async () => {
    setIsSyncing(true);
    try {
      // Ambil data langsung dari MySQL database andalas4_sdit secara paralel
      const [remoteRegs, remoteUsers] = await Promise.all([
        api.getRegistrations(),
        api.getUsers(),
      ]);

      setSiteSettings(getSiteSettings());

      const usersPool: StorageUser[] = (remoteUsers && Array.isArray(remoteUsers) && remoteUsers.length > 0)
        ? remoteUsers
        : getUsers();

      if (remoteUsers && Array.isArray(remoteUsers) && remoteUsers.length > 0) {
        setAllUsers(remoteUsers);
        saveUsers(remoteUsers);
      }

      if (remoteRegs && Array.isArray(remoteRegs)) {
        const mappedRegs: CombinedReg[] = remoteRegs.map((r: any) => {
          const u = usersPool.find((usr: any) => Number(usr.id) === Number(r.user_id || r.userId));
          return {
            id: Number(r.id),
            clientId: r.client_id || undefined,
            userId: Number(r.user_id || r.userId),
            studentName: r.student_name || r.studentName || '',
            userName: r.user_name || r.userName || (u ? u.name : (r.student_name || 'Siswa')),
            userEmail: r.user_email || r.userEmail || (u ? u.email : '-'),
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
          };
        });

        setList(mappedRegs);
        saveRegistrations(mappedRegs);
        setDbStatus({
          connected: true,
          dbName: 'andalas4_sdit',
          count: mappedRegs.length,
          lastSync: new Date().toLocaleTimeString('id-ID'),
        });
      } else {
        loadDataFromCache();
      }
    } catch (err: any) {
      console.warn('Gagal memuat langsung dari MySQL, fallback ke cache lokal:', err);
      loadDataFromCache();
      setDbStatus({
        connected: false,
        dbName: 'andalas4_sdit',
        count: getRegistrations().length,
        lastSync: new Date().toLocaleTimeString('id-ID'),
        error: err.message || 'Koneksi database terputus',
      });
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    loadDataFromCache();
    // Tarik data langsung dari MySQL database andalas4_sdit saat komponen dimount
    fetchDirectFromDatabase();

    window.addEventListener('sdit_data_synced', fetchDirectFromDatabase);
    return () => {
      window.removeEventListener('sdit_data_synced', fetchDirectFromDatabase);
    };
  }, []);

  // Sync stage filter with URL params when navigating from dashboard
  useEffect(() => {
    const urlStage = searchParams.get('stage');
    if (urlStage) {
      setStageFilter(urlStage);
    }
  }, [searchParams]);

  const handleUpdateStatus = async (id: number, newStatusVal: Registration['status']) => {
    setIsSyncing(true);
    await api.saveRegistration({ id, status: newStatusVal });
    updateRegistrationById(id, { status: newStatusVal });
    await fetchDirectFromDatabase();
  };

  const handleDelete = async (id: number, name: string) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus data pendaftar "${name}"?`)) {
      setIsSyncing(true);
      await api.deleteRegistration(id);
      deleteRegistrationById(id);
      await fetchDirectFromDatabase();
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSyncing(true);
    const added = addRegistrationByAdmin({
      name: newName,
      studentName: newStudentName || newName,
      email: newEmail,
      previousSchool: newSchool,
      nisn: newNisn,
      infoSource: newInfoSource,
      reasonToJoin: newReasonToJoin,
      documentDriveUrl: newDocumentDriveUrl,
      spmbStage: newSpmbStage,
      status: newStatus,
      paymentStatus: newPaymentStatus,
    });
    await api.saveRegistration({
      ...added,
      isNewChild: true,
      clientId: String(added.id),
    });
    setIsAddModalOpen(false);
    setNewName('');
    setNewStudentName('');
    setNewEmail('');
    setNewSchool('');
    setNewNisn('');
    setNewReasonToJoin('');
    setNewDocumentDriveUrl('');
    setNewSpmbStage('PENDAFTARAN');
    await fetchDirectFromDatabase();
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReg) return;
    setIsSyncing(true);

    const updates = {
      id: editingReg.id,
      studentName: editStudentName,
      documentDriveUrl: editDocumentDriveUrl,
      status: editStatus,
      infoSource: editInfoSource,
      reasonToJoin: editReasonToJoin,
      previousSchool: editSchool,
      rejectionReason: editReason,
    };
    await api.saveRegistration(updates);
    updateRegistrationById(editingReg.id, updates);
    setEditingReg(null);
    await fetchDirectFromDatabase();
  };

  const openEditModal = (reg: CombinedReg) => {
    setEditingReg(reg);
    setEditStudentName(reg.studentName || reg.userName || '');
    setEditDocumentDriveUrl(reg.documentDriveUrl || '');
    setEditStatus(reg.status);
    setEditInfoSource(reg.infoSource || 'Instagram / Facebook Official');
    setEditReasonToJoin(reg.reasonToJoin || '');
    setEditSchool(reg.previousSchool || '');
    setEditReason(reg.rejectionReason || '');
  };

  // Upload Pas Foto Handler (Admin Direct Upload)
  const handleAdminPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>, targetRegId: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPhotoRegId(targetRegId);
    setAdminMediaMsg(null);

    try {
      const compressed = await compressImage(file, { maxWidth: 1200, maxHeight: 1200, quality: 0.82 });
      const res = await api.uploadFile(compressed, 'pas_foto');
      if (!res.success || !res.url) {
        throw new Error(res.message || 'Gagal mengunggah pas foto ke server');
      }

      const newUrl = res.url;
      updateRegistrationById(targetRegId, { fotoUrl: newUrl });
      await api.saveRegistration({ id: targetRegId, fotoUrl: newUrl });

      setList(prev => prev.map(r => r.id === targetRegId ? { ...r, fotoUrl: newUrl } : r));

      if (selectedPhoto && (selectedPhoto.regId === targetRegId || !selectedPhoto.regId)) {
        setSelectedPhoto(prev => prev ? { ...prev, url: newUrl } : null);
        setIsModalPhotoError(false);
      }

      if (studentDetailReg && studentDetailReg.id === targetRegId) {
        setStudentDetailReg(prev => prev ? { ...prev, fotoUrl: newUrl } : null);
      }

      if (editingReg && editingReg.id === targetRegId) {
        setEditingReg(prev => prev ? { ...prev, fotoUrl: newUrl } : null);
      }

      setAdminMediaMsg({ text: 'Pas foto siswa berhasil diunggah & disimpan ke server!', type: 'success' });
      setTimeout(() => setAdminMediaMsg(null), 5000);
    } catch (err: any) {
      console.error('Upload photo error:', err);
      setAdminMediaMsg({ text: err.message || 'Gagal mengunggah foto', type: 'error' });
    } finally {
      setUploadingPhotoRegId(null);
      e.target.value = '';
    }
  };

  // Upload Bukti Bayar Handler (Admin Direct Upload)
  const handleAdminPaymentProofUpload = async (e: React.ChangeEvent<HTMLInputElement>, targetRegId: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingProofRegId(targetRegId);
    setAdminMediaMsg(null);

    try {
      const compressed = await compressImage(file, { maxWidth: 1200, maxHeight: 1200, quality: 0.82 });
      const res = await api.uploadFile(compressed, 'bukti_bayar');
      if (!res.success || !res.url) {
        throw new Error(res.message || 'Gagal mengunggah bukti bayar ke server');
      }

      const newUrl = res.url;
      updateRegistrationById(targetRegId, { paymentProofUrl: newUrl });
      await api.saveRegistration({ id: targetRegId, paymentProofUrl: newUrl });

      setList(prev => prev.map(r => r.id === targetRegId ? { ...r, paymentProofUrl: newUrl } : r));

      if (selectedPhoto && selectedPhoto.regId === targetRegId) {
        setSelectedPhoto(prev => prev ? { ...prev, url: newUrl } : null);
        setIsModalPhotoError(false);
      }

      if (studentDetailReg && studentDetailReg.id === targetRegId) {
        setStudentDetailReg(prev => prev ? { ...prev, paymentProofUrl: newUrl } : null);
      }

      setAdminMediaMsg({ text: 'Bukti transfer pembayaran berhasil diunggah & disimpan ke server!', type: 'success' });
      setTimeout(() => setAdminMediaMsg(null), 5000);
    } catch (err: any) {
      console.error('Upload proof error:', err);
      setAdminMediaMsg({ text: err.message || 'Gagal mengunggah bukti bayar', type: 'error' });
    } finally {
      setUploadingProofRegId(null);
      e.target.value = '';
    }
  };

  // Open Stage & Selection Modal
  const openStageModal = (reg: CombinedReg) => {
    setStageModalReg(reg);
    setEditSpmbStage(reg.spmbStage || 'PENDAFTARAN');
    setEditStifinResult(reg.stifinResult || '');
    setEditInterviewChildNotes(reg.interviewChildNotes || '');
    setEditInterviewParentNotes(reg.interviewParentNotes || '');
    setEditGraduationStatus(reg.graduationStatus || 'PENDING');
    setEditStageNote(reg.stageNote || '');
  };

  const handleStageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stageModalReg) return;
    setIsSyncing(true);

    const extraUpdates: Partial<Registration> & { id: number } = {
      id: stageModalReg.id,
      spmbStage: editSpmbStage,
      stifinResult: editStifinResult,
      interviewChildNotes: editInterviewChildNotes,
      interviewParentNotes: editInterviewParentNotes,
      graduationStatus: editGraduationStatus,
      stageNote: editStageNote,
    };

    if (editGraduationStatus === 'PASSED') {
      extraUpdates.status = 'PASSED';
    } else if (editGraduationStatus === 'FAILED') {
      extraUpdates.status = 'REJECTED';
    }

    await api.saveRegistration(extraUpdates);
    updateRegistrationById(stageModalReg.id, extraUpdates);
    setStageModalReg(null);
    await fetchDirectFromDatabase();
  };

  // Panitia Account Handlers
  const handleSavePanitia = (e: React.FormEvent) => {
    e.preventDefault();
    if (!panitiaEmail.trim() || !panitiaName.trim()) {
      alert('Nama dan Email panitia wajib diisi!');
      return;
    }
    savePanitiaUser({
      name: panitiaName.trim(),
      email: panitiaEmail.trim(),
      password: panitiaPassword.trim() || 'panitia123',
    });
    setPanitiaName('');
    setPanitiaEmail('');
    setPanitiaPassword('');
    fetchDirectFromDatabase();
    alert('Akun Panitia SPMB berhasil disimpan & aktif!');
  };

  const handleDeletePanitia = (id: number, name: string) => {
    if (window.confirm(`Hapus hak akses akun panitia "${name}"?`)) {
      deleteUserById(id);
      fetchDirectFromDatabase();
    }
  };

  // Filter & Search Logic for Table View
  const filteredList = list.filter((reg) => {
    const matchesSearch = 
      (reg.studentName && reg.studentName.toLowerCase().includes(search.toLowerCase())) ||
      reg.userName.toLowerCase().includes(search.toLowerCase()) ||
      reg.userEmail.toLowerCase().includes(search.toLowerCase()) ||
      (reg.nisn && reg.nisn.toLowerCase().includes(search.toLowerCase())) ||
      (reg.previousSchool && reg.previousSchool.toLowerCase().includes(search.toLowerCase())) ||
      (reg.stifinResult && reg.stifinResult.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || reg.status === statusFilter;
    const currentStage = reg.spmbStage || 'PENDAFTARAN';
    const matchesStage = stageFilter === 'ALL' || currentStage === stageFilter;

    return matchesSearch && matchesStatus && matchesStage;
  });

  // Analytics Filter Logic
  const analyticsList = list.filter((reg) => {
    const matchesSource = analyticsSource === 'ALL' || reg.infoSource === analyticsSource;
    const matchesStatus = analyticsStatus === 'ALL' || reg.status === analyticsStatus;
    return matchesSource && matchesStatus;
  });

  // Calculate Analytics Stats
  const totalAnalyticsCount = analyticsList.length;
  const verifiedCount = analyticsList.filter(r => r.status === 'VERIFIED').length;
  const passedCount = analyticsList.filter(r => r.status === 'PASSED').length;
  const pendingCount = analyticsList.filter(r => r.status === 'SUBMITTED').length;
  const rejectedCount = analyticsList.filter(r => r.status === 'REJECTED').length;

  const verifiedPercent = totalAnalyticsCount > 0 ? Math.round(((verifiedCount + passedCount) / totalAnalyticsCount) * 100) : 0;
  const pendingPercent = totalAnalyticsCount > 0 ? Math.round((pendingCount / totalAnalyticsCount) * 100) : 0;

  // Source Distribution Breakdown
  const knownSources = [
    'Instagram / Facebook Official',
    'Spanduk / Baliho / Banner',
    'Brosur / Leaflet Informasi',
    'Rekomendasi Alumni / Teman / Kerabat',
    'Sosialisasi Sekolah / Kunjungan Guru',
    'Website Official Sekolah',
    'Lain-lain',
  ];

  const sourceCounts: Record<string, number> = {};
  knownSources.forEach(s => { sourceCounts[s] = 0; });
  analyticsList.forEach(r => {
    const src = r.infoSource || 'Instagram / Facebook Official';
    sourceCounts[src] = (sourceCounts[src] || 0) + 1;
  });

  const getStatusBadge = (status: Registration['status']) => {
    switch (status) {
      case 'SUBMITTED':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200 inline-flex items-center gap-1"><Clock size={12} /> Menunggu Verifikasi</span>;
      case 'VERIFIED':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200 inline-flex items-center gap-1"><CheckCircle size={12} /> Berkas Diverifikasi</span>;
      case 'PASSED':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 inline-flex items-center gap-1"><CheckCircle size={12} /> Lulus Seleksi</span>;
      case 'REJECTED':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200 inline-flex items-center gap-1"><AlertCircle size={12} /> Ditolak / Revisi</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">Draft</span>;
    }
  };

  const getStageBadge = (stage?: SpmbStage) => {
    const s = stage || 'PENDAFTARAN';
    switch (s) {
      case 'PENDAFTARAN':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
            <FileText size={12} /> 1. Pendaftaran
          </span>
        );
      case 'TES_STIFIN':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
            <Brain size={12} /> 2. Tes STIFIn
          </span>
        );
      case 'WAWANCARA_ANAK':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <Smile size={12} /> 3. Wawancara Anak
          </span>
        );
      case 'WAWANCARA_ORTU':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-cyan-100 text-cyan-800 border border-cyan-200">
            <UsersIcon size={12} /> 4. Wawancara Ortu
          </span>
        );
      case 'PENGUMUMAN':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <Award size={12} /> 5. Pengumuman
          </span>
        );
      case 'DAFTAR_ULANG':
      case 'SELESAI':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-teal-100 text-teal-800 border border-teal-200">
            <CheckCircle2 size={12} /> 6. Daftar Ulang
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
            {s}
          </span>
        );
    }
  };

  // =========================================================================
  // FITUR EKSPOR DATA KE MICROSOFT EXCEL (.XLS)
  // =========================================================================
  const handleOpenExportModal = () => {
    setExportScope(filteredList.length !== list.length ? 'FILTERED' : 'ALL');
    setExportFormat('DETAIL');
    setIsExportModalOpen(true);
  };

  const executeExportExcel = (chosenScope: 'ALL' | 'FILTERED' = exportScope, chosenFormat: 'DETAIL' | 'RINGKAS' = exportFormat) => {
    const dataToExport = chosenScope === 'FILTERED' 
      ? (filteredList.length > 0 ? filteredList : list) 
      : list;

    if (dataToExport.length === 0) {
      alert('Tidak ada data calon siswa yang tersedia untuk diekspor.');
      return;
    }

    exportSpmbToExcel(dataToExport, {
      scope: chosenScope,
      format: chosenFormat,
      activeFilters: {
        stage: stageFilter,
        status: statusFilter,
        search: search.trim() || undefined,
      },
      schoolName: siteSettings.schoolName || 'SD IT ANDALAS CENDEKIA',
      schoolAddress: siteSettings.address || 'Komp. Rukan Andalas Cendekia, Sumatera Barat',
      schoolPhone: siteSettings.phone || '0812-3456-7890',
      academicYear: siteSettings.spmbAcademicYear || '2027/2028',
    });

    setIsExportModalOpen(false);
  };

  const handleExportExcel = () => {
    handleOpenExportModal();
  };

  // =========================================================================
  // FITUR EKSPOR REKAPITULASI KE DOKUMEN PDF (LANDSCAPE CETAK RESMI)
  // =========================================================================
  const handleExportPDF = () => {
    const dataToExport = filteredList.length > 0 ? filteredList : list;
    if (dataToExport.length === 0) {
      alert('Tidak ada data calon siswa untuk dicetak ke PDF.');
      return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Browser memblokir jendela popup. Mohon izinkan popup di browser Anda untuk mencetak PDF.');
      return;
    }

    const schoolName = siteSettings.schoolName || 'SD IT ANDALAS CENDEKIA';
    const schoolAddress = siteSettings.address || 'Komp. Rukan Andalas Cendekia, Sumatera Barat';
    const schoolPhone = siteSettings.phone || '0812-3456-7890';
    const academicYear = siteSettings.spmbAcademicYear || '2027/2028';
    const principalName = siteSettings.principalName || 'Rika Handayani, S.Pd.,Gr.';

    const totalBoys = dataToExport.filter((r) => r.gender !== 'P').length;
    const totalGirls = dataToExport.filter((r) => r.gender === 'P').length;
    const totalVerifiedPayment = dataToExport.filter((r) => r.paymentStatus === 'VERIFIED').length;
    const totalPassed = dataToExport.filter((r) => r.graduationStatus === 'PASSED').length;

    let tableRows = '';
    dataToExport.forEach((r, idx) => {
      tableRows += `
        <tr>
          <td style="text-align: center;">${idx + 1}</td>
          <td style="text-align: center; font-family: monospace;">#${r.id}</td>
          <td><strong>${r.studentName || r.userName}</strong></td>
          <td style="text-align: center;">${r.gender === 'P' ? 'P' : 'L'}</td>
          <td style="text-align: center; font-family: monospace;">${r.nisn || '-'}</td>
          <td>${r.previousSchool || '-'}</td>
          <td>${r.fatherName || r.userName || '-'}</td>
          <td style="font-family: monospace;">${r.parentPhone || '-'}</td>
          <td>${r.spmbStage || 'PENDAFTARAN'}</td>
          <td>${r.stifinResult || '-'}</td>
          <td style="text-align: center;">${r.paymentStatus === 'VERIFIED' ? 'Lunas' : r.paymentStatus === 'PENDING' ? 'Verifikasi' : 'Belum'}</td>
          <td style="text-align: center; font-weight: bold;">${r.graduationStatus === 'PASSED' ? 'LULUS' : r.graduationStatus === 'FAILED' ? 'TIDAK' : 'PENDING'}</td>
        </tr>
      `;
    });

    const html = `
      <!DOCTYPE html>
      <html lang="id">
      <head>
        <meta charset="UTF-8">
        <title>Rekap Pendaftaran SPMB - ${academicYear}</title>
        <style>
          @page { size: A4 landscape; margin: 12mm; }
          body { font-family: 'Arial', sans-serif; color: #1e293b; font-size: 8.5pt; margin: 0; padding: 0; }
          .kop { text-align: center; border-bottom: 2.5px solid #047857; padding-bottom: 6px; margin-bottom: 12px; }
          .kop h1 { font-size: 14pt; margin: 0; color: #047857; text-transform: uppercase; font-weight: bold; }
          .kop h2 { font-size: 11pt; margin: 2px 0; color: #0f172a; font-weight: bold; }
          .kop p { font-size: 8pt; color: #64748b; margin: 0; }
          .doc-header { text-align: center; margin-bottom: 10px; }
          .doc-header h3 { font-size: 11pt; margin: 0; text-transform: uppercase; font-weight: bold; }
          .doc-header p { font-size: 8pt; color: #64748b; margin: 2px 0 0 0; }
          .stats-bar { display: flex; gap: 15px; margin-bottom: 10px; background: #f8fafc; border: 1px solid #e2e8f0; padding: 6px 12px; border-radius: 6px; font-size: 8.5pt; }
          .stats-bar span strong { color: #047857; }
          table.data-table { width: 100%; border-collapse: collapse; font-size: 8pt; }
          table.data-table th { background: #047857; color: #ffffff; border: 1px solid #065f46; padding: 6px 4px; font-weight: bold; text-align: center; }
          table.data-table td { border: 1px solid #cbd5e1; padding: 5px 4px; vertical-align: middle; }
          table.data-table tr:nth-child(even) { background: #f8fafc; }
          .sig-container { display: flex; justify-content: space-between; margin-top: 25px; page-break-inside: avoid; font-size: 9pt; }
          .sig-box { text-align: center; width: 30%; }
          .sig-space { height: 50px; }
          .sig-name { font-weight: bold; text-decoration: underline; }
          @media print {
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="kop">
          <h1>YAYASAN ANDALAS CENDEKIA</h1>
          <h2>${schoolName}</h2>
          <p>${schoolAddress} | Telp: ${schoolPhone} | Website: sdit.andalascendekia.sch.id</p>
        </div>

        <div class="doc-header">
          <h3>DAFTAR REKAPITULASI PENDAFTARAN SISWA BARU (SPMB) T.A ${academicYear}</h3>
          <p>Tanggal Cetak: ${new Date().toLocaleString('id-ID')} | Filter: ${stageFilter !== 'ALL' ? 'Tahap: ' + stageFilter : 'Semua Tahapan'} | Total: ${dataToExport.length} Calon Siswa</p>
        </div>

        <div class="stats-bar">
          <span>Total Pendaftar: <strong>${dataToExport.length}</strong></span>
          <span>Laki-laki (L): <strong>${totalBoys}</strong></span>
          <span>Perempuan (P): <strong>${totalGirls}</strong></span>
          <span>Pembayaran Lunas: <strong>${totalVerifiedPayment}</strong></span>
          <span>Lulus Seleksi: <strong>${totalPassed}</strong></span>
        </div>

        <table class="data-table">
          <thead>
            <tr>
              <th style="width: 25px;">No</th>
              <th style="width: 60px;">ID Reg</th>
              <th>Nama Lengkap Calon Siswa</th>
              <th style="width: 25px;">L/P</th>
              <th style="width: 75px;">NISN</th>
              <th>Asal Sekolah</th>
              <th>Nama Orang Tua / Wali</th>
              <th style="width: 90px;">No. WA / HP</th>
              <th>Tahapan Seleksi</th>
              <th style="width: 100px;">Hasil STIFIn</th>
              <th style="width: 65px;">Bayar</th>
              <th style="width: 65px;">Kelulusan</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>

        <div class="sig-container">
          <div class="sig-box">
            <p>Mengetahui,<br/>Kepala Sekolah,</p>
            <div class="sig-space"></div>
            <p class="sig-name">${principalName}</p>
          </div>
          <div class="sig-box">
            <p>Padang, ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}<br/>Ketua Panitia SPMB,</p>
            <div class="sig-space"></div>
            <p class="sig-name">( Panitia Penerimaan Siswa Baru )</p>
          </div>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  };

  // =========================================================================
  // FITUR CETAK BIODATA LENGKAP CALON SISWA TUNGGAL KE DOKUMEN PDF
  // =========================================================================
  const printStudentBiodata = (reg: CombinedReg) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Browser memblokir jendela popup. Mohon izinkan popup di browser Anda untuk mencetak biodata siswa.');
      return;
    }

    const schoolName = siteSettings.schoolName || 'SD IT ANDALAS CENDEKIA';
    const schoolAddress = siteSettings.address || 'Komp. Rukan Andalas Cendekia, Sumatera Barat';
    const schoolPhone = siteSettings.phone || '0812-3456-7890';
    const academicYear = siteSettings.spmbAcademicYear || '2027/2028';

    const html = `
      <!DOCTYPE html>
      <html lang="id">
      <head>
        <meta charset="UTF-8">
        <title>Biodata Pendaftaran - ${reg.studentName || reg.userName}</title>
        <style>
          @page { size: A4 portrait; margin: 15mm; }
          body { font-family: 'Arial', sans-serif; color: #1e293b; line-height: 1.4; font-size: 10.5pt; margin: 0; padding: 0; }
          .kop { display: flex; align-items: center; justify-content: center; border-bottom: 3px double #047857; padding-bottom: 8px; margin-bottom: 12px; }
          .kop-text { text-align: center; }
          .kop-title { font-size: 14pt; font-weight: bold; color: #047857; margin: 0; text-transform: uppercase; }
          .kop-sub { font-size: 8.5pt; color: #475569; margin: 2px 0 0 0; }
          .doc-title { text-align: center; font-size: 12pt; font-weight: bold; text-transform: uppercase; margin: 10px 0; text-decoration: underline; color: #0f172a; }
          .section-title { font-size: 10pt; font-weight: bold; background: #f1f5f9; padding: 4px 8px; border-left: 4px solid #047857; margin: 10px 0 6px 0; }
          table.biodata { width: 100%; border-collapse: collapse; margin-bottom: 6px; font-size: 9.5pt; }
          table.biodata td { padding: 4px 6px; vertical-align: top; }
          table.biodata td.label { width: 28%; color: #475569; font-weight: bold; }
          table.biodata td.colon { width: 2%; }
          table.biodata td.val { width: 70%; font-weight: 500; }
          .photo-box { width: 95px; height: 120px; border: 1px solid #cbd5e1; display: flex; align-items: center; justify-content: center; text-align: center; font-size: 9pt; color: #94a3b8; float: right; margin-left: 15px; margin-bottom: 10px; background: #f8fafc; }
          .photo-box img { width: 100%; height: 100%; object-fit: cover; }
          .sig-container { display: flex; justify-content: space-between; margin-top: 25px; page-break-inside: avoid; }
          .sig-box { text-align: center; width: 40%; font-size: 9.5pt; }
          .sig-space { height: 55px; }
          .sig-name { font-weight: bold; text-decoration: underline; }
          @media print {
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="kop">
          <div class="kop-text">
            <h1 class="kop-title">YAYASAN ANDALAS CENDEKIA</h1>
            <h2 class="kop-title" style="font-size: 12.5pt;">${schoolName}</h2>
            <p class="kop-sub">${schoolAddress} | Telp: ${schoolPhone} | Website: sdit.andalascendekia.sch.id</p>
          </div>
        </div>

        <div class="doc-title">FORMULIR BIODATA PENDAFTARAN SISWA BARU (SPMB) T.A ${academicYear}</div>

        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; font-size: 9pt; background: #ecfdf5; padding: 6px 10px; border-radius: 6px; border: 1px solid #a7f3d0;">
          <span><strong>No. Registrasi:</strong> #${reg.id}</span>
          <span><strong>Waktu Daftar:</strong> ${formatDateTime(reg.createdAt)}</span>
          <span><strong>Status:</strong> ${reg.status} (${reg.graduationStatus === 'PASSED' ? 'LULUS SELEKSI' : reg.graduationStatus === 'FAILED' ? 'TIDAK LULUS' : 'PENDING'})</span>
        </div>

        <div class="photo-box">
          ${reg.fotoUrl && !reg.fotoUrl.startsWith('blob:') ? `<img src="${reg.fotoUrl}" alt="Pas Foto" />` : 'Pas Foto<br/>3 x 4 cm'}
        </div>

        <div class="section-title">A. DATA PRIBADI CALON SISWA</div>
        <table class="biodata" style="width: calc(100% - 115px);">
          <tr><td class="label">Nama Lengkap Siswa</td><td class="colon">:</td><td class="val"><strong>${reg.studentName || reg.userName}</strong></td></tr>
          <tr><td class="label">NISN</td><td class="colon">:</td><td class="val">${reg.nisn || '-'}</td></tr>
          <tr><td class="label">NIK Siswa</td><td class="colon">:</td><td class="val">${reg.nik || '-'}</td></tr>
          <tr><td class="label">Tempat, Tanggal Lahir</td><td class="colon">:</td><td class="val">${reg.birthPlace || '-'}, ${reg.birthDate || '-'}</td></tr>
          <tr><td class="label">Jenis Kelamin</td><td class="colon">:</td><td class="val">${reg.gender === 'P' ? 'Perempuan (P)' : 'Laki-laki (L)'}</td></tr>
          <tr><td class="label">Asal Sekolah TK/PAUD</td><td class="colon">:</td><td class="val">${reg.previousSchool || '-'}</td></tr>
          <tr><td class="label">Pilihan Program</td><td class="colon">:</td><td class="val">${reg.programType || 'BOARDING'}</td></tr>
          <tr><td class="label">Ukuran Seragam</td><td class="colon">:</td><td class="val">${reg.uniformSize || '-'}</td></tr>
          <tr><td class="label">Alamat Rumah</td><td class="colon">:</td><td class="val">${reg.address || '-'}</td></tr>
        </table>

        <div style="clear: both;"></div>

        <div class="section-title">B. DATA ORANG TUA / WALI</div>
        <table class="biodata">
          <tr><td class="label">Nama Ayah Kandung</td><td class="colon">:</td><td class="val">${reg.fatherName || '-'}</td></tr>
          <tr><td class="label">Nama Ibu Kandung</td><td class="colon">:</td><td class="val">${reg.motherName || '-'}</td></tr>
          <tr><td class="label">No. Telepon / WhatsApp</td><td class="colon">:</td><td class="val"><strong>${reg.parentPhone || '-'}</strong></td></tr>
          <tr><td class="label">Akun Email Wali</td><td class="colon">:</td><td class="val">${reg.userEmail || '-'}</td></tr>
        </table>

        <div class="section-title">C. HASIL OBSERVASI, SELEKSI & PEMBAYARAN</div>
        <table class="biodata">
          <tr><td class="label">Tahapan SPMB Saat Ini</td><td class="colon">:</td><td class="val"><strong>${reg.spmbStage || 'PENDAFTARAN'}</strong></td></tr>
          <tr><td class="label">Hasil Tes STIFIn</td><td class="colon">:</td><td class="val"><strong>${reg.stifinResult || 'Belum diinput'}</strong></td></tr>
          <tr><td class="label">Nilai Tes Akademik</td><td class="colon">:</td><td class="val">${reg.testScore !== undefined && reg.testScore !== null ? reg.testScore : '-'}</td></tr>
          <tr><td class="label">Status Biaya Pendaftaran</td><td class="colon">:</td><td class="val">${reg.paymentStatus === 'VERIFIED' ? 'LUNAS (Terverifikasi)' : reg.paymentStatus === 'PENDING' ? 'Menunggu Verifikasi Bukti' : 'Belum Bayar'}</td></tr>
          <tr><td class="label">Keputusan Kelulusan</td><td class="colon">:</td><td class="val"><strong>${reg.graduationStatus === 'PASSED' ? 'DITERIMA (LULUS SELEKSI)' : reg.graduationStatus === 'FAILED' ? 'TIDAK DITERIMA' : 'DALAM PROSES SELEKSI'}</strong></td></tr>
          <tr><td class="label">Catatan Wawancara Anak</td><td class="colon">:</td><td class="val">${reg.interviewChildNotes || '-'}</td></tr>
          <tr><td class="label">Catatan Wawancara Ortu</td><td class="colon">:</td><td class="val">${reg.interviewParentNotes || '-'}</td></tr>
        </table>

        <div class="sig-container">
          <div class="sig-box">
            <p>Orang Tua / Wali Calon Siswa,</p>
            <div class="sig-space"></div>
            <p class="sig-name">( ${reg.fatherName || reg.userName || '...............................'} )</p>
          </div>
          <div class="sig-box">
            <p>Padang, ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}<br/>Panitia SPMB SD IT Andalas Cendekia,</p>
            <div class="sig-space"></div>
            <p class="sig-name">( Panitia Penerimaan Siswa Baru )</p>
          </div>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  };

  return (
    <div>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex flex-wrap items-center gap-2.5 mb-1">
            <h1 className="text-3xl font-extrabold text-slate-800">Manajemen & Analytics SPMB</h1>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-2xs ${
              dbStatus.connected 
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
                : 'bg-amber-50 text-amber-800 border-amber-300'
            }`}>
              <span className={`w-2 h-2 rounded-full ${dbStatus.connected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
              <span>MySQL: <strong>{dbStatus.dbName}</strong> ({list.length} Calon Siswa)</span>
            </span>
          </div>
          <p className="text-slate-500 text-xs">
            Data tersinkronisasi langsung dengan database server MySQL <strong>{dbStatus.dbName}</strong>
            {dbStatus.lastSync ? ` (Sinkron terakhir: ${dbStatus.lastSync})` : ''}.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={handleOpenExportModal}
            className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-3.5 py-2.5 rounded-xl text-xs transition-all shadow-sm flex items-center gap-1.5 cursor-pointer hover:scale-[1.02] active:scale-95"
            title="Export data pendaftar SPMB ke file Microsoft Excel (.xls) lengkap & detail"
          >
            <FileSpreadsheet size={15} />
            <span>Export Excel</span>
          </button>

          <button
            onClick={fetchDirectFromDatabase}
            disabled={isSyncing}
            className="bg-white hover:bg-slate-50 text-slate-700 font-bold px-3.5 py-2.5 rounded-xl text-xs transition-all border border-slate-200 shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Tarik data pendaftar terbaru langsung dari database MySQL andalas4_sdit"
          >
            <RefreshCw size={14} className={isSyncing ? 'animate-spin text-emerald-600' : 'text-slate-500'} />
            <span>{isSyncing ? 'Mengambil dari MySQL...' : 'Refresh Data MySQL'}</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-all shadow flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <Plus size={16} /> Tambah Data Pendaftar
          </button>
        </div>
      </div>

      {/* Quick SPMB Settings Control Bar */}
      <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 rounded-2xl p-4 sm:p-5 text-white shadow-lg mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border border-amber-400/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center shrink-0 shadow-inner">
            <Calendar size={22} className="text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-extrabold text-sm uppercase tracking-wide">Pengaturan SPMB Aktif</span>
              <span className="bg-white/20 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full backdrop-blur">
                TA {siteSettings.spmbAcademicYear || '2027/2028'}
              </span>
              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${siteSettings.spmbHidePayment ? 'bg-amber-950/80 text-amber-200 border border-amber-400/30' : 'bg-emerald-950/80 text-emerald-200 border border-emerald-400/30'}`}>
                {siteSettings.spmbHidePayment ? 'Daftar Tunggu (Pembayaran Disembunyikan)' : 'Mode Normal (Pembayaran Aktif)'}
              </span>
            </div>
            <p className="text-xs text-amber-100 mt-0.5">
              {siteSettings.spmbHidePayment 
                ? 'Fitur pembayaran disembunyikan bagi calon siswa. Pendaftaran masuk kuota Daftar Tunggu.'
                : 'Fitur pembayaran dibuka secara penuh bagi calon siswa.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <div className="flex items-center bg-white/15 backdrop-blur rounded-xl p-1 border border-white/25">
            <span className="text-[11px] font-bold px-2 text-amber-100">TA:</span>
            <input 
              type="text" 
              value={siteSettings.spmbAcademicYear || '2027/2028'} 
              onChange={(e) => handleUpdateAcademicYear(e.target.value)}
              className="w-24 bg-white text-slate-900 text-xs font-bold px-2.5 py-1 rounded-lg outline-none focus:ring-2 focus:ring-amber-300"
              title="Ketik untuk mengubah Tahun Ajaran SPMB"
            />
          </div>

          {siteSettings.spmbDriveFolderUrl ? (
            <div className="flex items-center gap-1">
              <a
                href={siteSettings.spmbDriveFolderUrl}
                target="_blank"
                rel="noreferrer"
                className="bg-white/20 hover:bg-white text-white hover:text-emerald-950 font-bold text-xs px-3.5 py-2 rounded-xl transition-all shadow-md flex items-center gap-1.5 border border-white/30 backdrop-blur"
                title="Buka Folder Google Drive Tempat Berkas Calon Siswa Disimpan"
              >
                <FolderOpen size={14} />
                <span>Folder Drive Berkas ↗</span>
              </a>
              <button
                onClick={() => {
                  const url = prompt('Ubah Link Folder Google Drive SPMB:', siteSettings.spmbDriveFolderUrl || '');
                  if (url !== null) handleUpdateDriveFolder(url.trim());
                }}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/25 text-white transition-colors"
                title="Edit URL Folder Google Drive"
              >
                <Edit2 size={13} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                const url = prompt('Masukkan Link Folder Google Drive untuk upload berkas calon siswa:', 'https://drive.google.com/drive/folders/...');
                if (url) handleUpdateDriveFolder(url.trim());
              }}
              className="bg-white/20 hover:bg-white text-white hover:text-emerald-950 font-bold text-xs px-3.5 py-2 rounded-xl transition-all shadow-md flex items-center gap-1.5 border border-white/30 backdrop-blur"
              title="Atur Link Folder Google Drive SPMB"
            >
              <FolderUp size={14} />
              <span>+ Set Folder Drive</span>
            </button>
          )}

          <button
            onClick={() => handleTogglePayment(!siteSettings.spmbHidePayment)}
            className={`font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-md flex items-center gap-1.5 ${
              siteSettings.spmbHidePayment
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'bg-amber-950 hover:bg-black text-amber-100'
            }`}
          >
            <Settings size={14} />
            <span>{siteSettings.spmbHidePayment ? 'Aktifkan Pembayaran' : 'Sembunyikan Pembayaran (Daftar Tunggu)'}</span>
          </button>
        </div>
      </div>

      {/* Navigation Main Tabs */}
      <div className="flex items-center gap-2 mb-6 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveMainTab('LIST')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeMainTab === 'LIST'
              ? 'bg-emerald-800 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <FileText size={16} />
          <span>Tabel Data Pendaftar</span>
          <span className="ml-1 bg-emerald-950/40 text-amber-300 text-[10px] px-2 py-0.5 rounded-full font-mono">
            {list.length}
          </span>
        </button>

        <button
          onClick={() => setActiveMainTab('ANALYTICS')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeMainTab === 'ANALYTICS'
              ? 'bg-emerald-800 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <BarChart3 size={16} className="text-amber-400" />
          <span>Grafik & Analisis Survei SPMB</span>
          <span className="ml-1 bg-amber-400 text-amber-950 text-[10px] px-2 py-0.5 rounded-full font-bold">
            Analytics
          </span>
        </button>

        {user?.role === 'ADMIN' && (
          <button
            onClick={() => setActiveMainTab('PANITIA')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeMainTab === 'PANITIA'
                ? 'bg-emerald-800 text-white shadow-md'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <ShieldCheck size={16} className="text-amber-400" />
            <span>Kelola Akun Panitia SPMB</span>
            <span className="ml-1 bg-amber-400 text-amber-950 text-[10px] px-2 py-0.5 rounded-full font-bold">
              {allUsers.filter((u) => u.role === 'PANITIA_SPMB').length}
            </span>
          </button>
        )}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: TABEL DATA PENDAFTAR */}
      {/* ========================================================================= */}
      {activeMainTab === 'LIST' && (
        <>
          {/* Stage Filter Stepper Bar */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Brain size={15} className="text-purple-600" /> Filter Berdasarkan Tahapan Seleksi Calon Siswa:
              </span>
              {stageFilter !== 'ALL' && (
                <button
                  onClick={() => {
                    setStageFilter('ALL');
                    setSearchParams({});
                  }}
                  className="text-[11px] font-bold text-emerald-700 hover:underline cursor-pointer self-start sm:self-auto"
                >
                  ✕ Reset Filter Tahapan
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  setStageFilter('ALL');
                  setSearchParams({});
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  stageFilter === 'ALL'
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Semua Tahap ({list.length})
              </button>

              {SPMB_STAGES_LIST.map((stg) => {
                const count = list.filter((r) => (r.spmbStage || 'PENDAFTARAN') === stg.key).length;
                const isSelected = stageFilter === stg.key;

                return (
                  <button
                    key={stg.key}
                    onClick={() => {
                      setStageFilter(stg.key);
                      setSearchParams({ stage: stg.key });
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-emerald-700 text-white shadow-sm ring-2 ring-emerald-400/50'
                        : 'bg-slate-50 text-slate-700 hover:bg-emerald-50 border border-slate-200'
                    }`}
                  >
                    <span>{stg.stepNumber}. {stg.shortTitle}</span>
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                      isSelected ? 'bg-white text-emerald-900 font-extrabold' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Filter & Search Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
            {/* Search */}
            <div className="relative w-full md:w-80">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Cari nama siswa/wali, STIFIn, sekolah..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs border border-slate-300 rounded-xl focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              />
            </div>

            {/* Filter Group */}
            <div className="flex flex-wrap gap-2 w-full md:w-auto items-center">
              {/* Status Filter Tabs */}
              {[
                { label: 'Semua Status Berkas', value: 'ALL' },
                { label: 'Daftar Tunggu', value: 'SUBMITTED' },
                { label: 'Berkas Lulus', value: 'VERIFIED' },
                { label: 'Lulus Seleksi', value: 'PASSED' },
                { label: 'Ditolak', value: 'REJECTED' },
              ].map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setStatusFilter(tab.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    statusFilter === tab.value 
                      ? 'bg-emerald-600 text-white' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Export & Rekap Action Toolbar */}
          <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-white p-3.5 rounded-2xl border border-emerald-200 shadow-2xs mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-700">
              <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                <UsersIcon size={16} className="text-emerald-700" />
                <span>Menampilkan <strong>{filteredList.length}</strong> dari <strong>{list.length}</strong> Calon Siswa</span>
              </span>
              {search && (
                <span className="bg-white px-2 py-0.5 rounded-full border border-slate-200 text-[11px] text-slate-600">
                  Cari: "<strong>{search}</strong>"
                </span>
              )}
              {stageFilter !== 'ALL' && (
                <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold text-[11px]">
                  Tahap: {stageFilter}
                </span>
              )}
              {statusFilter !== 'ALL' && (
                <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold text-[11px]">
                  Status: {statusFilter}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleExportExcel}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
                title="Download data calon siswa yang terfilter ke Microsoft Excel (.xls)"
              >
                <FileSpreadsheet size={15} />
                <span>Export Excel</span>
              </button>

              <button
                type="button"
                onClick={handleExportPDF}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-900 text-white shadow-xs transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
                title="Cetak atau simpan rekap data calon siswa ke dokumen PDF"
              >
                <Printer size={15} />
                <span>Export PDF / Cetak</span>
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase">
                    <th className="px-5 py-4">Nama & Wali Siswa</th>
                    <th className="px-5 py-4">Waktu & Asal Sekolah</th>
                    <th className="px-5 py-4">Tahapan & Hasil Seleksi</th>
                    <th className="px-5 py-4">Berkas Drive & Status</th>
                    <th className="px-5 py-4">Pembayaran</th>
                    <th className="px-5 py-4 text-center">Kelola Seleksi & Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredList.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-10 text-center text-slate-400">
                        Tidak ada data pendaftar yang cocok dengan pencarian / filter tahapan.
                      </td>
                    </tr>
                  ) : (
                    filteredList.map((reg) => (
                      <tr key={reg.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            {reg.fotoUrl && !isBrokenOrTruncatedImage(reg.fotoUrl) ? (
                              <img 
                                src={resolveImageUrl(reg.fotoUrl)} 
                                alt={reg.studentName || 'Pas Foto'} 
                                onError={(e) => handleImageError(e, reg.fotoUrl!)}
                                onClick={() => {
                                  setIsModalPhotoError(false);
                                  setSelectedPhoto({ url: reg.fotoUrl!, name: reg.studentName || reg.userName, regId: reg.id });
                                }}
                                className="w-10 h-12 object-cover rounded-lg border border-slate-200 shadow-xs shrink-0 cursor-pointer hover:opacity-85 hover:ring-2 hover:ring-emerald-500 transition-all"
                                title="Klik untuk melihat / mengganti pas foto"
                              />
                            ) : null}
                            <div 
                              style={{ display: reg.fotoUrl && !isBrokenOrTruncatedImage(reg.fotoUrl) ? 'none' : 'flex' }}
                              onClick={() => {
                                if (reg.fotoUrl) {
                                  setIsModalPhotoError(false);
                                  setSelectedPhoto({ url: reg.fotoUrl!, name: reg.studentName || reg.userName, regId: reg.id });
                                }
                              }}
                              className={`w-10 h-12 rounded-lg border flex flex-col items-center justify-center font-bold text-xs shrink-0 relative transition-all ${
                                isBrokenOrTruncatedImage(reg.fotoUrl)
                                  ? 'bg-amber-50 border-amber-300 text-amber-700 cursor-pointer hover:bg-amber-100 hover:ring-2 hover:ring-amber-400'
                                  : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                              }`}
                              title={isBrokenOrTruncatedImage(reg.fotoUrl) ? 'Foto terpotong di database server lama. Klik untuk lihat atau perbaiki' : 'Belum ada foto siswa'}
                            >
                              <span>{(reg.studentName || reg.userName || 'C')[0].toUpperCase()}</span>
                              {isBrokenOrTruncatedImage(reg.fotoUrl) && (
                                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-500 text-white rounded-full flex items-center justify-center text-[9px] font-extrabold shadow-xs" title="Foto lama terpotong">!</span>
                              )}
                            </div>
                            <div>
                              <div 
                                onClick={() => { setDetailActiveTab('BIODATA'); setStudentDetailReg(reg); }}
                                className="font-bold text-slate-900 text-sm hover:text-emerald-700 cursor-pointer transition-colors flex items-center gap-1 group"
                                title="Klik untuk melihat detail lengkap calon siswa"
                              >
                                <span>{reg.studentName || reg.userName}</span>
                                <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity text-emerald-600 shrink-0" />
                              </div>
                              {reg.studentName && reg.studentName !== reg.userName && (
                                <div className="text-slate-600 font-medium text-[11px]">Wali: {reg.userName}</div>
                              )}
                              <div className="text-slate-400 text-[10px]">{reg.userEmail}</div>
                              {reg.nisn && (
                                <div className="text-slate-500 font-mono text-[10px] mt-0.5">NISN: {reg.nisn}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-slate-700">
                          <div className="flex items-center gap-1.5 font-bold text-slate-800 text-[11px] mb-1">
                            <Calendar size={13} className="text-emerald-600 shrink-0" />
                            <span>{formatDateTime(reg.createdAt)}</span>
                          </div>
                          <div className="text-slate-600 font-medium text-[11px]">
                            {reg.previousSchool || 'Asal Sekolah: -'}
                          </div>
                        </td>

                        {/* Tahapan & Seleksi SPMB Column */}
                        <td className="px-5 py-4">
                          <div>
                            {getStageBadge(reg.spmbStage)}
                          </div>

                          {/* STIFIn Result Pill */}
                          {reg.stifinResult ? (
                            <div className="mt-1.5">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-50 text-purple-900 border border-purple-200 text-[11px] font-bold">
                                <Brain size={12} className="text-purple-600" />
                                <span>{reg.stifinResult}</span>
                              </span>
                            </div>
                          ) : (
                            <div className="mt-1 text-[10px] text-slate-400 italic">
                              STIFIn: Belum diinput
                            </div>
                          )}

                          {/* Graduation Status Badge */}
                          {reg.graduationStatus === 'PASSED' && (
                            <div className="mt-1">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-extrabold">
                                <Award size={11} className="text-emerald-600" /> Lulus Seleksi
                              </span>
                            </div>
                          )}
                          {reg.graduationStatus === 'FAILED' && (
                            <div className="mt-1">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-50 text-red-800 border border-red-200 text-[10px] font-bold">
                                <AlertCircle size={11} className="text-red-600" /> Tidak Lulus
                              </span>
                            </div>
                          )}

                          {/* Stage note preview if available */}
                          {reg.stageNote && (
                            <div className="mt-1 text-[10px] text-slate-500 bg-slate-50 p-1 rounded border border-slate-200 max-w-xs truncate" title={reg.stageNote}>
                              💬 {reg.stageNote}
                            </div>
                          )}
                        </td>

                        {/* Foto & Drive Column */}
                        <td className="px-5 py-4">
                          {getStatusBadge(reg.status)}
                          <div className="mt-1.5 flex flex-col gap-1">
                            {reg.fotoUrl ? (
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setIsModalPhotoError(false);
                                    setSelectedPhoto({ url: reg.fotoUrl!, name: reg.studentName || reg.userName, regId: reg.id });
                                  }}
                                  className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-2 py-0.5 rounded border border-indigo-200 transition-colors w-fit cursor-pointer"
                                  title="Lihat pas foto pendaftar"
                                >
                                  <Eye size={12} className="shrink-0 text-indigo-600" />
                                  <span>Lihat Pas Foto</span>
                                </button>
                                <label 
                                  className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-600 hover:text-emerald-700 bg-slate-100 hover:bg-emerald-50 px-1.5 py-0.5 rounded border border-slate-200 hover:border-emerald-300 transition-colors cursor-pointer w-fit" 
                                  title="Ganti pas foto calon siswa"
                                >
                                  {uploadingPhotoRegId === reg.id ? (
                                    <RefreshCw size={10} className="animate-spin text-emerald-600" />
                                  ) : (
                                    <Upload size={10} className="text-slate-500" />
                                  )}
                                  <span>{uploadingPhotoRegId === reg.id ? '...' : 'Ganti'}</span>
                                  <input 
                                    type="file" 
                                    accept="image/*" 
                                    className="hidden" 
                                    onChange={(e) => handleAdminPhotoUpload(e, reg.id)} 
                                    disabled={uploadingPhotoRegId === reg.id} 
                                  />
                                </label>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-[10px] text-slate-400 italic">Belum ada foto</span>
                                <label 
                                  className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-1.5 py-0.5 rounded border border-emerald-200 transition-colors cursor-pointer w-fit shadow-2xs" 
                                  title="Unggah pas foto calon siswa sekarang"
                                >
                                  {uploadingPhotoRegId === reg.id ? (
                                    <RefreshCw size={10} className="animate-spin text-emerald-600" />
                                  ) : (
                                    <Plus size={10} className="text-emerald-600" />
                                  )}
                                  <span>{uploadingPhotoRegId === reg.id ? 'Mengunggah...' : '+ Upload'}</span>
                                  <input 
                                    type="file" 
                                    accept="image/*" 
                                    className="hidden" 
                                    onChange={(e) => handleAdminPhotoUpload(e, reg.id)} 
                                    disabled={uploadingPhotoRegId === reg.id} 
                                  />
                                </label>
                              </div>
                            )}
                            {reg.documentDriveUrl ? (
                              <a
                                href={reg.documentDriveUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200 transition-colors w-fit"
                                title="Buka Folder Google Drive Dokumen"
                              >
                                <FolderOpen size={12} className="shrink-0 text-emerald-600" />
                                <span>Drive Dokumen ↗</span>
                              </a>
                            ) : (
                              <div className="text-[10px] text-slate-400 italic">
                                Belum ada drive
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Payment Column */}
                        <td className="px-5 py-4">
                          <span className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                            reg.paymentStatus === 'VERIFIED' ? 'bg-emerald-100 text-emerald-800' : reg.paymentStatus === 'PENDING' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {reg.paymentStatus === 'VERIFIED' ? 'Terverifikasi' : reg.paymentStatus === 'PENDING' ? 'Menunggu Verifikasi' : 'Belum Bayar'}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4">
                          <div className="flex flex-col items-center gap-1.5">
                            {/* Primary Action: Update Tahapan & Seleksi */}
                            <button
                              onClick={() => openStageModal(reg)}
                              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold px-2.5 py-1.5 rounded-lg text-[11px] transition-all shadow-sm flex items-center justify-center gap-1 cursor-pointer"
                              title="Update Tahapan SPMB, Input Hasil Tes STIFIn, Catatan Wawancara & Status Kelulusan"
                            >
                              <Brain size={13} />
                              <span>Update Tahapan</span>
                            </button>

                            <div className="flex items-center justify-center gap-1.5">
                              {/* Detail Calon Siswa Button */}
                              <button
                                onClick={() => { setDetailActiveTab('BIODATA'); setStudentDetailReg(reg); }}
                                className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-900 transition-colors flex items-center gap-1 font-bold text-[11px] border border-emerald-200 cursor-pointer"
                                title="Lihat Detail Lengkap Calon Siswa & Cetak Biodata"
                              >
                                <Eye size={13} className="text-emerald-700" /> Detail
                              </button>

                              {/* Edit Button */}
                              <button 
                                onClick={() => openEditModal(reg)}
                                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                                title="Edit Formulir"
                              >
                                <Edit2 size={13} />
                              </button>

                              {/* Delete Button */}
                              <button 
                                onClick={() => handleDelete(reg.id, reg.userName)}
                                className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
                                title="Hapus"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: GRAFIK & ANALISIS SURVEI SPMB */}
      {/* ========================================================================= */}
      {activeMainTab === 'ANALYTICS' && (
        <div className="space-y-6">
          {/* Interactive Filters Bar for Analytics */}
          <div className="bg-emerald-950 text-white p-5 rounded-3xl shadow-lg border border-emerald-800">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-extrabold uppercase tracking-wider mb-3">
              <Filter size={16} /> Filter Analisis Grafik Survei SPMB
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Source Filter */}
              <div>
                <label className="block text-emerald-200 font-semibold mb-1">Filter Sumber Informasi</label>
                <select
                  value={analyticsSource}
                  onChange={(e) => setAnalyticsSource(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-emerald-900 border border-emerald-700 text-white outline-none font-medium"
                >
                  <option value="ALL">Semua Saluran Informasi</option>
                  {knownSources.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-emerald-200 font-semibold mb-1">Filter Status Pendaftaran</label>
                <select
                  value={analyticsStatus}
                  onChange={(e) => setAnalyticsStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-emerald-900 border border-emerald-700 text-white outline-none font-medium"
                >
                  <option value="ALL">Semua Status Pendaftar</option>
                  <option value="SUBMITTED">Submitted (Daftar Tunggu)</option>
                  <option value="VERIFIED">Verified (Berkas Lulus)</option>
                  <option value="PASSED">Passed (Lulus Seleksi)</option>
                  <option value="REJECTED">Rejected (Ditolak)</option>
                  <option value="DRAFT">Draft</option>
                </select>
              </div>
            </div>
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-slate-500 text-xs font-bold block uppercase tracking-wider mb-1">Total Responden Survei</span>
              <div className="text-3xl font-extrabold text-slate-900">{totalAnalyticsCount}</div>
              <p className="text-[11px] text-emerald-600 font-semibold mt-1">Pendaftar Terfilter</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-slate-500 text-xs font-bold block uppercase tracking-wider mb-1">Menunggu Verifikasi</span>
              <div className="text-3xl font-extrabold text-amber-600">{pendingCount} <span className="text-sm text-slate-500 font-normal">({pendingPercent}%)</span></div>
              <p className="text-[11px] text-slate-500 mt-1">Daftar Tunggu Panitia</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-slate-500 text-xs font-bold block uppercase tracking-wider mb-1">Berkas Lulus / Seleksi</span>
              <div className="text-3xl font-extrabold text-emerald-700">{verifiedCount + passedCount} <span className="text-sm text-slate-500 font-normal">({verifiedPercent}%)</span></div>
              <p className="text-[11px] text-slate-500 mt-1">Lolos Verifikasi Berkas</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-slate-500 text-xs font-bold block uppercase tracking-wider mb-1">Saluran Terpopuler</span>
              <div className="text-base font-extrabold text-amber-700 truncate mt-1">
                {Object.entries(sourceCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Instagram / Facebook'}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Penyumbang Pendaftar Terbanyak</p>
            </div>
          </div>

          {/* Graphics Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart 1: Status Distribution */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-6 pb-3 border-b">
                <div className="flex items-center gap-2">
                  <PieChart className="text-emerald-700" size={20} />
                  <h3 className="font-extrabold text-slate-800 text-base">Grafik Status Seleksi Calon Siswa</h3>
                </div>
                <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded-full">
                  Status SPMB
                </span>
              </div>

              {totalAnalyticsCount === 0 ? (
                <p className="text-center text-slate-400 py-12 text-xs">Tidak ada data untuk filter yang dipilih.</p>
              ) : (
                <div className="space-y-6">
                  {/* Status Progress bars */}
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                        <span className="flex items-center gap-1.5"><Clock size={12} className="text-amber-500" /> Menunggu Verifikasi (Daftar Tunggu)</span>
                        <span className="font-bold text-slate-900">{pendingCount} ({pendingPercent}%)</span>
                      </div>
                      <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                        <div style={{ width: `${pendingPercent}%` }} className="bg-amber-500 h-full rounded-full transition-all duration-500"></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                        <span className="flex items-center gap-1.5"><CheckCircle size={12} className="text-blue-500" /> Berkas Diverifikasi</span>
                        <span className="font-bold text-slate-900">{verifiedCount} ({totalAnalyticsCount > 0 ? Math.round((verifiedCount / totalAnalyticsCount) * 100) : 0}%)</span>
                      </div>
                      <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                        <div style={{ width: `${totalAnalyticsCount > 0 ? Math.round((verifiedCount / totalAnalyticsCount) * 100) : 0}%` }} className="bg-blue-500 h-full rounded-full transition-all duration-500"></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                        <span className="flex items-center gap-1.5"><CheckCircle size={12} className="text-emerald-500" /> Lulus Seleksi</span>
                        <span className="font-bold text-slate-900">{passedCount} ({totalAnalyticsCount > 0 ? Math.round((passedCount / totalAnalyticsCount) * 100) : 0}%)</span>
                      </div>
                      <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                        <div style={{ width: `${totalAnalyticsCount > 0 ? Math.round((passedCount / totalAnalyticsCount) * 100) : 0}%` }} className="bg-emerald-600 h-full rounded-full transition-all duration-500"></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                        <span className="flex items-center gap-1.5"><AlertCircle size={12} className="text-red-500" /> Ditolak / Perlu Revisi</span>
                        <span className="font-bold text-slate-900">{rejectedCount} ({totalAnalyticsCount > 0 ? Math.round((rejectedCount / totalAnalyticsCount) * 100) : 0}%)</span>
                      </div>
                      <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                        <div style={{ width: `${totalAnalyticsCount > 0 ? Math.round((rejectedCount / totalAnalyticsCount) * 100) : 0}%` }} className="bg-red-500 h-full rounded-full transition-all duration-500"></div>
                      </div>
                    </div>
                  </div>

                  {/* Summary Cards */}
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl">
                      <div className="font-bold text-amber-900 text-sm mb-1 flex items-center gap-1.5">
                        <Clock size={16} /> Menunggu Proses
                      </div>
                      <p className="text-slate-600 text-[11px] mb-2">Berkas belum diverifikasi panitia.</p>
                      <div className="text-2xl font-extrabold text-amber-800">{pendingCount} Calon Siswa</div>
                    </div>

                    <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl">
                      <div className="font-bold text-emerald-900 text-sm mb-1 flex items-center gap-1.5">
                        <CheckCircle size={16} /> Terverifikasi / Lulus
                      </div>
                      <p className="text-slate-600 text-[11px] mb-2">Calon siswa lolos seleksi berkas.</p>
                      <div className="text-2xl font-extrabold text-emerald-800">{verifiedCount + passedCount} Calon Siswa</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Chart 2: Marketing Source Channels */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-6 pb-3 border-b">
                <div className="flex items-center gap-2">
                  <BarChart3 className="text-emerald-700" size={20} />
                  <h3 className="font-extrabold text-slate-800 text-base">Grafik Sumber Informasi SPMB</h3>
                </div>
                <span className="text-xs bg-amber-100 text-amber-800 font-bold px-2.5 py-1 rounded-full">
                  Analisis Media
                </span>
              </div>

              {totalAnalyticsCount === 0 ? (
                <p className="text-center text-slate-400 py-12 text-xs">Tidak ada data untuk filter yang dipilih.</p>
              ) : (
                <div className="space-y-4">
                  {knownSources.map((source) => {
                    const count = sourceCounts[source] || 0;
                    const percent = totalAnalyticsCount > 0 ? Math.round((count / totalAnalyticsCount) * 100) : 0;

                    return (
                      <div key={source} className="text-xs">
                        <div className="flex justify-between font-semibold text-slate-700 mb-1">
                          <span className="truncate pr-2">{source}</span>
                          <span className="font-bold text-slate-900 shrink-0">{count} pendaftar ({percent}%)</span>
                        </div>
                        <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                          <div
                            style={{ width: `${percent}%` }}
                            className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Section 3: Student & Parent Quotes / Reasons list */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-6 pb-3 border-b">
              <div className="flex items-center gap-2">
                <Sparkles className="text-amber-500" size={20} />
                <div>
                  <h3 className="font-extrabold text-slate-800 text-base">Alasan Memilih SD IT Andalas Cendekia</h3>
                  <p className="text-slate-500 text-xs">Daftar motivasi dan tanggapan asli dari calon orang tua / santri pendaftar.</p>
                </div>
              </div>
              <span className="text-xs bg-slate-100 text-slate-700 font-bold px-3 py-1 rounded-full">
                {analyticsList.filter(r => r.reasonToJoin).length} Respon Terisi
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analyticsList.filter(r => r.reasonToJoin).length === 0 ? (
                <div className="col-span-2 text-center py-10 text-slate-400 text-xs">
                  Belum ada catatan alasan memilih sekolah untuk filter ini.
                </div>
              ) : (
                analyticsList
                  .filter(r => r.reasonToJoin)
                  .map((reg) => (
                    <div key={reg.id} className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-xs">{reg.userName}</span>
                        {(reg.programType || 'BOARDING') === 'BOARDING' ? (
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">Boarding</span>
                        ) : (
                          <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded">Reguler</span>
                        )}
                      </div>
                      <p className="text-xs text-slate-700 italic bg-white p-3 rounded-xl border border-slate-200/60 leading-relaxed">
                        "{reg.reasonToJoin}"
                      </p>
                      <div className="flex justify-between text-[11px] text-slate-500 pt-1">
                        <span>Asal: {reg.previousSchool || '-'}</span>
                        <span className="text-emerald-700 font-medium">Info: {reg.infoSource || 'Social Media'}</span>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: KELOLA AKUN PANITIA SPMB (HANYA SUPER ADMIN) */}
      {/* ========================================================================= */}
      {activeMainTab === 'PANITIA' && user?.role === 'ADMIN' && (
        <div className="space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="p-2 rounded-xl bg-amber-100 text-amber-800">
                    <ShieldCheck size={20} />
                  </span>
                  <h2 className="text-xl font-extrabold text-slate-800">
                    Manajemen Akun Panitia SPMB
                  </h2>
                </div>
                <p className="text-xs text-slate-500">
                  Buat akun khusus panitia SPMB. Akun panitia ini <strong>hanya memiliki hak akses melihat/mengelola data calon siswa dan tahapan seleksi</strong> tanpa akses ke pengaturan website dan analitik kunjungan.
                </p>
              </div>

              <div className="text-xs font-bold text-slate-600 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl flex items-center gap-2 shrink-0">
                <KeyRound size={14} className="text-amber-700" />
                <span>Default: panitia@sdit.sch.id / panitia123</span>
              </div>
            </div>

            {/* Form Tambah Panitia */}
            <form onSubmit={handleSavePanitia} className="mt-6 bg-slate-50 p-5 rounded-2xl border border-slate-200">
              <h3 className="font-extrabold text-sm text-slate-800 mb-3 flex items-center gap-2">
                <Plus size={16} className="text-emerald-600" />
                <span>Tambah Akun Panitia Baru</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Nama Lengkap Panitia</label>
                  <input
                    type="text"
                    required
                    value={panitiaName}
                    onChange={(e) => setPanitiaName(e.target.value)}
                    placeholder="Contoh: Ustadzah Fatimah, S.Pd"
                    className="w-full px-3 py-2 border rounded-xl bg-white outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Email Login Panitia</label>
                  <input
                    type="email"
                    required
                    value={panitiaEmail}
                    onChange={(e) => setPanitiaEmail(e.target.value)}
                    placeholder="Contoh: fatimah.spmb@sdit.sch.id"
                    className="w-full px-3 py-2 border rounded-xl bg-white outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Password</label>
                  <input
                    type="text"
                    value={panitiaPassword}
                    onChange={(e) => setPanitiaPassword(e.target.value)}
                    placeholder="Default: panitia123"
                    className="w-full px-3 py-2 border rounded-xl bg-white outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow transition-all flex items-center gap-2 cursor-pointer"
                >
                  <UserCheck size={16} />
                  <span>Simpan Akun Panitia</span>
                </button>
              </div>
            </form>

            {/* Tabel Daftar Akun Panitia */}
            <div className="mt-8">
              <h3 className="font-extrabold text-sm text-slate-800 mb-3 flex items-center gap-2">
                <UsersIcon size={16} className="text-emerald-700" />
                <span>Daftar Akun Panitia SPMB Aktif</span>
              </h3>

              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100/80 text-slate-600 font-bold uppercase border-b border-slate-200">
                      <th className="px-5 py-3.5">Nama Panitia</th>
                      <th className="px-5 py-3.5">Email Akun</th>
                      <th className="px-5 py-3.5">Role Akses</th>
                      <th className="px-5 py-3.5 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {allUsers.filter((u) => u.role === 'PANITIA_SPMB').length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-5 py-8 text-center text-slate-400">
                          Belum ada akun panitia khusus yang didaftarkan.
                        </td>
                      </tr>
                    ) : (
                      allUsers
                        .filter((u) => u.role === 'PANITIA_SPMB')
                        .map((p) => (
                          <tr key={p.id} className="hover:bg-slate-50">
                            <td className="px-5 py-3.5 font-bold text-slate-900">{p.name}</td>
                            <td className="px-5 py-3.5 text-slate-700 font-medium">{p.email}</td>
                            <td className="px-5 py-3.5">
                              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                                PANITIA_SPMB (Khusus Data Pendaftar)
                              </span>
                            </td>
                            <td className="px-5 py-3.5 text-center">
                              <button
                                onClick={() => handleDeletePanitia(p.id, p.name)}
                                className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-colors cursor-pointer"
                                title="Hapus Akun Panitia"
                              >
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL DETAIL LENGKAP CALON SISWA */}
      {/* ========================================================================= */}
      {studentDetailReg && (() => {
        const cleanPhone = (studentDetailReg.parentPhone || '').replace(/[^0-9]/g, '');
        const waNumber = cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone;
        const waMessage = encodeURIComponent(
          `Assalamu'alaikum wr. wb. Ayah/Bunda dari ananda *${studentDetailReg.studentName || studentDetailReg.userName}*,\n\nKami dari Panitia SPMB SD IT Andalas Cendekia ingin mengonfirmasi terkait pendaftaran calon siswa dengan No. Registrasi: #${studentDetailReg.id}.`
        );
        const waUrl = waNumber ? `https://wa.me/${waNumber}?text=${waMessage}` : null;

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl relative border border-slate-200 overflow-hidden">
              
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 text-white p-5 sm:p-6 shrink-0 relative">
                <button 
                  onClick={() => setStudentDetailReg(null)}
                  className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                  title="Tutup Modal"
                >
                  <X size={18} />
                </button>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pr-8">
                  <div className="flex items-center gap-3.5">
                    <div className="relative group">
                      {studentDetailReg.fotoUrl && !isBrokenOrTruncatedImage(studentDetailReg.fotoUrl) ? (
                        <img 
                          src={resolveImageUrl(studentDetailReg.fotoUrl)} 
                          alt={studentDetailReg.studentName || 'Pas Foto'} 
                          onError={(e) => handleImageError(e, studentDetailReg.fotoUrl!)}
                          onClick={() => {
                            setIsModalPhotoError(false);
                            setSelectedPhoto({ url: studentDetailReg.fotoUrl!, name: studentDetailReg.studentName || studentDetailReg.userName, regId: studentDetailReg.id });
                          }}
                          className="w-14 h-16 sm:w-16 sm:h-20 object-cover rounded-xl border-2 border-white/60 shadow-md shrink-0 cursor-pointer hover:opacity-90 hover:scale-105 transition-all" 
                          title="Klik untuk memperbesar / mengganti pas foto"
                        />
                      ) : null}
                      <div 
                        style={{ display: studentDetailReg.fotoUrl && !isBrokenOrTruncatedImage(studentDetailReg.fotoUrl) ? 'none' : 'flex' }}
                        onClick={() => {
                          if (studentDetailReg.fotoUrl) {
                            setIsModalPhotoError(false);
                            setSelectedPhoto({ url: studentDetailReg.fotoUrl!, name: studentDetailReg.studentName || studentDetailReg.userName, regId: studentDetailReg.id });
                          }
                        }}
                        className={`w-14 h-16 sm:w-16 sm:h-20 rounded-xl border-2 border-white/40 flex flex-col items-center justify-center text-white font-extrabold text-2xl shrink-0 shadow-inner ${
                          isBrokenOrTruncatedImage(studentDetailReg.fotoUrl) ? 'bg-amber-500/40 cursor-pointer' : 'bg-white/20'
                        }`}
                        title={isBrokenOrTruncatedImage(studentDetailReg.fotoUrl) ? 'Foto terpotong di database server lama' : 'Belum ada foto'}
                      >
                        {(studentDetailReg.studentName || studentDetailReg.userName || 'S')[0].toUpperCase()}
                        {isBrokenOrTruncatedImage(studentDetailReg.fotoUrl) && (
                          <span className="text-[9px] font-bold bg-amber-400 text-amber-950 px-1 rounded-sm mt-0.5">Lama</span>
                        )}
                      </div>

                      {/* Quick Upload Icon on Avatar */}
                      <label 
                        className="absolute -bottom-1 -right-1 bg-white text-emerald-800 p-1 rounded-full shadow hover:bg-emerald-50 cursor-pointer transition-all border border-emerald-600"
                        title="Upload / Ganti Pas Foto"
                      >
                        {uploadingPhotoRegId === studentDetailReg.id ? (
                          <RefreshCw size={11} className="animate-spin text-emerald-700" />
                        ) : (
                          <Camera size={11} />
                        )}
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={(e) => handleAdminPhotoUpload(e, studentDetailReg.id)} 
                          disabled={uploadingPhotoRegId === studentDetailReg.id} 
                        />
                      </label>
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="bg-white/20 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full backdrop-blur">
                          ID: #{studentDetailReg.id}
                        </span>
                        <span className="bg-amber-400 text-amber-950 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full shadow-2xs">
                          {studentDetailReg.programType || 'BOARDING'}
                        </span>
                        <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                          studentDetailReg.paymentStatus === 'VERIFIED'
                            ? 'bg-emerald-400 text-emerald-950'
                            : studentDetailReg.paymentStatus === 'PENDING'
                            ? 'bg-orange-300 text-orange-950'
                            : 'bg-white/20 text-white'
                        }`}>
                          {studentDetailReg.paymentStatus === 'VERIFIED' ? '✓ Bayar Lunas' : studentDetailReg.paymentStatus === 'PENDING' ? '⏳ Menunggu Verifikasi' : '✕ Belum Bayar'}
                        </span>
                      </div>

                      <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
                        {studentDetailReg.studentName || studentDetailReg.userName}
                      </h2>

                      <p className="text-emerald-100 text-xs mt-0.5">
                        Wali: <strong>{studentDetailReg.userName}</strong> ({studentDetailReg.userEmail}) • Daftar: {formatDateTime(studentDetailReg.createdAt)}
                      </p>
                    </div>
                  </div>

                  {/* Header Fast Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => printStudentBiodata(studentDetailReg)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-white text-emerald-800 hover:bg-emerald-50 shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer"
                      title="Cetak Biodata Lengkap Calon Siswa (PDF / Print)"
                    >
                      <Printer size={15} />
                      <span>Cetak Biodata</span>
                    </button>

                    {waUrl && (
                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-white shadow-md transition-all hover:scale-105 active:scale-95"
                        title="Chat WhatsApp ke Orang Tua / Wali"
                      >
                        <MessageCircle size={15} />
                        <span>WhatsApp Wali</span>
                      </a>
                    )}
                  </div>
                </div>

                {/* Tabs Header */}
                <div className="flex items-center gap-1 mt-5 border-t border-white/20 pt-3 overflow-x-auto">
                  {[
                    { id: 'BIODATA', label: '1. Biodata Siswa', icon: User },
                    { id: 'PARENTS', label: '2. Orang Tua & Kontak', icon: UsersIcon },
                    { id: 'SELECTION', label: '3. Seleksi & STIFIn', icon: Brain },
                    { id: 'SURVEY', label: '4. Survei & Dokumen', icon: FileText },
                  ].map((tab) => {
                    const Icon = tab.icon;
                    const isActive = detailActiveTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setDetailActiveTab(tab.id as any)}
                        className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                          isActive 
                            ? 'bg-white text-emerald-900 shadow-sm' 
                            : 'text-emerald-100 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <Icon size={14} />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Modal Body - Tab Content */}
              <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs">
                {/* TAB 1: BIODATA SISWA */}
                {detailActiveTab === 'BIODATA' && (
                  <div className="space-y-4 animate-fadeIn">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                        <span className="text-slate-400 block text-[10px] font-bold uppercase mb-1">Nama Lengkap Siswa</span>
                        <span className="text-slate-900 text-sm font-extrabold">{studentDetailReg.studentName || studentDetailReg.userName}</span>
                      </div>

                      <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                        <span className="text-slate-400 block text-[10px] font-bold uppercase mb-1">Jenis Kelamin</span>
                        <span className="text-slate-900 text-sm font-bold">
                          {studentDetailReg.gender === 'P' ? 'Perempuan (P)' : 'Laki-laki (L)'}
                        </span>
                      </div>

                      <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                        <span className="text-slate-400 block text-[10px] font-bold uppercase mb-1">NISN (Nomor Induk Siswa Nasional)</span>
                        <span className="text-slate-800 text-xs font-mono font-bold">{studentDetailReg.nisn || '(Belum Diisi / Tidak Ada)'}</span>
                      </div>

                      <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                        <span className="text-slate-400 block text-[10px] font-bold uppercase mb-1">NIK Siswa (No. KTP / KK)</span>
                        <span className="text-slate-800 text-xs font-mono font-bold">{studentDetailReg.nik || '(Belum Diisi)'}</span>
                      </div>

                      <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                        <span className="text-slate-400 block text-[10px] font-bold uppercase mb-1">Tempat & Tanggal Lahir</span>
                        <span className="text-slate-900 text-xs font-semibold">
                          {studentDetailReg.birthPlace || '-'}, {studentDetailReg.birthDate || '-'}
                        </span>
                      </div>

                      <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                        <span className="text-slate-400 block text-[10px] font-bold uppercase mb-1">Asal Sekolah TK / PAUD</span>
                        <span className="text-slate-900 text-xs font-bold">{studentDetailReg.previousSchool || '-'}</span>
                      </div>

                      <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                        <span className="text-slate-400 block text-[10px] font-bold uppercase mb-1">Pilihan Program Sekolah</span>
                        <span className="inline-block px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-900 font-bold text-xs">
                          {studentDetailReg.programType || 'BOARDING'}
                        </span>
                      </div>

                      <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                        <span className="text-slate-400 block text-[10px] font-bold uppercase mb-1">Ukuran Seragam Siswa</span>
                        <span className="text-slate-900 text-xs font-bold">{studentDetailReg.uniformSize || 'Belum dipilih'}</span>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                      <span className="text-slate-400 block text-[10px] font-bold uppercase mb-1 flex items-center gap-1">
                        <MapPin size={12} className="text-slate-500" />
                        <span>Alamat Lengkap Tempat Tinggal</span>
                      </span>
                      <p className="text-slate-800 text-xs font-medium leading-relaxed">
                        {studentDetailReg.address || 'Alamat belum diisi oleh wali pendaftar.'}
                      </p>
                    </div>
                  </div>
                )}

                {/* TAB 2: DATA ORANG TUA & KONTAK */}
                {detailActiveTab === 'PARENTS' && (
                  <div className="space-y-4 animate-fadeIn">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                        <span className="text-slate-400 block text-[10px] font-bold uppercase mb-1">Nama Ayah Kandung</span>
                        <span className="text-slate-900 text-sm font-extrabold">{studentDetailReg.fatherName || '-'}</span>
                      </div>

                      <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                        <span className="text-slate-400 block text-[10px] font-bold uppercase mb-1">Nama Ibu Kandung</span>
                        <span className="text-slate-900 text-sm font-extrabold">{studentDetailReg.motherName || '-'}</span>
                      </div>

                      <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 md:col-span-2">
                        <span className="text-slate-400 block text-[10px] font-bold uppercase mb-1.5">No. Telepon / WhatsApp Wali</span>
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <span className="text-slate-900 text-sm font-mono font-bold flex items-center gap-1.5">
                            <Phone size={15} className="text-emerald-600" />
                            <span>{studentDetailReg.parentPhone || '-'}</span>
                          </span>

                          {waUrl && (
                            <a
                              href={waUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors"
                            >
                              <MessageCircle size={14} />
                              <span>Hubungi via WhatsApp</span>
                            </a>
                          )}
                        </div>
                      </div>

                      <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                        <span className="text-slate-400 block text-[10px] font-bold uppercase mb-1">Akun Login Pendaftar</span>
                        <span className="text-slate-900 text-xs font-bold">{studentDetailReg.userName}</span>
                      </div>

                      <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                        <span className="text-slate-400 block text-[10px] font-bold uppercase mb-1">Email Akun Wali</span>
                        <span className="text-slate-800 text-xs font-mono">{studentDetailReg.userEmail || '-'}</span>
                      </div>

                      <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                        <span className="text-slate-400 block text-[10px] font-bold uppercase mb-1">Waktu Pendaftaran</span>
                        <span className="text-emerald-800 text-xs font-bold flex items-center gap-1">
                          <Calendar size={13} className="text-emerald-600" />
                          <span>{formatDateTime(studentDetailReg.createdAt)}</span>
                        </span>
                      </div>

                      <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                        <span className="text-slate-400 block text-[10px] font-bold uppercase mb-1">Terakhir Diperbarui</span>
                        <span className="text-slate-700 text-xs font-semibold">{formatDateTime(studentDetailReg.updatedAt)}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 3: SELEKSI & STIFIn */}
                {detailActiveTab === 'SELECTION' && (
                  <div className="space-y-4 animate-fadeIn">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
                        <span className="text-purple-700 block text-[10px] font-bold uppercase mb-1 flex items-center gap-1">
                          <Brain size={14} />
                          <span>Hasil Tes Mesin Kecerdasan (STIFIn)</span>
                        </span>
                        <div className="text-purple-950 text-base font-extrabold mt-1">
                          {studentDetailReg.stifinResult || '(Belum Dilakukan / Belum Diinput)'}
                        </div>
                      </div>

                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                        <span className="text-slate-500 block text-[10px] font-bold uppercase mb-1">Tahapan Seleksi Saat Ini</span>
                        <div className="mt-1">
                          {getStageBadge(studentDetailReg.spmbStage)}
                        </div>
                      </div>

                      <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                        <span className="text-slate-400 block text-[10px] font-bold uppercase mb-1">Keputusan Kelulusan</span>
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                          studentDetailReg.graduationStatus === 'PASSED'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : studentDetailReg.graduationStatus === 'FAILED'
                            ? 'bg-red-100 text-red-800 border border-red-300'
                            : 'bg-amber-100 text-amber-800 border border-amber-300'
                        }`}>
                          {studentDetailReg.graduationStatus === 'PASSED' 
                            ? '✓ DITERIMA (LULUS SELEKSI)' 
                            : studentDetailReg.graduationStatus === 'FAILED' 
                            ? '✕ TIDAK DITERIMA' 
                            : '⏳ DALAM PROSES SELEKSI'}
                        </span>
                      </div>

                      <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                        <span className="text-slate-400 block text-[10px] font-bold uppercase mb-1">Nilai Tes Akademik</span>
                        <span className="text-slate-900 text-sm font-extrabold">
                          {studentDetailReg.testScore !== undefined && studentDetailReg.testScore !== null ? studentDetailReg.testScore : 'Belum diisi'}
                        </span>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                      <span className="text-slate-500 block text-[10px] font-bold uppercase mb-1">Catatan Wawancara Calon Siswa (Anak)</span>
                      <p className="text-slate-800 text-xs font-medium leading-relaxed bg-white p-3 rounded-lg border border-slate-200">
                        {studentDetailReg.interviewChildNotes || 'Belum ada catatan wawancara anak.'}
                      </p>
                    </div>

                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                      <span className="text-slate-500 block text-[10px] font-bold uppercase mb-1">Catatan Wawancara Orang Tua / Wali</span>
                      <p className="text-slate-800 text-xs font-medium leading-relaxed bg-white p-3 rounded-lg border border-slate-200">
                        {studentDetailReg.interviewParentNotes || 'Belum ada catatan wawancara orang tua.'}
                      </p>
                    </div>

                    {studentDetailReg.stageNote && (
                      <div className="bg-amber-50 p-3.5 rounded-xl border border-amber-200">
                        <span className="text-amber-800 block text-[10px] font-bold uppercase mb-1">Catatan / Pesan Tahapan Untuk Wali</span>
                        <p className="text-amber-950 text-xs font-medium leading-relaxed">
                          {studentDetailReg.stageNote}
                        </p>
                      </div>
                    )}

                    <div className="pt-2 flex justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          const currentReg = studentDetailReg;
                          setStudentDetailReg(null);
                          openStageModal(currentReg);
                        }}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer"
                      >
                        <Brain size={14} />
                        <span>Buka Form Update Seleksi & STIFIn</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* TAB 4: SURVEI & DOKUMEN */}
                {detailActiveTab === 'SURVEY' && (
                  <div className="space-y-4 animate-fadeIn">
                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                      <span className="text-slate-400 block text-[10px] font-bold uppercase mb-1">Sumber Informasi Mengenai SD IT Andalas Cendekia</span>
                      <span className="text-slate-900 text-xs font-bold">{studentDetailReg.infoSource || 'Instagram / Facebook Official'}</span>
                    </div>

                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                      <span className="text-slate-400 block text-[10px] font-bold uppercase mb-1">Alasan Memilih SD IT Andalas Cendekia</span>
                      <p className="text-slate-800 text-xs font-medium italic leading-relaxed bg-white p-3 rounded-lg border border-slate-200 mt-1">
                        "{studentDetailReg.reasonToJoin || 'Tidak diisi oleh pendaftar.'}"
                      </p>
                    </div>

                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                      <span className="text-slate-500 block text-[10px] font-bold uppercase mb-2">Berkas Pas Foto & Dokumen Pendaftaran</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* Pas Foto Card */}
                        <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center gap-3">
                          {studentDetailReg.fotoUrl && !isBrokenOrTruncatedImage(studentDetailReg.fotoUrl) ? (
                            <img 
                              src={resolveImageUrl(studentDetailReg.fotoUrl)} 
                              alt="Pas Foto" 
                              onError={(e) => handleImageError(e, studentDetailReg.fotoUrl!)}
                              onClick={() => {
                                setIsModalPhotoError(false);
                                setSelectedPhoto({ url: studentDetailReg.fotoUrl!, name: studentDetailReg.studentName || studentDetailReg.userName, regId: studentDetailReg.id });
                              }}
                              className="w-12 h-14 object-cover rounded-lg border border-slate-200 shadow-2xs shrink-0 cursor-pointer hover:opacity-85 hover:scale-105 transition-all"
                            />
                          ) : null}
                          <div 
                            style={{ display: studentDetailReg.fotoUrl && !isBrokenOrTruncatedImage(studentDetailReg.fotoUrl) ? 'none' : 'flex' }}
                            className={`w-12 h-14 rounded-lg border flex flex-col items-center justify-center text-[10px] text-center shrink-0 ${
                              isBrokenOrTruncatedImage(studentDetailReg.fotoUrl)
                                ? 'bg-amber-50 border-amber-300 text-amber-700'
                                : 'bg-slate-100 border-slate-200 text-slate-400'
                            }`}
                          >
                            {isBrokenOrTruncatedImage(studentDetailReg.fotoUrl) ? 'Terpotong' : 'Tanpa Foto'}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-slate-800 text-xs">Pas Foto Siswa</div>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              {studentDetailReg.fotoUrl && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setIsModalPhotoError(false);
                                    setSelectedPhoto({ url: studentDetailReg.fotoUrl!, name: studentDetailReg.studentName || studentDetailReg.userName, regId: studentDetailReg.id });
                                  }}
                                  className="text-indigo-600 hover:text-indigo-800 text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer"
                                >
                                  <Eye size={12} /> Lihat
                                </button>
                              )}
                              <label className="text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded cursor-pointer transition-colors inline-flex items-center gap-1">
                                {uploadingPhotoRegId === studentDetailReg.id ? (
                                  <RefreshCw size={10} className="animate-spin text-emerald-600" />
                                ) : (
                                  <Upload size={10} />
                                )}
                                <span>{uploadingPhotoRegId === studentDetailReg.id ? 'Mengunggah...' : studentDetailReg.fotoUrl ? 'Ganti Foto' : '+ Upload Foto'}</span>
                                <input 
                                  type="file" 
                                  accept="image/*" 
                                  className="hidden" 
                                  onChange={(e) => handleAdminPhotoUpload(e, studentDetailReg.id)} 
                                  disabled={uploadingPhotoRegId === studentDetailReg.id} 
                                />
                              </label>
                            </div>
                          </div>
                        </div>

                        {/* Bukti Pembayaran Card */}
                        <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center gap-3">
                          {studentDetailReg.paymentProofUrl && !isBrokenOrTruncatedImage(studentDetailReg.paymentProofUrl) ? (
                            <img 
                              src={resolveImageUrl(studentDetailReg.paymentProofUrl)} 
                              alt="Bukti Transfer" 
                              onError={(e) => handleImageError(e, studentDetailReg.paymentProofUrl!)}
                              onClick={() => {
                                setIsModalPhotoError(false);
                                setSelectedPhoto({ url: studentDetailReg.paymentProofUrl!, name: `Bukti Bayar - ${studentDetailReg.studentName || studentDetailReg.userName}`, regId: studentDetailReg.id });
                              }}
                              className="w-12 h-14 object-cover rounded-lg border border-slate-200 shadow-2xs shrink-0 cursor-pointer hover:opacity-85 hover:scale-105 transition-all"
                            />
                          ) : null}
                          <div 
                            style={{ display: studentDetailReg.paymentProofUrl && !isBrokenOrTruncatedImage(studentDetailReg.paymentProofUrl) ? 'none' : 'flex' }}
                            className={`w-12 h-14 rounded-lg border flex flex-col items-center justify-center text-[10px] text-center shrink-0 ${
                              isBrokenOrTruncatedImage(studentDetailReg.paymentProofUrl)
                                ? 'bg-amber-50 border-amber-300 text-amber-700'
                                : 'bg-slate-100 border-slate-200 text-slate-400'
                            }`}
                          >
                            {isBrokenOrTruncatedImage(studentDetailReg.paymentProofUrl) ? 'Terpotong' : 'Tanpa Bukti'}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-slate-800 text-xs">Bukti Transfer Bayar</div>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              {studentDetailReg.paymentProofUrl && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setIsModalPhotoError(false);
                                    setSelectedPhoto({ url: studentDetailReg.paymentProofUrl!, name: `Bukti Bayar - ${studentDetailReg.studentName || studentDetailReg.userName}`, regId: studentDetailReg.id });
                                  }}
                                  className="text-emerald-600 hover:text-emerald-800 text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer"
                                >
                                  <Eye size={12} /> Lihat
                                </button>
                              )}
                              <label className="text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded cursor-pointer transition-colors inline-flex items-center gap-1">
                                {uploadingProofRegId === studentDetailReg.id ? (
                                  <RefreshCw size={10} className="animate-spin text-emerald-600" />
                                ) : (
                                  <Upload size={10} />
                                )}
                                <span>{uploadingProofRegId === studentDetailReg.id ? 'Mengunggah...' : studentDetailReg.paymentProofUrl ? 'Ganti Bukti' : '+ Upload Bukti'}</span>
                                <input 
                                  type="file" 
                                  accept="image/*" 
                                  className="hidden" 
                                  onChange={(e) => handleAdminPaymentProofUpload(e, studentDetailReg.id)} 
                                  disabled={uploadingProofRegId === studentDetailReg.id} 
                                />
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Google Drive Link */}
                      {studentDetailReg.documentDriveUrl && (
                        <div className="mt-3">
                          <a
                            href={studentDetailReg.documentDriveUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 text-xs font-bold text-emerald-800 hover:text-emerald-950 bg-emerald-50 hover:bg-emerald-100 px-3.5 py-2 rounded-xl border border-emerald-300 shadow-2xs transition-all"
                          >
                            <FolderOpen size={15} className="text-emerald-600" />
                            <span>Buka Folder Berkas Lengkap di Google Drive ↗</span>
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="bg-slate-50 px-5 sm:px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => printStudentBiodata(studentDetailReg)}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs transition-colors cursor-pointer"
                  title="Cetak Formulir Biodata Calon Siswa (PDF / Print)"
                >
                  <Printer size={15} />
                  <span>Cetak Biodata Calon Siswa (PDF)</span>
                </button>

                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const regToEdit = studentDetailReg;
                      setStudentDetailReg(null);
                      openEditModal(regToEdit);
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-slate-200 hover:bg-slate-300 text-slate-700 transition-colors cursor-pointer"
                  >
                    <Edit2 size={13} />
                    <span>Edit Data</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStudentDetailReg(null)}
                    className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-900 text-white transition-colors cursor-pointer"
                  >
                    Tutup
                  </button>
                </div>
              </div>

            </div>
          </div>
        );
      })()}

      {/* ========================================================================= */}
      {/* MODAL TAMBAH PENDAFTAR BARU */}
      {/* ========================================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 text-slate-500"
            >
              <X size={20} />
            </button>

            <h3 className="text-xl font-bold text-slate-800 mb-4 border-b pb-2">Tambah Pendaftar Baru</h3>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Nama Lengkap Calon Siswa (Anak)</label>
                <input 
                  type="text" 
                  required 
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  placeholder="Contoh: Muhammad Irfan"
                  className="w-full px-3 py-2 border rounded-xl outline-none focus:border-emerald-500 font-semibold"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Nama Orang Tua / Wali</label>
                <input 
                  type="text" 
                  required 
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Contoh: Budi Santoso"
                  className="w-full px-3 py-2 border rounded-xl outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Email Aktif</label>
                <input 
                  type="email" 
                  required 
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="Contoh: irfan@gmail.com"
                  className="w-full px-3 py-2 border rounded-xl outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Sumber Info SPMB</label>
                <select
                  value={newInfoSource}
                  onChange={(e) => setNewInfoSource(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl outline-none focus:border-emerald-500"
                >
                  {knownSources.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Alasan Memilih Sekolah</label>
                <textarea
                  rows={2}
                  value={newReasonToJoin}
                  onChange={(e) => setNewReasonToJoin(e.target.value)}
                  placeholder="Alasan singkat memilih sekolah..."
                  className="w-full px-3 py-2 border rounded-xl outline-none focus:border-emerald-500"
                ></textarea>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Asal Sekolah (TK / RA / PAUD)</label>
                <input 
                  type="text" 
                  value={newSchool}
                  onChange={(e) => setNewSchool(e.target.value)}
                  placeholder="Contoh: SMPN 1 Pulau Punjung"
                  className="w-full px-3 py-2 border rounded-xl outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Link Google Drive Pas Foto Calon Siswa</label>
                <input 
                  type="url" 
                  value={newDocumentDriveUrl}
                  onChange={(e) => setNewDocumentDriveUrl(e.target.value)}
                  placeholder="https://drive.google.com/drive/folders/1dKcGp0m7HF9esxIqCpmvqWu0WDew7cYO?usp=sharing"
                  className="w-full px-3 py-2 border rounded-xl outline-none focus:border-emerald-500 font-mono text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Status Pendaftaran</label>
                  <select 
                    value={newStatus} 
                    onChange={(e) => setNewStatus(e.target.value as any)}
                    className="w-full px-3 py-2 border rounded-xl outline-none focus:border-emerald-500"
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="SUBMITTED">Submitted (Daftar Tunggu)</option>
                    <option value="VERIFIED">Verified (Berkas Lulus)</option>
                    <option value="PASSED">Passed (Lulus Seleksi)</option>
                    <option value="REJECTED">Rejected (Ditolak)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Status Pembayaran</label>
                  <select 
                    value={newPaymentStatus} 
                    onChange={(e) => setNewPaymentStatus(e.target.value as any)}
                    className="w-full px-3 py-2 border rounded-xl outline-none focus:border-emerald-500"
                  >
                    <option value="UNPAID">Belum Bayar</option>
                    <option value="PENDING">Menunggu Verifikasi</option>
                    <option value="VERIFIED">Sudah Diverifikasi</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t flex justify-end gap-2">
                <button 
                  type="button" 
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow"
                >
                  Simpan Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL EDIT PENDAFTAR */}
      {/* ========================================================================= */}
      {editingReg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setEditingReg(null)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 text-slate-500"
            >
              <X size={20} />
            </button>

            <h3 className="text-xl font-bold text-slate-800 mb-1">Edit Data Pendaftar</h3>
            <p className="text-slate-500 text-xs mb-4">Akun Wali: {editingReg.userName} ({editingReg.userEmail})</p>

            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Nama Lengkap Calon Siswa (Anak)</label>
                <input 
                  type="text" 
                  value={editStudentName} 
                  onChange={(e) => setEditStudentName(e.target.value)}
                  placeholder="Contoh: Muhammad Irfan"
                  className="w-full px-3 py-2 border rounded-xl outline-none focus:border-emerald-500 font-semibold"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Sumber Info SPMB</label>
                <select 
                  value={editInfoSource} 
                  onChange={(e) => setEditInfoSource(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl outline-none focus:border-emerald-500"
                >
                  {knownSources.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Alasan Memilih Sekolah</label>
                <textarea 
                  rows={2}
                  value={editReasonToJoin} 
                  onChange={(e) => setEditReasonToJoin(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl outline-none focus:border-emerald-500"
                ></textarea>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Asal Sekolah</label>
                <input 
                  type="text" 
                  value={editSchool}
                  onChange={(e) => setEditSchool(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-slate-700 font-bold">Link Google Drive Pas Foto Calon Siswa</label>
                  {editDocumentDriveUrl && (
                    <a
                      href={editDocumentDriveUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-emerald-700 hover:text-emerald-900 font-bold underline flex items-center gap-1"
                    >
                      Buka Folder Foto ↗
                    </a>
                  )}
                </div>
                <input 
                  type="url" 
                  value={editDocumentDriveUrl}
                  onChange={(e) => setEditDocumentDriveUrl(e.target.value)}
                  placeholder="https://drive.google.com/drive/folders/1dKcGp0m7HF9esxIqCpmvqWu0WDew7cYO?usp=sharing"
                  className="w-full px-3 py-2 border rounded-xl outline-none focus:border-emerald-500 font-mono text-xs"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Link folder Google Drive resmi penyimpanan pas foto calon siswa.
                </p>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Status Pendaftaran</label>
                <select 
                  value={editStatus} 
                  onChange={(e) => setEditStatus(e.target.value as any)}
                  className="w-full px-3 py-2 border rounded-xl outline-none focus:border-emerald-500"
                >
                  <option value="DRAFT">Draft</option>
                  <option value="SUBMITTED">Submitted (Menunggu Verifikasi / Daftar Tunggu)</option>
                  <option value="VERIFIED">Verified (Berkas Lulus, Siap Tes)</option>
                  <option value="PASSED">Passed (Lulus Seleksi)</option>
                  <option value="REJECTED">Rejected (Ditolak / Perlu Perbaikan)</option>
                </select>
              </div>

              {editStatus === 'REJECTED' && (
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Alasan Penolakan / Catatan Perbaikan</label>
                  <textarea 
                    rows={3}
                    value={editReason}
                    onChange={(e) => setEditReason(e.target.value)}
                    placeholder="Contoh: Scan KK dan Rapor belum terbaca jelas..."
                    className="w-full px-3 py-2 border rounded-xl outline-none focus:border-emerald-500"
                  ></textarea>
                </div>
              )}

              <div className="pt-4 border-t flex justify-end gap-2">
                <button 
                  type="button" 
                  onClick={() => setEditingReg(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow"
                >
                  Update Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL UPDATE TAHAPAN & SELEKSI SPMB */}
      {/* ========================================================================= */}
      {stageModalReg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl relative max-h-[92vh] overflow-y-auto border border-slate-200">
            <button 
              onClick={() => setStageModalReg(null)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
            >
              <X size={20} />
            </button>

            {/* Modal Header */}
            <div className="flex items-start gap-3.5 mb-5 pb-4 border-b border-slate-100">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold text-xl shrink-0 border border-purple-200">
                <Brain size={24} />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-xl font-extrabold text-slate-900">
                    Kelola Tahapan & Seleksi SPMB
                  </h3>
                  <span className="font-mono text-xs bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full font-bold border border-slate-200">
                    #SPMB-{stageModalReg.id}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Calon Siswa: <strong className="text-slate-800">{stageModalReg.studentName || stageModalReg.userName}</strong> | Akun Wali: {stageModalReg.userName} ({stageModalReg.userEmail})
                </p>
              </div>
            </div>

            <form onSubmit={handleStageSubmit} className="space-y-4 text-xs">
              {/* 1. Tahapan SPMB */}
              <div className="bg-purple-50/70 p-4 rounded-2xl border border-purple-200">
                <label className="block text-purple-950 font-extrabold mb-1.5 flex items-center gap-1.5">
                  <Sparkles size={14} className="text-purple-600" />
                  <span>Tahapan Seleksi Saat Ini</span>
                </label>
                <select
                  value={editSpmbStage}
                  onChange={(e) => setEditSpmbStage(e.target.value as SpmbStage)}
                  className="w-full px-3.5 py-2.5 border border-purple-300 rounded-xl bg-white text-purple-950 font-bold outline-none focus:ring-2 focus:ring-purple-400"
                >
                  <option value="PENDAFTARAN">Tahap 1: Pendaftaran & Upload Berkas Google Drive</option>
                  <option value="TES_STIFIN">Tahap 2: Tes STIFIn (Mesin Kecerdasan & Bakat Genetik)</option>
                  <option value="WAWANCARA_ANAK">Tahap 3: Wawancara & Observasi Calon Siswa</option>
                  <option value="WAWANCARA_ORTU">Tahap 4: Wawancara Orang Tua (Penyelarasan Visi & Kemitraan)</option>
                  <option value="PENGUMUMAN">Tahap 5: Pengumuman Kelulusan Seleksi</option>
                  <option value="DAFTAR_ULANG">Tahap 6: Pendaftaran Ulang & Masuk</option>
                  <option value="SELESAI">Selesai (Resmi Menjadi Siswa Baru SD IT)</option>
                </select>
                <p className="text-[11px] text-purple-700 mt-1.5">
                  Tahapan ini akan langsung terlihat di akun login calon siswa / orang tua sebagai indikator progres seleksi.
                </p>
              </div>

              {/* 2. Hasil Tes STIFIn */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <label className="block text-slate-800 font-bold mb-1.5 flex items-center gap-1.5">
                  <Brain size={14} className="text-purple-600" />
                  <span>Hasil Pemetaan Tes STIFIn</span>
                </label>

                {/* Quick Selection Buttons */}
                <div className="flex flex-wrap gap-1.5 mb-2.5">
                  {STIFIN_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setEditStifinResult(opt.value)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                        editStifinResult === opt.value
                          ? 'bg-purple-700 text-white shadow-sm'
                          : 'bg-white text-slate-700 hover:bg-purple-50 border border-slate-200'
                      }`}
                    >
                      {opt.value}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setEditStifinResult('')}
                    className="px-2 py-1 rounded-lg text-[11px] font-medium text-slate-500 hover:bg-slate-200"
                  >
                    Kosongkan
                  </button>
                </div>

                <input
                  type="text"
                  value={editStifinResult}
                  onChange={(e) => setEditStifinResult(e.target.value)}
                  placeholder="Ketik hasil tes STIFIn lengkap jika ada catatan tambahan..."
                  className="w-full px-3 py-2 border rounded-xl bg-white outline-none focus:border-purple-500 font-semibold"
                />
              </div>

              {/* 3. Wawancara Anak & 4. Wawancara Orang Tua */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <label className="block text-slate-800 font-bold mb-1.5 flex items-center gap-1.5">
                    <Smile size={14} className="text-amber-600" />
                    <span>Catatan Observasi & Wawancara Anak</span>
                  </label>
                  <textarea
                    rows={3}
                    value={editInterviewChildNotes}
                    onChange={(e) => setEditInterviewChildNotes(e.target.value)}
                    placeholder="Observasi kematangan motorik, kemandirian, adab, daya simak, dsb..."
                    className="w-full px-3 py-2 border rounded-xl bg-white outline-none focus:border-amber-500"
                  ></textarea>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <label className="block text-slate-800 font-bold mb-1.5 flex items-center gap-1.5">
                    <UsersIcon size={14} className="text-cyan-600" />
                    <span>Catatan Wawancara Orang Tua</span>
                  </label>
                  <textarea
                    rows={3}
                    value={editInterviewParentNotes}
                    onChange={(e) => setEditInterviewParentNotes(e.target.value)}
                    placeholder="Penyelarasan visi pendidikan Islam, kesiapan pendampingan wali di rumah, dsb..."
                    className="w-full px-3 py-2 border rounded-xl bg-white outline-none focus:border-cyan-500"
                  ></textarea>
                </div>
              </div>

              {/* 5. Status Kelulusan Akhir */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <label className="block text-slate-800 font-bold mb-1.5 flex items-center gap-1.5">
                  <Award size={14} className="text-emerald-600" />
                  <span>Keputusan Kelulusan Seleksi Akhir</span>
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'PENDING', label: 'Dalam Seleksi (Pending)', color: 'border-amber-300 text-amber-900 bg-amber-50' },
                    { value: 'PASSED', label: 'Lulus Seleksi (Diterima)', color: 'border-emerald-400 text-emerald-900 bg-emerald-50' },
                    { value: 'FAILED', label: 'Tidak Lulus Seleksi', color: 'border-red-300 text-red-900 bg-red-50' },
                  ].map((st) => (
                    <button
                      key={st.value}
                      type="button"
                      onClick={() => setEditGraduationStatus(st.value as any)}
                      className={`p-2.5 rounded-xl border text-center font-bold text-xs transition-all cursor-pointer ${
                        editGraduationStatus === st.value
                          ? `${st.color} ring-2 ring-emerald-500/40 shadow-sm`
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 6. Pesan / Catatan / Jadwal untuk Pendaftar */}
              <div>
                <label className="block text-slate-800 font-bold mb-1 flex items-center justify-between">
                  <span>Pesan / Jadwal Khusus untuk Ditampilkan di Akun Pendaftar</span>
                  <span className="text-[10px] text-slate-400 font-normal">Terlihat langsung oleh wali</span>
                </label>
                <textarea
                  rows={2}
                  value={editStageNote}
                  onChange={(e) => setEditStageNote(e.target.value)}
                  placeholder="Contoh: Jadwal tes STIFIn & wawancara ananda dilaksanakan pada Sabtu, 28 Oktober 2026 pukul 08:30 WIB di Ruang Kesiswaan. Harap hadir 15 menit sebelum acara."
                  className="w-full px-3 py-2 border rounded-xl bg-white outline-none focus:border-emerald-500 font-medium"
                ></textarea>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setStageModalReg(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 size={15} />
                  <span>Simpan Perubahan Tahapan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ========================================================================= */}
      {/* MODAL EXPORT DATA PENDAFTAR KE EXCEL */}
      {/* ========================================================================= */}
      {isExportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl relative border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 text-white p-5 shrink-0 relative">
              <button 
                onClick={() => setIsExportModalOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                title="Tutup Modal"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-white shrink-0 shadow-inner">
                  <FileSpreadsheet size={22} className="text-emerald-300" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white leading-tight">
                    Export Data Pendaftar ke Excel
                  </h3>
                  <p className="text-emerald-100 text-xs mt-0.5">
                    Unduh rekapitulasi data SPMB SD IT Andalas Cendekia dalam format Microsoft Excel (.xls).
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs">
              
              {/* Opsi 1: Cakupan Data */}
              <div>
                <label className="block text-slate-700 font-extrabold uppercase text-[11px] tracking-wider mb-2">
                  1. Pilih Cakupan Data Calon Siswa
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  
                  {/* Card Semua Data */}
                  <div
                    onClick={() => setExportScope('ALL')}
                    className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                      exportScope === 'ALL'
                        ? 'border-emerald-600 bg-emerald-50/70 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-extrabold text-slate-900 text-xs">Semua Calon Siswa</span>
                        <input
                          type="radio"
                          name="exportScope"
                          checked={exportScope === 'ALL'}
                          onChange={() => setExportScope('ALL')}
                          className="accent-emerald-600 cursor-pointer"
                        />
                      </div>
                      <p className="text-slate-500 text-[11px] leading-relaxed">
                        Mengekspor seluruh calon siswa yang terdaftar di database tanpa filter.
                      </p>
                    </div>
                    <div className="mt-3">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        Total: {list.length} Calon Siswa
                      </span>
                    </div>
                  </div>

                  {/* Card Data Terfilter */}
                  <div
                    onClick={() => setExportScope('FILTERED')}
                    className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                      exportScope === 'FILTERED'
                        ? 'border-emerald-600 bg-emerald-50/70 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-extrabold text-slate-900 text-xs">Sesuai Filter Aktif</span>
                        <input
                          type="radio"
                          name="exportScope"
                          checked={exportScope === 'FILTERED'}
                          onChange={() => setExportScope('FILTERED')}
                          className="accent-emerald-600 cursor-pointer"
                        />
                      </div>
                      <p className="text-slate-500 text-[11px] leading-relaxed">
                        Hanya mengekspor calon siswa yang saat ini sedang tampil pada tabel.
                      </p>
                    </div>
                    <div className="mt-3">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900">
                        {filteredList.length} Calon Siswa
                      </span>
                    </div>
                  </div>

                </div>

                {/* Filter info badges jika filter dipilih */}
                {exportScope === 'FILTERED' && (stageFilter !== 'ALL' || statusFilter !== 'ALL' || search) && (
                  <div className="mt-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-600">
                    <span className="font-bold text-slate-700">Filter Aktif:</span>
                    {stageFilter !== 'ALL' && (
                      <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                        Tahap: {stageFilter}
                      </span>
                    )}
                    {statusFilter !== 'ALL' && (
                      <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-bold">
                        Status Berkas: {statusFilter}
                      </span>
                    )}
                    {search && (
                      <span className="bg-white border px-2 py-0.5 rounded font-semibold text-slate-700">
                        Cari: "{search}"
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Opsi 2: Format & Kedalaman Kolom */}
              <div>
                <label className="block text-slate-700 font-extrabold uppercase text-[11px] tracking-wider mb-2">
                  2. Pilih Format & Kelengkapan Kolom
                </label>
                <div className="space-y-2.5">
                  
                  {/* Card Format Detail Lengkap */}
                  <div
                    onClick={() => setExportFormat('DETAIL')}
                    className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer ${
                      exportFormat === 'DETAIL'
                        ? 'border-emerald-600 bg-emerald-50/70 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900 text-xs">Format Lengkap & Detail (35 Kolom)</span>
                        <span className="bg-emerald-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-2xs">
                          Rekomendasi
                        </span>
                      </div>
                      <input
                        type="radio"
                        name="exportFormat"
                        checked={exportFormat === 'DETAIL'}
                        onChange={() => setExportFormat('DETAIL')}
                        className="accent-emerald-600 cursor-pointer mt-0.5"
                      />
                    </div>
                    <p className="text-slate-600 text-[11px] leading-relaxed mt-1">
                      Mengekspor seluruh rekam data secara lengkap: <strong>Biodata Calon Siswa</strong> (NISN, NIK, TTL, Asal Sekolah, Program, Ukuran Seragam, Alamat), <strong>Data Orang Tua</strong> (Ayah, Ibu, No. WhatsApp dengan link chat aktif, Email), <strong>Tahapan Seleksi & STIFIn</strong>, <strong>Nilai Tes</strong>, <strong>Status Kelulusan</strong>, <strong>Catatan Wawancara Anak & Ortu</strong>, <strong>Biaya Bayar</strong>, <strong>Link Pas Foto & Google Drive</strong>, serta <strong>Survei</strong>.
                    </p>
                  </div>

                  {/* Card Format Ringkas */}
                  <div
                    onClick={() => setExportFormat('RINGKAS')}
                    className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer ${
                      exportFormat === 'RINGKAS'
                        ? 'border-emerald-600 bg-emerald-50/70 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className="font-extrabold text-slate-900 text-xs">Format Ringkas (14 Kolom Pokok)</span>
                      <input
                        type="radio"
                        name="exportFormat"
                        checked={exportFormat === 'RINGKAS'}
                        onChange={() => setExportFormat('RINGKAS')}
                        className="accent-emerald-600 cursor-pointer mt-0.5"
                      />
                    </div>
                    <p className="text-slate-600 text-[11px] leading-relaxed mt-1">
                      Data esensial untuk rekapitulasi cepat & absensi seleksi: No, No. Registrasi, Waktu Daftar, Nama Calon Siswa, L/P, NISN, Asal Sekolah, Program, Orang Tua, No. WhatsApp, Tahapan SPMB, STIFIn, Biaya Bayar, dan Kelulusan.
                    </p>
                  </div>

                </div>
              </div>

              {/* Info Box Sebelum Unduh */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-slate-600 flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span>Total Data Calon Siswa yang Diekspor:</span>
                  <strong className="text-slate-900 text-xs">
                    {exportScope === 'ALL' ? list.length : filteredList.length} Calon Siswa
                  </strong>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span>Format Spreadsheet:</span>
                  <strong className="text-emerald-700">Microsoft Excel (.xls) • UTF-8 Proteksi NIK/WA</strong>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span>Tahun Ajaran SPMB:</span>
                  <strong className="text-slate-900">{siteSettings.spmbAcademicYear || '2027/2028'}</strong>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 px-5 py-4 border-t border-slate-200 flex items-center justify-end gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => setIsExportModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={() => executeExportExcel()}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white shadow-md transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
              >
                <Download size={15} />
                <span>Unduh File Excel Sekarang</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Pas Foto Lightbox Modal */}
      {selectedPhoto && (() => {
        const isBroken = isBrokenOrTruncatedImage(selectedPhoto.url) || isModalPhotoError;

        return (
          <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">Pas Foto Calon Siswa</h3>
                  <p className="text-xs text-slate-500 font-medium">{selectedPhoto.name}</p>
                </div>
                <button 
                  onClick={() => setSelectedPhoto(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
                  title="Tutup"
                >
                  <X size={18} />
                </button>
              </div>

              {adminMediaMsg && (
                <div className={`p-3 mx-4 mt-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
                  adminMediaMsg.type === 'success' ? 'bg-emerald-50 text-emerald-900 border border-emerald-300' : 'bg-red-50 text-red-900 border border-red-300'
                }`}>
                  <CheckCircle2 size={15} className="shrink-0 text-emerald-600" />
                  <span>{adminMediaMsg.text}</span>
                </div>
              )}

              {isBroken && (
                <div className="p-3.5 mx-4 mt-3 bg-amber-50 border border-amber-300 rounded-2xl text-amber-900 text-xs flex items-start gap-2.5 shadow-2xs">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-bold text-amber-950">Pas Foto Terpotong di Database Server Lama</p>
                    <p className="text-[11px] text-amber-800 leading-relaxed">
                      Data gambar pas foto pendaftar ini sebelumnya terpotong oleh batasan kolom database MySQL lama (500 karakter).
                    </p>
                    <p className="text-[11px] text-amber-900 font-semibold">
                      💡 <strong>Solusi Cepat:</strong> Anda dapat langsung mengunggah pas foto baru yang jelas menggunakan tombol <strong>"Upload / Ganti Pas Foto"</strong> di bawah.
                    </p>
                  </div>
                </div>
              )}

              <div className="p-4 bg-slate-100 flex items-center justify-center min-h-[260px] m-4 rounded-2xl border border-slate-200">
                {isBroken ? (
                  <div className="text-center p-4 text-slate-500">
                    <AlertCircle size={36} className="mx-auto mb-2 text-amber-500" />
                    <p className="font-bold text-slate-700 text-xs">Foto tidak dapat ditampilkan (Rusak / Terpotong)</p>
                    <p className="text-[11px] text-slate-400 mt-1">Silakan klik "Upload / Ganti Pas Foto" di bawah untuk memperbarui.</p>
                  </div>
                ) : (
                  <img 
                    src={resolveImageUrl(selectedPhoto.url)} 
                    alt="Pas Foto Calon Siswa" 
                    onError={(e) => {
                      handleImageError(e, selectedPhoto.url);
                      if ((e.currentTarget as HTMLImageElement).dataset.retried === 'true') {
                        setIsModalPhotoError(true);
                      }
                    }}
                    className="max-h-[55vh] w-auto max-w-full rounded-xl shadow-md border border-slate-300 object-contain mx-auto"
                  />
                )}
              </div>

              <div className="p-4 bg-white border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                <div className="flex items-center gap-2">
                  {selectedPhoto.regId && (
                    <label className="inline-flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl cursor-pointer transition-all shadow-xs disabled:opacity-50">
                      {uploadingPhotoRegId === selectedPhoto.regId ? (
                        <>
                          <UploadCloud size={14} className="animate-spin" />
                          <span>Mengunggah...</span>
                        </>
                      ) : (
                        <>
                          <Upload size={14} />
                          <span>Upload / Ganti Pas Foto</span>
                        </>
                      )}
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => selectedPhoto.regId && handleAdminPhotoUpload(e, selectedPhoto.regId)} 
                        disabled={uploadingPhotoRegId === selectedPhoto.regId}
                      />
                    </label>
                  )}

                  {!isBroken && (
                    <a 
                      href={resolveImageUrl(selectedPhoto.url)} 
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
                  onClick={() => setSelectedPhoto(null)}
                  className="bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs px-5 py-2 rounded-xl transition-colors cursor-pointer text-center"
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
