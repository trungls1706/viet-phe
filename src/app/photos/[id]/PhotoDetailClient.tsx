'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import MasonryGrid from '@/components/MasonryGrid';
import { CoffeeImage } from '@/data/pexelsImages';
import type { CoffeeShop } from '@/lib/supabase/types';

interface PhotoDetailClientProps {
  image: CoffeeImage;
  coffeeShop: CoffeeShop;
  prevImage: CoffeeImage | null;
  nextImage: CoffeeImage | null;
  relatedImages: CoffeeImage[];
}

export default function PhotoDetailClient({
  image,
  coffeeShop,
  prevImage,
  nextImage,
  relatedImages,
}: PhotoDetailClientProps) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Close Button */}
      <button
        onClick={() => router.push('/')}
        className="fixed top-6 left-6 z-50 text-white hover:text-gray-200 p-4 rounded-full bg-black hover:bg-gray-800 transition-all duration-300 shadow-lg hover:shadow-2xl border border-white/30 hover:border-white/60 backdrop-blur-sm group cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/50"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-8 w-8 transform group-hover:scale-110 transition-transform"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Left Navigation */}
        {prevImage && (
          <button
            className="fixed left-6 top-1/2 -translate-y-1/2 text-white hover:text-gray-200 z-40 bg-black hover:bg-gray-800 p-6 rounded-full transition-all duration-300 shadow-lg hover:shadow-2xl border border-white/30 hover:border-white/60 backdrop-blur-sm group cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/50"
            onClick={() => router.push(`/photos/${prevImage.id}`)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10 transform group-hover:scale-110 transition-transform"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            <span className="sr-only">Previous image</span>
          </button>
        )}

        {/* Content Container */}
        <div className="container mx-auto my-8 px-4">
          <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="h-16 border-b flex items-center px-4 justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-gray-200"></div>
                  <div>
                    <h3 className="text-gray-900 font-medium">Coffee Lover</h3>
                    <p className="text-gray-500 text-sm">Follow</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button className="text-gray-700 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-md transition">
                  Share
                </button>
                <button className="text-gray-700 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-md transition flex items-center gap-2">
                  <span>Like</span>
                  <span className="text-sm">{coffeeShop.rating}</span>
                </button>
                <a
                  href={coffeeShop.fb_url || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white bg-[#05A081] hover:bg-[#05A081]/90 px-4 py-2 rounded-md transition"
                >
                  Visit Facebook
                </a>
              </div>
            </div>

            {/* Content */}
            <div className="p-8 flex flex-col lg:flex-row gap-8">
              {/* Left Zone - Image */}
              <div className="lg:w-2/3">
                <div className="relative rounded-lg overflow-hidden bg-gray-100">
                  <Image
                    src={image.url}
                    alt={image.title}
                    width={image.width}
                    height={image.height}
                    className="w-full h-auto object-cover"
                    priority
                  />
                </div>
              </div>

              {/* Right Zone - Details */}
              <div className="lg:w-1/3 space-y-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">{coffeeShop.name}</h1>
                  <p className="text-gray-600">A cozy coffee shop in the heart of the city</p>
                </div>

                {/* Location Info */}
                <div className="border-t pt-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Location</h2>
                  <div className="flex items-start gap-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-gray-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <div>
                      <h3 className="font-medium text-gray-900">{coffeeShop.name}</h3>
                      <p className="text-gray-600">{coffeeShop.address}</p>
                      <p className="text-gray-600">
                        Coordinates: {coffeeShop.coordinates.latitude}, {coffeeShop.coordinates.longitude}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Review */}
                <div className="border-t pt-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Review</h2>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex text-yellow-400">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg
                            key={star}
                            xmlns="http://www.w3.org/2000/svg"
                            className={`h-5 w-5 ${star <= coffeeShop.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <span className="text-gray-600">{coffeeShop.rating}.0</span>
                    </div>
                    <div
                      className="text-gray-700 prose"
                      dangerouslySetInnerHTML={{ __html: coffeeShop.description }}
                    />
                  </div>
                </div>

                {/* Social Media */}
                <div className="border-t pt-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Social Media</h2>
                  <div className="space-y-3">
                    {coffeeShop.fb_url && (
                      <a
                        href={coffeeShop.fb_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
                      >
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                        </svg>
                        Facebook
                      </a>
                    )}
                    {coffeeShop.instagram_url && (
                      <a
                        href={coffeeShop.instagram_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-pink-600 hover:text-pink-800"
                      >
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z" />
                        </svg>
                        Instagram
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer - Related Media */}
            {relatedImages.length > 0 && (
              <div className="border-t bg-gray-50 p-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  More from {coffeeShop.name}
                </h2>
                <MasonryGrid images={relatedImages} columns={3} />
              </div>
            )}
          </div>
        </div>

        {/* Right Navigation */}
        {nextImage && (
          <button
            className="fixed right-6 top-1/2 -translate-y-1/2 text-white hover:text-gray-200 z-40 bg-black hover:bg-gray-800 p-6 rounded-full transition-all duration-300 shadow-lg hover:shadow-2xl border border-white/30 hover:border-white/60 backdrop-blur-sm group cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/50"
            onClick={() => router.push(`/photos/${nextImage.id}`)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10 transform group-hover:scale-110 transition-transform"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M9 5l7 7-7 7"
              />
            </svg>
            <span className="sr-only">Next image</span>
          </button>
        )}
      </div>
    </div>
  );
}
