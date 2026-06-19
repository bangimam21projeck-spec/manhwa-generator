import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

// ===== SISTEM API KEY =====
let webApiKeys = [];

function getEnvKeys() {
  const envKeys = process.env.GEMINI_API_KEYS?.split(',') || [];
  return envKeys.map(k => k.trim()).filter(k => k.length > 0);
}

function getAllKeys() {
  if (webApiKeys.length > 0) return webApiKeys;
  return getEnvKeys();
}

let currentIndex = 0;

function getNextKey() {
  const keys = getAllKeys();
  if (keys.length === 0) {
    throw new Error('❌ Tidak ada API Key!');
  }
  const key = keys[currentIndex];
  currentIndex = (currentIndex + 1) % keys.length;
  return key;
}

// ===== DAFTAR MODEL YANG VALID =====
const MODEL_LIST = [
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-1.5-flash',
  'gemini-pro',
  'models/gemini-2.5-flash',
  'models/gemini-2.0-flash',
  'models/gemini-1.5-flash',
  'models/gemini-pro'
];

// ===== FUNGSI GENERATE DENGAN FALLBACK =====
async function generateWithFallback(prompt) {
  const apiKey = getNextKey();
  const genAI = new GoogleGenerativeAI(apiKey);
  
  let lastError = null;
  
  for (const modelName of MODEL_LIST) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      
      return {
        text: response.text(),
        modelUsed: modelName
      };
    } catch (error) {
      lastError = error;
      console.log(`Model ${modelName} gagal, mencoba model lain...`);
      continue;
    }
  }
  
  throw new Error(`Semua model gagal. Error terakhir: ${lastError?.message || 'Tidak diketahui'}`);
}

// ===== EXPAND IMAGE =====
async function expandImageWithAI(imageData, direction, size) {
  const prompt = `Perluas gambar ini ke arah ${direction} dengan ukuran ${size}%.

Deskripsi yang harus diperhatikan:
1. Pertahankan gaya dan warna yang sama
2. Buat background yang seamless dan natural
3. Jangan mengubah objek utama
4. Hasilkan gambar yang seamless

Arah perluasan: ${direction}
Persentase perluasan: ${size}%`;

  // Untuk sekarang, kita return deskripsi + rekomendasi
  // Karena Gemini belum support image generation
  const result = await generateWithFallback(prompt);
  
  return {
    description: result.text,
    modelUsed: result.modelUsed,
    note: "⚠️ Gemini saat ini hanya bisa menganalisis gambar, belum bisa generate gambar. Gunakan tools lain untuk generate gambar."
  };
}

// ===== API ROUTES =====
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
    const allKeys = getAllKeys();
    const totalKeys = allKeys.length;

    return NextResponse.json({
      success: true,
      data: image, // Kembalikan gambar asli dulu
      description: result.description,
      direction: result.direction,
      size: result.size,
      note: result.note,
      meta: {
        modelUsed: result.modelUsed,
        keyUsed: `Key ${(currentIndex === 0 ? totalKeys : currentIndex)} dari ${totalKeys}`,
        totalKeys: totalKeys
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
    active: allKeys.length > 0,
    models: MODEL_LIST
  });
}
