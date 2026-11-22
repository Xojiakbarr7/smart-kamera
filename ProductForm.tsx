"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  X,
  Plus,
  Trash2,
  Image as ImageIcon,
  Upload,
  Grid,
  List,
  ChevronLeft,
  ChevronRight,
  Eye,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { FieldArray, useFieldArray, Controller } from "react-hook-form";
import { z } from "zod";

interface ProductFormProps {
  onSubmit: (e: React.FormEvent) => void;
  register: any;
  errors: any;
  isLoading: boolean;
  categories: { id: string; name: string }[];
  brands: { id: string; name: string }[];
  images: string[];
  setValue: any;
  editingProduct: { id: string; images: string[] } | null;
}

export function ProductForm({
  onSubmit,
  register,
  errors,
  isLoading,
  categories,
  brands,
  images,
  setValue,
  editingProduct,
}: ProductFormProps) {
  const [imagePreviews, setImagePreviews] = useState<string[]>(images || []);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showImageManager, setShowImageManager] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const { fields: featureFields, append: appendFeature, remove: removeFeature } = useFieldArray({
    control: register.control,
    name: "features",
  });

  const { fields: specFields, append: appendSpec, remove: removeSpec } = useFieldArray({
    control: register.control,
    name: "specifications",
  });

  const handleImageUpload = (files: FileList) => {
    const newImages = Array.from(files).slice(0, 10 - imagePreviews.length);
    newImages.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreviews((prev) => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files.length > 0) {
      handleImageUpload(e.dataTransfer.files);
    }
  };

  const removeImage = (index: number) => {
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    if (activeImageIndex >= index && activeImageIndex > 0) {
      setActiveImageIndex((prev) => prev - 1);
    }
  };

  const reorderImages = (fromIndex: number, toIndex: number) => {
    setImagePreviews((prev) => {
      const newArray = [...prev];
      const [removed] = newArray.splice(fromIndex, 1);
      newArray.splice(toIndex, 0, removed);
      return newArray;
    });
  };

  const updateImagesInForm = () => {
    setValue("images", imagePreviews, { shouldValidate: true });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Image Upload Section */}
      <div className="space-y-4">
        <label className="block text-sm font-medium text-dark-700 dark:text-dark-300">Rasmlar <span className="text-red-500">*</span></label>

        {!showImageManager && imagePreviews.length > 0 && (
          <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-dark-50 dark:bg-dark-800 border border-dark-100 dark:border-dark-800">
            <img
              src={imagePreviews[activeImageIndex]}
              alt="Asosiy rasm"
              className="w-full h-full object-cover"
            />
            {imagePreviews.length > 1 && (
              <>
                <button
                  onClick={() => setActiveImageIndex((prev) => (prev === 0 ? imagePreviews.length - 1 : prev - 1))}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 dark:bg-dark-900/90 text-dark-600 hover:text-dark-900 dark:hover:text-white transition-colors"
                  aria-label="Oldingi rasm"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setActiveImageIndex((prev) => (prev === imagePreviews.length - 1 ? 0 : prev + 1))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 dark:bg-dark-900/90 text-dark-600 hover:text-dark-900 dark:hover:text-white transition-colors"
                  aria-label="Keyingi rasm"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
                  {imagePreviews.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImageIndex(i)}
                      className={cn(
                        "w-2 h-2 rounded-full transition-all",
                        i === activeImageIndex
                          ? "bg-white w-6"
                          : "bg-white/50 hover:bg-white/75"
                      )}
                      aria-label={`Rasm ${i + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
            <button
              onClick={() => setShowImageManager(true)}
              className="absolute top-3 right-3 p-2 rounded-full bg-white/90 dark:bg-dark-900/90 text-dark-600 hover:text-dark-900 dark:hover:text-white transition-colors"
              aria-label="Rasmlarni boshqarish"
            >
              <Grid className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Image Manager / Upload Area */}
        <AnimatePresence>
          {showImageManager || imagePreviews.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={cn(
                "border-2 border-dashed rounded-xl p-8 text-center transition-colors",
                dragActive
                  ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                  : "border-dark-200 dark:border-dark-700 hover:border-primary-300 dark:hover:border-primary-700"
              )}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
                className="hidden"
                id="image-upload"
                ref={(el) => el && !dragActive && el.addEventListener("click", () => el.value = "")}
              />
              <label htmlFor="image-upload" className="cursor-pointer">
                <div className="flex flex-col items-center gap-3">
                  <Upload className="w-12 h-12 text-dark-400" />
                  <div>
                    <p className="font-medium text-dark-900 dark:text-white">Rasmlarni yuklang</p>
                    <p className="text-sm text-dark-500 dark:text-dark-400">Tarqatib tashlang yoki bosib tanlang (maks. 10 ta)</p>
                  </div>
                </div>
              </label>
              {imagePreviews.length > 0 && (
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  {imagePreviews.map((preview, i) => (
                    <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden">
                      <img src={preview} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="absolute top-1 right-1 p-1 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
                        aria-label="O'chirish"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          ) : null}
        </AnimatePresence>

        {showImageManager && imagePreviews.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-dark-900 dark:text-white">Rasmlarni tartiblash</h4>
              <Button variant="ghost" size="sm" onClick={() => setShowImageManager(false)}>
                <List className="w-4 h-4 mr-1" /> Yopish
              </Button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
              {imagePreviews.map((preview, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="relative aspect-[4/3] rounded-lg overflow-hidden bg-dark-50 dark:bg-dark-800 border border-dark-100 dark:border-dark-800"
                >
                  <img src={preview} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="p-2 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
                      aria-label="O'chirish"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  {i === 0 && (
                    <span className="absolute top-2 left-2 px-2 py-1 text-xs font-medium bg-primary-600 text-white rounded-full">Asosiy</span>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {errors.images && (
          <p className="text-sm text-red-500">{errors.images.message}</p>
        )}
      </div>

      {/* Basic Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-dark-900 dark:text-white border-b border-dark-100 dark:border-dark-800 pb-2">Asosiy ma'lumotlar</h3>

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5">
              Mahsulot nomi <span className="text-red-500">*</span>
            </label>
            <Input
              id="name"
              {...register("name")}
              placeholder="Masalan: Hikvision DS-2CD2043G0-I"
              error={errors.name?.message}
            />
          </div>

          <div>
            <label htmlFor="slug" className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5">
              Slug (URL) <span className="text-red-500">*</span>
            </label>
            <Input
              id="slug"
              {...register("slug")}
              placeholder="hikvision-ds-2cd2043g0-i"
              error={errors.slug?.message}
            />
          </div>

          <div>
            <label htmlFor="sku" className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5">
              SKU (Artikul) <span className="text-red-500">*</span>
            </label>
            <Input
              id="sku"
              {...register("sku")}
              placeholder="DS-2CD2043G0-I"
              error={errors.sku?.message}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="categoryId" className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5">
                Kategoriya <span className="text-red-500">*</span>
              </label>
              <select
                id="categoryId"
                {...register("categoryId")}
                className="w-full px-4 py-2.5 border border-dark-200 dark:border-dark-700 rounded-xl bg-white dark:bg-dark-800 text-dark-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Kategoriya tanlang</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              {errors.categoryId && <p className="mt-1 text-sm text-red-500">{errors.categoryId.message}</p>}
            </div>

            <div>
              <label htmlFor="brandId" className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5">Brend</label>
              <select
                id="brandId"
                {...register("brandId")}
                className="w-full px-4 py-2.5 border border-dark-200 dark:border-dark-700 rounded-xl bg-white dark:bg-dark-800 text-dark-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Brend tanlang (ixtiyoriy)</option>
                {brands.map((brand) => (
                  <option key={brand.id} value={brand.id}>{brand.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5">
                Narx (so'm) <span className="text-red-500">*</span>
              </label>
              <Input
                id="price"
                type="number"
                min="0"
                step="1000"
                {...register("price", { valueAsNumber: true })}
                placeholder="1 500 000"
                error={errors.price?.message}
              />
            </div>

            <div>
              <label htmlFor="oldPrice" className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5">Eski narx (chegirma uchun)</label>
              <Input
                id="oldPrice"
                type="number"
                min="0"
                step="1000"
                {...register("oldPrice", { valueAsNumber: true })}
                placeholder="2 000 000"
              />
            </div>
          </div>

          <div>
            <label htmlFor="stock" className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5">
              Ombordagi soni <span className="text-red-500">*</span>
            </label>
            <Input
              id="stock"
              type="number"
              min="0"
              {...register("stock", { valueAsNumber: true })}
              placeholder="10"
              error={errors.stock?.message}
            />
          </div>

          <div>
            <label htmlFor="order" className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5">Tartib raqami</label>
            <Input
              id="order"
              type="number"
              min="0"
              {...register("order", { valueAsNumber: true })}
              placeholder="0"
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-dark-900 dark:text-white border-b border-dark-100 dark:border-dark-800 pb-2">Tavsiflar</h3>

          <div>
            <label htmlFor="shortDesc" className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5">
              Qisqa tavsif (katalogda ko'rinadi)
            </label>
            <textarea
              id="shortDesc"
              {...register("shortDesc")}
              rows={3}
              className="w-full px-4 py-2.5 border border-dark-200 dark:border-dark-700 rounded-xl bg-white dark:bg-dark-800 text-dark-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              placeholder="Qisqa tavsif..."
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5">
              To'liq tavsif (mahsulot sahifasida ko'rinadi)
            </label>
            <textarea
              id="description"
              {...register("description")}
              rows={6}
              className="w-full px-4 py-2.5 border border-dark-200 dark:border-dark-700 rounded-xl bg-white dark:bg-dark-800 text-dark-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              placeholder="To'liq tavsif..."
            />
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-dark-900 dark:text-white">Xususiyatlar (kalit-qiymat)</h3>
          <Button type="button" variant="outline" size="sm" onClick={() => appendFeature({ key: "", value: "" })} className="gap-1">
            <Plus className="w-4 h-4" />
            Qo'shish
          </Button>
        </div>

        <FieldArray name="features" control={register.control}>
          {({ fields, append, remove }) => (
            <div className="space-y-3">
              {fields.map((field, index) => (
                <motion.div
                  key={field.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex gap-3"
                >
                  <Controller
                    name={`features.${index}.key`}
                    control={register.control}
                    rules={{ required: "Kalit kiritilishi shart" }}
                    render={({ field }) => (
                      <Input
                        {...field}
                        placeholder="Kalit (masalan: resolution)"
                        className="flex-1"
                        error={errors.features?.[index]?.key?.message}
                      />
                    )}
                  />
                  <Controller
                    name={`features.${index}.value`}
                    control={register.control}
                    rules={{ required: "Qiymat kiritilishi shart" }}
                    render={({ field }) => (
                      <Input
                        {...field}
                        placeholder="Qiymat (masalan: 4MP)"
                        className="flex-1"
                        error={errors.features?.[index]?.value?.message}
                      />
                    )}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => remove(index)}
                    className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                    aria-label="O'chirish"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </motion.div>
              ))}
              {fields.length === 0 && (
                <p className="text-center text-dark-500 dark:text-dark-400 py-4">Xususiyatlar yo'q. "Qo'shish" tugmasini bosing.</p>
              )}
            </div>
          )}
        </FieldArray>
      </div>

      {/* Specifications */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-dark-900 dark:text-white">Texnik xarakteristikalar</h3>
          <Button type="button" variant="outline" size="sm" onClick={() => appendSpec({ key: "", value: "" })} className="gap-1">
            <Plus className="w-4 h-4" />
            Qo'shish
          </Button>
        </div>

        <FieldArray name="specifications" control={register.control}>
          {({ fields, append, remove }) => (
            <div className="space-y-3">
              {fields.map((field, index) => (
                <motion.div
                  key={field.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex gap-3"
                >
                  <Controller
                    name={`specifications.${index}.key`}
                    control={register.control}
                    rules={{ required: "Kalit kiritilishi shart" }}
                    render={({ field }) => (
                      <Input
                        {...field}
                        placeholder="Xarakteristika nomi (masalan: Sensor)"
                        className="flex-1"
                      />
                    )}
                  />
                  <Controller
                    name={`specifications.${index}.value`}
                    control={register.control}
                    rules={{ required: "Qiymat kiritilishi shart" }}
                    render={({ field }) => (
                      <Input
                        {...field}
                        placeholder="Qiymat (masalan: 1/3\" CMOS)"
                        className="flex-1"
                      />
                    )}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => remove(index)}
                    className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                    aria-label="O'chirish"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </motion.div>
              ))}
              {fields.length === 0 && (
                <p className="text-center text-dark-500 dark:text-dark-400 py-4">Xarakteristikalar yo'q. "Qo'shish" tugmasini bosing.</p>
              )}
            </div>
          )}
        </FieldArray>
      </div>

      {/* Status Flags */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-dark-50 dark:bg-dark-800/50 border border-dark-100 dark:border-dark-800">
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" {...register("isActive")} className="w-5 h-5 rounded border-dark-300 text-primary-600 focus:ring-primary-500" />
          <span className="font-medium text-dark-900 dark:text-white">Faol (saytdagi ko'rinadi)</span>
        </label>
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" {...register("isFeatured")} className="w-5 h-5 rounded border-dark-300 text-primary-600 focus:ring-primary-500" />
          <span className="font-medium text-dark-900 dark:text-white">Tavsiya etilgan (yulduzcha)</span>
        </label>
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" {...register("isNew")} className="w-5 h-5 rounded border-dark-300 text-primary-600 focus:ring-primary-500" />
          <span className="font-medium text-dark-900 dark:text-white">Yangi (yangi belgisi)</span>
        </label>
      </div>

      {/* Submit Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-end pt-4 border-t border-dark-100 dark:border-dark-800">
        <Button type="button" variant="outline" onClick={() => {}} className="w-full sm:w-auto">
          Bekor qilish
        </Button>
        <Button type="submit" variant="primary" disabled={isLoading} className="w-full sm:w-auto gap-2" size="lg">
          {isLoading ? (
            <>
              <svg className="w-5 h-5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Saqlanmoqda...
            </>
          ) : editingProduct ? (
            <>
              <Check className="w-5 h-5" />
              Yangilash
            </>
          ) : (
            <>
              <Plus className="w-5 h-5" />
              Qo'shish
            </>
          )}
        </Button>
      </div>
    </form>
  );
}