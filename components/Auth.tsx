import React, { useState, useEffect } from 'react';
import { 
  signInWithPopup, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  confirmPasswordReset
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase';

type AuthMode = 'login' | 'register' | 'forgot' | 'reset';

const Auth: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [oobCode, setOobCode] = useState<string | null>(null);

  // Check for password reset code in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('oobCode');
    if (code) {
      setOobCode(code);
      setMode('reset');
    }
  }, []);

  const resetForm = () => {
    setError(null);
    setSuccessMsg(null);
    setEmail('');
    setPassword('');
    setName('');
  };

  const switchMode = (newMode: AuthMode) => {
    resetForm();
    setMode(newMode);
  };

  const getErrorMessage = (err: any) => {
    const code = err.code;
    switch (code) {
      case 'auth/email-already-in-use': return 'Email sudah terdaftar.';
      case 'auth/invalid-email': return 'Format email tidak valid.';
      case 'auth/user-not-found': return 'Pengguna tidak ditemukan.';
      case 'auth/wrong-password': return 'Password salah.';
      case 'auth/weak-password': return 'Password terlalu lemah (min. 6 karakter).';
      case 'auth/too-many-requests': return 'Terlalu banyak percobaan. Coba lagi nanti.';
      case 'auth/expired-action-code': return 'Link reset password sudah kadaluarsa.';
      default: return err.message || 'Terjadi kesalahan. Silakan coba lagi.';
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      setError(getErrorMessage(err));
      setLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return setError("Mohon isi semua field.");
    
    try {
      setLoading(true);
      setError(null);
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      setError(getErrorMessage(err));
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !name) return setError("Mohon isi semua field.");

    try {
      setLoading(true);
      setError(null);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update Display Name
      if (userCredential.user) {
        await updateProfile(userCredential.user, {
          displayName: name
        });
      }
      
      // Auto login happens automatically after create
    } catch (err: any) {
      setError(getErrorMessage(err));
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return setError("Mohon masukkan email Anda.");

    try {
      setLoading(true);
      setError(null);
      await sendPasswordResetEmail(auth, email);
      setSuccessMsg("Link reset password telah dikirim ke email Anda.");
      setLoading(false);
    } catch (err: any) {
      setError(getErrorMessage(err));
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword) return setError("Mohon masukkan password baru.");
    if (!oobCode) return setError("Kode reset tidak valid.");

    try {
      setLoading(true);
      setError(null);
      await confirmPasswordReset(auth, oobCode, newPassword);
      setSuccessMsg("Password berhasil diubah. Silakan login.");
      setTimeout(() => {
        setOobCode(null);
        window.history.replaceState({}, document.title, window.location.pathname);
        setMode('login');
      }, 3000);
    } catch (err: any) {
      setError(getErrorMessage(err));
      setLoading(false);
    }
  };

  // Render Functions
  const renderLogo = () => (
    <div className="mb-8 flex flex-col items-center justify-center animate-fade-in">
      <div className="h-20 w-20 bg-gradient-to-br from-amber-400 to-yellow-600 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/20 mb-4 transform rotate-3 hover:rotate-0 transition-all duration-500">
        <span className="text-4xl font-black text-slate-900">K</span>
      </div>
      <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-600 tracking-wider text-center drop-shadow-sm">
        KOHEN CAPTION AI
      </h1>
      <div className="h-1 w-24 bg-blue-600 mt-2 rounded-full"></div>
    </div>
  );

  const renderError = () => error && (
    <div className="mb-4 p-3 bg-red-900/30 text-red-300 text-sm rounded-lg border border-red-800 flex items-start gap-2">
      <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      {error}
    </div>
  );

  const renderSuccess = () => successMsg && (
    <div className="mb-4 p-3 bg-emerald-900/30 text-emerald-300 text-sm rounded-lg border border-emerald-800 flex items-start gap-2">
      <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
      {successMsg}
    </div>
  );

  if (mode === 'reset') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4 relative overflow-hidden">
        {/* Background Accents */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[100px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-amber-500/10 rounded-full blur-[100px]"></div>
        </div>

        <div className="max-w-md w-full bg-slate-800 rounded-3xl shadow-2xl p-8 border border-slate-700 relative z-10">
          {renderLogo()}
          <h2 className="text-xl font-bold text-white mb-2 text-center">Buat Password Baru</h2>
          <p className="text-slate-400 mb-6 text-center text-sm">Masukkan password baru untuk akun Anda.</p>
          
          {renderError()}
          {renderSuccess()}

          {!successMsg && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Password Baru</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 text-white rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all placeholder-slate-600"
                  placeholder="Minimal 6 karakter"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3.5 px-4 rounded-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-blue-900/30"
              >
                {loading ? 'Menyimpan...' : 'Simpan Password Baru'}
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4 relative overflow-hidden">
       {/* Background Accents */}
       <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-900/20 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-amber-900/20 rounded-full blur-[120px]"></div>
        </div>

      <div className="max-w-md w-full bg-slate-800 rounded-3xl shadow-2xl p-8 border border-slate-700 relative z-10">
        {renderLogo()}
        
        <h2 className="text-xl font-bold text-white mb-2 text-center">
          {mode === 'login' && 'Selamat Datang'}
          {mode === 'register' && 'Gabung Sekarang'}
          {mode === 'forgot' && 'Pemulihan Akun'}
        </h2>
        
        <p className="text-slate-400 mb-8 text-center text-sm">
          {mode === 'login' && 'Masuk untuk mengakses otak digital Anda.'}
          {mode === 'register' && 'Daftar dan rasakan kecerdasan Kohen AI.'}
          {mode === 'forgot' && 'Kami akan mengirimkan link reset ke email Anda.'}
        </p>

        {renderError()}
        {renderSuccess()}

        <form onSubmit={mode === 'login' ? handleEmailLogin : mode === 'register' ? handleRegister : handleForgotPassword} className="space-y-4">
          
          {mode === 'register' && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Nama Lengkap</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 text-white rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all placeholder-slate-600"
                placeholder="Nama Anda"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700 text-white rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all placeholder-slate-600"
              placeholder="nama@email.com"
              required
            />
          </div>

          {mode !== 'forgot' && (
            <div>
              <div className="flex justify-between mb-1">
                <label className="block text-sm font-medium text-slate-300">Password</label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => switchMode('forgot')}
                    className="text-xs text-amber-500 hover:text-amber-400 font-medium transition-colors"
                  >
                    Lupa Password?
                  </button>
                )}
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 text-white rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all placeholder-slate-600"
                placeholder="******"
                required
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-lg shadow-blue-900/30 disabled:opacity-70 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Memproses...
              </span>
            ) : (
              mode === 'login' ? 'Masuk Sekarang' : mode === 'register' ? 'Daftar Akun' : 'Kirim Link Reset'
            )}
          </button>
        </form>

        {mode !== 'forgot' && (
          <>
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-slate-800 text-slate-500">atau masuk dengan</span>
              </div>
            </div>

            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-slate-900 border border-slate-700 hover:bg-slate-700 hover:border-slate-600 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 shadow-sm disabled:opacity-70"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Google
            </button>
          </>
        )}

        <div className="mt-8 text-center text-sm">
          {mode === 'login' ? (
            <p className="text-slate-500">
              Belum punya akun?{' '}
              <button onClick={() => switchMode('register')} className="text-amber-500 font-bold hover:text-amber-400 transition-colors">
                Daftar sekarang
              </button>
            </p>
          ) : mode === 'register' ? (
            <p className="text-slate-500">
              Sudah punya akun?{' '}
              <button onClick={() => switchMode('login')} className="text-amber-500 font-bold hover:text-amber-400 transition-colors">
                Masuk
              </button>
            </p>
          ) : (
            <button onClick={() => switchMode('login')} className="text-amber-500 font-bold hover:text-amber-400 transition-colors flex items-center justify-center w-full gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              Kembali ke Login
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;