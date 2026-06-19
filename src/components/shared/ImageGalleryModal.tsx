import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import React, { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ImageGalleryModalProps {
  images: string[];
  isOpen: boolean;
  onClose: () => void;
  initialIndex?: number;
  title?: string;
}

const ImageGalleryModal: React.FC<ImageGalleryModalProps> = ({
  images,
  isOpen,
  onClose,
  initialIndex = 0,
  title = "Image Gallery",
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      goToPrevious();
    } else if (e.key === "ArrowRight") {
      goToNext();
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  React.useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex, isOpen]);

  if (!images || images.length === 0) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-4xl max-h-[90vh] p-0" 
        onKeyDown={handleKeyDown}
      >
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>
            {title} ({currentIndex + 1} of {images.length})
          </DialogTitle>
        </DialogHeader>
        
        <div className="relative flex items-center justify-center p-6 pt-0">
          {images.length > 1 && (
            <Button
              className="absolute left-4 z-10 bg-white/80 hover:bg-white"
              size="icon"
              variant="outline"
              onClick={goToPrevious}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}
          
          <div className="relative max-w-full max-h-[70vh] overflow-hidden rounded-lg">
            <Image
              alt={`Image ${currentIndex + 1}`}
              className="object-contain max-w-full max-h-full"
              height={600}
              src={images[currentIndex]}
              style={{
                height: "auto",
                maxHeight: "70vh",
                maxWidth: "100%",
                width: "auto",
              }}
              width={800}
            />
          </div>
          
          {images.length > 1 && (
            <Button
              className="absolute right-4 z-10 bg-white/80 hover:bg-white"
              size="icon"
              variant="outline"
              onClick={goToNext}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        {images.length > 1 && (
          <div className="flex justify-center gap-2 p-6 pt-0">
            {images.map((_, index) => (
              <button
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentIndex ? "bg-primary" : "bg-muted-foreground/30"
                }`}
                onClick={() => setCurrentIndex(index)}
              />
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ImageGalleryModal;