'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';

export default function ExpandPage() {
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [expandedImage, setExpandedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [expandDirection, setExpandDirection] = useState('all');
  const [expandSize, setExpandSize] = useState(50);
  const fileInputRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target.result);
        setImageUrl(event.target.result);
        setExpandedImage(null);
        setStatus('✅ Gambar berhasil diupload!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleExpand = async () => {
    if (!image) {
      alert('Upload gambar dulu!');
      return;
    }

    setLoading(true);
    setStatus('⏳ Memperluas gambar dengan AI...');

    try {
      const response = await fetch('/api/expand-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          image: image,
          direction: expandDirection,
          size: expandSize
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setExpandedImage(data.data);
        setStatus('✅ Gambar berhasil diperluas!');
      } else {
        setStatus('❌ Gagal: ' + data.error);
      }
    } catch (error) {
      setStatus('❌ Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadImage = () => {
    if (!expandedImage) {
      alert('Tidak ada gambar untuk diunduh!');
      return;
    }
    const link = document.createElement('a');
    link.download = 'expanded-image.png';
    link.href = expandedImage;
    link.click();
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] p-4">
      <div className="max-w-6xl mx-auto animate-fade-in">
        
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold gradient-text font-orbitron">🖼️ Perluas Gambar dengan AI</h1>
          <p className="text-gray-400 mt-2">Upload gambar dan perluas background secara otomatis!</p>
          
          <div className="flex justify-center gap-4 mt-4 flex-wrap">
            <Link href="/" className="glass hover:border-purple-500/30 px-4 py-2 rounded-lg text-sm text-gray-300 hover:text-white transition">🏠 Beranda</Link>
            <Link href="/editor" className="glass hover:border-blue-500/30 px-4 py-2 rounded-lg text-sm text-gray-300 hover:text-white transition">✂️ Potong Panel</Link>
            <Link href="/expand" className="glass hover:border-green-500/30 px-4 py-2 rounded-lg text-sm text-gray-300 hover:text-white transition">🖼️ Perluas Gambar</Link>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          
          <div className="space-y-6">
            <div className="glass rounded-2xl p-6 card-hover">
              <h2 className="text-xl font-bold text-white mb-4">📤 Upload Gambar</h2>
              <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
              <button className="w-full btn-primary" onClick={() => fileInputRef.current.click()}>📁 Pilih Gambar</button>
              <p className="text-xs text-gray-500 mt-2 text-center">Mendukung JPG, PNG, WebP</p>
            </div>

            <div className="glass rounded-2xl p-6 card-hover">
              <h2 className="text-xl font-bold text-white mb-4">⚙️ Pengaturan</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Arah Perluasan:</label>
                  <select value={expandDirection} onChange={(e) => setExpandDirection(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-purple-500/50 focus:outline-none">
                    <option value="all">Semua Arah</option>
                    <option value="top">Atas</option>
                    <option value="bottom">Bawah</option>
                    <option value="left">Kiri</option>
                    <option value="right">Kanan</option>
                    <option value="horizontal">Horizontal (Kiri + Kanan)</option>
                    <option value="vertical">Vertikal (Atas + Bawah)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Ukuran Perluasan: {expandSize}%</label>
                  <input type="range" min="10" max="200" value={expandSize} onChange={(e) => setExpandSize(Number(e.target.value))} className="w-full accent-purple-500" />
                </div>
                <button className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-semibold transition disabled:opacity-50" onClick={handleExpand} disabled={!image || loading}>{loading ? '⏳ Memproses...' : '🚀 Perluas Gambar'}</button>
              </div>
            </div>

            <div className="glass rounded-2xl p-6 card-hover">
              <h2 className="text-xl font-bold text-white mb-4">📊 Status</h2>
              <div className="space-y-2 text-sm">
                <p className="text-gray-400"><span className="font-semibold text-gray-300">Gambar:</span> {image ? '✅ Terupload' : '⏳ Belum'}</p>
                <p className="text-gray-400"><span className="font-semibold text-gray-300">Hasil:</span> {expandedImage ? '✅ Selesai' : '⏳ Belum'}</p>
                {status && <div className={`p-2 rounded-lg text-xs ${status.includes('✅') ? 'bg-green-500/20 text-green-400' : status.includes('❌') ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'}`}>{status}</div>}
              </div>
            </div>

            {expandedImage && (
              <div className="glass rounded-2xl p-6 card-hover">
                <button className="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-2 rounded-lg font-semibold transition" onClick={downloadImage}>💾 Download Hasil</button>
              </div>
            )}
          </div>

          <div className="md:col-span-2 space-y-6">
            <div className="glass rounded-2xl p-6 card-hover">
              <h2 className="text-xl font-bold text-white mb-4">🖼️ Preview</h2>
              {image && <div className="border border-white/10 rounded-xl overflow-hidden bg-black/30 p-4"><p className="text-sm text-gray-500 mb-2">Gambar Asli:</p><img src={imageUrl} alt="Original" className="max-h-80 mx-auto object-contain" /></div>}
              {expandedImage && <div className="border border-green-500/20 rounded-xl overflow-hidden bg-black/30 p-4 mt-4"><p className="text-sm text-green-400 mb-2">Hasil Perluasan:</p><img src={expandedImage} alt="Expanded" className="max-h-80 mx-auto object-contain" /></div>}
              {!image && <div className="text-center py-12 text-gray-500"><p className="text-6xl mb-4">🖼️</p><p>Upload gambar untuk memulai perluasan</p></div>}
            </div>

            <div className="glass rounded-2xl p-6 card-hover">
              <h2 className="text-xl font-bold text-white mb-4">ℹ️ Tentang Perluasan</h2>
              <div className="text-sm text-gray-400 space-y-2">
                <p>✨ Fitur ini menggunakan AI untuk memperluas background gambar secara otomatis.</p>
                <p>📐 Pilih arah dan ukuran perluasan sesuai kebutuhan.</p>
                <div className="bg-yellow-500/10 border border-yellow-500/20 p-3 rounded-lg mt-2"><p className="text-xs text-yellow-400">⚠️ Fitur ini membutuhkan API Key Gemini yang valid.</p></div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center text-xs text-gray-600 border-t border-white/5 pt-4">Manhwa Studio AI v3.0 - Perluas Gambar</div>
      </div>
    </div>
  );
}
