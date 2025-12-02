import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { saveStrategy, getStrategies, deleteStrategy, updateStrategy } from '../services/firebaseService';
import { ContentStrategy } from '../types';

interface StrategyBuilderProps {
  user: User;
}

const StrategyBuilder: React.FC<StrategyBuilderProps> = ({ user }) => {
  const [strategies, setStrategies] = useState<ContentStrategy[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Form State
  const [title, setTitle] = useState('');
  const [hook, setHook] = useState('');
  const [example, setExample] = useState('');
  
  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetchStrategies();
  }, [user]);

  const fetchStrategies = async () => {
    const data = await getStrategies(user.uid);
    setStrategies(data);
  };

  const handleEdit = (item: ContentStrategy) => {
    setTitle(item.title);
    setHook(item.hook);
    setExample(item.example);
    setEditingId(item.id || null);
    
    // Scroll ke atas agar user melihat form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setTitle('');
    setHook('');
    setExample('');
    setEditingId(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !hook || !example) return;

    setLoading(true);
    try {
      const strategyData = {
        userId: user.uid,
        title,
        hook,
        example
      };

      if (editingId) {
        // Mode Update
        await updateStrategy(editingId, strategyData);
        alert("Strategi berhasil diperbarui!");
      } else {
        // Mode Create
        await saveStrategy(strategyData);
        alert("Strategi berhasil disimpan!");
      }

      handleCancelEdit(); // Reset form
      await fetchStrategies();
    } catch (error) {
      console.error(error);
      alert("Gagal menyimpan strategi.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Hapus strategi ini?")) {
      await deleteStrategy(id);
      if (editingId === id) {
        handleCancelEdit();
      }
      fetchStrategies();
    }
  };

  return (
    <div className="grid lg:grid-cols-12 gap-8">
      {/* Form Section */}
      <div className="lg:col-span-5 space-y-6">
        <div className="bg-slate-800 rounded-2xl shadow-xl border border-slate-700 p-6 sticky top-24">
          <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
            <span className="bg-purple-900/50 text-purple-400 p-2 rounded-lg border border-purple-800">
              {editingId ? '✏️' : '🧠'}
            </span>
            {editingId ? 'Edit Strategi' : 'Isi Otak AI'}
          </h2>
          <p className="text-sm text-slate-400 mb-6">
            {editingId 
              ? 'Ubah detail strategi di bawah ini.' 
              : 'Ajarkan AI cara menulis sesuai keinginan Anda. Simpan pola hook dan contoh caption favorit Anda di sini.'}
          </p>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-1">Nama Strategi</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none text-white placeholder-slate-600"
                placeholder="Contoh: Hard Selling Promo Gajian"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-1">
                Jenis Hook / Pancingan
              </label>
              <textarea
                value={hook}
                onChange={(e) => setHook(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none h-20 text-sm text-white placeholder-slate-600"
                placeholder="Contoh: Mulai dengan pertanyaan tentang masalah wajah berjerawat..."
                required
              />
              <p className="text-xs text-slate-500 mt-1">Jelaskan bagaimana kalimat pembuka harus dibuat.</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-1">
                Contoh Caption (Untuk Ditiru)
              </label>
              <textarea
                value={example}
                onChange={(e) => setExample(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none h-32 text-sm text-white placeholder-slate-600"
                placeholder="Paste contoh caption lengkap yang gayanya Anda sukai di sini..."
                required
              />
              <p className="text-xs text-slate-500 mt-1">AI akan meniru struktur dan gaya bahasa dari contoh ini.</p>
            </div>

            <div className="flex gap-3 pt-2">
              {editingId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold rounded-xl transition-all border border-slate-600"
                >
                  Batal
                </button>
              )}
              <button
                type="submit"
                disabled={loading}
                className={`flex-1 py-3 font-bold rounded-xl transition-all text-white shadow-lg ${
                  editingId 
                    ? 'bg-amber-500 hover:bg-amber-600 text-slate-900'
                    : 'bg-purple-600 hover:bg-purple-700'
                }`}
              >
                {loading 
                  ? "Menyimpan..." 
                  : editingId 
                    ? "Update Strategi" 
                    : "Simpan ke Otak AI"
                }
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* List Section */}
      <div className="lg:col-span-7">
        <h3 className="text-lg font-bold text-white mb-4">Strategi Tersimpan ({strategies.length})</h3>
        
        {strategies.length === 0 ? (
          <div className="text-center py-12 bg-slate-800 rounded-2xl border border-dashed border-slate-700">
            <div className="text-4xl mb-3">🧠</div>
            <h4 className="font-semibold text-slate-300">Otak Masih Kosong</h4>
            <p className="text-slate-500 text-sm mt-1">Buat strategi pertama Anda di formulir samping.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {strategies.map((item) => (
              <div 
                key={item.id} 
                className={`bg-slate-800 p-5 rounded-2xl border transition-all relative group shadow-md ${
                  editingId === item.id 
                    ? 'border-amber-500/50 ring-1 ring-amber-500/30' 
                    : 'border-slate-700 hover:border-slate-600'
                }`}
              >
                <div className="absolute top-3 right-3 flex gap-2">
                  {/* Edit Button */}
                  <button 
                    onClick={() => handleEdit(item)}
                    className="p-1.5 text-slate-500 hover:text-amber-400 hover:bg-slate-700 rounded-lg transition-colors"
                    title="Edit Strategi"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  </button>
                  {/* Delete Button */}
                  <button 
                    onClick={() => item.id && handleDelete(item.id)}
                    className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-700 rounded-lg transition-colors"
                    title="Hapus Strategi"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>

                <div className="pr-16">
                  <h4 className="font-bold text-white mb-2 truncate text-lg" title={item.title}>{item.title}</h4>
                  
                  <div className="mb-3">
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Hook</span>
                    <p className="text-xs text-slate-300 line-clamp-2 bg-slate-900 p-2 rounded-lg mt-1 border border-slate-700">
                      {item.hook}
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Contoh</span>
                    <p className="text-xs text-slate-400 line-clamp-2 italic mt-1 border-l-2 border-slate-600 pl-2">
                      "{item.example}"
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StrategyBuilder;