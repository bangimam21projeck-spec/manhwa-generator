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

// ===== CEK MODEL DENGAN COBA SATU PER SATU =====
export async function GET() {
  try {
    const keys = getAllKeys();
    
    if (keys.length === 0) {
      return NextResponse.json({
        error: 'Tidak ada API Key! Tambahkan key dulu.',
        hint: 'Tambahkan API Key di halaman Beranda atau di .env.local'
      }, { status: 400 });
    }

    const apiKey = keys[0];
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Daftar model yang mungkin valid
    const possibleModels = [
      'gemini-2.0-flash-exp',
      'gemini-1.5-flash',
      'gemini-1.5-pro',
      'gemini-pro',
      'models/gemini-2.0-flash-exp',
      'models/gemini-1.5-flash',
      'models/gemini-1.5-pro',
      'models/gemini-pro'
    ];

    const workingModels = [];

    for (const modelName of possibleModels) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        // Coba generate konten sederhana
        const result = await model.generateContent('Test');
        await result.response;
        workingModels.push(modelName);
      } catch (error) {
        // Model ini tidak valid, lanjut ke next
        continue;
      }
    }

    if (workingModels.length === 0) {
      return NextResponse.json({
        error: 'Tidak ada model yang valid untuk API Key ini.',
        hint: 'Coba buat API Key baru di https://aistudio.google.com'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      workingModels: workingModels,
      total: workingModels.length,
      recommendation: workingModels[0] || 'Tidak ada rekomendasi'
    });

  } catch (error) {
    console.error('Error checking models:', error);
    return NextResponse.json({
      error: 'Gagal cek model: ' + error.message,
      hint: 'Pastikan API Key valid dan terhubung ke internet.'
    }, { status: 500 });
  }
}
