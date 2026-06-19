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

// ===== SEMUA KEMUNGKINAN NAMA MODEL =====
const ALL_MODELS = [
  // Tanpa awalan models/
  'gemini-2.5-flash',
  'gemini-2.5-pro',
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
  'gemini-2.0-pro',
  'gemini-1.5-flash',
  'gemini-1.5-pro',
  'gemini-1.0-pro',
  'gemini-pro',
  // Dengan awalan models/
  'models/gemini-2.5-flash',
  'models/gemini-2.5-pro',
  'models/gemini-2.0-flash',
  'models/gemini-2.0-flash-lite',
  'models/gemini-2.0-pro',
  'models/gemini-1.5-flash',
  'models/gemini-1.5-pro',
  'models/gemini-1.0-pro',
  'models/gemini-pro',
];

export async function GET() {
  try {
    const keys = getAllKeys();
    
    if (keys.length === 0) {
      return NextResponse.json({
        error: 'Tidak ada API Key! Tambahkan key dulu.',
        hint: 'Tambahkan API Key di halaman Beranda'
      }, { status: 400 });
    }

    const apiKey = keys[0];
    const genAI = new GoogleGenerativeAI(apiKey);
    
    const workingModels = [];
    const errors = [];

    for (const modelName of ALL_MODELS) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent('Test');
        await result.response;
        workingModels.push(modelName);
      } catch (error) {
        errors.push({ model: modelName, error: error.message });
        continue;
      }
    }

    if (workingModels.length === 0) {
      return NextResponse.json({
        error: 'Tidak ada model yang valid untuk API Key ini.',
        hint: 'Coba buat API Key baru di https://aistudio.google.com',
        errors: errors.slice(0, 5) // Tampilkan 5 error pertama
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      workingModels: workingModels,
      total: workingModels.length,
      recommendation: workingModels[0] || 'Tidak ada rekomendasi',
      allTested: ALL_MODELS.length,
      errors: errors.slice(0, 3) // Tampilkan 3 error pertama
    });

  } catch (error) {
    console.error('Error checking models:', error);
    return NextResponse.json({
      error: 'Gagal cek model: ' + error.message,
      hint: 'Pastikan API Key valid dan terhubung ke internet.'
    }, { status: 500 });
  }
}
