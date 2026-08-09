// src/components/products/ProductCard.tsx

"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingCart, Eye } from "lucide-react";
import { FaRegStar } from "react-icons/fa";
import { FaStar } from "react-icons/fa6";
import { useFavorites } from "@/hooks/useFavorites";
import { useCartContext } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCurrency } from "@/hooks/useCurrency"; // ✅ استيراد useCurrency

interface ColorOption {
  color: string;
  name: string;
}

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  image: string;
  hoverImage?: string;
  href: string;
  originalPrice?: number;
  discount?: number;
  colors?: ColorOption[];
  rating?: number;
  reviewsCount?: number;
  isBestSeller?: boolean;
  variantId?: number | null;
  hasVariants?: boolean;
  variants?: Array<{ id: number }>;
  quantity?: number | null;
  // ❌ إزالة currency من الـ Props
}

// دالة للحصول على الترجمات حسب اللغة
const getTranslations = (lang: string) => {
  if (lang === 'en') {
    return {
      loginRequired: "Please login first to add products to favorites",
      errorAdding: "Error adding to favorites",
      bestSeller: "Best Seller",
      addToCart: "Add to Cart",
      removeFromFavorites: "Remove from favorites",
      addToFavorites: "Add to favorites",
      addedToCart: "Product added to cart successfully",
      errorAddingToCart: "Error adding product to cart",
      reviews: "reviews",
      outOfStock: "Out of Stock",
      productUnavailable: "Product is not available",
    };
  }
  // Arabic (default)
  return {
    loginRequired: "يرجى تسجيل الدخول أولاً لإضافة المنتجات إلى المفضلة",
    errorAdding: "حدث خطأ أثناء إضافة المنتج إلى المفضلة",
    bestSeller: "الاكثر طلبا",
    addToCart: "إضافة إلى السلة",
    removeFromFavorites: "إزالة من المفضلة",
    addToFavorites: "إضافة إلى المفضلة",
    addedToCart: "تم إضافة المنتج إلى السلة",
    errorAddingToCart: "حدث خطأ أثناء إضافة المنتج إلى السلة",
    reviews: "تقييمات",
    outOfStock: "نفذ من المخزون",
    productUnavailable: "المنتج نفذ من المخزون",
  };
};

export function ProductCard({ 
  id, 
  name, 
  price, 
  image, 
  hoverImage,
  href,
  originalPrice,
  discount,
  colors = [],
  rating = 0,
  reviewsCount = 0,
  isBestSeller = false,
  variantId = null,
  hasVariants = false,
  variants = [],
  quantity,
}: ProductCardProps) {
  const { language } = useLanguage();
  const { currency, isLoading: currencyLoading } = useCurrency();
  const t = getTranslations(language);
  
  const [isHovered, setIsHovered] = useState(false);
  const [currentImage, setCurrentImage] = useState(image);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isLocalMutating, setIsLocalMutating] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  
  const { isFavorite, toggleFavorite, isLoading } = useFavorites();
  const { addItem, isLoading: cartLoading } = useCartContext();
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  
  const isProductFavorite = isFavorite(id);
  const [localFavorite, setLocalFavorite] = useState(isProductFavorite);
  
  // التحقق من التوفر - الكمية null أو undefined أو 0 أو أقل
  const isOutOfStock = quantity === null || quantity === undefined || quantity <= 0;

  // دالة لتوليد نجوم التقييم
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<FaStar key={i} className="text-[#FA8232] w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<FaStar key={i} className="text-[#FA8232] w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" />);
      } else {
        stars.push(<FaRegStar key={i} className="text-[#77878F] w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" />);
      }
    }
    return stars;
  };

  useEffect(() => {
    setLocalFavorite(isProductFavorite);
  }, [isProductFavorite]);

  const handleFavoriteClick = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      toast.error(t.loginRequired, {
        duration: 3000,
        position: "top-center",
        icon: "❤️",
      });
      
      const currentUrl = window.location.href;
      router.push(`/auth/login?redirectTo=${encodeURIComponent(currentUrl)}`);
      return;
    }
    
    if (isLocalMutating || isLoading) return;
    
    setIsLocalMutating(true);
    const previousState = localFavorite;
    setLocalFavorite(!previousState);
    
    const success = await toggleFavorite(id, previousState);
    
    if (!success) {
      setLocalFavorite(previousState);
      toast.error(t.errorAdding, {
        duration: 3000,
        position: "top-center",
      });
    }
    
    setIsLocalMutating(false);
  }, [id, localFavorite, isLocalMutating, isLoading, toggleFavorite, isAuthenticated, router, t]);

  const handleAddToCart = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // ✅ التحقق من الكمية قبل الإضافة
    if (isOutOfStock) {
      toast.error(t.productUnavailable, {
        duration: 3000,
        position: "top-center",
      });
      return;
    }
    
    if (isAddingToCart || cartLoading) return;
    
    const productId = parseInt(id);
    const quantityToAdd = 1; // يمكن تعديلها حسب الحاجة
    
    if (hasVariants && variants.length > 0) {
      const firstVariantId = variants[0].id;
      
      setIsAddingToCart(true);
      try {
        await addItem(productId, quantityToAdd, firstVariantId);
        // toast.success(t.addedToCart, {
        //   duration: 3000,
        //   position: "top-center",
        // });
      } catch (error) {
        console.error("❌ Error adding to cart:", error);
        toast.error(t.errorAddingToCart, {
          duration: 3000,
          position: "top-center",
        });
      } finally {
        setIsAddingToCart(false);
      }
      return;
    }
    
    setIsAddingToCart(true);
    try {
      const finalVariantId = variantId || null;
      await addItem(productId, quantityToAdd, finalVariantId);
      // toast.success(t.addedToCart, {
      //   duration: 3000,
      //   position: "top-center",
      // });
    } catch (error) {
      console.error("❌ Error adding to cart:", error);
      toast.error(t.errorAddingToCart, {
        duration: 3000,
        position: "top-center",
      });
    } finally {
      setIsAddingToCart(false);
    }
  }, [id, variantId, hasVariants, variants, isAddingToCart, cartLoading, addItem, isOutOfStock, t]);

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (hoverImage) {
      setCurrentImage(hoverImage);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setCurrentImage(image);
  };

  return (
    <div
      role="article"
      aria-labelledby={`product-name-${id}`}
      className="group w-full max-w-[340px] sm:max-w-[350px] md:max-w-[308px] lg:max-w-[308px] mx-auto h-auto relative bg-white transition-all duration-500 ease-out hover:shadow-2xl"
      style={{
        borderRadius: '6px',
        border: '1px solid #E4E7E9',
        padding: '0 0px 16px 0',
        overflow: 'hidden',
        transform: isHovered ? 'translateY(-12px)' : 'translateY(0px)',
        transition: 'transform 0.4s cubic-bezier(0.2, 0.9, 0.4, 1.1), box-shadow 0.4s ease',
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Link href={href} className="block h-full" aria-label={`عرض تفاصيل ${name}`}>
        {/* Image Container */}
        <div 
          className="relative mx-auto transition-all duration-500 w-full"
          style={{
            borderRadius: '5px',
          }}
        >
          {/* Heart Icon - Top Left Corner */}
          <button
            onClick={handleFavoriteClick}
            disabled={isLocalMutating || isLoading}
            className="absolute top-1 left-2 z-10 rounded-full p-1.5 bg-white shadow hover:bg-red-50 transition-all duration-200 hover:scale-110"
            style={{ color: localFavorite ? '#ef4444' : '#112B40' }}
            aria-label={localFavorite ? t.removeFromFavorites : t.addToFavorites}
            aria-pressed={localFavorite}
          >
            {isLocalMutating ? (
              <div className="w-4 h-4 border-2 border-[#FF7700] border-t-transparent rounded-full animate-spin" />
            ) : (
              <Heart className="h-4 w-4 sm:h-5 sm:w-5 " fill={localFavorite ? '#ef4444' : 'none'} />
            )}
          </button>
          
          {/* Best Seller Badge */}
          {isBestSeller && (
            <div className="absolute top-2 right-2 z-10">
              <p className="text-[9px] sm:text-xs font-bold text-white bg-[#FF7700] px-1.5 py-0.5 sm:px-2 sm:py-1 rounded">
                {t.bestSeller}
              </p>
            </div>
          )}

          {/* Discount Badge */}
          {discount && discount > 0 && (
            <div className="absolute top-10 right-2 z-10">
              <p className="text-[9px] sm:text-xs font-bold text-white bg-red-500 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded">
                {discount}% OFF
              </p>
            </div>
          )}

          {/* Image with scale effect on hover */}
          <div className="overflow-hidden rounded-t-lg">
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-t-lg">
                <div className="w-8 h-8 border-4 border-[#FF7700] border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            <Image
              src={currentImage}
              alt={name}
              width={340}
              height={340}
              className="object-cover w-full h-auto aspect-square transition-transform duration-500 ease-out group-hover:scale-105"
              style={{
                transform: isHovered ? 'scale(1.05)' : 'scale(1)',
              }}
              onLoad={() => setImageLoaded(true)}
            />
          </div>
        </div>

        {/* Product Info with slide up effect */}
        <div 
          className="px-2 sm:px-3 flex flex-col gap-1 sm:gap-2 mt-2 transition-all duration-500 ease-out"
          style={{
            transform: isHovered ? 'translateY(-4px)' : 'translateY(0px)',
          }}
        >
          {/* Rating Section */}
          <div className="flex gap-1 items-center mb-1 flex-wrap">
            <p className="text-[#77878F] text-[10px] sm:text-xs md:text-sm">({reviewsCount || 0})</p>
            <div className="flex gap-0.5">
              {renderStars(rating)}
            </div>
          </div>
          
          {/* Product Name */}
          <h3 
            id={`product-name-${id}`}
            className="text-[11px] sm:text-[13px] md:text-[14px] font-medium line-clamp-2 lg:line-clamp-1 mb-1" 
            style={{ color: '#112B40' }}
          >
            {name}
          </h3>

          {/* Price - ✅ استخدام العملة من الـ Hook */}
          <div className="flex items-center gap-2 mb-2">
            {originalPrice && originalPrice > price ? (
              <>
                <span className="text-sm sm:text-base md:text-[17px] font-semibold" style={{ color: '#FF7700' }}>
                  {price.toLocaleString()}{' '}
                  <span className="text-[10px] sm:text-xs md:text-[12px] font-semibold">
                    {currencyLoading ? '...' : currency || 'EGP'}
                  </span>
                </span>
                <span className="text-[10px] sm:text-xs md:text-[12px] text-gray-400 line-through">
                  {originalPrice.toLocaleString()}
                </span>
              </>
            ) : (
              <span className="text-sm sm:text-base md:text-[17px] font-semibold" style={{ color: '#FF7700' }}>
                {price.toLocaleString()}{' '}
                <span className="text-[10px] sm:text-xs md:text-[12px] font-semibold">
                  {currencyLoading ? '...' : currency || 'EGP'}
                </span>
              </span>
            )}
          </div>
          
          {/* Add to cart button */}
          {/* <div
            style={{
              opacity: isHovered ? 1 : 0.9,
              transition: 'opacity 0.3s ease 0.1s',
            }}
          >
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock || isAddingToCart || cartLoading}
              className={`w-full text-[11px] sm:text-[14px] md:text-[16px] font-semibold rounded-[24px] transition-all duration-300 text-white py-1.5 sm:py-2 md:py-2.5 px-4 border-2 flex items-center justify-center gap-2 hover:scale-[1.02] h-auto ${
                isOutOfStock 
                  ? 'bg-gray-400 border-gray-400 cursor-not-allowed' 
                  : 'bg-[#FF7700] hover:bg-[#8C6D8A] border-[#FF7700] hover:border-[#8C6D8A]'
              }`}
            >
              {isAddingToCart || cartLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <ShoppingCart className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5" />
                  <span>{isOutOfStock ? t.outOfStock : t.addToCart}</span>
                </>
              )}
            </button>
          </div> */}
        </div>
      </Link>
    </div>
  );
}