'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function NovelPage() {
  const [novelText, setNovelText] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('semangat');
  const [paragraphMode, setParagraphMode] = useState('auto');
  const [rangeMin, setRangeMin] = useState(2);
  const [rangeMax, setRangeMax] = useState(5);
  const [customParagraphs, setCustomParagraphs] = useState(3);
  const [additionalDetails, setAdditionalDetails] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  const styles = [
    { id: 'semangat', label: '🔥 Semangat', desc: 'Penuh energi, motivasi, dan semangat juang', icon: '🔥' },
    { id: 'teliti', label: '🔍 Teliti', desc: 'Detail, analitis, dan penuh pengamatan', icon: '🔍' },
    { id: 'riang', label: '🎉 Riang', desc: 'Ceria, ringan, dan penuh kegembiraan', icon: '🎉' },
    { id: 'dramatis', label: '🎭 Dramatis', desc: 'Tegang, emosional, dan penuh ketegangan', icon: '🎭' },
    { id: 'romantis', label: '💕 Romantis', desc: 'Lembut, puitis, dan penuh perasaan', icon: '💕' },
    { id: 'misterius', label: '🔮 Misterius', desc: 'Penuh teka-teki, gelap, dan intrik', icon: '🔮' },
    { id: 'humor', label: '😄 Humor', desc: 'Ringan, lucu, dan menghibur', icon: '😄' },
    { id: 'epik', label: '⚔️ Epik', desc: 'Megah, heroik, dan penuh petualangan', icon: '⚔️' }
  ];

  const getStylePrompt = (styleId) => {
    const prompts = {
      semangat: `Bacalah teks novel ini dengan gaya SEMANGAT dan PENUH ENERGI. Gunakan kata-kata yang membangkitkan motivasi. Tekankan pada semangat juang karakter. Buat pembaca merasa terinspirasi.`,
      teliti: `Bacalah teks novel ini dengan gaya TELITI dan ANALITIS. Fokus pada detail-detail kecil. Gambarkan pengamatan secara mendalam. Tekankan pada logika dan urutan kejadian.`,
      riang: `Bacalah teks novel ini dengan gaya RIANG dan CERIA. Gunakan kata-kata yang ringan dan menyenangkan. Tekankan pada momen-momen bahagia. Buat pembaca merasa senang.`,
      dramatis: `Bacalah teks novel ini dengan gaya DRAMATIS dan TEGANG. Tekankan pada konflik dan ketegangan. Gunakan kata-kata yang emosional. Buat pembaca merasa tegang dan penasaran.`,
      romantis: `Bacalah teks novel ini dengan gaya ROMANTIS dan LEMBUT. Gunakan kata-kata yang puitis dan indah. Tekankan pada perasaan dan emosi. Buat pembaca merasa terharu.`,
      misterius: `Bacalah teks novel ini dengan gaya MISTERIUS dan GELAP. Tekankan pada teka-teki dan intrik. Gunakan kata-kata yang menimbulkan rasa penasaran.`,
      humor: `Bacalah teks novel ini dengan gaya HUMOR dan RINGAN. Gunakan kata-kata yang lucu dan menghibur. Tekankan pada momen-momen konyol. Buat pembaca tertawa.`,
      epik: `Bacalah teks novel ini dengan gaya EPIK dan HEROIK. Gunakan kata-kata yang megah dan berwibawa. Tekankan pada petualangan dan kepahlawanan.`
    };
    return prompts[styleId] || prompts.semangat;
  };

  const handleGenerate = async () => {
    if (!novelText || novelText.trim().length < 10) {
      alert('Masukkan teks novel minimal 10 karakter!');
      return;
    }

    setLoading(true);
    setStatus('⏳ Memproses novel...');
    setResult('');

    try {
      const stylePrompt = getStylePrompt(selectedStyle);
      const styleLabel = styles.find(s => s.id === selectedStyle)?.label || 'Semangat';

      let paragraphInstruction = '';
      if (paragraphMode === 'auto') {
        paragraphInstruction = `Jumlah paragraf: TENTUKAN SENDIRI secara alami berdasarkan isi teks. Bisa 2-6 paragraf sesuai kebutuhan cerita.`;
      } else if (paragraphMode === 'range') {
        paragraphInstruction = `Jumlah paragraf: BUATLAH ANTARA ${rangeMin} SAMPAI ${rangeMax} PARAGRAF. Sesuaikan dengan isi teks.`;
      } else {
        paragraphInstruction = `Jumlah paragraf: BUATLAH ${customParagraphs} PARAGRAF.`;
      }

      const fullPrompt = `Mulai sekarang, Anda adalah "Pembaca Novel Profesional".

Saya akan mengirimkan Anda teks berupa cuplikan cerita dari novel. Ikuti aturan di bawah ini dengan tepat.

ATURAN:

1. Sebelum menulis cerita, Anda WAJIB melakukan TAHAP 1 (Pengenalan) secara diam-diam. Hasil pengenalan ini TIDAK perlu ditampilkan di output, tapi wajib dilakukan agar Anda tidak bingung.

TAHAP 1 - Pengenalan (diam-diam):
   a. Identifikasi teks:
      - Baca semua teks yang Anda terima dengan teliti.
      - Perhatikan urutan paragraf dari atas ke bawah.
      - Catat siapa saja karakter yang muncul.
      - Catat siapa berbicara kepada siapa dalam setiap dialog.
      - Catat siapa yang melakukan setiap tindakan.
      - Catat siapa yang memiliki setiap benda atau perasaan.
      - Jika teks berbahasa Inggris atau bahasa asing lainnya, pahami maknanya karena nanti akan Anda tulis ulang dalam bahasa Indonesia.
      - LEWATKAN SEMUA IKLAN. Iklan adalah teks yang menyebutkan website, blog, watermark, credit, sampul buku lain, atau ajakan ke luar cerita.

   b. Kenali elemen cerita:
      - Siapa saja karakter yang disebut dalam teks?
      - Di mana latar tempat kejadian?
      - Apa konflik atau suasana yang sedang terjadi?
      - Hubungan antar karakter.

   c. Kenali suasana:
      - Bagaimana suasana yang terpancar dari teks?

2. BACA teks dengan URUTAN dari atas ke bawah.

3. TAHAP 2 - Membuat Cerita:
   ${stylePrompt}

   GAYA YANG DIPILIH: ${styleLabel}

   ${additionalDetails ? `DETAIL TAMBAHAN DARI USER: ${additionalDetails}` : ''}

   ${paragraphInstruction}

   - Tulis ulang cerita dari teks tersebut dalam BAHASA INDONESIA.
   - Jika teks asli berbahasa Inggris atau bahasa asing lainnya, TERJEMAHKAN.
   - Untuk SETIAP tindakan atau dialog, pastikan JELAS siapa pelaku dan siapa penerima.
   - Gunakan KALIMAT EFEKTIF dan kata-kata yang NATURAL dalam bahasa Indonesia.
   - Jangan menambahkan cerita di luar teks yang Anda terima.
   - Jangan membuat prediksi bagian sebelumnya atau sesudahnya.
   - Jangan memberi saran, komentar, atau pesan tambahan apapun.

4. Format output:
   📖 CERITA NOVEL
   [Narasi cerita dalam bahasa Indonesia]

Teks novel yang akan diproses:
---
${novelText}
---

Output Anda HANYALAH cerita dalam bahasa Indonesia, tidak ada yang lain.`;

      const response = await fetch('/api/generate-novel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: fullPrompt })
      });

      const data = await response.json();

      if (data.success) {
        setResult(data.data);
        setStatus('✅ Cerita berhasil digenerate!');
      } else {
        setStatus('❌ Gagal: ' + data.error);
      }
    } catch (error) {
      setStatus('❌ Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const copyResult = () => {
    if (!result) return;
    navigator.clipboard.writeText(result);
    alert('✅ Teks berhasil disalin!');
  };

  const downloadResult = () => {
    if (!result) return;
    const blob = new Blob([result], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cerita-novel.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] p-4">
      <div className="max-w-6xl mx-auto animate-fade-in">
        
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold gradient-text font-orbitron">📚 Novel to Story</h1>
          <p className="text-gray-400 mt-2">Ubah teks novel menjadi cerita dengan gaya yang Anda pilih!</p>
          
          <div className="flex justify-center gap-4 mt-4 flex-wrap">
            <Link href="/" className="glass hover:border-purple-500/30 px-4 py-2 rounded-lg text-sm text-gray-300 hover:text-white transition">🏠 Beranda</Link>
            <Link href="/novel" className="glass hover:border-blue-500/30 px-4 py-2 rounded-lg text-sm text-gray-300 hover:text-white transition">📚 Novel to Story</Link>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          
          <div className="space-y-6">
            
            <div className="glass rounded-2xl p-6 card-hover">
              <h2 className="text-xl font-bold text-white mb-4">📝 Input Teks Novel</h2>
              <textarea
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-purple-500/50 focus:outline-none resize-none"
                rows="8"
                placeholder="Tempelkan teks novel di sini..."
                value={novelText}
                onChange={(e) => setNovelText(e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-2">{novelText.length} karakter</p>
            </div>

            <div className="glass rounded-2xl p-6 card-hover">
              <h2 className="text-xl font-bold text-white mb-4">🎭 Pilih Gaya Cerita</h2>
              <div className="grid grid-cols-2 gap-2">
                {styles.map(style => (
                  <button
                    key={style.id}
                    className={`p-3 rounded-xl text-sm transition text-left ${
                      selectedStyle === style.id
                        ? 'bg-purple-600 text-white border-purple-500'
                        : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10'
                    } border`}
                    onClick={() => setSelectedStyle(style.id)}
                  >
                    <div className="text-lg">{style.icon}</div>
                    <div className="font-semibold text-xs">{style.label}</div>
                    <div className="text-[10px] opacity-70">{style.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="glass rounded-2xl p-6 card-hover">
              <h2 className="text-xl font-bold text-white mb-4">📄 Pengaturan Paragraf</h2>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    id="auto"
                    checked={paragraphMode === 'auto'}
                    onChange={() => setParagraphMode('auto')}
                    className="accent-purple-500"
                  />
                  <label htmlFor="auto" className="text-gray-300 text-sm">🤖 Otomatis (AI tentukan)</label>
                </div>
                
                <div className="flex items-center gap-3 flex-wrap">
                  <input
                    type="radio"
                    id="range"
                    checked={paragraphMode === 'range'}
                    onChange={() => setParagraphMode('range')}
                    className="accent-purple-500"
                  />
                  <label htmlFor="range" className="text-gray-300 text-sm">📏 Rentang:</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={rangeMin}
                    onChange={(e) => setRangeMin(Number(e.target.value))}
                    className="w-14 bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-white text-center focus:border-purple-500/50 focus:outline-none"
                    disabled={paragraphMode !== 'range'}
                  />
                  <span className="text-gray-400 text-sm">sampai</span>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={rangeMax}
                    onChange={(e) => setRangeMax(Number(e.target.value))}
                    className="w-14 bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-white text-center focus:border-purple-500/50 focus:outline-none"
                    disabled={paragraphMode !== 'range'}
                  />
                  <span className="text-gray-400 text-sm">paragraf</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    id="manual"
                    checked={paragraphMode === 'manual'}
                    onChange={() => setParagraphMode('manual')}
                    className="accent-purple-500"
                  />
                  <label htmlFor="manual" className="text-gray-300 text-sm">✏️ Manual:</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={customParagraphs}
                    onChange={(e) => setCustomParagraphs(Number(e.target.value))}
                    className="w-14 bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-white text-center focus:border-purple-500/50 focus:outline-none"
                    disabled={paragraphMode !== 'manual'}
                  />
                  <span className="text-gray-400 text-sm">paragraf</span>
                </div>
              </div>
            </div>

            <div className="glass rounded-2xl p-6 card-hover">
              <h2 className="text-xl font-bold text-white mb-4">✏️ Detail Tambahan</h2>
              <p className="text-xs text-gray-500 mb-2">Opsional: tambahkan detail khusus untuk hasil lebih baik</p>
              <textarea
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-purple-500/50 focus:outline-none resize-none"
                rows="3"
                placeholder="Contoh: 'Fokus pada emosi karakter utama' atau 'Buat suasana lebih gelap'..."
                value={additionalDetails}
                onChange={(e) => setAdditionalDetails(e.target.value)}
              />
            </div>

            <button
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl font-bold transition disabled:opacity-50 text-lg"
              onClick={handleGenerate}
              disabled={loading || !novelText}
            >
              {loading ? '⏳ Memproses...' : '🚀 Generate Cerita'}
            </button>

            {status && (
              <div className={`p-3 rounded-xl text-sm ${
                status.includes('✅') ? 'bg-green-500/20 text-green-400 border border-green-500/20' :
                status.includes('❌') ? 'bg-red-500/20 text-red-400 border border-red-500/20' :
                'bg-blue-500/20 text-blue-400 border border-blue-500/20'
              }`}>
                {status}
              </div>
            )}
          </div>

          <div className="md:col-span-2 space-y-6">
            
            <div className="glass rounded-2xl p-6 card-hover">
              <h2 className="text-xl font-bold text-white mb-4">📖 Hasil Cerita</h2>
              
              {result ? (
                <div>
                  <div className="bg-black/30 border border-white/5 rounded-xl p-4 whitespace-pre-wrap text-gray-300 leading-relaxed max-h-[500px] overflow-y-auto text-sm">
                    {result}
                  </div>
                  
                  <div className="flex gap-3 mt-4">
                    <button
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm transition"
                      onClick={copyResult}
                    >
                      📋 Copy
                    </button>
                    <button
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-sm transition"
                      onClick={downloadResult}
                    >
                      💾 Download TXT
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <p className="text-6xl mb-4">📚</p>
                  <p>Masukkan teks novel dan pilih gaya</p>
                  <p className="text-sm mt-2">Klik "Generate Cerita" untuk mulai</p>
                </div>
              )}
            </div>

            <div className="glass rounded-2xl p-6 card-hover">
              <h2 className="text-xl font-bold text-white mb-4">ℹ️ Tentang Novel to Story</h2>
              <div className="text-sm text-gray-400 space-y-2">
                <p>📖 Ubah teks novel menjadi cerita dengan gaya berbeda.</p>
                <p>🎭 Pilih dari 8 gaya: Semangat, Teliti, Riang, Dramatis, Romantis, Misterius, Humor, Epik.</p>
                <p>📄 3 mode paragraf: <span className="text-purple-400">Otomatis (AI)</span> | <span className="text-blue-400">Rentang</span> | <span className="text-green-400">Manual</span></p>
                <p>✏️ Tambahkan detail opsional untuk hasil lebih personal.</p>
                <div className="bg-yellow-500/10 border border-yellow-500/20 p-3 rounded-lg mt-2">
                  <p className="text-xs text-yellow-400">💡 Semakin panjang teks novel, semakin detail hasil cerita.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center text-xs text-gray-600 border-t border-white/5 pt-4">
          Manhwa Studio AI v3.0 - Novel to Story Generator
        </div>
      </div>
    </div>
  );
}
