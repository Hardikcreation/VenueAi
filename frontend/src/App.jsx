import React from 'react';
import { BrowserRouter as Router, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Header from './context/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Services from './pages/Services';
import About from './pages/About';
import Login from './pages/Login';
import Signup from './pages/Signup';
import VenueDetails from './pages/VenueDetails';
import UserBookings from './pages/UserBookings';
import AdminDashboard from './pages/AdminDashboard';
import Wishlist from './pages/Wishlist';
import Profile from './pages/Profile';
import VendorLayout from './pages/vendor/VendorLayout';
import VendorHome from './pages/vendor/VendorHome';
import VendorDashboard from './pages/vendor/VendorDashboard';
import VendorBookings from './pages/vendor/VendorBookings';
import VendorVenue from './pages/vendor/VendorVenue';
import VendorImages from './pages/vendor/VendorImages';
import VendorVerification from './pages/vendor/VendorVerification';
import VendorAnalytics from './pages/vendor/VendorAnalytics';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = React.useContext(AuthContext);

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" />;
  }

  return children;
};

const AppShell = () => {
  const location = useLocation();
  const hideChrome = location.pathname.startsWith('/vendor') || location.pathname.startsWith('/admin');

  return (
    <div className="flex min-h-screen flex-col">
      {!hideChrome && <Header />}

      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<Services />} />
          <Route path="/about" element={<About />} />
          <Route path="/venues/:id" element={<VenueDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/profile" element={<Profile />} />

          <Route
            path="/my-bookings"
            element={(
              <ProtectedRoute allowedRoles={['user']}>
                <UserBookings />
              </ProtectedRoute>
            )}
          />

          <Route
            path="/vendor"
            element={(
              <ProtectedRoute allowedRoles={['vendor']}>
                <VendorLayout />
              </ProtectedRoute>
            )}
          >
            <Route index element={<VendorHome />} />
            <Route path="dashboard" element={<VendorDashboard />} />
            <Route path="bookings" element={<VendorBookings />} />
            <Route path="venue" element={<VendorVenue />} />
            <Route path="images" element={<VendorImages />} />
            <Route path="verification" element={<VendorVerification />} />
            <Route path="analytics" element={<VendorAnalytics />} />
          </Route>

          <Route
            path="/admin"
            element={(
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            )}
          />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>

      {!hideChrome && <Footer />}
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <AppShell />
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
