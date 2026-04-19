import React from 'react';
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
            const message = getErrorMessage(error, `Failed to mark booking as ${status}`);
            showToast(message, 'error');
        }
    };

    return (
        <div className="border p-4 rounded-xl mb-4 bg-white">
            <h3 className="font-bold">{booking.title}</h3>
            <p className="text-sm text-gray-600">{booking.booking_name || booking.user?.name || 'Guest user'}</p>
            <p className="text-sm text-gray-500 mt-1">
                {booking.event_date?.slice(0, 10) || 'Date pending'} {booking.event_time ? `| ${booking.event_time.slice(0, 5)}` : ''}
            </p>

            <div className="flex gap-3 mt-3">
                <button
                    type="button"
                    onClick={() => update('accepted')}
                    className="rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700"
                >
                    Accept
                </button>
                <button
                    type="button"
                    onClick={() => update('rejected')}
                    className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
                >
                    Reject
                </button>
            </div>
        </div>
    );
};

export default BookingCard;
