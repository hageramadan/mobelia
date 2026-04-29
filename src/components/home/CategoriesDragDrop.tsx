"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { getCategories, Category } from "@/services/api";

interface CategoryWithHref extends Category {
  href: string;
}

export function CategoriesDragDrop() {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollStart, setScrollStart] = useState(0);
  const [categories, setCategories] = useState<CategoryWithHref[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // جلب البيانات من API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const data = await getCategories();
        
        // تحويل البيانات إلى الصيغة المطلوبة مع إضافة href
        const categoriesWithHref = data.map((category) => ({
          ...category,
          href: `/category/${category.id}`,
        }));
        
        setCategories(categoriesWithHref);
        setError(null);
      } catch (err) {
        setError("حدث خطأ في تحميل الأقسام");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // بدء السحب
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!sliderRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX);
    setScrollStart(sliderRef.current.scrollLeft);
    sliderRef.current.style.cursor = 'grabbing';
    sliderRef.current.style.userSelect = 'none';
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!sliderRef.current) return;
    setIsDragging(true);
    setStartX(e.touches[0].pageX);
    setScrollStart(sliderRef.current.scrollLeft);
  };

  // أثناء السحب
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !sliderRef.current) return;
    e.preventDefault();
    const x = e.pageX;
    const walk = (x - startX) * 1.5;
    sliderRef.current.scrollLeft = scrollStart - walk;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !sliderRef.current) return;
    const x = e.touches[0].pageX;
    const walk = (x - startX) * 1.5;
    sliderRef.current.scrollLeft = scrollStart - walk;
  };

  // إنهاء السحب
  const handleDragEnd = () => {
    setIsDragging(false);
    if (sliderRef.current) {
      sliderRef.current.style.cursor = 'grab';
      sliderRef.current.style.userSelect = 'auto';
    }
  };

  // دالة للحصول على مسار الصورة الكامل
  const getFullImageUrl = (imagePath: string) => {
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    return `https://alsas.admin.t-carts.com${imagePath}`;
  };

  if (loading) {
    return (
      <section className="py-2 md:py-12">
        <div className="container-custom px-4 sm:px-6">
          <div className="mb-6 md:mb-8">
            <h2 className="text-xl md:text-2xl lg:text-3xl font-bold mb-2" style={{ color: '#112B40' }}>
              الأقسام
            </h2>
          </div>
          <div className="flex justify-center items-center h-[176px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF7700]"></div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-2 md:py-12">
        <div className="container-custom px-4 sm:px-6">
          <div className="mb-6 md:mb-8">
            <h2 className="text-xl md:text-2xl lg:text-3xl font-bold mb-2" style={{ color: '#112B40' }}>
              الأقسام
            </h2>
          </div>
          <div className="text-center text-red-500">
            <p>{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-2 px-4 py-2 bg-[#FF7700] text-white rounded-md"
            >
              إعادة المحاولة
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-2 md:py-12">
      <div className="container-custom px-4 sm:px-6">
        <div className="mb-6 md:mb-8">
          <h2 className="text-xl md:text-2xl lg:text-3xl font-bold mb-2" style={{ color: '#112B40' }}>
            الأقسام
          </h2>
        </div>

        {/* حاوية السحب الأفقية */}
        <div 
          ref={sliderRef}
          className="overflow-x-auto h-[100px] md:h-[176px] pt-2 md:pt-5 hide-scrollbar"
          style={{ 
            width: '100%',
            overflowY: 'hidden',
            cursor: 'grab',
            WebkitOverflowScrolling: 'touch',
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleDragEnd}
          onMouseLeave={handleDragEnd}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleDragEnd}
        >
          <div className="flex gap-2 md:gap-[26px] h-full">
            {categories.map((category) => (
              <div
                key={category.id}
                className="flex-shrink-0 w-[65px] md:w-[124px] group transition-all duration-300 hover:-translate-y-2"
              >
                <Link href={category.href}>
                  <div className="bg-white transition-all w-[55px] md:w-[124px] duration-300 cursor-pointer pb-7">
                    {/* حاوية الصورة */}
                    <div className="relative overflow-hidden rounded-full w-[46px] md:w-[124px] transition-transform duration-300">
                      <Image
                        src={getFullImageUrl(category.image)}
                        alt={category.name}
                        width={124}
                        height={124}
                        className="object-cover transition-transform duration-500"
                        sizes="124px"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/images/placeholder.jpg';
                        }}
                      />
                    </div>

                    {/* اسم الفئة */}
                    <div className="text-center mt-2 pb-2 w-full">
                      <h3 
                        className="text-[10px] sm:text-[16px] whitespace-nowrap"
                        style={{ color: '#112B40' }}
                      >
                        {category.name}
                      </h3>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
}