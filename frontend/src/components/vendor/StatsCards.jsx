import React from 'react';

const VendorStats = ({ data }) => {
    // Handle both array and object with data property
    let bookings = data?.bookings || [];
    if (bookings && typeof bookings === 'object' && !Array.isArray(bookings)) {
        bookings = bookings.data || [];
    }
    bookings = Array.isArray(bookings) ? bookings : [];

    const stats = {
        total: bookings.length,
        pending: bookings.filter(b => b && b.status === 'pending').length,
        accepted: bookings.filter(b => b && b.status === 'accepted').length
    };

    return (
        <div className="grid grid-cols-3 gap-6">
            <div className="card">Total: {stats.total}</div>
            <div className="card">Pending: {stats.pending}</div>
            <div className="card">Accepted: {stats.accepted}</div>
        </div>
    );
};

export default VendorStats;