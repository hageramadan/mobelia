"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { ProductCard } from "../products/ProductCard";
import { Button } from "../ui/button";

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  href: string;
  originalPrice?: number;
  discount?: number;
}

const latestProducts: Product[] = [
  {
    id: "1",
    name: "Lorem ipsum dolor sit amet consectetur. Accumsan massa mauris nunc lacus.",
    price: 360,
    originalPrice: 35000,
    discount: 28,
    image: "/images/products/pro1.png",
    href: "/",
  },
  {
    id: "2",
   name: "Lorem ipsum dolor sit amet consectetur. Accumsan massa mauris nunc lacus.",
    price: 360,
    image: "/images/products/pro2.png",
    href: "/",
  },
  {
    id: "3",
   name: "Lorem ipsum dolor sit amet consectetur. Accumsan massa mauris nunc lacus.",
    price: 360,
    originalPrice: 360,
    discount: 25,
    image: "/images/products/pro3.png",
    href: "/",
  },
  {
    id: "4",
  name: "Lorem ipsum dolor sit amet consectetur. Accumsan massa mauris nunc lacus.",
    price: 360,
    image: "/images/products/pro4.png",
    href: "/",
  },
  {
    id: "5",
  name: "Lorem ipsum dolor sit amet consectetur. Accumsan massa mauris nunc lacus.",
    price: 360,
    originalPrice: 45000,
    discount: 29,
    image: "/images/products/pro5.png",
    href: "/",
  },
  {
    id: "6",
   name: "Lorem ipsum dolor sit amet consectetur. Accumsan massa mauris nunc lacus.",
    price: 360,
    image: "/images/products/pro6.png",
    href: "/",
  },
  {
    id: "13",
   name: "Lorem ipsum dolor sit amet consectetur. Accumsan massa mauris nunc lacus.",
    price: 360,
    originalPrice: 360,
    discount: 25,
    image: "/images/products/pro3.png",
    href: "/",
  },
  {
    id: "14",
  name: "Lorem ipsum dolor sit amet consectetur. Accumsan massa mauris nunc lacus.",
    price: 360,
    image: "/images/products/pro4.png",
    href: "/",
  },
 
 

];

export function BestProducts() {
  const [displayCount, setDisplayCount] = useState(8);
  const [isLoading, setIsLoading] = useState(false);

  const handleLoadMore = () => {
    setIsLoading(true);
    // Simulate loading delay
    setTimeout(() => {
      setDisplayCount((prev) => Math.min(prev + 6, latestProducts.length));
      setIsLoading(false);
    }, 500);
  };

  const visibleProducts = latestProducts.slice(0, displayCount);
  const hasMore = displayCount < latestProducts.length;

  return (
    <section className="py-2 md:py-12 bg-white">
      <div className="container-custom">
        {/* Header */}
        <div className=" mb-10 flex  justify-between">
          <h2 className="text-2xl md:text-3xl  font-bold mb-3" style={{ color: '#112B40' }}>
           الأكثر طلبا
          </h2>
        <p className="text-[#FF7700]">
          عرض المزيد
        </p>
          
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center mb-10">
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

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF7700]"></div>
          </div>
        )}

        {/* View More Button */}
        {/* {hasMore && !isLoading && (
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

        {/* View All Link */}
        {/* {!hasMore && displayCount > 0 && (
          <div className="text-center">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 text-[#FF7700] hover:text-[#1a8fd0] font-semibold transition-colors duration-300"
            >
              عرض جميع المنتجات
              <ChevronLeft className="h-5 w-5" />
            </Link>
          </div>
        )} */}


      </div>
    </section>
  );
}