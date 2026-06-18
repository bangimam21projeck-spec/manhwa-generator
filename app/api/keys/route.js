import { NextResponse } from 'next/server';

let apiKeys = [];

function initKeys() {
  if (apiKeys.length === 0) {
    const envKeys = process.env.GEMINI_API_KEYS?.split(',') || [];
    if (envKeys.length > 0) {
      apiKeys = envKeys.map(k => k.trim()).filter(k => k.length > 0);
    }
  }
  return apiKeys;
}

export async function GET() {
  const keys = initKeys();
  return NextResponse.json({
    success: true,
    keys: keys,
    total: keys.length
  });
}

export async function POST(request) {
  try {
    const { action, key, index } = await request.json();
    const keys = initKeys();

    if (action === 'add') {
      if (!key || key.length < 10) {
        return NextResponse.json(
          { error: 'API Key tidak valid. Minimal 10 karakter.' },
          { status: 400 }
        );
      }
      
      if (keys.includes(key)) {
        return NextResponse.json(
          { error: 'API Key sudah terdaftar' },
          { status: 400 }
        );
      }

      keys.push(key);
      process.env.GEMINI_API_KEYS = keys.join(',');
      
      return NextResponse.json({
        success: true,
        keys: keys,
        message: 'API Key berhasil ditambahkan'
      });
      
    } else if (action === 'remove') {
      if (index === undefined || index < 0 || index >= keys.length) {
        return NextResponse.json(
          { error: 'Index tidak valid' },
          { status: 400 }
        );
      }

      keys.splice(index, 1);
      process.env.GEMINI_API_KEYS = keys.join(',');
      
      return NextResponse.json({
        success: true,
        keys: keys,
        message: 'API Key berhasil dihapus'
      });
      
    } else {
      return NextResponse.json(
        { error: 'Action tidak dikenal. Gunakan "add" atau "remove"' },
        { status: 400 }
      );
    }

  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
