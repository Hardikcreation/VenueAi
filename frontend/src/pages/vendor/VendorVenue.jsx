import React, { useEffect, useState } from 'react';
import { PencilLine, Store } from 'lucide-react';
import { vendorAPI } from '../../services/api';
import VenueForm from '../../components/vendor/VenueForm';
import { useToast } from '../../context/ToastContext';
import { getErrorMessage } from '../../utils/errors';

const VendorVenue = () => {
  const [venue, setVenue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [error, setError] = useState('');
  const { showToast } = useToast();

  const fetchVenue = async () => {
    try {
      setLoading(true);
      const response = await vendorAPI.getMyVenue();
      setVenue(response);
      setError('');
    } catch (err) {
      setVenue(null);
      const message = getErrorMessage(err, 'Failed to fetch listing details');
      setError(message);
      showToast(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVenue();
  }, []);

  const handleSuccess = () => {
    setEditMode(false);
    fetchVenue();
  };

  if (loading) {
    return <div className="rounded-[28px] bg-white p-6 text-center shadow-[0_18px_45px_rgba(109,40,217,0.08)]">Loading your listing...</div>;
  }

  return (
    <div className="space-y-5">
      <div className="rounded-[30px] bg-white p-6 shadow-[0_18px_45px_rgba(109,40,217,0.08)]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#A293BB]">Listing Studio</p>
            <h1 className="mt-1 text-3xl font-extrabold text-[#22103D]">Manage your storefront listing</h1>
            <p className="mt-2 text-sm text-[#7D6F95]">Keep your category, price, tag label and occasion focus aligned with the new marketplace design.</p>
          </div>
          {venue && !editMode && (
            <button
              type="button"
              onClick={() => setEditMode(true)}
              className="inline-flex items-center gap-2 rounded-full bg-[#6D28D9] px-5 py-3 text-sm font-semibold text-white"
            >
              <PencilLine className="h-4 w-4" />
              Edit Listing
            </button>
          )}
        </div>
      </div>

      {error && <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      {venue && !editMode ? (
        <div className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              ['Category', venue.category || 'N/A'],
              ['Price', venue.price ? `₹${Number(venue.price).toLocaleString('en-IN')}` : 'N/A'],
              ['Price Unit', venue.price_unit || 'Starting Price'],
              ['Budget Tier', venue.budget_tier || 'mid'],
              ['Location', venue.location || 'N/A'],
              ['Tag Label', venue.tag_label || 'N/A'],
              ['Availability', venue.available_today ? 'Available today' : 'Date based'],
              ['Status', venue.status ? venue.status.charAt(0).toUpperCase() + venue.status.slice(1) : 'N/A'],
            ].map(([label, value]) => (
              <div key={label} className="rounded-[24px] bg-white p-5 shadow-[0_18px_45px_rgba(109,40,217,0.08)]">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#A293BB]">{label}</p>
                <p className="mt-3 text-base font-bold text-[#22103D]">{value}</p>
              </div>
            ))}
          </div>

          <div className="rounded-[28px] bg-white p-6 shadow-[0_18px_45px_rgba(109,40,217,0.08)]">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F3E8FF] text-[#7C3AED]">
                <Store className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#22103D]">{venue.title}</h2>
                <p className="text-sm text-[#7D6F95]">{venue.service_area || venue.zone || 'Bhopal'}</p>
              </div>
            </div>

            <p className="whitespace-pre-wrap text-sm leading-7 text-[#5C5174]">{venue.description || 'No description yet.'}</p>
          </div>
        </div>
      ) : editMode ? (
        <div className="space-y-4">
          <VenueForm venue={venue} refresh={handleSuccess} />
          <button
            type="button"
            onClick={() => setEditMode(false)}
            className="rounded-full bg-[#EDE9FE] px-5 py-3 text-sm font-semibold text-[#5B21B6]"
          >
            Cancel
          </button>
        </div>
      ) : (
        <div className="rounded-[30px] bg-white p-6 shadow-[0_18px_45px_rgba(109,40,217,0.08)]">
          <p className="mb-4 text-sm text-[#7D6F95]">No listing exists yet. Create the first one using the new marketplace-friendly structure.</p>
          <VenueForm venue={null} refresh={handleSuccess} />
        </div>
      )}
    </div>
  );
};

export default VendorVenue;
