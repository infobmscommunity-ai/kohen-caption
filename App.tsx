import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { auth } from './firebase';
import Auth from './components/Auth';
import ProductInput from './components/ProductInput';
import ProductGenerator from './components/ProductGenerator';
import ProductList from './components/ProductList';
import StrategyBuilder from './components/StrategyBuilder';
import MainBrainSetup from './components/MainBrainSetup';

type TabType = 'input' | 'mainBrain' | 'strategy' | 'generate' | 'history';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('input');
  const [refreshHistory, setRefreshHistory] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try { await signOut(auth); } 
    catch (error) { console.error("Error signing out:", error); }
  };

  const handleGenerateSuccess = () => {
    setActiveTab('history');
    setRefreshHistory(prev => prev + 1);
  };

  const menuItems = [
    { id: 'input', label: 'Input Data Produk', icon: '📦' },
    { id: 'mainBrain', label: 'Otak Utama', icon: '🧠' },
    { id: 'strategy', label: 'Racik Strategi', icon: '⚡' },
    { id: 'generate', label: 'Buat Caption', icon: '✨' },
    { id: 'history', label: 'Riwayat', icon: '📚' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  return (
    <div className="min-h-screen bg-slate-900 font-sans text-slate-100 relative">
      
      {/* Sidebar Overlay */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setIsMenuOpen(false)}
        ></div>
      )}

      {/* Sidebar Drawer */}
      <aside className={`fixed top-0 left-0 h-full w-64 bg-slate-800 border-r border-slate-700 z-50 transform transition-transform duration-300 ease-in-out shadow-2xl ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="h-16 flex items-center px-6 border-b border-slate-700 bg-slate-800">
             <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-yellow-600 rounded-lg flex items-center justify-center text-slate-900 font-bold mr-3">
                K
              </div>
            <span className="text-lg font-bold text-white tracking-wide">KOHEN AI</span>
            <button 
              onClick={() => setIsMenuOpen(false)}
              className="ml-auto text-slate-400 hover:text-white"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-4">
            <nav className="px-4 space-y-2">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id as TabType);
                    setIsMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    activeTab === item.id
                      ? 'bg-gradient-to-r from-blue-900/50 to-indigo-900/50 text-blue-400 border border-blue-800 shadow-lg shadow-blue-900/20'
                      : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="font-medium text-sm">{item.label}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="p-4 border-t border-slate-700 bg-slate-800/50">
            <div className="flex items-center gap-3 mb-4">
              <img 
                src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}&background=0D8ABC&color=fff`} 
                alt="Profile" 
                className="h-10 w-10 rounded-full border-2 border-slate-600"
              />
              <div className="overflow-hidden">
                <p className="text-sm font-medium text-white truncate">{user.displayName}</p>
                <p className="text-xs text-slate-500 truncate">{user.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-red-900/20 text-red-400 hover:bg-red-900/40 hover:text-red-300 transition-colors text-sm font-medium border border-red-900/30"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              Keluar Aplikasi
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen">
        
        {/* Navbar */}
        <nav className="sticky top-0 z-30 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setIsMenuOpen(true)}
                  className="p-2 -ml-2 text-slate-400 hover:text-white rounded-lg transition-colors"
                >
                  {/* Hamburger Icon */}
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                <div className="flex items-center gap-2">
                   <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-yellow-600 rounded-lg flex items-center justify-center text-slate-900 font-bold">
                    K
                  </div>
                  <span className="text-lg font-bold text-white hidden sm:block tracking-wide">
                    KOHEN <span className="text-amber-400">CAPTION AI</span>
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold px-3 py-1 bg-blue-900/30 text-blue-400 rounded-full border border-blue-900/50">
                  {menuItems.find(i => i.id === activeTab)?.label}
                </span>
              </div>
            </div>
          </div>
        </nav>

        {/* Content */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {activeTab === 'input' && (
            <div className="animate-fade-in">
              <ProductInput user={user} />
            </div>
          )}

          {activeTab === 'mainBrain' && (
            <div className="animate-fade-in">
              <MainBrainSetup user={user} />
            </div>
          )}

          {activeTab === 'strategy' && (
            <div className="animate-fade-in">
              <StrategyBuilder user={user} />
            </div>
          )}

          {activeTab === 'generate' && (
            <div className="animate-fade-in">
               <ProductGenerator 
                user={user} 
                onSuccess={handleGenerateSuccess} 
                onSwitchTab={(t) => {
                  setActiveTab(t as TabType);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
               />
            </div>
          )}

          {activeTab === 'history' && (
            <div className="animate-fade-in">
              <ProductList user={user} refreshTrigger={refreshHistory} />
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;