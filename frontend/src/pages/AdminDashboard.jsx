import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Building2, MapPin, Clock, Check, X, Trash2 } from 'lucide-react';
import { adminAPI, productAPI } from '../services/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [products, setProducts] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, usersRes, vendorsRes, productsRes] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getAllUsers(),
        adminAPI.getAllVendors(),
        productAPI.getAll({})
      ]);
      setStats(statsRes);
      setUsers(usersRes);
      setVendors(vendorsRes);
      setProducts(productsRes);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (productId, status) => {
    try {
      await adminAPI.updateProductStatus(productId, status);
      fetchData();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await adminAPI.deleteUser(userId);
        fetchData();
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  const statCards = [
    { label: 'Total Users', value: stats.users || 0, icon: Users, color: 'bg-blue-500' },
    { label: 'Total Vendors', value: stats.vendors || 0, icon: Building2, color: 'bg-green-500' },
    { label: 'Total Venues', value: stats.products || 0, icon: MapPin, color: 'bg-purple-500' },
    { label: 'Pending Approval', value: stats.pending || 0, icon: Clock, color: 'bg-yellow-500' },
  ];

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center" data-testid="loading-indicator">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-[#FAFAF9]" data-testid="admin-dashboard">
      <div className="bg-[#1C1917] text-white py-12">
        <div className="px-6 md:px-8">
          <h1 className="font-heading text-4xl tracking-tight mb-2" data-testid="dashboard-heading">Admin Dashboard</h1>
          <p className="text-stone-300">Manage users, vendors, and listings</p>
        </div>
      </div>

      <div className="px-6 md:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white border border-stone-200 rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] p-6"
              data-testid={`stat-card-${idx}`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.color} p-3 rounded-lg text-white`}>
                  <stat.icon size={24} />
                </div>
                <span className="text-3xl font-heading font-medium" data-testid="stat-value">{stat.value}</span>
              </div>
              <p className="text-xs tracking-[0.2em] uppercase font-bold text-[#57534E]" data-testid="stat-label">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
          <div className="flex border-b border-stone-200">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'overview' ? 'bg-[#1C1917] text-white' : 'text-[#57534E] hover:bg-stone-50'
              }`}
              data-testid="tab-overview"
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('venues')}
              className={`px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'venues' ? 'bg-[#1C1917] text-white' : 'text-[#57534E] hover:bg-stone-50'
              }`}
              data-testid="tab-venues"
            >
              Manage Venues
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'users' ? 'bg-[#1C1917] text-white' : 'text-[#57534E] hover:bg-stone-50'
              }`}
              data-testid="tab-users"
            >
              Manage Users
            </button>
            <button
              onClick={() => setActiveTab('vendors')}
              className={`px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'vendors' ? 'bg-[#1C1917] text-white' : 'text-[#57534E] hover:bg-stone-50'
              }`}
              data-testid="tab-vendors"
            >
              Manage Vendors
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div data-testid="overview-tab">
                <h2 className="font-heading text-2xl mb-4">System Overview</h2>
                <p className="text-[#57534E]">Welcome to the admin dashboard. Use the tabs above to manage different aspects of the platform.</p>
              </div>
            )}

            {activeTab === 'venues' && (
              <div data-testid="venues-tab">
                <h2 className="font-heading text-2xl mb-6">Venue Listings</h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-stone-200">
                        <th className="text-left py-3 px-4 text-xs tracking-[0.2em] uppercase font-bold">Title</th>
                        <th className="text-left py-3 px-4 text-xs tracking-[0.2em] uppercase font-bold">Vendor</th>
                        <th className="text-left py-3 px-4 text-xs tracking-[0.2em] uppercase font-bold">Status</th>
                        <th className="text-left py-3 px-4 text-xs tracking-[0.2em] uppercase font-bold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((product) => (
                        <tr key={product.id} className="border-b border-stone-100 hover:bg-stone-50" data-testid="venue-row">
                          <td className="py-3 px-4" data-testid="venue-title">{product.title}</td>
                          <td className="py-3 px-4 text-sm text-[#57534E]" data-testid="venue-vendor">{product.business_name}</td>
                          <td className="py-3 px-4">
                            <span className={`text-xs px-3 py-1 rounded-full ${
                              product.status === 'approved' ? 'bg-[#DCFCE7] text-[#166534]' :
                              product.status === 'pending' ? 'bg-[#FEF9C3] text-[#854D0E]' :
                              'bg-[#FEE2E2] text-[#991B1B]'
                            }`} data-testid="venue-status">
                              {product.status}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleStatusUpdate(product.id, 'approved')}
                                className="p-2 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                                title="Approve"
                                data-testid="approve-btn"
                              >
                                <Check size={16} />
                              </button>
                              <button
                                onClick={() => handleStatusUpdate(product.id, 'rejected')}
                                className="p-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                                title="Reject"
                                data-testid="reject-btn"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div data-testid="users-tab">
                <h2 className="font-heading text-2xl mb-6">User Management</h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-stone-200">
                        <th className="text-left py-3 px-4 text-xs tracking-[0.2em] uppercase font-bold">Name</th>
                        <th className="text-left py-3 px-4 text-xs tracking-[0.2em] uppercase font-bold">Email</th>
                        <th className="text-left py-3 px-4 text-xs tracking-[0.2em] uppercase font-bold">Role</th>
                        <th className="text-left py-3 px-4 text-xs tracking-[0.2em] uppercase font-bold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.id} className="border-b border-stone-100 hover:bg-stone-50" data-testid="user-row">
                          <td className="py-3 px-4" data-testid="user-name">{user.name}</td>
                          <td className="py-3 px-4 text-sm text-[#57534E]" data-testid="user-email">{user.email}</td>
                          <td className="py-3 px-4">
                            <span className="text-xs px-3 py-1 rounded-full bg-stone-200 text-stone-700" data-testid="user-role">
                              {user.role}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            {user.role !== 'admin' && (
                              <button
                                onClick={() => handleDeleteUser(user.id)}
                                className="p-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                                title="Delete"
                                data-testid="delete-user-btn"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'vendors' && (
              <div data-testid="vendors-tab">
                <h2 className="font-heading text-2xl mb-6">Vendor Management</h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-stone-200">
                        <th className="text-left py-3 px-4 text-xs tracking-[0.2em] uppercase font-bold">Business Name</th>
                        <th className="text-left py-3 px-4 text-xs tracking-[0.2em] uppercase font-bold">Owner Name</th>
                        <th className="text-left py-3 px-4 text-xs tracking-[0.2em] uppercase font-bold">Email</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vendors.map((vendor) => (
                        <tr key={vendor.id} className="border-b border-stone-100 hover:bg-stone-50" data-testid="vendor-row">
                          <td className="py-3 px-4" data-testid="vendor-business">{vendor.business_name}</td>
                          <td className="py-3 px-4 text-sm text-[#57534E]" data-testid="vendor-name">{vendor.name}</td>
                          <td className="py-3 px-4 text-sm text-[#57534E]" data-testid="vendor-email">{vendor.email}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;