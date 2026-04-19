import React, { useEffect, useState } from 'react';
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
            const res = await vendorAPI.getMyVenue();
            setVenue(res);
            setError('');
        } catch (error) {
            console.error('Failed to fetch venue details', error);
            setVenue(null);
            const message = getErrorMessage(error, 'Failed to fetch venue details');
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
        return <div className="p-6 text-center">Loading venue details...</div>;
    }

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-3xl font-bold mb-2">My Venue</h1>
                <p className="text-gray-600">Manage your venue details and information</p>
            </div>

            {error && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">{error}</div>}

            {venue && !editMode ? (
                <div className="bg-white p-6 rounded-lg shadow mb-6 border border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <h3 className="text-sm text-gray-500 font-semibold mb-2">Venue Title</h3>
                            <p className="text-lg font-semibold text-gray-800">{venue.title}</p>
                        </div>

                        <div>
                            <h3 className="text-sm text-gray-500 font-semibold mb-2">Category</h3>
                            <p className="text-lg font-semibold text-gray-800">{venue.category || 'N/A'}</p>
                        </div>

                        <div>
                            <h3 className="text-sm text-gray-500 font-semibold mb-2">Location</h3>
                            <p className="text-lg font-semibold text-gray-800">{venue.location}</p>
                        </div>

                        <div>
                            <h3 className="text-sm text-gray-500 font-semibold mb-2">Price</h3>
                            <p className="text-lg font-semibold text-gray-800">₹ {venue.price}</p>
                        </div>

                        <div>
                            <h3 className="text-sm text-gray-500 font-semibold mb-2">Capacity</h3>
                            <p className="text-lg font-semibold text-gray-800">{venue.capacity || 'N/A'} guests</p>
                        </div>

                        <div>
                            <h3 className="text-sm text-gray-500 font-semibold mb-2">Zone</h3>
                            <p className="text-lg font-semibold text-gray-800">{venue.zone || 'N/A'}</p>
                        </div>

                        <div>
                            <h3 className="text-sm text-gray-500 font-semibold mb-2">Landmark</h3>
                            <p className="text-lg font-semibold text-gray-800">{venue.landmark || 'N/A'}</p>
                        </div>

                        <div>
                            <h3 className="text-sm text-gray-500 font-semibold mb-2">Status</h3>
                            <p className={`text-lg font-semibold ${venue.status === 'approved' ? 'text-green-600' : venue.status === 'pending' ? 'text-yellow-600' : 'text-red-600'}`}>
                                {venue.status ? venue.status.charAt(0).toUpperCase() + venue.status.slice(1) : 'N/A'}
                            </p>
                        </div>
                    </div>

                    <div className="mb-6">
                        <h3 className="text-sm text-gray-500 font-semibold mb-2">Description</h3>
                        <p className="text-gray-700 whitespace-pre-wrap">{venue.description}</p>
                    </div>

                    <button
                        onClick={() => setEditMode(true)}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                        Edit Venue Details
                    </button>
                </div>
            ) : editMode ? (
                <>
                    <VenueForm venue={venue} refresh={handleSuccess} />
                    <button
                        onClick={() => setEditMode(false)}
                        className="mt-4 px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
                    >
                        Cancel
                    </button>
                </>
            ) : (
                <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                    <p className="text-gray-600 mb-4">No venue added yet. Let's add your first venue!</p>
                    <VenueForm venue={null} refresh={handleSuccess} />
                </div>
            )}
        </div>
    );
};

export default VendorVenue;
