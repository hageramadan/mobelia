"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { ProductCard } from "../products/ProductCard";
import { Button } from "../ui/button";
import Image from "next/image";
import { MdOutlineTimer } from "react-icons/md";
import { FaArrowLeft } from "react-icons/fa";
import { FaArrowRight } from "react-icons/fa6";
import { getNewProducts, Product } from "@/services/api";
import { AdsHome } from "./AdsHome";

// تحويل بيانات API إلى الصيغة المطلوبة لـ ProductCard
const formatProductForCard = (product: Product) => {
  // حساب نسبة الخصم إذا وجد
  let discountPercentage = undefined;
  if (product.pricing.has_discount && product.pricing.price_after_discount) {
    discountPercentage = Math.round(
      ((product.pricing.price - product.pricing.price_after_discount) / product.pricing.price) * 100
    );
  }

  return {
    id: product.id.toString(),
    name: product.name,
    price: product.pricing.final_price,
    originalPrice: product.pricing.has_discount ? product.pricing.price : undefined,
    discount: discountPercentage,
    image: `https://alsas.admin.t-carts.com${product.images[0]}` || "/images/placeholder.jpg",
    href: `/product/${product.id}`,
  };
};

export function LatestProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [displayCount, setDisplayCount] = useState(6);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // جلب البيانات من API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const data = await getNewProducts();
        setProducts(data);
        setError(null);
      } catch (err) {
        setError("حدث خطأ في تحميل المنتجات");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleLoadMore = () => {
    setIsLoadingMore(true);
    setTimeout(() => {
      setDisplayCount((prev) => Math.min(prev + 6, products.length));
      setIsLoadingMore(false);
    }, 500);
  };

  // تحويل المنتجات إلى الصيغة المطلوبة
  const formattedProducts = products.map(formatProductForCard);
  const visibleProducts = formattedProducts.slice(0, displayCount);
  const hasMore = displayCount < formattedProducts.length;

  // آخر منتج للعرض في الموبايل
  const lastProduct = formattedProducts[formattedProducts.length - 1];

  if (loading) {
    return (
      <section className="py-2 md:py-12 bg-white">
        <div className="container-custom">
          <div className="mb-5 md:mb-10 flex justify-between">
            <h2 className="text-2xl md:text-3xl font-bold mb-3" style={{ color: '#112B40' }}>
              أحدث المنتجات
            </h2>
          </div>
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#FF7700]"></div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-2 md:py-12 bg-white">
        <div className="container-custom">
          <div className="mb-5 md:mb-10 flex justify-between">
            <h2 className="text-2xl md:text-3xl font-bold mb-3" style={{ color: '#112B40' }}>
              أحدث المنتجات
            </h2>
          </div>
          <div className="flex flex-col justify-center items-center py-20 text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-[#FF7700] text-white rounded-md"
            >
              إعادة المحاولة
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return (
      <section className="py-2 md:py-12 bg-white">
        <div className="container-custom">
          <div className="mb-5 md:mb-10 flex justify-between">
            <h2 className="text-2xl md:text-3xl font-bold mb-3" style={{ color: '#112B40' }}>
              أحدث المنتجات
            </h2>
          </div>
          <div className="text-center py-20">
            <p className="text-gray-500">لا توجد منتجات حالياً</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-2 md:py-12 bg-white">
      <div className="container-custom">
        {/* Header */}
        <div className="mb-5 md:mb-10 flex justify-between items-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-3" style={{ color: '#112B40' }}>
            أحدث المنتجات
          </h2>
          <Link href="/products" className="text-[#FF7700] hover:underline">
            عرض المزيد
          </Link>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center mb-10">
          <div className="col-span-3 grid grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
            {visibleProducts.map((product, index) => (
              <div
                key={product.id}
                className="animate-in fade-in zoom-in duration-500"
                style={{ 
                  animationFillMode: 'both',
                  animationDelay: `${index * 100}ms`
                }}
              >
                <ProductCard {...product} />
              </div>
            ))}
          </div>
         
          {/* Mobile extra products */}
          <div className="sm:hidden flex flex-col gap-6 ms-8">
            {lastProduct && (
              <>
                <ProductCard {...lastProduct} />
                <ProductCard {...lastProduct} />
              </>
            )}
          </div>

          {/* Sale Banner */}
        <AdsHome/>
        </div>

        {/* Loading State for Load More */}
        {isLoadingMore && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF7700]"></div>
          </div>
        )}

        {/* View More Button (اختياري - يمكن تفعيله إذا أردت) */}
        {/* {hasMore && !isLoadingMore && (
          <div className="text-center">
            <Button
              onClick={handleLoadMore}
              className="group px-8 py-6 text-base font-semibold transition-all duration-300 hover:scale-105"
              style={{
                backgroundColor: 'white',
                color: '#FF7700',
                border: '2px solid #FF7700',
                borderRadius: '12px'
              }}
            >
              عرض المزيد
              <ChevronLeft className="mr-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
            </Button>
          </div>
        )} */}
      </div>
    </section>
  );
}