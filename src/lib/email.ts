import { Registration, User, getSiteSettings } from './storage';

export interface EmailPayload {
  toEmail: string;
  toName: string;
  subject: string;
  registrationData: Registration;
}

/**
 * Service pengiriman email Bukti Pendaftaran SPMB.
 * Di lingkungan browser SPA, fungsi ini mensimulasikan pengiriman email otomatis 
 * dan menyediakan template siap pakai untuk dihubungkan ke EmailJS / Resend API.
 */
export async function sendRegistrationEmail(payload: EmailPayload): Promise<{ success: boolean; message: string }> {
  const { toEmail, toName, registrationData } = payload;

  console.log(`[Email Service] Mengirim email Formulir SPMB ke ${toEmail}...`);

  // Simulasi delay jaringan (1 detik)
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Logika simulasi pengiriman sukses
  return {
    success: true,
    message: `Formulir Pendaftaran SPMB resmi telah berhasil dikirim ke email: ${toEmail}`,
  };
}

/**
 * Template Email HTML yang dapat digunakan saat dihubungkan ke Resend / EmailJS / Nodemailer
 */
export function generateEmailHTMLTemplate(name: string, reg: Registration): string {
  const settings = getSiteSettings();
  const academicYear = settings.spmbAcademicYear || '2027/2028';
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
      <div style="background-color: #064e3b; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
        <h2 style="margin: 0;">SD IT ANDALAS CENDEKIA</h2>
        <p style="margin: 5px 0 0 0; font-size: 14px; color: #fde047;">Unggul Berkarakter Al-Qur’an</p>
      </div>

      <div style="padding: 20px; color: #1e293b;">
        <h3>Konfirmasi Pendaftaran SPMB ${academicYear}</h3>
        <p>Assalamu'alaikum Warahmatullahi Wabarakatuh, <strong>${name}</strong>.</p>
        <p>Terima kasih telah mendaftar di SD IT Andalas Cendekia. Berikut adalah ringkasan data pendaftaran Anda:</p>

        <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #cbd5e1;"><strong>Nomor Pendaftaran</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #cbd5e1;">#SPMB-${reg.id}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #cbd5e1;"><strong>NISN</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #cbd5e1;">${reg.nisn || '-'}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #cbd5e1;"><strong>Asal Sekolah / TK</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #cbd5e1;">${reg.previousSchool || '-'}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #cbd5e1;"><strong>Status Pendaftaran</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #cbd5e1;"><span style="color: #047857; font-weight: bold;">${reg.status}</span></td>
          </tr>
        </table>

        <!-- Box Pembayaran Bank Nagari -->
        <div style="background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 10px; padding: 16px; margin-top: 20px;">
          <h4 style="margin: 0 0 8px 0; color: #065f46; font-size: 14px;">💳 Instruksi Pembayaran Biaya Pendaftaran:</h4>
          <p style="margin: 0 0 4px 0; font-size: 13px;">Biaya Pendaftaran: <strong>Rp 250.000</strong></p>
          <p style="margin: 0 0 4px 0; font-size: 13px;">Bank Tujuan: <strong>Bank Nagari</strong></p>
          <p style="margin: 0 0 4px 0; font-size: 13px;">Nomor Rekening: <strong style="font-size: 15px; color: #047857; font-family: monospace;">71050220008996</strong></p>
          <p style="margin: 0 0 8px 0; font-size: 13px;">Atas Nama: <strong>Yayasan Andalas Cendekia</strong></p>
          <p style="margin: 0; font-size: 12px; color: #047857; font-weight: bold;">
            *Setelah transfer, mohon login ke Portal SPMB dan upload foto bukti transfer Anda di menu Pembayaran.
          </p>
        </div>

        <p style="margin-top: 20px;">Silakan login ke Portal SPMB untuk upload bukti pembayaran dan mengecek status seleksi:</p>
        <p style="text-align: center;">
          <a href="https://sdit.andalascendekia.sch.id/spmb/login" style="background-color: #059669; color: white; padding: 10px 20px; text-decoration: none; border-radius: 20px; font-weight: bold;">Login Portal SPMB</a>
        </p>

        <p style="margin-top: 30px; font-size: 12px; color: #64748b;">
          Panitia SPMB SDIT ANDALAS CENDEKIA 02<br/>
          Marga Makmur, RT 0/RW 0, Kel. Marga Makmur, Kec. Timpeh, Kab. Dharmasraya 27679<br/>
          WhatsApp: 0811-6696-990 | Email: sditac1@gmail.com
        </p>
      </div>
    </div>
  `;
}
