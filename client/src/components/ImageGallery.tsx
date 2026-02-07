/**
 * ImageGallery - Display and manage vehicle images
 * Allows setting cover image and viewing gallery
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Star, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Image {
  id: number;
  url: string;
  filename: string;
  isCover: boolean;
}

interface ImageGalleryProps {
  images: Image[];
  onSetCover?: (imageId: number) => Promise<void>;
  onDelete?: (imageId: number) => Promise<void>;
  isLoading?: boolean;
  readOnly?: boolean;
}

export default function ImageGallery({
  images,
  onSetCover,
  onDelete,
  isLoading = false,
  readOnly = false,
}: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);

  if (images.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <p className="text-slate-500">Nenhuma imagem disponível</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentImage = images[selectedIndex];
  const coverImage = images.find((img) => img.isCover);

  const handlePrevious = () => {
    setSelectedIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setSelectedIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleSetCover = async () => {
    if (!onSetCover || currentImage.isCover) return;

    try {
      await onSetCover(currentImage.id);
      toast.success("Imagem definida como capa");
    } catch (error) {
      toast.error("Erro ao definir capa");
      console.error(error);
    }
  };

  const handleDelete = async (imageId: number) => {
    if (!onDelete) return;

    if (!confirm("Tem certeza que deseja remover esta imagem?")) {
      return;
    }

    setIsDeleting(imageId);
    try {
      await onDelete(imageId);
      toast.success("Imagem removida");
      // Reset index if necessary
      if (selectedIndex >= images.length - 1) {
        setSelectedIndex(Math.max(0, images.length - 2));
      }
    } catch (error) {
      toast.error("Erro ao remover imagem");
      console.error(error);
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Main Image Viewer */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="relative bg-slate-900 aspect-video flex items-center justify-center">
            <img
              src={currentImage.url}
              alt={currentImage.filename}
              className="w-full h-full object-contain"
            />

            {/* Navigation Arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={handlePrevious}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-2 rounded-full transition-all"
                  aria-label="Imagem anterior"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  onClick={handleNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-2 rounded-full transition-all"
                  aria-label="Próxima imagem"
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}

            {/* Cover Badge */}
            {currentImage.isCover && (
              <div className="absolute top-4 left-4 bg-yellow-500 text-white px-3 py-1 rounded-full flex items-center gap-2 text-sm font-semibold">
                <Star size={16} fill="currentColor" />
                Capa
              </div>
            )}

            {/* Image Counter */}
            {images.length > 1 && (
              <div className="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded text-sm">
                {selectedIndex + 1} / {images.length}
              </div>
            )}
          </div>

          {/* Image Info and Actions */}
          <div className="p-4 space-y-3">
            <p className="text-sm text-slate-600 truncate">{currentImage.filename}</p>

            {!readOnly && (
              <div className="flex gap-2">
                {!currentImage.isCover && (
                  <Button
                    onClick={handleSetCover}
                    disabled={isLoading}
                    variant="outline"
                    className="flex-1 gap-2"
                  >
                    <Star size={18} />
                    Usar como Capa
                  </Button>
                )}
                <Button
                  onClick={() => handleDelete(currentImage.id)}
                  disabled={isDeleting === currentImage.id}
                  variant="destructive"
                  className="flex-1 gap-2"
                >
                  {isDeleting === currentImage.id ? (
                    <>
                      <Loader2 className="animate-spin" size={18} />
                      Removendo...
                    </>
                  ) : (
                    <>
                      <Trash2 size={18} />
                      Remover
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Thumbnail Grid */}
      {images.length > 1 && (
        <div>
          <p className="text-sm font-medium text-slate-900 mb-3">Galeria</p>
          <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
            {images.map((image, index) => (
              <button
                key={image.id}
                onClick={() => setSelectedIndex(index)}
                className={`relative rounded-lg overflow-hidden border-2 transition-all aspect-square ${
                  selectedIndex === index
                    ? "border-blue-500 ring-2 ring-blue-300"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <img
                  src={image.url}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />

                {/* Cover Indicator */}
                {image.isCover && (
                  <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                    <Star size={16} className="text-yellow-400" fill="currentColor" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
