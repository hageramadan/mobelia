// components/LatestProducts.tsx

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { ProductCard } from "../products/ProductCard";
import { Button } from "../ui/button";
import { getNewProducts, ProductData } from "@/services/api";
import { AdsHome } from "./AdsHome";
import { useLanguage } from "@/contexts/LanguageContext";
import { Product, ProductVariant, VariantAttribute } from "@/types/product";

interface LatestProductsProps {
  onLoad?: () => void;
}

//  دالة للحصول على الترجمات حسب اللغة
const getTranslations = (lang: string) => {
  if (lang === "en") {
    return {
      latestProducts: "Latest Products",
      viewMore: "View More",
      loading: "Loading products...",
      error: "Failed to load products",
      noProducts: "No products available",
      retry: "Retry",
    };
  }
  // Arabic (default)
  return {
    latestProducts: "أحدث المنتجات",
    viewMore: "عرض المزيد",
    loading: "جاري تحميل المنتجات...",
    error: "فشل في تحميل المنتجات",
    noProducts: "لا توجد منتجات متاحة",
    retry: "إعادة المحاولة",
  };
};

//  دالة استخراج الألوان من جميع الـ variants
const extractColorsFromVariants = (
  variants: ProductVariant[],
): Array<{ color: string; name: string }> => {
  const colorMap = new Map<string, string>();

  if (!variants || variants.length === 0) return [];

  variants.forEach((variant) => {
    if (variant.attributes && Array.isArray(variant.attributes)) {
      variant.attributes.forEach((attr: VariantAttribute) => {
        if (
          attr.attribute_type?.name === "اللون" &&
          attr.value &&
          attr.meta?.color
        ) {
          if (!colorMap.has(attr.value)) {
            colorMap.set(attr.value, attr.meta.color);
          }
        }
      });
    }
  });

  return Array.from(colorMap.entries()).map(([name, color]) => ({
    name: name,
    color: color,
  }));
};

// تحويل البيانات من API إلى شكل المنتج المطلوب - ديناميكي بالكامل
const transformProduct = (product: ProductData): Product => {
  // معالجة الصور بشكل صحيح
  const cleanImageUrl = (url: string) => {
    if (!url) return "/images/placeholder.jpg";
    if (url.startsWith("/storage")) {
      return `https://alsas.admin.t-carts.com${url}`;
    }
    return `https://alsas.admin.t-carts.com${url}`;
  };

  const mainImage =
    product.images && product.images.length > 0
      ? cleanImageUrl(product.images[0])
      : "/images/placeholder.jpg";

  const hoverImage =
    product.images && product.images.length > 1
      ? cleanImageUrl(product.images[1])
      : mainImage;

  // حساب الخصم بشكل ديناميكي
  let discount: number | undefined;
  let originalPrice: number | undefined;

  if (product.pricing.has_discount && product.pricing.price_after_discount) {
    discount = Math.round(
      ((product.pricing.price - product.pricing.price_after_discount) /
        product.pricing.price) *
        100,
    );
    originalPrice = product.pricing.price;
  }

  //  استخراج الألوان من جميع الـ variants ديناميكياً
  let colors: Array<{ color: string; name: string }> = [];
  let hasVariants = false;
  let variants: ProductVariant[] = [];
  let variantId: number | null = null;

  if (product.has_variants && product.variants && product.variants.length > 0) {
    hasVariants = true;
    variants = product.variants as ProductVariant[];
    variantId = product.variants[0].id;
    colors = extractColorsFromVariants(product.variants as ProductVariant[]);
  }

  return {
    id: product.id.toString(),
    name: product.name,
    price: product.pricing.final_price,
    image: mainImage,
    hoverImage: hoverImage,
    href: `/product/${product.id}`,
    originalPrice: originalPrice,
    discount: discount,
    colors: colors,
    rating: product.avg_rating || 0,
    reviewsCount: product.total_reviews || 0,
    isBestSeller: product.is_active,
    hasVariants: hasVariants,
    variants: variants,
    variantId: variantId,
    quantity: product.quantity ?? null,
  };
};

export function LatestProducts({ onLoad }: LatestProductsProps) {
  const { language } = useLanguage();
  const t = getTranslations(language);

  //  إضافة state لمنع Hydration Error
  const [isClient, setIsClient] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [displayCount, setDisplayCount] = useState(6); // ✅ تغيير من 8 إلى 6 (مثل الكود الأول)
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  const isMountedRef = useRef(true);
  const fetchingRef = useRef(false);

  // ✅ استدعاء onLoad بعد تحميل البيانات
  useEffect(() => {
    if (!isInitialLoading && !isDataLoaded && onLoad) {
      setIsDataLoaded(true);
      setTimeout(() => {
        onLoad();
      }, 0);
    }
  }, [isInitialLoading, isDataLoaded, onLoad]);

  //  تعيين isClient بعد تحميل العميل
  useEffect(() => {
    setIsClient(true);
  }, []);

  // جلب المنتجات من API
  const fetchProducts = useCallback(
    async (page: number, append: boolean = false) => {
      if (fetchingRef.current) return;

      try {
        fetchingRef.current = true;

        if (page === 1) {
          setIsInitialLoading(true);
        } else {
          setIsLoadingMore(true);
        }

        const productsData = await getNewProducts(page, 12);

        if (!isMountedRef.current) return;

        if (productsData.length === 0) {
          setHasMore(false);
        }

        const transformedProducts = productsData.map(transformProduct);

        if (append) {
          setProducts((prev) => [...prev, ...transformedProducts]);
        } else {
          setProducts(transformedProducts);
        }

        setTotalProducts(productsData.length);
        setHasMore(productsData.length === 12);
      } catch (err) {
        console.error("Error fetching products:", err);
        if (!isMountedRef.current) return;
        setError(t.error);
        setProducts([]);
      } finally {
        if (!isMountedRef.current) return;
        setIsInitialLoading(false);
        setIsLoadingMore(false);
        fetchingRef.current = false;
      }
    },
    [t.error],
  );

  useEffect(() => {
    isMountedRef.current = true;

    const timeoutId = setTimeout(() => {
      fetchProducts(1, false);
    }, 0);

    return () => {
      isMountedRef.current = false;
      clearTimeout(timeoutId);
    };
  }, [fetchProducts]);

  // ✅ دالة Load More (مثل الكود الأول)
  const handleLoadMore = () => {
    setIsLoadingMore(true);
    setTimeout(() => {
      setDisplayCount((prev) => Math.min(prev + 6, products.length));
      setIsLoadingMore(false);
    }, 500);
  };

  // ✅ استخدام displayCount للتحكم في المنتجات المعروضة (مثل الكود الأول)
  const visibleProducts = products.slice(0, displayCount);
  const hasMoreProducts = displayCount < products.length;

  // ✅ آخر منتج للعرض في الموبايل (مثل الكود الأول)
  const lastProduct = products[products.length - 1];

  //  عرض نسخة ثابتة أثناء Hydration
  if (!isClient) {
    return (
      <section className="py-2 md:py-12 bg-white">
        <div className="container-custom">
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#FF7700]"></div>
          </div>
        </div>
      </section>
    );
  }

  // عرض السبينر الرئيسي أثناء التحميل الأولي
  if (isInitialLoading) {
    return (
      <section className="py-2 md:py-12 bg-white">
        <div className="container-custom">
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#FF7700]"></div>
          </div>
        </div>
      </section>
    );
  }

  // عرض رسالة خطأ (مثل الكود الأول - مخفية)
  if (error && products.length === 0) {
    if (!isDataLoaded && onLoad) {
      setIsDataLoaded(true);
      onLoad();
    }
    return <></>;
  }

  return (
    <section className="py-2 md:py-12 bg-white">
      <div className="container-custom">
        {/* ✅ Header - نفس تصميم الكود الأول مع دعم اللغة */}
        {visibleProducts.length > 0 && (
          <div className="mb-2 md:mb-5 flex justify-between items-center">
            <h2 className="text-lg md:text-xl font-bold" style={{ color: '#112B40' }}>
              {t.latestProducts}
            </h2>
            <Link href="/products" className="text-[14px] font-bold text-[#FF7700] hover:underline">
              {t.viewMore}
            </Link>
          </div>
        )}

        {/* ✅ Products Grid - نفس تصميم الكود الأول */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 lg:gap-6 justify-items-center mb-10">
          <div className="col-span-3 grid grid-cols-2 lg:grid-cols-3 gap-2 lg:gap-6 justify-items-center">
            {visibleProducts.map((product, index) => (
              <div
                key={product.id}
                className="animate-in fade-in zoom-in duration-500 mb-3"
                style={{ 
                  animationFillMode: 'both',
                  animationDelay: `${index * 100}ms`
                }}
              >
                <ProductCard 
                  id={product.id}
                  name={product.name}
                  price={product.price}
                  image={product.image}
                  hoverImage={product.hoverImage}
                  href={product.href}
                  originalPrice={product.originalPrice}
                  discount={product.discount}
                  colors={product.colors}
                  rating={product.rating}
                  reviewsCount={product.reviewsCount}
                  isBestSeller={product.isBestSeller}
                  hasVariants={product.hasVariants || false}
                  variants={product.variants || []}
                  variantId={product.variantId || null}
                  quantity={product.quantity} // ✅ تمرير الكمية
                />
              </div>
            ))}
          </div>

          {/* ✅ Mobile extra products - نفس تصميم الكود الأول */}
          <div className="sm:hidden flex flex-col gap-6">
            {lastProduct && (
              <>
                <ProductCard 
                  id={lastProduct.id}
                  name={lastProduct.name}
                  price={lastProduct.price}
                  image={lastProduct.image}
                  hoverImage={lastProduct.hoverImage}
                  href={lastProduct.href}
                  originalPrice={lastProduct.originalPrice}
                  discount={lastProduct.discount}
                  colors={lastProduct.colors}
                  rating={lastProduct.rating}
                  reviewsCount={lastProduct.reviewsCount}
                  isBestSeller={lastProduct.isBestSeller}
                  hasVariants={lastProduct.hasVariants || false}
                  variants={lastProduct.variants || []}
                  variantId={lastProduct.variantId || null}
                  quantity={lastProduct.quantity}
                />
                <ProductCard 
                  id={lastProduct.id}
                  name={lastProduct.name}
                  price={lastProduct.price}
                  image={lastProduct.image}
                  hoverImage={lastProduct.hoverImage}
                  href={lastProduct.href}
                  originalPrice={lastProduct.originalPrice}
                  discount={lastProduct.discount}
                  colors={lastProduct.colors}
                  rating={lastProduct.rating}
                  reviewsCount={lastProduct.reviewsCount}
                  isBestSeller={lastProduct.isBestSeller}
                  hasVariants={lastProduct.hasVariants || false}
                  variants={lastProduct.variants || []}
                  variantId={lastProduct.variantId || null}
                  quantity={lastProduct.quantity}
                />
              </>
            )}
          </div>

          {/* ✅ Sale Banner - نفس تصميم الكود الأول مع الحفاظ على AdsHome */}
          <AdsHome />
        </div>

        {/* ✅ Loading State for Load More - نفس تصميم الكود الأول */}
        {isLoadingMore && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF7700]"></div>
          </div>
        )}

        {/* ✅ Load More Button - نفس تصميم الكود الأول */}
        {/* {hasMoreProducts && !isLoadingMore && (
          <div className="text-center my-8">
            <Button
              onClick={handleLoadMore}
              className="px-8 py-2 bg-[#FF7700] text-white rounded-md hover:bg-[#e66a00] transition-colors"
            >
              عرض المزيد
            </Button>
          </div>
        )} */}
      </div>
    </section>
  );
}