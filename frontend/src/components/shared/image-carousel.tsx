"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type CarouselImage = { file: string; alt: string };

const BASE_PATH = "/media/auth-carousel/";
const INTERVAL_MS = 5000;

export function ImageCarousel({ className }: { className?: string }) {
  const [images, setImages] = useState<CarouselImage[]>([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    let active = true;
    fetch(`${BASE_PATH}images.json`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data: CarouselImage[]) => {
        if (active && Array.isArray(data)) setImages(data);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (images.length < 2) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % images.length);
    }, INTERVAL_MS);
    return () => clearInterval(id);
  }, [images.length]);

  return (
    <div className={cn("relative h-full w-full overflow-hidden bg-yas-midnight", className)}>
      {images.map((img, i) => (
        <img
          key={img.file}
          src={encodeURI(`${BASE_PATH}${img.file}`)}
          alt={img.alt}
          className={cn(
            "absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ease-in-out",
            i === index ? "opacity-100" : "opacity-0"
          )}
        />
      ))}

      <div className="absolute inset-0 bg-gradient-to-t from-yas-midnight/90 via-yas-midnight/20 to-yas-midnight/40" />

      {images.length > 1 && (
        <div className="absolute bottom-7 left-1/2 z-10 flex -translate-x-1/2 gap-2">
          {images.map((img, i) => (
            <button
              key={img.file}
              type="button"
              aria-label={`Photo ${i + 1}`}
              onClick={() => setIndex(i)}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                i === index ? "w-6 bg-yas-yellow" : "w-1.5 bg-white/50 hover:bg-white/70"
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
