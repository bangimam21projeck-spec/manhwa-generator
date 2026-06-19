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

  const addDialog = (charIndex) => {
    const dialog = prompt('Dialog karakter:');
    if (dialog) {
      const updated = [...characters];
      updated[charIndex].dialog.push(dialog);
      setCharacters(updated);
      setStatus(`✅ Dialog ditambahkan ke ${updated[charIndex].name}`);
    }
  };

  const generateVoice = async () => {
    if (!text && characters.length === 0) {
      alert('Masukkan teks atau tambahkan karakter!');
      return;
    }

    setLoading(true);
    setStatus('⏳ Menghasilkan suara AI...');

    try {
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

  const removeCharacter = (index) => {
    const updated = [...characters];
    updated.splice(index, 1);
    setCharacters(updated);
  };

  const removeDialog = (charIndex, dialogIndex) => {
    const updated = [...characters];
    updated[charIndex].dialog.splice(dialogIndex, 1);
    setCharacters(updated);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] p-4">
      <div className="max-w-6xl mx-auto animate-fade-in">
        
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold gradient-text font-orbitron">🎙️ Suara AI untuk Karakter</h1>
          <p className="text-gray-400 mt-2">Ubah naskah menjadi suara karakter dengan AI!</p>
          
          <div className="flex justify-center gap-4 mt-4 flex-wrap">
            <Link href="/" className="glass hover:border-purple-500/30 px-4 py-2 rounded-lg text-sm text-gray-300 hover:text-white transition">🏠 Beranda</Link>
            <Link href="/editor" className="glass hover:border-blue-500/30 px-4 py-2 rounded-lg text-sm text-gray-300 hover:text-white transition">✂️ Potong Panel</Link>
            <Link href="/voice" className="glass hover:border-yellow-500/30 px-4 py-2 rounded-lg text-sm text-gray-300 hover:text-white transition">🎙️ Suara AI</Link>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          
          <div className="space-y-6">
            <div className="glass rounded-2xl p-6 card-hover">
              <h2 className="text-xl font-bold text-white mb-4">⚙️ Pengaturan Suara</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Pilih Suara:</label>
                  <select value={voice} onChange={(e) => setVoice(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-purple-500/50 focus:outline-none">
                    {voiceOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Kecepatan: {speed}x</label>
                  <input type="range" min="0.5" max="2" step="0.1" value={speed} onChange={(e) => setSpeed(Number(e.target.value))} className="w-full accent-purple-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Nada: {pitch}x</label>
                  <input type="range" min="0.5" max="2" step="0.1" value={pitch} onChange={(e) => setPitch(Number(e.target.value))} className="w-full accent-purple-500" />
                </div>
              </div>
            </div>

            <div className="glass rounded-2xl p-6 card-hover">
              <h2 className="text-xl font-bold text-white mb-4">📝 Teks Naskah</h2>
              <textarea className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-purple-500/50 focus:outline-none resize-none" rows="4" placeholder="Masukkan teks naskah atau narasi..." value={text} onChange={(e) => setText(e.target.value)} />
              <button className="mt-3 w-full bg-yellow-600 hover:bg-yellow-700 text-white py-3 rounded-xl font-semibold transition disabled:opacity-50" onClick={generateVoice} disabled={loading || (!text && characters.length === 0)}>{loading ? '⏳ Memproses...' : '🎙️ Generate Suara'}</button>
            </div>

            <div className="glass rounded-2xl p-6 card-hover">
              <h2 className="text-xl font-bold text-white mb-4">👥 Manajemen Karakter</h2>
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm transition" onClick={addCharacter}>➕ Tambah Karakter</button>
              <div className="mt-3 max-h-40 overflow-y-auto space-y-2">
                {characters.map((char, index) => (
                  <div key={index} className="bg-white/5 p-2 rounded-lg border border-white/5">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-white">{char.name}</span>
                      <div className="flex gap-2">
                        <button className="text-green-400 hover:text-green-300 text-xs" onClick={() => addDialog(index)}>+ Dialog</button>
                        <button className="text-red-400 hover:text-red-300 text-xs" onClick={() => removeCharacter(index)}>✕</button>
                      </div>
                    </div>
                    {char.dialog.length > 0 && <div className="mt-1 text-xs text-gray-400">{char.dialog.map((d, i) => <div key={i} className="flex justify-between items-center bg-white/5 p-1 rounded mt-1"><span className="truncate max-w-[150px]">"{d}"</span><button className="text-red-400 hover:text-red-300" onClick={() => removeDialog(index, i)}>✕</button></div>)}</div>}
                  </div>
                ))}
              </div>
            </div>

            {audioUrl && (
              <div className="glass rounded-2xl p-6 card-hover">
                <h2 className="text-xl font-bold text-white mb-4">🔊 Preview Suara</h2>
                <audio controls className="w-full"><source src={audioUrl} type="audio/mpeg" />Browser Anda tidak mendukung audio.</audio>
                <a href={audioUrl} download="suara-manhwa.mp3" className="mt-3 w-full block text-center bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-sm transition">💾 Download MP3</a>
              </div>
            )}
          </div>

          <div className="md:col-span-2 space-y-6">
            <div className="glass rounded-2xl p-6 card-hover">
              <h2 className="text-xl font-bold text-white mb-4">📊 Status</h2>
              <div className="space-y-2 text-sm">
                <p className="text-gray-400"><span className="font-semibold text-gray-300">Teks:</span> {text ? '✅ Ada' : '⏳ Kosong'}</p>
                <p className="text-gray-400"><span className="font-semibold text-gray-300">Karakter:</span> {characters.length} karakter</p>
                <p className="text-gray-400"><span className="font-semibold text-gray-300">Total Dialog:</span> {characters.reduce((sum, char) => sum + char.dialog.length, 0)} dialog</p>
                <p className="text-gray-400"><span className="font-semibold text-gray-300">Suara:</span> {audioUrl ? '✅ Selesai' : '⏳ Belum'}</p>
                {status && <div className={`p-2 rounded-lg text-xs ${status.includes('✅') ? 'bg-green-500/20 text-green-400' : status.includes('❌') ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'}`}>{status}</div>}
              </div>
            </div>

            <div className="glass rounded-2xl p-6 card-hover">
              <h2 className="text-xl font-bold text-white mb-4">ℹ️ Tentang Suara AI</h2>
              <div className="text-sm text-gray-400 space-y-2">
                <p>🎤 Fitur ini mengubah teks naskah menjadi suara karakter.</p>
                <p>🎭 Pilih berbagai gaya suara untuk karakter berbeda.</p>
                <p>💾 Download hasil suara dalam format MP3.</p>
                <div className="bg-yellow-500/10 border border-yellow-500/20 p-3 rounded-lg mt-2"><p className="text-xs text-yellow-400">⚠️ Fitur ini membutuhkan API Key Gemini yang valid.</p></div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center text-xs text-gray-600 border-t border-white/5 pt-4">Manhwa Studio AI v3.0 - Suara AI</div>
      </div>
    </div>
  );
}
