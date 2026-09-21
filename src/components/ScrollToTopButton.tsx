import React, { useState, useEffect } from "react";
import { ChevronUp, ChevronDown, ArrowUp } from "lucide-react";

export const ScrollToTopButton: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      
      if (scrollHeight > 0) {
        const progress = Math.min(Math.max(Math.round((currentScrollY / scrollHeight) * 100), 0), 100);
        setScrollProgress(progress);
      }

      // Show when scrolled down more than 160px
      if (currentScrollY > 160) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const scrollToBottom = () => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: "smooth",
    });
  };

  if (!isVisible) return null;

  return (
    <aside
      aria-label="Page scroll controls"
      className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-40 flex flex-col items-center gap-1.5 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4"
    >
      {/* Scroll Progress Pill */}
      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#111726]/90 border border-blue-500/30 text-blue-400 backdrop-blur-md shadow-md">
        {scrollProgress}%
      </span>

      {/* Scroll Controls Container */}
      <div className="flex flex-col bg-[#111726]/95 border border-[#1e2a42] rounded-2xl p-1 shadow-2xl backdrop-blur-md">
        {/* Scroll To Top Button */}
        <button
          onClick={scrollToTop}
          className="p-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-blue-600/30 active:scale-95 transition-all flex items-center justify-center group relative"
          title="Scroll to top of page (Home)"
          aria-label="Scroll to top"
        >
          <ChevronUp className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform text-blue-400 group-hover:text-white" />
        </button>

        <div className="w-5 h-px bg-slate-800 mx-auto my-0.5" />

        {/* Scroll To Bottom Button */}
        <button
          onClick={scrollToBottom}
          className="p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 active:scale-95 transition-all flex items-center justify-center group relative"
          title="Scroll to bottom of page (End)"
          aria-label="Scroll to bottom"
        >
          <ChevronDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform text-slate-400 group-hover:text-white" />
        </button>
      </div>
    </aside>
  );
};
