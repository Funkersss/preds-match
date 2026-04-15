"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { X } from "lucide-react";

export function PopupBanner() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setOpen(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={() => setOpen(false)}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-2xl animate-fade-slide-up">
        <button
          onClick={() => setOpen(false)}
          className="absolute -top-4 -right-4 z-20 w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-xl hover:bg-gray-100 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5 text-gray-900" />
        </button>

        <a href="/game" className="block rounded-xl overflow-hidden shadow-2xl">
          <Image
            src="/banners/popup-finnish-sniper.png"
            alt="Finnish Sniper — Play Now"
            width={1600}
            height={730}
            className="w-full h-auto"
            priority
          />
        </a>
      </div>
    </div>
  );
}
