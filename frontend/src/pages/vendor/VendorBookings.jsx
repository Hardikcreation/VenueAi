import React, { useEffect, useState } from 'react';
import BookingCard from '../../components/vendor/BookingCard';
import { vendorAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { getErrorMessage } from '../../utils/errors';

const VendorBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { showToast } = useToast();

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await vendorAPI.getBookingRequests();
      setBookings(response || []);
      setError('');
    } catch (err) {
      const message = getErrorMessage(err, 'Failed to fetch bookings');
      setError(message);
      showToast(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  return (
    <div className="space-y-5">
      <div className="rounded-[30px] bg-white p-6 shadow-[0_18px_45px_rgba(109,40,217,0.08)]">
        <h1 className="text-3xl font-extrabold text-[#22103D]">Booking Requests</h1>
        <p className="mt-2 text-sm text-[#7D6F95]">Stay responsive and keep conversion high by acting quickly on incoming leads.</p>
      </div>

      {error && <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      {loading ? (
        <div className="rounded-[28px] bg-white p-6 text-center shadow-[0_18px_45px_rgba(109,40,217,0.08)]">Loading bookings...</div>
      ) : bookings.length > 0 ? (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <BookingCard key={booking._id || booking.id} booking={booking} refresh={fetchBookings} />
          ))}
        </div>
      ) : (
        <div className="rounded-[28px] bg-white p-8 text-center text-sm text-[#7D6F95] shadow-[0_18px_45px_rgba(109,40,217,0.08)]">
          No bookings yet. As soon as users start exploring your listing, requests will appear here.
        </div>
      )}
    </div>
  );
};

export default VendorBookings;
