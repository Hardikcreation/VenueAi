import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Building2, Calendar, Image, ShieldCheck } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useToast } from '../../context/ToastContext';
import { vendorAPI } from '../../services/api';
import { getErrorMessage } from '../../utils/errors';

const cards = [
    {
        title: 'Dashboard',
        desc: 'View analytics and performance',
        path: 'dashboard',
        icon: LayoutDashboard,
    },
    {
        title: 'My Venue',
        desc: 'Manage venue details',
        path: 'venue',
        icon: Building2,
    },
    {
        title: 'Bookings',
        desc: 'Track all bookings',
        path: 'bookings',
        icon: Calendar,
    },
    {
        title: 'Images',
        desc: 'Upload and manage images',
        path: 'images',
        icon: Image,
    },
    {
        title: 'Verification',
        desc: 'Complete verification process',
        path: 'verification',
        icon: ShieldCheck,
    },
];

const getApprovalLabel = (profile) => {
    if (profile?.approved && profile?.venue_status === 'approved') {
        return 'Approved';
    }

    if (profile?.venue_status === 'rejected') {
        return 'Rejected';
    }

    return 'Pending';
};

const VendorHome = () => {
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { showToast } = useToast();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await vendorAPI.getProfile();
                setProfile(res);
                setError('');
            } catch (error) {
                console.error('Failed to fetch profile', error);
                const message = getErrorMessage(error, 'Failed to fetch vendor profile');
                setError(message);
                showToast(message, 'error');
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
                <p className="text-gray-600">{profile?.business_name || 'Vendor'}, manage your venue easily</p>
            </div>

            {error && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">{error}</div>}

            {!loading && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <h3 className="text-sm text-blue-800 font-semibold mb-1">Business Name</h3>
                        <p className="text-lg font-bold text-blue-900">{profile?.business_name || 'Not set'}</p>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <h3 className="text-sm text-green-800 font-semibold mb-1">Approval Status</h3>
                        <p className="text-lg font-bold">{getApprovalLabel(profile)}</p>
                    </div>

                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                        <h3 className="text-sm text-purple-800 font-semibold mb-1">Account Status</h3>
                        <p className="text-lg font-bold">Active</p>
                    </div>
                </div>
            )}

            <div className="mb-6">
                <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
                <p className="text-gray-500 mb-4">Navigate to different sections</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {cards.map((card) => {
                    const Icon = card.icon;

                    return (
                        <div
                            key={card.title}
                            onClick={() => navigate(card.path)}
                            className="cursor-pointer bg-white p-6 rounded-lg shadow hover:shadow-lg transition group border border-gray-200"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <Icon className="text-blue-600 group-hover:scale-110 transition" size={24} />
                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Open</span>
                            </div>

                            <h3 className="text-lg font-semibold text-gray-800">{card.title}</h3>
                            <p className="text-sm text-gray-500 mt-2">{card.desc}</p>
                        </div>
                    );
                })}
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
                <h2 className="text-lg font-bold text-gray-800 mb-4">Getting Started Tips</h2>
                <ul className="space-y-2 text-gray-700">
                    <li>Complete your profile and add business details</li>
                    <li>Add your venue with all required information</li>
                    <li>Upload high-quality venue images</li>
                    <li>Submit verification documents</li>
                    <li>Wait for admin approval to go live</li>
                </ul>
            </div>
        </div>
    );
};

export default VendorHome;
