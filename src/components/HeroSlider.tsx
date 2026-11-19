import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getSiteSlides, SlideItem } from '@/lib/storage';

// 4 Foto Utama Kampus & Pendidikan (Resolusi Tinggi 2560px, Q=90 ala tiaraaksara.sch.id)
const DEFAULT_CAMPUS_SLIDES: SlideItem[] = [
  {
    id: 1,
    badge: 'Kampus Yayasan',
    title: 'Gedung dan Halaman Megah Kampus Yayasan',
    description: 'Arsitektur megah kampus yayasan dengan halaman hijau terbuka yang representatif.',
    imageUrl: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=2560&q=90',
    primaryCtaText: '',
    primaryCtaLink: '',
    secondaryCtaText: '',
    secondaryCtaLink: '',
  },
  {
    id: 2,
    badge: 'Aktivitas Belajar',
    title: 'Aktivitas Belajar Interaktif Siswa dan Guru',
    description: 'Suasana pembelajaran aktif, interaktif, dan inspiratif di dalam ruang kelas.',
    imageUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=2560&q=90',
    primaryCtaText: '',
    primaryCtaLink: '',
    secondaryCtaText: '',
    secondaryCtaLink: '',
  },
  {
    id: 3,
    badge: 'Perpustakaan & Riset',
    title: 'Fasilitas Perpustakaan dan Riset Modern',
    description: 'Sarana perpustakaan dan fasilitas riset modern dengan koleksi literasi lengkap.',
    imageUrl: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=2560&q=90',
    primaryCtaText: '',
    primaryCtaLink: '',
    secondaryCtaText: '',
    secondaryCtaLink: '',
  },
  {
    id: 4,
    badge: 'Lingkungan Asri',
    title: 'Arsitektur Lingkungan Sekolah yang Asri dan Representatif',
    description: 'Lingkungan hijau, asri, dan teduh yang mendukung kenyamanan tumbuh kembang santri.',
    imageUrl: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=2560&q=90',
    primaryCtaText: '',
    primaryCtaLink: '',
    secondaryCtaText: '',
    secondaryCtaLink: '',
  },
];

/**
 * Memastikan URL foto Unsplash memiliki resolusi tinggi (w=2560, q=90)
 * untuk kejernihan dan kecepatan rendering.
 */
function ensureHighResPhotoUrl(url: string): string {
  if (!url) return '';
  if (url.includes('images.unsplash.com')) {
    try {
      const parsedUrl = new URL(url);
      parsedUrl.searchParams.set('w', '2560');
      parsedUrl.searchParams.set('q', '90');
      parsedUrl.searchParams.set('auto', 'format');
      parsedUrl.searchParams.set('fit', 'crop');
      return parsedUrl.toString();
    } catch {
      return url
        .replace(/w=\d+/, 'w=2560')
        .replace(/q=\d+/, 'q=90');
    }
  }
  return url;
}

export default function HeroSlider() {
  const [slides, setSlides] = useState<SlideItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Touch gesture support for mobile swiping ala Swiper
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const loadData = useCallback(() => {
    const data = getSiteSlides();
    if (data && data.length > 0) {
      setSlides(data);
    } else {
      setSlides(DEFAULT_CAMPUS_SLIDES);
    }
  }, []);

  useEffect(() => {
    loadData();
    window.addEventListener('sdit_data_synced', loadData);
    return () => {
      window.removeEventListener('sdit_data_synced', loadData);
    };
  }, [loadData]);

  const activeSlides = slides.length > 0 ? slides : DEFAULT_CAMPUS_SLIDES;

  // Autoplay 5000ms dengan pause saat hover (ala elementor-swiper tiaraaksara)
  useEffect(() => {
    if (isPaused || activeSlides.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeSlides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [isPaused, activeSlides.length]);

  const handlePrev = useCallback(() => {
    if (activeSlides.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + activeSlides.length) % activeSlides.length);
  }, [activeSlides.length]);

  const handleNext = useCallback(() => {
    if (activeSlides.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % activeSlides.length);
  }, [activeSlides.length]);

  // Touch Swipe Handlers (Swiper Mobile Behavior)
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      handleNext();
    } else if (isRightSwipe) {
      handlePrev();
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  return (
    <section 
      aria-label="Hero Carousel Banner Foto Sekolah"
      className="relative w-full overflow-hidden bg-slate-950 h-[400px] sm:h-[520px] md:h-[640px] lg:h-[760px] xl:h-[860px] max-h-[900px] select-none group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Slider Container dengan Horizontal Slide Track ala Swiper Tiara Aksara */}
      <div 
        className="w-full h-full flex transition-transform duration-700 ease-out will-change-transform"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {activeSlides.map((slide, index) => (
          <div
            key={slide.id || index}
            className="w-full h-full shrink-0 relative bg-slate-900"
          >
            <img 
              src={ensureHighResPhotoUrl(slide.imageUrl)} 
              alt={slide.title || `Foto Kampus ${index + 1}`}
              className="w-full h-full object-cover object-center"
              loading={index === 0 ? 'eager' : 'lazy'}
              fetchPriority={index === 0 ? 'high' : 'auto'}
              decoding="async"
            />
          </div>
        ))}
      </div>

      {/* Swiper Arrow Prev (<) ala elementor-swiper-button-prev tiaraaksara */}
      <button
        onClick={handlePrev}
        className="absolute left-3 sm:left-5 md:left-8 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center bg-black/25 hover:bg-black/60 text-white/90 hover:text-white backdrop-blur-md border border-white/20 hover:border-white/40 shadow-xl transition-all duration-300 hover:scale-110 active:scale-95 focus:outline-none"
        aria-label="Slide sebelumnya"
      >
        <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" strokeWidth={2} />
      </button>

      {/* Swiper Arrow Next (>) ala elementor-swiper-button-next tiaraaksara */}
      <button
        onClick={handleNext}
        className="absolute right-3 sm:right-5 md:right-8 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center bg-black/25 hover:bg-black/60 text-white/90 hover:text-white backdrop-blur-md border border-white/20 hover:border-white/40 shadow-xl transition-all duration-300 hover:scale-110 active:scale-95 focus:outline-none"
        aria-label="Slide berikutnya"
      >
        <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" strokeWidth={2} />
      </button>

      {/* Swiper Pagination Bullets (Dots) ala swiper-pagination tiaraaksara */}
      <div className="absolute bottom-5 sm:bottom-7 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2.5 sm:gap-3">
        {activeSlides.map((_, index) => {
          const isActive = index === currentIndex;
          return (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-2.5 rounded-full transition-all duration-300 focus:outline-none ${
                isActive
                  ? 'w-8 sm:w-10 bg-white shadow-[0_2px_10px_rgba(255,255,255,0.7)] ring-2 ring-white/50'
                  : 'w-2.5 bg-white/50 hover:bg-white/80'
              }`}
              aria-label={`Beralih ke slide ${index + 1}`}
            />
          );
        })}
      </div>
    </section>
  );
}
