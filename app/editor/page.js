'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';

export default function EditorPage() {
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [panels, setPanels] = useState([]);
  const [panelCount, setPanelCount] = useState(4);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [naskah, setNaskah] = useState('');
  const [selectedPanel, setSelectedPanel] = useState(null);
  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);

  // Upload gambar
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          setImage(img);
          setImageUrl(event.target.result);
          setPanels([]);
          setNaskah('');
          setStatus('✅ Gambar berhasil diupload! Atur jumlah panel lalu klik "Potong Otomatis"');
          renderCanvas(img);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  // Render canvas dengan gambar
  const renderCanvas = (img, cutLines = []) => {
    const canvas = canvasRef.current;
    if (!canvas || !img) return;
    const ctx = canvas.getContext('2d');
    
    const maxWidth = 800;
    let width = img.width;
    let height = img.height;
    
    if (width > maxWidth) {
      const ratio = maxWidth / width;
      width = maxWidth;
      height = height * ratio;
    }
    
    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(img, 0, 0, width, height);
    
    // Gambar garis potong
    if (cutLines.length > 0) {
      cutLines.forEach(y => {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.strokeStyle = '#ff0000';
        ctx.lineWidth = 2;
        ctx.setLineDash([8, 8]);
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Label panel
        const index = cutLines.indexOf(y);
        ctx.fillStyle = 'rgba(255, 0, 0, 0.8)';
        ctx.font = '14px Arial';
        ctx.fillText(`Panel ${index + 1}`, 10, y - 10);
      });
    }
  };

  // AUTO POTONG HORIZONTAL
  const handleAutoCut = () => {
    if (!image) {
      alert('Upload gambar dulu!');
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const panelHeight = imgHeight / panelCount;

    // Hitung posisi potong
    const cutPositions = [];
    for (let i = 1; i < panelCount; i++) {
      cutPositions.push(i * panelHeight);
    }

    // Potong gambar per panel
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    const panelImages = [];

    for (let i = 0; i < panelCount; i++) {
      const startY = i * panelHeight;
      const endY = (i + 1) * panelHeight;
      
      tempCanvas.width = imgWidth;
      tempCanvas.height = panelHeight;
      tempCtx.drawImage(
        canvas,
        0, startY, imgWidth, panelHeight,
        0, 0, imgWidth, panelHeight
      );
      
      panelImages.push({
        index: i + 1,
        dataUrl: tempCanvas.toDataURL('image/png'),
        width: imgWidth,
        height: panelHeight
      });
    }

    setPanels(panelImages);
    renderCanvas(image, cutPositions);
    setStatus(`✅ Berhasil! ${panelCount} panel terpotong. Klik panel untuk generate naskah.`);
  };

  // Generate naskah AI per panel
  const generateNaskah = async (panelIndex) => {
    setLoading(true);
    setStatus(`⏳ Generate naskah untuk Panel ${panelIndex}...`);

    try {
      const response = await fetch('/api/generate-naskah', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          panelIndex: panelIndex,
          totalPanels: panelCount
        })
      });

      const data = await response.json();
      if (data.success) {
        setNaskah(data.data);
        setStatus(`✅ Naskah Panel ${panelIndex} selesai!`);
      } else {
        setStatus('❌ Gagal: ' + data.error);
      }
    } catch (error) {
      setStatus('❌ Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Download ZIP semua panel
  const downloadZip = async () => {
    if (panels.length === 0) {
      alert('Tidak ada panel! Potong gambar dulu.');
      return;
    }

    setLoading(true);
    setStatus('⏳ Menyiapkan ZIP...');

    try {
      const response = await fetch('/api/create-zip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ panels: panels })
      });

      const data = await response.json();
      if (data.success) {
        window.open(data.url, '_blank');
        setStatus('✅ ZIP berhasil diunduh!');
      } else {
        setStatus('❌ Gagal: ' + data.error);
      }
    } catch (error) {
      setStatus('❌ Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Download naskah TXT
  const downloadNaskah = () => {
    if (!naskah) {
      alert('Generate naskah dulu!');
      return;
    }

    const blob = new Blob([naskah], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'naskah-manhwa.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Pilih panel untuk generate naskah
  const handlePanelClick = (panel) => {
    setSelectedPanel(panel);
    generateNaskah(panel.index);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            ✂️ Potong Panel Otomatis
          </h1>
          <p className="text-gray-600 mt-2">Upload gambar panjang, atur jumlah panel, dan potong otomatis!</p>
          
          <div className="flex justify-center gap-4 mt-4 flex-wrap">
            <Link href="/" className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition text-sm">
              🏠 Beranda
            </Link>
            <Link href="/editor" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm">
              ✂️ Editor Panel
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
                📁 Pilih Gambar Panjang
              </button>
              
              <p className="text-xs text-gray-500 mt-2 text-center">
                Mendukung JPG, PNG, WebP (Gambar vertikal/webtoon)
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-xl font-semibold mb-4">⚙️ Pengaturan</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Jumlah Panel:
                  </label>
                  <input
                    type="number"
                    min="2"
                    max="20"
                    value={panelCount}
                    onChange={(e) => setPanelCount(Number(e.target.value))}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                  <p className="text-xs text-gray-400 mt-1">Gambar akan dibagi rata menjadi {panelCount} panel</p>
                </div>
                
                <button
                  className="w-full bg-red-600 text-white py-3 rounded-xl hover:bg-red-700 transition font-semibold disabled:opacity-50"
                  onClick={handleAutoCut}
                  disabled={!image}
                >
                  ✂️ Potong Otomatis
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-xl font-semibold mb-4">📦 Ekspor</h2>
              
              <div className="space-y-2">
                <button
                  className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition text-sm disabled:opacity-50"
                  onClick={downloadZip}
                  disabled={panels.length === 0 || loading}
                >
                  📦 Unduh ZIP (Semua Panel)
                </button>
                
                <button
                  className="w-full bg-yellow-600 text-white py-2 rounded-lg hover:bg-yellow-700 transition text-sm disabled:opacity-50"
                  onClick={downloadNaskah}
                  disabled={!naskah}
                >
                  📝 Unduh Naskah (TXT)
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
                  <span className="font-semibold">Panel:</span>{' '}
                  {panels.length} potongan
                </p>
                <p className="text-gray-600">
                  <span className="font-semibold">Naskah:</span>{' '}
                  {naskah ? '✅ Ada' : '⏳ Belum'}
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
          </div>

          {/* KOLOM KANAN: CANVAS + PANEL */}
          <div className="md:col-span-2 space-y-6">
            
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-xl font-semibold mb-4">🖼️ Preview Gambar</h2>
              
              <div className="border-2 border-gray-300 rounded-xl overflow-hidden bg-gray-50">
                <canvas
                  ref={canvasRef}
                  className="w-full h-auto"
                />
              </div>
              
              {!image && (
                <div className="text-center py-4 text-gray-400">
                  <p>Upload gambar untuk mulai memotong</p>
                </div>
              )}
            </div>

            {/* HASIL PANEL */}
            {panels.length > 0 && (
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h2 className="text-xl font-semibold mb-4">
                  📋 Hasil Potongan ({panels.length} Panel)
                  <span className="text-sm font-normal text-gray-500 ml-2">
                    Klik panel untuk generate naskah
                  </span>
                </h2>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {panels.map((panel, index) => (
                    <div
                      key={index}
                      className={`border-2 rounded-xl overflow-hidden cursor-pointer transition ${
                        selectedPanel?.index === panel.index
                          ? 'border-purple-600 shadow-lg'
                          : 'border-gray-200 hover:border-purple-400'
                      }`}
                      onClick={() => handlePanelClick(panel)}
                    >
                      <img
                        src={panel.dataUrl}
                        alt={`Panel ${panel.index}`}
                        className="w-full h-auto"
                      />
                      <div className="bg-gray-50 p-2 text-center text-sm font-semibold">
                        Panel {panel.index}
                        {selectedPanel?.index === panel.index && ' ✅'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* NASKAH */}
            {naskah && (
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h2 className="text-xl font-semibold mb-4">
                  📝 Naskah Panel {selectedPanel?.index || ''}
                </h2>
                <div className="bg-gray-50 rounded-xl p-4 whitespace-pre-wrap text-gray-700 leading-relaxed max-h-60 overflow-y-auto text-sm">
                  {naskah}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 text-center text-xs text-gray-400 border-t pt-4">
          <p>Manhwa Studio AI v3.0 - Auto Potong Panel Horizontal</p>
        </div>
      </div>
    </div>
  );
}
