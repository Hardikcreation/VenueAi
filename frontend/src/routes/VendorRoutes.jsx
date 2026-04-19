import React from 'react';
import { Routes, Route } from 'react-router-dom';

import VendorLayout from '../pages/vendor/VendorLayout';
import VendorHome from '../pages/vendor/VendorHome';
import VendorDashboard from '../pages/vendor/VendorDashboard';
import VendorVenue from '../pages/vendor/VendorVenue';
import VendorImages from '../pages/vendor/VendorImages';
import VendorBookings from '../pages/vendor/VendorBookings';
import VendorVerification from '../pages/vendor/VendorVerification';

const VendorRoutes = () => {
    return (
        <Routes>
            <Route element={<VendorLayout />}>
                <Route index element={<VendorHome />} />
                <Route path="dashboard" element={<VendorDashboard />} />
                <Route path="venue" element={<VendorVenue />} />
                <Route path="images" element={<VendorImages />} />
                <Route path="bookings" element={<VendorBookings />} />
                <Route path="verification" element={<VendorVerification />} />
            </Route>
        </Routes>
    );
};

export default VendorRoutes;