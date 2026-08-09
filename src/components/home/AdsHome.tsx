// components/AdsHome.tsx

'use client'
import React, { useState, useEffect } from 'react'
import { Button } from '../ui/button'
import Link from 'next/link'
import { FaArrowRight } from 'react-icons/fa'
import Image from 'next/image'
import { MdOutlineTimer } from 'react-icons/md'
import { getAds, getFullImageUrl } from '@/services/api'
import { useLanguage } from '@/contexts/LanguageContext'

export interface AdPopup {
  id: number;
  sub_title: string;
  name: string;
  description: string;
  link: string | null;
  image: string;
  is_active: number;
  created_at: string;
  updated_at: string;
  start_date?: string;
  end_date?: string;
  type?: string;
  type_label?: string;
}

interface AdsHomeProps {
  onLoad?: () => void;
}

// دالة للحصول على الترجمات حسب اللغة
const getTranslations = (lang: string) => {
  if (lang === 'en') {
    return {
      loading: "Loading...",
      shopNow: "Shop Now",
      expiresIn: "Expires in",
      days: "Days",
      hours: "Hours",
      minutes: "Minutes",
      seconds: "Seconds",
      offerExpired: "Offer expired",
      limitedOffer: "Limited Offer",
      dontMiss: "Don't miss the opportunity",
    };
  }
  // Arabic (default)
  return {
    loading: "جاري التحميل...",
    shopNow: "شراء الآن",
    expiresIn: "سينتهي الخصم خلال",
    days: "أيام",
    hours: "ساعات",
    minutes: "دقائق",
    seconds: "ثواني",
    offerExpired: "انتهى العرض",
    limitedOffer: "لفترة محدودة",
    dontMiss: "لا تفوت الفرصة",
  };
};

export function AdsHome({ onLoad }: AdsHomeProps) {
  const { language } = useLanguage();
  const t = getTranslations(language);
  
  const [isClient, setIsClient] = useState(false);
  const [ads, setAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  // ✅ استدعاء onLoad بعد تحميل البيانات
  useEffect(() => {
    if (!loading && !isDataLoaded && onLoad) {
      setIsDataLoaded(true);
      onLoad();
    }
  }, [loading, isDataLoaded, onLoad]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // جلب الإعلانات من API
  useEffect(() => {
    const loadAds = async () => {
      setLoading(true);
      const data = await getAds();
      setAds(data);
      setLoading(false);
    };

    loadAds();
  }, []);

  // استخدام أول إعلان نشط
  const activeAd = ads.find(ad => ad.is_active === 1) || ads[0];

  // حساب الوقت المتبقي من end_date من الـ API
  useEffect(() => {
    if (!activeAd) return;

    const endDateStr = activeAd.end_date;
    const calculateTimeLeft = (end: Date) => {
      const now = new Date();
      const difference = end.getTime() - now.getTime();
      
      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        
        setTimeLeft({ days, hours, minutes, seconds });
        setIsExpired(false);
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        setIsExpired(true);
      }
    };    

    // ✅ استخدام end_date من الـ API مباشرة
    if (endDateStr) {
      const endDate = new Date(endDateStr);
      
      if (isNaN(endDate.getTime())) {
        console.error('Invalid end_date:', endDateStr);
        // ✅ استخدام تاريخ احتياطي إذا كان التاريخ غير صحيح
        const fallbackDate = new Date();
        fallbackDate.setDate(fallbackDate.getDate() + 7); // 7 أيام افتراضية
        calculateTimeLeft(fallbackDate);
        
        const timer = setInterval(() => {
          calculateTimeLeft(fallbackDate);
        }, 1000);
        
        return () => clearInterval(timer);
      }

      calculateTimeLeft(endDate);
      
      const timer = setInterval(() => {
        calculateTimeLeft(endDate);
      }, 1000);

      return () => clearInterval(timer);
    } else {
      // ✅ إذا لم يوجد end_date، استخدم تاريخ افتراضي (7 أيام من الآن)
      const fallbackDate = new Date();
      fallbackDate.setDate(fallbackDate.getDate() + 7);
      calculateTimeLeft(fallbackDate);
      
      const timer = setInterval(() => {
        calculateTimeLeft(fallbackDate);
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [activeAd]);

  // دالة لتنسيق الوصف (إزالة الأسطر الفارغة)
  const formatDescription = (description: string) => {
    return description.replace(/\n/g, ' ').trim();
  };

  // تنسيق الأرقام لعرضها برقمين (00)
  const formatNumber = (num: number) => String(num).padStart(2, '0');

  // عرض شاشة تحميل بنفس تصميم الكود الأول
  if (loading) {
    return (
      <div className="ms-4 sm:mx-0 pt-6 px-2 w-full md:col-span-1 bg-[#FBEDDE] flex flex-col items-center justify-center gap-4 min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF7700]"></div>
      </div>
    );
  }

  // عرض نسخة ثابتة أثناء Hydration
  if (!isClient) {
    return (
      <div className="ms-4 sm:mx-0 pt-6 px-2 w-full md:col-span-1 bg-[#FBEDDE] flex flex-col items-center justify-center gap-4 min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF7700]"></div>
      </div>
    );
  }

  // إذا لم يوجد إعلانات أو انتهى العرض
  if (!activeAd || isExpired) {
    if (!isDataLoaded && onLoad) {
      setIsDataLoaded(true);
      onLoad();
    }
    return null;
  }

  const adImageUrl = getFullImageUrl(activeAd.image);
  const hasTimer = timeLeft.days > 0 || timeLeft.hours > 0 || timeLeft.minutes > 0 || timeLeft.seconds > 0;

  return (
    <div className="ms-4 sm:mx-0 pt-6  w-full md:col-span-1 bg-[#FBEDDE] flex flex-col items-center justify-center gap-4">
      <div className="text-center gap-4 flex flex-col items-center justify-center w-full">
        {/* الاسم (مثل: لفتره محدودة) */}
        {activeAd.name && (
          <p className="text-[#BE4646] text-[14px] font-bold">
            {activeAd.name}
          </p>
        )}
        
        {/* العنوان الفرعي (مثل: خصم 32%) */}
        {activeAd.sub_title && (
          <p className="text-[#191C1F] text-[24px] md:text-[32px] font-bold">
            {activeAd.sub_title}
          </p>
        )}
        
        {/* الوصف */}
        {activeAd.description && (
          <p className="text-[#475156] text-[1rem]">
            {formatDescription(activeAd.description)}
          </p>
        )}
        
        {/* ✅ مؤقت العد التنازلي - كونت داون كامل (أيام، ساعات، دقائق، ثواني) */}
        {hasTimer && (
          <div className="flex flex-col items-center gap-2 w-full">
            <p className="text-[#191C1F] text-[14px] font-medium">{t.expiresIn}</p>
            <div className="flex gap-1 items-center justify-center mx-2">
              {/* ✅ عرض الأيام */}
              <div className="flex flex-col items-center">
                <div className="bg-[#FF7700] text-white rounded-lg px-3 py-2 md:px-4 md:py-3 min-w-[10px] md:min-w-[40px] shadow-lg">
                  <span className="text-xl  font-bold">{formatNumber(timeLeft.days)}</span>
                </div>
                <p className="text-[10px] md:text-xs text-gray-600 mt-1">{t.days}</p>
              </div>
              
              <span className="text-[#FF7700] text-xl lg:text-2xl  font-bold">:</span>
              
              {/* ✅ عرض الساعات */}
              <div className="flex flex-col items-center">
                <div className="bg-[#FF7700] text-white rounded-lg px-3 py-2 md:px-4 md:py-3 min-w-[10px] md:min-w-[40px] shadow-lg">
                  <span className="text-xl  font-bold">{formatNumber(timeLeft.hours)}</span>
                </div>
                <p className="text-[10px] md:text-xs text-gray-600 mt-1">{t.hours}</p>
              </div>
              
              <span className="text-[#FF7700] hidden md:flex text-xl lg:text-2xl  font-bold">:</span>
              
              {/* ✅ عرض الدقائق */}
              <div className="hidden md:flex flex-col items-center">
                <div className="bg-[#FF7700] text-white rounded-lg px-3 py-2 md:px-4 md:py-3 min-w-[10px] md:min-w-[40px] shadow-lg">
                  <span className="text-xl  font-bold">{formatNumber(timeLeft.minutes)}</span>
                </div>
                <p className="text-[10px] md:text-xs text-gray-600 mt-1">{t.minutes}</p>
              </div>
              
              <span className="text-[#FF7700] hidden md:flex text-2xl  font-bold">:</span>
              
              {/* ✅ عرض الثواني */}
              <div className="hidden md:flex flex-col items-center">
                <div className="bg-[#FF7700] text-white rounded-lg px-3 py-2 md:px-4 md:py-3 min-w-[10px] md:min-w-[40px] shadow-lg animate-pulse">
                  <span className="text-xl  font-bold">{formatNumber(timeLeft.seconds)}</span>
                </div>
                <p className="text-[10px] md:text-xs text-gray-600 mt-1">{t.seconds}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* زر الشراء بنفس تصميم الكود الأول */}
        <Button
          asChild
          aria-label='buy now'
          className="hidden md:flex w-fit md:w-[180px] md:h-[60px] rounded animate-in text-[12px] md:text-[16px] font-bold fade-in slide-in-from-bottom-5 duration-700 delay-200"
          style={{ backgroundColor: '#FF7700' }}
        >
          <Link 
            href={activeAd.link || "/products"} 
            className="flex uppercase items-center justify-center gap-2 text-white"
          >
            {/* <FaArrowRight className="h-4 w-4" /> */}
            {t.shopNow}
          </Link>
        </Button>
      </div>
      
      {/* صورة الإعلان بنفس تصميم الكود الأول */}
      <div className="text-end mt-8">
        <Image 
          src={adImageUrl} 
          alt={activeAd.name || "ads Product"} 
          width={308} 
          height={442}
          style={{ width: 'auto', height: 'auto' }}
          className="max-w-full h-auto" 
          priority
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "/images/advs.png";
          }}
        />
      </div>
    </div>
  )
}