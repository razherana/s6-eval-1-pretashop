import { DialogContent, Dialog } from "@/components/ui/dialog";
import { getWithLanguage } from "@/utils/lang";
import { API_QUERY } from "@/utils/url";
import { ZoomIn, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useState } from "react";
import type { LanguageField } from "../types";

export function ProductImageCarouselComponent({
  images,
  productName,
  languageId
}: {
  images: { '@_xlink:href': string }[];
  productName: LanguageField;
  languageId: number;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [_dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const goToPrevious = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({ x, y });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isZoomed) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - zoomPosition.x, y: e.clientY - zoomPosition.y });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isZoomed) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.touches[0].clientX - rect.left) / rect.width) * 100;
    const y = ((e.touches[0].clientY - rect.top) / rect.height) * 100;
    setZoomPosition({ x, y });
  };

  const toggleZoom = () => {
    setIsZoomed(!isZoomed);
    if (isZoomed) {
      setZoomPosition({ x: 50, y: 50 });
    }
  };

  return (
    <>
      {/* Main Carousel */}
      <div className="relative group/carousel">
        <div
          className="relative overflow-hidden cursor-zoom-in"
          onClick={toggleZoom}
        >
          <img
            src={`${images[currentIndex]['@_xlink:href']}?${API_QUERY}`}
            alt={getWithLanguage(productName, languageId)}
            className="h-48 w-full object-cover transition-transform duration-300 group-hover/carousel:scale-105"
          />

          {/* Zoom Indicator */}
          <div className="absolute bottom-2 right-2 bg-black/50 rounded-full p-1.5 opacity-0 group-hover/carousel:opacity-100 transition-opacity">
            <ZoomIn className="h-4 w-4 text-white" />
          </div>
        </div>

        {/* Navigation Arrows - Only show if multiple images */}
        {images.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-1.5 shadow-md opacity-0 group-hover/carousel:opacity-100 transition-opacity"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-1.5 shadow-md opacity-0 group-hover/carousel:opacity-100 transition-opacity"
              aria-label="Next image"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </>
        )}

        {/* Dots Indicator */}
        {images.length > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(index);
                }}
                className={`w-1.5 h-1.5 rounded-full transition-all ${index === currentIndex
                    ? 'bg-white w-3'
                    : 'bg-white/60 hover:bg-white/80'
                  }`}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Zoom Modal */}
      <Dialog open={isZoomed} onOpenChange={setIsZoomed}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 bg-black/95">
          <button
            onClick={() => setIsZoomed(false)}
            className="absolute top-4 right-4 z-50 bg-white/10 hover:bg-white/20 rounded-full p-2 transition-colors"
          >
            <X className="h-5 w-5 text-white" />
          </button>

          <div
            className="relative w-full h-[90vh] overflow-hidden cursor-grab active:cursor-grabbing"
            onMouseMove={handleMouseMove}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchMove={handleTouchMove}
          >
            <img
              src={`${images[currentIndex]['@_xlink:href']}?${API_QUERY}`}
              alt={getWithLanguage(productName, languageId)}
              className="w-full h-full object-contain"
              style={{
                transform: isZoomed ? 'scale(2)' : 'scale(1)',
                transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                transition: isDragging ? 'none' : 'transform 0.3s ease-out',
              }}
            />

            {/* Zoom Navigation */}
            {images.length > 1 && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                <button
                  onClick={goToPrevious}
                  className="bg-white/10 hover:bg-white/20 rounded-full p-2 transition-colors"
                >
                  <ChevronLeft className="h-5 w-5 text-white" />
                </button>
                <div className="flex items-center gap-1.5">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentIndex(index);
                      }}
                      className={`w-2 h-2 rounded-full transition-all ${index === currentIndex
                          ? 'bg-white w-4'
                          : 'bg-white/40 hover:bg-white/60'
                        }`}
                    />
                  ))}
                </div>
                <button
                  onClick={goToNext}
                  className="bg-white/10 hover:bg-white/20 rounded-full p-2 transition-colors"
                >
                  <ChevronRight className="h-5 w-5 text-white" />
                </button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}