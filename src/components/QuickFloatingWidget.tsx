import React, { useState, useEffect } from 'react';
import { MessageCircle, ArrowUp, Sparkles, X, PhoneCall } from 'lucide-react';
import { getSiteSettings } from '@/lib/storage';

export default function QuickFloatingWidget() {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showTooltip, setShowTooltip] = useState(true);
  const [phone, setPhone] = useState('08116696990');

  useEffect(() => {
    const settings = getSiteSettings();
    if (settings && settings.phone) {
      setPhone(settings.phone.replace(/[^0-9]/g, ''));
    }

    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openWhatsApp = () => {
    const text = encodeURIComponent('Assalamu’alaikum, saya ingin bertanya mengenai pendaftaran siswa baru (SPMB) SD IT Andalas Cendekia.');
    window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 pointer-events-auto">
      {/* Friendly Tooltip */}
      {showTooltip && (
        <div className="bg-emerald-950 text-white p-3.5 rounded-2xl shadow-2xl border border-amber-400/40 max-w-xs text-xs relative animate-fadeIn flex items-center gap-3">
          <button 
            onClick={() => setShowTooltip(false)}
            className="absolute -top-2 -right-2 bg-slate-800 text-white rounded-full p-0.5 hover:bg-slate-700"
          >
            <X size={12} />
          </button>
          <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
            <Sparkles size={16} className="text-amber-300 animate-spin" style={{ animationDuration: '4s' }} />
          </div>
          <div>
            <p className="font-extrabold text-amber-300 mb-0.5">Ada Pertanyaan?</p>
            <p className="text-[11px] text-emerald-200">Chat CS Pendaftaran & Info Sekolah sekarang!</p>
          </div>
        </div>
      )}

      {/* Main WhatsApp Button */}
      <button
        onClick={openWhatsApp}
        className="group bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white p-3.5 rounded-full shadow-2xl shadow-emerald-500/40 hover:scale-110 transition-all duration-300 flex items-center gap-2.5 font-extrabold text-xs ring-4 ring-white/80"
        title="Chat WhatsApp SD IT Andalas Cendekia"
      >
        <div className="w-8 h-8 rounded-full bg-white text-emerald-600 flex items-center justify-center shadow-inner">
          <MessageCircle size={20} className="fill-emerald-600" />
        </div>
        <span className="hidden sm:inline pr-1 tracking-wide">Tanya SPMB</span>
        <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping"></span>
      </button>

      {/* Scroll to top button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="bg-slate-900/90 hover:bg-slate-900 text-white p-3 rounded-full shadow-lg border border-slate-700 hover:scale-110 transition-all duration-300 backdrop-blur-md"
          title="Kembali ke atas"
        >
          <ArrowUp size={18} />
        </button>
      )}
    </div>
  );
}
