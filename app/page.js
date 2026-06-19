'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiKeys, setApiKeys] = useState([]);
  const [newKey, setNewKey] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    fetchKeys();
  }, []);

  const fetchKeys = async () => {
    try {
      const res = await fetch('/api/keys');
      const data = await res.json();
      if (data.success) {
        setApiKeys(data.keys);
      }
    } catch (error) {
      console.error('Error fetching keys:', error);
    }
  };

  const handleGenerate = async () => {
    if (!prompt) {
      alert('Masukkan deskripsi adegan manhwa!');
      return;
    }

    setLoading(true);
    setStatus('⏳ Sedang generate...');

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });

      const data = await response.json();

      if (data.success) {
        setResult(data.data);
        setStatus(`✅ Berhasil! Menggunakan ${data.meta.keyUsed}`);
        fetchKeys();
      } else {
        setStatus('❌ Gagal: ' + data.error);
      }
    } catch (error) {
      setStatus('❌ Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddKey = async () => {
    if (!newKey || newKey.length < 10) {
      alert('API Key tidak valid! Minimal 10 karakter.');
      return;
    }

    try {
      const response = await fetch('/api/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add', key: newKey })
      });

      const data = await response.json();
      if (data.success) {
        setApiKeys(data.keys);
        setNewKey('');
        alert('✅ API Key berhasil ditambahkan!');
      }
    } catch (error) {
      alert('Gagal menambah key: ' + error.message);
    }
  };

  const handleDeleteKey = async (index) => {
    if (!confirm('Hapus API Key ini?')) return;

    try {
      const response = await fetch('/api/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'remove', index })
      });

      const data = await response.json();
      if (data.success) {
        setApiKeys(data.keys);
        alert('✅ API Key dihapus!');
      }
    } catch (error) {
      alert('Gagal hapus key: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER + NAVIGASI */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            🎨 MANHWA STUDIO AI
          </h1>
          <p className="text-gray-600 mt-2">Buat komik manhwa dengan AI, upload gambar, dan potong panel!</p>
          
          {/* NAVIGASI MENU */}
          <div className="flex justify-center gap-4 mt-4 flex-wrap">
            <Link href="/" className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition text-sm">
              🏠 Beranda
            </Link>
            <Link href="/editor" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm">
              ✂️ Editor Panel
            </Link>
            <a href="#api" className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition text-sm">
              🔑 API Keys
            </a>
          </div>
        </div>

        {/* GRID UTAMA */}
        <div className="grid md:grid-cols-3 gap-6">
          
          {/* KOLOM KIRI: GENERATE */}
          <div className="md:col-span-2 space-y-6">
            
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-xl font-semibold mb-4">📝 Generate Cerita Manhwa</h2>
              
              <textarea
                className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                rows="5"
                placeholder="Contoh: 'Seorang pahlawan wanita dengan pedang bercahaya sedang melawan naga di atas puncak gunung. Latar belakang langit malam dengan bintang gemerlap.'"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
              
              <button
                className="mt-4 w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-xl hover:opacity-90 transition font-semibold disabled:opacity-50"
                onClick={handleGenerate}
                disabled={loading || !prompt}
              >
                {loading ? '⏳ Generating...' : '🚀 Generate Sekarang'}
              </button>

              {status && (
                <div className={`mt-4 p-3 rounded-xl text-sm ${
                  status.includes('✅') ? 'bg-green-100 text-green-700' :
                  status.includes('❌') ? 'bg-red-100 text-red-700' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  {status}
                </div>
              )}
            </div>

            {result && (
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h2 className="text-xl font-semibold mb-4">📖 Hasil Generate</h2>
                <div className="bg-gray-50 rounded-xl p-4 whitespace-pre-wrap text-gray-700 leading-relaxed max-h-96 overflow-y-auto">
                  {result}
                </div>
                <button
                  className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm"
                  onClick={() => navigator.clipboard.writeText(result)}
                >
                  📋 Copy Teks
                </button>
              </div>
            )}
          </div>

          {/* KOLOM KANAN: API KEYS */}
          <div className="space-y-6" id="api">
            
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-xl font-semibold mb-4">🔄 Status Rotasi</h2>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Kunci Terdaftar:</span>
                  <span className="font-semibold">{apiKeys.length} Key</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Mode Berjalan:</span>
                  <span className="font-semibold text-green-600">ROUND ROBIN</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="font-semibold text-blue-600">
                    {apiKeys.length > 0 ? '✅ Aktif' : '⚠️ Tidak ada key'}
                  </span>
                </div>
              </div>

              <div className="mt-4 border-t pt-4">
                <p className="text-xs text-gray-500">💡 Sistem menggunakan key secara bergantian (Round Robin) untuk stabilitas</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-xl font-semibold mb-4">🔑 Daftar API Key</h2>
              
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {apiKeys.length === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-4">
                    Belum ada API Key terdaftar
                  </p>
                ) : (
                  apiKeys.map((key, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded-lg">
                      <span className="text-xs font-mono truncate max-w-[150px]">
                        {key.substring(0, 15)}...
                      </span>
                      <div className="flex gap-2">
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                          Key {index + 1}
                        </span>
                        <button
                          onClick={() => handleDeleteKey(index)}
                          className="text-red-500 hover:text-red-700 text-xs"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-xl font-semibold mb-4">➕ Tambah API Key Baru</h2>
              
              <input
                type="text"
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                placeholder="Masukkan API Key (AQ. atau AIxAy...)"
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
              />
              
              <button
                className="mt-3 w-full bg-green-600 text-white py-2 rounded-xl hover:bg-green-700 transition font-semibold disabled:opacity-50"
                onClick={handleAddKey}
                disabled={!newKey}
              >
                Tambah Kunci
              </button>

              <p className="text-xs text-gray-500 mt-2">
                📌 Dapatkan API Key di 
                <a href="https://aistudio.google.com" target="_blank" className="text-blue-600 hover:underline ml-1" rel="noreferrer">
                  Google AI Studio
                </a>
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center text-xs text-gray-400 border-t pt-4">
          <p>Manhwa Studio AI v2.0 - Menggunakan Google Gemini AI</p>
          <p className="mt-1">Sistem rotasi API key untuk penggunaan tanpa hambatan</p>
        </div>
      </div>
    </div>
  );
}
