import React, { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import VenueCard from './VenueCard';
import { productAPI } from '../services/api';

const Services = () => {
  const navigate = useNavigate();
  const [venues, setVenues] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVenues = async () => {
      try {
        const response = await productAPI.getAll({ status: 'approved', search });
        setVenues(Array.isArray(response) ? response : []);
      } catch (error) {
        console.error('Error fetching venues:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVenues();
  }, [search]);

  return (
    <div className="min-h-screen bg-[#F8F7F4]" data-testid="services-page">
      <div className="bg-[#1C1917] text-white py-16">
        <div className="px-6 md:px-12 lg:px-24">
          <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-none font-medium mb-6" data-testid="services-heading">
            Explore Event Venues
          </h1>
          <p className="text-base leading-relaxed text-stone-300 max-w-3xl">
            Browse venues for birthdays, engagement parties, wedding functions, reception nights, corporate events, and private celebrations.
          </p>
        </div>
      </div>

      <div className="sticky top-[73px] bg-white/85 backdrop-blur-xl border-b border-white/40 z-40">
        <div className="px-6 md:px-12 lg:px-24 py-4">
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#57534E]" size={20} />
            <input
              type="text"
              placeholder="Search by venue, category, or vibe..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-stone-200 rounded-full focus:outline-none focus:ring-2 focus:ring-[#9A3412] bg-white"
              data-testid="search-input"
            />
          </div>
        </div>
      </div>

      <div className="px-6 md:px-12 lg:px-24 py-10">
        {loading ? (
          <div className="text-center py-12" data-testid="loading-indicator">Loading venues...</div>
        ) : venues.length === 0 ? (
          <div className="text-center py-12 text-[#57534E]" data-testid="no-venues">No venues found</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8" data-testid="venue-grid">
            {venues.map((venue) => (
              <VenueCard
                key={venue.id}
                venue={venue}
                action={
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => navigate(`/venues/${venue.id}`)}
                      className="w-full border border-stone-200 text-[#44403C] py-3 rounded-full font-medium"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => navigate(`/venues/${venue.id}`, { state: { startBooking: true } })}
                      className="w-full bg-[#1C1917] text-white py-3 rounded-full font-medium hover:bg-[#9A3412] transition-all"
                    >
                      Book Now
                    </button>
                  </div>
                }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Services;
