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

export function addWebKey(key) {
  if (!webApiKeys.includes(key)) webApiKeys.push(key);
  return webApiKeys;
}

export function removeWebKey(index) {
  if (index >= 0 && index < webApiKeys.length) webApiKeys.splice(index, 1);
  return webApiKeys;
}

export function getWebKeys() { return webApiKeys; }

// ===== GENERATE =====
async function generateNovel(prompt) {
  const apiKey = getNextKey();
  
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
    
  } catch (error) {
    console.error('Error generate novel:', error);
    throw new Error('Gagal generate: ' + error.message);
  }
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

    const result = await generateNovel(prompt);
    const allKeys = getAllKeys();
    const totalKeys = allKeys.length;

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
  const allKeys = getAllKeys();
  return NextResponse.json({
    success: true,
    keys: allKeys,
    total: allKeys.length,
    active: allKeys.length > 0
  });
}
