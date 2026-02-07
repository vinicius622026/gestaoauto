/**
 * VehicleForm - Advanced form for vehicle creation and editing
 * Includes image upload, validation, and responsive design
 */

import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, X, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

// Validation schema
const vehicleFormSchema = z.object({
  make: z.string().min(1, "Marca é obrigatória").max(100),
  model: z.string().min(1, "Modelo é obrigatório").max(100),
  year: z.number().int().min(1900).max(new Date().getFullYear() + 1),
  price: z.number().positive("Preço deve ser maior que 0"),
  color: z.string().optional(),
  mileage: z.number().int().nonnegative().optional(),
  fuelType: z.string().optional(),
  transmission: z.string().optional(),
  bodyType: z.string().optional(),
  description: z.string().optional(),
});

type VehicleFormData = z.infer<typeof vehicleFormSchema>;

interface ImageFile {
  id: string;
  file: File;
  preview: string;
  isUploading: boolean;
  uploadProgress: number;
  isCover: boolean;
}

interface VehicleFormProps {
  initialData?: Partial<VehicleFormData> & { id?: number };
  onSubmit: (data: VehicleFormData, images: File[]) => Promise<void>;
  isLoading?: boolean;
  title?: string;
}

export default function VehicleForm({
  initialData,
  onSubmit,
  isLoading = false,
  title = "Adicionar Veículo",
}: VehicleFormProps) {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<VehicleFormData>({
    resolver: zodResolver(vehicleFormSchema),
    defaultValues: initialData || {
      year: new Date().getFullYear(),
      price: 0,
    },
  });

  const year = watch("year");

  // Handle image file selection
  const handleImageSelect = useCallback(
    (files: FileList | null) => {
      if (!files) return;

      const newImages: ImageFile[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Validate file type
        if (!file.type.startsWith("image/")) {
          toast.error(`${file.name} não é uma imagem válida`);
          continue;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} é muito grande (máximo 5MB)`);
          continue;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
          newImages.push({
            id: `${Date.now()}-${Math.random()}`,
            file,
            preview: reader.result as string,
            isUploading: false,
            uploadProgress: 0,
            isCover: images.length === 0 && newImages.length === 0, // First image is cover
          });

          if (newImages.length === Object.keys(files).length - i) {
            setImages((prev) => [...prev, ...newImages]);
            toast.success(`${newImages.length} imagem(ns) adicionada(s)`);
          }
        };
        reader.readAsDataURL(file);
      }
    },
    [images.length]
  );

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleImageSelect(e.dataTransfer.files);
  };

  // Remove image
  const removeImage = (id: string) => {
    setImages((prev) => {
      const filtered = prev.filter((img) => img.id !== id);
      // Ensure at least one image is cover
      if (filtered.length > 0 && !filtered.some((img) => img.isCover)) {
        filtered[0].isCover = true;
      }
      return filtered;
    });
  };

  // Set image as cover
  const setImageAsCover = (id: string) => {
    setImages((prev) =>
      prev.map((img) => ({
        ...img,
        isCover: img.id === id,
      }))
    );
  };

  // Handle form submission
  const onSubmitForm = async (data: VehicleFormData) => {
    if (images.length === 0) {
      toast.error("Adicione pelo menos uma imagem do veículo");
      return;
    }

    try {
      const imageFiles = images.map((img) => img.file);
      await onSubmit(data, imageFiles);
      reset();
      setImages([]);
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>Informações básicas do veículo</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Marca *
              </label>
              <Input
                {...register("make")}
                placeholder="Ex: Toyota"
                className={errors.make ? "border-red-500" : ""}
              />
              {errors.make && (
                <p className="text-red-600 text-sm mt-1">{errors.make.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Modelo *
              </label>
              <Input
                {...register("model")}
                placeholder="Ex: Corolla"
                className={errors.model ? "border-red-500" : ""}
              />
              {errors.model && (
                <p className="text-red-600 text-sm mt-1">{errors.model.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Ano *
              </label>
              <Input
                {...register("year", { valueAsNumber: true })}
                type="number"
                min="1900"
                max={new Date().getFullYear() + 1}
                className={errors.year ? "border-red-500" : ""}
              />
              {errors.year && (
                <p className="text-red-600 text-sm mt-1">{errors.year.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Preço (R$) *
              </label>
              <Input
                {...register("price", { valueAsNumber: true })}
                type="number"
                step="0.01"
                placeholder="50000"
                className={errors.price ? "border-red-500" : ""}
              />
              {errors.price && (
                <p className="text-red-600 text-sm mt-1">{errors.price.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Quilometragem (km)
              </label>
              <Input
                {...register("mileage", { valueAsNumber: true })}
                type="number"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Cor
              </label>
              <Input {...register("color")} placeholder="Ex: Branco" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Combustível
              </label>
              <select
                {...register("fuelType")}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecione...</option>
                <option value="Gasolina">Gasolina</option>
                <option value="Diesel">Diesel</option>
                <option value="Etanol">Etanol</option>
                <option value="Híbrido">Híbrido</option>
                <option value="Elétrico">Elétrico</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Câmbio
              </label>
              <select
                {...register("transmission")}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecione...</option>
                <option value="Manual">Manual</option>
                <option value="Automático">Automático</option>
                <option value="CVT">CVT</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Tipo de Carroceria
              </label>
              <select
                {...register("bodyType")}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecione...</option>
                <option value="Sedan">Sedan</option>
                <option value="SUV">SUV</option>
                <option value="Hatchback">Hatchback</option>
                <option value="Picape">Picape</option>
                <option value="Van">Van</option>
                <option value="Conversível">Conversível</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">
              Descrição
            </label>
            <Textarea
              {...register("description")}
              placeholder="Descreva o estado, características especiais, histórico, etc..."
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      {/* Image Upload */}
      <Card>
        <CardHeader>
          <CardTitle>Imagens do Veículo</CardTitle>
          <CardDescription>
            Adicione múltiplas fotos. A primeira será a capa. Máximo 5MB por imagem.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Drag and Drop Area */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragging
                ? "border-blue-500 bg-blue-50"
                : "border-slate-300 bg-slate-50"
            }`}
          >
            <Upload className="mx-auto mb-3 text-slate-400" size={32} />
            <p className="text-slate-700 font-medium mb-1">
              Arraste imagens aqui ou clique para selecionar
            </p>
            <p className="text-slate-500 text-sm mb-4">
              PNG, JPG, GIF até 5MB cada
            </p>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => handleImageSelect(e.target.files)}
              className="hidden"
              id="image-input"
            />
            <label htmlFor="image-input">
              <Button type="button" variant="outline" asChild className="cursor-pointer">
                <span>Selecionar Imagens</span>
              </Button>
            </label>
          </div>

          {/* Image Gallery */}
          {images.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm font-medium text-slate-900">
                {images.length} imagem(ns) selecionada(s)
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {images.map((image) => (
                  <div
                    key={image.id}
                    className={`relative rounded-lg overflow-hidden border-2 transition-all ${
                      image.isCover
                        ? "border-blue-500 ring-2 ring-blue-300"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <img
                      src={image.preview}
                      alt="Preview"
                      className="w-full h-32 object-cover"
                    />

                    {/* Upload Progress Overlay */}
                    {image.isUploading && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <div className="text-center">
                          <Loader2 className="animate-spin text-white mx-auto mb-2" size={20} />
                          <p className="text-white text-xs">{image.uploadProgress}%</p>
                        </div>
                      </div>
                    )}

                    {/* Cover Badge */}
                    {image.isCover && (
                      <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                        Capa
                      </div>
                    )}

                    {/* Actions */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-40 transition-all flex items-center justify-center gap-2 opacity-0 hover:opacity-100">
                      {!image.isCover && (
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          onClick={() => setImageAsCover(image.id)}
                          className="text-xs"
                        >
                          Usar como capa
                        </Button>
                      )}
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        onClick={() => removeImage(image.id)}
                        className="text-xs"
                      >
                        <X size={14} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {images.length === 0 && (
            <div className="text-center py-8">
              <AlertCircle className="mx-auto mb-2 text-yellow-600" size={24} />
              <p className="text-slate-600">Nenhuma imagem selecionada</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex gap-3">
        <Button
          type="submit"
          disabled={isLoading}
          className="flex-1 gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin" size={18} />
              Salvando...
            </>
          ) : (
            <>
              <CheckCircle2 size={18} />
              Salvar Veículo
            </>
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            reset();
            setImages([]);
          }}
          className="flex-1"
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}
