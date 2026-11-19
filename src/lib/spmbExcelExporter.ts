import { Registration, formatDateTime } from './storage';

export interface ExportExcelOptions {
  scope?: 'ALL' | 'FILTERED';
  format?: 'DETAIL' | 'RINGKAS';
  activeFilters?: {
    stage?: string;
    status?: string;
    search?: string;
  };
  schoolName?: string;
  schoolAddress?: string;
  schoolPhone?: string;
  academicYear?: string;
}

export interface CombinedRegExport extends Registration {
  userName?: string;
  userEmail?: string;
}

/**
 * Utilitas untuk mengekspor data pendaftar SPMB ke file Microsoft Excel (.xls)
 * Menggunakan format XML HTML Spreadsheet ber-encoding UTF-8 (dengan BOM)
 * Dilengkapi proteksi mso-number-format agar angka 0 di depan (No HP, NISN, NIK) tidak hilang.
 */
export function exportSpmbToExcel(
  data: CombinedRegExport[],
  options: ExportExcelOptions = {}
) {
  if (!data || data.length === 0) {
    alert('Tidak ada data calon siswa yang tersedia untuk diekspor.');
    return false;
  }

  const {
    scope = 'ALL',
    format = 'DETAIL',
    activeFilters = {},
    schoolName = 'SD IT ANDALAS CENDEKIA',
    schoolAddress = 'Komp. Rukan Andalas Cendekia, Sumatera Barat',
    schoolPhone = '0812-3456-7890',
    academicYear = '2027/2028',
  } = options;

  const dateStr = new Date().toISOString().split('T')[0];
  const timeStr = new Date().toLocaleTimeString('id-ID');
  const scopeSuffix = scope === 'FILTERED' ? 'Terfilter' : 'Semua';
  const formatSuffix = format === 'RINGKAS' ? 'Ringkas' : 'Lengkap_Detail';
  const filename = `SPMB_${schoolName.replace(/[^a-zA-Z0-9]/g, '_')}_${academicYear.replace(/[^a-zA-Z0-9]/g, '-')}_${scopeSuffix}_${formatSuffix}_${dateStr}.xls`;

  // Hitung ringkasan statistik data yang diekspor
  const totalBoys = data.filter((r) => r.gender === 'L').length;
  const totalGirls = data.filter((r) => r.gender === 'P').length;
  const totalVerifiedPay = data.filter((r) => r.paymentStatus === 'VERIFIED').length;
  const totalPendingPay = data.filter((r) => r.paymentStatus === 'PENDING').length;
  const totalUnpaid = data.filter((r) => r.paymentStatus === 'UNPAID').length;
  const totalPassed = data.filter((r) => r.graduationStatus === 'PASSED').length;
  const totalFailed = data.filter((r) => r.graduationStatus === 'FAILED').length;
  const totalPendingGrad = data.filter((r) => !r.graduationStatus || r.graduationStatus === 'PENDING').length;

  // Filter teks deskripsi
  const filterDescList: string[] = [];
  if (scope === 'FILTERED') {
    if (activeFilters.stage && activeFilters.stage !== 'ALL') filterDescList.push(`Tahap: ${activeFilters.stage}`);
    if (activeFilters.status && activeFilters.status !== 'ALL') filterDescList.push(`Status Berkas: ${activeFilters.status}`);
    if (activeFilters.search) filterDescList.push(`Pencarian: "${activeFilters.search}"`);
  }
  const filterInfo = filterDescList.length > 0 ? filterDescList.join(' | ') : 'Semua Data Pendaftar';

  const isDetail = format === 'DETAIL';
  const totalCols = isDetail ? 35 : 14;

  // HTML Head & Styles
  let html = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <!--[if gte mso 9]>
      <xml>
        <x:ExcelWorkbook>
          <x:ExcelWorksheets>
            <x:ExcelWorksheet>
              <x:Name>Data SPMB ${academicYear.replace(/[^a-zA-Z0-9]/g, '-')}</x:Name>
              <x:WorksheetOptions>
                <x:DisplayGridlines/>
                <x:FitToPage/>
              </x:WorksheetOptions>
            </x:ExcelWorksheet>
          </x:ExcelWorksheets>
        </x:ExcelWorkbook>
      </xml>
      <![endif]-->
      <meta http-equiv="content-type" content="text/plain; charset=UTF-8"/>
      <style>
        body { font-family: Calibri, Arial, sans-serif; font-size: 10pt; color: #1e293b; }
        table { border-collapse: collapse; width: 100%; }
        
        /* Judul & Kop Sekolah */
        .kop-title { font-size: 16pt; font-weight: bold; color: #065f46; text-align: left; }
        .kop-sub { font-size: 11pt; font-weight: bold; color: #334155; text-align: left; }
        .kop-info { font-size: 9.5pt; color: #64748b; text-align: left; }
        
        /* Header Grup & Kolom */
        .group-th { font-weight: bold; font-size: 10pt; color: #ffffff; text-align: center; border: 1px solid #065f46; padding: 7px; }
        .th-col { background-color: #047857; color: #ffffff; font-weight: bold; font-size: 9.5pt; text-align: center; border: 1px solid #065f46; padding: 6px; }
        
        /* Baris Data */
        td { border: 1px solid #cbd5e1; padding: 6px; vertical-align: middle; font-size: 9.5pt; }
        .row-even { background-color: #ffffff; }
        .row-odd { background-color: #f8fafc; }
        
        /* Format Teks & Alignment */
        .text-str { mso-number-format: "\\@"; }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .font-bold { font-weight: bold; }
        
        /* Status Badges */
        .badge-lunas { background-color: #d1fae5; color: #065f46; font-weight: bold; text-align: center; }
        .badge-pending { background-color: #fef3c7; color: #92400e; font-weight: bold; text-align: center; }
        .badge-unpaid { background-color: #fee2e2; color: #991b1b; font-weight: bold; text-align: center; }
        .badge-passed { background-color: #ecfdf5; color: #047857; font-weight: bold; text-align: center; }
        .badge-failed { background-color: #fef2f2; color: #b91c1c; font-weight: bold; text-align: center; }
        
        /* Summary Box */
        .sum-title { background-color: #065f46; color: #ffffff; font-weight: bold; font-size: 10.5pt; padding: 6px; }
        .sum-label { background-color: #f1f5f9; font-weight: bold; color: #334155; border: 1px solid #cbd5e1; padding: 5px; }
        .sum-val { background-color: #ffffff; font-weight: bold; text-align: center; border: 1px solid #cbd5e1; padding: 5px; }
      </style>
    </head>
    <body>
      <table>
        <!-- Kop Surat & Judul Rekap -->
        <tr><td colspan="${totalCols}" class="kop-title">${schoolName}</td></tr>
        <tr><td colspan="${totalCols}" class="kop-sub">DATA REKAPITULASI PENDAFTARAN SISWA BARU (SPMB) TAHUN AJARAN ${academicYear}</td></tr>
        <tr><td colspan="${totalCols}" class="kop-info">Alamat: ${schoolAddress} | Telp: ${schoolPhone} | Website: sdit.andalascendekia.sch.id</td></tr>
        <tr><td colspan="${totalCols}" class="kop-info">Waktu Unduh: ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })} ${timeStr} WIB | Lingkup: <strong>${filterInfo}</strong> | Total: <strong>${data.length} Calon Siswa</strong></td></tr>
        <tr><td colspan="${totalCols}"></td></tr>
  `;

  if (isDetail) {
    // =========================================================================
    // FORMAT LENGKAP & DETAIL (35 KOLOM)
    // =========================================================================
    html += `
      <thead>
        <!-- Baris 1: Header Grup Kategori -->
        <tr>
          <th colspan="4" class="group-th" style="background-color: #065f46;">A. DATA REGISTRASI</th>
          <th colspan="12" class="group-th" style="background-color: #047857;">B. BIODATA CALON SISWA</th>
          <th colspan="9" class="group-th" style="background-color: #065f46;">C. DATA ORANG TUA / WALI</th>
          <th colspan="8" class="group-th" style="background-color: #047857;">D. TAHAPAN & SELEKSI SPMB</th>
          <th colspan="3" class="group-th" style="background-color: #065f46;">E. STATUS & PEMBAYARAN</th>
          <th colspan="3" class="group-th" style="background-color: #047857;">F. DOKUMEN & FOTO</th>
          <th colspan="2" class="group-th" style="background-color: #065f46;">G. SURVEI & KUESIONER</th>
        </tr>

        <!-- Baris 2: Sub-Header Tiap Kolom -->
        <tr>
          <th class="th-col" style="width: 40px;">No</th>
          <th class="th-col" style="width: 80px;">No. Registrasi</th>
          <th class="th-col" style="width: 120px;">Waktu Mendaftar</th>
          <th class="th-col" style="width: 120px;">Terakhir Update</th>
          
          <th class="th-col" style="width: 180px;">Nama Lengkap Calon Siswa</th>
          <th class="th-col" style="width: 60px;">L/P</th>
          <th class="th-col" style="width: 110px;">NISN</th>
          <th class="th-col" style="width: 130px;">NIK Calon Siswa</th>
          <th class="th-col" style="width: 110px;">Tempat Lahir</th>
          <th class="th-col" style="width: 100px;">Tanggal Lahir</th>
          <th class="th-col" style="width: 150px;">Asal Sekolah (TK/PAUD)</th>
          <th class="th-col" style="width: 180px;">Alamat Sekolah Asal</th>
          <th class="th-col" style="width: 90px;">Program</th>
          <th class="th-col" style="width: 70px;">Ukuran Baju</th>
          <th class="th-col" style="width: 220px;">Alamat Rumah Lengkap</th>
          <th class="th-col" style="width: 130px;">Jarak ke Sekolah</th>
          
          <th class="th-col" style="width: 140px;">Nama Ayah Kandung</th>
          <th class="th-col" style="width: 130px;">Pekerjaan Ayah</th>
          <th class="th-col" style="width: 130px;">Penghasilan Ayah</th>
          <th class="th-col" style="width: 140px;">Nama Ibu Kandung</th>
          <th class="th-col" style="width: 130px;">Pekerjaan Ibu</th>
          <th class="th-col" style="width: 130px;">Penghasilan Ibu</th>
          <th class="th-col" style="width: 120px;">No. WhatsApp / HP</th>
          <th class="th-col" style="width: 140px;">Email Akun Wali</th>
          <th class="th-col" style="width: 130px;">Nama Akun Pendaftar</th>
          
          <th class="th-col" style="width: 130px;">Tahapan SPMB</th>
          <th class="th-col" style="width: 150px;">Hasil Tes STIFIn</th>
          <th class="th-col" style="width: 80px;">Nilai Tes</th>
          <th class="th-col" style="width: 110px;">Status Kelulusan</th>
          <th class="th-col" style="width: 180px;">Catatan Wawancara Anak</th>
          <th class="th-col" style="width: 180px;">Catatan Wawancara Ortu</th>
          <th class="th-col" style="width: 180px;">Catatan / Pesan Tahapan</th>
          <th class="th-col" style="width: 180px;">Catatan Khusus Panitia</th>
          
          <th class="th-col" style="width: 100px;">Status Berkas</th>
          <th class="th-col" style="width: 110px;">Biaya Pendaftaran</th>
          <th class="th-col" style="width: 150px;">Alasan Tolak (Jika Ada)</th>
          
          <th class="th-col" style="width: 120px;">Link Pas Foto</th>
          <th class="th-col" style="width: 120px;">Link Bukti Transfer</th>
          <th class="th-col" style="width: 150px;">Link Google Drive</th>
          
          <th class="th-col" style="width: 140px;">Sumber Informasi</th>
          <th class="th-col" style="width: 220px;">Alasan Memilih Sekolah</th>
        </tr>
      </thead>
      <tbody>
    `;

    data.forEach((r, idx) => {
      const rowClass = idx % 2 === 0 ? 'row-even' : 'row-odd';
      
      // WhatsApp link
      const cleanPhone = (r.parentPhone || '').replace(/[^0-9]/g, '');
      const waNumber = cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone;
      const waCell = waNumber
        ? `<a href="https://wa.me/${waNumber}" target="_blank" style="color: #047857; text-decoration: underline;">${r.parentPhone}</a>`
        : (r.parentPhone || '-');

      // Foto link
      const fotoCell = (r.fotoUrl && !r.fotoUrl.startsWith('blob:') && !r.fotoUrl.startsWith('data:'))
        ? `<a href="${r.fotoUrl}" target="_blank" style="color: #2563eb; text-decoration: underline;">Buka Foto</a>`
        : (r.fotoUrl ? 'Tersedia' : '-');

      // Bukti bayar link
      const payProofCell = (r.paymentProofUrl && !r.paymentProofUrl.startsWith('blob:') && !r.paymentProofUrl.startsWith('data:'))
        ? `<a href="${r.paymentProofUrl}" target="_blank" style="color: #2563eb; text-decoration: underline;">Buka Bukti</a>`
        : (r.paymentProofUrl ? 'Tersedia' : '-');

      // Drive link
      const driveCell = r.documentDriveUrl
        ? `<a href="${r.documentDriveUrl}" target="_blank" style="color: #047857; text-decoration: underline;">Folder Drive</a>`
        : '-';

      // Status bayar badge
      const payClass = r.paymentStatus === 'VERIFIED' ? 'badge-lunas' : r.paymentStatus === 'PENDING' ? 'badge-pending' : 'badge-unpaid';
      const payLabel = r.paymentStatus === 'VERIFIED' ? 'LUNAS' : r.paymentStatus === 'PENDING' ? 'MENUNGGU VERIFIKASI' : 'BELUM BAYAR';

      // Kelulusan badge
      const gradClass = r.graduationStatus === 'PASSED' ? 'badge-passed' : r.graduationStatus === 'FAILED' ? 'badge-failed' : 'badge-pending';
      const gradLabel = r.graduationStatus === 'PASSED' ? 'LULUS SELEKSI' : r.graduationStatus === 'FAILED' ? 'TIDAK LULUS' : 'DALAM PROSES';

      html += `
        <tr class="${rowClass}">
          <td class="text-center font-bold">${idx + 1}</td>
          <td class="text-str text-center font-bold">#${r.id}</td>
          <td class="text-center">${formatDateTime(r.createdAt)}</td>
          <td class="text-center">${formatDateTime(r.updatedAt)}</td>
          
          <td class="font-bold">${r.studentName || r.userName || '-'}</td>
          <td class="text-center font-bold">${r.gender === 'P' ? 'Perempuan (P)' : 'Laki-laki (L)'}</td>
          <td class="text-str text-center">${r.nisn || '-'}</td>
          <td class="text-str text-center">${r.nik || '-'}</td>
          <td>${r.birthPlace || '-'}</td>
          <td class="text-str text-center">${r.birthDate || '-'}</td>
          <td>${r.previousSchool || '-'}</td>
          <td>${r.schoolAddress || '-'}</td>
          <td class="text-center font-bold">${r.programType || 'BOARDING'}</td>
          <td class="text-center">${r.uniformSize || '-'}</td>
          <td>${r.address || '-'}</td>
          <td>${r.distanceToSchool || '-'}</td>
          
          <td>${r.fatherName || '-'}</td>
          <td>${r.fatherOccupation || '-'}</td>
          <td>${r.fatherIncome || '-'}</td>
          <td>${r.motherName || '-'}</td>
          <td>${r.motherOccupation || '-'}</td>
          <td>${r.motherIncome || '-'}</td>
          <td class="text-str">${waCell}</td>
          <td>${r.userEmail || '-'}</td>
          <td>${r.userName || '-'}</td>
          
          <td class="font-bold">${r.spmbStage || 'PENDAFTARAN'}</td>
          <td class="font-bold" style="color: #7e22ce;">${r.stifinResult || 'Belum diinput'}</td>
          <td class="text-center font-bold">${r.testScore !== null && r.testScore !== undefined ? r.testScore : '-'}</td>
          <td class="${gradClass}">${gradLabel}</td>
          <td>${r.interviewChildNotes || '-'}</td>
          <td>${r.interviewParentNotes || '-'}</td>
          <td>${r.stageNote || '-'}</td>
          <td>${r.interviewNotes || '-'}</td>
          
          <td class="text-center font-bold">${r.status || 'DRAFT'}</td>
          <td class="${payClass}">${payLabel}</td>
          <td>${r.rejectionReason || '-'}</td>
          
          <td class="text-center">${fotoCell}</td>
          <td class="text-center">${payProofCell}</td>
          <td class="text-center">${driveCell}</td>
          
          <td>${r.infoSource || '-'}</td>
          <td>${r.reasonToJoin || '-'}</td>
        </tr>
      `;
    });

  } else {
    // =========================================================================
    // FORMAT RINGKAS (14 KOLOM POKOK)
    // =========================================================================
    html += `
      <thead>
        <tr>
          <th class="th-col" style="width: 40px;">No</th>
          <th class="th-col" style="width: 80px;">No. Registrasi</th>
          <th class="th-col" style="width: 120px;">Waktu Daftar</th>
          <th class="th-col" style="width: 180px;">Nama Lengkap Calon Siswa</th>
          <th class="th-col" style="width: 60px;">L/P</th>
          <th class="th-col" style="width: 110px;">NISN</th>
          <th class="th-col" style="width: 150px;">Asal Sekolah</th>
          <th class="th-col" style="width: 90px;">Program</th>
          <th class="th-col" style="width: 150px;">Nama Orang Tua / Wali</th>
          <th class="th-col" style="width: 120px;">No. WhatsApp / HP</th>
          <th class="th-col" style="width: 130px;">Tahapan SPMB</th>
          <th class="th-col" style="width: 140px;">Hasil STIFIn</th>
          <th class="th-col" style="width: 110px;">Biaya Pendaftaran</th>
          <th class="th-col" style="width: 110px;">Status Kelulusan</th>
        </tr>
      </thead>
      <tbody>
    `;

    data.forEach((r, idx) => {
      const rowClass = idx % 2 === 0 ? 'row-even' : 'row-odd';
      const cleanPhone = (r.parentPhone || '').replace(/[^0-9]/g, '');
      const waNumber = cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone;
      const waCell = waNumber
        ? `<a href="https://wa.me/${waNumber}" target="_blank" style="color: #047857; text-decoration: underline;">${r.parentPhone}</a>`
        : (r.parentPhone || '-');

      const payClass = r.paymentStatus === 'VERIFIED' ? 'badge-lunas' : r.paymentStatus === 'PENDING' ? 'badge-pending' : 'badge-unpaid';
      const payLabel = r.paymentStatus === 'VERIFIED' ? 'LUNAS' : r.paymentStatus === 'PENDING' ? 'MENUNGGU' : 'BELUM BAYAR';
      const gradClass = r.graduationStatus === 'PASSED' ? 'badge-passed' : r.graduationStatus === 'FAILED' ? 'badge-failed' : 'badge-pending';
      const gradLabel = r.graduationStatus === 'PASSED' ? 'LULUS' : r.graduationStatus === 'FAILED' ? 'TIDAK LULUS' : 'PROSES';

      html += `
        <tr class="${rowClass}">
          <td class="text-center font-bold">${idx + 1}</td>
          <td class="text-str text-center font-bold">#${r.id}</td>
          <td class="text-center">${formatDateTime(r.createdAt)}</td>
          <td class="font-bold">${r.studentName || r.userName || '-'}</td>
          <td class="text-center font-bold">${r.gender === 'P' ? 'Perempuan (P)' : 'Laki-laki (L)'}</td>
          <td class="text-str text-center">${r.nisn || '-'}</td>
          <td>${r.previousSchool || '-'}</td>
          <td class="text-center font-bold">${r.programType || 'BOARDING'}</td>
          <td>${r.fatherName || r.motherName || r.userName || '-'}</td>
          <td class="text-str">${waCell}</td>
          <td class="font-bold">${r.spmbStage || 'PENDAFTARAN'}</td>
          <td style="color: #7e22ce; font-weight: bold;">${r.stifinResult || '-'}</td>
          <td class="${payClass}">${payLabel}</td>
          <td class="${gradClass}">${gradLabel}</td>
        </tr>
      `;
    });
  }

  // Ringkasan Footer Tabel
  html += `
        </tbody>
      </table>

      <br/><br/>
      <!-- Kotak Ringkasan Statistik Rekapitulasi -->
      <table style="width: 480px; margin-top: 15px;">
        <tr><td colspan="2" class="sum-title">RINGKASAN REKAPITULASI DATA PENDAFTAR</td></tr>
        <tr><td class="sum-label">Total Calon Siswa Terdata</td><td class="sum-val">${data.length} Orang</td></tr>
        <tr><td class="sum-label">Jumlah Laki-laki (L)</td><td class="sum-val">${totalBoys} Orang</td></tr>
        <tr><td class="sum-label">Jumlah Perempuan (P)</td><td class="sum-val">${totalGirls} Orang</td></tr>
        <tr><td class="sum-label">Pembayaran Lunas</td><td class="sum-val" style="color: #065f46;">${totalVerifiedPay} Siswa</td></tr>
        <tr><td class="sum-label">Pembayaran Menunggu Verifikasi</td><td class="sum-val" style="color: #b45309;">${totalPendingPay} Siswa</td></tr>
        <tr><td class="sum-label">Belum Bayar</td><td class="sum-val" style="color: #b91c1c;">${totalUnpaid} Siswa</td></tr>
        <tr><td class="sum-label">Lulus Seleksi (Diterima)</td><td class="sum-val" style="color: #065f46;">${totalPassed} Siswa</td></tr>
        <tr><td class="sum-label">Tidak Lulus</td><td class="sum-val" style="color: #b91c1c;">${totalFailed} Siswa</td></tr>
        <tr><td class="sum-label">Dalam Proses Seleksi</td><td class="sum-val">${totalPendingGrad} Siswa</td></tr>
      </table>
    </body>
    </html>
  `;

  // Gunakan \uFEFF (UTF-8 BOM) agar Microsoft Excel di Windows otomatis membaca karakter UTF-8 dengan benar
  const blob = new Blob(['\uFEFF' + html], { type: 'application/vnd.ms-excel;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  return true;
}

