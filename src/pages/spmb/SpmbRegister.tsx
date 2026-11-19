import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import { AlertCircle, ArrowRight, Info, Users } from 'lucide-react';

export default function SpmbRegister() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleGoogleSuccess = async (credentialResponse: any) => {
    if (!credentialResponse.credential) {
      setError('Kredensial Google tidak ditemukan.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await loginWithGoogle(credentialResponse.credential);
      navigate('/spmb/dashboard');
    } catch (err: any) {
      setError(err.message || 'Gagal mendaftar dengan Google.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register(name, email, password);
      navigate('/spmb/dashboard');
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat pendaftaran');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-slate-900">Buat Akun SPMB</h2>
          <p className="mt-2 text-sm text-slate-600">
            Sudah punya akun? <Link to="/spmb/login" className="font-medium text-emerald-600 hover:text-emerald-500">Login di sini</Link>
          </p>
        </div>

        {/* Notice Khusus: Pendaftaran Anak Kedua / Ketiga */}
        <div className="mb-6 p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-start gap-2.5 text-xs text-emerald-900">
          <Info size={16} className="text-emerald-700 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block">Ingin mendaftarkan anak kedua atau ketiga?</span>
            <span className="text-emerald-800 leading-relaxed block mt-0.5">
              Gunakan akun yang sama! Silakan <Link to="/spmb/login" className="font-bold underline text-emerald-700 hover:text-emerald-900">Login ke Akun Anda</Link>, lalu klik menu <strong>"+ Daftarkan Anak Lainnya"</strong> di Dashboard.
            </span>
          </div>
        </div>

        {error && (
          <div className="mb-5">
            {error.toLowerCase().includes('sudah terdaftar') ? (
              <div className="bg-amber-50 border-2 border-amber-300 text-amber-950 p-4 rounded-xl text-xs space-y-2.5 shadow-xs">
                <div className="flex items-start gap-2">
                  <AlertCircle size={18} className="text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sm text-amber-900">Email {email} Sudah Terdaftar!</h4>
                    <p className="mt-1 text-amber-800 leading-relaxed">
                      Satu akun orang tua dapat digunakan untuk mendaftarkan <strong>semua anak</strong>. Silakan langsung login menggunakan email ini, lalu klik tombol <strong>"+ Daftarkan Anak Lainnya"</strong> pada dashboard Anda.
                    </p>
                  </div>
                </div>
                <div className="pt-1 flex gap-2">
                  <Link
                    to={`/spmb/login?email=${encodeURIComponent(email)}`}
                    className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3.5 py-2 rounded-lg text-xs transition-colors shadow-xs"
                  >
                    <span>Login ke Akun Anda</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}
          </div>
        )}

        {/* Alternatif SSO Google */}
        <div className="mb-6 space-y-4">
          <div className="flex justify-center w-full">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError('Koneksi Google SSO gagal. Pastikan domain sudah terdaftar di Authorized Origins Google.')}
              shape="pill"
              theme="outline"
              size="large"
              text="signup_with"
              width="360"
            />
          </div>

          <div className="relative flex items-center justify-center pt-2">
            <div className="border-t border-slate-200 w-full"></div>
            <span className="bg-white px-3 text-xs uppercase tracking-wider text-slate-400 font-semibold shrink-0">
              atau daftar manual dengan email
            </span>
            <div className="border-t border-slate-200 w-full"></div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-700">Nama Lengkap</label>
            <input 
              type="text" 
              id="name" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              required 
              className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500" 
            />
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700">Email Aktif</label>
            <input 
              type="email" 
              id="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
              className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500" 
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700">Kata Sandi</label>
            <input 
              type="password" 
              id="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
              minLength={6} 
              className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500" 
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50"
          >
            {loading ? 'Memproses...' : 'Daftar Sekarang'}
          </button>
        </form>
      </div>
    </div>
  );
}
