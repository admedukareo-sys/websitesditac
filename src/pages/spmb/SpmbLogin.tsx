import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';

export default function SpmbLogin() {
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleGoogleSuccess = async (credentialResponse: any) => {
    if (!credentialResponse.credential) {
      setError('Kredensial Google tidak ditemukan.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const loggedUser = await loginWithGoogle(credentialResponse.credential);
      if (loggedUser.role === 'ADMIN' || loggedUser.role === 'PANITIA_SPMB') {
        navigate('/admin');
      } else {
        navigate('/spmb/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Gagal masuk dengan Google.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const loggedUser = await login(email, password);
      if (loggedUser.role === 'ADMIN' || loggedUser.role === 'PANITIA_SPMB') {
        navigate('/admin');
      } else {
        navigate('/spmb/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-slate-900">Login Portal</h2>
          <p className="mt-2 text-sm text-slate-600">
            Belum punya akun? <Link to="/spmb/register" className="font-medium text-emerald-600 hover:text-emerald-500">Daftar di sini</Link>
          </p>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
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
              text="signin_with"
              width="360"
            />
          </div>

          <div className="relative flex items-center justify-center pt-2">
            <div className="border-t border-slate-200 w-full"></div>
            <span className="bg-white px-3 text-xs uppercase tracking-wider text-slate-400 font-semibold shrink-0">
              atau dengan email & sandi
            </span>
            <div className="border-t border-slate-200 w-full"></div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700">Email Aktif</label>
            <input 
              type="email" 
              id="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
              placeholder="Contoh: zaki@gmail.com atau admin@sdit.sch.id"
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
              className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500" 
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50"
          >
            {loading ? 'Memproses...' : 'Masuk'}
          </button>
        </form>
      </div>
    </div>
  );
}
