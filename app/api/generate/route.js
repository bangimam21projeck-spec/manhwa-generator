import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

let apiKeys = [];

function initKeys() {
  if (apiKeys.length === 0) {
    const envKeys = process.env.GEMINI_API_KEYS?.split(',') || [];
    if (envKeys.length > 0) {
      apiKeys = envKeys.map(k => k.trim()).filter(k => k.startsWith('AIxAy'));
    }
  }
  return apiKeys;
}

let currentIndex = 0;
function getNextKey() {
  const keys = initKeys();
  if (keys.length === 0) {
    throw new Error('Tidak ada API Key yang tersedia!');
  }
  const key = keys[currentIndex];
  currentIndex = (currentIndex + 1) % keys.length;
  return key;
}

async function generateManhwa(prompt) {
  const apiKey = getNextKey();
  
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    const fullPrompt = `Kamu adalah pembuat komik manhwa profesional. Buatkan cerita komik manhwa berdasarkan deskripsi berikut:

DESKRIPSI: ${prompt}

Format output:
1. Berikan judul untuk komik ini
2. Buat 4-6 panel cerita
3. Setiap panel berisi:
   - Deskripsi visual (karakter, ekspresi, latar, aksi)
   - Dialog atau narasi
   - Sudut pandang kamera (close-up, long shot, dll)

Gaya: Manhwa Korea modern dengan warna vibrant, karakter ekspresif dengan mata besar dan detail rambut.

Output dalam bahasa Indonesia yang natural dan mudah dibaca.`;

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    return response.text();
    
  } catch (error) {
    console.error('Error generate:', error);
    throw new Error('Gagal generate: ' + error.message);
  }
}

export async function POST(request) {
  try {
    const { prompt } = await request.json();
    
    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt diperlukan' },
        { status: 400 }
      );
    }

    const result = await generateManhwa(prompt);
    const totalKeys = initKeys().length;

    return NextResponse.json({
      success: true,
      data: result,
      meta: {
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
  const keys = initKeys();
  return NextResponse.json({
    success: true,
    keys: keys,
    total: keys.length,
    active: keys.length > 0
  });
}
