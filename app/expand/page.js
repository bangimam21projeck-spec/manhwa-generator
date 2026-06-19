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

  // Upload gambar
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

  // Perluas gambar dengan AI
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

  // Download hasil
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            🖼️ Perluas Gambar dengan AI
          </h1>
          <p className="text-gray-600 mt-2">Upload gambar dan perluas background secara otomatis!</p>
          
          <div className="flex justify-center gap-4 mt-4 flex-wrap">
            <Link href="/" className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition text-sm">
              🏠 Beranda
            </Link>
            <Link href="/editor" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm">
              ✂️ Potong Panel
            </Link>
            <Link href="/expand" className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition text-sm">
              🖼️ Perluas Gambar
            </Link>
          </div>
        </div>

        {/* MAIN */}
        <div className="grid md:grid-cols-3 gap-6">
          
          {/* KOLOM KIRI: KONTROL */}
          <div className="space-y-6">
            
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-xl font-semibold mb-4">📤 Upload Gambar</h2>
              
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
              />
              
              <button
                className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition font-semibold"
                onClick={() => fileInputRef.current.click()}
              >
                📁 Pilih Gambar
              </button>
              
              <p className="text-xs text-gray-500 mt-2 text-center">
                Mendukung JPG, PNG, WebP
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-xl font-semibold mb-4">⚙️ Pengaturan Perluasan</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Arah Perluasan:
                  </label>
                  <select
                    value={expandDirection}
                    onChange={(e) => setExpandDirection(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  >
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ukuran Perluasan: {expandSize}%
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="200"
                    value={expandSize}
                    onChange={(e) => setExpandSize(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>10%</span>
                    <span>100%</span>
                    <span>200%</span>
                  </div>
                </div>
                
                <button
                  className="w-full bg-green-600 text-white py-3 rounded-xl hover:bg-green-700 transition font-semibold disabled:opacity-50"
                  onClick={handleExpand}
                  disabled={!image || loading}
                >
                  {loading ? '⏳ Memproses...' : '🚀 Perluas Gambar'}
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-xl font-semibold mb-4">📊 Status</h2>
              
              <div className="space-y-2 text-sm">
                <p className="text-gray-600">
                  <span className="font-semibold">Gambar:</span>{' '}
                  {image ? '✅ Terupload' : '⏳ Belum'}
                </p>
                <p className="text-gray-600">
                  <span className="font-semibold">Hasil:</span>{' '}
                  {expandedImage ? '✅ Selesai' : '⏳ Belum'}
                </p>
                {status && (
                  <div className={`p-2 rounded-lg text-xs ${
                    status.includes('✅') ? 'bg-green-100 text-green-700' :
                    status.includes('❌') ? 'bg-red-100 text-red-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {status}
                  </div>
                )}
              </div>
            </div>

            {expandedImage && (
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <button
                  className="w-full bg-yellow-600 text-white py-2 rounded-lg hover:bg-yellow-700 transition font-semibold"
                  onClick={downloadImage}
                >
                  💾 Download Hasil
                </button>
              </div>
            )}
          </div>

          {/* KOLOM KANAN: PREVIEW */}
          <div className="md:col-span-2 space-y-6">
            
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-xl font-semibold mb-4">🖼️ Preview</h2>
              
              {image && (
                <div className="border-2 border-gray-300 rounded-xl overflow-hidden bg-gray-50 p-4">
                  <p className="text-sm text-gray-500 mb-2">Gambar Asli:</p>
                  <img src={imageUrl} alt="Original" className="max-h-80 mx-auto object-contain" />
                </div>
              )}
              
              {expandedImage && (
                <div className="border-2 border-green-300 rounded-xl overflow-hidden bg-gray-50 p-4 mt-4">
                  <p className="text-sm text-green-500 mb-2">Hasil Perluasan:</p>
                  <img src={expandedImage} alt="Expanded" className="max-h-80 mx-auto object-contain" />
                </div>
              )}
              
              {!image && (
                <div className="text-center py-12 text-gray-400">
                  <p className="text-6xl mb-4">🖼️</p>
                  <p>Upload gambar untuk memulai perluasan</p>
                </div>
              )}
            </div>

            {/* INFO */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-xl font-semibold mb-4">ℹ️ Tentang Perluasan Gambar</h2>
              <div className="text-sm text-gray-600 space-y-2">
                <p>✨ Fitur ini menggunakan AI untuk memperluas background gambar secara otomatis.</p>
                <p>📐 Pilih arah perluasan (atas, bawah, kiri, kanan, atau semua arah).</p>
                <p>📏 Atur ukuran perluasan dari 10% hingga 200%.</p>
                <p>🎨 Hasil akan seamless dan natural seperti aslinya.</p>
                <div className="bg-yellow-50 p-3 rounded-lg mt-2">
                  <p className="text-xs text-yellow-700">
                    ⚠️ Fitur ini membutuhkan API Key Gemini yang valid. 
                    Pastikan Anda sudah menambahkan API Key di halaman Beranda.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center text-xs text-gray-400 border-t pt-4">
          <p>Manhwa Studio AI v3.0 - Perluas Gambar dengan AI</p>
        </div>
      </div>
    </div>
  );
}
