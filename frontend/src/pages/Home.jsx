import React, { useEffect, useMemo, useState } from 'react';
import { CalendarDays, MapPinned, SlidersHorizontal, Search, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import VenueCard from './VenueCard';
import { bookingAPI, productAPI } from '../services/api';
import { BACKEND_BASE_URL } from '../config/env';

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
  Gardens: '#e1f5ee', Farmhouses: '#faeeda', Resorts: '#e6f1fb',
  'Banquet Halls': '#eeedfe', Lawns: '#eaf3de',
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
      if (searchQuery && !v.name?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
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

  return (
    <div className="min-h-screen bg-[#f6f4f0]">

      {/* ── HERO ── */}
      <section
        className="relative overflow-hidden flex flex-col items-center justify-center text-center px-6 py-20 mx-4 mt-4 rounded-3xl"
        style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 45%, #0f3460 75%, #533483 100%)' }}
      >
        {/* decorative circles */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute w-96 h-96 rounded-full bg-white opacity-[0.06] -top-24 -right-16" />
          <div className="absolute w-64 h-64 rounded-full bg-white opacity-[0.04] -bottom-12 -left-8" />
        </div>

        <span className="relative z-10 mb-5 inline-block border border-white/25 bg-white/10 text-white text-xs tracking-wider px-4 py-1.5 rounded-full">
          Bhopal's #1 Venue Discovery Platform
        </span>

        <h1 className="relative z-10 text-4xl md:text-5xl font-semibold text-white leading-tight mb-4">
          Find Your <span className="text-purple-300">Perfect</span>
          <br />Venue in Bhopal
        </h1>
        <p className="relative z-10 text-white/60 text-sm mb-8 max-w-md leading-relaxed">
          Gardens · Farmhouses · Resorts · Banquet Halls · Lawns
          <br />Discover and book the finest event spaces across the city.
        </p>

        {/* search bar */}
        <div className="relative z-10 w-full max-w-lg flex items-center bg-white rounded-full px-5 py-1.5 shadow-xl gap-3">
          <Search size={15} className="text-gray-400 flex-shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search venues by name…"
            className="flex-1 text-sm text-gray-800 placeholder-gray-400 outline-none bg-transparent"
          />
          <button
            className="bg-[#533483] text-white text-sm rounded-full px-5 py-2 font-medium hover:opacity-90 transition"
            onClick={() => { }}
          >
            Search
          </button>
        </div>

        {/* stats */}
        <div className="relative z-10 flex items-center gap-8 mt-8">
          {[['120+', 'Venues'], ['5', 'Categories'], ['2K+', 'Events hosted']].map(([n, l], i, arr) => (
            <React.Fragment key={l}>
              <div className="text-center">
                <div className="text-xl font-semibold text-white">{n}</div>
                <div className="text-xs text-white/50 mt-0.5">{l}</div>
              </div>
              {i < arr.length - 1 && <div className="w-px h-8 bg-white/20" />}
            </React.Fragment>
          ))}
        </div>
      </section>

      {/* ── FILTERS ── */}
      <section className="px-4 py-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">

          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-semibold flex items-center gap-2 text-gray-800">
              <SlidersHorizontal size={15} /> Refine your search
            </h2>
            <button
              onClick={resetFilters}
              className="text-xs text-gray-500 border border-gray-200 rounded-full px-4 py-1.5 hover:bg-gray-50 transition"
            >
              Reset
            </button>
          </div>

          {/* category chips */}
          <div className="flex flex-wrap gap-2 mb-5">
            {['All', ...CATEGORIES].map((item) => (
              <button
                key={item}
                onClick={() => setCategory(item)}
                className={`px-4 py-1.5 rounded-full text-xs transition font-medium ${category === item
                    ? 'bg-[#1a1a2e] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
              >
                {item === 'All' ? 'All venues' : item}
              </button>
            ))}
          </div>

          {/* filter grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-[10px] uppercase tracking-widest font-semibold text-gray-400 mb-1.5">
                Guests
              </label>
              <input
                type="range" min="50" max="1000" step="10" value={guestCount}
                onChange={(e) => setGuestCount(Number(e.target.value))}
                className="w-full accent-[#533483]"
              />
              <p className="text-xs text-gray-600 mt-1">{guestCount} guests</p>
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-widest font-semibold text-gray-400 mb-1.5">
                Date
              </label>
              <div className="relative">
                <CalendarDays className="absolute left-3 top-2.5 text-gray-400" size={13} />
                <input
                  type="date" value={selectedDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="pl-8 w-full border border-gray-200 rounded-xl py-2 text-xs text-gray-700 outline-none focus:border-[#533483] bg-gray-50"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-widest font-semibold text-gray-400 mb-1.5">
                Min price
              </label>
              <input
                value={toCurrency(minPrice)}
                onChange={(e) => setMinPrice(Math.min(Number(e.target.value.replace(/[^\d]/g, '') || 0), maxPrice))}
                className="w-full border border-gray-200 rounded-xl py-2 px-3 text-xs text-gray-700 outline-none focus:border-[#533483] bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-widest font-semibold text-gray-400 mb-1.5">
                Max price
              </label>
              <input
                value={toCurrency(maxPrice)}
                onChange={(e) => setMaxPrice(Math.max(Number(e.target.value.replace(/[^\d]/g, '') || 0), minPrice))}
                className="w-full border border-gray-200 rounded-xl py-2 px-3 text-xs text-gray-700 outline-none focus:border-[#533483] bg-gray-50"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── RESULTS + MAP ── */}
      <section className="px-4 pb-16">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-800">Available venues</h2>
          <span className="text-xs text-gray-400">
            {loading ? 'Loading…' : `${filteredVenues.length} result${filteredVenues.length !== 1 ? 's' : ''}`}
          </span>
        </div>

        <div className="grid lg:grid-cols-2 gap-5">

          {/* venue list */}
          <div className="space-y-3 max-h-[80vh] overflow-y-auto pr-1">
            {loading ? (
              <div className="text-center py-10 bg-white rounded-2xl border border-gray-100 text-sm text-gray-400">
                Loading venues…
              </div>
            ) : filteredVenues.length === 0 ? (
              <div className="text-center py-10 bg-white rounded-2xl border border-gray-100 text-sm text-gray-400">
                No venues match your filters
              </div>
            ) : (
              filteredVenues.map((venue) => (
                <div
                  key={venue.id}
                  onClick={() => setSelectedVenueId(venue.id)}
                  className={`bg-white rounded-2xl border transition cursor-pointer hover:shadow-md ${selectedVenueId === venue.id ? 'border-[#533483]' : 'border-gray-100 hover:border-gray-300'
                    }`}
                >
                  <div className="flex gap-3 p-4">
                    {/* thumbnail / emoji fallback */}
                    <div
                      className="w-20 h-20 rounded-xl flex-shrink-0 flex items-center justify-center text-3xl"
                      style={{ background: CAT_BG[venue.category] || '#f1efe8' }}
                    >
                      {venue.thumbnail ? (
                        <img src={`${BACKEND_BASE_URL}${venue.thumbnail}`} alt={venue.name} className="w-full h-full object-cover rounded-xl" />
                      ) : (
                        CAT_EMOJI[venue.category] || '🏛️'
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{venue.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5 mb-2">{venue.area || venue.location} · up to {venue.capacity} guests</p>
                      <div className="flex flex-wrap gap-1 mb-3">
                        <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-500 border border-gray-200">
                          {venue.category}
                        </span>
                        <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-500 border border-gray-200">
                          {Number(venue.capacity) >= 500 ? 'Large' : Number(venue.capacity) >= 300 ? 'Medium' : 'Intimate'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-gray-800">{toCurrency(venue.price)}</span>
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); navigate(`/venues/${venue.id}`); }}
                            className="text-xs px-3 py-1.5 rounded-full border border-gray-200 hover:bg-gray-50 transition text-gray-700"
                          >
                            Details
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); navigate(`/venues/${venue.id}`, { state: { startBooking: true } }); }}
                            className="text-xs px-3 py-1.5 rounded-full bg-[#1a1a2e] text-white hover:opacity-90 transition"
                          >
                            Book now
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* map */}
          <div className="sticky top-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <div className="flex items-center gap-2 mb-3">
                <MapPinned size={15} className="text-gray-400" />
                <span className="text-sm font-semibold text-gray-700">Bhopal map</span>
              </div>

              <div
                className="relative rounded-xl overflow-hidden"
                style={{ aspectRatio: '4/3', background: '#e8f0e9' }}
              >
                {/* grid */}
                {[25, 50, 75].map((p) => (
                  <React.Fragment key={p}>
                    <div className="absolute left-0 right-0 bg-white/50" style={{ top: `${p}%`, height: '0.5px' }} />
                    <div className="absolute top-0 bottom-0 bg-white/50" style={{ left: `${p}%`, width: '0.5px' }} />
                  </React.Fragment>
                ))}
                {/* roads */}
                <div className="absolute left-0 right-0 bg-white/80" style={{ top: '38%', height: '3px' }} />
                <div className="absolute top-0 bottom-0 bg-white/80" style={{ left: '52%', width: '3px' }} />

                {/* landmarks */}
                {LANDMARKS.map((lm) => {
                  const pt = toMapPoint(lm.lat, lm.lng);
                  return (
                    <div
                      key={lm.label}
                      className="absolute text-[10px] bg-white px-2 py-0.5 rounded-full shadow border border-gray-200 whitespace-nowrap text-gray-600"
                      style={{ left: `${pt.x}%`, top: `${pt.y}%`, transform: 'translate(-50%,-50%)' }}
                    >
                      {lm.label}
                    </div>
                  );
                })}

                {/* venue pins */}
                {filteredVenues.map((venue) => {
                  if (!venue.latitude || !venue.longitude) return null;
                  const pt = toMapPoint(Number(venue.latitude), Number(venue.longitude));
                  const isSelected = selectedVenueId === venue.id;
                  return (
                    <div
                      key={venue.id}
                      onClick={() => setSelectedVenueId(venue.id)}
                      title={venue.name}
                      className="absolute cursor-pointer"
                      style={{
                        left: `${pt.x}%`, top: `${pt.y}%`,
                        transform: 'translate(-50%, -100%)',
                        width: 18, height: 18,
                        borderRadius: '50% 50% 50% 0',
                        rotate: '-45deg',
                        background: isSelected ? '#1a1a2e' : '#533483',
                        border: '2px solid #fff',
                      }}
                    />
                  );
                })}
              </div>

              {/* legend */}
              <div className="flex gap-4 mt-3">
                {[['#533483', 'Venue'], ['#1a1a2e', 'Selected']].map(([color, label]) => (
                  <div key={label} className="flex items-center gap-1.5 text-xs text-gray-400">
                    <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                    {label}
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}