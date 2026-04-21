"use client";

import Image from "next/image";

export function Hero() {
  return (
    <section className="relative w-full h-[668px] py-[20px] md:py-[46px] md:h-[400px] lg:h-[660px] overflow-hidden">
      <div className="container-custom h-full mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row h-full gap-4 md:gap-6">
          
          {/* Right Side - Large Image */}
          <div className="w-full md:w-1/2 h-full relative overflow-hidden group">
            <Image
              src="/images/hero/hero1.png"
              alt="Main image"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover transition-all duration-700 ease-out group-hover:scale-110 group-hover:-translate-y-2"
              quality={90}
              priority
            />
          </div>
          
          {/* Left Side - Two Stacked Images */}
          <div className="w-full md:w-1/2 h-full flex flex-col gap-4 md:gap-6">
            
            {/* Top Image */}
            <div className="relative flex-1 overflow-hidden group">
              <Image
                src="/images/hero/hero2.png"
                alt="Image top"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover transition-all duration-700 ease-out group-hover:scale-110 group-hover:-translate-y-2"
                quality={85}
              />
            </div>
            
            {/* Bottom Section - Two Images Side by Side */}
            <div className="flex-1 flex gap-4 md:gap-6">
              
              {/* Bottom Left Image */}
              <div className="relative w-1/2 overflow-hidden group">
                <Image
                  src="/images/hero/hero3.png"
                  alt="Image bottom left"
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover transition-all duration-700 ease-out group-hover:scale-110 group-hover:-translate-y-2"
                  quality={85}
                />
              </div>
              
              {/* Bottom Right Image */}
              <div className="relative w-1/2 overflow-hidden group">
                <Image
                  src="/images/hero/hero4.png"
                  alt="Image bottom right"
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover transition-all duration-700 ease-out group-hover:scale-110 group-hover:-translate-y-2"
                  quality={85}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}