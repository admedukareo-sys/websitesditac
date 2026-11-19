<?php
// ==============================================================================
// KONEKSI DATABASE MYSQL (cPanel / phpMyAdmin)
// Host: localhost | Database: andalas4_sdit | User: andalas4_sditac
// ==============================================================================

// Header Keamanan & Response Type JSON
@header_remove('X-Powered-By');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");
header("X-Content-Type-Options: nosniff");
header("X-Frame-Options: SAMEORIGIN");
header("X-XSS-Protection: 1; mode=block");
header("Referrer-Policy: strict-origin-when-cross-origin");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Auto load .env jika tersedia
$envPaths = [dirname(__DIR__) . '/.env', __DIR__ . '/.env', dirname(dirname(__DIR__)) . '/.env'];
foreach ($envPaths as $envPath) {
    if (file_exists($envPath)) {
        $lines = @file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) ?: [];
        foreach ($lines as $line) {
            $line = trim($line);
            if ($line === '' || strpos($line, '#') === 0) continue;
            if (strpos($line, '=') !== false) {
                list($key, $val) = explode('=', $line, 2);
                $key = trim($key);
                $val = trim($val, " \t\n\r\0\x0B\"'");
                if (getenv($key) === false) {
                    putenv("{$key}={$val}");
                    $_ENV[$key] = $val;
                }
            }
        }
        break;
    }
}

$db_host = getenv('DB_HOST') ?: 'localhost';
$db_port = getenv('DB_PORT') ?: '3306';
$db_name = getenv('DB_NAME') ?: 'andalas4_sdit';
$db_user = getenv('DB_USER') ?: 'andalas4_sditac';
$db_pass = getenv('DB_PASSWORD') ?: 'Andalas@10310802';
$app_secret = getenv('APP_SECRET') ?: 'sdit_ac_jwt_hmac_secret_2026_9b87f2e!';

try {
    $pdo = new PDO("mysql:host={$db_host};port={$db_port};dbname={$db_name};charset=utf8mb4", $db_user, $db_pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);
} catch (PDOException $e) {
    error_log("[DB Connection Error] " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Gagal terhubung ke database server. Pastikan konfigurasi database di cPanel sudah sesuai."
    ]);
    exit();
}
