import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ChevronRight, Heart, MapPin, ShieldCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import MarketplaceBottomNav from '../components/MarketplaceBottomNav';
import { productAPI } from '../services/api';
import { getVenueImage, getVenueLocationLabel, matchesVenueSearch, toVenueImageUrl } from '../utils/venues';

const QUICK_CATEGORIES = [
  { label: 'Venues', image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=320&q=80', tone: 'from-[#EEE7FF] to-[#DDD6FE]' },
  { label: 'Catering', image: 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=320&q=80', tone: 'from-[#FFF1E7] to-[#FED7AA]' },
  { label: 'Photography', image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=320&q=80', tone: 'from-[#FFE4EF] to-[#FDA4AF]' },
  { label: 'DJs', image: 'https://images.unsplash.com/photo-1571266028243-d220c9d2f8bf?auto=format&fit=crop&w=320&q=80', tone: 'from-[#E6F7FF] to-[#93C5FD]' },
  { label: 'Decor', image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=320&q=80', tone: 'from-[#EAFBF0] to-[#86EFAC]' },
  { label: 'Makeup', image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=320&q=80', tone: 'from-[#FFF4D6] to-[#FDE68A]' },
  { label: 'Travel', image: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=320&q=80', tone: 'from-[#E8F0FF] to-[#C4B5FD]' },
  { label: 'More', image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=320&q=80', tone: 'from-[#F3F4F6] to-[#D1D5DB]' },
];

const OCCASIONS = [
  { label: 'Wedding', image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=900&q=80' },
  { label: 'Birthday', image: 'https://images.unsplash.com/photo-1464349153735-7db50ed83c84?auto=format&fit=crop&w=900&q=80' },
  { label: 'Anniversary', image: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=900&q=80' },
  { label: 'House Party', image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=900&q=80' },
  { label: 'Corporate Event', image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=900&q=80' },
];

const HERO_BANNERS = [
  {
    title: 'Find Your Perfect Venue in Bhopal',
    subtitle: 'Gardens · Farmhouses · Resorts · Banquet Halls · Lawns',
    description: 'Discover and book the finest event spaces across the city with confidence.',
    cta: 'Explore Venues',
    image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1400&q=80',
  },
  {
    title: 'Top Caterers Starting ₹500/plate',
    subtitle: 'Premium setups, live counters and pure veg options',
    description: 'Browse catering specialists, compare menus, and match them to your venue style.',
    cta: 'View Catering',
    image: 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=1400&q=80',
  },
  {
    title: 'Birthday Party Packages',
    subtitle: 'Decor, photography and venue bundles for easy booking',
    description: 'Discover pre-built celebration combos that save time and reduce planning stress.',
    cta: 'View Packages',
    image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1400&q=80',
  },
];

const INSPIRATION_FALLBACKS = [
  'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=900&q=80',
];

const VIEWED_KEY = 'venue-ai-recently-viewed';
const TODAY = new Date().toISOString().slice(0, 10);

// Mobile: show 4 cards initially, then load 4 more
const INITIAL_VISIBLE = 4;
const LOAD_MORE_COUNT = 4;

const toRupee = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`;

const LazyImage = ({ src, alt, className, ...props }) => {
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
    <div ref={imgRef} className={`relative overflow-hidden bg-gray-100 ${className}`} {...props}>
      {isInView && (
        <img
          src={src}
          alt={alt}
          className={`h-full w-full object-cover transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setIsLoaded(true)}
          loading="lazy"
        />
      )}
      {!isLoaded && isInView && <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200" />}
    </div>
  );
};

const SectionHeader = ({ title, actionLabel = 'View all', actionTo = '/services' }) => (
  <div className="mb-5 flex items-center justify-between gap-3">
    <h2 className="text-lg font-bold tracking-tight text-[#23113F] sm:text-xl md:text-2xl">{title}</h2>
    <Link to={actionTo} className="whitespace-nowrap text-sm font-semibold text-[#7C3AED] transition hover:underline">
      {actionLabel}
    </Link>
  </div>
);

// Section with "Load More" functionality for mobile optimization
const SectionWithLoadMore = ({ title, items, selectedDate, onOpen, emptyMessage, viewAllLink }) => {
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);
  
  // Reset visible count when items change
  useEffect(() => {
    setVisibleCount(INITIAL_VISIBLE);
  }, [items.length]);
  
  const visibleItems = items.slice(0, visibleCount);
  const hasMore = visibleCount < items.length;
  
  const handleLoadMore = () => {
    setVisibleCount(prev => Math.min(prev + LOAD_MORE_COUNT, items.length));
  };
  
  if (items.length === 0 && emptyMessage) {
    return (
      <section>
        <SectionHeader title={title} actionTo={viewAllLink || '/services'} />
        <div className="rounded-xl bg-white p-6 text-center shadow-md">
          <p className="text-sm text-[#7D6F95]">{emptyMessage}</p>
        </div>
      </section>
    );
  }
  
  return (
    <section>
      <SectionHeader title={title} actionTo={viewAllLink || '/services'} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {visibleItems.map((item) => (
          <ListingCard key={item.id} venue={item} selectedDate={selectedDate} onOpen={onOpen} />
        ))}
      </div>
      {hasMore && (
        <div className="mt-6 flex justify-center">
          <button
            onClick={handleLoadMore}
            className="rounded-full bg-[#7C3AED] px-6 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-[#6D28D9] active:scale-95"
          >
            Load More ({items.length - visibleCount} left)
          </button>
        </div>
      )}
    </section>
  );
};

const ListingCard = ({ venue, selectedDate, onOpen }) => {
  const availableLabel = selectedDate
    ? 'Check exact availability'
    : venue.available_today ? 'Available Today' : 'Check Availability';

  return (
    <button
      type="button"
      onClick={() => onOpen(venue)}
      className="group w-full min-w-0 overflow-hidden rounded-2xl bg-white text-left shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="relative h-40 w-full overflow-hidden sm:h-44">
        <LazyImage src={getVenueImage(venue)} alt={venue.title} className="h-full w-full" />
        <div className="absolute left-3 top-3 rounded-full bg-[#22C55E] px-2 py-1 text-[11px] font-bold text-white shadow-sm">
          {venue.rating?.toFixed?.(1) || venue.rating || '4.5'}
        </div>
        <div className="absolute right-3 top-3 rounded-full bg-white/90 p-1.5 text-[#8A7AAE] backdrop-blur-sm transition hover:bg-white">
          <Heart className="h-4 w-4" />
        </div>
      </div>

      <div className="space-y-2 p-3 sm:p-4">
        <div>
          <h3 className="line-clamp-1 text-sm font-bold text-[#22103D] sm:text-base">{venue.title}</h3>
          <p className="mt-1 text-xs text-[#7D6F95]">⭐ {Number(venue.rating || 0).toFixed(1)} | {venue.review_count || 0}+ reviews</p>
        </div>

        <div className="flex items-center justify-between gap-3 text-xs text-[#7D6F95]">
          <span className="font-bold text-[#2A174A]">{toRupee(venue.price)}</span>
          <span className="text-right text-[10px] sm:text-xs">{venue.price_unit || 'Starting Price'}</span>
        </div>

        <div className="flex items-center gap-1 text-xs text-[#7D6F95]">
          <MapPin className="h-3 w-3 flex-shrink-0 sm:h-3.5 sm:w-3.5" />
          <span className="line-clamp-1 text-[11px] sm:text-xs">{getVenueLocationLabel(venue) || 'Bhopal'}</span>
        </div>

        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          {venue.tag_label && (
            <span className="rounded-full bg-[#F3E8FF] px-1.5 py-0.5 text-[9px] font-semibold text-[#7C3AED] sm:px-2 sm:py-1 sm:text-[10px]">
              {venue.tag_label}
            </span>
          )}
          {venue.pure_veg && (
            <span className="rounded-full bg-[#DCFCE7] px-1.5 py-0.5 text-[9px] font-semibold text-[#166534] sm:px-2 sm:py-1 sm:text-[10px]">
              Pure Veg
            </span>
          )}
        </div>

        <div className="rounded-xl bg-[#EDE9FE] px-2 py-1.5 text-center text-[10px] font-semibold text-[#6D28D9] transition sm:px-2.5 sm:py-2 sm:text-xs">
          {availableLabel}
        </div>
      </div>
    </button>
  );
};

export default function Home() {
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedOccasion, setSelectedOccasion] = useState('Wedding');
  const [heroIndex, setHeroIndex] = useState(0);
  const [recentlyViewed, setRecentlyViewed] = useState([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setHeroIndex((current) => (current + 1) % HERO_BANNERS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(VIEWED_KEY) || '[]');
      setRecentlyViewed(Array.isArray(stored) ? stored : []);
    } catch {
      setRecentlyViewed([]);
    }
  }, []);

  useEffect(() => {
    const loadListings = async () => {
      try {
        const venues = await productAPI.getAll({ status: 'approved', city: 'Bhopal', limit: 50 });
        setListings(Array.isArray(venues) ? venues : []);
      } catch (error) {
        console.error('Failed to load listings:', error);
      } finally {
        setLoading(false);
      }
    };

    loadListings();
  }, []);

  const filteredListings = useMemo(() => {
    return listings.filter((listing) => {
      if (selectedOccasion && !(listing.occasion_focus || listing.occasion_types || []).includes(selectedOccasion)) {
        return false;
      }
      return true;
    });
  }, [listings, selectedOccasion]);

  const recommended = useMemo(() => [...filteredListings].sort((a, b) => (b.recommended_score || 0) - (a.recommended_score || 0)), [filteredListings]);
  const budgetFriendly = useMemo(() => filteredListings.filter((listing) => Number(listing.price || 0) <= 100000), [filteredListings]);
  const premiumPicks = useMemo(() => filteredListings.filter((listing) => listing.premium_pick || listing.budget_tier === 'premium'), [filteredListings]);
  const trending = useMemo(() => [...filteredListings].sort((a, b) => (b.trending_score || 0) - (a.trending_score || 0)), [filteredListings]);
  const comboPackages = useMemo(() => filteredListings.filter((listing) => listing.combo_package).slice(0, 6), [filteredListings]);

  const inspirationImages = useMemo(() => {
    const listingImages = filteredListings
      .flatMap((listing) => [listing.image, ...(listing.gallery_images || [])])
      .filter(Boolean)
      .slice(0, 6)
      .map((image) => toVenueImageUrl(image));

    return [...listingImages, ...INSPIRATION_FALLBACKS].slice(0, 6);
  }, [filteredListings]);

  const viewedListings = useMemo(() => {
    const viewedMap = new Map(listings.map((listing) => [listing.id, listing]));
    return recentlyViewed.map((item) => viewedMap.get(item.id) || item).filter(Boolean);
  }, [listings, recentlyViewed]);

  const handleOpenListing = useCallback((listing) => {
    navigate(`/venues/${listing.id}`);
  }, [navigate]);

  const currentBanner = HERO_BANNERS[heroIndex];

  // Show loading skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F5FF] pb-28">
        <div className="px-4 py-5 md:px-6 lg:px-8">
          <div className="rounded-3xl bg-[#FBFAFF] p-4 shadow-lg sm:p-5 md:p-8">
            <div className="mb-8 h-[340px] animate-pulse rounded-2xl bg-gray-200 sm:h-[380px] md:h-[420px]" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-80 animate-pulse rounded-2xl bg-gray-200" />
              ))}
            </div>
          </div>
        </div>
        <MarketplaceBottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F5FF] pb-28">
      <div className="">
        <div className="rounded-3xl bg-[#FBFAFF] p-4 shadow-lg sm:p-5 md:p-8">
          {/* Hero Banner */}
          <div className="relative mb-8 overflow-hidden rounded-2xl bg-white shadow-xl">
            <div className="relative h-[340px] sm:h-[380px] md:h-[420px] lg:h-[460px]">
              <LazyImage src={currentBanner.image} alt={currentBanner.title} className="absolute inset-0 h-full w-full" />
              <div className="absolute inset-0 z-10 bg-gradient-to-r from-black/85 via-black/55 to-black/20" />
              <div className="absolute inset-0 z-20 flex items-center p-4 sm:p-6 md:p-10">
                <div className="max-w-2xl">
                  <div className="rounded-[28px] bg-[#1F1140]/55 p-4 text-white shadow-[0_18px_40px_rgba(0,0,0,0.28)] backdrop-blur-md sm:p-5 md:p-7">
                    <h1 className="text-2xl font-extrabold leading-tight text-white sm:text-3xl md:text-5xl">
                      {currentBanner.title}
                    </h1>
                    <p className="mt-3 text-xs font-medium text-white/90 sm:text-sm md:text-base">
                      {currentBanner.subtitle}
                    </p>
                    <p className="mt-3 max-w-xl text-sm text-white/95 md:text-lg">
                      {currentBanner.description}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate('/services')}
                    className="mt-5 w-fit rounded-full bg-white px-5 py-3 text-sm font-bold text-[#34135E] shadow-lg transition hover:bg-gray-100 md:mt-6 md:px-6"
                  >
                    {currentBanner.cta || 'Explore Venues'}
                  </button>
                </div>
              </div>
            </div>
            <div className="absolute bottom-4 left-0 right-0 z-20 flex justify-center gap-2">
              {HERO_BANNERS.map((banner, index) => (
                <button
                  key={banner.title}
                  type="button"
                  onClick={() => setHeroIndex(index)}
                  className={`h-2 rounded-full transition-all ${heroIndex === index ? 'w-6 bg-[#7C3AED]' : 'w-2 bg-white/70'}`}
                />
              ))}
            </div>
          </div>

          {/* Filters Row */}
          <div className="mb-8 grid gap-4 lg:grid-cols-2">
            <div className="rounded-xl bg-gradient-to-r from-[#F5EDFF] to-[#FFF6E9] p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-[#A78BFA]">Smart Suggestions</p>
              <p className="mt-1 text-sm font-semibold text-[#2A174A]">
                Based on your search: <span className="text-[#7C3AED]">{selectedOccasion} in Bhopal</span>
              </p>
            </div>
            <div className="rounded-xl bg-white p-4 shadow-md">
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#A293BB]">Available Today / On Your Date</label>
              <input
                type="date"
                min={TODAY}
                value={selectedDate}
                onChange={(event) => setSelectedDate(event.target.value)}
                className="w-full rounded-lg border border-[#E9DDFE] px-4 py-2.5 text-sm font-semibold text-[#2A174A] outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]"
              />
            </div>
          </div>

          {/* Quick Categories */}
          <div className="mb-8 grid grid-cols-4 gap-3 sm:grid-cols-4 md:grid-cols-8">
            {QUICK_CATEGORIES.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => navigate(`/services?q=${encodeURIComponent(item.label)}`)}
                className="flex min-w-0 flex-col items-center gap-2 transition hover:scale-105"
              >
                <div className={`h-14 w-14 overflow-hidden rounded-2xl bg-gradient-to-br ${item.tone} p-[2px] shadow-md sm:h-16 sm:w-16`}>
                  <div className="h-full w-full overflow-hidden rounded-xl bg-white">
                    <LazyImage src={item.image} alt={item.label} className="h-full w-full" />
                  </div>
                </div>
                <span className="text-center text-[11px] font-semibold text-[#6F6289] sm:text-xs">{item.label}</span>
              </button>
            ))}
          </div>

          <div className="space-y-10">
            {/* Recommended Section with Load More */}
            <SectionWithLoadMore
              title="Recommended For You"
              items={recommended}
              selectedDate={selectedDate}
              onOpen={handleOpenListing}
              emptyMessage="No recommended venues at the moment."
            />

            {/* Plan by Occasion */}
            <section>
              <SectionHeader title="Plan by Occasion" />
              <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-5">
                {OCCASIONS.map((occasion) => (
                  <button
                    key={occasion.label}
                    type="button"
                    onClick={() => setSelectedOccasion(occasion.label)}
                    className={`relative h-24 min-w-0 overflow-hidden rounded-xl text-left shadow-md transition hover:scale-[1.02] sm:h-28 ${selectedOccasion === occasion.label ? 'ring-2 ring-[#7C3AED]' : ''}`}
                  >
                    <LazyImage src={occasion.image} alt={occasion.label} className="absolute inset-0 h-full w-full" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/10" />
                    <span className="absolute bottom-2 left-2 pr-3 text-xs font-bold text-white sm:bottom-3 sm:left-3 sm:text-sm">{occasion.label}</span>
                  </button>
                ))}
              </div>
            </section>

            {/* Budget Picks with Load More */}
            <SectionWithLoadMore
              title="Budget-Based Picks"
              items={budgetFriendly}
              selectedDate={selectedDate}
              onOpen={handleOpenListing}
              emptyMessage="No budget-friendly venues found under ₹1L."
              viewAllLink="/services?budget=under-1l"
            />

            {/* Premium Picks with Load More */}
            <SectionWithLoadMore
              title="Premium Picks"
              items={premiumPicks}
              selectedDate={selectedDate}
              onOpen={handleOpenListing}
              emptyMessage="No premium venues found."
              viewAllLink="/services?category=premium"
            />

            {/* Trending with Load More */}
            <SectionWithLoadMore
              title="Trending Near You"
              items={trending}
              selectedDate={selectedDate}
              onOpen={handleOpenListing}
              emptyMessage="No trending venues at the moment."
            />

            {/* Combo Packages Section */}
            {comboPackages.length > 0 && (
              <section>
                <SectionHeader title="Top Deals & Combo Packages" />
                <div className="grid gap-5 md:grid-cols-2">
                  {comboPackages.map((combo) => (
                    <button
                      key={combo.id}
                      type="button"
                      onClick={() => handleOpenListing(combo)}
                      className="group overflow-hidden rounded-xl bg-white text-left shadow-md transition hover:shadow-xl"
                    >
                      <div className="flex flex-col md:flex-row">
                        <div className="flex-1 p-4 sm:p-5">
                          <p className="text-base font-bold text-[#2A174A] sm:text-lg">{combo.combo_name || 'Special Combo'}</p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {(combo.combo_items || []).slice(0, 3).map((item) => (
                              <span key={item} className="rounded-full bg-[#F3E8FF] px-2 py-0.5 text-[10px] font-semibold text-[#7C3AED] sm:px-2.5 sm:py-1 sm:text-xs">
                                {item}
                              </span>
                            ))}
                            {(combo.combo_items || []).length > 3 && (
                              <span className="rounded-full bg-[#F3E8FF] px-2 py-0.5 text-[10px] font-semibold text-[#7C3AED]">
                                +{combo.combo_items.length - 3}
                              </span>
                            )}
                          </div>
                          <div className="mt-4 flex flex-wrap items-end gap-2">
                            <span className="text-xl font-extrabold text-[#D97706] sm:text-2xl">{toRupee(combo.combo_discount_price || combo.price)}</span>
                            {!!combo.combo_original_price && (
                              <span className="text-xs font-semibold text-[#A293BB] line-through sm:text-sm">{toRupee(combo.combo_original_price)}</span>
                            )}
                          </div>
                          <div className="mt-4 inline-flex items-center gap-1 rounded-full bg-[#E9D5FF] px-3 py-1.5 text-xs font-bold text-[#6D28D9] transition group-hover:bg-[#DDD6FE] sm:mt-5 sm:px-4 sm:py-2 sm:text-sm">
                            View Package <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
                          </div>
                        </div>
                        <div className="h-36 w-full md:h-auto md:w-2/5">
                          <LazyImage src={getVenueImage(combo)} alt={combo.title} className="h-full w-full" />
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* Recently Viewed with Load More */}
            {viewedListings.length > 0 && (
              <SectionWithLoadMore
                title="Recently Viewed"
                items={viewedListings}
                selectedDate={selectedDate}
                onOpen={handleOpenListing}
                emptyMessage="No recently viewed venues."
              />
            )}

            {/* Inspiration Section */}
            <section>
              <SectionHeader title="Real Event Inspiration" />
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                {inspirationImages.map((image, index) => (
                  <div key={`${image}-${index}`} className="overflow-hidden rounded-xl">
                    <LazyImage src={image} alt={`Inspiration ${index + 1}`} className="h-full min-h-[140px] w-full object-cover md:min-h-[200px]" />
                  </div>
                ))}
              </div>
            </section>

            {filteredListings.length === 0 && (
              <div className="mt-8 rounded-xl bg-white p-8 text-center shadow-md">
                <ShieldCheck className="mx-auto h-10 w-10 text-[#7C3AED]" />
                <p className="mt-3 text-base font-semibold text-[#2A174A]">No listings match the selected filters right now.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <MarketplaceBottomNav />
    </div>
  );
}