import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { WhatsappIcon } from '@/components/SocialIcons';
import { getSiteSettings } from '@/lib/storage';

export default function QuickFloatingWidget() {
  const [showScrollTop, setShowScrollTop] = useState(false);
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

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openWhatsApp = () => {
    const formattedPhone = phone.startsWith('0') 
      ? '62' + phone.substring(1) 
      : phone.startsWith('62') 
      ? phone 
      : '62' + phone;

    const message = encodeURIComponent(
      'Assalamu’alaikum, Halo Admin SD IT Andalas Cendekia, saya ingin mendapatkan informasi lebih lanjut tentang pendaftaran dan program pendidikan.'
    );
    window.open(`https://wa.me/${formattedPhone}?text=${message}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end gap-3 pointer-events-auto select-none">
      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="w-10 h-10 rounded-full bg-slate-900/90 hover:bg-slate-900 text-white shadow-lg border border-slate-700/60 hover:scale-110 active:scale-95 transition-all duration-300 backdrop-blur-md flex items-center justify-center focus:outline-none"
          title="Kembali ke atas"
          aria-label="Kembali ke atas"
        >
          <ArrowUp size={18} />
        </button>
      )}

      {/* Floating WhatsApp Button (Model qlwapp ala tiaraaksara.sch.id) */}
      <button
        onClick={openWhatsApp}
        className="group relative flex items-center gap-3 bg-[#25d366] hover:bg-[#20ba59] text-white py-3 px-4 sm:py-3.5 sm:px-5 rounded-full shadow-[0_8px_30px_rgb(37,211,102,0.4)] hover:shadow-[0_12px_35px_rgb(37,211,102,0.6)] transform hover:scale-105 active:scale-95 transition-all duration-300 font-sans cursor-pointer focus:outline-none ring-2 ring-white/30"
        title="Chat WhatsApp SD IT Andalas Cendekia"
        aria-label="Yuk mulai percakapan via WhatsApp"
      >
        {/* Soft pulse glow ring ala tiaraaksara */}
        <span className="absolute -inset-1 rounded-full bg-[#25d366]/35 animate-ping pointer-events-none -z-10 opacity-75"></span>

        {/* WhatsApp Icon */}
        <div className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-white shrink-0">
          <WhatsappIcon className="w-6 h-6 sm:w-7 sm:h-7" />
        </div>

        {/* Label Text "Yuk mulai percakapan" */}
        <span className="text-xs sm:text-sm font-bold tracking-tight text-white whitespace-nowrap drop-shadow-sm">
          Yuk mulai percakapan
        </span>
      </button>
    </div>
  );
}
