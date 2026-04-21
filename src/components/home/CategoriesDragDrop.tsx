"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";

interface Category {
  id: string;
  name: string;
  image: string;
  href: string;
}

const initialCategories: Category[] = [
  {
    id: "1",
    name: "غرفة معيشة",
    image: "/images/categories/cate1.png",
    href: "/",
  },
  {
    id: "2",
    name: "غرفة نوم",
    image: "/images/categories/cate2.png",
    href: "/",
  },
  {
    id: "3",
    name: "غرفة سفرة",
    image: "/images/categories/cate3.png",
    href: "/",
  },
  {
    id: "4",
    name: " غرفة معيشة",
    image: "/images/categories/cate4.png",
    href: "/",
  },
  {
    id: "5",
    name: " غرفة معيشة",
    image: "/images/categories/cate5.png",
    href: "/",
  },
  {
    id: "6",
    name: "غرفة معيشة",
    image: "/images/categories/cate6.png",
    href: "/",
  },
  {
    id: "7",
    name: " كراسي معيشة",
    image: "/images/categories/cate7.png",
    href: "/",
  },
  {
    id: "8",
    name: "كراسي سفرة ",
    image: "/images/categories/cate8.png",
    href: "/",
  },
  {
    id: "9",
    name: " غرفة معيشة 2",
    image: "/images/categories/cate4.png",
    href: "/",
  },
  {
    id: "10",
    name: " غرفة معيشة 2",
    image: "/images/categories/cate5.png",
    href: "/",
  },
  {
    id: "11",
    name: " غرفة معيشة 2",
    image: "/images/categories/cate1.png",
    href: "/",
  },
  {
    id: "12",
    name: " غرفة معيشة 2",
    image: "/images/categories/cate2.png",
    href: "/",
  },
];

export function CategoriesDragDrop() {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollStart, setScrollStart] = useState(0);

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
    const walk = (x - startX) * 1.5; // سرعة التمرير
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

  return (
    <section className="py-2 md:py-2 md:py-12">
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
            {initialCategories.map((category) => (
              <div
                key={category.id}
                className="flex-shrink-0 w-[65px] md:w-[124px] group transition-all duration-300 hover:-translate-y-2"
                // style={{ width: '124px' }}
              >
                <Link href="#">
                  <div className="bg-white transition-all w-[55px] md:w-[124px] duration-300  cursor-pointer pb-7 ">
                    {/* حاوية الصورة 124x124 بشكل دائرة */}
                    <div 
                      className="relative overflow-hidden rounded-full w-[46px] md:w-[124px] transition-transform duration-300 "
                      // style={{ 
                      //   width: '124px',
                      //   height: '124px',
                      // }}
                    >
                      <Image
                        src={category.image}
                        alt={category.name}
                        width={124}
                        height={124}
                        className="object-cover transition-transform duration-500  "
                        sizes="124px"
                      />
                    </div>

                    {/* اسم الفئة */}
                    <div className="text-center mt-2 pb-2 w-full ">
                      <h3 
                        className="text-[10px] sm:text-[16px] whitespace-nowrap   "
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