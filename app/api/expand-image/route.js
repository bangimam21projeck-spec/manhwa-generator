import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

// ===================== SISTEM API KEY =====================

let webApiKeys = [];

function getEnvKeys() {
  const envKeys = process.env.GEMINI_API_KEYS?.split(',') || [];
  return envKeys.map(k => k.trim()).filter(k => k.length > 0);
}

function getAllKeys() {
  if (webApiKeys.length > 0) {
    return webApiKeys;
  }
  return getEnvKeys();
}

let currentIndex = 0;

function getNextKey() {
  const keys = getAllKeys();
  if (keys.length === 0) {
    throw new Error('❌ Tidak ada API Key! Tambahkan key di web atau di .env.local');
  }
  const key = keys[currentIndex];
  currentIndex = (currentIndex + 1) % keys.length;
  return key;
}

// Tambah key dari web
export function addWebKey(key) {
  if (!webApiKeys.includes(key)) {
    webApiKeys.push(key);
  }
  return webApiKeys;
}

export function removeWebKey(index) {
  if (index >= 0 && index < webApiKeys.length) {
    webApiKeys.splice(index, 1);
  }
  return webApiKeys;
}

export function getWebKeys() {
  return webApiKeys;
}

// ===================== EXPAND IMAGE =====================

async function expandImageWithAI(imageData, direction, size) {
  const apiKey = getNextKey();
  
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Buat prompt untuk expand gambar
    const prompt = `Perluas gambar ini ke arah ${direction} dengan ukuran ${size}%.

Deskripsi yang harus diperhatikan:
1. Pertahankan gaya dan warna yang sama
2. Buat background yang seamless dan natural
3. Jangan mengubah objek utama
4. Hasilkan gambar yang seamless

Arah perluasan: ${direction}
Persentase perluasan: ${size}%`;

    // Karena Gemini Vision belum support image editing secara langsung,
    // kita akan gunakan pendekatan generate deskripsi + rekomendasi
    
    const result = await model.generateContent([
      prompt,
      { inlineData: { data: imageData.split(',')[1], mimeType: "image/png" } }
    ]);
    
    const response = await result.response;
    const text = response.text();
    
    // Untuk sekarang, kita return deskripsi + rekomendasi
    // Karena Gemini belum support image generation
    return {
      success: true,
      data: imageData, // Kembalikan gambar asli dulu
      description: text,
      direction: direction,
      size: size,
      note: "⚠️ Gemini Vision saat ini hanya bisa menganalisis gambar, belum bisa generate gambar. Gunakan tools lain untuk generate gambar."
    };
    
  } catch (error) {
    console.error('Error expanding image:', error);
    throw new Error('Gagal memperluas gambar: ' + error.message);
  }
}

// ===================== API ROUTES =====================

export async function POST(request) {
  try {
    const { image, direction, size } = await request.json();
    
    if (!image) {
      return NextResponse.json(
        { error: 'Gambar diperlukan' },
        { status: 400 }
      );
    }

    const result = await expandImageWithAI(image, direction || 'all', size || 50);
    
    return NextResponse.json({
      success: true,
      data: result.data,
      description: result.description,
      direction: result.direction,
      size: result.size,
      note: result.note || '',
      meta: {
        keyUsed: `Key ${currentIndex} dari ${getAllKeys().length}`,
        totalKeys: getAllKeys().length
      }
    });

  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  const allKeys = getAllKeys();
  return NextResponse.json({
    success: true,
    keys: allKeys,
    total: allKeys.length,
    active: allKeys.length > 0
  });
}
