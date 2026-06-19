'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function VoicePage() {
  const [text, setText] = useState('');
  const [voice, setVoice] = useState('default');
  const [speed, setSpeed] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [audioUrl, setAudioUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [characters, setCharacters] = useState([]);

  // Daftar suara karakter
  const voiceOptions = [
    { value: 'default', label: '🎙️ Default' },
    { value: 'narrator', label: '📖 Narator' },
    { value: 'hero', label: '⚔️ Pahlawan (Tegas)' },
    { value: 'heroine', label: '👸 Pahlawan Wanita (Lembut)' },
    { value: 'villain', label: '👹 Penjahat (Mengerikan)' },
    { value: 'comedy', label: '😂 Komedi (Ceria)' },
    { value: 'dramatic', label: '🎭 Dramatis (Berat)' },
    { value: 'mysterious', label: '🔮 Misterius (Bisu)' },
  ];

  // Tambah karakter
  const addCharacter = () => {
    const name = prompt('Nama karakter:');
    if (name) {
      const voice = prompt('Pilih suara (default/narrator/hero/heroine/villain/comedy/dramatic/mysterious):');
      if (voice) {
        setCharacters([...characters, { name, voice, dialog: [] }]);
        setStatus(`✅ Karakter ${name} ditambahkan!`);
      }
    }
  };

  // Tambah dialog ke karakter
  const addDialog = (charIndex) => {
    const dialog = prompt('Dialog karakter:');
    if (dialog) {
      const updated = [...characters];
      updated[charIndex].dialog.push(dialog);
      setCharacters(updated);
      setStatus(`✅ Dialog ditambahkan ke ${updated[charIndex].name}`);
    }
  };

  // Generate suara
  const generateVoice = async () => {
    if (!text && characters.length === 0) {
      alert('Masukkan teks atau tambahkan karakter!');
      return;
    }

    setLoading(true);
    setStatus('⏳ Menghasilkan suara AI...');

    try {
      // Gabungkan semua dialog karakter
      let fullText = text;
      characters.forEach(char => {
        char.dialog.forEach(dialog => {
          fullText += `\n${char.name}: ${dialog}`;
        });
      });

      const response = await fetch('/api/voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: fullText || 'Halo, ini adalah suara AI untuk komik manhwa.',
          voice: voice,
          speed: speed,
          pitch: pitch
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setAudioUrl(data.audioUrl);
        setStatus('✅ Suara berhasil dihasilkan!');
      } else {
        setStatus('❌ Gagal: ' + data.error);
      }
    } catch (error) {
      setStatus('❌ Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Hapus karakter
  const removeCharacter = (index) => {
    const updated = [...characters];
    updated.splice(index, 1);
    setCharacters(updated);
  };

  // Hapus dialog
  const removeDialog = (charIndex, dialogIndex) => {
    const updated = [...characters];
    updated[charIndex].dialog.splice(dialogIndex, 1);
    setCharacters(updated);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            🎙️ Suara AI untuk Karakter
          </h1>
          <p className="text-gray-600 mt-2">Ubah naskah menjadi suara karakter dengan AI!</p>
          
          <div className="flex justify-center gap-4 mt-4 flex-wrap">
            <Link href="/" className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition text-sm">
              🏠 Beranda
            </Link>
            <Link href="/editor" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm">
              ✂️ Potong Panel
            </Link>
            <Link href="/voice" className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition text-sm">
              🎙️ Suara AI
            </Link>
          </div>
        </div>

        {/* MAIN */}
        <div className="grid md:grid-cols-3 gap-6">
          
          {/* KOLOM KIRI: KONTROL */}
          <div className="space-y-6">
            
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-xl font-semibold mb-4">⚙️ Pengaturan Suara</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pilih Suara:
                  </label>
                  <select
                    value={voice}
                    onChange={(e) => setVoice(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                  >
                    {voiceOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kecepatan: {speed}x
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={speed}
                    onChange={(e) => setSpeed(Number(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nada: {pitch}x
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={pitch}
                    onChange={(e) => setPitch(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-xl font-semibold mb-4">📝 Teks Naskah</h2>
              
              <textarea
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 resize-none"
                rows="4"
                placeholder="Masukkan teks naskah atau narasi..."
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
              
              <button
                className="mt-3 w-full bg-yellow-600 text-white py-3 rounded-xl hover:bg-yellow-700 transition font-semibold disabled:opacity-50"
                onClick={generateVoice}
                disabled={loading || (!text && characters.length === 0)}
              >
                {loading ? '⏳ Memproses...' : '🎙️ Generate Suara'}
              </button>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-xl font-semibold mb-4">👥 Manajemen Karakter</h2>
              
              <button
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition text-sm"
                onClick={addCharacter}
              >
                ➕ Tambah Karakter
              </button>
              
              <div className="mt-3 max-h-40 overflow-y-auto space-y-2">
                {characters.map((char, index) => (
                  <div key={index} className="bg-gray-50 p-2 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">{char.name}</span>
                      <div className="flex gap-2">
                        <button
                          className="text-green-600 hover:text-green-800 text-xs"
                          onClick={() => addDialog(index)}
                        >
                          + Dialog
                        </button>
                        <button
                          className="text-red-500 hover:text-red-700 text-xs"
                          onClick={() => removeCharacter(index)}
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                    {char.dialog.length > 0 && (
                      <div className="mt-1 text-xs text-gray-600">
                        {char.dialog.map((d, i) => (
                          <div key={i} className="flex justify-between items-center bg-white p-1 rounded mt-1">
                            <span className="truncate max-w-[150px]">"{d}"</span>
                            <button
                              className="text-red-400 hover:text-red-600"
                              onClick={() => removeDialog(index, i)}
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {audioUrl && (
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h2 className="text-xl font-semibold mb-4">🔊 Preview Suara</h2>
                <audio controls className="w-full">
                  <source src={audioUrl} type="audio/mpeg" />
                  Browser Anda tidak mendukung audio.
                </audio>
                <a
                  href={audioUrl}
                  download="suara-manhwa.mp3"
                  className="mt-3 w-full block text-center bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition text-sm"
                >
                  💾 Download MP3
                </a>
              </div>
            )}
          </div>

          {/* KOLOM KANAN: PREVIEW & STATUS */}
          <div className="md:col-span-2 space-y-6">
            
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-xl font-semibold mb-4">📊 Status</h2>
              
              <div className="space-y-2 text-sm">
                <p className="text-gray-600">
                  <span className="font-semibold">Teks:</span>{' '}
                  {text ? '✅ Ada' : '⏳ Kosong'}
                </p>
                <p className="text-gray-600">
                  <span className="font-semibold">Karakter:</span>{' '}
                  {characters.length} karakter
                </p>
                <p className="text-gray-600">
                  <span className="font-semibold">Total Dialog:</span>{' '}
                  {characters.reduce((sum, char) => sum + char.dialog.length, 0)} dialog
                </p>
                <p className="text-gray-600">
                  <span className="font-semibold">Suara:</span>{' '}
                  {audioUrl ? '✅ Selesai' : '⏳ Belum'}
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

            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-xl font-semibold mb-4">ℹ️ Tentang Suara AI</h2>
              <div className="text-sm text-gray-600 space-y-2">
                <p>🎤 Fitur ini mengubah teks naskah menjadi suara karakter.</p>
                <p>🎭 Pilih berbagai gaya suara untuk karakter berbeda.</p>
                <p>⚡ Atur kecepatan dan nada sesuai kebutuhan.</p>
                <p>👥 Tambahkan karakter dan dialog untuk adegan lebih hidup.</p>
                <p>💾 Download hasil suara dalam format MP3.</p>
                
                <div className="bg-yellow-50 p-3 rounded-lg mt-2">
                  <p className="text-xs text-yellow-700">
                    ⚠️ Fitur ini menggunakan Text-to-Speech AI. 
                    Pastikan Anda sudah menambahkan API Key di halaman Beranda.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center text-xs text-gray-400 border-t pt-4">
          <p>Manhwa Studio AI v3.0 - Suara AI untuk Karakter</p>
        </div>
      </div>
    </div>
  );
}
