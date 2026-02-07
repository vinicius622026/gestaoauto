/**
 * VehicleCard - Optimized vehicle card component for storefront
 * Features: Lazy loading, responsive images, hover effects
 */

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Fuel, Gauge, Zap, MapPin, ChevronRight, Heart } from "lucide-react";

interface VehicleCardProps {
  id: number;
  year: number;
  make: string;
  model: string;
  price: number;
  mileage?: number;
  color?: string;
  fuelType?: string;
  transmission?: string;
  imageUrl?: string;
  isFeatured?: boolean;
  onClick?: () => void;
  onWhatsAppClick?: () => void;
}

export default function VehicleCard({
  id,
  year,
  make,
  model,
  price,
  mileage,
  color,
  fuelType,
  transmission,
  imageUrl,
  isFeatured = false,
  onClick,
  onWhatsAppClick,
}: VehicleCardProps) {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const handleImageLoad = () => {
    setIsImageLoaded(true);
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  return (
    <Card
      className={`overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group ${
        isFeatured ? "ring-2 ring-blue-500" : ""
      }`}
      onClick={onClick}
    >
      {/* Image Container */}
      <div className="relative bg-slate-100 h-56 overflow-hidden">
        {/* Placeholder skeleton */}
        {!isImageLoaded && (
          <div className="absolute inset-0 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 animate-pulse" />
        )}

        {/* Image */}
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={`${year} ${make} ${model}`}
            loading="lazy"
            onLoad={handleImageLoad}
            className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-300 ${
              isImageLoaded ? "opacity-100" : "opacity-0"
            }`}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-200">
            <span className="text-slate-400 text-sm">Sem imagem</span>
          </div>
        )}

        {/* Featured Badge */}
        {isFeatured && (
          <div className="absolute top-3 left-3 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold">
            DESTAQUE
          </div>
        )}

        {/* Price Badge */}
        <div className="absolute top-3 right-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-lg shadow-lg">
          <p className="text-xs text-blue-100">A partir de</p>
          <p className="text-lg font-bold">
            R$ {(price / 1000).toFixed(0)}k
          </p>
        </div>

        {/* Favorite Button */}
        <button
          onClick={handleFavoriteClick}
          className="absolute bottom-3 right-3 bg-white rounded-full p-2 shadow-md hover:shadow-lg transition-all hover:scale-110"
          aria-label="Adicionar aos favoritos"
        >
          <Heart
            size={20}
            className={`transition-colors ${
              isFavorite
                ? "fill-red-500 text-red-500"
                : "text-slate-400 hover:text-red-500"
            }`}
          />
        </button>
      </div>

      {/* Content */}
      <CardContent className="pt-5 pb-4">
        {/* Title */}
        <h3 className="text-lg font-bold text-slate-900 mb-3 line-clamp-2">
          {year} {make} {model}
        </h3>

        {/* Specs Grid */}
        <div className="space-y-2 mb-4">
          {/* First Row: Mileage and Fuel */}
          <div className="grid grid-cols-2 gap-3">
            {mileage !== undefined && (
              <div className="flex items-center gap-2 text-sm">
                <Gauge size={16} className="text-blue-600 flex-shrink-0" />
                <div>
                  <p className="text-xs text-slate-500">Quilometragem</p>
                  <p className="font-semibold text-slate-900">
                    {(mileage / 1000).toFixed(0)}k km
                  </p>
                </div>
              </div>
            )}
            {fuelType && (
              <div className="flex items-center gap-2 text-sm">
                <Fuel size={16} className="text-green-600 flex-shrink-0" />
                <div>
                  <p className="text-xs text-slate-500">Combustível</p>
                  <p className="font-semibold text-slate-900">{fuelType}</p>
                </div>
              </div>
            )}
          </div>

          {/* Second Row: Color and Transmission */}
          <div className="grid grid-cols-2 gap-3">
            {color && (
              <div className="flex items-center gap-2 text-sm">
                <div className="w-4 h-4 rounded border border-slate-300" />
                <div>
                  <p className="text-xs text-slate-500">Cor</p>
                  <p className="font-semibold text-slate-900">{color}</p>
                </div>
              </div>
            )}
            {transmission && (
              <div className="flex items-center gap-2 text-sm">
                <Zap size={16} className="text-orange-600 flex-shrink-0" />
                <div>
                  <p className="text-xs text-slate-500">Câmbio</p>
                  <p className="font-semibold text-slate-900">{transmission}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            className="w-full text-sm"
            onClick={onClick}
          >
            Detalhes
            <ChevronRight size={14} className="ml-1" />
          </Button>
          <Button
            className="w-full text-sm bg-green-600 hover:bg-green-700"
            onClick={onWhatsAppClick}
          >
            WhatsApp
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
