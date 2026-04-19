import React, { useEffect, useMemo, useState } from 'react';
import { MapPin, Search, Users } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { productAPI, searchAPI } from '../services/api';
import {
  getVenueImage,
  getVenueLocationLabel,
  matchesVenueSearch,
  normalizeVenueResults,
} from '../utils/venues';

const CAT_EMOJI = {
  Gardens: 'G',
  Farmhouses: 'F',
  Resorts: 'R',
  'Banquet Halls': 'B',
  Lawns: 'L',
};

const toCurrency = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`;

const Services = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const query = new URLSearchParams(location.search).get('q') || '';

  const [venues, setVenues] = useState([]);
  const [searchInput, setSearchInput] = useState(query);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setSearchInput(query);
  }, [query]);

  useEffect(() => {
    const fetchVenues = async () => {
      try {
        setLoading(true);

        if (query) {
          const res = await searchAPI.searchVenues({ q: query });
          setVenues(normalizeVenueResults(res));
          return;
        }

        const res = await productAPI.getAll({ status: 'approved' });
        setVenues(normalizeVenueResults(res));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchVenues();
  }, [query]);

  const visibleVenues = useMemo(
    () => venues.filter((venue) => matchesVenueSearch(venue, searchInput)),
    [venues, searchInput]
  );

  const handleSearch = (e) => {
    e.preventDefault();
    const trimmedQuery = searchInput.trim();
    navigate(trimmedQuery ? `/services?q=${encodeURIComponent(trimmedQuery)}` : '/services');
  };

  return (
    <div className="min-h-screen bg-black text-white px-4 md:px-8 lg:px-16 py-10">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-8">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-gray-500 mb-2">Venue Directory</p>
            <h2 className="text-3xl font-bold">
              {query ? (
                <>Results for <span className="text-purple-400">"{query}"</span></>
              ) : (
                'All Approved Venues'
              )}
            </h2>
            <p className="text-gray-400 mt-2">
              {visibleVenues.length} venue{visibleVenues.length === 1 ? '' : 's'} ready to explore
            </p>
          </div>

          <form onSubmit={handleSearch} className="w-full max-w-2xl">
            <div className="flex flex-col sm:flex-row gap-3 bg-[#111] border border-white/10 rounded-2xl p-2">
              <div className="flex-1 flex items-center gap-3 bg-white/5 rounded-xl px-4 py-3">
                <Search className="w-5 h-5 text-purple-400" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search by venue, category, zone, landmark, or location"
                  className="flex-1 bg-transparent outline-none text-white placeholder:text-gray-500"
                />
              </div>
              <button
                type="submit"
                className="bg-white text-black px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-all"
              >
                Search
              </button>
            </div>
          </form>
        </div>

        {loading ? (
          <div className="text-center py-16 bg-[#0F0F12] rounded-2xl border border-white/10">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent"></div>
              <p className="text-gray-400">Loading live venue listings...</p>
            </div>
          </div>
        ) : visibleVenues.length === 0 ? (
          <div className="text-center py-16 bg-[#0F0F12] rounded-2xl border border-white/10">
            <Search className="mx-auto mb-3 text-gray-400" />
            <p>No venues found for this search.</p>
            <button
              onClick={() => navigate('/services')}
              className="underline mt-2 text-gray-400 hover:text-white"
            >
              Clear Search
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {visibleVenues.map((venue) => {
              const imageUrl = getVenueImage(venue);
              const locationLabel = getVenueLocationLabel(venue);

              return (
                <div key={venue.id} className="bg-[#111] rounded-2xl overflow-hidden border border-white/10 hover:border-white/20 transition-all">
                  <div className="h-56 bg-white/5 flex items-center justify-center text-4xl overflow-hidden">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={venue.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      CAT_EMOJI[venue.category] || 'V'
                    )}
                  </div>

                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <h3 className="font-bold text-lg">{venue.name}</h3>
                        <p className="text-sm text-purple-300">{venue.category || 'Venue'}</p>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{toCurrency(venue.price)}</div>
                        <p className="text-xs text-gray-500">starting price</p>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm text-gray-400 mb-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>{locationLabel || 'Location coming soon'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span>Up to {venue.capacity || 0} guests</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {(venue.business_name || venue.vendor_name) && (
                        <span className="text-xs px-3 py-1 rounded-full bg-white/5 border border-white/10 text-gray-300">
                          {venue.business_name || venue.vendor_name}
                        </span>
                      )}
                      {venue.gallery_images?.length > 0 && (
                        <span className="text-xs px-3 py-1 rounded-full bg-white/5 border border-white/10 text-gray-300">
                          {venue.gallery_images.length} photos
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => navigate(`/venues/${venue.id}`)}
                      className="mt-1 w-full bg-white text-black py-2.5 rounded-xl font-semibold hover:bg-gray-100 transition-all"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Services;
