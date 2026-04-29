import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MapPin, SlidersHorizontal, Star, Users, ChevronRight, Sparkles, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MarketplaceBottomNav from '../components/MarketplaceBottomNav';
import { productAPI } from '../services/api';
import { getVenueImage, getVenueLocationLabel, normalizeVenueResults } from '../utils/venues';

const CATEGORIES = [
  'All',
  'Wedding Hall',
  'Luxury Ballroom',
  'Banquet Hall',
  'Rooftop Venue',
  'Resort',
  'Garden Venue',
  'Corporate Event Space'
];

const INITIAL_VISIBLE = 8;
const LOAD_MORE_COUNT = 4;

const toCurrency = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`;

// Lazy Image Component
const LazyImage = ({ src, alt, className }) => {
  const imgRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      { rootMargin: '200px' }
    );

    if (imgRef.current) observer.observe(imgRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={imgRef} className={`relative overflow-hidden bg-gradient-to-r from-gray-100 to-gray-200 ${className}`}>
      {isInView && (
        <img
          src={src}
          alt={alt}
          className={`h-full w-full object-cover transition-all duration-500 ${isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
            }`}
          onLoad={() => setIsLoaded(true)}
          loading="lazy"
        />
      )}
      {!isLoaded && isInView && (
        <div className="absolute inset-0 animate-pulse">
          <div className="h-full w-full bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200" />
        </div>
      )}
    </div>
  );
};

// Listing Card Component
const ListingCard = ({ listing, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onClick={() => onClick(listing)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group cursor-pointer overflow-hidden rounded-2xl bg-[#FBFAFF] shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border border-[#7C3AED]/10"
    >
      <div className="relative h-48 sm:h-52 overflow-hidden">
        <LazyImage src={getVenueImage(listing)} alt={listing.title} className="h-full w-full" />
        <div className="absolute top-3 right-3 rounded-full bg-[#FBFAFF]/90 p-1.5 backdrop-blur-sm transition hover:bg-[#FBFAFF] border border-[#7C3AED]/20">
          <Heart className={`h-4 w-4 transition ${isHovered ? 'text-red-500 fill-red-500' : 'text-[#8A7AAE]'}`} />
        </div>
        <div className="absolute bottom-3 left-3 rounded-full bg-black/60 backdrop-blur-sm px-2 py-1">
          <div className="flex items-center gap-1 text-xs font-bold text-white">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            {Number(listing.rating || 0).toFixed(1)}
          </div>
        </div>
        {listing.pure_veg && (
          <div className="absolute top-3 left-3 rounded-full bg-green-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
            Pure Veg
          </div>
        )}
      </div>

      <div className="p-4 space-y-2">
        <div className="flex justify-between items-start gap-2">
          <div className="flex-1">
            <h3 className="text-base font-bold text-[#23113F] line-clamp-1 group-hover:text-[#7C3AED] transition">
              {listing.title}
            </h3>
            <p className="text-xs text-[#23113F]/70 mt-0.5">{listing.category}</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-extrabold text-[#7C3AED]">{toCurrency(listing.price)}</p>
            <p className="text-[10px] text-[#23113F]/60">{listing.price_unit || 'Starting Price'}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-[#23113F]/70">
          <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
          <span className="line-clamp-1">{getVenueLocationLabel(listing) || 'Bhopal'}</span>
        </div>

        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1 text-[#23113F]/70">
            <Users className="h-3.5 w-3.5" />
            <span>Up to {listing.capacity || 100} guests</span>
          </div>
          <div className="flex items-center gap-1 text-[#23113F]/60">
            <Star className="h-3 w-3 fill-current" />
            <span>{listing.review_count || 0}+ reviews</span>
          </div>
        </div>

        {listing.tag_label && (
          <div className="pt-1">
            <span className="inline-block rounded-full bg-[#F3E8FF] px-2 py-0.5 text-[10px] font-semibold text-[#7C3AED]">
              {listing.tag_label}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

// Loading Skeleton
const LoadingSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
    {[...Array(8)].map((_, i) => (
      <div key={i} className="rounded-2xl bg-white overflow-hidden shadow-sm">
        <div className="h-48 sm:h-52 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse" />
        <div className="p-4 space-y-3">
          <div className="h-5 bg-gray-200 rounded-lg animate-pulse w-3/4" />
          <div className="h-4 bg-gray-200 rounded-lg animate-pulse w-1/2" />
          <div className="h-4 bg-gray-200 rounded-lg animate-pulse w-full" />
          <div className="h-4 bg-gray-200 rounded-lg animate-pulse w-2/3" />
        </div>
      </div>
    ))}
  </div>
);

const Services = () => {
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoading(true);
        const response = await productAPI.getAll({
          status: 'approved',
          city: 'Bhopal',
          limit: 100
        });
        setListings(normalizeVenueResults(response));
      } catch (error) {
        console.error('Failed to fetch listings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  // Reset visible count when category changes
  useEffect(() => {
    setVisibleCount(INITIAL_VISIBLE);
    // Scroll to top when category changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [selectedCategory]);

  const filteredListings = useMemo(() => {
    return listings.filter((listing) => {
      if (selectedCategory !== 'All' && listing.category !== selectedCategory) return false;
      return true;
    });
  }, [listings, selectedCategory]);

  const visibleListings = useMemo(() => {
    return filteredListings.slice(0, visibleCount);
  }, [filteredListings, visibleCount]);

  const hasMore = visibleCount < filteredListings.length;

  const handleLoadMore = useCallback(() => {
    setVisibleCount(prev => Math.min(prev + LOAD_MORE_COUNT, filteredListings.length));
  }, [filteredListings.length]);

  const handleListingClick = useCallback((listing) => {
    navigate(`/venues/${listing.id}`);
  }, [navigate]);

  const handleCategoryChange = useCallback((category) => {
    setSelectedCategory(category);
  }, []);

  const handleReset = useCallback(() => {
    setSelectedCategory('All');
  }, []);

  return (
    <div className="min-h-screen bg-[#F8F5FF]">
      {/* Hero Section */}
      {/* <div className="relative bg-gradient-to-r from-[#7C3AED] to-[#6D28D9] overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-72 h-72 bg-white rounded-full filter blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-300 rounded-full filter blur-3xl" />
        </div>
        <div className="relative px-4 py-8 sm:px-6 sm:py-10 md:py-12">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-3">
              Find Your Perfect
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#F8F5FF] to-white">
                Event Space
              </span>
            </h1>
            <p className="text-white/90 text-sm sm:text-base max-w-2xl">
              Discover handpicked venues, compare prices, and book the perfect location for your special occasion in Bhopal.
            </p>
            <div className="flex flex-wrap gap-2 mt-4">
              <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1.5">
                <Sparkles className="h-4 w-4 text-white" />
                <span className="text-xs text-white">{filteredListings.length}+ Venues</span>
              </div>
              <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1.5">
                <Star className="h-4 w-4 text-white" />
                <span className="text-xs text-white">Top Rated Services</span>
              </div>
            </div>
          </div>
        </div>
      </div> */}

      <div className="px-3 sm:px-4 py-6 pb-24">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Category Filter */}
          <div className="rounded-2xl bg-[#FBFAFF]/80 backdrop-blur-sm p-4 shadow-lg border border-[#7C3AED]/10">
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#C4B5FD]">
                  <SlidersHorizontal className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm font-bold text-[#23113F]">Filter by Category</span>
              </div>
              {selectedCategory !== 'All' && (
                <button
                  onClick={handleReset}
                  className="text-xs font-semibold text-[#7C3AED] hover:underline"
                >
                  Clear filter
                </button>
              )}
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-[#C4B5FD] scrollbar-track-transparent">
              {CATEGORIES.map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategoryChange(category)}
                  className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 border ${selectedCategory === category
                      ? 'bg-gradient-to-r from-[#7C3AED] to-[#9333EA] text-white shadow-md border-[#7C3AED]'
                    : 'bg-[#FBFAFF] text-[#7C3AED] border border-[#7C3AED]/20 hover:bg-[#F3E8FF]'
                    }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Results Info */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <div className="h-8 w-1 bg-gradient-to-b from-[#7C3AED] to-[#C4B5FD] rounded-full" />
              <p className="text-sm font-semibold text-[#23113F]">
                Showing <span className="text-[#7C3AED] text-lg font-bold">{visibleListings.length}</span> of {filteredListings.length} listings
              </p>
            </div>
            {visibleListings.length > 0 && (
              <p className="text-xs text-[#23113F]/60">
                Scroll to load more
              </p>
            )}
          </div>

          {/* Listings Grid */}
          {loading ? (
            <LoadingSkeleton />
          ) : visibleListings.length === 0 ? (
            <div className="rounded-2xl bg-[#FBFAFF] p-12 text-center shadow-md border border-[#7C3AED]/10">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#F3E8FF] mb-4">
                <Sparkles className="h-8 w-8 text-[#7C3AED]" />
              </div>
              <p className="text-base font-semibold text-[#23113F] mb-2">
                No listings found
              </p>
              <p className="text-sm text-[#23113F]/70 mb-4">
                Try adjusting your category filter to see more options.
              </p>
              <button
                onClick={handleReset}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#7C3AED] to-[#6D28D9] px-6 py-2.5 text-sm font-semibold text-white transition hover:shadow-lg"
              >
                View All Listings
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {visibleListings.map((listing) => (
                  <ListingCard
                    key={listing.id}
                    listing={listing}
                    onClick={handleListingClick}
                  />
                ))}
              </div>

              {/* Load More Button */}
              {hasMore && (
                <div className="flex justify-center pt-4 pb-8">
                  <button
                    onClick={handleLoadMore}
                    className="group inline-flex items-center gap-2 rounded-full bg-[#FBFAFF] px-6 py-3 text-sm font-semibold text-[#7C3AED] shadow-md transition-all hover:shadow-lg hover:bg-[#F3E8FF] active:scale-95 border border-[#7C3AED]/20"
                  >
                    Load More ({Math.min(LOAD_MORE_COUNT, filteredListings.length - visibleCount)} more)
                    <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition" />
                  </button>
                </div>
              )}

              {/* End of results message */}
              {!hasMore && visibleListings.length > 0 && (
                <div className="text-center py-8">
                  <p className="text-sm text-[#A293BB]">
                    You've seen all {filteredListings.length} listings 🎉
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <MarketplaceBottomNav />
    </div>
  );
};

export default Services;