"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaArrowLeftLong } from "react-icons/fa6";
import { FaArrowRightLong } from "react-icons/fa6";
import { getCategories } from "@/services/api";

interface Category {
  id: number;
  name: string;
  image: string;
  slug: string;
}

//  إضافة interface للـ props مع onLoad
export interface CategoriesSectionProps {
  onLoad?: () => void;
  categories?: Category[]; // جعلها اختيارية للسماح بجلب البيانات داخلياً
}

//  دالة لتوليد slug
const generateSlug = (name: string): string => {
  const slugMap: { [key: string]: string } = {
    
  };
  return slugMap[name] || name.toLowerCase().replace(/\s+/g, '-');
};

export function CategoriesSection({ onLoad, categories: propCategories }: CategoriesSectionProps) {
  const [categories, setCategories] = useState<Category[]>(propCategories || []);
  const [loading, setLoading] = useState(!propCategories);
  const [error, setError] = useState<string | null>(null);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollStart, setScrollStart] = useState(0);

  //  استدعاء onLoad عند اكتمال التحميل
  useEffect(() => {
    if (!loading && !isDataLoaded && onLoad) {
      setIsDataLoaded(true);
      setTimeout(() => {
        onLoad();
      }, 100);
    }
  }, [loading, isDataLoaded, onLoad]);

  //  جلب البيانات إذا لم يتم تمريرها كـ props
  useEffect(() => {
    if (propCategories && propCategories.length > 0) {
      setCategories(propCategories);
      setLoading(false);
      return;
    }

    const fetchCategories = async () => {
      try {
        setLoading(true);
        const data = await getCategories();
        
        const transformedCategories: Category[] = data.map((cat: any) => ({
          id: cat.id,
          name: cat.name,
          image: `https://alsas.admin.t-carts.com${cat.image}`,
          slug: generateSlug(cat.name)
        }));
        
        setCategories(transformedCategories);
        setError(null);
      } catch (err) {
        console.error('Error loading categories:', err);
        setError('فشل في تحميل الأقسام');
        // استخدام صور افتراضية كـ fallback
        setCategories(getDefaultCategories());
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [propCategories]);

  //  صور افتراضية في حالة عدم وجود بيانات
  const getDefaultCategories = (): Category[] => {
    return [
     
    ];
  };

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

  const handleDragEnd = () => {
    setIsDragging(false);
    if (sliderRef.current) {
      sliderRef.current.style.cursor = 'grab';
      sliderRef.current.style.userSelect = 'auto';
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (!sliderRef.current) return;
    const scrollAmount = direction === 'left' ? -300 : 300;
    sliderRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  //  حالة التحميل
  if (loading) {
    return (
      <section className="py-2 md:py-12">
        <div className="container-custom px-2 lg:px-6">
          <div className="flex justify-center items-center h-[100px] md:h-[236px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF7700]"></div>
          </div>
        </div>
      </section>
    );
  }

  //  حالة الخطأ
  if (error && categories.length === 0) {
    return (
      <></>
    );
  }

  //  إذا لم توجد فئات
  if (categories.length === 0) {
    return null;
  }

  //  العرض الرئيسي
  return (
    <section className="py-2">
      <div className="container-custom px-2 lg:px-6 relative">
        <div 
          ref={sliderRef}
          className="overflow-x-auto lg:px-5  h-[130px] md:h-[236px] pt-2 hide-scrollbar"
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
                className="flex flex-shrink-0 w-[100px] justify-center items-center md:w-[124px] group transition-all duration-300 hover:-translate-y-2"
              >
                <Link href={`products?categories=[${category.id}]`}>
                  <div className="bg-white transition-all w-[100px] md:w-[124px] duration-300 cursor-pointer pb-7">
                    {/* حاوية الصورة */}
                    <div className="relative mx-auto overflow-hidden rounded-full w-[80px] md:w-[124px] transition-transform duration-300">
                      <Image
                        src={category.image}
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