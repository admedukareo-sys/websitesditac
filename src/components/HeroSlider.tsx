import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowRight, Play, Pause, Sparkles, Star, Award, HeartHandshake, BookOpen } from 'lucide-react';
import { getSiteSlides, SlideItem } from '@/lib/storage';

export default function HeroSlider() {
  const [slides, setSlides] = useState<SlideItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const loadData = () => {
    setSlides(getSiteSlides());
  };

  useEffect(() => {
    loadData();
    window.addEventListener('sdit_data_synced', loadData);
    return () => {
      window.removeEventListener('sdit_data_synced', loadData);
    };
  }, []);

  useEffect(() => {
    if (isPaused || slides.length === 0) return;

    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
    }, 6000);

    return () => clearInterval(timer);
  }, [isPaused, slides]);

  const handlePrev = () => {
    if (slides.length === 0) return;
    setCurrentIndex((prevIndex) => (prevIndex - 1 + slides.length) % slides.length);
  };

  const handleNext = () => {
    if (slides.length === 0) return;
    setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
  };

  if (slides.length === 0) {
    return (
      <div className="min-h-[500px] bg-gradient-to-br from-emerald-950 to-teal-900 flex items-center justify-center text-white">
        <div className="flex items-center gap-3 bg-white/10 px-6 py-3 rounded-full backdrop-blur-md">
          <Sparkles className="animate-spin text-amber-400" />
          <span className="font-semibold text-sm">Menyiapkan Tampilan Ceria...</span>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="relative w-full overflow-hidden bg-emerald-950 min-h-[560px] sm:min-h-[640px] lg:min-h-[700px] flex items-center select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Decorative Cheerful Floating Orbs & Patterns */}
      <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none z-10 animate-float" />
      <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-amber-500/20 blur-3xl pointer-events-none z-10 animate-float-reverse" />
      <div className="absolute top-1/2 left-1/3 w-64 h-64 rounded-full bg-teal-400/15 blur-3xl pointer-events-none z-10 animate-pulse-glow" />

      {/* Slides Background Images with Smooth Cross-fade */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
          }`}
        >
          {/* Background Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center transform scale-105 transition-transform duration-10000 ease-out"
            style={{ backgroundImage: `url('${slide.imageUrl}')` }}
          />
          {/* Vibrant Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/95 via-emerald-950/85 to-teal-900/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-emerald-950 via-transparent to-black/30" />
        </div>
      ))}

      {/* Slide Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-20 py-20 md:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8">
            {slides.map((slide, index) => {
              if (index !== currentIndex) return null;
              return (
                <div key={slide.id} className="animate-fadeIn">
                  {/* Cheerful Badge */}
                  <div className="inline-flex items-center gap-2 py-2 px-4 rounded-full bg-gradient-to-r from-emerald-800/90 to-teal-800/90 backdrop-blur-md border border-amber-400/40 text-amber-300 text-xs sm:text-sm font-bold mb-6 shadow-xl ring-2 ring-amber-400/20">
                    <Star size={16} className="text-amber-400 fill-amber-400 animate-bounce" />
                    <span>{slide.badge}</span>
                  </div>

                  {/* Title */}
                  <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white mb-6 leading-[1.15] tracking-tight drop-shadow-md">
                    {slide.title}
                  </h1>

                  {/* Description */}
                  <p className="text-base sm:text-lg md:text-xl text-emerald-100/95 mb-8 max-w-2xl leading-relaxed font-medium">
                    {slide.description}
                  </p>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center gap-4">
                    {slide.primaryCtaText && (
                      <Link 
                        to={slide.primaryCtaLink || '/spmb'} 
                        className="group bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-amber-950 font-black px-8 py-4 rounded-full shadow-xl shadow-amber-500/25 transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 flex items-center gap-2.5 text-sm sm:text-base tracking-wide uppercase border border-amber-300/60"
                      >
                        <span>{slide.primaryCtaText}</span>
                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                      </Link>
                    )}
                    {slide.secondaryCtaText && (
                      <Link 
                        to={slide.secondaryCtaLink || '/profil'} 
                        className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-emerald-400/40 text-white font-bold px-8 py-4 rounded-full transition-all duration-300 hover:border-amber-400/60 text-sm sm:text-base flex items-center gap-2 shadow-lg"
                      >
                        <BookOpen size={18} className="text-amber-400" />
                        <span>{slide.secondaryCtaText}</span>
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Floating Cheerful Highlights Cards (Desktop right side) */}
          <div className="hidden lg:col-span-4 lg:flex flex-col gap-4 relative z-20">
            <div className="glass-card-dark p-5 rounded-3xl text-white shadow-2xl border border-emerald-500/40 transform hover:scale-105 transition-all duration-300 animate-float">
              <div className="flex items-center gap-3.5 mb-2">
                <div className="w-11 h-11 rounded-2xl bg-amber-400 text-amber-950 flex items-center justify-center font-black shadow-md">
                  <Star size={22} className="fill-amber-950" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-amber-300">Kurikulum Al-Qur’an 3HA</h3>
                  <p className="text-xs text-emerald-200">HAfalkan, HAyati, HAbituasi</p>
                </div>
              </div>
              <p className="text-xs text-emerald-100/80 leading-snug">Internalisasi 24 Karakter Al-Qur’an untuk mencetak generasi sholeh & cerdas.</p>
            </div>

            <div className="glass-card-dark p-5 rounded-3xl text-white shadow-2xl border border-amber-400/40 transform hover:scale-105 transition-all duration-300 animate-float-reverse">
              <div className="flex items-center gap-3.5 mb-2">
                <div className="w-11 h-11 rounded-2xl bg-teal-400 text-teal-950 flex items-center justify-center font-black shadow-md">
                  <Award size={22} />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-amber-300">Multiple Intelligences</h3>
                  <p className="text-xs text-teal-200">SLIM EN BIL (9 Kecerdasan)</p>
                </div>
              </div>
              <p className="text-xs text-emerald-100/80 leading-snug">Setiap anak adalah bintang bersinar dengan keunikan potensi masing-masing.</p>
            </div>

            <div className="glass-card-dark p-5 rounded-3xl text-white shadow-2xl border border-emerald-500/40 transform hover:scale-105 transition-all duration-300 animate-float">
              <div className="flex items-center gap-3.5 mb-2">
                <div className="w-11 h-11 rounded-2xl bg-emerald-400 text-emerald-950 flex items-center justify-center font-black shadow-md">
                  <HeartHandshake size={22} />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-amber-300">Program PRISE & FeSTa</h3>
                  <p className="text-xs text-emerald-200">Festival Sang Bintang</p>
                </div>
              </div>
              <p className="text-xs text-emerald-100/80 leading-snug">Peminatan bakat siswa sejak dini & perayaan karya tahunan santri.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={handlePrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-3.5 rounded-full bg-emerald-950/60 hover:bg-amber-500 text-white hover:text-amber-950 backdrop-blur-md border border-white/20 transition-all duration-300 hover:scale-110 focus:outline-none hidden sm:flex items-center justify-center shadow-xl"
        aria-label="Previous slide"
      >
        <ChevronLeft size={24} />
      </button>
      <button
        onClick={handleNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-3.5 rounded-full bg-emerald-950/60 hover:bg-amber-500 text-white hover:text-amber-950 backdrop-blur-md border border-white/20 transition-all duration-300 hover:scale-110 focus:outline-none hidden sm:flex items-center justify-center shadow-xl"
        aria-label="Next slide"
      >
        <ChevronRight size={24} />
      </button>

      {/* Bottom Controls Bar */}
      <div className="absolute bottom-6 left-0 right-0 z-30 container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Slide Counter */}
        <div className="text-white/90 font-bold text-xs tracking-widest bg-emerald-950/80 px-4 py-1.5 rounded-full backdrop-blur-md border border-emerald-500/40 shadow-inner">
          <span className="text-amber-400 font-extrabold text-sm">0{currentIndex + 1}</span> / 0{slides.length} Slide
        </div>

        {/* Dots Navigation */}
        <div className="flex items-center gap-2.5">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-3 rounded-full transition-all duration-500 focus:outline-none ${
                index === currentIndex 
                  ? 'w-10 bg-gradient-to-r from-amber-400 to-amber-500 shadow-md shadow-amber-400/50 ring-2 ring-amber-300/40' 
                  : 'w-3 bg-white/40 hover:bg-white/80'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Play/Pause Indicator */}
        <button
          onClick={() => setIsPaused(!isPaused)}
          className="text-white/80 hover:text-white text-xs font-semibold flex items-center gap-1.5 bg-emerald-950/80 px-3.5 py-1.5 rounded-full backdrop-blur-md border border-emerald-500/40 transition-colors"
          title={isPaused ? "Lanjutkan Slide" : "Jeda Slide"}
        >
          {isPaused ? <Play size={13} className="text-amber-400" /> : <Pause size={13} className="text-amber-400" />}
          <span>{isPaused ? 'Dipelajari' : 'Auto Play'}</span>
        </button>
      </div>
    </div>
  );
}
