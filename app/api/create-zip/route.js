import { NextResponse } from 'next/server';
import JSZip from 'jszip';

export async function POST(request) {
  try {
    const { panels } = await request.json();
    
    if (!panels || panels.length === 0) {
      return NextResponse.json(
        { error: 'Tidak ada panel untuk di-zip' },
        { status: 400 }
      );
    }

    // Buat ZIP
    const zip = new JSZip();
    
    // Tambahkan setiap panel ke ZIP
    for (const panel of panels) {
      // Hapus prefix data:image/png;base64,
      const base64Data = panel.dataUrl.split(',')[1];
      const buffer = Buffer.from(base64Data, 'base64');
      
      zip.file(`Panel_${String(panel.index).padStart(2, '0')}.png`, buffer);
    }

    // Buat file naskah kosong (akan diisi user nanti)
    zip.file('naskah.txt', 'Tulis naskah di sini...');

    // Generate ZIP
    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });
    
    // Konversi ke base64 untuk dikirim
    const base64Zip = zipBuffer.toString('base64');
    
    // Buat URL data untuk download
    const dataUrl = `data:application/zip;base64,${base64Zip}`;

    return NextResponse.json({
      success: true,
      url: dataUrl,
      filename: 'manhwa-panels.zip',
      message: `✅ ZIP berhasil dibuat! ${panels.length} panel.`
    });

  } catch (error) {
    console.error('Error creating ZIP:', error);
    return NextResponse.json(
      { error: 'Gagal membuat ZIP: ' + error.message },
      { status: 500 }
    );
  }
}
