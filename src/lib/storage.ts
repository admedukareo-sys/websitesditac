import { api } from './api';

export type UserRole = 'STUDENT' | 'ADMIN' | 'PANITIA_SPMB';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  password?: string;
  phone?: string;
}

export type SpmbStage =
  | 'PENDAFTARAN'      // 1. Pendaftaran & Upload Berkas Google Drive
  | 'TES_STIFIN'       // 2. Tes STIFIn (Mesin Kecerdasan & Bakat)
  | 'WAWANCARA_ANAK'   // 3. Wawancara & Observasi Calon Siswa
  | 'WAWANCARA_ORTU'   // 4. Wawancara Orang Tua / Kemitraan Wali
  | 'PENGUMUMAN'       // 5. Pengumuman Kelulusan
  | 'DAFTAR_ULANG'     // 6. Pendaftaran Ulang & Masuk
  | 'SELESAI';         // Selesai / Siswa Baru Resmi

export interface SpmbStageConfig {
  key: SpmbStage;
  stepNumber: number;
  title: string;
  shortTitle: string;
  desc: string;
  iconName: string;
}

export const SPMB_STAGES_LIST: SpmbStageConfig[] = [
  {
    key: 'PENDAFTARAN',
    stepNumber: 1,
    title: 'Pendaftaran & Berkas',
    shortTitle: 'Pendaftaran',
    desc: 'Pengisian biodata calon siswa dan upload berkas persyaratan ke Google Drive.',
    iconName: 'FileText',
  },
  {
    key: 'TES_STIFIN',
    stepNumber: 2,
    title: 'Tes STIFIn',
    shortTitle: 'Tes STIFIn',
    desc: 'Pemetaan potensi genetik, mesin kecerdasan (Sensing, Thinking, Intuiting, Feeling, Instinct) & karakter.',
    iconName: 'Brain',
  },
  {
    key: 'WAWANCARA_ANAK',
    stepNumber: 3,
    title: 'Wawancara & Observasi Anak',
    shortTitle: 'Wawancara Anak',
    desc: 'Observasi kematangan motorik, sosial, kemandirian, dan adab calon siswa.',
    iconName: 'Smile',
  },
  {
    key: 'WAWANCARA_ORTU',
    stepNumber: 4,
    title: 'Wawancara Orang Tua',
    shortTitle: 'Wawancara Ortu',
    desc: 'Penyelarasan visi pendidikan Islam, kesiapan pendampingan ananda, dan kemitraan orang tua.',
    iconName: 'Users',
  },
  {
    key: 'PENGUMUMAN',
    stepNumber: 5,
    title: 'Pengumuman Kelulusan',
    shortTitle: 'Pengumuman',
    desc: 'Pengumuman hasil akhir seleksi penerimaan santri/siswa baru SD IT Andalas Cendekia.',
    iconName: 'Award',
  },
  {
    key: 'DAFTAR_ULANG',
    stepNumber: 6,
    title: 'Daftar Ulang',
    shortTitle: 'Daftar Ulang',
    desc: 'Pemberkasan akhir, fitting seragam, administrasi masuk, dan resmi menjadi siswa baru.',
    iconName: 'CheckCircle2',
  },
];

export interface Registration {
  id: number;
  clientId?: string;
  userId: number;
  studentName?: string;
  nisn?: string;
  nik?: string;
  birthPlace?: string;
  birthDate?: string;
  gender?: string;
  address?: string;
  fatherName?: string;
  motherName?: string;
  parentPhone?: string;
  previousSchool?: string;
  status: 'DRAFT' | 'SUBMITTED' | 'VERIFIED' | 'REJECTED' | 'PASSED' | 'FAILED' | 'REGISTERED';
  spmbStage?: SpmbStage;
  stifinResult?: string;
  interviewChildNotes?: string;
  interviewParentNotes?: string;
  graduationStatus?: 'PENDING' | 'PASSED' | 'FAILED';
  stageNote?: string;
  rejectionReason?: string;
  aktaUrl?: string;
  kkUrl?: string;
  fotoUrl?: string;
  raporUrl?: string;
  documentDriveUrl?: string;
  paymentProofUrl?: string;
  paymentStatus: 'UNPAID' | 'PENDING' | 'VERIFIED';
  testScore?: number;
  interviewNotes?: string;
  reRegistrationProofUrl?: string;
  uniformSize?: string;
  programType?: 'BOARDING' | 'REGULER';
  infoSource?: string;
  reasonToJoin?: string;
  createdAt: string;
  updatedAt: string;
}

export function formatDateTime(isoString?: string): string {
  if (!isoString) return '-';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    const formatted = d.toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    return `${formatted.replace('.', ':')} WIB`;
  } catch (e) {
    return isoString;
  }
}

export interface SiteSettings {
  schoolName: string;
  tagline: string;
  visi: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  npsn: string;
  accreditation: string;
  videoUrl: string;
  facebookUrl?: string;
  instagramUrl?: string;
  youtubeUrl?: string;
  principalName?: string;
  principalTitle?: string;
  principalMessage?: string;
  principalPhotoUrl?: string;
  historyText?: string;
  spmbAcademicYear?: string;
  spmbHidePayment?: boolean;
  spmbStatusText?: string;
  spmbWaitlistNotice?: string;
  spmbDriveFolderUrl?: string;
  // Official School Profile Details
  skPendirian?: string;
  tglSkPendirian?: string;
  skIzinOperasional?: string;
  tglSkIzinOperasional?: string;
  yayasan?: string;
  bankName?: string;
  bankAccNo?: string;
  bankAccName?: string;
  bankBranch?: string;
  npwp?: string;
  geoLat?: string;
  geoLong?: string;
  waktuPenyelenggaraan?: string;
  menerimaBos?: string;
  sumberListrik?: string;
  luasLahan?: string;
  kepemilikanTanah?: string;
  totalSiswa?: number;
  totalGuru?: number;
  totalTendik?: number;
  totalRombel?: number;
  sumberAir?: string;
  tipeJamban?: string;
  // Official Blueprint Fields
  beliefText?: string;
  ayatQuote?: string;
  misiList?: string[];
  valuesList?: string[];
  tujuanList?: string[];
  mapEmbedUrl?: string;
}

export interface NewsItem {
  id: number;
  title: string;
  category: 'Berita Terkini' | 'Kegiatan Sekolah' | 'Prestasi' | 'Galeri';
  date: string;
  author: string;
  commentsCount: number;
  imageUrl: string;
  excerpt: string;
  content: string;
}

export interface EventItem {
  id: number;
  day: string;
  month: string;
  title: string;
  time: string;
  location: string;
  category: string;
  description: string;
  organizer: string;
}

export interface SlideItem {
  id: number;
  badge: string;
  title: string;
  description: string;
  imageUrl: string;
  primaryCtaText: string;
  primaryCtaLink: string;
  secondaryCtaText: string;
  secondaryCtaLink: string;
}

export interface FacilityItem {
  id: number;
  title: string;
  category: 'Akademik' | 'Keagamaan' | 'Teknologi' | 'Olahraga & Terbuka';
  description: string;
  imageUrl: string;
}

export interface TestimonialItem {
  id: number;
  name: string;
  role: string;
  rating: number;
  quote: string;
  avatarUrl: string;
  timeAgo?: string;
}

export interface ActivityAchievementItem {
  id: number;
  title: string;
  type: 'Prestasi' | 'Aktivitas Kesiswaan' | 'Ekstrakurikuler';
  category: string;
  date: string;
  studentName: string;
  achievementBadge: string;
  description: string;
  imageUrl: string;
}

export interface CurriculumTahfidzItem {
  id: number;
  title: string;
  type: 'Program Tahfidz' | 'Program Kurikulum' | 'Profil Lulusan';
  target: string;
  description: string;
  badgeColor?: string;
}

export interface TeacherItem {
  id: number;
  name: string;
  role: string;
  mapel: string;
  strata: string;
  photoUrl?: string;
}

export interface AdvantageItem {
  id: number;
  title: string;
  desc: string;
  iconName?: string;
}

const STORAGE_KEYS = {
  USERS: 'sdit_users',
  REGISTRATIONS: 'sdit_registrations',
  CURRENT_USER: 'sdit_current_user',
  SITE_SETTINGS: 'sdit_site_settings',
  SITE_NEWS: 'sdit_site_news',
  SITE_EVENTS: 'sdit_site_events',
  SITE_SLIDES: 'sdit_site_slides',
  SITE_FACILITIES: 'sdit_site_facilities',
  SITE_TESTIMONIALS: 'sdit_site_testimonials',
  SITE_ACTIVITIES: 'sdit_site_activities',
  SITE_CURRICULUM: 'sdit_site_curriculum',
  SITE_TEACHERS: 'sdit_site_teachers',
  SITE_ADVANTAGES: 'sdit_site_advantages',
};

// Seed initial data if empty
function initializeStorage() {
  const existingUsersRaw = localStorage.getItem(STORAGE_KEYS.USERS);
  if (!existingUsersRaw) {
    const initialUsers: User[] = [
      {
        id: 1,
        name: 'Administrator SPMB',
        email: 'admin@sdit.sch.id',
        role: 'ADMIN',
        password: 'admin',
      },
      {
        id: 2,
        name: 'Ahmad Zaki',
        email: 'zaki@gmail.com',
        role: 'STUDENT',
        password: 'password123',
      },
      {
        id: 4,
        name: 'Panitia SPMB SD IT',
        email: 'panitia@sdit.sch.id',
        role: 'PANITIA_SPMB',
        password: 'panitia123',
      },
    ];
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(initialUsers));
  } else {
    try {
      const usersList: User[] = JSON.parse(existingUsersRaw);
      let updated = false;
      const hasSditAdmin = usersList.some((u) => u.email.toLowerCase() === 'admin@sdit.sch.id');
      if (!hasSditAdmin) {
        const oldAdminIdx = usersList.findIndex((u) => u.role === 'ADMIN');
        if (oldAdminIdx !== -1) {
          usersList[oldAdminIdx].email = 'admin@sdit.sch.id';
          usersList[oldAdminIdx].password = 'admin';
        } else {
          usersList.unshift({
            id: 1,
            name: 'Administrator SPMB',
            email: 'admin@sdit.sch.id',
            role: 'ADMIN',
            password: 'admin',
          });
        }
        updated = true;
      }

      const hasPanitia = usersList.some((u) => u.email.toLowerCase() === 'panitia@sdit.sch.id');
      if (!hasPanitia) {
        usersList.push({
          id: 4,
          name: 'Panitia SPMB SD IT',
          email: 'panitia@sdit.sch.id',
          role: 'PANITIA_SPMB',
          password: 'panitia123',
        });
        updated = true;
      }

      if (updated) {
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(usersList));
      }
    } catch (e) {
      // Ignore
    }
  }

  // Bersihkan data dummy mock pendaftar bawaan (Budi Santoso) jika ada di localStorage
  try {
    const rawRegs = localStorage.getItem(STORAGE_KEYS.REGISTRATIONS);
    if (rawRegs) {
      const parsedRegs = JSON.parse(rawRegs);
      if (Array.isArray(parsedRegs)) {
        const cleaned = parsedRegs.filter((r) => !(r.id === 1 && (r.fatherName === 'Budi Santoso' || !r.studentName)));
        if (cleaned.length !== parsedRegs.length) {
          localStorage.setItem(STORAGE_KEYS.REGISTRATIONS, JSON.stringify(cleaned));
        }
      }
    }
  } catch (e) { }

  if (!localStorage.getItem(STORAGE_KEYS.REGISTRATIONS)) {
    localStorage.setItem(STORAGE_KEYS.REGISTRATIONS, JSON.stringify([]));
  }

  if (!localStorage.getItem(STORAGE_KEYS.SITE_SETTINGS)) {
    const defaultSettings: SiteSettings = {
      schoolName: 'SDIT ANDALAS CENDEKIA',
      tagline: 'Sekolah Generasi Pemimpin Qur’ani',
      visi: 'Mewujudkan Siswa Generasi Pemimpin Qur’ani',
      beliefText: 'Cerdas Penuh Ketaqwaan',
      ayatQuote: '“Kamu adalah umat terbaik yang dilahirkan untuk manusia, menyuruh kepada yang ma’ruf, dan mencegah dari yang munkar, dan beriman kepada Allah.” (QS. Ali Imran: 110)',
      misiList: [
        'Menjadikan SDM Civitas Andalas Cendekia unggul, berkarakter Al-Qur\'an dan profesional.',
        'Menjadikan peserta didik yang berkarakter Al-Qur\'an dengan potensi yang Allah berikan kepadanya.',
        'Menyelenggarakan sekolah berbasis teknologi informasi.',
        'Menjadikan peserta didik yang menguasai teknologi informasi dan komunikasi.',
        'Membangun sinergi dengan stakeholder untuk penyelenggaraan pendidikan.'
      ],
      valuesList: [
        'Memulai sesuatu dengan basmalah',
        'Syukur',
        'Berpikir Positif',
        'Bercita-cita tinggi',
        'Beribadah dan Berdo\'a',
        'Bersungguh-sungguh dalam bertindak',
        'Perbaikan Berkelanjutan'
      ],
      address: 'JL. Kampung Baru No.36, RT 00/RW 00, Kel. Sikabau, Kec. Pulau Punjung, Kab. Dharmasraya, Prov. Sumatera Barat 27573',
      phone: '0811-6696-990',
      email: 'sditac1@gmail.com',
      website: 'https://sdit.andalascendekia.sch.id',
      npsn: '10310802',
      accreditation: 'Akreditasi A',
      videoUrl: 'https://www.youtube.com/embed/vNUhnzfGFKY?autoplay=1',
      facebookUrl: 'https://facebook.com',
      instagramUrl: 'https://instagram.com',
      youtubeUrl: 'https://youtube.com',
      principalName: 'Rika Handayani, S.Pd.,Gr.',
      principalTitle: 'Kepala Sekolah SD IT Andalas Cendekia',
      principalMessage: 'Assalamu\'alaikum Warahmatullahi Wabarakatuh. Selamat datang di portal resmi SD IT Andalas Cendekia. Kami berkomitmen menyelenggarakan pendidikan dasar Islam terpadu yang membekali pendidikan agama, adab dan akhlak mulia, kecakapan hidup kekinian, serta penguasaan sains dan teknologi untuk membentuk Generasi Pemimpin Qur\'ani.',
      principalPhotoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
      historyText: 'SD IT Andalas Cendekia didirikan berdasarkan SK No. 188.45/36/Kpts-C-PLP/2011 pada tanggal 14 November 2011 di Kabupaten Dharmasraya, Sumatera Barat. Lembaga ini hadir sebagai komitmen nyata untuk mencetak generasi pemimpin Qur\'ani yang berakhlak mulia, cerdas akademis, dan berkarakter Al-Qur\'an.',
      spmbAcademicYear: '2027/2028',
      spmbHidePayment: false,
      spmbStatusText: 'Pendaftaran Dibuka',
      spmbWaitlistNotice: 'Biaya pendaftaran sebesar Rp 250.000 ditransfer ke Bank Nagari: 71050220008996 an. Yayasan Andalas Cendekia. Silakan upload bukti transfer di menu Pembayaran.',
      spmbDriveFolderUrl: 'https://drive.google.com/drive/folders/1dKcGp0m7HF9esxIqCpmvqWu0WDew7cYO?usp=sharing',
      skPendirian: '188.45/36/Kpts-C-PLP/2011',
      tglSkPendirian: '2011-11-14',
      skIzinOperasional: '421.1/102/DISDIKPORA/2011',
      tglSkIzinOperasional: '2011-09-28',
      yayasan: 'Yayasan Andalas Cendekia',
      bankName: 'Bank Nagari',
      bankAccNo: '71050220008996',
      bankAccName: 'Yayasan Andalas Cendekia',
      bankBranch: 'Dharmasraya',
      npwp: '001276922203000',
      geoLat: '-0.9965',
      geoLong: '-0.9965',
      waktuPenyelenggaraan: 'Sehari Penuh/5 hari',
      menerimaBos: 'Ya',
      sumberListrik: 'PLN (7700 Watt)',
      luasLahan: '4250.3 m²',
      kepemilikanTanah: 'Bukan Milik',
      totalSiswa: 537,
      totalGuru: 47,
      totalTendik: 11,
      totalRombel: 24,
      sumberAir: 'Sumur terlindungi',
      tipeJamban: 'Leher angsa (toilet jongkok)'
    };
    localStorage.setItem(STORAGE_KEYS.SITE_SETTINGS, JSON.stringify(defaultSettings));
    localStorage.setItem('sdit_settings_v8', 'true');
    localStorage.setItem('sdit_settings_v7', 'true');
  } else {
    // Flag versi diset agar tidak pernah menimpa konfigurasi yang sudah disimpan user
    localStorage.setItem('sdit_settings_v8', 'true');
    localStorage.setItem('sdit_settings_v7', 'true');
    try {
      const rawSettings = localStorage.getItem(STORAGE_KEYS.SITE_SETTINGS);
      if (rawSettings) {
        const parsed = JSON.parse(rawSettings);
        let changed = false;
        if (!parsed.phone || parsed.phone === '0812-6655-8123') {
          parsed.phone = '0811-6696-990';
          changed = true;
        }
        if (!parsed.bankAccNo || parsed.bankAccNo === '14030101004636' || parsed.bankAccNo === '783101008882539') {
          parsed.bankAccNo = '71050220008996';
          parsed.bankName = 'Bank Nagari';
          parsed.bankAccName = 'Yayasan Andalas Cendekia';
          changed = true;
        }
        if (parsed.spmbHidePayment === true) {
          parsed.spmbHidePayment = false;
          changed = true;
        }
        if (!parsed.videoUrl || parsed.videoUrl.includes('9E09XrFAi_s')) {
          parsed.videoUrl = 'https://www.youtube.com/embed/vNUhnzfGFKY?autoplay=1';
          changed = true;
        }
        if (!parsed.spmbDriveFolderUrl || parsed.spmbDriveFolderUrl.includes('1_example_folder_spmb_sditac')) {
          parsed.spmbDriveFolderUrl = 'https://drive.google.com/drive/folders/1dKcGp0m7HF9esxIqCpmvqWu0WDew7cYO?usp=sharing';
          changed = true;
        }
        if (changed) {
          localStorage.setItem(STORAGE_KEYS.SITE_SETTINGS, JSON.stringify(parsed));
        }
      }
    } catch (e) {
      // ignore
    }
  }

  if (!localStorage.getItem(STORAGE_KEYS.SITE_NEWS)) {
    const defaultNews: NewsItem[] = [
      {
        id: 1,
        title: 'Siswa SD IT Andalas Cendekia Raih Bintang Utama Festival Sang Bintang (FeSTa) 2026',
        category: 'Prestasi',
        date: '23/04/2026',
        author: 'Tim Humas',
        commentsCount: 12,
        imageUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80',
        excerpt: 'Siswa SD IT Andalas Cendekia memamerkan hasil karya dan keahlian ekstrakurikuler PRISE serta pencapaian karakter & tahfizh Al-Qur’an.',
        content: 'Pada ajang Festival Sang Bintang (FeSTa) tahunan SD IT Andalas Cendekia, para siswa menampilkan berbagai unjuk kemampuan dari 9 cabang ekstrakurikuler PRISE serta kelancaran hafalan Al-Qur’an dan Hadits.',
      },
    ];
    localStorage.setItem(STORAGE_KEYS.SITE_NEWS, JSON.stringify(defaultNews));
  }

  if (!localStorage.getItem(STORAGE_KEYS.SITE_EVENTS)) {
    const defaultEvents: EventItem[] = [
      {
        id: 1,
        day: '15',
        month: 'OKT',
        title: 'Festival Sang Bintang (FeSTa) & Wisuda Tahfizh SD IT 2026',
        time: '08:00 WIB – Selesai',
        location: 'Kampus SD IT Andalas Cendekia',
        category: 'Keagamaan & Pentas Bakat',
        description: 'Pentas unjuk bakat ekstrakurikuler PRISE, pameran karya siswa, dan penganugerahan award siswa Unggul Berkarakter Al-Qur’an.',
        organizer: 'Panitia FeSTa & Kesiswaan SD IT',
      },
    ];
    localStorage.setItem(STORAGE_KEYS.SITE_EVENTS, JSON.stringify(defaultEvents));
  }

  if (!localStorage.getItem(STORAGE_KEYS.SITE_SLIDES) || localStorage.getItem('sdit_slides_v4') !== 'true') {
    const defaultSlides: SlideItem[] = [
      {
        id: 1,
        badge: 'Kampus Yayasan',
        title: 'Gedung dan Halaman Megah Kampus Yayasan',
        description: 'Arsitektur megah kampus yayasan dengan halaman terbuka yang asri dan luas.',
        imageUrl: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=2560&q=90',
        primaryCtaText: '',
        primaryCtaLink: '',
        secondaryCtaText: '',
        secondaryCtaLink: '',
      },
      {
        id: 2,
        badge: 'Aktivitas Belajar',
        title: 'Aktivitas Belajar Interaktif Siswa dan Guru',
        description: 'Aktivitas belajar interaktif, inspiratif, dan kolaboratif antara siswa dan guru di ruang kelas modern.',
        imageUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=2560&q=90',
        primaryCtaText: '',
        primaryCtaLink: '',
        secondaryCtaText: '',
        secondaryCtaLink: '',
      },
      {
        id: 3,
        badge: 'Perpustakaan & Riset',
        title: 'Fasilitas Perpustakaan dan Riset Modern',
        description: 'Fasilitas perpustakaan dan riset modern yang lengkap untuk mendukung literasi serta wawasan global.',
        imageUrl: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=2560&q=90',
        primaryCtaText: '',
        primaryCtaLink: '',
        secondaryCtaText: '',
        secondaryCtaLink: '',
      },
      {
        id: 4,
        badge: 'Lingkungan Asri',
        title: 'Arsitektur Lingkungan Sekolah yang Asri dan Representatif',
        description: 'Arsitektur tata ruang hijau lingkungan sekolah yang asri, sejuk, dan representatif bagi pendidikan anak.',
        imageUrl: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=2560&q=90',
        primaryCtaText: '',
        primaryCtaLink: '',
        secondaryCtaText: '',
        secondaryCtaLink: '',
      }
    ];
    localStorage.setItem(STORAGE_KEYS.SITE_SLIDES, JSON.stringify(defaultSlides));
    localStorage.setItem('sdit_slides_v4', 'true');
  }

  if (!localStorage.getItem(STORAGE_KEYS.SITE_FACILITIES)) {
    const defaultFacilities: FacilityItem[] = [
      {
        id: 1,
        title: 'Smart Classroom Interaktif',
        category: 'Akademik',
        description: 'Ruang kelas dilengkapi pendingin udara, layar sentuh digital interaktif, dan sound system pendukung.',
        imageUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80',
      },
    ];
    localStorage.setItem(STORAGE_KEYS.SITE_FACILITIES, JSON.stringify(defaultFacilities));
  }

  if (!localStorage.getItem(STORAGE_KEYS.SITE_TESTIMONIALS)) {
    const defaultTestimonials: TestimonialItem[] = [
      {
        id: 1,
        name: 'Dr. H. Hendra Wijaya, M.Si.',
        role: 'Orang Tua Siswa Kelas 4',
        rating: 5,
        quote: 'Alhamdulillah, perkembangan hafalan Al-Qur\'an dan kedisiplinan anak saya meningkat drastis semenjak bersekolah di SD IT Andalas Cendekia.',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      },
    ];
    localStorage.setItem(STORAGE_KEYS.SITE_TESTIMONIALS, JSON.stringify(defaultTestimonials));
  }

  if (!localStorage.getItem(STORAGE_KEYS.SITE_ACTIVITIES) || localStorage.getItem('sdit_activities_v4') !== 'true') {
    const defaultActivities: ActivityAchievementItem[] = [
      {
        id: 1,
        title: 'Paskibraka Kab. Dharmasraya',
        type: 'Prestasi',
        category: 'Tingkat Kabupaten',
        date: 'Agustus 2025',
        studentName: 'Fauzi Kurniawan',
        achievementBadge: 'Paskibraka Kab.',
        description: 'Terpilih dan bertugas sebagai anggota Pasukan Pengibar Bendera Pusaka (Paskibraka) Kabupaten Dharmasraya tahun 2025.',
        imageUrl: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=800&q=80',
      },
      {
        id: 2,
        title: "Tasmi' Al Quran 12 Juz",
        type: 'Prestasi',
        category: 'Program Tahfidz',
        date: 'Oktober 2025',
        studentName: 'Nadya Shiddiqia Yusuf',
        achievementBadge: "Tasmi' 12 Juz",
        description: "Berhasil menuntaskan ujian Tasmi' Al-Qur'an hafalan 12 Juz sekali duduk dengan predikat Mumtaz.",
        imageUrl: 'https://images.unsplash.com/photo-1585036156171-384164a8c675?auto=format&fit=crop&w=800&q=80',
      },
      {
        id: 3,
        title: 'Tekno Kids & Coding AI',
        type: 'Ekstrakurikuler',
        category: 'Ekskul PRISE',
        date: 'Rutin Mingguan',
        studentName: 'Siswa Kelas 4-6',
        achievementBadge: 'Ekskul Unggulan',
        description: 'Pembelajaran logika dasar pemrograman, Scratch, coding web interaktif, dan pengenalan kecerdasan buatan (AI) bagi generasi digital.',
        imageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80',
      },
      {
        id: 4,
        title: 'Kader Polisi Cilik (Pocil)',
        type: 'Aktivitas Kesiswaan',
        category: 'Pembinaan Karakter',
        date: 'Program Kedisiplinan',
        studentName: 'Pasukan Pocil SD IT',
        achievementBadge: 'Kader Kedisiplinan',
        description: 'Latihan kedisiplinan, baris berbaris, kepemimpinan, dan pembentukan karakter penegak aturan sekolah bekerjasama dengan Polres Dharmasraya.',
        imageUrl: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=800&q=80',
      },
      {
        id: 5,
        title: 'Panahan & Futsal (Atlet Cilik)',
        type: 'Ekstrakurikuler',
        category: 'Ekskul PRISE',
        date: 'Rutin Mingguan',
        studentName: 'Siswa Kelas 1-6',
        achievementBadge: 'Olahraga Sunnah',
        description: 'Pelatihan olahraga sunnah memanah dan futsal untuk mengasah konsentrasi, fisik, ketangkasan, serta jiwa sportivitas tinggi.',
        imageUrl: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=800&q=80',
      },
      {
        id: 6,
        title: 'Nada Islami & Nasyid Hadrah',
        type: 'Ekstrakurikuler',
        category: 'Ekskul PRISE',
        date: 'Rutin Mingguan',
        studentName: 'Grup Nasyid SD IT',
        achievementBadge: "Seni Qur'ani",
        description: 'Wadah pembinaan bakat seni musik islami, lantunan shalawat, seni alat musik hadrah, dan pengembangan vokal siswa.',
        imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80',
      },
      {
        id: 7,
        title: 'Festival Sang Bintang (FeSTa)',
        type: 'Aktivitas Kesiswaan',
        category: 'Agenda Tahunan',
        date: 'Tahunan (Bulan ke-9)',
        studentName: 'Seluruh Siswa SD IT',
        achievementBadge: 'Pentas Bakat & Karya',
        description: 'Ajang tahunan unjuk kebolehan minat bakat, pameran hasil karya inovatif siswa, serta penganugerahan piala bintang siswa.',
        imageUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80',
      },
      {
        id: 8,
        title: "Camp Tahfidz & Tasmi' Muroja'ah",
        type: 'Aktivitas Kesiswaan',
        category: 'Program Keagamaan',
        date: 'Berkala Tiap Semester',
        studentName: 'Peserta Halal Tahfidz',
        achievementBadge: 'Sertifikasi Hafalan',
        description: "Karantina intensif hafalan Al-Qur'an, murojaah bersama musyrif, dan ujian Tasmi' hafalan 1 hingga 10 Juz sekali duduk.",
        imageUrl: 'https://images.unsplash.com/photo-1585036156171-384164a8c675?auto=format&fit=crop&w=800&q=80',
      },
      {
        id: 9,
        title: 'Kreasi Ceria & Seni Kriya',
        type: 'Ekstrakurikuler',
        category: 'Ekskul PRISE',
        date: 'Rutin Mingguan',
        studentName: 'Siswa Kelas 1-6',
        achievementBadge: 'Seni Rupa & Kriya',
        description: 'Pengembangan estetika dan imajinasi tangan melalui melukis, membuat kerajinan kriya dari bahan bekas, serta pameran visual.',
        imageUrl: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=800&q=80',
      },
      {
        id: 10,
        title: 'Lolos ke Babak Penyisihan Provinsi TKA Bintang Pelajar',
        type: 'Prestasi',
        category: 'Tingkat Provinsi',
        date: 'Oktober 2025',
        studentName: 'Fauzi, Saslix, Farid',
        achievementBadge: 'Penyisihan Provinsi',
        description: 'Lolos ke Babak Penyisihan Provinsi TKA Bintang Pelajar mewakili SD IT Andalas Cendekia.',
        imageUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80',
      },
      {
        id: 11,
        title: 'Lolos ke Tingkat Nasional Mewakili Sumatera Barat - Science Student Olympiad Dalton 2.0',
        type: 'Prestasi',
        category: 'Tingkat Nasional',
        date: 'Oktober 2025',
        studentName: 'Farziyadatur Rahmah',
        achievementBadge: 'Utusan Nasional Sumbar',
        description: 'Lolos ke Tingkat Nasional mewakili Sumatera Barat bidang study Biologi, Ekonomi, Bahasa Inggris, Bahasa Indonesia Science Student Olympiad Dalton 2.0.',
        imageUrl: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=800&q=80',
      },
      {
        id: 12,
        title: 'Peraih Medali Perak Karate Festival Kumite -35kg Pemula Putri TAKO CUP',
        type: 'Prestasi',
        category: 'Tingkat Regional',
        date: 'Oktober 2025',
        studentName: 'Syalwa Enjelita',
        achievementBadge: 'Medali Perak',
        description: 'Peraih medali perak karate festival kumite -35kg pemula putri TAKO CUP di Padang.',
        imageUrl: 'https://images.unsplash.com/photo-1517649763962-0c623266010b?auto=format&fit=crop&w=800&q=80',
      },
      {
        id: 13,
        title: 'Peraih Medali Olimpiade Tingkat Nasional Science Student Olympiad Dalton 2.0',
        type: 'Prestasi',
        category: 'Tingkat Nasional',
        date: 'November 2025',
        studentName: 'Farziyadatur Rahmah',
        achievementBadge: '2 Emas, 1 Perak, 1 Perunggu',
        description: 'Peraih medali Olimpiade tingkat nasional Science Student Olympiad Dalton 2.0 emas bidang study ekonomi, emas bidang study bahasa inggris, perak bidang study bahasa indonesia, & medali perunggu bidang study biologi.',
        imageUrl: 'https://images.unsplash.com/photo-1567168544813-cc03465b4fa8?auto=format&fit=crop&w=800&q=80',
      },
      {
        id: 14,
        title: 'Peraih Multi Medali Olimpiade Nasional (IYSMO, Brilliant, SAO & KJSI)',
        type: 'Prestasi',
        category: 'Tingkat Nasional',
        date: 'November 2025',
        studentName: 'Nasya Aqillah',
        achievementBadge: '1 Emas, 3 Perak, 1 Perunggu',
        description: 'Peraih medali emas IYSMO pendidikan agama, perak BRILLIANT ACADEMIC OLYMPIADE mapel PAI, Perak IYSMO Bahasa Inggris, Perak STUDENT ACHIVEMENT OLYMPIADE B. Indonesia, & perunggu Kompetisi Jenius siswa Indonesia mapel PAI.',
        imageUrl: 'https://images.unsplash.com/photo-1576267423445-b2e0074d68a4?auto=format&fit=crop&w=800&q=80',
      },
      {
        id: 15,
        title: 'Peraih Medali di IASC 2025 (Perak & Perunggu)',
        type: 'Prestasi',
        category: 'Tingkat Nasional',
        date: 'November 2025',
        studentName: 'Syalwa Enjelita',
        achievementBadge: 'Perak & Perunggu',
        description: 'Peraih medali di IASC 2025, perak Pendidikan Agama dan budi pekerti, & medali Perunggu.',
        imageUrl: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=800&q=80',
      },
      {
        id: 16,
        title: 'Lolos Seleksi Kurasi Karya Sayembara 7 KAIH Kemendikdasmen',
        type: 'Prestasi',
        category: 'Tingkat Nasional',
        date: 'Desember 2025',
        studentName: 'Raffel Saslix & Meka Oliviana',
        achievementBadge: 'Kurasi Karya Nasional',
        description: 'Lolos seleksi kurasi karya sayembara 7 KAIH yang diselenggarakan kemendikdasmen.',
        imageUrl: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=800&q=80',
      },
    ];
    localStorage.setItem(STORAGE_KEYS.SITE_ACTIVITIES, JSON.stringify(defaultActivities));
    localStorage.setItem('sdit_activities_v4', 'true');
  }

  if (!localStorage.getItem(STORAGE_KEYS.SITE_CURRICULUM) || localStorage.getItem('sdit_curriculum_v3') !== 'true') {
    const defaultCurriculum: CurriculumTahfidzItem[] = [
      {
        id: 1,
        title: 'Muatan Kemendikbud & Internalisasi Islam',
        type: 'Program Kurikulum',
        target: 'Standar CP Kemendikbud + 7 Prinsip Andalas Cendekia',
        description: 'Penerapan Capaian Pembelajaran Kemendikbud dengan internalisasi nilai Islam dan koreksi pada materi yang tidak sejalan dengan Al-Qur\'an & Hadits.',
        badgeColor: 'bg-blue-600',
      },
      {
        id: 2,
        title: 'Muatan Lokal (Tahsin, Tahfizh & BAM)',
        type: 'Program Kurikulum',
        target: 'Min. 2 Juz Hafalan, 20 Hadits & Do\'a Harian',
        description: 'Pembelajaran Tahsin Al-Qur\'an metode PQ & KIBAR, Tahfizh Al-Qur\'an, Hadits pilihan, do\'a harian, dan Budaya Alam Minangkabau (BAM).',
        badgeColor: 'bg-emerald-600',
      },
      {
        id: 3,
        title: 'Program Rising Star Andalas Cendekia (PRISE)',
        type: 'Program Kurikulum',
        target: 'Little Star (Kelas 1-3) & Peminatan 9 Ekskul (Kelas 4-6)',
        description: 'Ekstrakurikuler wajib berbasis Multiple Intelligences (SLIM EN BIL) untuk melejitkan minat dan bakat siswa menjadi bintang.',
        badgeColor: 'bg-amber-500',
      },
      {
        id: 4,
        title: 'Bina Siswa Qur’ani (Bi-SQ) & Polisi Cilik',
        type: 'Program Tahfidz',
        target: 'Internalisasi 24 Karakter Al-Qur\'an (Metode 3HA)',
        description: 'Pembentukan karakter Islami melalui tahapan Pondasi, Pembentukan, & Pematangan (3HA) serta pembentukan kader penegak disiplin Polisi Cilik.',
        badgeColor: 'bg-purple-600',
      },
      {
        id: 5,
        title: 'Festival Sang Bintang (FeSTa)',
        type: 'Program Kurikulum',
        target: 'Pentas Bakat, Pameran Karya & Awarding',
        description: 'Kegiatan tahunan bulan ke-9/10/11 untuk mengasah & memamerkan karya siswa serta penganugerahan siswa terbaik akademik & karakter.',
        badgeColor: 'bg-rose-600',
      },
      {
        id: 6,
        title: 'Profil Lulusan: Indikator Unggul',
        type: 'Profil Lulusan',
        target: 'Nilai > KKM, Bintang Minat-Bakat, Terampil Komputer & Internet',
        description: 'Siswa mencapai nilai di atas KKM, menjuarai bidang minat bakat, membaca Al-Qur\'an sesuai kaidah, hafal min. 2 juz & 20 hadits, serta terampil aplikasi komputer.',
        badgeColor: 'bg-emerald-700',
      },
      {
        id: 7,
        title: 'Profil Lulusan: Indikator Berkarakter Al-Qur’an',
        type: 'Profil Lulusan',
        target: 'Aqidah Lurus, Akhlak Islami, Berbakti Orang Tua & Hormat Guru',
        description: 'Memiliki aqidah Ahlus Sunnah wal Jama\'ah, rajin beribadah, menerapkan adab kesaharian, berbakti kepada orang tua, dan menghormati guru & ilmu.',
        badgeColor: 'bg-amber-600',
      }
    ];
    localStorage.setItem(STORAGE_KEYS.SITE_CURRICULUM, JSON.stringify(defaultCurriculum));
    localStorage.setItem('sdit_curriculum_v3', 'true');
  }

  if (!localStorage.getItem(STORAGE_KEYS.SITE_ADVANTAGES) || localStorage.getItem('sdit_advantages_v3') !== 'true') {
    const defaultAdvantages: AdvantageItem[] = [
      {
        id: 1,
        title: 'Pengembangan Multiple Intelligences (SLIM EN BIL)',
        desc: 'Menghargai keunikan setiap siswa dengan menstimulasi 9 ragam kecerdasan Prof. Howard Gardner.',
      },
      {
        id: 2,
        title: 'Metode Pembentukan Karakter 3HA (HAfalkan, HAyati, HAbituasi)',
        desc: 'Metode khas dalam menanamkan 24 karakter Al-Qur’an pada setiap kegiatan dan keseharian siswa.',
      },
      {
        id: 3,
        title: 'Program Rising Star (PRISE) & 9 Peminatan Ekskul',
        desc: 'Ekstrakurikuler Little Star (Kelas 1-3) & Peminatan Tekno Kids, BiKom, Kreasi Ceria, Nada Islami, Atlet Cilik, Sahabat Bumi, Chef Cilik, & Penulis Cilik.',
      },
      {
        id: 4,
        title: 'Bina Siswa Qur’ani (Bi-SQ) & Kader Polisi Cilik',
        desc: 'Pembentukan kepribadian Qur’ani berjenjang (Pondasi, Pembentukan, Pematangan) dan kedisiplinan kader Polisi Cilik.',
      },
      {
        id: 5,
        title: 'Festival Sang Bintang (FeSTa) & Pameran Karya',
        desc: 'Ajang tahunan kompetisi minat bakat, unjuk karya kreatif siswa, dan penganugerahan award pencapaian terbaik.',
      },
      {
        id: 6,
        title: 'Internalisasi Nilai Islam & Metode Koreksi Kurikulum',
        desc: 'Mengintegrasikan nilai-nilai Al-Qur’an & Hadits ke dalam kurikulum Kemendikbud serta mengoreksi muatan yang tidak sejalan.',
      },
    ];
    localStorage.setItem(STORAGE_KEYS.SITE_ADVANTAGES, JSON.stringify(defaultAdvantages));
    localStorage.setItem('sdit_advantages_v3', 'true');
  }
}

export function getUsers(): User[] {
  initializeStorage();
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
}

export function saveUsers(users: User[]) {
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
}

// Cache in-memory agar gambar foto dan bukti bayar tetap utuh dan tidak terhapus oleh limit localStorage 5MB browser
let _inMemoryRegistrations: Registration[] | null = null;

export function getRegistrations(): Registration[] {
  initializeStorage();
  if (_inMemoryRegistrations && _inMemoryRegistrations.length > 0) {
    return _inMemoryRegistrations;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.REGISTRATIONS);
    const parsed = raw ? JSON.parse(raw) : [];
    if (parsed.length > 0) {
      _inMemoryRegistrations = parsed;
    }
    return parsed;
  } catch (e) {
    return [];
  }
}

export function saveRegistrations(regs: Registration[]) {
  _inMemoryRegistrations = regs;
  try {
    localStorage.setItem(STORAGE_KEYS.REGISTRATIONS, JSON.stringify(regs));
  } catch (err) {
    console.warn('[Storage] Quota exceeded on saveRegistrations, keeping full data in-memory:', err);
    try {
      const sanitized = regs.map((r) => ({
        ...r,
        fotoUrl: r.fotoUrl && r.fotoUrl.startsWith('data:') && r.fotoUrl.length > 500000 ? '' : r.fotoUrl,
        paymentProofUrl: r.paymentProofUrl && r.paymentProofUrl.startsWith('data:') && r.paymentProofUrl.length > 500000 ? '' : r.paymentProofUrl,
      }));
      localStorage.setItem(STORAGE_KEYS.REGISTRATIONS, JSON.stringify(sanitized));
    } catch (e2) {
      console.warn('[Storage] Fallback save failed:', e2);
    }
  }
}

export function getRegistrationByUserId(userId: number): Registration | null {
  const regs = getRegistrations();
  return regs.find((r) => Number(r.userId) === Number(userId)) || null;
}

export function getCurrentUser(): User | null {
  initializeStorage();
  const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  return data ? JSON.parse(data) : null;
}

export function setCurrentUser(user: User | null) {
  if (user) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }
}

export function updateRegistration(userId: number, updates: Partial<Registration>): Registration {
  const regs = getRegistrations();
  let index = -1;
  if (updates.id) {
    index = regs.findIndex((r) =>
      Number(r.id) === Number(updates.id) ||
      String(r.id) === String(updates.id) ||
      (r.clientId && String(r.clientId) === String(updates.id))
    );
  }
  // Hanya cari berdasarkan userId jika updates.id TIDAK diberikan (untuk registrasi tunggal awal)
  if (index === -1 && !updates.id) {
    index = regs.findIndex((r) => Number(r.userId) === Number(userId));
  }

  let updatedReg: Registration;
  if (index === -1) {
    updatedReg = {
      id: updates.id || Date.now(),
      clientId: updates.clientId || (updates.id ? String(updates.id) : undefined),
      userId,
      studentName: updates.studentName || '',
      status: 'DRAFT',
      paymentStatus: 'UNPAID',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...updates,
    };
    regs.push(updatedReg);
  } else {
    const existing = regs[index];
    const cleanUpdates = { ...updates };
    if (!cleanUpdates.fotoUrl && existing.fotoUrl) {
      cleanUpdates.fotoUrl = existing.fotoUrl;
    }
    if (!cleanUpdates.paymentProofUrl && existing.paymentProofUrl) {
      cleanUpdates.paymentProofUrl = existing.paymentProofUrl;
    }
    updatedReg = {
      ...existing,
      ...cleanUpdates,
      clientId: cleanUpdates.clientId || existing.clientId || (updates.id ? String(updates.id) : undefined),
      updatedAt: new Date().toISOString(),
    };
    regs[index] = updatedReg;
  }
  saveRegistrations(regs);
  api.saveRegistration({
    ...updatedReg,
    clientId: updatedReg.clientId || String(updatedReg.id),
  }).then((res: any) => {
    if (res && res.id && Number(res.id) !== updatedReg.id) {
      const currentRegs = getRegistrations();
      const idx = currentRegs.findIndex((r) =>
        r.id === updatedReg.id ||
        (r.clientId && r.clientId === String(updatedReg.id)) ||
        (updatedReg.clientId && r.clientId === updatedReg.clientId)
      );
      if (idx !== -1) {
        currentRegs[idx].id = Number(res.id);
        if (!currentRegs[idx].clientId) {
          currentRegs[idx].clientId = String(updatedReg.id);
        }
        saveRegistrations(currentRegs);
        window.dispatchEvent(new CustomEvent('sdit_data_synced'));
      }
    }
  }).catch(() => { });
  return updatedReg;
}

export function updateRegistrationById(id: number | string, updates: Partial<Registration>): Registration | null {
  const regs = getRegistrations();
  const index = regs.findIndex((r) =>
    Number(r.id) === Number(id) ||
    String(r.id) === String(id) ||
    (r.clientId && String(r.clientId) === String(id))
  );
  if (index !== -1) {
    const existing = regs[index];
    const cleanUpdates = { ...updates };
    if (!cleanUpdates.fotoUrl && existing.fotoUrl) {
      cleanUpdates.fotoUrl = existing.fotoUrl;
    }
    if (!cleanUpdates.paymentProofUrl && existing.paymentProofUrl) {
      cleanUpdates.paymentProofUrl = existing.paymentProofUrl;
    }

    regs[index] = {
      ...existing,
      ...cleanUpdates,
      clientId: cleanUpdates.clientId || existing.clientId || String(id),
      updatedAt: new Date().toISOString(),
    };
    saveRegistrations(regs);
    api.saveRegistration({
      ...regs[index],
      clientId: regs[index].clientId || String(regs[index].id),
    });
    return regs[index];
  }
  return null;
}

export function getRegistrationById(id: number | string): Registration | null {
  const regs = getRegistrations();
  return regs.find((r) =>
    Number(r.id) === Number(id) ||
    String(r.id) === String(id) ||
    (r.clientId && String(r.clientId) === String(id))
  ) || null;
}

export function getRegistrationsByUserId(userId: number): Registration[] {
  const regs = getRegistrations();
  return regs.filter((r) => Number(r.userId) === Number(userId));
}

export function createChildRegistration(userId: number, initialData?: Partial<Registration>): Registration {
  const regs = getRegistrations();
  const timestampId = initialData?.id || Date.now();
  const newReg: Registration = {
    id: timestampId,
    clientId: String(timestampId),
    userId,
    studentName: '',
    status: 'DRAFT',
    paymentStatus: 'UNPAID',
    programType: 'BOARDING',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...initialData,
  };
  regs.push(newReg);
  saveRegistrations(regs);

  // Kirim ke backend dengan flag isNewChild dan clientId agar dibuatkan record baru di MySQL
  api.saveRegistration({
    ...newReg,
    isNewChild: true,
    clientId: String(timestampId),
  }).then((res: any) => {
    if (res && res.id) {
      const currentRegs = getRegistrations();
      const idx = currentRegs.findIndex((r) =>
        r.id === timestampId ||
        (r.clientId && r.clientId === String(timestampId))
      );
      if (idx !== -1) {
        currentRegs[idx].id = Number(res.id);
        currentRegs[idx].clientId = String(timestampId);
        saveRegistrations(currentRegs);
        window.dispatchEvent(new CustomEvent('sdit_data_synced'));
      }
    }
  }).catch((err) => {
    console.warn('Failed to sync new child to remote DB:', err);
  });

  return newReg;
}

export function deleteRegistrationById(id: number) {
  const regs = getRegistrations();
  const filtered = regs.filter((r) => Number(r.id) !== Number(id));
  saveRegistrations(filtered);
  api.deleteRegistration?.(id);
}

export function addRegistrationByAdmin(data: {
  name: string;
  studentName?: string;
  email: string;
  previousSchool?: string;
  nisn?: string;
  programType?: 'BOARDING' | 'REGULER';
  infoSource?: string;
  reasonToJoin?: string;
  documentDriveUrl?: string;
  fotoUrl?: string;
  spmbStage?: SpmbStage;
  stifinResult?: string;
  interviewChildNotes?: string;
  interviewParentNotes?: string;
  graduationStatus?: 'PENDING' | 'PASSED' | 'FAILED';
  stageNote?: string;
  status: Registration['status'];
  paymentStatus: Registration['paymentStatus'];
}) {
  const users = getUsers();
  let existingUser = users.find((u) => u.email.toLowerCase() === data.email.toLowerCase());
  let userId = existingUser ? existingUser.id : Date.now();

  if (!existingUser) {
    existingUser = {
      id: userId,
      name: data.name,
      email: data.email,
      role: 'STUDENT',
      password: 'password123',
    };
    users.push(existingUser);
    saveUsers(users);
    api.saveUser(existingUser);
  }

  const regs = getRegistrations();
  const newReg: Registration = {
    id: Date.now(),
    userId,
    studentName: data.studentName || data.name,
    nisn: data.nisn || '',
    previousSchool: data.previousSchool || '',
    programType: data.programType || 'BOARDING',
    infoSource: data.infoSource || 'Instagram / Facebook Official',
    reasonToJoin: data.reasonToJoin || '',
    documentDriveUrl: data.documentDriveUrl || '',
    fotoUrl: data.fotoUrl || '',
    spmbStage: data.spmbStage || 'PENDAFTARAN',
    stifinResult: data.stifinResult || '',
    interviewChildNotes: data.interviewChildNotes || '',
    interviewParentNotes: data.interviewParentNotes || '',
    graduationStatus: data.graduationStatus || 'PENDING',
    stageNote: data.stageNote || '',
    status: data.status,
    paymentStatus: data.paymentStatus,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  regs.push(newReg);
  saveRegistrations(regs);
  api.saveRegistration(newReg);
  return newReg;
}

export function savePanitiaUser(data: { id?: number; name: string; email: string; password?: string }) {
  const users = getUsers();
  const existingIdx = data.id
    ? users.findIndex(u => u.id === data.id)
    : users.findIndex(u => u.email.toLowerCase() === data.email.toLowerCase());

  if (existingIdx !== -1) {
    users[existingIdx].name = data.name;
    users[existingIdx].email = data.email;
    users[existingIdx].role = 'PANITIA_SPMB';
    if (data.password) {
      users[existingIdx].password = data.password;
    }
    saveUsers(users);
    api.saveUser(users[existingIdx]);
    return users[existingIdx];
  } else {
    const newUser: User = {
      id: Date.now(),
      name: data.name,
      email: data.email,
      role: 'PANITIA_SPMB',
      password: data.password || 'panitia123',
    };
    users.push(newUser);
    saveUsers(users);
    api.saveUser(newUser);
    return newUser;
  }
}

export function deleteUserById(id: number) {
  const users = getUsers();
  const filtered = users.filter((u) => u.id !== id);
  saveUsers(filtered);
  api.deleteUser?.(id);
}

// Helper to transform Google Drive sharing URLs into direct embeddable CDN URLs
export function formatGoogleDriveImageUrl(url: string): string {
  if (!url) return '';
  const trimmed = url.trim();
  if (trimmed.includes('lh3.googleusercontent.com/d/')) {
    return trimmed;
  }
  if (trimmed.includes('drive.google.com') || trimmed.includes('docs.google.com')) {
    const dMatch = trimmed.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (dMatch && dMatch[1]) {
      return `https://lh3.googleusercontent.com/d/${dMatch[1]}`;
    }
    const idMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (idMatch && idMatch[1]) {
      return `https://lh3.googleusercontent.com/d/${idMatch[1]}`;
    }
  }
  return trimmed;
}

// Helper to strip unwanted API update tags from strings and objects
export function stripSupabaseTag<T>(value: T): T {
  if (typeof value === 'string') {
    return value
      .replace(/\s*\(\s*Updated via Supabase API.*?\)/gi, '')
      .replace(/\s*\(\s*Updated via.*?\)/gi, '')
      .replace(/\s*Updated via Supabase API.*/gi, '')
      .trim() as unknown as T;
  }
  if (Array.isArray(value)) {
    return value.map((item) => stripSupabaseTag(item)) as unknown as T;
  }
  if (value !== null && typeof value === 'object') {
    const cleaned: Record<string, any> = {};
    for (const key of Object.keys(value)) {
      cleaned[key] = stripSupabaseTag((value as Record<string, any>)[key]);
    }
    return cleaned as unknown as T;
  }
  return value;
}

// Site Content CMS Helpers
export function getSiteSettings(): SiteSettings {
  initializeStorage();
  let data: any = {};
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SITE_SETTINGS);
    if (raw) data = JSON.parse(raw);
  } catch (e) {
    data = {};
  }
  return stripSupabaseTag({
    schoolName: data.schoolName || data.school_name || 'SDIT ANDALAS CENDEKIA',
    tagline: data.tagline || 'Sekolah Generasi Pemimpin Qur’ani',
    visi: data.visi || 'Mewujudkan Siswa Generasi Pemimpin Qur’ani',
    beliefText: data.beliefText || 'Cerdas Penuh Ketaqwaan',
    ayatQuote: data.ayatQuote || '“Kamu adalah umat terbaik yang dilahirkan untuk manusia, menyuruh kepada yang ma’ruf, dan mencegah dari yang munkar, dan beriman kepada Allah.” (QS. Ali Imran: 110)',
    misiList: data.misiList || [
      'Menjadikan SDM Civitas Andalas Cendekia unggul, berkarakter Al-Qur\'an dan profesional.',
      'Menjadikan peserta didik yang berkarakter Al-Qur\'an dengan potensi yang Allah berikan kepadanya.',
      'Menyelenggarakan sekolah berbasis teknologi informasi.',
      'Menjadikan peserta didik yang menguasai teknologi informasi dan komunikasi.',
      'Membangun sinergi dengan stakeholder untuk penyelenggaraan pendidikan.'
    ],
    valuesList: data.valuesList || [
      'Memulai sesuatu dengan basmalah',
      'Syukur',
      'Berpikir Positif',
      'Bercita-cita tinggi',
      'Beribadah dan Berdo\'a',
      'Bersungguh-sungguh dalam bertindak',
      'Perbaikan Berkelanjutan'
    ],
    address: data.address || 'JL. Kampung Baru No.36, RT 00/RW 00, Kel. Sikabau, Kec. Pulau Punjung, Kab. Dharmasraya, Prov. Sumatera Barat 27573',
    phone: data.phone || '0811-6696-990',
    email: data.email || 'sditac1@gmail.com',
    website: data.website || 'https://sdit.andalascendekia.sch.id',
    npsn: data.npsn || '10310802',
    accreditation: data.accreditation || 'Akreditasi A',
    videoUrl: (!data.videoUrl && !data.video_url) || (data.videoUrl && data.videoUrl.includes('9E09XrFAi_s')) || (data.video_url && data.video_url.includes('9E09XrFAi_s'))
      ? 'https://www.youtube.com/embed/vNUhnzfGFKY?autoplay=1'
      : (data.videoUrl || data.video_url || 'https://www.youtube.com/embed/vNUhnzfGFKY?autoplay=1'),
    facebookUrl: data.facebookUrl || data.facebook_url || 'https://facebook.com',
    instagramUrl: data.instagramUrl || data.instagram_url || 'https://instagram.com',
    youtubeUrl: data.youtubeUrl || data.youtube_url || 'https://youtube.com',
    principalName: data.principalName || data.principal_name || 'Rika Handayani, S.Pd.,Gr.',
    principalTitle: data.principalTitle || data.principal_title || 'Kepala Sekolah SD IT Andalas Cendekia',
    principalMessage: data.principalMessage || data.principal_message || "Assalamu'alaikum Warahmatullahi Wabarakatuh. Selamat datang di portal resmi SD IT Andalas Cendekia. Kami berkomitmen menyelenggarakan pendidikan dasar Islam terpadu yang membekali pendidikan agama, adab dan akhlak mulia, kecakapan hidup kekinian, serta penguasaan sains dan teknologi untuk membentuk Generasi Pemimpin Qur'ani.",
    principalPhotoUrl: data.principalPhotoUrl || data.principal_photo_url || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    historyText: data.historyText || data.history_text || 'SD IT Andalas Cendekia didirikan berdasarkan SK No. 188.45/36/Kpts-C-PLP/2011 pada tanggal 14 November 2011 di Kabupaten Dharmasraya, Sumatera Barat. Lembaga ini hadir sebagai komitmen nyata untuk mencetak generasi pemimpin Qur\'ani yang berakhlak mulia, cerdas akademis, dan berkarakter Al-Qur\'an.',
    spmbAcademicYear: data.spmbAcademicYear || data.spmb_academic_year || '2027/2028',
    spmbHidePayment: data.spmbHidePayment !== undefined ? Boolean(data.spmbHidePayment) : (data.spmb_hide_payment !== undefined ? Boolean(data.spmb_hide_payment) : true),
    spmbStatusText: data.spmbStatusText || data.spmb_status_text || 'Daftar Tunggu',
    spmbWaitlistNotice: data.spmbWaitlistNotice || data.spmb_waitlist_notice || 'Biaya pendaftaran sebesar Rp 250.000 ditransfer ke Bank Nagari: 71050220008996 an. Yayasan Andalas Cendekia. Silakan upload bukti transfer di menu Pembayaran.',
    spmbDriveFolderUrl: data.spmbDriveFolderUrl || data.spmb_drive_folder_url || 'https://drive.google.com/drive/folders/1dKcGp0m7HF9esxIqCpmvqWu0WDew7cYO?usp=sharing',
    skPendirian: data.skPendirian || data.sk_pendirian || '188.45/36/Kpts-C-PLP/2011',
    tglSkPendirian: data.tglSkPendirian || data.tgl_sk_pendirian || '2011-11-14',
    skIzinOperasional: data.skIzinOperasional || data.sk_izin_operasional || '421.1/102/DISDIKPORA/2011',
    tglSkIzinOperasional: data.tglSkIzinOperasional || data.tgl_sk_izin_operasional || '2011-09-28',
    yayasan: data.yayasan || 'Yayasan Andalas Cendekia',
    bankName: data.bankName || data.bank_name || 'Bank Nagari',
    bankAccNo: data.bankAccNo || data.bank_acc_no || '71050220008996',
    bankAccName: data.bankAccName || data.bank_acc_name || 'Yayasan Andalas Cendekia',
    bankBranch: data.bankBranch || data.bank_branch || 'Dharmasraya',
    npwp: data.npwp || '001276922203000',
    geoLat: data.geoLat || data.geo_lat || '-0.9965',
    geoLong: data.geoLong || data.geo_long || '-0.9965',
    waktuPenyelenggaraan: data.waktuPenyelenggaraan || data.waktu_penyelenggaraan || 'Sehari Penuh/5 hari',
    menerimaBos: data.menerimaBos || data.menerima_bos || 'Ya',
    sumberListrik: data.sumberListrik || data.sumber_listrik || 'PLN (7700 Watt)',
    luasLahan: data.luasLahan || data.luas_lahan || '4250.3 m²',
    kepemilikanTanah: data.kepemilikanTanah || data.kepemilikan_tanah || 'Bukan Milik',
    totalSiswa: data.totalSiswa || 537,
    totalGuru: data.totalGuru || 47,
    totalTendik: data.totalTendik || 11,
    totalRombel: data.totalRombel || 24,
    sumberAir: data.sumberAir || 'Sumur terlindungi',
    tipeJamban: data.tipeJamban || 'Leher angsa (toilet jongkok)',
    tujuanList: data.tujuanList || [
      'Membentuk generasi yang berkepribadian Islam, baik dalam pola pikir maupun pola sikapnya.',
      'Membekali generasi agar menguasai Tsaqofah Islam yang memadai (Membaca/menulis Al-Qur’an, Bahasa Arab, Hafalan min. 2 Juz, Hadits & Fiqih).',
      'Membekali generasi agar menguasai ilmu sains teknologi dan seni yang memadai (Matematika, IPA, IPS, Bahasa Indonesia, Bahasa Inggris & TIK).',
      'Memfasilitasi keunikan 9 ragam kecerdasan siswa (Multiple Intelligences) melalui Program Rising Star (PRISE).',
      'Membentuk 10 karakter & budaya sekolah khas (Kalimat Thoyyibah, Doa Harian, Jujur, Disiplin, Tanggung Jawab, PD, Peduli, & 5S).',
      'Menyelenggarakan pembelajaran terpadu 3 pilar pembinaan generasi: Sekolah, Pesantren, dan Masjid (Full-Day School).'
    ],
    mapEmbedUrl: data.mapEmbedUrl || data.map_embed_url || 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15959.049618176378!2d101.5300!3d-0.9965!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e2b4f53580521ad%3A0x6b4fb4cb213192f6!2sPulau%20Punjung%2C%20Dharmasraya!5e0!3m2!1sid!2sid!4v1700000000000!5m2!1sid!2sid'
  });
}

export function extractMapEmbedUrl(input: string): string {
  if (!input) return '';
  const trimmed = input.trim();
  if (trimmed.startsWith('<iframe')) {
    const match = trimmed.match(/src=["']([^"']+)["']/i);
    if (match && match[1]) {
      return match[1];
    }
  }
  return trimmed;
}

export async function saveSiteSettings(settings: SiteSettings) {
  const cleaned = stripSupabaseTag(settings);
  localStorage.setItem(STORAGE_KEYS.SITE_SETTINGS, JSON.stringify(cleaned));
  try {
    const res = await api.saveSettings(cleaned);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('sdit_data_synced'));
    }
    return res;
  } catch (err) {
    console.warn('[Storage] saveSiteSettings error:', err);
    return null;
  }
}

export function getSiteNews(): NewsItem[] {
  initializeStorage();
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SITE_NEWS);
    const data = raw ? JSON.parse(raw) : [];
    return stripSupabaseTag(Array.isArray(data) ? data : []);
  } catch (e) {
    return [];
  }
}

export function saveSiteNews(news: NewsItem[]) {
  localStorage.setItem(STORAGE_KEYS.SITE_NEWS, JSON.stringify(news));
  api.saveNews?.(news);
}

export function getSiteEvents(): EventItem[] {
  initializeStorage();
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SITE_EVENTS);
    const data = raw ? JSON.parse(raw) : [];
    return stripSupabaseTag(Array.isArray(data) ? data : []);
  } catch (e) {
    return [];
  }
}

export function saveSiteEvents(events: EventItem[]) {
  const cleaned = stripSupabaseTag(events);
  localStorage.setItem(STORAGE_KEYS.SITE_EVENTS, JSON.stringify(cleaned));
  api.saveEvents?.(cleaned);
}

export function getSiteSlides(): SlideItem[] {
  initializeStorage();
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SITE_SLIDES);
    const data = raw ? JSON.parse(raw) : [];
    return stripSupabaseTag(Array.isArray(data) ? data : []);
  } catch (e) {
    return [];
  }
}

export function saveSiteSlides(slides: SlideItem[]) {
  const cleaned = stripSupabaseTag(slides);
  localStorage.setItem(STORAGE_KEYS.SITE_SLIDES, JSON.stringify(cleaned));
  api.saveSlides?.(cleaned);
}

export function getSiteFacilities(): FacilityItem[] {
  initializeStorage();
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SITE_FACILITIES);
    const data = raw ? JSON.parse(raw) : [];
    return stripSupabaseTag(Array.isArray(data) ? data : []);
  } catch (e) {
    return [];
  }
}

export function saveSiteFacilities(facilities: FacilityItem[]) {
  const cleaned = stripSupabaseTag(facilities);
  localStorage.setItem(STORAGE_KEYS.SITE_FACILITIES, JSON.stringify(cleaned));
  api.saveFacilities?.(cleaned);
}

export function getSiteTestimonials(): TestimonialItem[] {
  initializeStorage();
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SITE_TESTIMONIALS);
    const data = raw ? JSON.parse(raw) : [];
    return stripSupabaseTag(Array.isArray(data) ? data : []);
  } catch (e) {
    return [];
  }
}

export function saveSiteTestimonials(testimonials: TestimonialItem[]) {
  const cleaned = stripSupabaseTag(testimonials);
  localStorage.setItem(STORAGE_KEYS.SITE_TESTIMONIALS, JSON.stringify(cleaned));
  api.saveTestimonials?.(cleaned);
}

export function getSiteActivities(): ActivityAchievementItem[] {
  initializeStorage();
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SITE_ACTIVITIES);
    const data = raw ? JSON.parse(raw) : [];
    return stripSupabaseTag(Array.isArray(data) ? data : []);
  } catch (e) {
    return [];
  }
}

export function saveSiteActivities(activities: ActivityAchievementItem[]) {
  const cleaned = stripSupabaseTag(activities);
  localStorage.setItem(STORAGE_KEYS.SITE_ACTIVITIES, JSON.stringify(cleaned));
  api.saveActivities?.(cleaned);
}

export function getSiteCurriculum(): CurriculumTahfidzItem[] {
  initializeStorage();
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SITE_CURRICULUM);
    const data = raw ? JSON.parse(raw) : [];
    return stripSupabaseTag(Array.isArray(data) ? data : []);
  } catch (e) {
    return [];
  }
}

export function saveSiteCurriculum(curriculum: CurriculumTahfidzItem[]) {
  const cleaned = stripSupabaseTag(curriculum);
  localStorage.setItem(STORAGE_KEYS.SITE_CURRICULUM, JSON.stringify(cleaned));
  api.saveCurriculum?.(cleaned);
}

export function getSiteTeachers(): TeacherItem[] {
  initializeStorage();
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SITE_TEACHERS);
    const data = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(data)) return [];
    return stripSupabaseTag(data.map((t: any, idx: number) => ({
      id: t.id || idx + 1,
      name: t.name || '',
      role: t.role || '',
      mapel: t.mapel || '',
      strata: t.strata || 'S1',
      photoUrl: t.photoUrl || t.photo_url || '',
    })));
  } catch (e) {
    return [];
  }
}

export function saveSiteTeachers(teachers: TeacherItem[]) {
  localStorage.setItem(STORAGE_KEYS.SITE_TEACHERS, JSON.stringify(teachers));
  api.saveTeachers?.(teachers);
}

export function getSiteAdvantages(): AdvantageItem[] {
  initializeStorage();
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SITE_ADVANTAGES);
    const data = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(data)) return [];
    return stripSupabaseTag(data.map((item: any, idx: number) => ({
      id: item.id || idx + 1,
      title: item.title || '',
      desc: item.desc || item.description || '',
      iconName: item.iconName || item.icon_name || 'CheckCircle2',
    })));
  } catch (e) {
    return [];
  }
}

export function saveSiteAdvantages(advantages: AdvantageItem[]) {
  const cleaned = stripSupabaseTag(advantages);
  localStorage.setItem(STORAGE_KEYS.SITE_ADVANTAGES, JSON.stringify(cleaned));
  api.saveAdvantages?.(cleaned);
}

export async function syncWithBackend() {
  let updated = false;

  // 1. Prioritas Utama: Sync Registrations Langsung dari MySQL (andalas4_sdit)
  try {
    const registrations = await api.getRegistrations();
    if (registrations && Array.isArray(registrations)) {
      const normalizedRegs: Registration[] = registrations.map((r: any) => ({
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
        createdAt: r.created_at || r.createdAt,
        updatedAt: r.updated_at || r.updatedAt,
      }));

      // Merge data lokal, abaikan dummy mock lama (Budi Santoso)
      const localRegs = getRegistrations();
      const mergedMap = new Map<number, Registration>();
      normalizedRegs.forEach((r) => {
        const localMatch = localRegs.find((lr) => lr.id === r.id || (lr.clientId && lr.clientId === r.clientId));
        const mergedFotoUrl = (r.fotoUrl && r.fotoUrl.trim()) ? r.fotoUrl : (localMatch?.fotoUrl || '');
        const mergedPaymentProofUrl = (r.paymentProofUrl && r.paymentProofUrl.trim()) ? r.paymentProofUrl : (localMatch?.paymentProofUrl || '');
        mergedMap.set(r.id, {
          ...r,
          fotoUrl: mergedFotoUrl,
          paymentProofUrl: mergedPaymentProofUrl,
        });
      });

      localRegs.forEach((lr) => {
        // Jangan pernah masukkan kembali data dummy mock
        if (lr.id === 1 && (lr.fatherName === 'Budi Santoso' || !lr.studentName)) {
          return;
        }
        const alreadyInRemote = normalizedRegs.some(
          (rr) => rr.id === lr.id || (rr.clientId && rr.clientId === String(lr.id))
        );
        if (!alreadyInRemote) {
          mergedMap.set(lr.id, lr);
        }
      });

      const mergedList = Array.from(mergedMap.values());
      _inMemoryRegistrations = mergedList;

      try {
        localStorage.setItem(STORAGE_KEYS.REGISTRATIONS, JSON.stringify(mergedList));
      } catch (err) {
        console.warn('[Sync] Quota exceeded on sync registrations, keeping full data in-memory:', err);
        try {
          const sanitized = mergedList.map((r) => ({
            ...r,
            fotoUrl: r.fotoUrl && r.fotoUrl.startsWith('data:') && r.fotoUrl.length > 500000 ? '' : r.fotoUrl,
            paymentProofUrl: r.paymentProofUrl && r.paymentProofUrl.startsWith('data:') && r.paymentProofUrl.length > 500000 ? '' : r.paymentProofUrl,
          }));
          localStorage.setItem(STORAGE_KEYS.REGISTRATIONS, JSON.stringify(sanitized));
        } catch (e2) {}
      }
      updated = true;
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('sdit_data_synced'));
      }
    }
  } catch (e) {
    console.warn('[Sync] Registrations sync failed:', e);
  }

  // 2. Prioritas: Sync Users dari MySQL
  try {
    const users = await api.getUsers();
    if (users && Array.isArray(users) && users.length > 0) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
      updated = true;
    }
  } catch (e) {
    console.warn('[Sync] Users sync failed:', e);
  }

  // 3. Sync Settings
  try {
    const settings = await api.getSettings();
    if (settings && typeof settings === 'object' && Object.keys(settings).length > 0) {
      const current = getSiteSettings();
      const normalizedSettings: SiteSettings = stripSupabaseTag({
        schoolName: settings.schoolName || settings.school_name || current.schoolName,
        tagline: settings.tagline || current.tagline,
        visi: settings.visi || current.visi,
        address: settings.address || current.address,
        phone: settings.phone || current.phone,
        email: settings.email || current.email,
        website: settings.website || current.website,
        npsn: settings.npsn || current.npsn,
        accreditation: settings.accreditation || current.accreditation,
        videoUrl: settings.videoUrl || settings.video_url || current.videoUrl,
        facebookUrl: settings.facebookUrl || settings.facebook_url || current.facebookUrl,
        instagramUrl: settings.instagramUrl || settings.instagram_url || current.instagramUrl,
        youtubeUrl: settings.youtubeUrl || settings.youtube_url || current.youtubeUrl,
        principalName: settings.principalName || settings.principal_name || current.principalName,
        principalTitle: settings.principalTitle || settings.principal_title || current.principalTitle,
        principalMessage: settings.principalMessage || settings.principal_message || current.principalMessage,
        principalPhotoUrl: settings.principalPhotoUrl || settings.principal_photo_url || current.principalPhotoUrl,
        historyText: settings.historyText || settings.history_text || current.historyText,
        spmbAcademicYear: settings.spmbAcademicYear || settings.spmb_academic_year || current.spmbAcademicYear || '2027/2028',
        spmbHidePayment: settings.spmbHidePayment !== undefined ? Boolean(settings.spmbHidePayment) : (settings.spmb_hide_payment !== undefined ? Boolean(settings.spmb_hide_payment) : false),
        spmbStatusText: settings.spmbStatusText || settings.spmb_status_text || current.spmbStatusText || 'Pendaftaran Dibuka',
        spmbWaitlistNotice: settings.spmbWaitlistNotice || settings.spmb_waitlist_notice || current.spmbWaitlistNotice || 'Biaya pendaftaran sebesar Rp 250.000 ditransfer ke Bank Nagari: 71050220008996 an. Yayasan Andalas Cendekia. Silakan upload bukti transfer di menu Pembayaran.',
        spmbDriveFolderUrl: settings.spmbDriveFolderUrl || settings.spmb_drive_folder_url || current.spmbDriveFolderUrl || 'https://drive.google.com/drive/folders/1dKcGp0m7HF9esxIqCpmvqWu0WDew7cYO?usp=sharing',
        bankName: settings.bankName || settings.bank_name || current.bankName || 'Bank Nagari',
        bankAccNo: settings.bankAccNo || settings.bank_acc_no || current.bankAccNo || '71050220008996',
        bankAccName: settings.bankAccName || settings.bank_acc_name || current.bankAccName || 'Yayasan Andalas Cendekia',
        bankBranch: settings.bankBranch || settings.bank_branch || current.bankBranch || 'Dharmasraya',
        skPendirian: settings.skPendirian || settings.sk_pendirian || current.skPendirian,
        tglSkPendirian: settings.tglSkPendirian || settings.tgl_sk_pendirian || current.tglSkPendirian,
        skIzinOperasional: settings.skIzinOperasional || settings.sk_izin_operasional || current.skIzinOperasional,
        tglSkIzinOperasional: settings.tglSkIzinOperasional || settings.tgl_sk_izin_operasional || current.tglSkIzinOperasional,
        yayasan: settings.yayasan || current.yayasan || 'Yayasan Andalas Cendekia',
        npwp: settings.npwp || current.npwp || '001276922203000',
        totalSiswa: Number(settings.totalSiswa ?? settings.total_siswa ?? current.totalSiswa ?? 537),
        totalGuru: Number(settings.totalGuru ?? settings.total_guru ?? current.totalGuru ?? 47),
        totalTendik: Number(settings.totalTendik ?? settings.total_tendik ?? current.totalTendik ?? 11),
        totalRombel: Number(settings.totalRombel ?? settings.total_rombel ?? current.totalRombel ?? 24),
        beliefText: settings.beliefText || settings.belief_text || current.beliefText,
        ayatQuote: settings.ayatQuote || settings.ayat_quote || current.ayatQuote,
        misiList: (() => {
          try {
            if (Array.isArray(settings.misiList)) return settings.misiList;
            if (typeof settings.misi_list === 'string') return JSON.parse(settings.misi_list);
            if (Array.isArray(settings.misi_list)) return settings.misi_list;
          } catch (e) { }
          return current.misiList;
        })(),
        valuesList: current.valuesList,
        tujuanList: (() => {
          try {
            if (Array.isArray(settings.tujuanList)) return settings.tujuanList;
            if (typeof settings.tujuan_list === 'string') return JSON.parse(settings.tujuan_list);
            if (Array.isArray(settings.tujuan_list)) return settings.tujuan_list;
          } catch (e) { }
          return current.tujuanList;
        })(),
        mapEmbedUrl: settings.mapEmbedUrl || settings.map_embed_url || current.mapEmbedUrl,
      });
      localStorage.setItem(STORAGE_KEYS.SITE_SETTINGS, JSON.stringify(normalizedSettings));
      updated = true;
    }
  } catch (e) {
    console.warn('[Sync] Settings sync failed:', e);
  }

  // 4. Sync Teachers
  try {
    const teachers = await api.getTeachers();
    if (teachers && Array.isArray(teachers) && teachers.length > 0) {
      const normalizedTeachers = stripSupabaseTag(teachers.map((t: any, idx: number) => ({
        id: t.id || idx + 1,
        name: t.name || '',
        role: t.role || '',
        mapel: t.mapel || '',
        strata: t.strata || 'S1',
        photoUrl: t.photoUrl || t.photo_url || '',
      })));
      localStorage.setItem(STORAGE_KEYS.SITE_TEACHERS, JSON.stringify(normalizedTeachers));
      updated = true;
    }
  } catch (e) {
    console.warn('[Sync] Teachers sync failed:', e);
  }

  // 5. Sync News
  try {
    const news = await api.getNews();
    if (news && Array.isArray(news) && news.length > 0) {
      const normalizedNews = stripSupabaseTag(news.map((item: any) => ({
        id: item.id,
        title: item.title,
        category: item.category,
        date: item.date,
        author: item.author || 'Admin',
        commentsCount: item.commentsCount || item.comments_count || 0,
        imageUrl: item.imageUrl || item.image_url,
        excerpt: item.excerpt,
        content: item.content,
      })));
      localStorage.setItem(STORAGE_KEYS.SITE_NEWS, JSON.stringify(normalizedNews));
      updated = true;
    }
  } catch (e) {
    console.warn('[Sync] News sync failed:', e);
  }

  // 6. Sync Events
  try {
    const events = await api.getEvents();
    if (events && Array.isArray(events) && events.length > 0) {
      localStorage.setItem(STORAGE_KEYS.SITE_EVENTS, JSON.stringify(stripSupabaseTag(events)));
      updated = true;
    }
  } catch (e) {
    console.warn('[Sync] Events sync failed:', e);
  }

  // 7. Sync Slides
  try {
    const slides = await api.getSlides();
    if (slides && Array.isArray(slides) && slides.length > 0) {
      const normalizedSlides = stripSupabaseTag(slides.map((s: any) => ({
        id: s.id,
        badge: s.badge,
        title: s.title,
        description: s.description,
        imageUrl: s.imageUrl || s.image_url,
        primaryCtaText: s.primaryCtaText || s.primary_cta_text,
        primaryCtaLink: s.primaryCtaLink || s.primary_cta_link,
        secondaryCtaText: s.secondaryCtaText || s.secondary_cta_text,
        secondaryCtaLink: s.secondaryCtaLink || s.secondary_cta_link,
      })));
      localStorage.setItem(STORAGE_KEYS.SITE_SLIDES, JSON.stringify(normalizedSlides));
      updated = true;
    }
  } catch (e) {
    console.warn('[Sync] Slides sync failed:', e);
  }

  // 8. Sync Facilities
  try {
    const facilities = await api.getFacilities();
    if (facilities && Array.isArray(facilities) && facilities.length > 0) {
      const normalizedFacilities = stripSupabaseTag(facilities.map((f: any) => ({
        id: f.id,
        title: f.title,
        category: f.category,
        description: f.description,
        imageUrl: f.imageUrl || f.image_url,
      })));
      localStorage.setItem(STORAGE_KEYS.SITE_FACILITIES, JSON.stringify(normalizedFacilities));
      updated = true;
    }
  } catch (e) {
    console.warn('[Sync] Facilities sync failed:', e);
  }

  // 9. Sync Testimonials
  try {
    const testimonials = await api.getTestimonials();
    if (testimonials && Array.isArray(testimonials) && testimonials.length > 0) {
      const normalizedTestimonials = stripSupabaseTag(testimonials.map((t: any) => ({
        id: t.id,
        name: t.name,
        role: t.role,
        rating: t.rating || 5,
        quote: t.quote,
        avatarUrl: t.avatarUrl || t.avatar_url,
        timeAgo: t.timeAgo || t.time_ago,
      })));
      localStorage.setItem(STORAGE_KEYS.SITE_TESTIMONIALS, JSON.stringify(normalizedTestimonials));
      updated = true;
    }
  } catch (e) {
    console.warn('[Sync] Testimonials sync failed:', e);
  }

  // 10. Sync Activities
  try {
    const activities = await api.getActivities();
    if (activities && Array.isArray(activities) && activities.length > 0) {
      const normalizedActivities = stripSupabaseTag(activities.map((a: any) => ({
        id: a.id,
        title: a.title,
        type: a.type,
        category: a.category,
        date: a.date,
        studentName: a.studentName || a.student_name,
        achievementBadge: a.achievementBadge || a.achievement_badge,
        description: a.description,
        imageUrl: a.imageUrl || a.image_url,
      })));
      localStorage.setItem(STORAGE_KEYS.SITE_ACTIVITIES, JSON.stringify(normalizedActivities));
      updated = true;
    }
  } catch (e) {
    console.warn('[Sync] Activities sync failed:', e);
  }

  // 11. Sync Curriculum
  try {
    const curriculum = await api.getCurriculum();
    if (curriculum && Array.isArray(curriculum) && curriculum.length > 0) {
      const normalizedCurriculum = stripSupabaseTag(curriculum.map((c: any) => ({
        id: c.id,
        title: c.title,
        type: c.type,
        target: c.target,
        description: c.description,
        badgeColor: c.badgeColor || c.badge_color,
      })));
      localStorage.setItem(STORAGE_KEYS.SITE_CURRICULUM, JSON.stringify(normalizedCurriculum));
      updated = true;
    }
  } catch (e) {
    console.warn('[Sync] Curriculum sync failed:', e);
  }

  // 12. Sync Advantages
  if (api.getAdvantages) {
    try {
      const advantages = await api.getAdvantages();
      if (advantages && Array.isArray(advantages) && advantages.length > 0) {
        const normalizedAdvantages = stripSupabaseTag(advantages.map((item: any, idx: number) => ({
          id: item.id || idx + 1,
          title: item.title || '',
          desc: item.desc || item.description || '',
          iconName: item.iconName || item.icon_name || 'CheckCircle2',
        })));
        localStorage.setItem(STORAGE_KEYS.SITE_ADVANTAGES, JSON.stringify(normalizedAdvantages));
        updated = true;
      }
    } catch (e) {
      console.warn('[Sync] Advantages sync failed:', e);
    }
  }

  if (updated && typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('sdit_data_synced'));
  }
}

// Auto-trigger sync on module import in browser environment
if (typeof window !== 'undefined') {
  syncWithBackend();
}


