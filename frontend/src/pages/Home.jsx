import React, { useEffect, useMemo, useState } from 'react';
import { CalendarDays, MapPinned, SlidersHorizontal, Search, MapPin, Sparkles, Clock, Users, Star, TrendingUp, Filter, X, ChevronRight, Heart, Share2, Navigation, Mail, Phone, MessageSquare, Quote, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { bookingAPI, productAPI } from '../services/api';
import { getVenueImage, getVenueLocationLabel, matchesVenueSearch } from '../utils/venues';

const CATEGORIES = ['Gardens', 'Farmhouses', 'Resorts', 'Banquet Halls', 'Lawns'];
const TIME_SLOTS = ['10:00:00', '13:00:00', '16:00:00', '19:00:00'];

const BHOPAL_BOUNDS = {
  minLat: 23.16, maxLat: 23.25,
  minLng: 77.36, maxLng: 77.48
};

const LANDMARKS = [
  { label: 'Upper Lake', lat: 23.2366, lng: 77.3818 },
  { label: 'DB Mall', lat: 23.2333, lng: 77.4346 },
  { label: 'Aura Mall', lat: 23.1819, lng: 77.4625 },
  { label: 'E-7 Market', lat: 23.2202, lng: 77.4328 },
  { label: 'Van Vihar', lat: 23.2347, lng: 77.3779 },
];

const toMapPoint = (lat, lng) => ({
  x: ((lng - BHOPAL_BOUNDS.minLng) / (BHOPAL_BOUNDS.maxLng - BHOPAL_BOUNDS.minLng)) * 100,
  y: ((BHOPAL_BOUNDS.maxLat - lat) / (BHOPAL_BOUNDS.maxLat - BHOPAL_BOUNDS.minLat)) * 100,
});

const toCurrency = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`;

const CAT_EMOJI = {
  Gardens: '🌿', Farmhouses: '🏡', Resorts: '🏨',
  'Banquet Halls': '🎪', Lawns: '🌾',
};

const CAT_BG = {
  Gardens: '#1e2a2a', Farmhouses: '#2a1f1a', Resorts: '#1a2330',
  'Banquet Halls': '#252040', Lawns: '#1f2a1f',
};

export default function Home() {
  const navigate = useNavigate();
  const [venues, setVenues] = useState([]);
  const [availability, setAvailability] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVenueId, setSelectedVenueId] = useState(null);

  const [category, setCategory] = useState('All');
  const [guestCount, setGuestCount] = useState(250);
  const [selectedDate, setSelectedDate] = useState('');
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(250000);

  useEffect(() => {
    (async () => {
      try {
        const response = await productAPI.getAll({ status: 'approved' });
        const approved = Array.isArray(response) ? response : [];
        setVenues(approved);
        const avail = await Promise.all(
          approved.map(async (v) => {
            try {
              const r = await bookingAPI.getAvailability(v.id);
              return [v.id, r.blockedSlots || []];
            } catch { return [v.id, []]; }
          })
        );
        setAvailability(Object.fromEntries(avail));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filteredVenues = useMemo(() => {
    return venues.filter((v) => {
      const price = Number(v.price || 0);
      const cap = Number(v.capacity || 0);
      if (category !== 'All' && v.category !== category) return false;
      if (cap && cap < guestCount) return false;
      if (price < minPrice || price > maxPrice) return false;
      if (!matchesVenueSearch(v, searchQuery)) return false;
      if (selectedDate) {
        const blocked = (availability[v.id] || []).filter(
          (s) => s.event_date?.slice(0, 10) === selectedDate
        );
        if (blocked.length >= TIME_SLOTS.length) return false;
      }
      return true;
    });
  }, [venues, category, guestCount, minPrice, maxPrice, selectedDate, availability, searchQuery]);

  const resetFilters = () => {
    setCategory('All'); setGuestCount(250); setSelectedDate('');
    setMinPrice(0); setMaxPrice(250000); setSearchQuery('');
  };

  const heroStats = useMemo(() => {
    const categories = new Set(venues.map((venue) => venue.category).filter(Boolean));
    const locations = new Set(
      venues
        .map((venue) => getVenueLocationLabel(venue))
        .filter(Boolean)
    );
    const averagePrice = venues.length
      ? Math.round(venues.reduce((sum, venue) => sum + Number(venue.price || 0), 0) / venues.length)
      : 0;

    return [
      { num: `${venues.length}+`, label: 'Approved Venues', icon: '🏛️' },
      { num: String(categories.size || 0), label: 'Categories', icon: '🎯' },
      { num: `${locations.size}+`, label: 'Areas Covered', icon: '📍' },
      { num: averagePrice ? toCurrency(averagePrice) : '₹0', label: 'Average Starting Price', icon: '💸' },
    ];
  }, [venues]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const trimmedQuery = searchQuery.trim();
    navigate(trimmedQuery ? `/services?q=${encodeURIComponent(trimmedQuery)}` : '/services');
  };

  const getAvailableSlotCount = (venueId, date) => {
    if (!date) return TIME_SLOTS.length;
    const blocked = (availability[venueId] || []).filter(
      (slot) => slot.event_date?.slice(0, 10) === date
    );
    return Math.max(TIME_SLOTS.length - blocked.length, 0);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section with Dark Theme */}
      <section className="relative overflow-hidden bg-gradient-to-br from-purple-900/40 via-black to-pink-900/40 pt-20 pb-32 px-4">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2070')] bg-cover bg-center opacity-10"></div>
        <div className="relative z-10 max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-4 py-2 mb-6 border border-white/20">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-medium">Bhopal's #1 Venue Discovery Platform</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
            Find Your <span className="text-purple-400">Perfect</span>
            <br />Venue in Bhopal
          </h1>
          <p className="text-lg text-gray-300 mb-10 max-w-2xl mx-auto">
            Gardens · Farmhouses · Resorts · Banquet Halls · Lawns
            <br />Discover and book the finest event spaces across the city with confidence.
          </p>

          {/* Search Bar with Light Button */}
          <form className="max-w-3xl mx-auto" onSubmit={handleSearchSubmit}>
            <div className="flex flex-col md:flex-row gap-3 bg-black/60 backdrop-blur-xl rounded-2xl p-2 border border-white/20">
              <div className="flex-1 flex items-center gap-3 bg-white/5 rounded-xl px-4 py-3">
                <Search className="w-5 h-5 text-purple-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search venues by name, location, or category..."
                  className="flex-1 bg-transparent outline-none text-white placeholder:text-gray-400"
                />
              </div>
              <button type="submit" className="bg-white text-black px-8 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-all flex items-center justify-center gap-2">
                <Search className="w-4 h-4" />
                Search
              </button>
            </div>
          </form>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 md:gap-12 mt-16">
            {heroStats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold text-white">{stat.num}</div>
                <div className="text-sm text-gray-400 flex items-center gap-1">
                  <span>{stat.icon}</span>
                  <span>{stat.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Filters Section - Dark Theme */}
      

      {/* Results Section with Light Buttons */}
      <section className="px-4 pb-16 max-w-7xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-white/10 p-2 rounded-xl">
              <Sparkles className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold">Available Venues</h2>
          </div>
          <button
            onClick={() => navigate('/services')}
            className="bg-white text-black px-4 py-2 rounded-xl font-semibold hover:bg-gray-100 transition-all flex items-center gap-2"
          >
            <span>View All Services</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="text-center py-16 bg-[#0F0F12] rounded-2xl border border-white/10">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent"></div>
              <p className="text-gray-400">Discovering perfect venues for you...</p>
            </div>
          </div>
        ) : filteredVenues.length === 0 ? (
          <div className="text-center py-16 bg-[#0F0F12] rounded-2xl border border-white/10">
            <div className="flex flex-col items-center gap-4">
              <div className="bg-white/5 p-4 rounded-full">
                <Search className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-gray-400">No venues match your filters</p>
              <button
                onClick={resetFilters}
                className="text-sm text-gray-400 hover:text-white font-medium underline"
              >
                Clear all filters
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredVenues.map((venue) => (
              <article
                key={venue.id}
                onClick={() => setSelectedVenueId(venue.id)}
                className={`group bg-[#0F0F12] rounded-[28px] border overflow-hidden transition-all cursor-pointer hover:-translate-y-1 hover:shadow-2xl ${selectedVenueId === venue.id
                    ? 'border-white shadow-lg'
                    : 'border-white/10 hover:border-white/40'
                  }`}
              >
                <div
                  className="relative h-56 overflow-hidden"
                  style={{ background: CAT_BG[venue.category] || '#1a1a1f' }}
                >
                  {getVenueImage(venue) ? (
                    <img
                      src={getVenueImage(venue)}
                      alt={venue.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-6xl bg-white/5">
                      {CAT_EMOJI[venue.category] || '🏛️'}
                    </div>
                  )}

                  <div className="absolute inset-x-0 top-0 p-4 flex items-start justify-between gap-3">
                    <span className="text-xs px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white border border-white/10">
                      {CAT_EMOJI[venue.category]} {venue.category}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => e.stopPropagation()}
                        className="p-2 rounded-full bg-black/45 backdrop-blur-md hover:bg-black/70 transition-colors"
                      >
                        <Heart className="w-4 h-4 text-white/80 hover:text-red-400" />
                      </button>
                      <button
                        onClick={(e) => e.stopPropagation()}
                        className="p-2 rounded-full bg-black/45 backdrop-blur-md hover:bg-black/70 transition-colors"
                      >
                        <Share2 className="w-4 h-4 text-white/80 hover:text-blue-400" />
                      </button>
                    </div>
                  </div>

                  <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 via-black/30 to-transparent">
                    <div className="flex items-end justify-between gap-3">
                      <div>
                        <h3 className="text-xl font-bold text-white">{venue.name}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-200 mt-1">
                          <MapPin className="w-4 h-4" />
                          <span className="truncate">{getVenueLocationLabel(venue) || 'Location coming soon'}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-white">{toCurrency(venue.price)}</div>
                        <div className="text-xs text-gray-300">per event</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-5">
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="rounded-2xl bg-white/[0.04] border border-white/10 px-4 py-3">
                      <div className="flex items-center gap-2 text-gray-400 text-xs uppercase tracking-[0.18em] mb-2">
                        <Users className="w-4 h-4" />
                        Capacity
                      </div>
                      <div className="font-semibold text-white">Up to {venue.capacity || 0}</div>
                    </div>
                    <div className="rounded-2xl bg-white/[0.04] border border-white/10 px-4 py-3">
                      <div className="flex items-center gap-2 text-gray-400 text-xs uppercase tracking-[0.18em] mb-2">
                        <Clock className="w-4 h-4" />
                        Availability
                      </div>
                      <div className="font-semibold text-white">
                        {selectedDate ? `${getAvailableSlotCount(venue.id, selectedDate)} slots open` : 'Check date'}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-5">
                    <span className="text-xs px-3 py-1 rounded-full bg-white/10 text-gray-300 border border-white/20">
                      {Number(venue.capacity) >= 500 ? 'Large Event' : Number(venue.capacity) >= 300 ? 'Medium Gathering' : 'Intimate Setting'}
                    </span>
                    {(venue.business_name || venue.vendor_name) && (
                      <span className="text-xs px-3 py-1 rounded-full bg-white/10 text-gray-300 border border-white/20">
                        {venue.business_name || venue.vendor_name}
                      </span>
                    )}
                    {!!venue.gallery_images?.length && (
                      <span className="text-xs px-3 py-1 rounded-full bg-white/10 text-gray-300 border border-white/20">
                        {venue.gallery_images.length} photos
                      </span>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={(e) => { e.stopPropagation(); navigate(`/venues/${venue.id}`); }}
                      className="flex-1 text-sm px-4 py-3 rounded-2xl border border-white/20 hover:bg-white/5 transition-all font-medium"
                    >
                      View Details
                      <ChevronRight className="w-4 h-4 inline ml-1" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); navigate(`/venues/${venue.id}`, { state: { startBooking: true } }); }}
                      className="flex-1 text-sm px-4 py-3 rounded-2xl bg-white text-black hover:bg-gray-100 transition-all font-semibold flex items-center justify-center gap-1"
                    >
                      Book Now
                      <Navigation className="w-4 h-4" />
                    </button>
                  </div>

                  {selectedVenueId === venue.id && (
                    <div className="mt-4 rounded-2xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-gray-300">
                      {selectedDate
                        ? `${getAvailableSlotCount(venue.id, selectedDate)} of ${TIME_SLOTS.length} booking slots are still open on ${selectedDate}.`
                        : 'Pick a date in filters to see live slot availability for this venue.'}
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Testimonials Section with Light Simple Buttons */}
      <section className="px-4 py-16 bg-gradient-to-br from-purple-900/20 via-black to-pink-900/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="bg-white/10 p-3 rounded-xl inline-block mb-4">
              <Star className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-3xl font-bold mb-4">What Our Customers Say</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">Real stories from real people who found their perfect venue with us</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: "Priya Sharma",
                event: "Wedding Reception",
                venue: "Royal Garden Resort",
                rating: 5,
                comment: "Amazing experience! The venue was perfect for our wedding. The booking process was smooth and the staff was very helpful. Highly recommend!",
                avatar: "👩‍💼"
              },
              {
                name: "Rahul Verma",
                event: "Corporate Event",
                venue: "Grand Banquet Hall",
                rating: 5,
                comment: "Found the perfect venue for our company annual meet. The platform made it so easy to compare options and book. Excellent service!",
                avatar: "👨‍💼"
              },
              {
                name: "Anjali Patel",
                event: "Birthday Party",
                venue: "Sunshine Farmhouse",
                rating: 4,
                comment: "Beautiful farmhouse with amazing ambiance. The booking process was seamless and the venue exceeded our expectations. Will definitely book again!",
                avatar: "👩‍🎓"
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-[#0F0F12] rounded-2xl p-6 border border-white/10 hover:shadow-xl transition-all">
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-4xl">{testimonial.avatar}</div>
                  <div className="flex-1">
                    <h4 className="font-bold">{testimonial.name}</h4>
                    <p className="text-sm text-gray-400">{testimonial.event}</p>
                  </div>
                  <div className="flex">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                </div>
                <div className="relative">
                  <Quote className="w-5 h-5 text-white/20 absolute -top-2 -left-2" />
                  <p className="text-gray-300 italic pl-6">{testimonial.comment}</p>
                </div>
                <div className="mt-4 pt-4 border-t border-white/10">
                  <p className="text-sm text-gray-400 font-semibold">📍 {testimonial.venue}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section with Light Buttons */}
      <section className="px-4 py-16 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="bg-white/10 p-3 rounded-xl inline-block mb-4">
            <MessageSquare className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-3xl font-bold mb-4">Get in Touch</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">Have questions? We're here to help you find the perfect venue for your special event</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="text-center group">
            <div className="bg-white/10 p-4 rounded-2xl inline-block mb-4 group-hover:scale-110 transition-all">
              <Phone className="w-7 h-7 text-white" />
            </div>
            <h3 className="font-bold mb-2">Call Us</h3>
            <p className="text-gray-400 mb-1">Mon-Sat: 9AM-8PM</p>
            <a href="tel:+919876543210" className="text-gray-400 font-semibold hover:text-white">+91 98765 43210</a>
          </div>

          <div className="text-center group">
            <div className="bg-white/10 p-4 rounded-2xl inline-block mb-4 group-hover:scale-110 transition-all">
              <Mail className="w-7 h-7 text-white" />
            </div>
            <h3 className="font-bold mb-2">Email Us</h3>
            <p className="text-gray-400 mb-1">24/7 Support</p>
            <a href="mailto:info@venueai.com" className="text-gray-400 font-semibold hover:text-white">info@venueai.com</a>
          </div>

          <div className="text-center group">
            <div className="bg-white/10 p-4 rounded-2xl inline-block mb-4 group-hover:scale-110 transition-all">
              <MapPin className="w-7 h-7 text-white" />
            </div>
            <h3 className="font-bold mb-2">Visit Us</h3>
            <p className="text-gray-400 mb-1">MP Nagar, Zone-I</p>
            <span className="text-gray-400 font-semibold">Bhopal, Madhya Pradesh</span>
          </div>
        </div>

        <div className="bg-[#0F0F12] rounded-3xl p-8 border border-white/10">
          <div className="max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold mb-6 text-center">Send us a Message</h3>
            <form className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Your Name"
                  className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 focus:border-white outline-none text-white placeholder:text-gray-500"
                />
                <input
                  type="email"
                  placeholder="Your Email"
                  className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 focus:border-white outline-none text-white placeholder:text-gray-500"
                />
              </div>
              <input
                type="tel"
                placeholder="Your Phone Number"
                className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 focus:border-white outline-none text-white placeholder:text-gray-500"
              />
              <textarea
                placeholder="Tell us about your event..."
                rows={4}
                className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 focus:border-white outline-none text-white placeholder:text-gray-500 resize-none"
              />
              <button
                type="submit"
                className="w-full bg-white text-black py-3 rounded-xl font-semibold hover:bg-gray-100 transition-all"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
