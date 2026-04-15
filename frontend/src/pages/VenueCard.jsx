import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BACKEND_BASE_URL } from '../config/env';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1761085590866-e94c99818636?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMjV8MHwxfHNlYXJjaHwzfHxsdXh1cnklMjBldmVudCUyMHZlbnVlJTIwaW50ZXJpb3J8ZW58MHx8fHwxNzc1Nzk5ODQ3fDA&ixlib=rb-4.1.0&q=85';

const VenueCard = ({ venue, action }) => {
  const navigate = useNavigate();
  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-[#DCFCE7] text-[#166534]';
      case 'pending':
        return 'bg-[#FEF9C3] text-[#854D0E]';
      case 'rejected':
        return 'bg-[#FEE2E2] text-[#991B1B]';
      default:
        return 'bg-stone-200 text-stone-700';
    }
  };

  const imageSrc = venue.image
    ? venue.image.startsWith('http')
      ? venue.image
      : `${BACKEND_BASE_URL}${venue.image}`
    : FALLBACK_IMAGE;
  const occasionTypes = Array.isArray(venue.occasion_types) ? venue.occasion_types : [];
  const features = Array.isArray(venue.features) ? venue.features : [];

  return (
    <div
      className="bg-white border border-stone-200 rounded-xl overflow-hidden group hover:shadow-lg transition-shadow duration-300 cursor-pointer"
      data-testid="venue-card"
      onClick={() => navigate(`/venues/${venue.id}`)}
    >
      <div className="overflow-hidden h-64">
        <img
          src={imageSrc}
          alt={venue.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
      </div>
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-heading text-xl sm:text-2xl" data-testid="venue-title">{venue.title}</h3>
          {venue.status && (
            <span className={`text-xs px-3 py-1 rounded-full ${getStatusColor(venue.status)}`} data-testid="venue-status">
              {venue.status}
            </span>
          )}
        </div>
        <p className="text-sm text-[#57534E] leading-relaxed mb-4" data-testid="venue-description">
          {venue.description}
        </p>
        {(venue.category || venue.location) && (
          <div className="flex flex-wrap gap-2 mb-4">
            {venue.category && (
              <span className="text-xs px-3 py-1 rounded-full bg-stone-100 text-stone-700">
                {venue.category}
              </span>
            )}
            {venue.location && (
              <span className="text-xs px-3 py-1 rounded-full bg-[#FFF7ED] text-[#9A3412]">
                {venue.location}
              </span>
            )}
          </div>
        )}
        {occasionTypes.length > 0 && (
          <div className="mb-4">
            <p className="text-xs tracking-[0.16em] uppercase font-bold text-[#78716C] mb-2">Best For</p>
            <div className="flex flex-wrap gap-2">
              {occasionTypes.map((occasion) => (
                <span key={occasion} className="text-xs px-3 py-1 rounded-full bg-[#F5F5F4] text-[#44403C]">
                  {occasion}
                </span>
              ))}
            </div>
          </div>
        )}
        {features.length > 0 && (
          <div className="mb-4">
            <p className="text-xs tracking-[0.16em] uppercase font-bold text-[#78716C] mb-2">Features</p>
            <div className="flex flex-wrap gap-2">
              {features.slice(0, 4).map((feature) => (
                <span key={feature} className="text-xs px-3 py-1 rounded-full bg-[#EFF6FF] text-[#1D4ED8]">
                  {feature}
                </span>
              ))}
            </div>
          </div>
        )}
        {venue.capacity && (
          <div className="flex items-center gap-4 text-xs text-[#57534E]">
            <span data-testid="venue-capacity">Capacity: {venue.capacity}</span>
            {venue.price && <span data-testid="venue-price">${venue.price}</span>}
          </div>
        )}
        {venue.business_name && (
          <div className="mt-4 pt-4 border-t border-stone-200">
            <p className="text-xs text-[#57534E]">By <span className="font-medium">{venue.business_name}</span></p>
          </div>
        )}
        {action && (
          <div
            className="mt-4 pt-4 border-t border-stone-200"
            onClick={(event) => event.stopPropagation()}
          >
            {action}
          </div>
        )}
      </div>
    </div>
  );
};

export default VenueCard;
