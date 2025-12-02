import React, { useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { getGeneratedCaptions, deleteGeneratedCaption } from '../services/firebaseService';
import { GeneratedCaptionData } from '../types';

interface ProductListProps {
  user: User;
  refreshTrigger: number;
}

const ProductList: React.FC<ProductListProps> = ({ user, refreshTrigger }) => {
  const [captions, setCaptions] = useState<GeneratedCaptionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [copyId, setCopyId] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    const data = await getGeneratedCaptions(user.uid);
    setCaptions(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [user, refreshTrigger]);

  const handleDelete = async (id: string) => {
    if (window.confirm("Hapus hasil generate ini?")) {
      await deleteGeneratedCaption(id);
      fetchData();
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopyId(id);
    setTimeout(() => setCopyId(null), 2000);
  };

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <div className="animate-spin h-8 w-8 border-2 border-amber-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (captions.length === 0) {
    return (
      <div className="text-center py-16 px-4 bg-slate-800 rounded-2xl border border-slate-700 border-dashed">
        <div className="text-4xl mb-4">📝</div>
        <h3 className="text-lg font-semibold text-slate-300">Belum ada riwayat caption</h3>
        <p className="text-slate-500 mt-2">Masuk ke tab "Buat Caption" untuk memulai.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <h2 className="text-xl font-bold text-white flex items-center gap-2">
        <span className="bg-indigo-900/50 text-indigo-400 p-2 rounded-lg border border-indigo-800">📚</span>
        Riwayat Caption ({captions.length})
      </h2>
      
      <div className="grid gap-6">
        {captions.map((item) => (
          <div 
            key={item.id} 
            className="bg-slate-800 rounded-2xl shadow-lg border border-slate-700 overflow-hidden hover:border-slate-600 transition-all"
          >
            {/* Header Card */}
            <div className="p-5 border-b border-slate-700 bg-slate-800/80 flex justify-between items-start">
              <div className="flex-1 min-w-0 pr-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-amber-500 uppercase tracking-wider">
                    {item.storeName}
                  </span>
                  <span className="text-slate-600">•</span>
                  <span className="px-2 py-0.5 bg-blue-900/30 text-blue-400 text-[10px] font-bold uppercase rounded-full tracking-wide border border-blue-900/50">
                    {item.tone}
                  </span>
                </div>
                <h3 className="font-bold text-white text-lg truncate" title={item.productName}>
                  {item.productName}
                </h3>
                {item.productLink && (
                  <a 
                    href={item.productLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs text-blue-400 hover:text-blue-300 hover:underline flex items-center gap-1 mt-1 truncate"
                  >
                    Link: {item.productLink} ↗
                  </a>
                )}
              </div>
              <button
                onClick={() => item.id && handleDelete(item.id)}
                className="text-slate-500 hover:text-red-400 transition-colors p-1"
                title="Hapus"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Caption Box */}
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-700 relative group">
                <p className="whitespace-pre-wrap text-slate-300 leading-relaxed font-normal text-sm md:text-base">
                  {item.generatedCaption}
                </p>
              </div>

              {/* Hashtags */}
              <div className="flex flex-wrap gap-2">
                {item.hashtags.map((tag, idx) => (
                  <span key={idx} className="text-xs font-medium text-blue-400 bg-blue-900/20 px-2 py-1 rounded-md cursor-default border border-blue-900/30">
                    {tag.startsWith('#') ? tag : `#${tag}`}
                  </span>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex justify-between items-center border-t border-slate-700 mt-4">
                <div className="text-xs text-slate-500">
                   {item.createdAt?.toDate().toLocaleDateString('id-ID')}
                </div>
                <button
                  onClick={() => {
                    const fullText = `${item.generatedCaption}\n\n${item.hashtags.map(t => t.startsWith('#') ? t : `#${t}`).join(' ')}`;
                    handleCopy(fullText, item.id || 'unknown');
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                    copyId === item.id
                      ? 'bg-green-900/30 text-green-400 border border-green-800'
                      : 'bg-amber-500 text-slate-900 hover:bg-amber-400 shadow-md'
                  }`}
                >
                  {copyId === item.id ? (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                      Disalin!
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                      Salin Semua
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductList;