'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';

export default function EditorPage() {
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [cutLines, setCutLines] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState(null);
  const [selectedTool, setSelectedTool] = useState('cut');
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

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
          // Render gambar di canvas
          renderCanvas(img);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  // Render canvas dengan gambar
  const renderCanvas = (img) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // Set ukuran canvas
    const maxWidth = 800;
    const maxHeight = 600;
    let width = img.width;
    let height = img.height;
    
    if (width > maxWidth) {
      const ratio = maxWidth / width;
      width = maxWidth;
      height = height * ratio;
    }
    if (height > maxHeight) {
      const ratio = maxHeight / height;
      height = maxHeight;
      width = width * ratio;
    }
    
    canvas.width = width;
    canvas.height = height;
    
    // Gambar
    ctx.drawImage(img, 0, 0, width, height);
    
    // Gambar garis potong yang sudah ada
    cutLines.forEach(line => {
      ctx.beginPath();
      ctx.moveTo(line.x1, line.y1);
      ctx.lineTo(line.x2, line.y2);
      ctx.strokeStyle = line.color || '#ff0000';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.stroke();
      ctx.setLineDash([]);
    });

    // Gambar panduan 16:9
    drawGuide(ctx, width, height);
  };

  // Gambar panduan 16:9
  const drawGuide = (ctx, width, height) => {
    const ratio = 16 / 9;
    let guideWidth = width;
    let guideHeight = width / ratio;
    
    if (guideHeight > height) {
      guideHeight = height;
      guideWidth = height * ratio;
    }
    
    const x = (width - guideWidth) / 2;
    const y = (height - guideHeight) / 2;
    
    ctx.strokeStyle = 'rgba(0, 255, 0, 0.5)';
    ctx.lineWidth = 1;
    ctx.setLineDash([10, 10]);
    ctx.strokeRect(x, y, guideWidth, guideHeight);
    ctx.setLineDash([]);
    
    // Label
    ctx.fillStyle = 'rgba(0, 255, 0, 0.7)';
    ctx.font = '12px Arial';
    ctx.fillText('16:9 Guide', x + 5, y + 20);
  };

  // Mouse events untuk menggambar garis potong
  const handleMouseDown = (e) => {
    if (selectedTool !== 'cut') return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setIsDrawing(true);
    setStartPoint({ x, y });
  };

  const handleMouseMove = (e) => {
    if (!isDrawing || selectedTool !== 'cut') return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Redraw dengan garis sementara
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = image;
    if (!img) return;
    
    // Clear dan redraw
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    
    // Gambar garis lama
    cutLines.forEach(line => {
      ctx.beginPath();
      ctx.moveTo(line.x1, line.y1);
      ctx.lineTo(line.x2, line.y2);
      ctx.strokeStyle = line.color || '#ff0000';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.stroke();
      ctx.setLineDash([]);
    });
    
    // Gambar garis sementara
    if (startPoint) {
      ctx.beginPath();
      ctx.moveTo(startPoint.x, startPoint.y);
      ctx.lineTo(x, y);
      ctx.strokeStyle = '#ff0000';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    
    drawGuide(ctx, canvas.width, canvas.height);
  };

  const handleMouseUp = (e) => {
    if (!isDrawing || selectedTool !== 'cut') return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (startPoint) {
      // Simpan garis potong
      const newLine = {
        x1: startPoint.x,
        y1: startPoint.y,
        x2: x,
        y2: y,
        color: '#ff0000'
      };
      setCutLines([...cutLines, newLine]);
    }
    
    setIsDrawing(false);
    setStartPoint(null);
    
    // Redraw final
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = image;
    if (!img) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    
    cutLines.concat([{
      x1: startPoint?.x || 0,
      y1: startPoint?.y || 0,
      x2: x,
      y2: y,
      color: '#ff0000'
    }]).forEach(line => {
      ctx.beginPath();
      ctx.moveTo(line.x1, line.y1);
      ctx.lineTo(line.x2, line.y2);
      ctx.strokeStyle = line.color || '#ff0000';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.stroke();
      ctx.setLineDash([]);
    });
    
    drawGuide(ctx, canvas.width, canvas.height);
  };

  // Hapus semua garis potong
  const clearCutLines = () => {
    setCutLines([]);
    if (image) {
      renderCanvas(image);
    }
  };

  // Download hasil
  const downloadImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = 'manhwa-panel.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            ✂️ Manhwa Panel Editor
          </h1>
          <p className="text-gray-600 mt-2">Upload gambar, tentukan garis potong panel, dan export!</p>
          
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
                📁 Pilih Gambar
              </button>
              
              <p className="text-xs text-gray-500 mt-2 text-center">
                Mendukung JPG, PNG, WebP
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-xl font-semibold mb-4">🛠️ Tools</h2>
              
              <div className="space-y-2">
                <button
                  className={`w-full py-2 rounded-lg text-sm transition ${
                    selectedTool === 'cut' 
                      ? 'bg-red-600 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                  onClick={() => setSelectedTool('cut')}
                >
                  ✂️ Garis Potong
                </button>
                
                <button
                  className="w-full bg-yellow-500 text-white py-2 rounded-lg hover:bg-yellow-600 transition text-sm"
                  onClick={clearCutLines}
                >
                  🗑️ Hapus Semua Garis
                </button>
                
                <button
                  className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition text-sm"
                  onClick={downloadImage}
                  disabled={!image}
                >
                  💾 Download Hasil
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-xl font-semibold mb-4">📋 Informasi</h2>
              
              <div className="space-y-2 text-sm">
                <p className="text-gray-600">
                  <span className="font-semibold">Status:</span>{' '}
                  {image ? '✅ Gambar terupload' : '⏳ Belum ada gambar'}
                </p>
                <p className="text-gray-600">
                  <span className="font-semibold">Garis Potong:</span>{' '}
                  {cutLines.length} garis
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  💡 Klik dan drag di gambar untuk membuat garis potong
                </p>
                <p className="text-xs text-gray-400">
                  🟢 Garis hijau = Panduan 16:9
                </p>
              </div>
            </div>
          </div>

          {/* KOLOM KANAN: CANVAS */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-xl font-semibold mb-4">🖼️ Canvas Editor</h2>
              
              <div className="border-2 border-gray-300 rounded-xl overflow-hidden bg-gray-50">
                <canvas
                  ref={canvasRef}
                  className="w-full h-auto"
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                />
              </div>
              
              {!image && (
                <div className="text-center py-8 text-gray-400">
                  <p className="text-6xl mb-4">🖼️</p>
                  <p>Upload gambar untuk mulai mengedit</p>
                </div>
              )}
              
              <div className="mt-4 text-xs text-gray-500 text-center">
                <p>Klik dan drag untuk membuat garis potong (merah) | Panduan 16:9 (hijau)</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center text-xs text-gray-400 border-t pt-4">
          <p>Manhwa Studio AI v2.0 - Editor Panel</p>
        </div>
      </div>
    </div>
  );
}
