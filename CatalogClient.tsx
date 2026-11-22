"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Filter, X, SlidersHorizontal, ChevronDown, Search, Truck, Shield, RotateCcw } from "lucide-react";
import { ProductCard } from "@/components/ui/ProductCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn, formatPrice } from "@/lib/utils";

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
  brand?: { name: string; slug: string } | null;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  _count: { products: number };
}

interface Brand {
  id: string;
  name: string;
  slug: string;
  _count: { products: number };
}

interface CatalogClientProps {
  initialProducts: Product[];
  initialTotal: number;
  initialPage: number;
  totalPages: number;
  categories: Category[];
  brands: Brand[];
  priceRange: { min: number; max: number };
  currentFilters: {
    category?: string;
    brand?: string;
    filter?: string;
    search?: string;
    sort?: string;
    minPrice?: number;
    maxPrice?: number;
  };
}

export function CatalogClient({
  initialProducts,
  initialTotal,
  initialPage,
  totalPages,
  categories,
  brands,
  priceRange,
  currentFilters,
}: CatalogClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(initialPage);
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [priceMin, setPriceMin] = useState(currentFilters.minPrice || priceRange.min);
  const [priceMax, setPriceMax] = useState(currentFilters.maxPrice || priceRange.max);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(currentFilters.category ? [currentFilters.category] : []);
  const [selectedBrands, setSelectedBrands] = useState<string[]>(currentFilters.brand ? [currentFilters.brand] : []);
  const [sort, setSort] = useState(currentFilters.sort || "newest");

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", page.toString());
      if (selectedCategories.length) params.set("category", selectedCategories[0]);
      if (selectedBrands.length) params.set("brand", selectedBrands[0]);
      if (priceMin > priceRange.min) params.set("minPrice", priceMin.toString());
      if (priceMax < priceRange.max) params.set("maxPrice", priceMax.toString());
      if (sort !== "newest") params.set("sort", sort);
      if (currentFilters.search) params.set("q", currentFilters.search);
      if (currentFilters.filter) params.set("filter", currentFilters.filter);

      const response = await fetch(`/api/products?${params.toString()}`);
      const data = await response.json();

      if (data.products) {
        setProducts(data.products);
        setTotal(data.total);
      }
    } catch (error) {
      console.error("Fetch products error:", error);
    } finally {
      setIsLoading(false);
    }
  }, [page, selectedCategories, selectedBrands, priceMin, priceMax, sort, currentFilters.search, currentFilters.filter, priceRange]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const updateFilters = (newFilters: Partial<typeof currentFilters>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });
    params.set("page", "1");
    router.push(`/katalog?${params.toString()}`);
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedBrands([]);
    setPriceMin(priceRange.min);
    setPriceMax(priceRange.max);
    setSort("newest");
    setPage(1);
    const params = new URLSearchParams();
    if (currentFilters.search) params.set("q", currentFilters.search);
    if (currentFilters.filter) params.set("filter", currentFilters.filter);
    router.push(`/katalog?${params.toString()}`);
  };

  const hasActiveFilters = selectedCategories.length > 0 || selectedBrands.length > 0 ||
    priceMin > priceRange.min || priceMax < priceRange.max || sort !== "newest";

  const sortOptions = [
    { value: "newest", label: "Yangiliklar bo'yicha" },
    { value: "price_asc", label: "Narxi: arzon → qimmat" },
    { value: "price_desc", label: "Narxi: qimmat → arzon" },
    { value: "popular", label: "Mashhurlik bo'yicha" },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-dark-950">
      {/* Page Header */}
      <section className="pt-32 pb-12 md:pt-40 md:pb-16 bg-gradient-to-b from-primary-50 via-white to-white dark:from-dark-900 dark:via-dark-950 dark:to-dark-950">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl"
          >
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-dark-900 dark:text-white mb-4">
              Mahsulot katalogi
            </h1>
            <p className="text-lg text-dark-600 dark:text-dark-400">
              {total} ta mahsulot topildi. Filtrlash va saralash uchun chap panelda sozlamalarni qo'llang.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="section-sm">
        <div className="container">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Filters */}
            <aside className="lg:w-64 flex-shrink-0">
              <div className="sticky top-28 space-y-6">
                {/* Mobile Filter Toggle */}
                <Button
                  variant="outline"
                  className="lg:hidden w-full gap-2 justify-center"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="w-4 h-4" />
                  Filtrlar {hasActiveFilters && <span className="badge badge-primary">{selectedCategories.length + selectedBrands.length + (priceMin > priceRange.min || priceMax < priceRange.max ? 1 : 0)}</span>}
                </Button>

                <AnimatePresence>
                  {showFilters || true && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="lg:block hidden space-y-6"
                    >
                      {/* Search */}
                      <div>
                        <label className="form-label">Qidiruv</label>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                          <input
                            type="search"
                            placeholder="Mahsulot nomi..."
                            defaultValue={currentFilters.search || ""}
                            onChange={(e) => {
                              const params = new URLSearchParams(searchParams.toString());
                              if (e.target.value) params.set("q", e.target.value);
                              else params.delete("q");
                              params.set("page", "1");
                              router.push(`/katalog?${params.toString()}`);
                            }}
                            className="form-input pl-10"
                          />
                        </div>
                      </div>

                      {/* Categories */}
                      <div>
                        <h3 className="font-semibold text-dark-900 dark:text-white mb-3 flex items-center gap-2">
                          Kategoriyalar
                        </h3>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          {categories.map((cat) => (
                            <label key={cat.id} className="flex items-center gap-3 cursor-pointer group">
                              <input
                                type="checkbox"
                                checked={selectedCategories.includes(cat.slug)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedCategories([cat.slug]);
                                    updateFilters({ category: cat.slug });
                                  } else {
                                    setSelectedCategories([]);
                                    updateFilters({ category: undefined });
                                  }
                                }}
                                className="w-4 h-4 rounded border-dark-300 text-primary-600 focus:ring-primary-500"
                              />
                              <span className="text-sm text-dark-700 dark:text-dark-300 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                {cat.name}
                              </span>
                              <span className="ml-auto text-xs text-dark-400 bg-dark-100 dark:bg-dark-800 px-2 py-0.5 rounded-full">
                                {cat._count.products}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Brands */}
                      <div>
                        <h3 className="font-semibold text-dark-900 dark:text-white mb-3">Brendlar</h3>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          {brands.map((brand) => (
                            <label key={brand.id} className="flex items-center gap-3 cursor-pointer group">
                              <input
                                type="checkbox"
                                checked={selectedBrands.includes(brand.slug)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedBrands([brand.slug]);
                                    updateFilters({ brand: brand.slug });
                                  } else {
                                    setSelectedBrands([]);
                                    updateFilters({ brand: undefined });
                                  }
                                }}
                                className="w-4 h-4 rounded border-dark-300 text-primary-600 focus:ring-primary-500"
                              />
                              <span className="text-sm text-dark-700 dark:text-dark-300 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                {brand.name}
                              </span>
                              <span className="ml-auto text-xs text-dark-400 bg-dark-100 dark:bg-dark-800 px-2 py-0.5 rounded-full">
                                {brand._count.products}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Price Range */}
                      <div>
                        <h3 className="font-semibold text-dark-900 dark:text-white mb-3">Narx oralig'i</h3>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-dark-600 dark:text-dark-400">Min</span>
                            <span className="font-medium text-dark-900 dark:text-white">{formatPrice(priceMin)}</span>
                          </div>
                          <input
                            type="range"
                            min={priceRange.min}
                            max={priceRange.max}
                            value={priceMin}
                            onChange={(e) => setPriceMin(parseInt(e.target.value))}
                            className="w-full h-2 bg-dark-200 dark:bg-dark-700 rounded-lg appearance-none accent-primary-600"
                          />
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-dark-600 dark:text-dark-400">Max</span>
                            <span className="font-medium text-dark-900 dark:text-white">{formatPrice(priceMax)}</span>
                          </div>
                          <input
                            type="range"
                            min={priceRange.min}
                            max={priceRange.max}
                            value={priceMax}
                            onChange={(e) => setPriceMax(parseInt(e.target.value))}
                            className="w-full h-2 bg-dark-200 dark:bg-dark-700 rounded-lg appearance-none accent-primary-600"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() => {
                              const newMin = priceMin;
                              const newMax = priceMax;
                              const params = new URLSearchParams(searchParams.toString());
                              if (newMin > priceRange.min) params.set("minPrice", newMin.toString());
                              else params.delete("minPrice");
                              if (newMax < priceRange.max) params.set("maxPrice", newMax.toString());
                              else params.delete("maxPrice");
                              params.set("page", "1");
                              router.push(`/katalog?${params.toString()}`);
                            }}
                          >
                            qo'llash
                          </Button>
                        </div>
                      </div>

                      {/* Clear Filters */}
                      {hasActiveFilters && (
                        <Button variant="ghost" size="sm" className="w-full text-red-600 hover:text-red-700" onClick={clearFilters}>
                          <RotateCcw className="w-4 h-4 mr-2" />
                          Filtrlarni tozalash
                        </Button>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </aside>

            {/* Products Area */}
            <div className="flex-1">
              {/* Toolbar */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-dark-600 dark:text-dark-400">
                    {total} ta mahsulot
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={sort}
                    onChange={(e) => {
                      setSort(e.target.value);
                      const params = new URLSearchParams(searchParams.toString());
                      if (e.target.value !== "newest") params.set("sort", e.target.value);
                      else params.delete("sort");
                      params.set("page", "1");
                      router.push(`/katalog?${params.toString()}`);
                    }}
                    className="form-input py-2 px-3 text-sm w-auto min-w-[200px]"
                  >
                    {sortOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>

                  <Button
                    variant="outline"
                    size="sm"
                    className="lg:hidden"
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    <SlidersHorizontal className="w-4 h-4 mr-1" />
                    Filtrlar
                  </Button>
                </div>
              </div>

              {/* Products Grid */}
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="product-grid"
                  >
                    {[...Array(8)].map((_, i) => (
                      <div key={i} className="skeleton-card" />
                    ))}
                  </motion.div>
                ) : products.length > 0 ? (
                  <motion.div
                    key="products"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="product-grid"
                  >
                    {products.map((product, i) => (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: i * 0.03 }}
                      >
                        <ProductCard product={product} />
                      </motion.div>
                    ))}
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-20"
                  >
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-dark-100 dark:bg-dark-800 flex items-center justify-center">
                      <Search className="w-10 h-10 text-dark-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-dark-900 dark:text-white mb-2">Mahsulotlar topilmadi</h3>
                    <p className="text-dark-600 dark:text-dark-400 mb-6">Filtrlarni o'zgartiring yoki qidiruv so'zini qisqartiring</p>
                    <Button variant="outline" onClick={clearFilters}>
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Barcha filtrlarni tozalash
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Pagination */}
              {totalPages > 1 && (
                <motion.nav
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-12 flex items-center justify-center gap-2"
                  aria-label="Sahifalash"
                >
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 1}
                    onClick={() => {
                      const params = new URLSearchParams(searchParams.toString());
                      params.set("page", (page - 1).toString());
                      router.push(`/katalog?${params.toString()}`);
                    }}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      let pageNum: number;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (page <= 3) {
                        pageNum = i + 1;
                      } else if (page >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = page - 2 + i;
                      }
                      return (
                        <Button
                          key={pageNum}
                          variant={page === pageNum ? "primary" : "ghost"}
                          size="sm"
                          onClick={() => {
                            const params = new URLSearchParams(searchParams.toString());
                            params.set("page", pageNum.toString());
                            router.push(`/katalog?${params.toString()}`);
                          }}
                          className="w-10 h-10"
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === totalPages}
                    onClick={() => {
                      const params = new URLSearchParams(searchParams.toString());
                      params.set("page", (page + 1).toString());
                      router.push(`/katalog?${params.toString()}`);
                    }}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </motion.nav>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Bar */}
      <section className="bg-dark-900 text-white py-12">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { icon: Truck, title: "Bepul yetkazib berish", desc: "Toshkentda 1 kun, viloyatlarga 2-3 kun" },
              { icon: Shield, title: "Rasmiy kafolat", desc: "1-3 yil kafolat va servis" },
              { icon: RotateCcw, title: "14 kun qaytarish", desc: "Bepul qaytarish va almashtirish" },
              { icon: Shield, title: "To'lov taqdim etilganda", desc: "Naqd yoki karta, oldin to'lov shart emas" },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="w-14 h-14 mx-auto mb-3 rounded-xl bg-primary-500/20 flex items-center justify-center">
                  <item.icon className="w-7 h-7 text-primary-400" />
                </div>
                <h4 className="font-semibold mb-1">{item.title}</h4>
                <p className="text-sm text-dark-400">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}