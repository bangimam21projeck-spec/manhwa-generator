import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

// ===== SISTEM API KEY (copy dari file lain) =====
let webApiKeys = [];

function getEnvKeys() {
  const envKeys = process.env.GEMINI_API_KEYS?.split(',') || [];
  return envKeys.map(k => k.trim()).filter(k => k.length > 0);
}

function getAllKeys() {
  if (webApiKeys.length > 0) return webApiKeys;
  return getEnvKeys();
}

// ===== CEK MODEL =====
export async function GET() {
  try {
    const keys = getAllKeys();
    
    if (keys.length === 0) {
      return NextResponse.json({
        error: 'Tidak ada API Key! Tambahkan key dulu.',
        hint: 'Tambahkan API Key di halaman Beranda atau di .env.local'
      }, { status: 400 });
    }

    // Gunakan key pertama untuk cek
    const apiKey = keys[0];
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Dapatkan daftar model
    const models = await genAI.listModels();
    
    // Filter model yang support generateContent
    const supportedModels = models.models.filter(m => 
      m.supportedGenerationMethods?.includes('generateContent')
    );

    // Ambil hanya nama model
    const modelNames = supportedModels.map(m => m.name);

    return NextResponse.json({
      success: true,
      totalModels: models.models.length,
      supportedForGenerate: supportedModels.length,
      models: modelNames,
      allModels: models.models.map(m => ({
        name: m.name,
        supportedMethods: m.supportedGenerationMethods || []
      }))
    });

  } catch (error) {
    console.error('Error checking models:', error);
    return NextResponse.json({
      error: 'Gagal cek model: ' + error.message,
      hint: 'Pastikan API Key valid dan terhubung ke internet.'
    }, { status: 500 });
  }
}
