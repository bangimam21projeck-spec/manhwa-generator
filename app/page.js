'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Home() {
  const [apiKeys, setApiKeys] = useState([]);
  const [newKey, setNewKey] = useState('');

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
        
        {/* HEADER */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            🎨 MANHWA STUDIO AI
          </h1>
          <p className="text-gray-600 mt-2">Buat komik manhwa dengan AI, potong panel otomatis, dan ekspor!</p>
        </div>

        {/* MENU NAVIGASI */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Link href="/" className="bg-purple-600 text-white p-4 rounded-xl text-center hover:bg-purple-700 transition">
            🏠 Beranda
          </Link>
          <Link href="/editor" className="bg-blue-600 text-white p-4 rounded-xl text-center hover:bg-blue-700 transition">
            ✂️ Potong Panel
          </Link>
          <Link href="/expand" className="bg-green-600 text-white p-4 rounded-xl text-center hover:bg-green-700 transition">
            🖼️ Perluas Gambar
          </Link>
          <Link href="/voice" className="bg-yellow-600 text-white p-4 rounded-xl text-center hover:bg-yellow-700 transition">
            🎙️ Suara AI
          </Link>
          <Link href="#api" className="bg-red-600 text-white p-4 rounded-xl text-center hover:bg-red-700 transition">
            🔑 Kunci API
          </Link>
        </div>

        {/* GRID UTAMA */}
        <div className="grid md:grid-cols-3 gap-6">
          
          {/* KOLOM KIRI: INFO */}
          <div className="md:col-span-2 space-y-6">
            
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-2xl font-bold mb-4">📖 Selamat Datang di Manhwa Studio AI</h2>
              <p className="text-gray-600 leading-relaxed">
                Studio lengkap untuk membuat komik manhwa dengan bantuan AI. 
                Upload gambar panjang, potong otomatis menjadi panel, tambahkan naskah, 
                dan ekspor hasilnya!
              </p>
              
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="bg-purple-50 p-4 rounded-xl">
                  <p className="text-2xl">✂️</p>
                  <p className="font-semibold text-sm">Auto Potong</p>
                  <p className="text-xs text-gray-500">Potong gambar horizontal otomatis</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-xl">
                  <p className="text-2xl">📦</p>
                  <p className="font-semibold text-sm">Ekspor ZIP</p>
                  <p className="text-xs text-gray-500">Download semua panel</p>
                </div>
                <div className="bg-green-50 p-4 rounded-xl">
                  <p className="text-2xl">🤖</p>
                  <p className="font-semibold text-sm">Naskah AI</p>
                  <p className="text-xs text-gray-500">Generate dialog per panel</p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-xl">
                  <p className="text-2xl">🎬</p>
                  <p className="font-semibold text-sm">Video Rekap</p>
                  <p className="text-xs text-gray-500">Jadi video YouTube</p>
                </div>
              </div>
            </div>
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
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-xl font-semibold mb-4">🔑 Daftar API Key</h2>
              
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {apiKeys.length === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-4">
                    Belum ada API Key
                  </p>
                ) : (
                  apiKeys.map((key, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded-lg">
                      <span className="text-xs font-mono truncate max-w-[120px]">
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
              <h2 className="text-xl font-semibold mb-4">➕ Tambah API Key</h2>
              
              <input
                type="text"
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 text-sm"
                placeholder="Masukkan API Key"
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
              />
              
              <button
                className="mt-3 w-full bg-green-600 text-white py-2 rounded-xl hover:bg-green-700 transition font-semibold"
                onClick={handleAddKey}
                disabled={!newKey}
              >
                Tambah Kunci
              </button>

              <p className="text-xs text-gray-500 mt-2 text-center">
                <a href="https://aistudio.google.com" target="_blank" className="text-blue-600 hover:underline" rel="noreferrer">
                  Dapatkan di Google AI Studio
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="mt-8 text-center text-xs text-gray-400 border-t pt-4">
          <p>Manhwa Studio AI v3.0 - Auto Potong Panel & Video Rekap</p>
        </div>
      </div>
    </div>
  );
}
