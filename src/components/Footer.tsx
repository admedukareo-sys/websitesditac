import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Clock, ShieldCheck } from 'lucide-react';
import { getSiteSettings, SiteSettings } from '@/lib/storage';
import { FacebookIcon, InstagramIcon, YoutubeIcon } from './SocialIcons';

export default function Footer() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    setSettings(getSiteSettings());
  }, []);

  const phone = settings?.phone || '0811-6696-990';
  const email = settings?.email || 'sditac1@gmail.com';
  const address = settings?.address || 'Marga Makmur, RT 0/RW 0, Kel. Marga Makmur, Kec. Timpeh, Kab. Dharmasraya, Prov. Sumatera Barat 27679';
  const tagline = settings?.tagline || 'Unggul Berkarakter Al-Qur’an';
  const visi = settings?.visi || 'Unggul Berkarakter Al-Qur’an';
  const website = settings?.website || 'http://www.andalascendekia.sch.id';
  const npsn = settings?.npsn || '70054325';
  const schoolName = settings?.schoolName || 'SDIT ANDALAS CENDEKIA 02';
  const fb = settings?.facebookUrl || '#';
  const ig = settings?.instagramUrl || '#';
  const yt = settings?.youtubeUrl || '#';

  return (
    <footer className="relative bg-emerald-950 text-white overflow-hidden pt-16 pb-8 border-t border-emerald-900">
      {/* Background Decorative Blur Orbs */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-10 left-10 w-40 h-40 bg-amber-400 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-60 h-60 bg-emerald-500 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12 mb-16">
          {/* Col 1: Identity & Vision */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-white p-1 rounded-2xl shadow">
                <img 
                  src="/logo.png" 
                  alt="Logo Official SD IT Andalas Cendekia" 
                  className="h-12 w-auto object-contain"
                />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white leading-tight">SD IT</h3>
                <p className="text-xs text-amber-300 font-semibold">Andalas Cendekia</p>
              </div>
            </div>

            <div className="bg-emerald-900/60 backdrop-blur-sm rounded-2xl p-5 mb-6 border border-emerald-800/80">
              <h4 className="font-bold text-amber-400 text-xs uppercase tracking-wider mb-2">Tagline & Visi Sekolah</h4>
              <p className="text-emerald-100 text-xs font-semibold italic mb-2">"{tagline}"</p>
              <p className="text-emerald-200 text-xs leading-relaxed">
                {visi}
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-xs text-slate-300 uppercase tracking-wider mb-3">Media Sosial Official</h4>
              <div className="flex space-x-2.5">
                <a
                  href={fb}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 bg-emerald-900/90 text-emerald-200 hover:bg-[#1877F2] hover:text-white rounded-xl flex items-center justify-center transition-all duration-300 border border-emerald-800/80 hover:scale-110 shadow-sm"
                  title="Facebook Official"
                >
                  <FacebookIcon className="w-4 h-4" />
                </a>
                <a
                  href={ig}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 bg-emerald-900/90 text-emerald-200 hover:bg-gradient-to-tr hover:from-amber-500 hover:via-rose-500 hover:to-purple-600 hover:text-white rounded-xl flex items-center justify-center transition-all duration-300 border border-emerald-800/80 hover:scale-110 shadow-sm"
                  title="Instagram Official"
                >
                  <InstagramIcon className="w-4 h-4" />
                </a>
                <a
                  href={yt}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 bg-emerald-900/90 text-emerald-200 hover:bg-[#FF0000] hover:text-white rounded-xl flex items-center justify-center transition-all duration-300 border border-emerald-800/80 hover:scale-110 shadow-sm"
                  title="YouTube Official"
                >
                  <YoutubeIcon className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="font-bold text-white text-base mb-6 border-b border-emerald-800 pb-3">Tautan Utama</h4>
            <ul className="space-y-3 text-xs">
              <li><Link to="/" className="text-emerald-200 hover:text-white transition-colors">Beranda Utama</Link></li>
              <li><Link to="/profil" className="text-emerald-200 hover:text-white transition-colors">Profil & Sejarah Sekolah</Link></li>
              <li><Link to="/kurikulum" className="text-emerald-200 hover:text-white transition-colors">Kurikulum Khas, PRISE & Bi-SQ</Link></li>
              <li><Link to="/kesiswaan" className="text-emerald-200 hover:text-white transition-colors">Ekstrakurikuler & Prestasi</Link></li>
              <li><Link to="/spmb" className="text-emerald-200 hover:text-white transition-colors">Portal SPMB Online</Link></li>
              <li><Link to="/kontak" className="text-emerald-200 hover:text-white transition-colors">Hubungi Kami</Link></li>
            </ul>
          </div>

          {/* Col 3: Excellent Programs */}
          <div>
            <h4 className="font-bold text-white text-base mb-6 border-b border-emerald-800 pb-3">Program Khas Sekolah</h4>
            <ul className="space-y-3 text-xs text-emerald-200">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                Program Rising Star (PRISE - 9 Cabang Ekskul)
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                Bina Siswa Qur’ani (Bi-SQ 3HA: HAfalkan, HAyati, HAbituasi)
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                Multiple Intelligences (SLIM EN BIL Prof. Howard Gardner)
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                Festival Sang Bintang (FeSTa) & Awarding
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                Diklat Singkat Polisi Cilik
              </li>
            </ul>
          </div>

          {/* Col 4: Contact & Identity */}
          <div>
            <h4 className="font-bold text-white text-base mb-6 border-b border-emerald-800 pb-3">Alamat & Kontak Resmi</h4>
            <div className="space-y-4 text-xs text-emerald-200">
              <div className="flex items-start gap-3">
                <MapPin className="text-amber-400 shrink-0 mt-0.5" size={18} />
                <span>{address}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="text-amber-400 shrink-0" size={18} />
                <span>{phone}</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="text-amber-400 shrink-0" size={18} />
                <span>{email}</span>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="text-amber-400 shrink-0 mt-0.5" size={18} />
                <div>
                  <p>Website: {website.replace('http://', '').replace('https://', '').replace('/', '')}</p>
                  <p>NPSN: {npsn}</p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-emerald-800/80 space-y-1.5 text-[11px]">
                <div className="flex items-center gap-2 text-white font-medium">
                  <ShieldCheck size={16} className="text-amber-400" />
                  <span>{schoolName}</span>
                </div>
                <p className="text-emerald-300/80 pl-6">NPSN: {npsn} • Jenjang: SD • Status: Swasta</p>
              </div>
            </div>
          </div>
        </div>

        {/* Embedded Google Maps Section */}
        <div className="mb-12 bg-emerald-900/40 rounded-3xl p-4 sm:p-6 border border-emerald-800/80 backdrop-blur-sm shadow-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 pb-3 border-b border-emerald-800/60">
            <div className="flex items-center gap-2.5 text-white">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-400 flex items-center justify-center shrink-0">
                <MapPin size={18} />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">Lokasi Kampus {schoolName}</h4>
                <p className="text-[11px] text-emerald-300">{address}</p>
              </div>
            </div>
            <a 
              href="https://maps.google.com/?q=-0.9965869086579346,101.56249979933902" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs bg-amber-500 hover:bg-amber-400 text-amber-950 font-bold px-4 py-2 rounded-xl transition-all duration-300 shadow hover:scale-105 shrink-0"
            >
              Buka Petunjuk Arah
            </a>
          </div>
          
          <div className="relative w-full h-64 sm:h-80 rounded-2xl overflow-hidden shadow-inner border border-emerald-700/50">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1994.6073962809216!2d101.56249979933902!3d-0.9965869086579346!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e2b90f9234ca49d%3A0x3e4d8ea3a258fc52!2sSDIT%20Andalas%20Cendekia!5e0!3m2!1sid!2sid!4v1790641146317!5m2!1sid!2sid"
              className="w-full h-full border-0"
              allowFullScreen
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
              title="Peta Lokasi SD IT Andalas Cendekia"
            ></iframe>
          </div>
        </div>

        {/* Bottom Legal Copyright */}
        <div className="border-t border-emerald-900 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-emerald-400">
          <p>&copy; {new Date().getFullYear()} SD IT Andalas Cendekia. All rights reserved. | ade p</p>
          <div className="flex space-x-6 text-[11px] text-emerald-400/80">
            <a href="#" className="hover:text-white transition-colors">Kebijakan Privasi</a>
            <a href="#" className="hover:text-white transition-colors">Syarat & Ketentuan</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
