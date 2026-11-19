import React, { useState, useEffect } from 'react';
import { X, ZoomIn, Sparkles, Building2, Layers } from 'lucide-react';
import { getSiteFacilities, FacilityItem } from '@/lib/storage';

export default function FacilitiesShowcase() {
  const [facilitiesData, setFacilitiesData] = useState<FacilityItem[]>([]);
  const [activeTab, setActiveTab] = useState<string>('Semua');
  const [selectedFacility, setSelectedFacility] = useState<FacilityItem | null>(null);

  const loadData = () => {
    setFacilitiesData(getSiteFacilities());
  };

  useEffect(() => {
    loadData();
    window.addEventListener('sdit_data_synced', loadData);
    return () => {
      window.removeEventListener('sdit_data_synced', loadData);
    };
  }, []);

  const categories = ['Semua', 'Akademik', 'Keagamaan', 'Teknologi', 'Olahraga & Terbuka'];

  const filteredFacilities = activeTab === 'Semua' 
    ? facilitiesData 
    : facilitiesData.filter(f => f.category === activeTab);

  return (
    <section className="py-24 bg-white relative overflow-hidden">
      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 text-amber-900 bg-amber-100/90 border border-amber-300 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider mb-4 shadow-sm">
            <Building2 size={14} className="text-amber-600" />
            <span>Sarana & Lingkungan Belajar</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">
            Fasilitas Sekolah <span className="gradient-text-cheerful">Modern & Kondusif</span>
          </h2>
          <p className="text-slate-600 text-base leading-relaxed">
            Mendukung proses tumbuh kembang, eksplorasi minat bakat, dan kenyamanan santri dalam lingkungan belajar Islami terbaik.
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-14">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveTab(cat)}
              className={`px-6 py-3 rounded-full text-xs sm:text-sm font-black transition-all duration-300 shadow-sm flex items-center gap-2 ${
                activeTab === cat
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/30 scale-105 ring-2 ring-emerald-400/40'
                  : 'bg-slate-100 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700'
              }`}
            >
              <Layers size={14} />
              <span>{cat}</span>
            </button>
          ))}
        </div>

        {/* Facilities Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredFacilities.map((fac) => (
            <div 
              key={fac.id}
              onClick={() => setSelectedFacility(fac)}
              className="group relative bg-slate-900 rounded-3xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 cursor-pointer transform hover:-translate-y-2 card-hover-pop border border-slate-100"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <img 
                  src={fac.imageUrl} 
                  alt={fac.title} 
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-90 group-hover:opacity-100"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>
                
                {/* Category Badge */}
                <span className="absolute top-4 left-4 bg-emerald-600/90 backdrop-blur-md text-white text-xs font-extrabold px-3.5 py-1 rounded-full shadow-md border border-emerald-400/40">
                  {fac.category}
                </span>

                {/* Hover Zoom Icon */}
                <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-amber-400 text-amber-950 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg transform group-hover:rotate-12">
                  <ZoomIn size={20} />
                </div>

                {/* Content Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <h3 className="text-xl font-extrabold mb-2 group-hover:text-amber-300 transition-colors flex items-center gap-2">
                    <span>{fac.title}</span>
                  </h3>
                  <p className="text-slate-300 text-xs line-clamp-2 leading-relaxed font-medium">
                    {fac.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Preview Modal */}
      {selectedFacility && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="relative max-w-3xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl border border-white/20">
            <button 
              onClick={() => setSelectedFacility(null)}
              className="absolute top-4 right-4 z-10 p-2.5 rounded-full bg-slate-900/80 hover:bg-amber-500 text-white hover:text-amber-950 transition-all duration-300 shadow-lg"
            >
              <X size={20} />
            </button>

            <div className="relative aspect-video w-full">
              <img 
                src={selectedFacility.imageUrl} 
                alt={selectedFacility.title} 
                className="w-full h-full object-cover"
              />
            </div>

            <div className="p-8">
              <span className="inline-block bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-black px-4 py-1 rounded-full mb-3 shadow-sm">
                {selectedFacility.category}
              </span>
              <h3 className="text-2xl font-black text-slate-900 mb-3">{selectedFacility.title}</h3>
              <p className="text-slate-600 text-sm leading-relaxed font-medium">{selectedFacility.description}</p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
