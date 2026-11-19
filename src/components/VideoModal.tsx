import React from 'react';
import { X } from 'lucide-react';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoTitle?: string;
  videoUrl?: string;
}

export default function VideoModal({
  isOpen,
  onClose,
  videoTitle = 'Profil SD IT Andalas Cendekia',
  videoUrl = 'https://www.youtube.com/embed/vNUhnzfGFKY?autoplay=1'
}: VideoModalProps) {
  if (!isOpen) return null;

  let embedUrl = videoUrl;
  if (embedUrl.includes('youtu.be/')) {
    const id = embedUrl.split('youtu.be/')[1]?.split('?')[0];
    embedUrl = `https://www.youtube.com/embed/${id}?autoplay=1`;
  } else if (embedUrl.includes('youtube.com/watch?v=')) {
    const id = embedUrl.split('watch?v=')[1]?.split('&')[0];
    embedUrl = `https://www.youtube.com/embed/${id}?autoplay=1`;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-slate-800/90 text-white border-b border-slate-700">
          <h3 className="font-bold text-lg">{videoTitle}</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Video Container */}
        <div className="relative aspect-video w-full bg-black">
          <iframe
            className="w-full h-full"
            src={embedUrl}
            title={videoTitle}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      </div>
    </div>
  );
}
