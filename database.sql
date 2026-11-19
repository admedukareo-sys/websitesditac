-- ==============================================================================
-- DATABASE SCHEMA & SEED DATA UNTUK SD IT ANDALAS CENDEKIA
-- Database: andalas4_sdit
-- Compatible with MySQL 5.7+ / MySQL 8.0+ / MariaDB & cPanel phpMyAdmin
-- ==============================================================================

SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

-- --------------------------------------------------------
-- 1. TABEL: users (Akun Pengguna & Admin)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `role` VARCHAR(50) NOT NULL DEFAULT 'STUDENT',
  `password` VARCHAR(255) NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data Seed: users
INSERT INTO `users` (`id`, `name`, `email`, `role`, `password`, `created_at`) VALUES
(1, 'Administrator SPMB', 'admin@sdit.sch.id', 'ADMIN', 'admin', '2026-08-26 00:00:00'),
(2, 'Ahmad Zaki', 'zaki@gmail.com', 'STUDENT', 'password123', '2026-08-26 00:00:00'),
(3, 'Fatimah Az-Zahra', 'fatimah@gmail.com', 'STUDENT', 'password123', '2026-08-26 00:00:00'),
(4, 'Panitia SPMB SD IT', 'panitia@sdit.sch.id', 'PANITIA_SPMB', 'panitia123', '2026-08-26 00:00:00');

-- --------------------------------------------------------
-- 2. TABEL: registrations (Pendaftaran SPMB & Daftar Tunggu)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `registrations` (
  `id` BIGINT(20) NOT NULL AUTO_INCREMENT,
  `user_id` INT(11) NOT NULL,
  `student_name` VARCHAR(255) DEFAULT NULL,
  `nisn` VARCHAR(50) DEFAULT NULL,
  `nik` VARCHAR(50) DEFAULT NULL,
  `birth_place` VARCHAR(100) DEFAULT NULL,
  `birth_date` DATE DEFAULT NULL,
  `gender` ENUM('L', 'P') DEFAULT NULL,
  `address` TEXT DEFAULT NULL,
  `distance_to_school` VARCHAR(50) DEFAULT NULL,
  `father_name` VARCHAR(150) DEFAULT NULL,
  `father_occupation` VARCHAR(100) DEFAULT NULL,
  `father_income` VARCHAR(100) DEFAULT NULL,
  `mother_name` VARCHAR(150) DEFAULT NULL,
  `mother_occupation` VARCHAR(100) DEFAULT NULL,
  `mother_income` VARCHAR(100) DEFAULT NULL,
  `parent_phone` VARCHAR(50) DEFAULT NULL,
  `previous_school` VARCHAR(255) DEFAULT NULL,
  `school_address` VARCHAR(255) DEFAULT NULL,
  `status` ENUM('DRAFT', 'SUBMITTED', 'VERIFIED', 'REJECTED', 'PASSED', 'FAILED', 'REGISTERED') NOT NULL DEFAULT 'DRAFT',
  `spmb_stage` VARCHAR(50) NOT NULL DEFAULT 'PENDAFTARAN',
  `stifin_result` VARCHAR(255) DEFAULT NULL,
  `interview_child_notes` TEXT DEFAULT NULL,
  `interview_parent_notes` TEXT DEFAULT NULL,
  `graduation_status` VARCHAR(50) DEFAULT 'PENDING',
  `stage_note` TEXT DEFAULT NULL,
  `rejection_reason` TEXT DEFAULT NULL,
  `akta_url` VARCHAR(500) DEFAULT NULL,
  `kk_url` VARCHAR(500) DEFAULT NULL,
  `foto_url` LONGTEXT DEFAULT NULL,
  `rapor_url` VARCHAR(500) DEFAULT NULL,
  `document_drive_url` VARCHAR(500) DEFAULT NULL,
  `payment_proof_url` LONGTEXT DEFAULT NULL,
  `payment_status` ENUM('UNPAID', 'PENDING', 'VERIFIED') NOT NULL DEFAULT 'UNPAID',
  `test_score` DECIMAL(5,2) DEFAULT NULL,
  `interview_notes` TEXT DEFAULT NULL,
  `re_registration_proof_url` VARCHAR(500) DEFAULT NULL,
  `uniform_size` VARCHAR(10) DEFAULT NULL,
  `program_type` ENUM('BOARDING', 'REGULER') NOT NULL DEFAULT 'BOARDING',
  `info_source` VARCHAR(255) DEFAULT NULL,
  `reason_to_join` TEXT DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_registrations_user` (`user_id`),
  CONSTRAINT `fk_registrations_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data Seed: registrations
INSERT INTO `registrations` (`id`, `user_id`, `nisn`, `nik`, `birth_place`, `birth_date`, `gender`, `address`, `father_name`, `mother_name`, `parent_phone`, `previous_school`, `status`, `payment_status`, `payment_proof_url`, `program_type`, `info_source`, `reason_to_join`, `created_at`, `updated_at`) VALUES
(1, 2, '0051234567', '1371012304050001', 'Pulau Punjung', '2008-05-14', 'L', 'Jorong Ranah Lintas, Dharmasraya', 'Budi Santoso', 'Siti Aminah', '081266778899', 'SMP Negeri 1 Pulau Punjung', 'SUBMITTED', 'PENDING', 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80', 'BOARDING', 'Instagram / Facebook Official', 'Ingin fokus mendalami program Tahfidz Al-Qur\'an 10 Juz serta pembentukan karakter kepemimpinan Islam.', '2026-08-26 00:00:00', '2026-08-26 00:00:00'),
(2, 3, '0059876543', '1371012304050002', 'Sungai Dareh', '2008-08-20', 'P', 'Nagari Tebing Tinggi, Dharmasraya', 'Rahman Hakim', 'Nurhaliza', '081399887766', 'MTsN 1 Dharmasraya', 'DRAFT', 'UNPAID', NULL, 'REGULER', 'Brosur / Leaflet Informasi', 'Kualitas akademis lulusan yang terbukti banyak diterima di PTN favorit.', '2026-08-26 00:00:00', '2026-08-26 00:00:00');

-- --------------------------------------------------------
-- 2b. TABEL: registration_files (Dual Storage Backup BLOB Pas Foto & Bukti Transfer)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `registration_files` (
  `id` BIGINT(20) NOT NULL AUTO_INCREMENT,
  `file_name` VARCHAR(255) NOT NULL,
  `category` VARCHAR(50) NOT NULL DEFAULT 'spmb',
  `mime_type` VARCHAR(100) NOT NULL DEFAULT 'image/jpeg',
  `file_size` INT(11) NOT NULL DEFAULT 0,
  `file_data` LONGBLOB NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_file_name` (`file_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 3. TABEL: site_settings (Pengaturan Profil, Visi, Sambutan Kepsek & Media Sosial)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `site_settings` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `school_name` VARCHAR(255) NOT NULL DEFAULT 'SD IT Andalas Cendekia',
  `tagline` VARCHAR(255) NOT NULL DEFAULT 'Sekolah Generasi Pemimpin Qur’ani',
  `visi` TEXT NOT NULL,
  `address` TEXT NOT NULL,
  `phone` VARCHAR(50) NOT NULL,
  `email` VARCHAR(150) NOT NULL,
  `website` VARCHAR(255) NOT NULL,
  `npsn` VARCHAR(50) NOT NULL DEFAULT '10310802',
  `accreditation` VARCHAR(50) NOT NULL DEFAULT 'Akreditasi A',
  `video_url` VARCHAR(500) NOT NULL,
  `facebook_url` VARCHAR(500) DEFAULT 'https://facebook.com',
  `instagram_url` VARCHAR(500) DEFAULT 'https://instagram.com',
  `youtube_url` VARCHAR(500) DEFAULT 'https://youtube.com',
  `principal_name` VARCHAR(150) DEFAULT 'Rika Handayani, S.Pd.,Gr.',
  `principal_title` VARCHAR(255) DEFAULT 'Kepala Sekolah SD IT Andalas Cendekia',
  `principal_message` TEXT DEFAULT NULL,
  `principal_photo_url` VARCHAR(500) DEFAULT NULL,
  `history_text` TEXT DEFAULT NULL,
  `spmb_academic_year` VARCHAR(50) DEFAULT '2027/2028',
  `spmb_hide_payment` TINYINT(1) DEFAULT 0,
  `spmb_status_text` VARCHAR(150) DEFAULT 'Pendaftaran Dibuka',
  `spmb_waitlist_notice` TEXT DEFAULT NULL,
  `spmb_drive_folder_url` VARCHAR(500) DEFAULT 'https://drive.google.com/drive/folders/1dKcGp0m7HF9esxIqCpmvqWu0WDew7cYO?usp=sharing',
  `sk_pendirian` VARCHAR(255) DEFAULT '188.45/36/Kpts-C-PLP/2011',
  `tgl_sk_pendirian` VARCHAR(50) DEFAULT '2011-11-14',
  `sk_izin_operasional` VARCHAR(255) DEFAULT '421.1/102/DISDIKPORA/2011',
  `tgl_sk_izin_operasional` VARCHAR(50) DEFAULT '2011-09-28',
  `yayasan` VARCHAR(255) DEFAULT 'Yayasan Andalas Cendekia',
  `bank_name` VARCHAR(255) DEFAULT 'Bank Nagari',
  `bank_acc_no` VARCHAR(255) DEFAULT '71050220008996',
  `bank_acc_name` VARCHAR(255) DEFAULT 'Yayasan Andalas Cendekia',
  `bank_branch` VARCHAR(255) DEFAULT 'Dharmasraya',
  `npwp` VARCHAR(100) DEFAULT '001276922203000',
  `total_siswa` INT(11) DEFAULT 537,
  `total_guru` INT(11) DEFAULT 47,
  `total_tendik` INT(11) DEFAULT 11,
  `total_rombel` INT(11) DEFAULT 24,
  `belief_text` TEXT DEFAULT NULL,
  `ayat_quote` TEXT DEFAULT NULL,
  `misi_list` LONGTEXT DEFAULT NULL,
  `tujuan_list` LONGTEXT DEFAULT NULL,
  `map_embed_url` LONGTEXT DEFAULT NULL,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data Seed: site_settings
INSERT INTO `site_settings` (`id`, `school_name`, `tagline`, `visi`, `address`, `phone`, `email`, `website`, `npsn`, `accreditation`, `video_url`, `facebook_url`, `instagram_url`, `youtube_url`, `principal_name`, `principal_title`, `principal_message`, `principal_photo_url`, `history_text`, `spmb_academic_year`, `spmb_hide_payment`, `spmb_status_text`, `spmb_waitlist_notice`, `spmb_drive_folder_url`, `sk_pendirian`, `tgl_sk_pendirian`, `sk_izin_operasional`, `tgl_sk_izin_operasional`, `yayasan`, `bank_name`, `bank_acc_no`, `bank_acc_name`, `bank_branch`, `npwp`, `total_siswa`, `total_guru`, `total_tendik`, `total_rombel`, `belief_text`, `ayat_quote`, `map_embed_url`, `updated_at`) VALUES
(1, 'SD IT Andalas Cendekia', 'Sekolah Generasi Pemimpin Qur’ani', 'Terwujudnya sekolah unggul berkarakter Al-Qur\'an', 'JL. Kampung Baru No.36, RT 00/RW 00, Kel. Sikabau, Kec. Pulau Punjung, Kab. Dharmasraya, Prov. Sumatera Barat 27573', '0812-6655-8123', 'sditac1@gmail.com', 'https://sdit.andalascendekia.sch.id/', '10310802', 'Akreditasi A', 'https://www.youtube.com/embed/vNUhnzfGFKY?autoplay=1', 'https://facebook.com', 'https://instagram.com', 'https://youtube.com', 'Rika Handayani, S.Pd.,Gr.', 'Kepala Sekolah SD IT Andalas Cendekia', 'Assalamu\'alaikum Warahmatullahi Wabarakatuh. Selamat datang di portal resmi SD IT Andalas Cendekia. Kami berkomitmen menyelenggarakan pendidikan yang membekali pendidikan agama, adab dan akhlak mulia, kecakapan hidup kekinian, serta penguasaan sains dan teknologi untuk membentuk Generasi Pemimpin Qur''ani.', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80', 'SD IT Andalas Cendekia didirikan berdasarkan SK No. 188.45/36/Kpts-C-PLP/2011 pada tanggal 14 November 2011 di Kabupaten Dharmasraya, Sumatera Barat.', '2027/2028', 0, 'Pendaftaran Dibuka', 'Biaya pendaftaran sebesar Rp 250.000 ditransfer ke Bank Nagari: 71050220008996 an. Yayasan Andalas Cendekia. Silakan upload bukti transfer di menu Pembayaran.', 'https://drive.google.com/drive/folders/1dKcGp0m7HF9esxIqCpmvqWu0WDew7cYO?usp=sharing', '188.45/36/Kpts-C-PLP/2011', '2011-11-14', '421.1/102/DISDIKPORA/2011', '2011-09-28', 'Yayasan Andalas Cendekia', 'Bank Nagari', '71050220008996', 'Yayasan Andalas Cendekia', 'Dharmasraya', '001276922203000', 537, 47, 11, 24, 'Cerdas Penuh Ketaqwaan', '“Kamu adalah umat terbaik yang dilahirkan untuk manusia, menyuruh kepada yang ma’ruf, dan mencegah dari yang munkar, dan beriman kepada Allah.” (QS. Ali Imran: 110)', 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15959.049618176378!2d101.5300!3d-0.9965!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e2b4f53580521ad%3A0x6b4fb4cb213192f6!2sPulau%20Punjung%2C%20Dharmasraya!5e0!3m2!1sid!2sid!4v1700000000000!5m2!1sid!2sid', '2026-08-26 00:00:00');

-- --------------------------------------------------------
-- 4. TABEL: teachers (Tenaga Pendidik, Guru & Staff)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `teachers` (
  `id` BIGINT(20) NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `role` VARCHAR(150) NOT NULL,
  `mapel` VARCHAR(255) NOT NULL,
  `strata` VARCHAR(50) NOT NULL DEFAULT 'S1',
  `photo_url` VARCHAR(500) DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data Seed: teachers
INSERT INTO `teachers` (`id`, `name`, `role`, `mapel`, `strata`, `created_at`) VALUES
(1, 'Rika Handayani, S.Pd.,Gr.', 'Kepala Sekolah', 'Manajerial & Kepemimpinan', 'S1', '2026-08-26 00:00:00'),
(2, 'Novrika mawarni, S.Pd.', 'Waka Kurikulum', 'Biologi, Kimia, B. Inggris, Mentoring Qur\'anic Leader', 'S1', '2026-08-26 00:00:00'),
(3, 'Sherly Mairiyasti L., S.Pd.', 'Waka Kesiswaan', 'Ekonomi, Sejarah, Geografi, Sosiologi', 'S1', '2026-08-26 00:00:00'),
(4, 'Rayun Sucinda, M.Pd.', 'Waka Sarpras', 'Adab & Al-Qur\'an, Pendidikan Pancasila', 'S2', '2026-08-26 00:00:00'),
(5, 'Yuyun Rahmanita, S.Kom.', 'Tata Usaha / Administrasi', 'Sistem Informasi & Administrasi', 'S1', '2026-08-26 00:00:00'),
(6, 'Vivi Safitri, S.Pd.', 'Guru Bidang Studi', 'Bahasa Indonesia', 'S1', '2026-08-26 00:00:00'),
(7, 'Ade Pahmi Paizal, S.T', 'Guru Bidang Studi', 'Informatika & Komputer', 'S1', '2026-08-26 00:00:00'),
(8, 'Febri Uljapi, S.Hum', 'Guru Bidang Studi', 'Bahasa Arab, Akidah, Fiqh, Sejarah Peradaban Islam', 'S1', '2026-08-26 00:00:00'),
(9, 'St. Irvan Charis, S.Pd.', 'Guru Bidang Studi', 'PJOK (Pendidikan Jasmani Olahraga)', 'S1', '2026-08-26 00:00:00'),
(10, 'Dela Oktavia H., S.Pd.', 'Guru Bidang Studi', 'Bimbingan Konseling (BK)', 'S1', '2026-08-26 00:00:00');

-- --------------------------------------------------------
-- 5. TABEL: hero_slides (Hero Photo Banner Carousel Beranda)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `hero_slides` (
  `id` BIGINT(20) NOT NULL AUTO_INCREMENT,
  `badge` VARCHAR(255) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT NOT NULL,
  `image_url` VARCHAR(500) NOT NULL,
  `primary_cta_text` VARCHAR(100) DEFAULT NULL,
  `primary_cta_link` VARCHAR(255) DEFAULT NULL,
  `secondary_cta_text` VARCHAR(100) DEFAULT NULL,
  `secondary_cta_link` VARCHAR(255) DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data Seed: hero_slides
INSERT INTO `hero_slides` (`id`, `badge`, `title`, `description`, `image_url`, `primary_cta_text`, `primary_cta_link`, `secondary_cta_text`, `secondary_cta_link`, `created_at`) VALUES
(1, 'Kampus Yayasan', 'Gedung dan Halaman Megah Kampus Yayasan', 'Arsitektur megah gedung yayasan dengan halaman terbuka yang asri dan luas.', 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=2560&q=90', '', '', '', '', '2026-08-26 00:00:00'),
(2, 'Aktivitas Belajar', 'Aktivitas Belajar Interaktif Siswa dan Guru', 'Aktivitas belajar interaktif, inspiratif, dan kolaboratif antara siswa dan guru di ruang kelas modern.', 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=2560&q=90', '', '', '', '', '2026-08-26 00:00:00'),
(3, 'Perpustakaan & Riset', 'Fasilitas Perpustakaan dan Riset Modern', 'Fasilitas perpustakaan dan riset modern yang lengkap untuk mendukung literasi serta wawasan global.', 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=2560&q=90', '', '', '', '', '2026-08-26 00:00:00'),
(4, 'Lingkungan Asri', 'Arsitektur Lingkungan Sekolah yang Asri dan Representatif', 'Arsitektur tata ruang hijau lingkungan sekolah yang asri, sejuk, dan representatif bagi pendidikan anak.', 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=2560&q=90', '', '', '', '', '2026-08-26 00:00:00');

-- --------------------------------------------------------
-- 6. TABEL: facilities (Sarana & Prasarana Sekolah)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `facilities` (
  `id` BIGINT(20) NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(255) NOT NULL,
  `category` ENUM('Akademik', 'Keagamaan', 'Teknologi', 'Olahraga & Terbuka') NOT NULL,
  `description` TEXT NOT NULL,
  `image_url` VARCHAR(500) NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data Seed: facilities
INSERT INTO `facilities` (`id`, `title`, `category`, `description`, `image_url`, `created_at`) VALUES
(1, 'Smart Classroom Interaktif', 'Akademik', 'Ruang kelas dilengkapi pendingin udara, layar sentuh digital interaktif, dan sound system pendukung.', 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80', '2026-08-26 00:00:00'),
(2, 'Laboratorium Komputer & Robotics', 'Teknologi', 'Perangkat PC spesifikasi tinggi, jaringan internet gigabit, dan kit eksperimen kecerdasan buatan (AI) & IoT.', 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80', '2026-08-26 00:00:00'),
(3, 'Masjid & Halaqah Center', 'Keagamaan', 'Pusat kegiatan ibadah, Shalat Jamaah harian, serta halaqah Tahfidz Al-Qur\'an dengan kapasitas 500+ jamaah.', 'https://images.unsplash.com/photo-1585036156171-384164a8c675?auto=format&fit=crop&w=800&q=80', '2026-08-26 00:00:00'),
(4, 'Perpustakaan Digital & Literasi', 'Akademik', 'Koleksi e-book 10.000+ judul, area membaca yang nyaman, serta ruang diskusi terbuka.', 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=800&q=80', '2026-08-26 00:00:00'),
(5, 'Lapangan Olahraga Multi-fungsi', 'Olahraga & Terbuka', 'Sarana olahraga basket, futsal, voli, dan arena olahraga panahan bertaraf standar nasional.', 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=800&q=80', '2026-08-26 00:00:00'),
(6, 'Taman Pembelajaran Terbuka & Gazebo', 'Olahraga & Terbuka', 'Lingkungan kampus asri dan hijau yang mendukung kegiatan outdoor study dan istirahat siswa.', 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=800&q=80', '2026-08-26 00:00:00');

-- --------------------------------------------------------
-- 7. TABEL: testimonials (Testimoni Orang Tua & Alumni)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `testimonials` (
  `id` BIGINT(20) NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(150) NOT NULL,
  `role` VARCHAR(150) NOT NULL,
  `rating` INT(11) NOT NULL DEFAULT 5,
  `quote` TEXT NOT NULL,
  `avatar_url` VARCHAR(500) NOT NULL,
  `time_ago` VARCHAR(50) DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data Seed: testimonials
INSERT INTO `testimonials` (`id`, `name`, `role`, `rating`, `quote`, `avatar_url`, `time_ago`, `created_at`) VALUES
(1, 'Dr. H. Hendra Wijaya, M.Si.', 'Orang Tua Siswa Kelas XI', 5, 'Alhamdulillah, perkembangan hafalan Al-Qur\'an dan kedisiplinan anak saya meningkat drastis semenjak bersekolah di SD IT Andalas Cendekia. Guru-gurunya sangat perhatian dan bimbingannya sangat intensif.', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80', '1 Minggu yang lalu', '2026-08-26 00:00:00'),
(2, 'Siti Rahmawati, S.Kom.', 'Alumni SD IT & Mahasiswi Teknik Informatika UI', 5, 'Bekal ilmu coding, bahasa Inggris, serta hafalan Al-Qur\'an dari sekolah membuat saya sangat percaya diri saat masuk perkuliahan. Lingkungan islami di sekolah membentuk karakter tangguh.', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80', '1 Bulan yang lalu', '2026-08-26 00:00:00'),
(3, 'Ir. Ahmad Zulkarnain', 'Orang Tua Alumni (Kedokteran Unand)', 5, 'Perpaduan Kurikulum Merdeka dan program Tahfidz di SD IT Andalas Cendekia terbukti menghasilkan lulusan yang tidak hanya cerdas akademis namun juga berakhlak mulia.', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80', '3 Bulan yang lalu', '2026-08-26 00:00:00');

-- --------------------------------------------------------
-- 8. TABEL: activities (Aktivitas, Ekstrakurikuler & Prestasi Siswa)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `activities` (
  `id` BIGINT(20) NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(255) NOT NULL,
  `type` ENUM('Prestasi', 'Aktivitas Kesiswaan', 'Ekstrakurikuler') NOT NULL,
  `category` VARCHAR(150) NOT NULL,
  `date` VARCHAR(50) NOT NULL,
  `student_name` VARCHAR(150) NOT NULL,
  `achievement_badge` VARCHAR(100) NOT NULL,
  `description` TEXT NOT NULL,
  `image_url` VARCHAR(500) NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data Seed: activities
INSERT INTO `activities` (`id`, `title`, `type`, `category`, `date`, `student_name`, `achievement_badge`, `description`, `image_url`, `created_at`) VALUES
(1, 'Paskibraka Kab. Dharmasraya', 'Prestasi', 'Tingkat Kabupaten', 'Agustus 2025', 'Fauzi Kurniawan', 'Paskibraka Kab.', 'Terpilih dan bertugas sebagai anggota Pasukan Pengibar Bendera Pusaka (Paskibraka) Kabupaten Dharmasraya tahun 2025.', 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=800&q=80', '2026-08-26 00:00:00'),
(2, 'Tasmi\' Al Quran 12 Juz', 'Prestasi', 'Program Tahfidz', 'Oktober 2025', 'Nadya Shiddiqia Yusuf', 'Tasmi\' 12 Juz', 'Berhasil menuntaskan ujian Tasmi\' Al-Qur\'an hafalan 12 Juz sekali duduk dengan predikat Mumtaz.', 'https://images.unsplash.com/photo-1585036156171-384164a8c675?auto=format&fit=crop&w=800&q=80', '2026-08-26 00:00:00'),
(3, 'Tekno Kids & Coding AI', 'Ekstrakurikuler', 'Ekskul PRISE', 'Rutin Mingguan', 'Siswa Kelas 4-6', 'Ekskul Unggulan', 'Pembelajaran logika dasar pemrograman, Scratch, coding web interaktif, dan pengenalan kecerdasan buatan (AI) bagi generasi digital.', 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80', '2026-08-26 00:00:00'),
(4, 'Kader Polisi Cilik (Pocil)', 'Aktivitas Kesiswaan', 'Pembinaan Karakter', 'Program Kedisiplinan', 'Pasukan Pocil SD IT', 'Kader Kedisiplinan', 'Latihan kedisiplinan, baris berbaris, kepemimpinan, dan pembentukan karakter penegak aturan sekolah bekerjasama dengan Polres Dharmasraya.', 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=800&q=80', '2026-08-26 00:00:00'),
(5, 'Panahan & Futsal (Atlet Cilik)', 'Ekstrakurikuler', 'Ekskul PRISE', 'Rutin Mingguan', 'Siswa Kelas 1-6', 'Olahraga Sunnah', 'Pelatihan olahraga sunnah memanah dan futsal untuk mengasah konsentrasi, fisik, ketangkasan, serta jiwa sportivitas tinggi.', 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=800&q=80', '2026-08-26 00:00:00'),
(6, 'Nada Islami & Nasyid Hadrah', 'Ekstrakurikuler', 'Ekskul PRISE', 'Rutin Mingguan', 'Grup Nasyid SD IT', 'Seni Qur\'ani', 'Wadah pembinaan bakat seni musik islami, lantunan shalawat, seni alat musik hadrah, dan pengembangan vokal siswa.', 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80', '2026-08-26 00:00:00'),
(7, 'Festival Sang Bintang (FeSTa)', 'Aktivitas Kesiswaan', 'Agenda Tahunan', 'Tahunan (Bulan ke-9)', 'Seluruh Siswa SD IT', 'Pentas Bakat & Karya', 'Ajang tahunan unjuk kebolehan minat bakat, pameran hasil karya inovatif siswa, serta penganugerahan piala bintang siswa.', 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80', '2026-08-26 00:00:00'),
(8, 'Camp Tahfidz & Tasmi\' Muroja\'ah', 'Aktivitas Kesiswaan', 'Program Keagamaan', 'Berkala Tiap Semester', 'Peserta Halal Tahfidz', 'Sertifikasi Hafalan', 'Karantina intensif hafalan Al-Qur\'an, murojaah bersama musyrif, dan ujian Tasmi\' hafalan 1 hingga 10 Juz sekali duduk.', 'https://images.unsplash.com/photo-1585036156171-384164a8c675?auto=format&fit=crop&w=800&q=80', '2026-08-26 00:00:00'),
(9, 'Kreasi Ceria & Seni Kriya', 'Ekstrakurikuler', 'Ekskul PRISE', 'Rutin Mingguan', 'Siswa Kelas 1-6', 'Seni Rupa & Kriya', 'Pengembangan estetika dan imajinasi tangan melalui melukis, membuat kerajinan kriya dari bahan bekas, serta pameran visual.', 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=800&q=80', '2026-08-26 00:00:00'),
(10, 'Lolos ke Babak Penyisihan Provinsi TKA Bintang Pelajar', 'Prestasi', 'Tingkat Provinsi', 'Oktober 2025', 'Fauzi, Saslix, Farid', 'Penyisihan Provinsi', 'Lolos ke Babak Penyisihan Provinsi TKA Bintang Pelajar mewakili SD IT Andalas Cendekia.', 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80', '2026-08-26 00:00:00');

-- --------------------------------------------------------
-- 9. TABEL: curriculum (Kurikulum, Program Tahfidz & Profil Lulusan)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `curriculum` (
  `id` BIGINT(20) NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(255) NOT NULL,
  `type` ENUM('Program Tahfidz', 'Program Kurikulum', 'Profil Lulusan') NOT NULL,
  `target` VARCHAR(255) NOT NULL,
  `description` TEXT NOT NULL,
  `badge_color` VARCHAR(50) DEFAULT 'bg-emerald-600',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data Seed: curriculum
INSERT INTO `curriculum` (`id`, `title`, `type`, `target`, `description`, `badge_color`, `created_at`) VALUES
(1, 'Program Hafalan Tahfidz Al-Qur\'an Intensif', 'Program Tahfidz', 'Target 5 - 10 Juz Mutqin', 'Setoran halaqah harian bersama musyrif/musyrifah, karantina murojaah, dan wisuda sertifikasi Tahfidz.', 'bg-emerald-600', '2026-08-26 00:00:00'),
(2, 'Campus Preparation & Sukses UTBK', 'Program Kurikulum', '90% Melanjutkan Kuliah & 50% Lolos PTN/PTKIN', 'Pendampingan belajar intensif, tryout berkala, matrikulasi jurusan, dan pemetaan bakat menuju perguruan tinggi favorit.', 'bg-amber-500', '2026-08-26 00:00:00'),
(3, 'PENDAKI (Pembinaan Dasar Kepemimpinan Islam)', 'Program Kurikulum', '100% Memiliki Portofolio Kepemimpinan Qur’ani', 'Latihan manajemen organisasi santri, pengasuhan adab harian, integritas, dan keberanian tampil di depan publik.', 'bg-emerald-700', '2026-08-26 00:00:00'),
(4, 'Tri Lingual Culture (Indonesia, Arab, English)', 'Program Kurikulum', '100% Menguasai 3 Bahasa Aktif', 'Lingkungan percakapan dan debat harian dalam 3 bahasa untuk kesiapan global peserta didik.', 'bg-blue-600', '2026-08-26 00:00:00'),
(5, 'Faqih Fiddin & Islamic Studies', 'Profil Lulusan', 'Menguasai Aqidah, Fiqih, Sirah, & Tarikh', 'Pemahaman komprehensif tentang ilmu syar\'i untuk melahirkan generasi yang bertakwa dan berwawasan luas.', 'bg-amber-600', '2026-08-26 00:00:00'),
(6, 'Life Skill & Kecakapan Digital', 'Profil Lulusan', 'Penguasaan Komputer, AI & Problem Solving', 'Pembekalan hard skill era digital dan pemanfaatan teknologi positif.', 'bg-indigo-600', '2026-08-26 00:00:00');

-- --------------------------------------------------------
-- 10. TABEL: news (Berita & Pengumuman Sekolah)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `news` (
  `id` BIGINT(20) NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(255) NOT NULL,
  `category` ENUM('Berita Terkini', 'Kegiatan Sekolah', 'Prestasi', 'Galeri') NOT NULL,
  `date` VARCHAR(50) NOT NULL,
  `author` VARCHAR(100) NOT NULL DEFAULT 'Admin',
  `comments_count` INT(11) NOT NULL DEFAULT 0,
  `image_url` VARCHAR(500) NOT NULL,
  `excerpt` TEXT NOT NULL,
  `content` LONGTEXT NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data Seed: news
INSERT INTO `news` (`id`, `title`, `category`, `date`, `author`, `comments_count`, `image_url`, `excerpt`, `content`, `created_at`) VALUES
(1, 'Siswa SD IT Andalas Cendekia Raih Juara 1 Olimpiade Sains & IT Nasional 2026', 'Prestasi', '23/04/2026', 'Tim Humas', 12, 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80', 'Delegasi SD IT Andalas Cendekia kembali menorehkan prestasi gemilang dengan menjuarai kompetisi karya ilmiah dan aplikasi IT tingkat nasional.', 'Pada ajang Olimpiade Sains dan IT tingkat nasional yang diselenggarakan di Jakarta, tim siswa SD IT Andalas Cendekia berhasil meraih Medali Emas Juara 1 dalam kategori Inovasi Aplikasi Edukasi Islami Berbasis AI. Kepala Sekolah memberikan apresiasi setinggi-tingginya atas perjuangan para siswa dan guru pendamping.', '2026-08-26 00:00:00'),
(2, 'Muria & Halal Bihalal Ramadhan: Santunan Anak Yatim dan Tahfidz Qur\'an', 'Kegiatan Sekolah', '15/04/2026', 'Panitia Rohis', 8, 'https://images.unsplash.com/photo-1585036156171-384164a8c675?auto=format&fit=crop&w=800&q=80', 'Seluruh keluarga besar sekolah merayakan penutupan bulan suci dengan pembagian sembako, santunan, dan khataman Al-Qur\'an 30 Juz.', 'Kegiatan rutin tahunan dalam rangka mengasah kepedulian sosial peserta didik dan mempererat tali silaturahmi antar warga sekolah, orang tua, dan masyarakat sekitar.', '2026-08-26 00:00:00');

-- --------------------------------------------------------
-- 11. TABEL: events (Agenda Acara & Kalender Akademik)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `events` (
  `id` BIGINT(20) NOT NULL AUTO_INCREMENT,
  `day` VARCHAR(10) NOT NULL,
  `month` VARCHAR(20) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `time` VARCHAR(100) NOT NULL,
  `location` VARCHAR(255) NOT NULL,
  `category` VARCHAR(100) NOT NULL,
  `description` TEXT NOT NULL,
  `organizer` VARCHAR(150) DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data Seed: events
INSERT INTO `events` (`id`, `day`, `month`, `title`, `time`, `location`, `category`, `description`, `organizer`, `created_at`) VALUES
(1, '15', 'OKT', 'Camp Tahfidz Intensif & Sertifikasi Hafalan 2026', '08:00 WIB – Selesai', 'Masjid & Camp Hall SMA IT', 'Keagamaan & Tahfidz', 'Kegiatan karantina dan murojaah hafalan intensif bagi seluruh calon wisudawan Tahfidz angkatan 2026/2027.', 'Panitia Tahfidz & Musyrif', '2026-08-26 00:00:00');

SET FOREIGN_KEY_CHECKS = 1;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
