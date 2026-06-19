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
  
  // ===== FITUR MANUAL CUT =====
  const [cutLines, setCutLines] = useState([]); // posisi Y dari garis potong
  const [isManualMode, setIsManualMode] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  
  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);
  const imageRef = useRef(null);

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
          setCutLines([]);
          setStatus('✅ Gambar berhasil diupload!');
          renderCanvas(img, []);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  // Render canvas
  const renderCanvas = (img, lines = null) => {
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
    const linesToDraw = lines !== null ? lines : cutLines;
    linesToDraw.forEach(y => {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.strokeStyle = '#ff0000';
      ctx.lineWidth = 3;
      ctx.setLineDash([8, 8]);
      ctx.stroke();
      ctx.setLineDash([]);
      
      // Label
      const index = linesToDraw.indexOf(y);
      ctx.fillStyle = 'rgba(255, 0, 0, 0.9)';
      ctx.font = 'bold 14px Arial';
      ctx.fillText(`✂️ Panel ${index + 1}`, 10, y - 10);
    });

    // Info jumlah garis
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = '12px Arial';
    ctx.fillText(`Garis potong: ${linesToDraw.length}`, 10, 20);
  };

  // ===== MANUAL CUT: KLIK DI CANVAS =====
  const handleCanvasClick = (e) => {
    if (!isManualMode || !image) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    // Cek apakah sudah ada garis di posisi ini (toleransi 5px)
    const exists = cutLines.some(line => Math.abs(line - y) < 5);
    if (exists) {
      setStatus('⚠️ Sudah ada garis di posisi ini!');
      return;
    }
    
    // Tambahkan garis baru
    const newLines = [...cutLines, y].sort((a, b) => a - b);
    setCutLines(newLines);
    renderCanvas(image, newLines);
    setStatus(`✅ Garis potong ditambahkan di Y: ${Math.round(y)}px (Total: ${newLines.length} garis)`);
  };

  // ===== HAPUS SEMUA GARIS =====
  const clearCutLines = () => {
    setCutLines([]);
    setPanels([]);
    if (image) {
      renderCanvas(image, []);
    }
    setStatus('🗑️ Semua garis potong dihapus');
  };

  // ===== HAPUS GARIS TERAKHIR =====
  const undoLastLine = () => {
    if (cutLines.length === 0) {
      alert('Tidak ada garis untuk di-undo!');
      return;
    }
    const newLines = cutLines.slice(0, -1);
    setCutLines(newLines);
    renderCanvas(image, newLines);
    setStatus(`↩️ Garis terakhir dihapus (Sisa: ${newLines.length} garis)`);
  };

  // ===== AUTO CUT =====
  const handleAutoCut = () => {
    if (!image) {
      alert('Upload gambar dulu!');
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    // Hapus garis manual dulu
    setCutLines([]);

    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const panelHeight = imgHeight / panelCount;

    const cutPositions = [];
    for (let i = 1; i < panelCount; i++) {
      cutPositions.push(i * panelHeight);
    }

    // Tampilkan garis otomatis di canvas
    renderCanvas(image, cutPositions);
    setCutLines(cutPositions);
    setStatus(`✂️ Auto cut: ${panelCount} panel siap dipotong! Klik "Eksekusi Potong"`);

    // Simpan posisi untuk dipotong nanti
    window._cutPositions = cutPositions;
  };

  // ===== EKSEKUSI POTONG (Manual & Auto) =====
  const executeCut = () => {
    if (!image) {
      alert('Upload gambar dulu!');
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const lines = cutLines.length > 0 ? cutLines : window._cutPositions || [];
    
    if (lines.length === 0) {
      alert('Tidak ada garis potong! Buat garis manual atau auto cut dulu.');
      return;
    }

    const imgWidth = canvas.width;
    const imgHeight = canvas.height;

    // Urutkan garis dari atas ke bawah
    const sortedLines = [...lines].sort((a, b) => a - b);
    
    // Tambahkan batas atas (0) dan bawah (imgHeight)
    const allBoundaries = [0, ...sortedLines, imgHeight];
    
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    const panelImages = [];

    for (let i = 0; i < allBoundaries.length - 1; i++) {
      const startY = allBoundaries[i];
      const endY = allBoundaries[i + 1];
      const panelHeight = endY - startY;
      
      if (panelHeight < 10) continue; // skip jika terlalu kecil
      
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
        height: panelHeight,
        startY: startY,
        endY: endY
      });
    }

    setPanels(panelImages);
    setStatus(`✅ Berhasil! ${panelImages.length} panel terpotong.`);
  };

  // ===== GENERATE NASKAH =====
  const generateNaskah = async (panelIndex) => {
    setLoading(true);
    setStatus(`⏳ Generate naskah untuk Panel ${panelIndex}...`);

    try {
      const response = await fetch('/api/generate-naskah', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          panelIndex: panelIndex,
          totalPanels: panels.length || cutLines.length + 1
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

  // ===== DOWNLOAD ZIP =====
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

  // ===== DOWNLOAD NASKAH =====
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

  const handlePanelClick = (panel) => {
    setSelectedPanel(panel);
    generateNaskah(panel.index);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] p-4">
      <div className="max-w-6xl mx-auto animate-fade-in">
        
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold gradient-text font-orbitron">✂️ Potong Panel</h1>
          <p className="text-gray-400 mt-2">Upload gambar, buat garis potong manual atau otomatis!</p>
          
          <div className="flex justify-center gap-4 mt-4 flex-wrap">
            <Link href="/" className="glass hover:border-purple-500/30 px-4 py-2 rounded-lg text-sm text-gray-300 hover:text-white transition">🏠 Beranda</Link>
            <Link href="/editor" className="glass hover:border-blue-500/30 px-4 py-2 rounded-lg text-sm text-gray-300 hover:text-white transition">✂️ Editor Panel</Link>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          
          {/* KOLOM KIRI: KONTROL */}
          <div className="space-y-6">
            
            <div className="glass rounded-2xl p-6 card-hover">
              <h2 className="text-xl font-bold text-white mb-4">📤 Upload Gambar</h2>
              <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
              <button className="w-full btn-primary" onClick={() => fileInputRef.current.click()}>📁 Pilih Gambar Panjang</button>
              <p className="text-xs text-gray-500 mt-2 text-center">Mendukung JPG, PNG, WebP</p>
            </div>

            {/* MODE POTONG */}
            <div className="glass rounded-2xl p-6 card-hover">
              <h2 className="text-xl font-bold text-white mb-4">🔧 Mode Potong</h2>
              
              <div className="space-y-3">
                <button
                  className={`w-full py-2 rounded-lg font-semibold transition ${
                    isManualMode 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }`}
                  onClick={() => setIsManualMode(!isManualMode)}
                >
                  {isManualMode ? '✅ Mode Manual Aktif' : '✋ Mode Manual (Klik Gambar)'}
                </button>
                
                {isManualMode && (
                  <div className="bg-purple-500/10 border border-purple-500/20 p-3 rounded-lg">
                    <p className="text-xs text-purple-300">💡 Klik pada gambar untuk menambahkan garis potong horizontal.</p>
                    <p className="text-xs text-purple-300 mt-1">Garis akan muncul di posisi klik Anda.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="glass rounded-2xl p-6 card-hover">
              <h2 className="text-xl font-bold text-white mb-4">⚙️ Pengaturan</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Jumlah Panel (Auto):</label>
                  <input 
                    type="number" 
                    min="2" 
                    max="20" 
                    value={panelCount} 
                    onChange={(e) => setPanelCount(Number(e.target.value))} 
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-purple-500/50 focus:outline-none" 
                  />
                  <p className="text-xs text-gray-500 mt-1">Gambar akan dibagi rata menjadi {panelCount} panel</p>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    className="bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition text-sm disabled:opacity-50" 
                    onClick={handleAutoCut} 
                    disabled={!image}
                  >
                    ✂️ Auto Cut
                  </button>
                  <button 
                    className="bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-semibold transition text-sm disabled:opacity-50" 
                    onClick={executeCut} 
                    disabled={!image || (cutLines.length === 0)}
                  >
                    🔪 Eksekusi
                  </button>
                </div>
              </div>
            </div>

            <div className="glass rounded-2xl p-6 card-hover">
              <h2 className="text-xl font-bold text-white mb-4">📦 Ekspor</h2>
              <div className="space-y-2">
                <button className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-sm transition disabled:opacity-50" onClick={downloadZip} disabled={panels.length === 0 || loading}>📦 Unduh ZIP</button>
                <button className="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-2 rounded-lg text-sm transition disabled:opacity-50" onClick={downloadNaskah} disabled={!naskah}>📝 Unduh Naskah (TXT)</button>
              </div>
            </div>

            <div className="glass rounded-2xl p-6 card-hover">
              <h2 className="text-xl font-bold text-white mb-4">📊 Status</h2>
              <div className="space-y-2 text-sm">
                <p className="text-gray-400"><span className="font-semibold text-gray-300">Gambar:</span> {image ? '✅ Terupload' : '⏳ Belum'}</p>
                <p className="text-gray-400"><span className="font-semibold text-gray-300">Garis Potong:</span> {cutLines.length} garis</p>
                <p className="text-gray-400"><span className="font-semibold text-gray-300">Panel:</span> {panels.length} potongan</p>
                <p className="text-gray-400"><span className="font-semibold text-gray-300">Naskah:</span> {naskah ? '✅ Ada' : '⏳ Belum'}</p>
                {status && <div className={`p-2 rounded-lg text-xs ${status.includes('✅') ? 'bg-green-500/20 text-green-400' : status.includes('❌') ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'}`}>{status}</div>}
              </div>
            </div>

            {/* Tombol tambahan untuk manual */}
            {isManualMode && cutLines.length > 0 && (
              <div className="glass rounded-2xl p-6 card-hover border border-yellow-500/20">
                <h2 className="text-xl font-bold text-yellow-400 mb-4">✋ Manual Tools</h2>
                <div className="space-y-2">
                  <button className="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-2 rounded-lg text-sm transition" onClick={undoLastLine}>↩️ Undo Garis Terakhir</button>
                  <button className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg text-sm transition" onClick={clearCutLines}>🗑️ Hapus Semua Garis</button>
                </div>
              </div>
            )}
          </div>

          {/* KOLOM KANAN: CANVAS + PREVIEW */}
          <div className="md:col-span-2 space-y-6">
            
            <div className="glass rounded-2xl p-6 card-hover">
              <h2 className="text-xl font-bold text-white mb-4">
                🖼️ Canvas
                {isManualMode && <span className="text-xs text-purple-400 ml-2">(Klik untuk tambah garis)</span>}
              </h2>
              <div 
                className={`border rounded-xl overflow-hidden bg-black/30 ${isManualMode ? 'border-purple-500/30 cursor-crosshair' : 'border-white/10'}`}
                onClick={handleCanvasClick}
              >
                <canvas ref={canvasRef} className="w-full h-auto" />
              </div>
              {!image && <div className="text-center py-4 text-gray-500">Upload gambar untuk mulai memotong</div>}
              
              {isManualMode && image && (
                <div className="mt-2 text-xs text-gray-500 text-center">
                  💡 Klik pada gambar untuk menambah garis potong (merah)
                </div>
              )}
            </div>

            {/* HASIL PANEL */}
            {panels.length > 0 && (
              <div className="glass rounded-2xl p-6 card-hover">
                <h2 className="text-xl font-bold text-white mb-4">
                  📋 Hasil Potongan ({panels.length} Panel)
                  <span className="text-sm font-normal text-gray-400 ml-2">Klik panel untuk generate naskah</span>
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {panels.map((panel, index) => (
                    <div 
                      key={index} 
                      className={`border-2 rounded-xl overflow-hidden cursor-pointer transition ${selectedPanel?.index === panel.index ? 'border-purple-500 shadow-lg shadow-purple-500/20' : 'border-white/10 hover:border-purple-500/50'}`} 
                      onClick={() => handlePanelClick(panel)}
                    >
                      <img src={panel.dataUrl} alt={`Panel ${panel.index}`} className="w-full h-auto" />
                      <div className="bg-white/5 p-2 text-center text-sm font-semibold text-gray-300">
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
              <div className="glass rounded-2xl p-6 card-hover">
                <h2 className="text-xl font-bold text-white mb-4">📝 Naskah Panel {selectedPanel?.index || ''}</h2>
                <div className="bg-black/30 border border-white/5 rounded-xl p-4 whitespace-pre-wrap text-gray-300 leading-relaxed max-h-60 overflow-y-auto text-sm">{naskah}</div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 text-center text-xs text-gray-600 border-t border-white/5 pt-4">Manhwa Studio AI v3.0 - Auto & Manual Potong Panel</div>
      </div>
    </div>
  );
}
