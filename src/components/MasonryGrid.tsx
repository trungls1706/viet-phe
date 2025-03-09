'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { CoffeeImage } from '@/data/pexelsImages';

interface MasonryGridProps {
  images: CoffeeImage[];
  columns?: number;
}

export default function MasonryGrid({ images, columns = 3 }: MasonryGridProps) {
  const router = useRouter();

  // Create array of column arrays
  const columnArray = Array.from({ length: columns }, (_, i) => i);
  const columnImages = columnArray.map((col) =>
    images.filter((_, index) => index % columns === col)
  );

  console.log('columnImages', columnImages);  

  return (
    <div className="flex gap-4">
      {columnImages.map((column, columnIndex) => (
        <div key={columnIndex} className="flex-1 space-y-4">
          {column.map((image) => (
            <div
              key={image.id}
              className="relative cursor-pointer group"
              onClick={() => router.push(`/photos/${image.id}`)}
            >
              <div className="relative rounded-lg overflow-hidden">
                <Image
                  src={image.url}
                  alt={image.title}
                  width={image.width}
                  height={image.height}
                  className="w-full h-auto object-cover group-hover:scale-110 transition duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform">
                  <h3 className="text-lg font-semibold line-clamp-1">{image.title}</h3>
                </div>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
