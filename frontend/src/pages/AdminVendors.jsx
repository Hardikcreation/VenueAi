import React, { useEffect, useState } from 'react';
import { adminAPI } from '../../services/api';

const AdminVendors = () => {
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, approved, unapproved

    const fetchVendors = async () => {
        try {
            setLoading(true);
            const res = await adminAPI.getAllVendors();
            setVendors(res || []);
        } catch (error) {
            console.error('Failed to fetch vendors', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVendors();
    }, []);

    const handleApprove = async (vendorId) => {
        try {
            await adminAPI.approveVendor(vendorId);
            alert('Vendor approved successfully!');
            fetchVendors();
        } catch (error) {
            console.error('Failed to approve vendor', error);
            alert('Failed to approve vendor.');
        }
    };

    const handleReject = async (vendorId) => {
        try {
            await adminAPI.rejectVendor(vendorId);
            alert('Vendor rejected!');
            fetchVendors();
        } catch (error) {
            console.error('Failed to reject vendor', error);
            alert('Failed to reject vendor.');
        }
    };

    const filteredVendors = vendors.filter(vendor => {
        if (filter === 'approved') return vendor.approved;
        if (filter === 'unapproved') return !vendor.approved;
        return true;
    });

    if (loading) {
        return <div className="p-6 text-center">Loading vendors...</div>;
    }

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6">Vendor Management</h1>

            <div className="flex gap-4 mb-6">
                <button
                    onClick={() => setFilter('all')}
                    className={`px-4 py-2 rounded ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                >
                    All Vendors
                </button>
                <button
                    onClick={() => setFilter('approved')}
                    className={`px-4 py-2 rounded ${filter === 'approved' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}
                >
                    Approved
                </button>
                <button
                    onClick={() => setFilter('unapproved')}
                    className={`px-4 py-2 rounded ${filter === 'unapproved' ? 'bg-yellow-600 text-white' : 'bg-gray-200'}`}
                >
                    Unapproved
                </button>
            </div>

            {filteredVendors.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                    {filteredVendors.map((vendor) => (
                        <div key={vendor._id} className="bg-white p-6 rounded-lg shadow border border-gray-200">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-lg font-semibold">{vendor.business_name || 'N/A'}</h3>
                                    <p className="text-gray-600 text-sm">{vendor.phone || 'N/A'}</p>
                                </div>
                                <span className={`px-3 py-1 rounded text-white text-sm font-semibold ${
                                    vendor.approved ? 'bg-green-500' : 'bg-yellow-500'
                                }`}>
                                    {vendor.approved ? '✓ Approved' : '⏳ Pending'}
                                </span>
                            </div>

                            <p className="text-gray-700 mb-4">{vendor.address || 'N/A'}</p>

                            <div className="flex gap-2">
                                {!vendor.approved && (
                                    <>
                                        <button
                                            onClick={() => handleApprove(vendor._id)}
                                            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                                        >
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => handleReject(vendor._id)}
                                            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                                        >
                                            Reject
                                        </button>
                                    </>
                                )}
                                {vendor.approved && (
                                    <button
                                        onClick={() => handleReject(vendor._id)}
                                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                                    >
                                        Revoke Approval
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <p className="text-gray-500">No vendors found.</p>
                </div>
            )}
        </div>
    );
};

export default AdminVendors;