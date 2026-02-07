/**
 * VehicleDetails - Vehicle detail page with image carousel
 * Features: Full-screen carousel, technical specs, WhatsApp integration
 */

import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChevronLeft,
  ChevronRight,
  Share2,
  Heart,
  Phone,
  Mail,
  MapPin,
  Fuel,
  Gauge,
  Zap,
  Wrench,
  Calendar,
  DollarSign,
  MessageCircle,
  Loader2,
} from "lucide-react";

export default function VehicleDetailsPage() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location[0].split("?")[1] || "");
  const vehicleId = parseInt(searchParams.get("id") || "0");
  const navigate = location[1];

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [images, setImages] = useState<any[]>([]);

  // Fetch vehicle and tenant data
  const vehicleQuery = trpc.vehicles.getById.useQuery(
    { id: vehicleId },
    { enabled: vehicleId > 0 }
  );
  const tenantQuery = trpc.auth.getTenant.useQuery();
  const imagesQuery = trpc.images.getVehicleImages.useQuery(
    { vehicleId },
    { enabled: vehicleId > 0 }
  );

  useEffect(() => {
    if (imagesQuery.data) {
      setImages(imagesQuery.data);
    }
  }, [imagesQuery.data]);

  if (!vehicleId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-600">Veículo não encontrado</p>
      </div>
    );
  }

  if (vehicleQuery.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  const vehicle = vehicleQuery.data;
  const tenant = tenantQuery.data;

  if (!vehicle) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600 mb-4">Veículo não encontrado</p>
          <Button onClick={() => navigate("/")} variant="outline">
            Voltar à Vitrine
          </Button>
        </div>
      </div>
    );
  }

  const currentImage = images[currentImageIndex];

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleWhatsAppClick = () => {
    if (!tenant?.phone) return;

    const message = `Olá! Tenho interesse no ${vehicle.year} ${vehicle.make} ${vehicle.model} anunciado em sua loja. Preço: R$ ${(Number(vehicle.price) || 0).toLocaleString(
      "pt-BR"
    )}. Gostaria de mais informações.`;

    const whatsappUrl = `https://wa.me/${tenant.phone.replace(/\D/g, "")}?text=${encodeURIComponent(
      message
    )}`;

    window.open(whatsappUrl, "_blank");
  };

  const handleShare = async () => {
    const shareUrl = window.location.href;
    const shareText = `${vehicle.year} ${vehicle.make} ${vehicle.model} - R$ ${(Number(vehicle.price) || 0).toLocaleString(
      "pt-BR"
    )}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareText,
          text: `Veja este ${shareText} em ${tenant?.name}`,
          url: shareUrl,
        });
      } catch (error) {
        console.error("Erro ao compartilhar:", error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareUrl);
      alert("Link copiado para a área de transferência!");
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-slate-900 text-white sticky top-0 z-40 shadow-lg">
        <div className="container max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Button
            variant="ghost"
            className="text-white hover:bg-slate-800"
            onClick={() => navigate("/")}
          >
            ← Voltar
          </Button>
          <h1 className="text-xl font-bold">
            {vehicle.year} {vehicle.make} {vehicle.model}
          </h1>
          <div className="w-10" />
        </div>
      </header>

      <main className="container max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Image Carousel */}
          <div className="lg:col-span-2">
            <div className="relative bg-slate-900 rounded-lg overflow-hidden aspect-video">
              {/* Main Image */}
              {currentImage ? (
                <img
                  src={currentImage.url}
                  alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-800">
                  <span className="text-slate-400">Sem imagem</span>
                </div>
              )}

              {/* Navigation Arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={handlePrevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-3 rounded-full transition-all"
                    aria-label="Imagem anterior"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-3 rounded-full transition-all"
                    aria-label="Próxima imagem"
                  >
                    <ChevronRight size={24} />
                  </button>
                </>
              )}

              {/* Image Counter */}
              {images.length > 1 && (
                <div className="absolute bottom-4 right-4 bg-black bg-opacity-60 text-white px-4 py-2 rounded-lg text-sm font-semibold">
                  {currentImageIndex + 1} / {images.length}
                </div>
              )}

              {/* Favorite Button */}
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className="absolute top-4 right-4 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all hover:scale-110"
              >
                <Heart
                  size={24}
                  className={`transition-colors ${
                    isFavorite
                      ? "fill-red-500 text-red-500"
                      : "text-slate-400 hover:text-red-500"
                  }`}
                />
              </button>
            </div>

            {/* Thumbnail Grid */}
            {images.length > 1 && (
              <div className="mt-4 grid grid-cols-6 gap-2">
                {images.map((image, index) => (
                  <button
                    key={image.id}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`relative rounded-lg overflow-hidden border-2 transition-all aspect-square ${
                      currentImageIndex === index
                        ? "border-blue-500 ring-2 ring-blue-300"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <img
                      src={image.url}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Description */}
            {vehicle.description && (
              <Card className="mt-8">
                <CardHeader>
                  <CardTitle>Descrição</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-700 whitespace-pre-wrap">
                    {vehicle.description}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Price Card */}
            <Card className="border-2 border-blue-500 bg-blue-50">
              <CardContent className="pt-6">
                <p className="text-slate-600 text-sm mb-2">Preço</p>
                <p className="text-4xl font-bold text-blue-600 mb-4">
                  R$ {(Number(vehicle.price) || 0).toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
                <div className="space-y-3">
                  <Button
                    className="w-full bg-green-600 hover:bg-green-700 text-lg py-6"
                    onClick={handleWhatsAppClick}
                  >
                    <MessageCircle size={20} className="mr-2" />
                    Tenho Interesse
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleShare}
                  >
                    <Share2 size={18} className="mr-2" />
                    Compartilhar
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Specs Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Especificações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 pb-4 border-b">
                  <Calendar className="text-blue-600" size={20} />
                  <div>
                    <p className="text-xs text-slate-500">Ano</p>
                    <p className="font-semibold">{vehicle.year}</p>
                  </div>
                </div>

                {vehicle.mileage !== undefined && vehicle.mileage !== null && (
                  <div className="flex items-center gap-3 pb-4 border-b">
                    <Gauge className="text-blue-600" size={20} />
                    <div>
                      <p className="text-xs text-slate-500">Quilometragem</p>
                      <p className="font-semibold">
                        {(vehicle.mileage as number).toLocaleString("pt-BR")} km
                      </p>
                    </div>
                  </div>
                )}

                {vehicle.fuelType && (
                  <div className="flex items-center gap-3 pb-4 border-b">
                    <Fuel className="text-green-600" size={20} />
                    <div>
                      <p className="text-xs text-slate-500">Combustível</p>
                      <p className="font-semibold">{vehicle.fuelType}</p>
                    </div>
                  </div>
                )}

                {vehicle.transmission && (
                  <div className="flex items-center gap-3 pb-4 border-b">
                    <Zap className="text-orange-600" size={20} />
                    <div>
                      <p className="text-xs text-slate-500">Câmbio</p>
                      <p className="font-semibold">{vehicle.transmission}</p>
                    </div>
                  </div>
                )}

                {vehicle.color && (
                  <div className="flex items-center gap-3 pb-4 border-b">
                    <div className="w-5 h-5 rounded border-2 border-slate-300" />
                    <div>
                      <p className="text-xs text-slate-500">Cor</p>
                      <p className="font-semibold">{vehicle.color}</p>
                    </div>
                  </div>
                )}

                {vehicle.bodyType && (
                  <div className="flex items-center gap-3">
                    <Wrench className="text-slate-600" size={20} />
                    <div>
                      <p className="text-xs text-slate-500">Carroceria</p>
                      <p className="font-semibold">{vehicle.bodyType}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Dealer Info */}
            {tenant && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Sobre a Loja</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <h3 className="font-bold text-slate-900">{tenant.name}</h3>

                  {tenant.address && (
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
                      <p className="text-slate-700">
                        {tenant.address}
                        {tenant.city && `, ${tenant.city}`}
                        {tenant.state && ` - ${tenant.state}`}
                      </p>
                    </div>
                  )}

                  {tenant.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone size={16} className="text-green-600" />
                      <a
                        href={`tel:${tenant.phone}`}
                        className="text-blue-600 hover:underline"
                      >
                        {tenant.phone}
                      </a>
                    </div>
                  )}

                  {tenant.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail size={16} className="text-blue-600" />
                      <a
                        href={`mailto:${tenant.email}`}
                        className="text-blue-600 hover:underline"
                      >
                        {tenant.email}
                      </a>
                    </div>
                  )}

                  {tenant.phone && (
                    <Button
                      className="w-full mt-4 bg-green-600 hover:bg-green-700"
                      onClick={handleWhatsAppClick}
                    >
                      <MessageCircle size={16} className="mr-2" />
                      Contatar via WhatsApp
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
