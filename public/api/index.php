<?php
// ==============================================================================
// REST API ROUTER UNTUK WEBSITE SD IT ANDALAS CENDEKIA
// Database Backend: MySQL (andalas4_sdit)
// Mendukung Sinkronisasi Penuh Frontend <-> Backend MySQL
// ==============================================================================

require_once __DIR__ . '/config.php';

$action = $_GET['action'] ?? $_POST['action'] ?? '';

// Ambil JSON Input jika ada
$rawInput = file_get_contents('php://input');
$input = json_decode($rawInput, true) ?? $_POST;

// ==============================================================================
// HELPER OTENTIKASI & KEAMANAN TOKEN (HMAC-SHA256)
// ==============================================================================
function createAuthToken($user, $secret) {
    $payload = [
        'id' => (int)$user['id'],
        'email' => strtolower(trim($user['email'] ?? '')),
        'role' => $user['role'] ?? 'STUDENT',
        'name' => $user['name'] ?? '',
        'exp' => time() + (86400 * 30), // 30 hari aktif
    ];
    $data = rtrim(strtr(base64_encode(json_encode($payload)), '+/', '-_'), '=');
    $sig = hash_hmac('sha256', $data, $secret);
    return $data . '.' . $sig;
}

function getAuthenticatedUser($secret) {
    $header = $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '';
    if (!$header && function_exists('apache_request_headers')) {
        $headers = apache_request_headers();
        $header = $headers['Authorization'] ?? $headers['authorization'] ?? '';
    }
    if (!$header && !empty($_GET['token'])) {
        $header = 'Bearer ' . $_GET['token'];
    }
    if (!preg_match('/Bearer\s+(.*)$/i', $header, $matches)) {
        return null;
    }
    $parts = explode('.', trim($matches[1]));
    if (count($parts) !== 2) return null;
    list($data, $sig) = $parts;
    if (!hash_equals(hash_hmac('sha256', $data, $secret), $sig)) {
        return null;
    }
    $json = base64_decode(strtr($data, '-_', '+/'));
    $payload = json_decode($json, true);
    if (!$payload || !isset($payload['exp']) || $payload['exp'] < time()) {
        return null;
    }
    return $payload;
}

switch ($action) {
    case 'ping':
        echo json_encode([
            "status" => "success",
            "message" => "Database MySQL `{$db_name}` aktif dan siap!",
            "server_time" => date('Y-m-d H:i:s')
        ]);
        break;

    case 'login':
        $email = strtolower(trim($input['email'] ?? ''));
        $password = trim($input['password'] ?? '');

        if (!$email || !$password) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Email dan password wajib diisi!"]);
            break;
        }

        // Ambil data user berdasarkan email
        $stmt = $pdo->prepare("SELECT `id`, `name`, `email`, `password`, `role` FROM `users` WHERE `email` = ? LIMIT 1");
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        $verified = false;
        if ($user) {
            // Cek dengan password_verify (Bcrypt)
            if (password_verify($password, $user['password'])) {
                $verified = true;
            } 
            // Fallback backward compatibility untuk password lama (plaintext)
            else if (hash_equals((string)$user['password'], (string)$password)) {
                $verified = true;
                // Auto-upgrade password ke hash bcrypt yang aman di MySQL
                try {
                    $newHash = password_hash($password, PASSWORD_DEFAULT);
                    $upStmt = $pdo->prepare("UPDATE `users` SET `password` = ? WHERE `id` = ?");
                    $upStmt->execute([$newHash, $user['id']]);
                } catch (Exception $e) {}
            }
        }

        if ($verified) {
            unset($user['password']);
            $token = createAuthToken($user, $app_secret);
            echo json_encode([
                "status" => "success", 
                "token" => $token,
                "data" => $user, 
                "user" => $user
            ]);
        } else {
            http_response_code(401);
            echo json_encode(["status" => "error", "message" => "Email atau password tidak sesuai!"]);
        }
        break;

    case 'google_auth':
        $email = strtolower(trim($input['email'] ?? ''));
        $name = trim($input['name'] ?? '');
        $googleId = trim($input['googleId'] ?? '');

        if (!$email) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Email tidak boleh kosong"]);
            break;
        }

        // Cari apakah email sudah ada di tabel users
        $stmt = $pdo->prepare("SELECT `id`, `name`, `email`, `role` FROM `users` WHERE `email` = ? LIMIT 1");
        $stmt->execute([$email]);
        $existing = $stmt->fetch();

        if ($existing) {
            $token = createAuthToken($existing, $app_secret);
            echo json_encode([
                "status" => "success",
                "token" => $token,
                "data" => $existing,
                "user" => $existing,
                "is_new" => false
            ]);
        } else {
            // Buat user baru otomatis
            $displayName = $name ?: 'Pendaftar Google';
            $dummyPass = password_hash('sso_google_' . bin2hex(random_bytes(16)), PASSWORD_DEFAULT);
            $stmt = $pdo->prepare("INSERT INTO `users` (`name`, `email`, `password`, `role`, `created_at`) VALUES (?, ?, ?, 'STUDENT', NOW())");
            $stmt->execute([$displayName, $email, $dummyPass]);
            $newId = (int)$pdo->lastInsertId();

            // Buat draf registrasi awal di tabel registrations
            try {
                $stmtReg = $pdo->prepare("INSERT INTO `registrations` (`user_id`, `status`, `payment_status`, `program_type`, `created_at`) VALUES (?, 'DRAFT', 'UNPAID', 'BOARDING', NOW())");
                $stmtReg->execute([$newId]);
            } catch (Exception $e) {}

            $newUser = [
                "id" => $newId,
                "name" => $displayName,
                "email" => $email,
                "role" => 'STUDENT'
            ];
            $token = createAuthToken($newUser, $app_secret);

            echo json_encode([
                "status" => "success",
                "token" => $token,
                "data" => $newUser,
                "user" => $newUser,
                "is_new" => true
            ]);
        }
        break;

    case 'save_user':
        $email = strtolower(trim($input['email'] ?? ''));
        $name = trim($input['name'] ?? '');
        $password = trim($input['password'] ?? '');
        $role = trim($input['role'] ?? 'STUDENT');

        if (!$email) {
            echo json_encode(["status" => "error", "message" => "Email kosong"]);
            break;
        }

        // Pastikan kolom role adalah VARCHAR(50) untuk mendukung PANITIA_SPMB
        try {
            $pdo->exec("ALTER TABLE `users` MODIFY COLUMN `role` VARCHAR(50) NOT NULL DEFAULT 'STUDENT'");
        } catch (Exception $e) {}

        $stmt = $pdo->prepare("SELECT `id`, `password` FROM `users` WHERE `email` = ? LIMIT 1");
        $stmt->execute([$email]);
        $exists = $stmt->fetch();

        if ($exists) {
            if ($password !== '') {
                $hashedPass = password_hash($password, PASSWORD_DEFAULT);
                $stmt = $pdo->prepare("UPDATE `users` SET `name` = ?, `password` = ?, `role` = ? WHERE `id` = ?");
                $stmt->execute([$name, $hashedPass, $role, $exists['id']]);
            } else {
                $stmt = $pdo->prepare("UPDATE `users` SET `name` = ?, `role` = ? WHERE `id` = ?");
                $stmt->execute([$name, $role, $exists['id']]);
            }
            $userData = ["id" => (int)$exists['id'], "name" => $name, "email" => $email, "role" => $role];
            echo json_encode(["status" => "success", "data" => $userData, "user" => $userData]);
        } else {
            $hashedPass = $password !== '' ? password_hash($password, PASSWORD_DEFAULT) : password_hash(bin2hex(random_bytes(8)), PASSWORD_DEFAULT);
            $stmt = $pdo->prepare("INSERT INTO `users` (`name`, `email`, `password`, `role`, `created_at`) VALUES (?, ?, ?, ?, NOW())");
            $stmt->execute([$name, $email, $hashedPass, $role]);
            $newId = (int)$pdo->lastInsertId();
            $userData = ["id" => $newId, "name" => $name, "email" => $email, "role" => $role];
            echo json_encode(["status" => "success", "data" => $userData, "user" => $userData]);
        }
        break;

    case 'get_users':
        $stmt = $pdo->query("SELECT `id`, `name`, `email`, `role`, `created_at` FROM `users` ORDER BY `id` ASC");
        echo json_encode(["status" => "success", "data" => $stmt->fetchAll()]);
        break;

    case 'delete_user':
        $delId = (int)($input['id'] ?? $_GET['id'] ?? 0);
        if ($delId > 0) {
            $stmt = $pdo->prepare("DELETE FROM `users` WHERE `id` = ?");
            $stmt->execute([$delId]);
            echo json_encode(["status" => "success", "message" => "User berhasil dihapus"]);
        } else {
            echo json_encode(["status" => "error", "message" => "ID tidak valid"]);
        }
        break;

    case 'get_settings':
        $stmt = $pdo->query("SELECT * FROM `site_settings` LIMIT 1");
        $settings = $stmt->fetch() ?: [];
        echo json_encode(["status" => "success", "data" => $settings]);
        break;

    case 'save_settings':
        $s = $input;

        // Auto ensure all site_settings columns exist
        $settingsCols = [
            'spmb_academic_year' => "VARCHAR(50) DEFAULT '2027/2028'",
            'spmb_hide_payment' => "TINYINT(1) DEFAULT 0",
            'spmb_status_text' => "VARCHAR(100) DEFAULT 'Pendaftaran Dibuka'",
            'spmb_waitlist_notice' => "TEXT DEFAULT NULL",
            'spmb_drive_folder_url' => "VARCHAR(500) DEFAULT NULL",
            'sk_pendirian' => "VARCHAR(150) DEFAULT '188.45/36/Kpts-C-PLP/2011'",
            'tgl_sk_pendirian' => "VARCHAR(50) DEFAULT '2011-11-14'",
            'sk_izin_operasional' => "VARCHAR(150) DEFAULT '421.1/102/DISDIKPORA/2011'",
            'tgl_sk_izin_operasional' => "VARCHAR(50) DEFAULT '2011-09-28'",
            'yayasan' => "VARCHAR(255) DEFAULT 'Yayasan Andalas Cendekia'",
            'bank_name' => "VARCHAR(150) DEFAULT 'Bank Nagari'",
            'bank_acc_no' => "VARCHAR(100) DEFAULT '71050220008996'",
            'bank_acc_name' => "VARCHAR(255) DEFAULT 'Yayasan Andalas Cendekia'",
            'bank_branch' => "VARCHAR(150) DEFAULT 'Dharmasraya'",
            'npwp' => "VARCHAR(100) DEFAULT '001276922203000'",
            'total_siswa' => "INT(11) DEFAULT 537",
            'total_guru' => "INT(11) DEFAULT 47",
            'total_tendik' => "INT(11) DEFAULT 11",
            'total_rombel' => "INT(11) DEFAULT 24",
            'belief_text' => "VARCHAR(255) DEFAULT 'Cerdas Penuh Ketaqwaan'",
            'ayat_quote' => "TEXT DEFAULT NULL",
            'misi_list' => "TEXT DEFAULT NULL",
            'tujuan_list' => "TEXT DEFAULT NULL",
            'map_embed_url' => "TEXT DEFAULT NULL",
        ];
        foreach ($settingsCols as $col => $colDef) {
            try {
                $pdo->query("SELECT `{$col}` FROM `site_settings` LIMIT 1");
            } catch (Exception $e) {
                try {
                    $pdo->exec("ALTER TABLE `site_settings` ADD COLUMN `{$col}` {$colDef}");
                } catch (Exception $e2) {}
            }
        }

        $misiJson = is_array($s['misiList'] ?? null) ? json_encode($s['misiList']) : ($s['misiList'] ?? $s['misi_list'] ?? null);
        $tujuanJson = is_array($s['tujuanList'] ?? null) ? json_encode($s['tujuanList']) : ($s['tujuanList'] ?? $s['tujuan_list'] ?? null);

        try {
            $checkSettings = $pdo->query("SELECT id FROM `site_settings` WHERE id = 1 LIMIT 1")->fetch();
            if (!$checkSettings) {
                $pdo->exec("INSERT INTO `site_settings` (`id`, `school_name`) VALUES (1, 'SD IT Andalas Cendekia')");
            }
        } catch (Exception $e) {}

        try {
            $stmt = $pdo->prepare("UPDATE `site_settings` SET 
                `school_name` = ?, `tagline` = ?, `visi` = ?, `address` = ?, `phone` = ?, 
                `email` = ?, `website` = ?, `npsn` = ?, `accreditation` = ?, `video_url` = ?, `facebook_url` = ?, 
                `instagram_url` = ?, `youtube_url` = ?, `principal_name` = ?, 
                `principal_title` = ?, `principal_message` = ?, `principal_photo_url` = ?, 
                `history_text` = ?, `spmb_academic_year` = ?, `spmb_hide_payment` = ?, 
                `spmb_status_text` = ?, `spmb_waitlist_notice` = ?,
                `sk_pendirian` = ?, `tgl_sk_pendirian` = ?, `sk_izin_operasional` = ?, `tgl_sk_izin_operasional` = ?,
                `yayasan` = ?, `bank_name` = ?, `bank_acc_no` = ?, `bank_acc_name` = ?, `bank_branch` = ?,
                `npwp` = ?, `total_siswa` = ?, `total_guru` = ?, `total_tendik` = ?, `total_rombel` = ?,
                `belief_text` = ?, `ayat_quote` = ?, `misi_list` = ?, `tujuan_list` = ?, `map_embed_url` = ?,
                `spmb_drive_folder_url` = ? 
                WHERE `id` = 1");
            $stmt->execute([
                $s['schoolName'] ?? $s['school_name'] ?? 'SD IT Andalas Cendekia',
                $s['tagline'] ?? '',
                $s['visi'] ?? '',
                $s['address'] ?? '',
                $s['phone'] ?? '',
                $s['email'] ?? '',
                $s['website'] ?? '',
                $s['npsn'] ?? '10310802',
                $s['accreditation'] ?? 'Akreditasi A',
                $s['videoUrl'] ?? $s['video_url'] ?? '',
                $s['facebookUrl'] ?? $s['facebook_url'] ?? '',
                $s['instagramUrl'] ?? $s['instagram_url'] ?? '',
                $s['youtubeUrl'] ?? $s['youtube_url'] ?? '',
                $s['principalName'] ?? $s['principal_name'] ?? '',
                $s['principalTitle'] ?? $s['principal_title'] ?? '',
                $s['principalMessage'] ?? $s['principal_message'] ?? '',
                $s['principalPhotoUrl'] ?? $s['principal_photo_url'] ?? '',
                $s['historyText'] ?? $s['history_text'] ?? '',
                $s['spmbAcademicYear'] ?? $s['spmb_academic_year'] ?? '2027/2028',
                isset($s['spmbHidePayment']) ? ($s['spmbHidePayment'] ? 1 : 0) : 0,
                $s['spmbStatusText'] ?? $s['spmb_status_text'] ?? 'Pendaftaran Dibuka',
                $s['spmbWaitlistNotice'] ?? $s['spmb_waitlist_notice'] ?? '',
                $s['skPendirian'] ?? $s['sk_pendirian'] ?? '188.45/36/Kpts-C-PLP/2011',
                $s['tglSkPendirian'] ?? $s['tgl_sk_pendirian'] ?? '2011-11-14',
                $s['skIzinOperasional'] ?? $s['sk_izin_operasional'] ?? '421.1/102/DISDIKPORA/2011',
                $s['tglSkIzinOperasional'] ?? $s['tgl_sk_izin_operasional'] ?? '2011-09-28',
                $s['yayasan'] ?? 'Yayasan Andalas Cendekia',
                $s['bankName'] ?? $s['bank_name'] ?? 'Bank Nagari',
                $s['bankAccNo'] ?? $s['bank_acc_no'] ?? '71050220008996',
                $s['bankAccName'] ?? $s['bank_acc_name'] ?? 'Yayasan Andalas Cendekia',
                $s['bankBranch'] ?? $s['bank_branch'] ?? 'Dharmasraya',
                $s['npwp'] ?? '001276922203000',
                $s['totalSiswa'] ?? 537,
                $s['totalGuru'] ?? 47,
                $s['totalTendik'] ?? 11,
                $s['totalRombel'] ?? 24,
                $s['beliefText'] ?? $s['belief_text'] ?? 'Cerdas Penuh Ketaqwaan',
                $s['ayatQuote'] ?? $s['ayat_quote'] ?? '',
                $misiJson,
                $tujuanJson,
                $s['mapEmbedUrl'] ?? $s['map_embed_url'] ?? '',
                $s['spmbDriveFolderUrl'] ?? $s['spmb_drive_folder_url'] ?? 'https://drive.google.com/drive/folders/1dKcGp0m7HF9esxIqCpmvqWu0WDew7cYO?usp=sharing',
            ]);
        } catch (Exception $e) {
            // Fallback basic update
            $stmt = $pdo->prepare("UPDATE `site_settings` SET 
                `school_name` = ?, `tagline` = ?, `visi` = ?, `address` = ?, `phone` = ?, 
                `email` = ?, `website` = ?, `video_url` = ?, `facebook_url` = ?, 
                `instagram_url` = ?, `youtube_url` = ?, `principal_name` = ?, 
                `principal_title` = ?, `principal_message` = ?, `principal_photo_url` = ?, 
                `history_text` = ? WHERE `id` = 1");
            $stmt->execute([
                $s['schoolName'] ?? $s['school_name'] ?? 'SD IT Andalas Cendekia',
                $s['tagline'] ?? '',
                $s['visi'] ?? '',
                $s['address'] ?? '',
                $s['phone'] ?? '',
                $s['email'] ?? '',
                $s['website'] ?? '',
                $s['videoUrl'] ?? $s['video_url'] ?? '',
                $s['facebookUrl'] ?? $s['facebook_url'] ?? '',
                $s['instagramUrl'] ?? $s['instagram_url'] ?? '',
                $s['youtubeUrl'] ?? $s['youtube_url'] ?? '',
                $s['principalName'] ?? $s['principal_name'] ?? '',
                $s['principalTitle'] ?? $s['principal_title'] ?? '',
                $s['principalMessage'] ?? $s['principal_message'] ?? '',
                $s['principalPhotoUrl'] ?? $s['principal_photo_url'] ?? '',
                $s['historyText'] ?? $s['history_text'] ?? '',
            ]);
        }
        echo json_encode(["status" => "success", "message" => "Pengaturan berhasil disimpan ke MySQL"]);
        break;

    case 'upload_file':
        // ==============================================================================
        // UPLOAD FILE/GAMBAR SPMB DENGAN DUAL PERSISTENCE (DISK + DATABASE BLOB)
        // File disimpan di direktori /api/uploads/spmb/ dan di-backup ke tabel MySQL
        // `registration_files` (LONGBLOB) sehingga aman dari penghapusan / cPanel redeploy
        // ==============================================================================
        $uploadDir = __DIR__ . '/uploads/spmb';
        if (!is_dir($uploadDir)) {
            @mkdir($uploadDir, 0755, true);
        }

        // Pastikan tabel backup BLOB tersedia di MySQL
        try {
            $pdo->exec("CREATE TABLE IF NOT EXISTS `registration_files` (
                `id` BIGINT(20) NOT NULL AUTO_INCREMENT,
                `file_name` VARCHAR(255) NOT NULL,
                `category` VARCHAR(50) NOT NULL DEFAULT 'spmb',
                `mime_type` VARCHAR(100) NOT NULL DEFAULT 'image/jpeg',
                `file_size` INT(11) NOT NULL DEFAULT 0,
                `file_data` LONGBLOB NOT NULL,
                `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (`id`),
                UNIQUE KEY `uk_file_name` (`file_name`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
        } catch (Exception $e) {}

        // Buat file .htaccess di dalam direktori upload untuk keamanan (nonaktifkan eksekusi skrip)
        $htaccessPath = $uploadDir . '/.htaccess';
        $htaccessContent = "# Nonaktifkan eksekusi PHP di folder upload namun izinkan pembacaan gambar publik\n" .
            "<IfModule mod_authz_core.c>\n" .
            "    Require all granted\n" .
            "    <FilesMatch \"\\.(php|phtml|php3|php4|php5|php7|phps|cgi|pl|sh)$\">\n" .
            "        Require all denied\n" .
            "    </FilesMatch>\n" .
            "</IfModule>\n" .
            "<IfModule !mod_authz_core.c>\n" .
            "    Order Allow,Deny\n" .
            "    Allow from all\n" .
            "    <FilesMatch \"\\.(php|phtml|php3|php4|php5|php7|phps|cgi|pl|sh)$\">\n" .
            "        Order Deny,Allow\n" .
            "        Deny from all\n" .
            "    </FilesMatch>\n" .
            "</IfModule>\n";
        @file_put_contents($htaccessPath, $htaccessContent);

        $category = preg_replace('/[^a-zA-Z0-9_-]/', '', $_POST['category'] ?? $input['category'] ?? 'spmb');
        $fileName = '';
        $fileBytes = null;
        $mime = 'image/jpeg';

        // Kasus A: Upload via Multipart Form Data ($_FILES)
        if (!empty($_FILES['file']['tmp_name']) && is_uploaded_file($_FILES['file']['tmp_name'])) {
            if ($_FILES['file']['size'] > 8 * 1024 * 1024) {
                http_response_code(400);
                echo json_encode(["status" => "error", "message" => "Ukuran file maksimal 8MB"]);
                break;
            }

            $origName = $_FILES['file']['name'];
            $ext = strtolower(pathinfo($origName, PATHINFO_EXTENSION));
            $allowedExts = ['jpg', 'jpeg', 'png', 'webp', 'pdf'];
            if (!in_array($ext, $allowedExts)) {
                $ext = 'jpg';
            }

            $mimes = [
                'jpg' => 'image/jpeg',
                'jpeg' => 'image/jpeg',
                'png' => 'image/png',
                'webp' => 'image/webp',
                'pdf' => 'application/pdf',
            ];
            $mime = $mimes[$ext] ?? 'image/jpeg';

            $fileBytes = @file_get_contents($_FILES['file']['tmp_name']);
            if ($fileBytes === false || strlen($fileBytes) === 0) {
                http_response_code(400);
                echo json_encode(["status" => "error", "message" => "File upload kosong atau tidak terbaca"]);
                break;
            }

            $fileName = $category . '_' . date('Ymd_His') . '_' . bin2hex(random_bytes(4)) . '.' . $ext;
            $savedPath = $uploadDir . '/' . $fileName;

            // Simpan ke disk server
            @file_put_contents($savedPath, $fileBytes);
        }
        // Kasus B: Upload via Base64 JSON Payload (fallback)
        else if (!empty($input['file']) && is_string($input['file'])) {
            $base64Data = $input['file'];
            if (preg_match('/^data:([^;]+);base64,(.*)$/', $base64Data, $matches)) {
                $mime = $matches[1];
                $decoded = base64_decode($matches[2]);
                if ($decoded === false || strlen($decoded) === 0) {
                    http_response_code(400);
                    echo json_encode(["status" => "error", "message" => "Gagal mendekode gambar base64"]);
                    break;
                }
                $ext = 'jpg';
                if (strpos($mime, 'png') !== false) $ext = 'png';
                else if (strpos($mime, 'webp') !== false) $ext = 'webp';
                else if (strpos($mime, 'pdf') !== false) $ext = 'pdf';

                $fileBytes = $decoded;
                $fileName = $category . '_' . date('Ymd_His') . '_' . bin2hex(random_bytes(4)) . '.' . $ext;
                $savedPath = $uploadDir . '/' . $fileName;
                @file_put_contents($savedPath, $fileBytes);
            } else {
                http_response_code(400);
                echo json_encode(["status" => "error", "message" => "Format file data base64 tidak valid"]);
                break;
            }
        } else {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Tidak ada file yang diunggah"]);
            break;
        }

        // DUAL STORAGE: Backup juga ke database MySQL (tabel registration_files)
        if ($fileBytes !== null && strlen($fileBytes) > 0) {
            try {
                $stmtFile = $pdo->prepare("INSERT INTO `registration_files` (`file_name`, `category`, `mime_type`, `file_size`, `file_data`, `created_at`) VALUES (?, ?, ?, ?, ?, NOW()) ON DUPLICATE KEY UPDATE `file_data` = VALUES(`file_data`), `file_size` = VALUES(`file_size`), `mime_type` = VALUES(`mime_type`)");
                $stmtFile->execute([$fileName, $category, $mime, strlen($fileBytes), $fileBytes]);
            } catch (Exception $e) {
                error_log("[Dual Storage BLOB error] " . $e->getMessage());
            }
        }

        // Tentukan URL publik
        $isHttps = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') || (isset($_SERVER['SERVER_PORT']) && $_SERVER['SERVER_PORT'] == 443) || (isset($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https');
        $protocol = $isHttps ? "https://" : "http://";
        $host = $_SERVER['HTTP_HOST'] ?? 'sdit.andalascendekia.sch.id';
        $scriptDir = rtrim(dirname($_SERVER['SCRIPT_NAME']), '/\\');
        $relativeUrl = $scriptDir . '/uploads/spmb/' . $fileName;
        $fullUrl = $protocol . $host . $relativeUrl;
        $viewUrl = "/api/index.php?action=view_file&name=" . urlencode($fileName);

        echo json_encode([
            "status" => "success",
            "message" => "File berhasil diunggah",
            "fileName" => $fileName,
            "url" => $viewUrl,
            "viewUrl" => $viewUrl,
            "relativeUrl" => $relativeUrl,
            "fullUrl" => $fullUrl
        ]);
        break;

    case 'view_file':
        // ==============================================================================
        // STREAM GAMBAR SPMB VIA PHP (FAIL-SAFE: DISK + MYSQL BLOB RESTORATION)
        // ==============================================================================
        $fileName = basename($_GET['file'] ?? $_GET['name'] ?? '');
        if (empty($fileName) || preg_match('/[^a-zA-Z0-9_.-]/', $fileName)) {
            http_response_code(400);
            header('Content-Type: text/plain');
            echo "Nama file tidak valid";
            exit();
        }

        $filePath = __DIR__ . '/uploads/spmb/' . $fileName;
        if (!file_exists($filePath)) {
            $filePath = dirname(__DIR__) . '/uploads/spmb/' . $fileName;
        }

        $ext = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));
        $mimes = [
            'jpg' => 'image/jpeg',
            'jpeg' => 'image/jpeg',
            'png' => 'image/png',
            'webp' => 'image/webp',
            'gif' => 'image/gif',
            'pdf' => 'application/pdf',
        ];
        $mime = $mimes[$ext] ?? 'image/jpeg';

        // 1. Jika ada di disk, stream langsung dari disk (cepat & hemat memori)
        if (file_exists($filePath)) {
            header('Content-Type: ' . $mime);
            header('Content-Length: ' . filesize($filePath));
            header('Cache-Control: public, max-age=604800'); // 7 hari
            header('X-Content-Type-Options: nosniff');
            readfile($filePath);
            exit();
        }

        // 2. Jika tidak ada di disk, ambil dari backup database MySQL (tabel registration_files)
        try {
            $stmtFile = $pdo->prepare("SELECT `file_data`, `mime_type` FROM `registration_files` WHERE `file_name` = ? LIMIT 1");
            $stmtFile->execute([$fileName]);
            $blobRow = $stmtFile->fetch();
            if ($blobRow && !empty($blobRow['file_data'])) {
                $blobData = $blobRow['file_data'];
                $blobMime = $blobRow['mime_type'] ?: $mime;

                // Pulihkan file ke disk untuk kecepatan akses berikutnya
                @file_put_contents($filePath, $blobData);

                header('Content-Type: ' . $blobMime);
                header('Content-Length: ' . strlen($blobData));
                header('Cache-Control: public, max-age=604800');
                header('X-Content-Type-Options: nosniff');
                echo $blobData;
                exit();
            }
        } catch (Exception $e) {}

        // 3. Fallback: Cari di tabel registrations (jika foto disimpan langsung sebagai base64)
        try {
            $stmtReg = $pdo->prepare("SELECT `foto_url`, `payment_proof_url` FROM `registrations` WHERE `foto_url` LIKE ? OR `payment_proof_url` LIKE ? LIMIT 1");
            $likePattern = '%' . $fileName . '%';
            $stmtReg->execute([$likePattern, $likePattern]);
            $regMatch = $stmtReg->fetch();
            if ($regMatch) {
                $rawTarget = (strpos($regMatch['foto_url'] ?? '', $fileName) !== false) ? $regMatch['foto_url'] : $regMatch['payment_proof_url'];
                if ($rawTarget && preg_match('/^data:([^;]+);base64,(.*)$/', $rawTarget, $m)) {
                    $decoded = base64_decode($m[2]);
                    if ($decoded && strlen($decoded) > 0) {
                        @file_put_contents($filePath, $decoded);
                        header('Content-Type: ' . $m[1]);
                        header('Content-Length: ' . strlen($decoded));
                        header('Cache-Control: public, max-age=604800');
                        header('X-Content-Type-Options: nosniff');
                        echo $decoded;
                        exit();
                    }
                }
            }
        } catch (Exception $e) {}

        // 4. Jika benar-benar tidak ditemukan, kembalikan SVG Avatar yang rapi daripada broken icon browser
        http_response_code(404);
        header('Content-Type: image/svg+xml');
        header('Cache-Control: no-cache, no-store, must-revalidate');
        echo '<svg xmlns="http://www.w3.org/2000/svg" width="160" height="200" viewBox="0 0 160 200"><rect width="160" height="200" fill="#f8fafc" rx="12"/><circle cx="80" cy="75" r="30" fill="#cbd5e1"/><path d="M35 155c0-25 20-45 45-45s45 20 45 45" fill="#cbd5e1"/><text x="80" y="180" font-family="sans-serif" font-size="11" font-weight="bold" fill="#94a3b8" text-anchor="middle">Foto Tidak Tersedia</text></svg>';
        exit();

    case 'get_registrations':
        try {
            $pdo->query("SELECT `client_id` FROM `registrations` LIMIT 1");
        } catch (Exception $e) {
            try {
                $pdo->exec("ALTER TABLE `registrations` ADD COLUMN `client_id` VARCHAR(100) DEFAULT NULL AFTER `user_id`");
            } catch (Exception $e2) {}
        }

        // Pastikan kolom foto_url dan payment_proof_url selalu LONGTEXT di database hosting
        try {
            $pdo->exec("ALTER TABLE `registrations` MODIFY COLUMN `foto_url` LONGTEXT DEFAULT NULL");
            $pdo->exec("ALTER TABLE `registrations` MODIFY COLUMN `payment_proof_url` LONGTEXT DEFAULT NULL");
        } catch (Exception $e) {}

        $stmt = $pdo->query("SELECT r.*, COALESCE(u.name, r.student_name, 'Siswa') as user_name, COALESCE(u.email, '-') as user_email 
                            FROM `registrations` r 
                            LEFT JOIN `users` u ON r.user_id = u.id 
                            ORDER BY r.id DESC");
        $rows = $stmt->fetchAll();
        echo json_encode(["status" => "success", "data" => $rows]);
        break;

    case 'save_registration':
        $r = $input;
        $userId = $r['userId'] ?? $r['user_id'] ?? 0;
        $regId = $r['id'] ?? 0;
        $clientId = trim((string)($r['clientId'] ?? $r['client_id'] ?? ''));
        $isNewChild = !empty($r['isNewChild']);
        $studentName = trim($r['studentName'] ?? $r['student_name'] ?? '');
        $docDriveUrl = trim($r['documentDriveUrl'] ?? $r['document_drive_url'] ?? '');
        $fotoUrl = trim($r['fotoUrl'] ?? $r['foto_url'] ?? '');
        $spmbStage = trim($r['spmbStage'] ?? $r['spmb_stage'] ?? 'PENDAFTARAN');
        $stifinResult = trim($r['stifinResult'] ?? $r['stifin_result'] ?? '');
        $childNotes = trim($r['interviewChildNotes'] ?? $r['interview_child_notes'] ?? '');
        $parentNotes = trim($r['interviewParentNotes'] ?? $r['interview_parent_notes'] ?? '');
        $graduationStatus = trim($r['graduationStatus'] ?? $r['graduation_status'] ?? 'PENDING');
        $stageNote = trim($r['stageNote'] ?? $r['stage_note'] ?? '');
        $rejectionReason = trim($r['rejectionReason'] ?? $r['rejection_reason'] ?? '');

        // Auto ensure all registrations columns exist
        $regCols = [
            'client_id' => "VARCHAR(100) DEFAULT NULL",
            'student_name' => "VARCHAR(255) DEFAULT NULL",
            'document_drive_url' => "VARCHAR(500) DEFAULT NULL",
            'foto_url' => "LONGTEXT DEFAULT NULL",
            'rejection_reason' => "TEXT DEFAULT NULL",
            'spmb_stage' => "VARCHAR(50) DEFAULT 'PENDAFTARAN'",
            'stifin_result' => "VARCHAR(255) DEFAULT NULL",
            'interview_child_notes' => "TEXT DEFAULT NULL",
            'interview_parent_notes' => "TEXT DEFAULT NULL",
            'graduation_status' => "VARCHAR(50) DEFAULT 'PENDING'",
            'stage_note' => "TEXT DEFAULT NULL",
            'program_type' => "VARCHAR(50) DEFAULT 'BOARDING'",
            'info_source' => "VARCHAR(255) DEFAULT NULL",
            'reason_to_join' => "TEXT DEFAULT NULL",
            'test_score' => "DECIMAL(5,2) DEFAULT NULL",
            'interview_notes' => "TEXT DEFAULT NULL",
            're_registration_proof_url' => "VARCHAR(500) DEFAULT NULL",
            'uniform_size' => "VARCHAR(10) DEFAULT NULL",
            'akta_url' => "VARCHAR(500) DEFAULT NULL",
            'kk_url' => "VARCHAR(500) DEFAULT NULL",
            'rapor_url' => "VARCHAR(500) DEFAULT NULL",
        ];
        foreach ($regCols as $col => $colDef) {
            try {
                $pdo->query("SELECT `{$col}` FROM `registrations` LIMIT 1");
            } catch (Exception $e) {
                try {
                    $pdo->exec("ALTER TABLE `registrations` ADD COLUMN `{$col}` {$colDef}");
                } catch (Exception $e2) {}
            }
        }

        // Pastikan id mendukung angka besar dan kolom foto/bukti mendukung LONGTEXT
        try {
            $pdo->exec("ALTER TABLE `registrations` MODIFY COLUMN `id` BIGINT(20) NOT NULL AUTO_INCREMENT");
            $pdo->exec("ALTER TABLE `registrations` MODIFY COLUMN `foto_url` LONGTEXT DEFAULT NULL");
            $pdo->exec("ALTER TABLE `registrations` MODIFY COLUMN `payment_proof_url` LONGTEXT DEFAULT NULL");
        } catch (Exception $e) {}

        $existing = null;

        // Jika ini adalah penambahan anak baru (isNewChild), jangan pernah timpa record anak lain!
        if (!$isNewChild) {
            // 1. Cari berdasarkan ID numerik database yang valid
            if ($regId > 0 && $regId < 2000000000) {
                $stmt = $pdo->prepare("SELECT id FROM `registrations` WHERE `id` = ? LIMIT 1");
                $stmt->execute([$regId]);
                $existing = $stmt->fetch();
            }

            // 2. Cari berdasarkan client_id (timestamp ID dari frontend)
            if (!$existing && $clientId !== '' && $clientId !== '0') {
                $stmt = $pdo->prepare("SELECT id FROM `registrations` WHERE `client_id` = ? LIMIT 1");
                $stmt->execute([$clientId]);
                $existing = $stmt->fetch();
            }

            // 3. Jika belum ditemukan dan ada userId
            if (!$existing && $userId > 0) {
                // Cek apakah ada record anak ini berdasarkan nama anak
                if ($studentName !== '') {
                    $stmt = $pdo->prepare("SELECT id FROM `registrations` WHERE `user_id` = ? AND `student_name` = ? LIMIT 1");
                    $stmt->execute([$userId, $studentName]);
                    $existing = $stmt->fetch();
                }

                // Cek draft awal yang belum diisi namanya HANYA jika pendaftar belum punya record lain
                if (!$existing) {
                    $stmtCount = $pdo->prepare("SELECT COUNT(*) FROM `registrations` WHERE `user_id` = ?");
                    $stmtCount->execute([$userId]);
                    $totalUserRegs = (int)$stmtCount->fetchColumn();

                    if ($totalUserRegs <= 1) {
                        $stmt = $pdo->prepare("SELECT id FROM `registrations` WHERE `user_id` = ? AND (`student_name` IS NULL OR `student_name` = '') ORDER BY id ASC LIMIT 1");
                        $stmt->execute([$userId]);
                        $existing = $stmt->fetch();
                    }
                }
            }
        }

        if ($existing) {
            $stmt = $pdo->prepare("UPDATE `registrations` SET 
                `client_id` = COALESCE(NULLIF(?, ''), `client_id`),
                `student_name` = COALESCE(NULLIF(?, ''), `student_name`), 
                `nisn` = COALESCE(NULLIF(?, ''), `nisn`), 
                `nik` = COALESCE(NULLIF(?, ''), `nik`), 
                `birth_place` = COALESCE(NULLIF(?, ''), `birth_place`), 
                `birth_date` = COALESCE(?, `birth_date`), 
                `gender` = COALESCE(NULLIF(?, ''), `gender`), 
                `address` = COALESCE(NULLIF(?, ''), `address`), 
                `father_name` = COALESCE(NULLIF(?, ''), `father_name`), 
                `mother_name` = COALESCE(NULLIF(?, ''), `mother_name`), 
                `parent_phone` = COALESCE(NULLIF(?, ''), `parent_phone`), 
                `previous_school` = COALESCE(NULLIF(?, ''), `previous_school`), 
                `status` = COALESCE(NULLIF(?, ''), `status`), 
                `payment_status` = COALESCE(NULLIF(?, ''), `payment_status`), 
                `payment_proof_url` = COALESCE(NULLIF(?, ''), `payment_proof_url`),
                `program_type` = COALESCE(NULLIF(?, ''), `program_type`), 
                `info_source` = COALESCE(NULLIF(?, ''), `info_source`), 
                `reason_to_join` = COALESCE(NULLIF(?, ''), `reason_to_join`), 
                `document_drive_url` = COALESCE(NULLIF(?, ''), `document_drive_url`),
                `foto_url` = COALESCE(NULLIF(?, ''), `foto_url`), 
                `rejection_reason` = COALESCE(NULLIF(?, ''), `rejection_reason`),
                `spmb_stage` = COALESCE(NULLIF(?, ''), `spmb_stage`), 
                `stifin_result` = COALESCE(NULLIF(?, ''), `stifin_result`), 
                `interview_child_notes` = COALESCE(NULLIF(?, ''), `interview_child_notes`), 
                `interview_parent_notes` = COALESCE(NULLIF(?, ''), `interview_parent_notes`),
                `graduation_status` = COALESCE(NULLIF(?, ''), `graduation_status`), 
                `stage_note` = COALESCE(NULLIF(?, ''), `stage_note`),
                `test_score` = COALESCE(?, `test_score`), 
                `interview_notes` = COALESCE(NULLIF(?, ''), `interview_notes`), 
                `re_registration_proof_url` = COALESCE(NULLIF(?, ''), `re_registration_proof_url`), 
                `uniform_size` = COALESCE(NULLIF(?, ''), `uniform_size`),
                `akta_url` = COALESCE(NULLIF(?, ''), `akta_url`), 
                `kk_url` = COALESCE(NULLIF(?, ''), `kk_url`), 
                `rapor_url` = COALESCE(NULLIF(?, ''), `rapor_url`)
                WHERE `id` = ?");
            $stmt->execute([
                $clientId ?: null,
                $studentName ?: null,
                $r['nisn'] ?? null,
                $r['nik'] ?? null,
                $r['birthPlace'] ?? $r['birth_place'] ?? null,
                $r['birthDate'] ?? $r['birth_date'] ?? null,
                $r['gender'] ?? null,
                $r['address'] ?? null,
                $r['fatherName'] ?? $r['father_name'] ?? null,
                $r['motherName'] ?? $r['mother_name'] ?? null,
                $r['parentPhone'] ?? $r['parent_phone'] ?? null,
                $r['previousSchool'] ?? $r['previous_school'] ?? null,
                $r['status'] ?? null,
                $r['paymentStatus'] ?? $r['payment_status'] ?? null,
                $r['paymentProofUrl'] ?? $r['payment_proof_url'] ?? null,
                $r['programType'] ?? $r['program_type'] ?? null,
                $r['infoSource'] ?? $r['info_source'] ?? null,
                $r['reasonToJoin'] ?? $r['reason_to_join'] ?? null,
                $docDriveUrl ?: null,
                $fotoUrl ?: null,
                $rejectionReason ?: null,
                $spmbStage ?: null,
                $stifinResult ?: null,
                $childNotes ?: null,
                $parentNotes ?: null,
                $graduationStatus ?: null,
                $stageNote ?: null,
                $r['testScore'] ?? $r['test_score'] ?? null,
                $r['interviewNotes'] ?? $r['interview_notes'] ?? null,
                $r['reRegistrationProofUrl'] ?? $r['re_registration_proof_url'] ?? null,
                $r['uniformSize'] ?? $r['uniform_size'] ?? null,
                $r['aktaUrl'] ?? $r['akta_url'] ?? null,
                $r['kkUrl'] ?? $r['kk_url'] ?? null,
                $r['raporUrl'] ?? $r['rapor_url'] ?? null,
                $existing['id']
            ]);
            $savedId = (int)$existing['id'];
        } else {
            $stmt = $pdo->prepare("INSERT INTO `registrations` 
                (`user_id`, `client_id`, `student_name`, `nisn`, `nik`, `birth_place`, `birth_date`, `gender`, `address`, `father_name`, `mother_name`, `parent_phone`, `previous_school`, `status`, `payment_status`, `payment_proof_url`, `program_type`, `info_source`, `reason_to_join`, `document_drive_url`, `foto_url`, `rejection_reason`, `spmb_stage`, `stifin_result`, `interview_child_notes`, `interview_parent_notes`, `graduation_status`, `stage_note`, `test_score`, `interview_notes`, `re_registration_proof_url`, `uniform_size`, `akta_url`, `kk_url`, `rapor_url`, `created_at`) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())");
            $stmt->execute([
                $userId,
                $clientId ?: ($regId ? (string)$regId : null),
                $studentName ?: null,
                $r['nisn'] ?? '', $r['nik'] ?? '', $r['birthPlace'] ?? $r['birth_place'] ?? '', $r['birthDate'] ?? $r['birth_date'] ?? null, $r['gender'] ?? 'L',
                $r['address'] ?? '', $r['fatherName'] ?? $r['father_name'] ?? '', $r['motherName'] ?? $r['mother_name'] ?? '', $r['parentPhone'] ?? $r['parent_phone'] ?? '',
                $r['previousSchool'] ?? $r['previous_school'] ?? '', $r['status'] ?? 'DRAFT', $r['paymentStatus'] ?? $r['payment_status'] ?? 'UNPAID', $r['paymentProofUrl'] ?? $r['payment_proof_url'] ?? '',
                $r['programType'] ?? $r['program_type'] ?? 'BOARDING', $r['infoSource'] ?? $r['info_source'] ?? '', $r['reasonToJoin'] ?? $r['reason_to_join'] ?? '',
                $docDriveUrl ?: null,
                $fotoUrl ?: null,
                $rejectionReason ?: null,
                $spmbStage ?: 'PENDAFTARAN',
                $stifinResult ?: null,
                $childNotes ?: null,
                $parentNotes ?: null,
                $graduationStatus ?: 'PENDING',
                $stageNote ?: null,
                $r['testScore'] ?? $r['test_score'] ?? null,
                $r['interviewNotes'] ?? $r['interview_notes'] ?? null,
                $r['reRegistrationProofUrl'] ?? $r['re_registration_proof_url'] ?? null,
                $r['uniformSize'] ?? $r['uniform_size'] ?? null,
                $r['aktaUrl'] ?? $r['akta_url'] ?? null,
                $r['kkUrl'] ?? $r['kk_url'] ?? null,
                $r['raporUrl'] ?? $r['rapor_url'] ?? null
            ]);
            $savedId = (int)$pdo->lastInsertId();
        }
        echo json_encode(["status" => "success", "id" => $savedId, "client_id" => $clientId, "message" => "Pendaftaran berhasil disimpan ke MySQL"]);
        break;

    case 'delete_registration':
        $delId = (int)($input['id'] ?? $_GET['id'] ?? 0);
        if ($delId > 0) {
            $stmt = $pdo->prepare("DELETE FROM `registrations` WHERE `id` = ?");
            $stmt->execute([$delId]);
            echo json_encode(["status" => "success", "message" => "Pendaftaran berhasil dihapus"]);
        } else {
            echo json_encode(["status" => "error", "message" => "ID pendaftaran tidak valid"]);
        }
        break;

    case 'get_teachers':
        try {
            $pdo->exec("ALTER TABLE `teachers` MODIFY COLUMN `id` BIGINT(20) NOT NULL AUTO_INCREMENT");
        } catch (Exception $e) {}
        $stmt = $pdo->query("SELECT * FROM `teachers` ORDER BY `id` ASC");
        echo json_encode(["status" => "success", "data" => $stmt->fetchAll()]);
        break;

    case 'save_teachers':
        if (is_array($input)) {
            try {
                $pdo->exec("ALTER TABLE `teachers` MODIFY COLUMN `id` BIGINT(20) NOT NULL AUTO_INCREMENT");
            } catch (Exception $e) {}

            $pdo->exec("DELETE FROM `teachers`");
            $stmt = $pdo->prepare("INSERT INTO `teachers` (`id`, `name`, `role`, `mapel`, `strata`, `photo_url`) VALUES (?, ?, ?, ?, ?, ?)");
            $usedIds = [];
            $baseTime = (int)(microtime(true) * 1000);
            $idx = 0;

            foreach ($input as $t) {
                $idx++;
                $itemRawId = isset($t['id']) ? (int)$t['id'] : 0;
                if ($itemRawId <= 0 || $itemRawId == 2147483647 || in_array($itemRawId, $usedIds)) {
                    $itemRawId = $baseTime + $idx;
                }
                $usedIds[] = $itemRawId;

                try {
                    $stmt->execute([
                        $itemRawId,
                        $t['name'] ?? '',
                        $t['role'] ?? '',
                        $t['mapel'] ?? '',
                        $t['strata'] ?? 'S1',
                        $t['photoUrl'] ?? $t['photo_url'] ?? '',
                    ]);
                } catch (Exception $e) {
                    error_log("Failed to insert teacher: " . $e->getMessage());
                }
            }
        }
        echo json_encode(["status" => "success", "message" => "Data guru berhasil disimpan"]);
        break;

    case 'get_curriculum':
        try {
            $pdo->exec("ALTER TABLE `curriculum` MODIFY COLUMN `id` BIGINT(20) NOT NULL AUTO_INCREMENT");
        } catch (Exception $e) {}
        $stmt = $pdo->query("SELECT * FROM `curriculum` ORDER BY `id` ASC");
        echo json_encode(["status" => "success", "data" => $stmt->fetchAll()]);
        break;

    case 'save_curriculum':
        if (is_array($input)) {
            try {
                $pdo->exec("ALTER TABLE `curriculum` MODIFY COLUMN `id` BIGINT(20) NOT NULL AUTO_INCREMENT");
            } catch (Exception $e) {}

            $pdo->exec("DELETE FROM `curriculum`");
            $stmt = $pdo->prepare("INSERT INTO `curriculum` (`id`, `title`, `type`, `target`, `description`, `badge_color`) VALUES (?, ?, ?, ?, ?, ?)");
            $usedIds = [];
            $baseTime = (int)(microtime(true) * 1000);
            $idx = 0;

            foreach ($input as $c) {
                $idx++;
                $itemRawId = isset($c['id']) ? (int)$c['id'] : 0;
                if ($itemRawId <= 0 || $itemRawId == 2147483647 || in_array($itemRawId, $usedIds)) {
                    $itemRawId = $baseTime + $idx;
                }
                $usedIds[] = $itemRawId;

                try {
                    $stmt->execute([
                        $itemRawId,
                        $c['title'] ?? '',
                        $c['type'] ?? 'Program Kurikulum',
                        $c['target'] ?? '',
                        $c['description'] ?? '',
                        $c['badgeColor'] ?? $c['badge_color'] ?? 'bg-emerald-600',
                    ]);
                } catch (Exception $e) {
                    error_log("Failed to insert curriculum: " . $e->getMessage());
                }
            }
        }
        echo json_encode(["status" => "success", "message" => "Data kurikulum berhasil disimpan"]);
        break;

    case 'get_activities':
        try {
            $pdo->exec("ALTER TABLE `activities` MODIFY COLUMN `id` BIGINT(20) NOT NULL AUTO_INCREMENT");
        } catch (Exception $e) {}
        $stmt = $pdo->query("SELECT * FROM `activities` ORDER BY `id` ASC");
        echo json_encode(["status" => "success", "data" => $stmt->fetchAll()]);
        break;

    case 'save_activities':
        if (is_array($input)) {
            try {
                $pdo->exec("ALTER TABLE `activities` MODIFY COLUMN `id` BIGINT(20) NOT NULL AUTO_INCREMENT");
            } catch (Exception $e) {}

            $pdo->exec("DELETE FROM `activities`");
            $stmt = $pdo->prepare("INSERT INTO `activities` (`id`, `title`, `type`, `category`, `date`, `student_name`, `achievement_badge`, `description`, `image_url`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
            $usedIds = [];
            $baseTime = (int)(microtime(true) * 1000);
            $idx = 0;

            foreach ($input as $a) {
                $idx++;
                $itemRawId = isset($a['id']) ? (int)$a['id'] : 0;
                if ($itemRawId <= 0 || $itemRawId == 2147483647 || in_array($itemRawId, $usedIds)) {
                    $itemRawId = $baseTime + $idx;
                }
                $usedIds[] = $itemRawId;

                try {
                    $stmt->execute([
                        $itemRawId,
                        $a['title'] ?? '',
                        $a['type'] ?? 'Prestasi',
                        $a['category'] ?? '',
                        $a['date'] ?? '',
                        $a['studentName'] ?? $a['student_name'] ?? '',
                        $a['achievementBadge'] ?? $a['achievement_badge'] ?? '',
                        $a['description'] ?? '',
                        $a['imageUrl'] ?? $a['image_url'] ?? '',
                    ]);
                } catch (Exception $e) {
                    error_log("Failed to insert activity: " . $e->getMessage());
                }
            }
        }
        echo json_encode(["status" => "success", "message" => "Data aktivitas/prestasi berhasil disimpan"]);
        break;

    case 'get_facilities':
        try {
            $pdo->exec("ALTER TABLE `facilities` MODIFY COLUMN `id` BIGINT(20) NOT NULL AUTO_INCREMENT");
        } catch (Exception $e) {}
        $stmt = $pdo->query("SELECT * FROM `facilities` ORDER BY `id` ASC");
        echo json_encode(["status" => "success", "data" => $stmt->fetchAll()]);
        break;

    case 'save_facilities':
        if (is_array($input)) {
            try {
                $pdo->exec("ALTER TABLE `facilities` MODIFY COLUMN `id` BIGINT(20) NOT NULL AUTO_INCREMENT");
            } catch (Exception $e) {}

            $pdo->exec("DELETE FROM `facilities`");
            $stmt = $pdo->prepare("INSERT INTO `facilities` (`id`, `title`, `category`, `description`, `image_url`) VALUES (?, ?, ?, ?, ?)");
            $usedIds = [];
            $baseTime = (int)(microtime(true) * 1000);
            $idx = 0;

            foreach ($input as $f) {
                $idx++;
                $itemRawId = isset($f['id']) ? (int)$f['id'] : 0;
                if ($itemRawId <= 0 || $itemRawId == 2147483647 || in_array($itemRawId, $usedIds)) {
                    $itemRawId = $baseTime + $idx;
                }
                $usedIds[] = $itemRawId;

                try {
                    $stmt->execute([
                        $itemRawId,
                        $f['title'] ?? '',
                        $f['category'] ?? 'Akademik',
                        $f['description'] ?? '',
                        $f['imageUrl'] ?? $f['image_url'] ?? '',
                    ]);
                } catch (Exception $e) {
                    error_log("Failed to insert facility: " . $e->getMessage());
                }
            }
        }
        echo json_encode(["status" => "success", "message" => "Data fasilitas berhasil disimpan"]);
        break;

    case 'get_testimonials':
        try {
            $pdo->exec("ALTER TABLE `testimonials` MODIFY COLUMN `id` BIGINT(20) NOT NULL AUTO_INCREMENT");
        } catch (Exception $e) {}
        $stmt = $pdo->query("SELECT * FROM `testimonials` ORDER BY `id` DESC");
        echo json_encode(["status" => "success", "data" => $stmt->fetchAll()]);
        break;

    case 'save_testimonials':
        if (is_array($input)) {
            try {
                $pdo->exec("ALTER TABLE `testimonials` MODIFY COLUMN `id` BIGINT(20) NOT NULL AUTO_INCREMENT");
            } catch (Exception $e) {}

            $pdo->exec("DELETE FROM `testimonials`");
            $stmt = $pdo->prepare("INSERT INTO `testimonials` (`id`, `name`, `role`, `rating`, `quote`, `avatar_url`, `time_ago`) VALUES (?, ?, ?, ?, ?, ?, ?)");
            $usedIds = [];
            $baseTime = (int)(microtime(true) * 1000);
            $idx = 0;

            foreach ($input as $tm) {
                $idx++;
                $itemRawId = isset($tm['id']) ? (int)$tm['id'] : 0;
                if ($itemRawId <= 0 || $itemRawId == 2147483647 || in_array($itemRawId, $usedIds)) {
                    $itemRawId = $baseTime + $idx;
                }
                $usedIds[] = $itemRawId;

                try {
                    $stmt->execute([
                        $itemRawId,
                        $tm['name'] ?? '',
                        $tm['role'] ?? '',
                        $tm['rating'] ?? 5,
                        $tm['quote'] ?? '',
                        $tm['avatarUrl'] ?? $tm['avatar_url'] ?? '',
                        $tm['timeAgo'] ?? $tm['time_ago'] ?? 'Baru saja',
                    ]);
                } catch (Exception $e) {
                    error_log("Failed to insert testimonial: " . $e->getMessage());
                }
            }
        }
        echo json_encode(["status" => "success", "message" => "Data testimoni berhasil disimpan"]);
        break;

    case 'get_slides':
        try {
            $pdo->exec("ALTER TABLE `hero_slides` MODIFY COLUMN `id` BIGINT(20) NOT NULL AUTO_INCREMENT");
        } catch (Exception $e) {}
        $stmt = $pdo->query("SELECT * FROM `hero_slides` ORDER BY `id` ASC");
        echo json_encode(["status" => "success", "data" => $stmt->fetchAll()]);
        break;

    case 'save_slides':
        if (is_array($input)) {
            try {
                $pdo->exec("ALTER TABLE `hero_slides` MODIFY COLUMN `id` BIGINT(20) NOT NULL AUTO_INCREMENT");
            } catch (Exception $e) {}

            $pdo->exec("DELETE FROM `hero_slides`");
            $stmt = $pdo->prepare("INSERT INTO `hero_slides` (`id`, `badge`, `title`, `description`, `image_url`, `primary_cta_text`, `primary_cta_link`, `secondary_cta_text`, `secondary_cta_link`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
            $usedIds = [];
            $baseTime = (int)(microtime(true) * 1000);
            $idx = 0;

            foreach ($input as $s) {
                $idx++;
                $itemRawId = isset($s['id']) ? (int)$s['id'] : 0;
                if ($itemRawId <= 0 || $itemRawId == 2147483647 || in_array($itemRawId, $usedIds)) {
                    $itemRawId = $baseTime + $idx;
                }
                $usedIds[] = $itemRawId;

                try {
                    $stmt->execute([
                        $itemRawId,
                        $s['badge'] ?? '',
                        $s['title'] ?? '',
                        $s['description'] ?? '',
                        $s['imageUrl'] ?? $s['image_url'] ?? '',
                        $s['primaryCtaText'] ?? $s['primary_cta_text'] ?? null,
                        $s['primaryCtaLink'] ?? $s['primary_cta_link'] ?? null,
                        $s['secondaryCtaText'] ?? $s['secondary_cta_text'] ?? null,
                        $s['secondaryCtaLink'] ?? $s['secondary_cta_link'] ?? null,
                    ]);
                } catch (Exception $e) {
                    error_log("Failed to insert slide: " . $e->getMessage());
                }
            }
        }
        echo json_encode(["status" => "success", "message" => "Data banner slide berhasil disimpan"]);
        break;

    case 'get_news':
        try {
            $pdo->exec("ALTER TABLE `news` MODIFY COLUMN `id` BIGINT(20) NOT NULL AUTO_INCREMENT");
        } catch (Exception $e) {}
        $stmt = $pdo->query("SELECT * FROM `news` ORDER BY `id` DESC");
        echo json_encode(["status" => "success", "data" => $stmt->fetchAll()]);
        break;

    case 'save_news':
        if (is_array($input)) {
            try {
                $pdo->exec("ALTER TABLE `news` MODIFY COLUMN `id` BIGINT(20) NOT NULL AUTO_INCREMENT");
            } catch (Exception $e) {}

            $pdo->exec("DELETE FROM `news`");
            $stmt = $pdo->prepare("INSERT INTO `news` (`id`, `title`, `category`, `date`, `author`, `comments_count`, `image_url`, `excerpt`, `content`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
            $usedIds = [];
            $baseTime = (int)(microtime(true) * 1000);
            $idx = 0;

            foreach ($input as $n) {
                $idx++;
                $itemRawId = isset($n['id']) ? (int)$n['id'] : 0;
                if ($itemRawId <= 0 || $itemRawId == 2147483647 || in_array($itemRawId, $usedIds)) {
                    $itemRawId = $baseTime + $idx;
                }
                $usedIds[] = $itemRawId;

                try {
                    $stmt->execute([
                        $itemRawId,
                        $n['title'] ?? '',
                        $n['category'] ?? 'Berita Terkini',
                        $n['date'] ?? date('d/m/Y'),
                        $n['author'] ?? 'Admin',
                        $n['commentsCount'] ?? $n['comments_count'] ?? 0,
                        $n['imageUrl'] ?? $n['image_url'] ?? '',
                        $n['excerpt'] ?? '',
                        $n['content'] ?? '',
                    ]);
                } catch (Exception $e) {
                    error_log("Failed to insert news: " . $e->getMessage());
                }
            }
        }
        echo json_encode(["status" => "success", "message" => "Data berita berhasil disimpan"]);
        break;

    case 'get_events':
        try {
            $pdo->exec("ALTER TABLE `events` MODIFY COLUMN `id` BIGINT(20) NOT NULL AUTO_INCREMENT");
        } catch (Exception $e) {}
        $stmt = $pdo->query("SELECT * FROM `events` ORDER BY `id` DESC");
        echo json_encode(["status" => "success", "data" => $stmt->fetchAll()]);
        break;

    case 'save_events':
        if (is_array($input)) {
            try {
                $pdo->exec("ALTER TABLE `events` MODIFY COLUMN `id` BIGINT(20) NOT NULL AUTO_INCREMENT");
            } catch (Exception $e) {}

            $pdo->exec("DELETE FROM `events`");
            $stmt = $pdo->prepare("INSERT INTO `events` (`id`, `day`, `month`, `title`, `time`, `location`, `category`, `description`, `organizer`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
            $usedIds = [];
            $baseTime = (int)(microtime(true) * 1000);
            $idx = 0;

            foreach ($input as $e) {
                $idx++;
                $itemRawId = isset($e['id']) ? (int)$e['id'] : 0;
                if ($itemRawId <= 0 || $itemRawId == 2147483647 || in_array($itemRawId, $usedIds)) {
                    $itemRawId = $baseTime + $idx;
                }
                $usedIds[] = $itemRawId;

                try {
                    $stmt->execute([
                        $itemRawId,
                        $e['day'] ?? '',
                        $e['month'] ?? '',
                        $e['title'] ?? '',
                        $e['time'] ?? '',
                        $e['location'] ?? '',
                        $e['category'] ?? '',
                        $e['description'] ?? '',
                        $e['organizer'] ?? null,
                    ]);
                } catch (Exception $e) {
                    error_log("Failed to insert event: " . $e->getMessage());
                }
            }
        }
        echo json_encode(["status" => "success", "message" => "Data agenda/event berhasil disimpan"]);
        break;

    case 'get_advantages':
        try {
            $stmt = $pdo->query("SELECT * FROM `advantages` ORDER BY `id` ASC");
            echo json_encode(["status" => "success", "data" => $stmt->fetchAll()]);
        } catch (Exception $e) {
            echo json_encode(["status" => "success", "data" => []]);
        }
        break;

    case 'save_advantages':
        if (is_array($input)) {
            try {
                $pdo->exec("CREATE TABLE IF NOT EXISTS `advantages` (
                    `id` BIGINT(20) NOT NULL AUTO_INCREMENT,
                    `title` VARCHAR(255) NOT NULL,
                    `desc` TEXT NOT NULL,
                    `icon_name` VARCHAR(100) NOT NULL DEFAULT 'CheckCircle2',
                    PRIMARY KEY (`id`)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");

                try {
                    $pdo->exec("ALTER TABLE `advantages` MODIFY COLUMN `id` BIGINT(20) NOT NULL AUTO_INCREMENT");
                } catch (Exception $e2) {}

                $pdo->exec("DELETE FROM `advantages`");
                $stmt = $pdo->prepare("INSERT INTO `advantages` (`id`, `title`, `desc`, `icon_name`) VALUES (?, ?, ?, ?)");
                $usedIds = [];
                $baseTime = (int)(microtime(true) * 1000);
                $idx = 0;

                foreach ($input as $item) {
                    $idx++;
                    $itemRawId = isset($item['id']) ? (int)$item['id'] : 0;
                    if ($itemRawId <= 0 || $itemRawId == 2147483647 || in_array($itemRawId, $usedIds)) {
                        $itemRawId = $baseTime + $idx;
                    }
                    $usedIds[] = $itemRawId;

                    try {
                        $stmt->execute([
                            $itemRawId,
                            $item['title'] ?? '',
                            $item['desc'] ?? $item['description'] ?? '',
                            $item['iconName'] ?? $item['icon_name'] ?? 'CheckCircle2',
                        ]);
                    } catch (Exception $e3) {
                        error_log("Failed to insert advantage: " . $e3->getMessage());
                    }
                }
            } catch (Exception $e) {}
        }
        echo json_encode(["status" => "success", "message" => "Data keunggulan berhasil disimpan"]);
        break;

    case 'get_visitor_logs':
        try {
            $stmt = $pdo->query("SELECT * FROM `visitor_logs` ORDER BY `id` DESC LIMIT 250");
            echo json_encode(["status" => "success", "data" => $stmt->fetchAll()]);
        } catch (Exception $e) {
            echo json_encode(["status" => "success", "data" => []]);
        }
        break;

    case 'save_visitor_log':
        try {
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

            $log = $input;
            $stmt = $pdo->prepare("INSERT INTO `visitor_logs` 
                (`id`, `timestamp`, `page`, `page_title`, `ip`, `city`, `region`, `country`, `device_type`, `browser`, `os`, `referrer`) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                $log['id'] ?? (string)time() . '_' . bin2hex(random_bytes(4)),
                $log['timestamp'] ?? date('Y-m-d H:i:s'),
                $log['page'] ?? '/',
                $log['pageTitle'] ?? $log['page_title'] ?? 'Beranda',
                $log['ip'] ?? $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1',
                $log['city'] ?? '-',
                $log['region'] ?? '-',
                $log['country'] ?? 'Indonesia',
                $log['deviceType'] ?? $log['device_type'] ?? 'Desktop',
                $log['browser'] ?? 'Chrome',
                $log['os'] ?? 'Windows',
                $log['referrer'] ?? 'Direct',
            ]);
            echo json_encode(["status" => "success", "message" => "Log tercatat"]);
        } catch (Exception $e) {
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        }
        break;

    default:
        echo json_encode([
            "status" => "active",
            "app" => "SD IT Andalas Cendekia API",
            "database" => "MySQL ({$db_name})",
            "url" => "https://sdit.andalascendekia.sch.id",
            "instructions" => "Gunakan ?action=ping untuk cek status DB MySQL"
        ]);
        break;
}
