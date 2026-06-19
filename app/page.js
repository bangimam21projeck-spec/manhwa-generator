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
    <div className="min-h-screen bg-[#0a0a0f] p-4">
      <div className="max-w-6xl mx-auto animate-fade-in">
        
        {/* HEADER */}
        <div className="text-center mb-10">
          <h1 className="text-5xl font-extrabold gradient-text font-orbitron">
            🎨 MANHWA STUDIO AI
          </h1>
          <p className="text-gray-400 mt-3 text-lg">
            Buat komik manhwa dengan AI, potong panel otomatis, dan ekspor!
          </p>
        </div>

        {/* MENU NAVIGASI - GLASS CARD */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
          <Link href="/" className="glass hover:border-purple-500/30 transition-all duration-300 p-4 rounded-xl text-center group card-hover">
            <div className="text-2xl mb-1">🏠</div>
            <div className="text-sm font-semibold text-gray-200 group-hover:text-white">Beranda</div>
          </Link>
          <Link href="/editor" className="glass hover:border-blue-500/30 transition-all duration-300 p-4 rounded-xl text-center group card-hover">
            <div className="text-2xl mb-1">✂️</div>
            <div className="text-sm font-semibold text-gray-200 group-hover:text-white">Potong Panel</div>
          </Link>
          <Link href="/expand" className="glass hover:border-green-500/30 transition-all duration-300 p-4 rounded-xl text-center group card-hover">
            <div className="text-2xl mb-1">🖼️</div>
            <div className="text-sm font-semibold text-gray-200 group-hover:text-white">Perluas Gambar</div>
          </Link>
          <Link href="/voice" className="glass hover:border-yellow-500/30 transition-all duration-300 p-4 rounded-xl text-center group card-hover">
            <div className="text-2xl mb-1">🎙️</div>
            <div className="text-sm font-semibold text-gray-200 group-hover:text-white">Suara AI</div>
          </Link>
          <Link href="#api" className="glass hover:border-pink-500/30 transition-all duration-300 p-4 rounded-xl text-center group card-hover">
            <div className="text-2xl mb-1">🔑</div>
            <div className="text-sm font-semibold text-gray-200 group-hover:text-white">Kunci API</div>
          </Link>
        </div>

        {/* GRID UTAMA */}
        <div className="grid md:grid-cols-3 gap-6">
          
          {/* KOLOM KIRI: INFO */}
          <div className="md:col-span-2 space-y-6">
            
            <div className="glass rounded-2xl p-8 card-hover">
              <h2 className="text-2xl font-bold text-white mb-4">📖 Selamat Datang</h2>
              <p className="text-gray-300 leading-relaxed">
                Studio lengkap untuk membuat komik manhwa dengan bantuan AI. 
                Upload gambar panjang, potong otomatis menjadi panel, tambahkan naskah, 
                dan ekspor hasilnya!
              </p>
              
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="bg-purple-500/10 border border-purple-500/20 p-4 rounded-xl">
                  <p className="text-2xl">✂️</p>
                  <p className="font-semibold text-sm text-white">Auto Potong</p>
                  <p className="text-xs text-gray-400">Potong gambar horizontal otomatis</p>
                </div>
                <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl">
                  <p className="text-2xl">📦</p>
                  <p className="font-semibold text-sm text-white">Ekspor ZIP</p>
                  <p className="text-xs text-gray-400">Download semua panel</p>
                </div>
                <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-xl">
                  <p className="text-2xl">🤖</p>
                  <p className="font-semibold text-sm text-white">Naskah AI</p>
                  <p className="text-xs text-gray-400">Generate dialog per panel</p>
                </div>
                <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-xl">
                  <p className="text-2xl">🎬</p>
                  <p className="font-semibold text-sm text-white">Video Rekap</p>
                  <p className="text-xs text-gray-400">Jadi video YouTube</p>
                </div>
              </div>
            </div>
          </div>

          {/* KOLOM KANAN: API KEYS */}
          <div className="space-y-6" id="api">
            
            <div className="glass rounded-2xl p-6 card-hover">
              <h2 className="text-xl font-bold text-white mb-4">🔄 Status</h2>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Kunci Terdaftar:</span>
                  <span className="font-semibold text-white">{apiKeys.length} Key</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Mode Berjalan:</span>
                  <span className="font-semibold text-purple-400">ROUND ROBIN</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Status:</span>
                  <span className={`font-semibold ${apiKeys.length > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {apiKeys.length > 0 ? '✅ Aktif' : '⚠️ Tidak ada key'}
                  </span>
                </div>
              </div>
            </div>

            <div className="glass rounded-2xl p-6 card-hover">
              <h2 className="text-xl font-bold text-white mb-4">🔑 Daftar Key</h2>
              
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {apiKeys.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-4">
                    Belum ada API Key
                  </p>
                ) : (
                  apiKeys.map((key, index) => (
                    <div key={index} className="flex items-center justify-between bg-white/5 p-2 rounded-lg border border-white/5">
                      <span className="text-xs font-mono text-gray-300 truncate max-w-[120px]">
                        {key.substring(0, 15)}...
                      </span>
                      <div className="flex gap-2">
                        <span className="badge-purple">Key {index + 1}</span>
                        <button
                          onClick={() => handleDeleteKey(index)}
                          className="text-red-400 hover:text-red-300 text-xs"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="glass rounded-2xl p-6 card-hover">
              <h2 className="text-xl font-bold text-white mb-4">➕ Tambah Kunci</h2>
              
              <input
                type="text"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-purple-500/50 focus:outline-none transition-all"
                placeholder="Masukkan API Key"
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
              />
              
              <button
                className="mt-3 w-full btn-primary"
                onClick={handleAddKey}
                disabled={!newKey}
              >
                Tambah Kunci
              </button>

              <p className="text-xs text-gray-500 mt-2 text-center">
                <a href="https://aistudio.google.com" target="_blank" className="text-purple-400 hover:text-purple-300" rel="noreferrer">
                  Dapatkan di Google AI Studio →
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="mt-10 text-center text-xs text-gray-600 border-t border-white/5 pt-4">
          <p>Manhwa Studio AI v3.0 - Auto Potong Panel & Video Rekap</p>
        </div>
      </div>
    </div>
  );
}
