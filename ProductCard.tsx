"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn, formatPrice } from "@/lib/utils";
import { ShoppingCart, Eye, Tag, Star } from "lucide-react";
import { Button } from "./Button";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number | string;
  oldPrice?: number | string | null;
  images: string[];
  shortDesc?: string | null;
  isNew?: boolean;
  isFeatured?: boolean;
  category?: { name: string; slug: string };
}

interface ProductCardProps {
  product: Product;
  variant?: "default" | "compact" | "featured";
  priority?: boolean;
}

export function ProductCard({ product, variant = "default", priority = false }: ProductCardProps) {
  const hasDiscount = product.oldPrice && Number(product.oldPrice) > Number(product.price);
  const discountPercent = hasDiscount
    ? Math.round((1 - Number(product.price) / Number(product.oldPrice!)) * 100)
    : 0;

  const variants = {
    default: "group relative flex flex-col h-full",
    compact: "group relative flex flex-row h-auto min-h-[160px] w-full max-w-xl",
    featured: "group relative flex flex-col h-full",
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={cn(
        "bg-white dark:bg-dark-900 rounded-2xl overflow-hidden",
        "shadow-sm border border-dark-100 dark:border-dark-800",
        "transition-all duration-300",
        "hover:shadow-2xl hover:border-primary-200 dark:hover:border-primary-900/30",
        "hover:-translate-y-1",
        variants[variant]
      )}
    >
      {/* Badges */}
      <div className="absolute top-3 left-3 right-3 z-10 flex items-start justify-between gap-2 pointer-events-none">
        {(product.isNew || product.isFeatured || hasDiscount) && (
          <div className="flex flex-col gap-1.5">
            {product.isNew && (
              <span className="px-2.5 py-1 text-xs font-semibold text-white bg-primary-600 rounded-full shadow-lg">
                Yangi
              </span>
            )}
            {product.isFeatured && (
              <span className="px-2.5 py-1 text-xs font-semibold text-white bg-amber-500 rounded-full shadow-lg">
                <Star className="w-3 h-3 inline-block mr-0.5" /> Tavsiya
              </span>
            )}
            {hasDiscount && (
              <span className="px-2.5 py-1 text-xs font-semibold text-white bg-red-500 rounded-full shadow-lg">
                -{discountPercent}%
              </span>
            )}
          </div>
        )}
      </div>

      {/* Image */}
      <div
        className={cn(
          "relative overflow-hidden bg-dark-50 dark:bg-dark-800",
          variant === "compact" ? "w-48 flex-shrink-0" : "aspect-[4/3]"
        )}
      >
        {product.images[0] ? (
          <Link href={`/mahsulot/${product.slug}`} className="block relative h-full">
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              priority={priority}
              sizes={variant === "compact" ? "200px" : "(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"}
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              placeholder="blur"
              blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
            />
          </Link>
        ) : (
          <div className="flex h-full items-center justify-center text-dark-400">
            <Eye className="w-12 h-12" />
          </div>
        )}

        {/* Quick View / Add to Cart overlay */}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Button
            variant="ghost"
            size="lg"
            className="bg-white/90 dark:bg-dark-900/90 text-dark-900 dark:text-white backdrop-blur-sm"
            asChild
          >
            <Link href={`/mahsulot/${product.slug}`}>
              <Eye className="w-5 h-5" />
              <span className="hidden sm:inline">Ko'rish</span>
            </Link>
          </Button>
          <Button
            variant="primary"
            size="lg"
            className="gap-2"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              // Trigger order modal
              window.dispatchEvent(new CustomEvent("open-order-modal", { detail: product }));
            }}
          >
            <ShoppingCart className="w-5 h-5" />
            <span className="hidden sm:inline">Buyurtma</span>
          </Button>
        </div>
      </div>

      {/* Content */}
      <div
        className={cn(
          "flex flex-1 flex-col p-4 gap-3",
          variant === "compact" ? "justify-between" : ""
        )}
      >
        <div>
          {product.category && (
            <Link
              href={`/kategoriya/${product.category.slug}`}
              className="text-xs font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400"
            >
              {product.category.name}
            </Link>
          )}
          <Link href={`/mahsulot/${product.slug}`} className="block mt-1">
            <h3 className="font-semibold text-dark-900 dark:text-white line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
              {product.name}
            </h3>
          </Link>
          {product.shortDesc && (
            <p className="mt-1.5 text-sm text-dark-500 dark:text-dark-400 line-clamp-2">
              {product.shortDesc}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-dark-100 dark:border-dark-800">
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-dark-900 dark:text-white">
              {formatPrice(product.price)}
            </span>
            {hasDiscount && (
              <span className="text-sm line-through text-dark-400 dark:text-dark-500">
                {formatPrice(product.oldPrice!)}
              </span>
            )}
          </div>
          <Button
            variant="primary"
            size="sm"
            className="gap-1.5"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              window.dispatchEvent(new CustomEvent("open-order-modal", { detail: product }));
            }}
          >
            <ShoppingCart className="w-4 h-4" />
            <span className="hidden xs:inline">Buyurtma</span>
          </Button>
        </div>
      </div>
    </motion.article>
  );
}