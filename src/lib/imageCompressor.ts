/**
 * Utility untuk kompresi gambar di sisi klien (browser) sebelum diunggah ke server.
 * Memanfaatkan HTML5 Canvas API untuk me-resize dimensi dan menurunkan kualitas secara optimal.
 * Foto 3-5MB dari kamera smartphone akan terkompres menjadi ~100-300KB
 * dengan kualitas visual yang tetap sangat tajam dan jernih.
 */

export interface CompressOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.1 - 1.0 (default: 0.82)
}

export async function compressImage(
  file: File | Blob,
  options: CompressOptions = {}
): Promise<File> {
  const {
    maxWidth = 1200,
    maxHeight = 1200,
    quality = 0.82,
  } = options;

  // Jika bukan gambar (misalnya PDF), kembalikan file asli
  if (file.type && !file.type.startsWith('image/')) {
    return file instanceof File ? file : new File([file], 'document', { type: file.type });
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Gagal membaca file gambar'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Format file gambar tidak didukung atau rusak'));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Hitung aspect ratio resize
        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          resolve(file instanceof File ? file : new File([file], 'image.jpg', { type: 'image/jpeg' }));
          return;
        }

        // Gambar ulang di canvas dengan ukuran baru
        ctx.drawImage(img, 0, 0, width, height);

        // Ekspor ke format JPEG dengan kompresi
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file instanceof File ? file : new File([file], 'image.jpg', { type: 'image/jpeg' }));
              return;
            }

            const rawName = file instanceof File ? file.name : 'foto.jpg';
            const baseName = rawName.substring(0, rawName.lastIndexOf('.')) || rawName;
            const newFileName = `${baseName}_compressed.jpg`;

            const compressedFile = new File([blob], newFileName, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });

            resolve(compressedFile);
          },
          'image/jpeg',
          quality
        );
      };

      img.src = e.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
}

