import React, { useEffect, useState } from 'react';
import { bookingAPI } from '../services/api';
import { useToast } from '../context/ToastContext';
import { getErrorMessage } from '../utils/errors';

const statusStyles = {
  pending: 'bg-[#FEF9C3] text-[#854D0E]',
  accepted: 'bg-[#DCFCE7] text-[#166534]',
  rejected: 'bg-[#FEE2E2] text-[#991B1B]',
  completed: 'bg-[#DBEAFE] text-[#1D4ED8]'
};

const UserBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { showToast } = useToast();

  useEffect(() => {
    const loadBookings = async () => {
      try {
        const response = await bookingAPI.getMyBookings();
        setBookings(Array.isArray(response) ? response : []);
        setError('');
      } catch (error) {
        console.error('Error fetching user bookings:', error);
        const message = getErrorMessage(error, 'Unable to load your bookings right now.');
        setError(message);
        showToast(message, 'error');
      } finally {
        setLoading(false);
      }
    };

    loadBookings();
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading your bookings...</div>;
  }

  return (
    <div className="min-h-screen bg-[#F8F7F4]">
      <div className="bg-[#1C1917] text-white py-12">
        <div className="px-6 md:px-12 lg:px-24">
          <h1 className="font-heading text-4xl tracking-tight mb-2">My Booking Requests</h1>
          <p className="text-stone-300">Track the status of every venue request you have sent.</p>
        </div>
      </div>

      <div className="px-6 md:px-12 lg:px-24 py-10">
        {error && (
          <div className="bg-[#FEE2E2] text-[#991B1B] border border-[#FCA5A5] rounded-2xl p-4 mb-6">
            {error}
          </div>
        )}
        {bookings.length === 0 ? (
          <div className="bg-white rounded-2xl border border-stone-200 p-8 text-center text-[#57534E]">
            You have not sent any booking requests yet.
          </div>
        ) : (
          <div className="grid gap-6">
            {bookings.map((booking) => (
              <div key={booking.id} className="bg-white rounded-2xl border border-stone-200 p-6">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div>
                    <h2 className="font-heading text-2xl">{booking.title}</h2>
                    <p className="text-sm text-[#57534E] mt-1">
                      {booking.business_name} {booking.venue?.location ? `| ${booking.venue.location}` : ''}
                    </p>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full ${statusStyles[booking.status] || 'bg-stone-200 text-stone-700'}`}>
                    {booking.status}
                  </span>
                </div>

                <div className="grid md:grid-cols-3 gap-4 mt-6 text-sm text-[#57534E]">
                  <div>Event date: <span className="font-medium text-[#1C1917]">{booking.event_date?.slice(0, 10)}</span></div>
                  <div>Time: <span className="font-medium text-[#1C1917]">{booking.event_time?.slice(0, 5) || 'Not shared'}</span></div>
                  <div>Guests: <span className="font-medium text-[#1C1917]">{booking.guest_count || 'Not shared'}</span></div>
                  <div>Occasion: <span className="font-medium text-[#1C1917]">{booking.occasion_type || 'Custom event'}</span></div>
                  <div>Payment: <span className="font-medium text-[#1C1917]">{booking.payment_method === 'on_visit' ? 'Pay on visit' : booking.payment_method}</span></div>
                  <div>Payment status: <span className="font-medium text-[#1C1917]">{booking.payment_status || 'pending'}</span></div>
                </div>

                {Array.isArray(booking.selected_services) && booking.selected_services.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {booking.selected_services.map((service) => (
                      <span key={service} className="text-xs px-3 py-1 rounded-full bg-[#EFF6FF] text-[#1D4ED8]">
                        {service}
                      </span>
                    ))}
                  </div>
                )}

                {booking.message && (
                  <p className="mt-4 text-sm leading-relaxed text-[#57534E]">{booking.message}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserBookings;
