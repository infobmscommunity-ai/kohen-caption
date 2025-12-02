import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { 
  saveCatalogProduct, 
  getCatalogProducts, 
  deleteCatalogProduct, 
  updateCatalogProduct 
} from '../services/firebaseService';
import { ProductCatalogItem } from '../types';

interface ProductInputProps {
  user: User;
}

const ProductInput: React.FC<ProductInputProps> = ({ user }) => {
  // Form State
  const [storeName, setStoreName] = useState('');
  const [productName, setProductName] = useState('');
  const [productLink, setProductLink] = useState('');
  const [description, setDescription] = useState('');
  
  // UI State
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<ProductCatalogItem[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Load existing catalog
  useEffect(() => {
    fetchProducts();
  }, [user]);

  const fetchProducts = async () => {
    setIsRefreshing(true);
    const data = await getCatalogProducts(user.uid);
    setProducts(data);
    setIsRefreshing(false);
  };

  const resetForm = () => {
    setProductName('');
    setProductLink('');
    setDescription('');
    setEditingId(null);
  };

  const handleEdit = (item: ProductCatalogItem) => {
    setStoreName(item.storeName);
    setProductName(item.productName);
    setProductLink(item.productLink);
    setDescription(item.description);
    setEditingId(item.id || null);
    
    // Scroll ke form di tampilan mobile
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    resetForm();
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName || !description || !storeName) return;

    setLoading(true);
    try {
      const productData = {
        userId: user.uid,
        storeName,
        productName,
        productLink,
        description
      };

      if (editingId) {
        // Mode Update
        await updateCatalogProduct(editingId, productData);
        alert("Data produk berhasil diperbarui!");
      } else {
        // Mode Create
        await saveCatalogProduct(productData);
        alert("Produk berhasil disimpan ke koleksi DATA PRODUK!");
      }
      
      resetForm();
      await fetchProducts();
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan saat menyimpan data.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Yakin ingin menghapus produk ini dari database?")) {
      try {
        await deleteCatalogProduct(id);
        if (editingId === id) {
          handleCancelEdit();
        }
        fetchProducts();
      } catch (error) {
        alert("Gagal menghapus data.");
      }
    }
  };

  return (
    <div className="grid lg:grid-cols-12 gap-8">
      {/* Left: Input Form (Create/Update) */}
      <div className="lg:col-span-5 bg-slate-800 rounded-2xl shadow-xl border border-slate-700 p-6 h-fit sticky top-24">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <span className="bg-emerald-900/50 text-emerald-400 p-2 rounded-lg border border-emerald-800">
            {editingId ? '✏️' : '📦'}
          </span>
          {editingId ? 'Edit Data Produk' : 'Input Data Produk Baru'}
        </h2>
        
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-1">Nama Toko <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-white placeholder-slate-600"
              placeholder="Contoh: Toko Berkah"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-1">Nama Produk <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-white placeholder-slate-600"
              placeholder="Contoh: Hijab Premium"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-1">Link Produk (Opsional)</label>
            <input
              type="url"
              value={productLink}
              onChange={(e) => setProductLink(e.target.value)}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-white placeholder-slate-600"
              placeholder="https://..."
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-1">Deskripsi Produk <span className="text-red-500">*</span></label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none min-h-[100px] text-white placeholder-slate-600"
              placeholder="Detail bahan, ukuran, kelebihan..."
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
                  : 'bg-emerald-600 hover:bg-emerald-700'
              }`}
            >
              {loading 
                ? "Memproses..." 
                : editingId 
                  ? "Update Data" 
                  : "Simpan Data"
              }
            </button>
          </div>
        </form>
      </div>

      {/* Right: List Data (Read/Delete/Edit Trigger) */}
      <div className="lg:col-span-7 space-y-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-bold text-white">Daftar Produk ({products.length})</h3>
          <button 
            onClick={fetchProducts} 
            className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1 bg-blue-900/20 px-3 py-1 rounded-lg border border-blue-900/50"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            Refresh
          </button>
        </div>
        
        {isRefreshing ? (
          <div className="text-center py-10"><div className="animate-spin h-8 w-8 border-2 border-emerald-500 border-t-transparent rounded-full mx-auto"></div></div>
        ) : products.length === 0 ? (
          <div className="text-center py-12 bg-slate-800 rounded-2xl border border-dashed border-slate-700">
            <div className="text-4xl mb-3">📭</div>
            <h4 className="font-semibold text-slate-300">Koleksi "DATA PRODUK" Kosong</h4>
            <p className="text-slate-500 text-sm mt-1">Isi formulir di samping untuk menambahkan produk.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {products.map((item) => (
              <div 
                key={item.id} 
                className={`p-5 rounded-2xl border transition-all relative group shadow-md ${
                  editingId === item.id 
                    ? 'bg-amber-900/10 border-amber-500/50 ring-1 ring-amber-500/30' 
                    : 'bg-slate-800 border-slate-700 hover:bg-slate-750'
                }`}
              >
                <div className="absolute top-3 right-3 flex gap-2">
                  {/* Edit Button */}
                  <button 
                    onClick={() => handleEdit(item)}
                    className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-amber-900/20 rounded-lg transition-colors border border-transparent hover:border-amber-900/30"
                    title="Edit Data"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  </button>
                  {/* Delete Button */}
                  <button 
                    onClick={() => item.id && handleDelete(item.id)}
                    className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-colors border border-transparent hover:border-red-900/30"
                    title="Hapus Data"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>

                <div className="text-xs font-bold text-emerald-400 mb-2 uppercase tracking-wide bg-emerald-900/20 inline-block px-2 py-1 rounded border border-emerald-900/30">
                  {item.storeName}
                </div>
                <h4 className="font-bold text-white mb-2 pr-14 text-lg">{item.productName}</h4>
                <p className="text-sm text-slate-400 line-clamp-3 mb-4 leading-relaxed border-t border-slate-700/50 pt-2">
                  {item.description}
                </p>
                {item.productLink && (
                  <a href={item.productLink} target="_blank" rel="noreferrer" className="text-xs text-blue-400 hover:text-blue-300 hover:underline flex items-center gap-1 font-medium mt-auto">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                    Link Produk
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductInput;