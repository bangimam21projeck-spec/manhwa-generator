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
      
      // Jika berhasil, kembalikan hasil dan catat model yang dipakai
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
  
  // Jika semua model gagal
  throw new Error(`Semua model gagal. Error terakhir: ${lastError?.message || 'Tidak diketahui'}`);
}

// ===== API ROUTES =====
export async function POST(request) {
  try {
    const { prompt } = await request.json();
    
    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt diperlukan' },
        { status: 400 }
      );
    }

    const result = await generateWithFallback(prompt);
    const allKeys = getAllKeys();
    const totalKeys = allKeys.length;

    return NextResponse.json({
      success: true,
      data: result.text,
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
