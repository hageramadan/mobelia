"use client";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";

const categories = [
  { id: 1, name: "إلكترونيات", image: "/cat-electronics.jpg", slug: "electronics" },
  { id: 2, name: "ملابس", image: "/cat-fashion.jpg", slug: "fashion" },
  { id: 3, name: "أجهزة منزلية", image: "/cat-home.jpg", slug: "home" },
  { id: 4, name: "مستحضرات تجميل", image: "/cat-beauty.jpg", slug: "beauty" },
];

export function CategoriesSection() {
  return (
    <section className="py-16 container mx-auto px-4">
      <h2 className="text-3xl font-bold text-center mb-12">الفئات</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {categories.map((category) => (
          <Link href={`/`} key={category.id}>
            <Card className="group cursor-pointer overflow-hidden transition-transform hover:scale-105">
              <div className="relative h-48">
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  className="object-cover transition group-hover:scale-110"
                />
              </div>
              <CardContent className="p-4 text-center">
                <h3 className="font-semibold text-lg">{category.name}</h3>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}