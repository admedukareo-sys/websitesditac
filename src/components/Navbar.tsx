import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown, Sparkles, GraduationCap, Heart, BookOpen, PhoneCall } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import TopBar from './TopBar';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profilDropdown, setProfilDropdown] = useState(false);
  const [kesiswaanDropdown, setKesiswaanDropdown] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 shadow-xl">
      {/* TopBar Header */}
      <TopBar />

      {/* Main Glassmorphism Navbar with vibrant emerald & teal blend */}
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950/95 backdrop-blur-md text-white border-b border-emerald-700/50 shadow-emerald-950/20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between py-3">
            {/* Official Logo Brand */}
            <Link to="/" className="flex items-center gap-3.5 group">
              <div className="bg-white p-1.5 rounded-2xl shadow-lg shadow-emerald-950/40 group-hover:scale-105 group-hover:rotate-2 transition-all duration-300 ring-2 ring-amber-400/40">
                <img 
                  src="/logo.png" 
                  alt="Logo SD IT Andalas Cendekia" 
                  className="h-10 sm:h-12 w-auto object-contain"
                />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h1 className="font-black text-lg sm:text-2xl leading-none tracking-tight text-white drop-shadow-sm">SD IT</h1>
                  <span className="bg-gradient-to-r from-amber-300 to-amber-500 text-slate-950 text-[10px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider animate-pulse">AC</span>
                </div>
                <p className="text-xs text-amber-300 font-bold tracking-wide flex items-center gap-1">
                  <span>Andalas Cendekia</span>
                  <Sparkles size={11} className="text-amber-400 inline" />
                </p>
              </div>
            </Link>
            
            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-7 text-sm font-semibold">
              <Link 
                to="/" 
                className={`relative py-1 transition-all duration-200 hover:text-amber-300 ${
                  isActive('/') ? 'text-amber-400 font-bold' : 'text-emerald-100'
                }`}
              >
                Beranda
                {isActive('/') && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-amber-400 rounded-full animate-pulse" />
                )}
              </Link>

              {/* Dropdown Profil */}
              <div 
                className="relative"
                onMouseEnter={() => setProfilDropdown(true)}
                onMouseLeave={() => setProfilDropdown(false)}
              >
                <button className={`flex items-center gap-1.5 py-1 transition-colors hover:text-amber-300 ${
                  isActive('/profil') ? 'text-amber-400 font-bold' : 'text-emerald-100'
                }`}>
                  <span>Profil & Visi</span>
                  <ChevronDown size={15} className={`transition-transform duration-200 ${profilDropdown ? 'rotate-180 text-amber-400' : ''}`} />
                </button>
                {profilDropdown && (
                  <div className="absolute top-full left-0 w-56 bg-emerald-950/95 backdrop-blur-xl border border-emerald-700/60 rounded-2xl shadow-2xl py-2 animate-fadeIn z-50 ring-1 ring-white/10">
                    <Link to="/profil" className="flex items-center gap-2 px-4 py-2.5 hover:bg-emerald-800/80 hover:text-amber-300 transition-colors text-xs font-medium text-emerald-100">
                      <GraduationCap size={15} className="text-amber-400" />
                      <span>Profil & Sejarah Sekolah</span>
                    </Link>
                    <Link to="/profil" className="flex items-center gap-2 px-4 py-2.5 hover:bg-emerald-800/80 hover:text-amber-300 transition-colors text-xs font-medium text-emerald-100">
                      <Heart size={15} className="text-amber-400" />
                      <span>Visi, Misi & 3 Pilar Khas</span>
                    </Link>
                  </div>
                )}
              </div>

              <Link 
                to="/kurikulum" 
                className={`relative py-1 transition-all duration-200 hover:text-amber-300 ${
                  isActive('/kurikulum') ? 'text-amber-400 font-bold' : 'text-emerald-100'
                }`}
              >
                Kurikulum & Tahfidz
                {isActive('/kurikulum') && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-amber-400 rounded-full animate-pulse" />
                )}
              </Link>

              {/* Dropdown Kesiswaan */}
              <div 
                className="relative"
                onMouseEnter={() => setKesiswaanDropdown(true)}
                onMouseLeave={() => setKesiswaanDropdown(false)}
              >
                <button className={`flex items-center gap-1.5 py-1 transition-colors hover:text-amber-300 ${
                  isActive('/kesiswaan') ? 'text-amber-400 font-bold' : 'text-emerald-100'
                }`}>
                  <span>Aktivitas & Ekstra</span>
                  <ChevronDown size={15} className={`transition-transform duration-200 ${kesiswaanDropdown ? 'rotate-180 text-amber-400' : ''}`} />
                </button>
                {kesiswaanDropdown && (
                  <div className="absolute top-full left-0 w-56 bg-emerald-950/95 backdrop-blur-xl border border-emerald-700/60 rounded-2xl shadow-2xl py-2 animate-fadeIn z-50 ring-1 ring-white/10">
                    <Link to="/kesiswaan" className="flex items-center gap-2 px-4 py-2.5 hover:bg-emerald-800/80 hover:text-amber-300 transition-colors text-xs font-medium text-emerald-100">
                      <BookOpen size={15} className="text-amber-400" />
                      <span>Ekstrakurikuler (9 Cabang)</span>
                    </Link>
                    <Link to="/kesiswaan" className="flex items-center gap-2 px-4 py-2.5 hover:bg-emerald-800/80 hover:text-amber-300 transition-colors text-xs font-medium text-emerald-100">
                      <Sparkles size={15} className="text-amber-400" />
                      <span>Galeri Prestasi Santri</span>
                    </Link>
                  </div>
                )}
              </div>

              <Link 
                to="/kontak" 
                className={`relative py-1 transition-all duration-200 hover:text-amber-300 ${
                  isActive('/kontak') ? 'text-amber-400 font-bold' : 'text-emerald-100'
                }`}
              >
                Hubungi Kami
                {isActive('/kontak') && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-amber-400 rounded-full animate-pulse" />
                )}
              </Link>
              
              <div className="h-5 w-px bg-emerald-700/80 mx-1"></div>
              
              {user ? (
                <div className="flex items-center gap-3">
                  <Link 
                    to={(user.role === 'ADMIN' || user.role === 'PANITIA_SPMB') ? '/admin' : '/spmb/dashboard'} 
                    className="bg-emerald-800 hover:bg-emerald-700 text-white px-4 py-2 rounded-full transition-all duration-300 text-xs font-bold border border-emerald-500/60 shadow"
                  >
                    Dashboard ({user.role === 'PANITIA_SPMB' ? 'Panitia' : user.role})
                  </Link>
                  <button 
                    onClick={handleLogout} 
                    className="text-emerald-300 hover:text-white transition-colors text-xs font-semibold"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <Link 
                  to="/spmb" 
                  className="relative group overflow-hidden bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-amber-950 font-black px-6 py-2.5 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg shadow-amber-500/30 text-xs tracking-wider uppercase flex items-center gap-2 ring-2 ring-amber-300/50"
                >
                  <Sparkles size={14} className="text-amber-950 animate-spin" style={{ animationDuration: '4s' }} />
                  <span>Portal SPMB</span>
                  <span className="bg-amber-950 text-amber-300 text-[10px] px-1.5 py-0.5 rounded-full font-bold ml-0.5">2026</span>
                </Link>
              )}
            </nav>

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden text-white focus:outline-none p-2 rounded-xl bg-emerald-900/80 border border-emerald-700 hover:bg-emerald-800 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X size={24} className="text-amber-400" /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Navigation Panel */}
          {mobileMenuOpen && (
            <div className="lg:hidden py-4 border-t border-emerald-800/80 flex flex-col gap-3 font-semibold text-sm animate-fadeIn">
              <Link to="/" onClick={() => setMobileMenuOpen(false)} className="hover:text-amber-400 py-1 text-emerald-100">Beranda</Link>
              <Link to="/profil" onClick={() => setMobileMenuOpen(false)} className="hover:text-amber-400 py-1 text-emerald-100">Profil & Visi Misi</Link>
              <Link to="/kurikulum" onClick={() => setMobileMenuOpen(false)} className="hover:text-amber-400 py-1 text-emerald-100">Kurikulum & Tahfidz</Link>
              <Link to="/kesiswaan" onClick={() => setMobileMenuOpen(false)} className="hover:text-amber-400 py-1 text-emerald-100">Ekstrakurikuler & Prestasi</Link>
              <Link to="/kontak" onClick={() => setMobileMenuOpen(false)} className="hover:text-amber-400 py-1 text-emerald-100">Hubungi Kami</Link>
              
              <hr className="border-emerald-800/80 my-2" />
              {user ? (
                <>
                  <Link 
                    to={(user.role === 'ADMIN' || user.role === 'PANITIA_SPMB') ? '/admin' : '/spmb/dashboard'} 
                    onClick={() => setMobileMenuOpen(false)}
                    className="bg-emerald-800 text-center py-2.5 rounded-xl font-bold text-white border border-emerald-600"
                  >
                    Dashboard ({user.role === 'PANITIA_SPMB' ? 'Panitia' : user.role})
                  </Link>
                  <button 
                    onClick={() => { handleLogout(); setMobileMenuOpen(false); }} 
                    className="text-left text-emerald-300 hover:text-white py-1"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link 
                  to="/spmb" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 font-black text-center py-3 rounded-2xl shadow-lg uppercase text-xs tracking-wider flex items-center justify-center gap-2"
                >
                  <Sparkles size={16} />
                  <span>Daftar SPMB 2026/2027</span>
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
