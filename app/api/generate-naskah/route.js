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

// ===================== GENERATE NASKAH =====================

async function generateNaskah(panelIndex, totalPanels) {
  const apiKey = getNextKey();
  
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Kamu adalah penulis komik manhwa profesional. Buatkan naskah dialog dan narasi untuk Panel ${panelIndex} dari total ${totalPanels} panel.

Format output:
1. Narasi (jika ada)
2. Dialog karakter (dengan nama karakter)
3. Ekspresi/aksi yang terjadi

Gaya: Dramatis dan puitis, seperti manhwa Korea modern.

Contoh format:
[Narasi: Suasana malam yang gelap menyelimuti kota...]
Karakter A: "Kau pikir kau bisa lolos?"
Karakter B: "Aku sudah menunggumu..."

Buat naskah yang menarik dan sesuai dengan konteks panel ${panelIndex} dari ${totalPanels} panel.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
    
  } catch (error) {
    console.error('Error generate naskah:', error);
    throw new Error('Gagal generate naskah: ' + error.message);
  }
}

// ===================== API ROUTES =====================

export async function POST(request) {
  try {
    const { panelIndex, totalPanels } = await request.json();
    
    if (!panelIndex || !totalPanels) {
      return NextResponse.json(
        { error: 'Panel index dan total panel diperlukan' },
        { status: 400 }
      );
    }

    const result = await generateNaskah(panelIndex, totalPanels);
    const allKeys = getAllKeys();
    const totalKeys = allKeys.length;
    const usedIndex = (currentIndex === 0 ? totalKeys : currentIndex);

    return NextResponse.json({
      success: true,
      data: result,
      meta: {
        panel: panelIndex,
        total: totalPanels,
        keyUsed: `Key ${usedIndex} dari ${totalKeys}`,
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
    active: allKeys.length > 0
  });
}
