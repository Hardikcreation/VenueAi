import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Context
import { AuthProvider, AuthContext } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

// Layout Components
import Header from './context/Header';
import Footer from './components/Footer';

// Public Pages
import Home from './pages/Home';
import Services from './pages/Services';
import About from './pages/About';
import Login from './pages/Login';
import Signup from './pages/Signup';
import VenueDetails from './pages/VenueDetails';

// User Pages
import UserBookings from './pages/UserBookings';

// Admin
import AdminDashboard from './pages/AdminDashboard';

// ✅ Vendor Modular Pages
import VendorLayout from './pages/vendor/VendorLayout';
import VendorHome from './pages/vendor/VendorHome';
import VendorDashboard from './pages/vendor/VendorDashboard';
import VendorBookings from './pages/vendor/VendorBookings';
import VendorVenue from './pages/vendor/VendorVenue';
import VendorImages from './pages/vendor/VendorImages';
import VendorVerification from './pages/vendor/VendorVerification';
import VendorAnalytics from './pages/vendor/VendorAnalytics';

// 🔐 Protected Route
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

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <div className="flex flex-col min-h-screen">
            
            <Header />

            <main className="flex-grow">
              <Routes>

              {/* 🌐 Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/services" element={<Services />} />
              <Route path="/about" element={<About />} />
              <Route path="/venues/:id" element={<VenueDetails />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />

              {/* 👤 User Routes */}
              <Route 
                path="/my-bookings" 
                element={
                  <ProtectedRoute allowedRoles={['user']}>
                    <UserBookings />
                  </ProtectedRoute>
                } 
              />

              {/* 🧑‍💼 Vendor Routes (Nested Modular) */}
              <Route 
                path="/vendor" 
                element={
                  <ProtectedRoute allowedRoles={['vendor']}>
                    <VendorLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<VendorHome />} />
                <Route path="dashboard" element={<VendorDashboard />} />
                <Route path="bookings" element={<VendorBookings />} />
                <Route path="venue" element={<VendorVenue />} />
                <Route path="images" element={<VendorImages />} />
                <Route path="verification" element={<VendorVerification />} />
                <Route path="analytics" element={<VendorAnalytics />} />
              </Route>

              {/* 🛠 Admin Routes */}
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />

              {/* ❌ Fallback Route */}
              <Route path="*" element={<Navigate to="/" />} />

              </Routes>
            </main>

            <Footer />

          </div>
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
