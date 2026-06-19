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

// ===================== TEXT-TO-SPEECH =====================

// Fungsi untuk generate suara menggunakan Web Speech API (Client-side)
// Atau bisa menggunakan API eksternal seperti Google TTS

async function generateVoiceWithAI(text, voice, speed, pitch) {
  // Karena di server-side kita tidak bisa langsung menggunakan Web Speech API
  // Kita akan gunakan pendekatan: generate suara melalui frontend
  
  // Untuk sekarang, kita return instruksi untuk menggunakan Web Speech API
  return {
    success: true,
    audioUrl: null,
    instructions: `Gunakan Web Speech API di browser untuk memutar suara: "${text.substring(0, 50)}..."`,
    text: text,
    voice: voice,
    speed: speed,
    pitch: pitch
  };
}

// ===================== API ROUTES =====================

export async function POST(request) {
  try {
    const { text, voice, speed, pitch } = await request.json();
    
    if (!text) {
      return NextResponse.json(
        { error: 'Teks diperlukan' },
        { status: 400 }
      );
    }

    // Generate voice instructions
    const result = await generateVoiceWithAI(text, voice || 'default', speed || 1, pitch || 1);
    
    return NextResponse.json({
      success: true,
      audioUrl: result.audioUrl,
      instructions: result.instructions,
      text: result.text,
      voice: result.voice,
      speed: result.speed,
      pitch: result.pitch,
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
