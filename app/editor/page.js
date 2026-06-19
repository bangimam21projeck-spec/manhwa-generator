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
          setStatus('✅ Gambar berhasil diupload!');
          renderCanvas(img);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

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
        
        const index = cutLines.indexOf(y);
        ctx.fillStyle = 'rgba(255, 0, 0, 0.8)';
        ctx.font = '14px Arial';
        ctx.fillText(`Panel ${index + 1}`, 10, y - 10);
      });
    }
  };

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

    const cutPositions = [];
    for (let i = 1; i < panelCount; i++) {
      cutPositions.push(i * panelHeight);
    }

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
    setStatus(`✅ Berhasil! ${panelCount} panel terpotong.`);
  };

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
          <h1 className="text-4xl font-bold gradient-text font-orbitron">✂️ Potong Panel Otomatis</h1>
          <p className="text-gray-400 mt-2">Upload gambar panjang, atur jumlah panel, dan potong otomatis!</p>
          
          <div className="flex justify-center gap-4 mt-4 flex-wrap">
            <Link href="/" className="glass hover:border-purple-500/30 px-4 py-2 rounded-lg text-sm text-gray-300 hover:text-white transition">🏠 Beranda</Link>
            <Link href="/editor" className="glass hover:border-blue-500/30 px-4 py-2 rounded-lg text-sm text-gray-300 hover:text-white transition">✂️ Editor Panel</Link>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          
          <div className="space-y-6">
            <div className="glass rounded-2xl p-6 card-hover">
              <h2 className="text-xl font-bold text-white mb-4">📤 Upload Gambar</h2>
              <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
              <button className="w-full btn-primary" onClick={() => fileInputRef.current.click()}>📁 Pilih Gambar Panjang</button>
              <p className="text-xs text-gray-500 mt-2 text-center">Mendukung JPG, PNG, WebP</p>
            </div>

            <div className="glass rounded-2xl p-6 card-hover">
              <h2 className="text-xl font-bold text-white mb-4">⚙️ Pengaturan</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Jumlah Panel:</label>
                  <input type="number" min="2" max="20" value={panelCount} onChange={(e) => setPanelCount(Number(e.target.value))} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-purple-500/50 focus:outline-none" />
                  <p className="text-xs text-gray-500 mt-1">Gambar akan dibagi rata menjadi {panelCount} panel</p>
                </div>
                <button className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-semibold transition disabled:opacity-50" onClick={handleAutoCut} disabled={!image}>✂️ Potong Otomatis</button>
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
                <p className="text-gray-400"><span className="font-semibold text-gray-300">Panel:</span> {panels.length} potongan</p>
                <p className="text-gray-400"><span className="font-semibold text-gray-300">Naskah:</span> {naskah ? '✅ Ada' : '⏳ Belum'}</p>
                {status && <div className={`p-2 rounded-lg text-xs ${status.includes('✅') ? 'bg-green-500/20 text-green-400' : status.includes('❌') ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'}`}>{status}</div>}
              </div>
            </div>
          </div>

          <div className="md:col-span-2 space-y-6">
            <div className="glass rounded-2xl p-6 card-hover">
              <h2 className="text-xl font-bold text-white mb-4">🖼️ Preview</h2>
              <div className="border border-white/10 rounded-xl overflow-hidden bg-black/30">
                <canvas ref={canvasRef} className="w-full h-auto" />
              </div>
              {!image && <div className="text-center py-4 text-gray-500">Upload gambar untuk mulai memotong</div>}
            </div>

            {panels.length > 0 && (
              <div className="glass rounded-2xl p-6 card-hover">
                <h2 className="text-xl font-bold text-white mb-4">📋 Hasil Potongan ({panels.length} Panel) <span className="text-sm font-normal text-gray-400">Klik panel untuk generate naskah</span></h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {panels.map((panel, index) => (
                    <div key={index} className={`border-2 rounded-xl overflow-hidden cursor-pointer transition ${selectedPanel?.index === panel.index ? 'border-purple-500 shadow-lg shadow-purple-500/20' : 'border-white/10 hover:border-purple-500/50'}`} onClick={() => handlePanelClick(panel)}>
                      <img src={panel.dataUrl} alt={`Panel ${panel.index}`} className="w-full h-auto" />
                      <div className="bg-white/5 p-2 text-center text-sm font-semibold text-gray-300">Panel {panel.index}{selectedPanel?.index === panel.index && ' ✅'}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {naskah && (
              <div className="glass rounded-2xl p-6 card-hover">
                <h2 className="text-xl font-bold text-white mb-4">📝 Naskah Panel {selectedPanel?.index || ''}</h2>
                <div className="bg-black/30 border border-white/5 rounded-xl p-4 whitespace-pre-wrap text-gray-300 leading-relaxed max-h-60 overflow-y-auto text-sm">{naskah}</div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 text-center text-xs text-gray-600 border-t border-white/5 pt-4">Manhwa Studio AI v3.0 - Auto Potong Panel</div>
      </div>
    </div>
  );
}
