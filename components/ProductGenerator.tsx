import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { generateProductCaption } from '../services/geminiService';
import { saveGeneratedCaption, getCatalogProducts, getStrategies, getMainBrains } from '../services/firebaseService';
import { ToneType, ProductCatalogItem, GeneratedCaptionData, ContentStrategy, MainBrain } from '../types';

interface ProductGeneratorProps {
  user: User;
  onSuccess: () => void;
  onSwitchTab: (tab: string) => void;
}

const ProductGenerator: React.FC<ProductGeneratorProps> = ({ user, onSuccess, onSwitchTab }) => {
  // Data Sources
  const [catalog, setCatalog] = useState<ProductCatalogItem[]>([]);
  const [strategies, setStrategies] = useState<ContentStrategy[]>([]);
  const [brains, setBrains] = useState<MainBrain[]>([]);
  
  // Inputs
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [selectedStrategyId, setSelectedStrategyId] = useState<string>('');
  const [selectedBrainId, setSelectedBrainId] = useState<string>('');
  const [tone, setTone] = useState<ToneType>(ToneType.FUN);
  const [customInstruction, setCustomInstruction] = useState('');

  // UI State
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  
  // Result State
  const [result, setResult] = useState<GeneratedCaptionData | null>(null);
  const [copiedCaption, setCopiedCaption] = useState(false);
  const [copiedHashtags, setCopiedHashtags] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setLoadingData(true);
      const [prodData, stratData, brainData] = await Promise.all([
        getCatalogProducts(user.uid),
        getStrategies(user.uid),
        getMainBrains(user.uid)
      ]);
      setCatalog(prodData);
      setStrategies(stratData);
      setBrains(brainData);
      
      // Default select the first brain if available
      if (brainData.length > 0) {
        setSelectedBrainId(brainData[0].id || '');
      }
      
      setLoadingData(false);
    };
    loadData();
  }, [user]);

  const selectedProduct = catalog.find(p => p.id === selectedProductId);
  const selectedStrategy = strategies.find(s => s.id === selectedStrategyId);
  const selectedBrain = brains.find(b => b.id === selectedBrainId);

  const handleGenerate = async () => {
    if (!selectedProduct) return;

    setIsGenerating(true);
    setError(null);
    setResult(null);

    try {
      const generated = await generateProductCaption(
        selectedProduct.storeName, 
        selectedProduct.productName, 
        selectedProduct.productLink, 
        selectedProduct.description, 
        tone,
        selectedStrategy,
        customInstruction,
        selectedBrain?.instruction // Pass selected Main Brain data
      );
      
      const newCaptionData: Omit<GeneratedCaptionData, "id" | "createdAt"> = {
        userId: user.uid,
        storeName: selectedProduct.storeName,
        productName: selectedProduct.productName,
        productLink: selectedProduct.productLink,
        tone,
        strategyTitle: selectedStrategy?.title,
        generatedCaption: generated.caption,
        hashtags: generated.hashtags,
      };

      await saveGeneratedCaption(newCaptionData);
      
      setResult({
        ...newCaptionData,
        createdAt: new Date(), 
      });

    } catch (err) {
      console.error(err);
      setError("Gagal membuat caption. Pastikan koneksi aman.");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string, type: 'caption' | 'hashtags' | 'all') => {
    navigator.clipboard.writeText(text);
    if (type === 'caption') {
      setCopiedCaption(true);
      setTimeout(() => setCopiedCaption(false), 2000);
    } else if (type === 'hashtags') {
      setCopiedHashtags(true);
      setTimeout(() => setCopiedHashtags(false), 2000);
    } else {
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
    }
  };

  if (loadingData) {
    return <div className="p-8 text-center text-slate-400">Memuat data...</div>;
  }

  if (catalog.length === 0) {
    return (
      <div className="text-center py-16 px-4 bg-slate-800 rounded-2xl shadow-sm border border-slate-700">
        <div className="text-4xl mb-4">📦</div>
        <h3 className="text-lg font-bold text-white mb-2">Katalog Produk Kosong</h3>
        <p className="text-slate-400 mb-6">Anda belum memiliki data produk yang tersimpan.</p>
        <button 
          onClick={() => onSwitchTab('input')}
          className="px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors"
        >
          Input Data Produk Dulu
        </button>
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-12 gap-8">
      {/* LEFT: Generator Form */}
      <div className="lg:col-span-5 space-y-6">
        <div className="bg-slate-800 rounded-2xl shadow-xl border border-slate-700 p-6">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <span className="bg-blue-900/50 text-blue-400 p-2 rounded-lg border border-blue-800">✨</span>
            Generator Magic
          </h2>

          {error && (
            <div className="mb-6 p-4 bg-red-900/30 text-red-300 rounded-xl text-sm border border-red-800">
              {error}
            </div>
          )}

          <div className="space-y-5">
            {/* Product Selector */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Pilih Produk
              </label>
              <select
                value={selectedProductId}
                onChange={(e) => {
                  setSelectedProductId(e.target.value);
                  setResult(null); // Reset result on change
                }}
                className="w-full px-4 py-3 rounded-xl border border-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors bg-slate-900 text-white focus:bg-slate-900"
              >
                <option value="">-- Pilih Produk --</option>
                {catalog.map(p => (
                  <option key={p.id} value={p.id}>{p.productName} ({p.storeName})</option>
                ))}
              </select>
            </div>

            {/* Main Brain Selector */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-semibold text-slate-300 flex items-center gap-2">
                   Pilih Otak / Karakter 🧠
                </label>
                <button 
                  onClick={() => onSwitchTab('mainBrain')}
                  className="text-xs text-indigo-400 font-medium hover:text-indigo-300 hover:underline"
                >
                  + Kelola Otak
                </button>
              </div>
              <select
                value={selectedBrainId}
                onChange={(e) => setSelectedBrainId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors bg-slate-900 text-white focus:bg-slate-900"
              >
                <option value="">-- Tanpa Otak Khusus (Default) --</option>
                {brains.map(b => (
                  <option key={b.id} value={b.id}>{b.title}</option>
                ))}
              </select>
              {selectedBrain && (
                <div className="mt-2 text-xs text-indigo-300 bg-indigo-900/30 p-2 rounded-lg border border-indigo-800">
                  Otak Aktif: <strong>{selectedBrain.title}</strong>
                </div>
              )}
            </div>

            {/* Strategy Selector */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-semibold text-slate-300">
                  Strategi / Pola (Opsional)
                </label>
                <button 
                  onClick={() => onSwitchTab('strategy')}
                  className="text-xs text-purple-400 font-medium hover:text-purple-300 hover:underline"
                >
                  + Buat Baru
                </button>
              </div>
              <select
                value={selectedStrategyId}
                onChange={(e) => setSelectedStrategyId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-600 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors bg-slate-900 text-white focus:bg-slate-900"
              >
                <option value="">-- Gunakan Default (Tanpa Strategi) --</option>
                {strategies.map(s => (
                  <option key={s.id} value={s.id}>{s.title}</option>
                ))}
              </select>
            </div>

            {/* Tone Selector */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Gaya Bahasa (Tone)
              </label>
              <div className="grid grid-cols-2 gap-2">
                {Object.values(ToneType).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTone(t)}
                    className={`px-2 py-2 text-xs md:text-sm rounded-lg border transition-all font-medium ${
                      tone === t
                        ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-900/40'
                        : 'bg-slate-900 text-slate-400 border-slate-700 hover:bg-slate-700 hover:text-white'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Instruction */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Instruksi Tambahan (Opsional)
              </label>
              <textarea
                value={customInstruction}
                onChange={(e) => setCustomInstruction(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-slate-600 focus:border-blue-500 outline-none text-sm h-20 bg-slate-900 text-white placeholder-slate-600"
                placeholder="Contoh: Jangan pakai emoji berlebihan, sebutkan diskon 50%..."
              />
            </div>

            <button
              onClick={handleGenerate}
              disabled={isGenerating || !selectedProductId}
              className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-blue-900/40 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isGenerating ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sedang Meracik...
                </span>
              ) : (
                "Generate Caption Sekarang"
              )}
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT: Result Display */}
      <div className="lg:col-span-7">
        {result ? (
          <div className="bg-slate-800 rounded-2xl shadow-xl border border-indigo-900/50 overflow-hidden animate-fade-in">
            <div className="bg-gradient-to-r from-indigo-900/50 to-blue-900/50 px-6 py-4 border-b border-indigo-800 flex justify-between items-center">
              <h3 className="font-bold text-white flex items-center gap-2">
                🎉 Hasil Generate Sukses
              </h3>
              <span className="text-xs font-semibold text-indigo-200 px-2 py-1 bg-indigo-900 rounded-md border border-indigo-700">
                Baru Saja
              </span>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Caption Section */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-bold text-slate-300">Caption Utama</label>
                  <button
                    onClick={() => copyToClipboard(result.generatedCaption, 'caption')}
                    className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1 ${
                      copiedCaption 
                        ? 'bg-green-900/30 text-green-400 border border-green-800' 
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600 border border-slate-600'
                    }`}
                  >
                    {copiedCaption ? "Disalin!" : "Salin Caption"}
                  </button>
                </div>
                <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 text-slate-200 whitespace-pre-wrap text-sm leading-relaxed">
                  {result.generatedCaption}
                </div>
              </div>

              {/* Hashtag Section */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-bold text-slate-300">Hashtags</label>
                  <button
                    onClick={() => {
                      const tags = result.hashtags.map(t => t.startsWith('#') ? t : `#${t}`).join(' ');
                      copyToClipboard(tags, 'hashtags');
                    }}
                    className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1 ${
                      copiedHashtags
                        ? 'bg-green-900/30 text-green-400 border border-green-800' 
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600 border border-slate-600'
                    }`}
                  >
                    {copiedHashtags ? "Disalin!" : "Salin Hashtags"}
                  </button>
                </div>
                <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 text-blue-400 text-sm font-medium">
                  {result.hashtags.map(t => t.startsWith('#') ? t : `#${t}`).join(' ')}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-700 flex flex-col gap-3">
                <button
                  onClick={() => {
                    const tags = result.hashtags.map(t => t.startsWith('#') ? t : `#${t}`).join(' ');
                    const fullText = `${result.generatedCaption}\n\n${tags}`;
                    copyToClipboard(fullText, 'all');
                  }}
                  className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-md ${
                    copiedAll
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-amber-500 text-slate-900 hover:bg-amber-400'
                  }`}
                >
                  {copiedAll ? (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                      Berhasil Disalin Semuanya!
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                      Salin Semuanya (Caption + Hashtag)
                    </>
                  )}
                </button>

                <div className="flex justify-end mt-2">
                  <button
                    onClick={onSuccess}
                    className="text-sm text-slate-400 hover:text-blue-400 font-medium flex items-center gap-1"
                  >
                    Lihat di Riwayat
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Placeholder / Welcome State on Right Side */
          <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-slate-800 rounded-2xl border border-dashed border-slate-700 min-h-[400px]">
             <div className="text-6xl mb-4 opacity-30 grayscale contrast-200">🔮</div>
             <h3 className="text-lg font-semibold text-slate-200">Siap untuk Berkreasi?</h3>
             <p className="text-slate-500 max-w-sm mt-2 text-sm">
               Pilih produk, strategi, dan tekan tombol generate. Hasil caption Anda akan muncul di sini dengan gaya premium.
             </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductGenerator;