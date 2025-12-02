import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { saveMainBrain, getMainBrains, deleteMainBrain, updateMainBrain } from '../services/firebaseService';
import { MainBrain } from '../types';

interface MainBrainSetupProps {
  user: User;
}

const MainBrainSetup: React.FC<MainBrainSetupProps> = ({ user }) => {
  const [brains, setBrains] = useState<MainBrain[]>([]);
  
  // Form State
  const [title, setTitle] = useState('');
  const [instruction, setInstruction] = useState('');
  
  // UI State
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetchBrains();
  }, [user]);

  const fetchBrains = async () => {
    const data = await getMainBrains(user.uid);
    setBrains(data);
  };

  const handleEdit = (item: MainBrain) => {
    setTitle(item.title);
    setInstruction(item.instruction);
    setEditingId(item.id || null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setTitle('');
    setInstruction('');
    setEditingId(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !instruction) return;

    setLoading(true);
    try {
      const brainData = {
        userId: user.uid,
        title,
        instruction
      };

      if (editingId) {
        // Update
        await updateMainBrain(editingId, brainData);
        alert("Otak berhasil diperbarui!");
      } else {
        // Create
        await saveMainBrain(brainData);
        alert("Otak baru berhasil dibuat!");
      }

      handleCancelEdit();
      await fetchBrains();
    } catch (error) {
      console.error(error);
      alert("Gagal menyimpan data.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Yakin ingin menghapus karakter/otak ini?")) {
      await deleteMainBrain(id);
      if (editingId === id) handleCancelEdit();
      fetchBrains();
    }
  };

  return (
    <div className="grid lg:grid-cols-12 gap-8">
      {/* Left: Form */}
      <div className="lg:col-span-5 space-y-6">
        <div className="bg-slate-800 rounded-2xl shadow-xl border border-slate-700 p-6 sticky top-24">
          <div className="bg-gradient-to-r from-indigo-900 to-purple-900 -mx-6 -mt-6 px-6 py-4 rounded-t-2xl mb-6 border-b border-indigo-800/50">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="text-2xl">🧠</span>
              {editingId ? 'Edit Karakter Otak' : 'Tambah Karakter Otak'}
            </h2>
            <p className="text-indigo-200 text-xs mt-1">
              Buat persona atau aturan global untuk aplikasi Anda.
            </p>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-1">
                Nama Karakter/Otak
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-white placeholder-slate-600"
                placeholder="Contoh: Admin Gaul Jaksel, Corporate Formal"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-1">
                Instruksi & Aturan (Prompt System)
              </label>
              <textarea
                value={instruction}
                onChange={(e) => setInstruction(e.target.value)}
                className="w-full h-64 px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-sm leading-relaxed resize-y text-white placeholder-slate-600"
                placeholder="Contoh Aturan Mutlak:
1. Dilarang menggunakan kata kasar.
2. Selalu gunakan sapaan 'Bestie'.
3. Gaya bahasa santai tapi sopan.
4. Wajib sertakan info pengiriman di akhir."
                required
              />
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
                    : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                {loading 
                  ? "Menyimpan..." 
                  : editingId 
                    ? "Update Otak" 
                    : "Simpan Otak"
                }
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Right: List */}
      <div className="lg:col-span-7">
        <h3 className="text-lg font-bold text-white mb-4">Daftar Otak / Karakter ({brains.length})</h3>
        
        {brains.length === 0 ? (
          <div className="text-center py-12 bg-slate-800 rounded-2xl border border-dashed border-slate-700">
            <div className="text-4xl mb-3">🧠</div>
            <h4 className="font-semibold text-slate-300">Belum Ada Otak Tersimpan</h4>
            <p className="text-slate-500 text-sm mt-1">Buat karakter pertama Anda di formulir samping.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {brains.map((item) => (
              <div 
                key={item.id} 
                className={`bg-slate-800 p-5 rounded-2xl border transition-all relative group shadow-md ${
                  editingId === item.id 
                    ? 'border-amber-500/50 ring-1 ring-amber-500/30' 
                    : 'border-slate-700 hover:border-slate-600'
                }`}
              >
                <div className="absolute top-4 right-4 flex gap-2">
                  <button 
                    onClick={() => handleEdit(item)}
                    className="p-1.5 text-slate-500 hover:text-amber-400 hover:bg-slate-700 rounded-lg transition-colors border border-transparent hover:border-amber-900/30"
                    title="Edit"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  </button>
                  <button 
                    onClick={() => item.id && handleDelete(item.id)}
                    className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-700 rounded-lg transition-colors border border-transparent hover:border-red-900/30"
                    title="Hapus"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-1 w-10 h-10 rounded-full bg-indigo-900/30 border border-indigo-700/50 flex items-center justify-center text-lg flex-shrink-0">
                    🧠
                  </div>
                  <div className="pr-16 flex-1">
                    <h4 className="font-bold text-white text-lg mb-1">{item.title}</h4>
                    <div className="bg-slate-900 p-3 rounded-lg border border-slate-700 text-slate-400 text-sm whitespace-pre-wrap line-clamp-4 leading-relaxed">
                      {item.instruction}
                    </div>
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

export default MainBrainSetup;