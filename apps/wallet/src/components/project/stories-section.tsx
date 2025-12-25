"use client";

import { useState, useEffect, useCallback } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { cn } from "@repo/ui/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/components/ui/avatar";

interface Story {
  id: number;
  title: string;
  image: string;
}

export function ProjectStories({ stories }: { stories: Story[] }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);

  const nextStory = useCallback(() => {
    setActiveIndex((prev) => {
      if (prev === null) return null;
      if (prev < stories.length - 1) return prev + 1;
      return null; // Close when reaching the last image
    });
    setProgress(0);
  }, [stories.length]);

  const prevStory = useCallback(() => {
    setActiveIndex((prev) => {
      if (prev === null) return null;
      if (prev > 0) return prev - 1;
      return prev;
    });
    setProgress(0);
  }, []);

  useEffect(() => {
    if (activeIndex === null) return;

    const interval = setInterval(() => {
      setProgress((v) => {
        if (v >= 100) {
          nextStory();
          return 0;
        }
        return v + 1;
      });
    }, 50); // 5 seconds per story (100 * 50ms)

    return () => clearInterval(interval);
  }, [activeIndex, nextStory]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActiveIndex(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <div className="flex gap-4 min-w-max">
        {stories.map((story, index) => (
          <button 
            key={story.id} 
            onClick={() => {
              setActiveIndex(index);
              setProgress(0);
            }}
            className="flex flex-col items-center gap-2 group transition-transform active:scale-95"
          >
            <div className="p-[2.5px] rounded-full bg-linear-to-tr from-brand-lime via-brand-green to-brand-teal shadow-sm group-hover:scale-105 transition-all">
                <Avatar className="w-16 h-16 border-2 border-background">
                    <AvatarImage src={story.image} className="object-cover" />
                    <AvatarFallback>{story.title[0]}</AvatarFallback>
                </Avatar>
            </div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight group-hover:text-primary transition-colors">{story.title}</span>
          </button>
        ))}
      </div>

      {activeIndex !== null && (
        <div className="fixed inset-0 z-[100] bg-black animate-in fade-in zoom-in-95 duration-300 select-none flex flex-col items-center justify-center">
          {/* Progress Bars */}
          <div className="absolute top-4 left-4 right-4 z-[110] flex gap-1.5 h-1">
            {stories.map((_, i) => (
              <div key={i} className="h-full flex-1 bg-white/20 rounded-full overflow-hidden">
                <div 
                  className={cn(
                    "h-full bg-white transition-all ease-linear",
                    i === activeIndex ? "duration-100" : "duration-0"
                  )}
                  style={{ 
                    width: i === activeIndex ? `${progress}%` : i < activeIndex ? "100%" : "0%" 
                  }}
                />
              </div>
            ))}
          </div>

          {/* Header Gradient */}
          <div className="absolute top-0 left-0 right-0 h-32 bg-linear-to-b from-black/60 to-transparent z-[109]" />

          {/* Header */}
          <div className="absolute top-8 left-4 right-4 z-[110] flex justify-between items-center text-white p-2">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full border-2 border-white/20 overflow-hidden relative shadow-lg">
                    <Image src={stories[activeIndex].image} alt="" fill className="object-cover" />
                </div>
                <div className="flex flex-col">
                    <span className="font-bold text-sm leading-tight">{stories[activeIndex].title}</span>
                    <span className="text-[10px] opacity-80 font-medium uppercase tracking-wider">Torre Libertador 8000</span>
                </div>
            </div>
            <button 
                onClick={(e) => {
                    e.stopPropagation();
                    setActiveIndex(null);
                }} 
                className="p-2 hover:bg-white/10 rounded-full transition-colors backdrop-blur-md"
                aria-label="Cerrar historias"
            >
                <X className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation Areas (Invisible overlay) */}
          <div className="absolute inset-0 z-[105] flex">
            <div className="w-1/2 h-full cursor-pointer" onClick={prevStory} />
            <div className="w-1/2 h-full cursor-pointer" onClick={nextStory} />
          </div>

          {/* Content */}
          <div className="relative w-full h-full flex items-center justify-center">
             <Image 
                src={stories[activeIndex].image} 
                alt={stories[activeIndex].title} 
                fill 
                className="object-cover"
                priority
             />
          </div>

          {/* Desktop Navigation Arrows */}
          <div className="absolute inset-y-0 left-8 hidden md:flex items-center z-[110]">
             <button 
                onClick={(e) => { e.stopPropagation(); prevStory(); }} 
                disabled={activeIndex === 0} 
                className="p-4 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white disabled:opacity-0 transition-all hover:scale-110 active:scale-90"
            >
                <ChevronLeft className="w-8 h-8" />
             </button>
          </div>
          <div className="absolute inset-y-0 right-8 hidden md:flex items-center z-[110]">
             <button 
                onClick={(e) => { e.stopPropagation(); nextStory(); }} 
                className="p-4 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white transition-all hover:scale-110 active:scale-90"
            >
                <ChevronRight className="w-8 h-8" />
             </button>
          </div>
        </div>
      )}
    </>
  );
}
