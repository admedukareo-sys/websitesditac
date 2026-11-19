<?php
// ==============================================================================
// SCRIPT OTOMATIS INSTALL SKEMA & DATA BASELINE (PHP -> MYSQL)
// Database: andalas4_sdit
// Mendukung Penuh Sinkronisasi Frontend <-> Backend MySQL
// ==============================================================================

require_once __DIR__ . '/config.php';

try {
    // 1. Users Table
    $pdo->exec("CREATE TABLE IF NOT EXISTS `users` (
      `id` INT(11) NOT NULL AUTO_INCREMENT,
      `name` VARCHAR(255) NOT NULL,
      `email` VARCHAR(255) NOT NULL,
      `role` VARCHAR(50) NOT NULL DEFAULT 'STUDENT',
      `password` VARCHAR(255) NOT NULL,
      `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (`id`),
      UNIQUE KEY `email` (`email`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");

    // Pastikan kolom role VARCHAR(50) jika sebelumnya ENUM
    try {
        $pdo->exec("ALTER TABLE `users` MODIFY COLUMN `role` VARCHAR(50) NOT NULL DEFAULT 'STUDENT'");
    } catch (Exception $e) {}

    // Seed Admin if empty
    $stmt = $pdo->query("SELECT COUNT(*) FROM `users` WHERE `email` = 'admin@sdit.sch.id'");
    if ($stmt->fetchColumn() == 0) {
        $pdo->exec("INSERT INTO `users` (`name`, `email`, `role`, `password`, `created_at`) VALUES 
        ('Administrator SPMB', 'admin@sdit.sch.id', 'ADMIN', 'admin', NOW());");
    }

    // Seed Panitia SPMB if empty
    $stmt = $pdo->query("SELECT COUNT(*) FROM `users` WHERE `email` = 'panitia@sdit.sch.id'");
    if ($stmt->fetchColumn() == 0) {
        $pdo->exec("INSERT INTO `users` (`name`, `email`, `role`, `password`, `created_at`) VALUES 
        ('Panitia SPMB SD IT', 'panitia@sdit.sch.id', 'PANITIA_SPMB', 'panitia123', NOW());");
    }

    // 2. Registrations Table
    $pdo->exec("CREATE TABLE IF NOT EXISTS `registrations` (
      `id` BIGINT(20) NOT NULL AUTO_INCREMENT,
      `user_id` INT(11) NOT NULL,
      `client_id` VARCHAR(100) DEFAULT NULL,
      `student_name` VARCHAR(255) DEFAULT NULL,
      `nisn` VARCHAR(50) DEFAULT NULL,
      `nik` VARCHAR(50) DEFAULT NULL,
      `birth_place` VARCHAR(100) DEFAULT NULL,
      `birth_date` DATE DEFAULT NULL,
      `gender` ENUM('L', 'P') DEFAULT NULL,
      `address` TEXT DEFAULT NULL,
      `father_name` VARCHAR(150) DEFAULT NULL,
      `mother_name` VARCHAR(150) DEFAULT NULL,
      `parent_phone` VARCHAR(50) DEFAULT NULL,
      `previous_school` VARCHAR(255) DEFAULT NULL,
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
      `program_type` VARCHAR(50) DEFAULT 'BOARDING',
      `info_source` VARCHAR(255) DEFAULT NULL,
      `reason_to_join` TEXT DEFAULT NULL,
      `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (`id`),
      KEY `fk_registrations_user` (`user_id`),
      KEY `idx_client_id` (`client_id`),
      CONSTRAINT `fk_registrations_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");

    try {
        $pdo->exec("ALTER TABLE `registrations` ADD COLUMN `client_id` VARCHAR(100) DEFAULT NULL AFTER `user_id`");
    } catch (Exception $e) {}

    // 3. Site Settings Table
    $pdo->exec("CREATE TABLE IF NOT EXISTS `site_settings` (
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
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");

    $stmt = $pdo->query("SELECT COUNT(*) FROM `site_settings`");
    if ($stmt->fetchColumn() == 0) {
        $pdo->exec("INSERT INTO `site_settings` (`id`, `school_name`, `tagline`, `visi`, `address`, `phone`, `email`, `website`, `npsn`, `accreditation`, `video_url`, `facebook_url`, `instagram_url`, `youtube_url`, `principal_name`, `principal_title`, `principal_message`, `principal_photo_url`, `history_text`, `spmb_academic_year`, `spmb_hide_payment`, `spmb_status_text`, `spmb_waitlist_notice`, `spmb_drive_folder_url`, `sk_pendirian`, `tgl_sk_pendirian`, `sk_izin_operasional`, `tgl_sk_izin_operasional`, `yayasan`, `bank_name`, `bank_acc_no`, `bank_acc_name`, `bank_branch`, `npwp`, `total_siswa`, `total_guru`, `total_tendik`, `total_rombel`, `belief_text`, `ayat_quote`, `map_embed_url`, `updated_at`) VALUES
        (1, 'SD IT Andalas Cendekia', 'Sekolah Generasi Pemimpin Qur’ani', 'Mewujudkan Siswa Generasi Pemimpin Qur’ani', 'JL. Kampung Baru No.36, RT 00/RW 00, Kel. Sikabau, Kec. Pulau Punjung, Kab. Dharmasraya, Prov. Sumatera Barat 27573', '0812-6655-8123', 'sditac1@gmail.com', 'https://sdit.andalascendekia.sch.id/', '10310802', 'Akreditasi A', 'https://www.youtube.com/embed/vNUhnzfGFKY?autoplay=1', 'https://facebook.com', 'https://instagram.com', 'https://youtube.com', 'Rika Handayani, S.Pd.,Gr.', 'Kepala Sekolah SD IT Andalas Cendekia', 'Assalamu\'alaikum Warahmatullahi Wabarakatuh. Selamat datang di portal resmi SD IT Andalas Cendekia. Kami berkomitmen menyelenggarakan pendidikan dasar Islam terpadu yang membekali pendidikan agama, adab dan akhlak mulia, kecakapan hidup kekinian, serta penguasaan sains dan teknologi untuk membentuk Generasi Pemimpin Qur\'ani.', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80', 'SD IT Andalas Cendekia didirikan berdasarkan SK No. 188.45/36/Kpts-C-PLP/2011 pada tanggal 14 November 2011 di Kabupaten Dharmasraya, Sumatera Barat.', '2027/2028', 0, 'Pendaftaran Dibuka', 'Biaya pendaftaran sebesar Rp 250.000 ditransfer ke Bank Nagari: 71050220008996 an. Yayasan Andalas Cendekia. Silakan upload bukti transfer di menu Pembayaran.', 'https://drive.google.com/drive/folders/1dKcGp0m7HF9esxIqCpmvqWu0WDew7cYO?usp=sharing', '188.45/36/Kpts-C-PLP/2011', '2011-11-14', '421.1/102/DISDIKPORA/2011', '2011-09-28', 'Yayasan Andalas Cendekia', 'Bank Nagari', '71050220008996', 'Yayasan Andalas Cendekia', 'Dharmasraya', '001276922203000', 537, 47, 11, 24, 'Cerdas Penuh Ketaqwaan', '“Kamu adalah umat terbaik yang dilahirkan untuk manusia, menyuruh kepada yang ma’ruf, dan mencegah dari yang munkar, dan beriman kepada Allah.” (QS. Ali Imran: 110)', 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15959.049618176378!2d101.5300!3d-0.9965!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e2b4f53580521ad%3A0x6b4fb4cb213192f6!2sPulau%20Punjung%2C%20Dharmasraya!5e0!3m2!1sid!2sid!4v1700000000000!5m2!1sid!2sid', NOW());");
    }

    // 4. Teachers Table
    $pdo->exec("CREATE TABLE IF NOT EXISTS `teachers` (
      `id` INT(11) NOT NULL AUTO_INCREMENT,
      `name` VARCHAR(255) NOT NULL,
      `role` VARCHAR(150) NOT NULL,
      `mapel` VARCHAR(255) NOT NULL,
      `strata` VARCHAR(50) NOT NULL DEFAULT 'S1',
      `photo_url` VARCHAR(500) DEFAULT NULL,
      `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (`id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");

    // 5. Hero Slides Table
    $pdo->exec("CREATE TABLE IF NOT EXISTS `hero_slides` (
      `id` INT(11) NOT NULL AUTO_INCREMENT,
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
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");

    // 6. Facilities Table
    $pdo->exec("CREATE TABLE IF NOT EXISTS `facilities` (
      `id` INT(11) NOT NULL AUTO_INCREMENT,
      `title` VARCHAR(255) NOT NULL,
      `category` ENUM('Akademik', 'Keagamaan', 'Teknologi', 'Olahraga & Terbuka') NOT NULL,
      `description` TEXT NOT NULL,
      `image_url` VARCHAR(500) NOT NULL,
      `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (`id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");

    // 7. Testimonials Table
    $pdo->exec("CREATE TABLE IF NOT EXISTS `testimonials` (
      `id` INT(11) NOT NULL AUTO_INCREMENT,
      `name` VARCHAR(150) NOT NULL,
      `role` VARCHAR(150) NOT NULL,
      `rating` INT(11) NOT NULL DEFAULT 5,
      `quote` TEXT NOT NULL,
      `avatar_url` VARCHAR(500) NOT NULL,
      `time_ago` VARCHAR(50) DEFAULT NULL,
      `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (`id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");

    // 8. Activities Table
    $pdo->exec("CREATE TABLE IF NOT EXISTS `activities` (
      `id` INT(11) NOT NULL AUTO_INCREMENT,
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
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");

    // 9. Curriculum Table
    $pdo->exec("CREATE TABLE IF NOT EXISTS `curriculum` (
      `id` INT(11) NOT NULL AUTO_INCREMENT,
      `title` VARCHAR(255) NOT NULL,
      `type` ENUM('Program Tahfidz', 'Program Kurikulum', 'Profil Lulusan') NOT NULL,
      `target` VARCHAR(255) NOT NULL,
      `description` TEXT NOT NULL,
      `badge_color` VARCHAR(50) DEFAULT 'bg-emerald-600',
      `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (`id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");

    // 10. News Table
    $pdo->exec("CREATE TABLE IF NOT EXISTS `news` (
      `id` INT(11) NOT NULL AUTO_INCREMENT,
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
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");

    // 11. Events Table
    $pdo->exec("CREATE TABLE IF NOT EXISTS `events` (
      `id` INT(11) NOT NULL AUTO_INCREMENT,
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
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");

    // 12. Advantages Table
    $pdo->exec("CREATE TABLE IF NOT EXISTS `advantages` (
      `id` INT(11) NOT NULL AUTO_INCREMENT,
      `title` VARCHAR(255) NOT NULL,
      `desc` TEXT NOT NULL,
      `icon_name` VARCHAR(100) NOT NULL DEFAULT 'CheckCircle2',
      PRIMARY KEY (`id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");

    // 13. Visitor Logs Table
    $pdo->exec("CREATE TABLE IF NOT EXISTS `visitor_logs` (
      `id` VARCHAR(50) NOT NULL,
      `timestamp` VARCHAR(50) NOT NULL,
      `page` VARCHAR(255) NOT NULL,
      `page_title` VARCHAR(255) DEFAULT NULL,
      `ip` VARCHAR(50) NOT NULL,
      `city` VARCHAR(100) DEFAULT NULL,
      `region` VARCHAR(150) DEFAULT NULL,
      `country` VARCHAR(100) DEFAULT NULL,
      `device_type` VARCHAR(50) DEFAULT NULL,
      `browser` VARCHAR(100) DEFAULT NULL,
      `os` VARCHAR(100) DEFAULT NULL,
      `referrer` VARCHAR(255) DEFAULT NULL,
      `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (`id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");

    echo json_encode([
        "status" => "success",
        "message" => "Database MySQL `{$db_name}` berhasil disiapkan dan terhubung 100%!"
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Gagal eksekusi skema database: " . $e->getMessage()
    ]);
}
