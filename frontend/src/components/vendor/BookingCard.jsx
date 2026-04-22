import React from 'react';
import { CalendarDays, CheckCircle2, UserCircle2, XCircle } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { vendorAPI } from '../../services/api';
import { getErrorMessage } from '../../utils/errors';

const BookingCard = ({ booking, refresh }) => {
  const { showToast } = useToast();

  const update = async (status) => {
    try {
      const id = booking._id || booking.id;
      await vendorAPI.updateBookingStatus(id, status);
      showToast(`Booking ${status} successfully.`, 'success');
      refresh();
    } catch (error) {
      showToast(getErrorMessage(error, `Failed to mark booking as ${status}`), 'error');
    }
  };

  return (
    <div className="rounded-[28px] bg-white p-5 shadow-[0_18px_45px_rgba(109,40,217,0.08)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-extrabold text-[#22103D]">{booking.title}</h3>
          <p className="mt-1 flex items-center gap-2 text-sm text-[#7D6F95]">
            <UserCircle2 className="h-4 w-4" />
            {booking.booking_name || booking.user?.name || 'Guest user'}
          </p>
        </div>
        <div className="rounded-full bg-[#F3E8FF] px-3 py-1 text-xs font-bold text-[#6D28D9]">
          {booking.status || 'pending'}
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 text-sm text-[#5C5174]">
        <CalendarDays className="h-4 w-4 text-[#8B5CF6]" />
        <span>{booking.event_date?.slice(0, 10) || 'Date pending'}</span>
      </div>

      {booking.message && <p className="mt-4 text-sm leading-6 text-[#6F6289]">{booking.message}</p>}

      <div className="mt-5 flex gap-3">
        <button
          type="button"
          onClick={() => update('accepted')}
          className="inline-flex items-center gap-2 rounded-full bg-[#16A34A] px-4 py-2 text-sm font-semibold text-white"
        >
          <CheckCircle2 className="h-4 w-4" />
          Accept
        </button>
        <button
          type="button"
          onClick={() => update('rejected')}
          className="inline-flex items-center gap-2 rounded-full bg-[#DC2626] px-4 py-2 text-sm font-semibold text-white"
        >
          <XCircle className="h-4 w-4" />
          Reject
        </button>
      </div>
    </div>
  );
};

export default BookingCard;
