import React, { useEffect, useState } from 'react';
import { vendorAPI } from '../../services/api';
import BookingCard from '../../components/vendor/BookingCard';
import { useToast } from '../../context/ToastContext';
import { getErrorMessage } from '../../utils/errors';

const VendorBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { showToast } = useToast();

    const fetch = async () => {
        try {
            setLoading(true);
            const res = await vendorAPI.getBookingRequests();
            setBookings(res || []);
            setError('');
        } catch (error) {
            console.error('Failed to fetch bookings', error);
            const message = getErrorMessage(error, 'Failed to fetch bookings');
            setError(message);
            showToast(message, 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetch();
    }, []);

    return (
        <div>
            <h1 className="text-3xl font-bold mb-2">Bookings</h1>
            <p className="text-gray-600 mb-6">Manage all your booking requests</p>
            {error && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">{error}</div>}

            {loading ? (
                <div className="text-center py-8">Loading bookings...</div>
            ) : bookings.length > 0 ? (
                <div className="space-y-4">
                    {bookings.map(b => (
                        <BookingCard key={b._id || b.id} booking={b} refresh={fetch} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <p className="text-gray-500">No bookings yet. Your bookings will appear here.</p>
                </div>
            )}
        </div>
    );
};

export default VendorBookings;
