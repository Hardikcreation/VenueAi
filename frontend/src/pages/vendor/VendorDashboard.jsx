import React, { useEffect, useState } from 'react';
import VendorStats from '../../components/vendor/StatsCards';
import { useToast } from '../../context/ToastContext';
import { vendorAPI } from '../../services/api';
import { getErrorMessage } from '../../utils/errors';

const VendorDashboard = () => {
    const [data, setData] = useState({
        bookings: [],
        venue: null
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { showToast } = useToast();

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const venue = await vendorAPI.getMyVenue();
                const bookingsResponse = await vendorAPI.getBookingRequests();
                
                // Handle both direct array and response object with data property
                const bookings = Array.isArray(bookingsResponse) 
                    ? bookingsResponse 
                    : (bookingsResponse?.data || []);

                setData({ venue, bookings: bookings || [] });
                setError('');
            } catch (error) {
                console.error('Failed to fetch dashboard data', error);
                setData({ venue: null, bookings: [] });
                const message = getErrorMessage(error, 'Failed to fetch dashboard data');
                setError(message);
                showToast(message, 'error');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return <div className="text-center py-8">Loading dashboard...</div>;
    }

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
            {error && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">{error}</div>}

            <VendorStats data={data} />

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8">
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-sm text-gray-500 mb-2">Total Bookings</h3>
                    <p className="text-3xl font-bold">{data?.bookings?.length || 0}</p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-sm text-gray-500 mb-2">Venue Status</h3>
                    <p className="text-lg font-semibold">{data?.venue ? '✓ Added' : '✗ Not Added'}</p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-sm text-gray-500 mb-2">Approval Status</h3>
                    <p className="text-lg font-semibold">⏳ Pending</p>
                </div>
            </div>

            {/* Future Graph Section */}
            <div className="mt-10 bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold">Analytics (Coming Soon)</h2>
                <p className="text-gray-500 mt-2">Detailed analytics and reports will be available here.</p>
            </div>
        </div>
    );
};

export default VendorDashboard;
