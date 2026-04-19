import React, { useEffect, useMemo, useState } from 'react';
import {
  Users,
  Building2,
  MapPin,
  Clock,
  Check,
  X,
  Trash2,
  Phone,
  Mail,
  Image as ImageIcon,
  FileText,
  BadgeCheck
} from 'lucide-react';
import { adminAPI } from '../services/api';
import { useToast } from '../context/ToastContext';
import { getErrorMessage } from '../utils/errors';
import { BACKEND_BASE_URL } from '../config/env';

const toAssetUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${BACKEND_BASE_URL}${path}`;
};

const statusBadgeClass = (status) => {
  if (status === 'approved') return 'bg-[#DCFCE7] text-[#166534]';
  if (status === 'rejected') return 'bg-[#FEE2E2] text-[#991B1B]';
  return 'bg-[#FEF9C3] text-[#854D0E]';
};

const AdminDashboard = () => {
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [selectedVendorId, setSelectedVendorId] = useState(null);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState('');
  const { showToast } = useToast();

  const fetchDashboardData = React.useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, vendorsRes] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getAllUsers(),
        adminAPI.getAllVendors()
      ]);

      setStats(statsRes);
      setUsers(usersRes);
      setVendors(vendorsRes);

      if (!selectedVendorId && vendorsRes.length > 0) {
        setSelectedVendorId(vendorsRes[0].id || vendorsRes[0]._id);
      }
      setError('');
    } catch (error) {
      console.error('Error fetching admin data:', error);
      const message = getErrorMessage(error, 'Error fetching admin data');
      setError(message);
      showToast(message, 'error');
    } finally {
      setLoading(false);
    }
  }, [selectedVendorId]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  useEffect(() => {
    if (!selectedVendorId) {
      setSelectedVendor(null);
      return;
    }

    const fetchVendorDetails = async () => {
      setDetailLoading(true);
      try {
        const details = await adminAPI.getVendorDetails(selectedVendorId);
        setSelectedVendor(details);
      } catch (error) {
        console.error('Error fetching vendor details:', error);
        setSelectedVendor(null);
        showToast(getErrorMessage(error, 'Error fetching vendor details'), 'error');
      } finally {
        setDetailLoading(false);
      }
    };

    fetchVendorDetails();
  }, [selectedVendorId]);

  const handleVendorAction = async (vendorId, action) => {
    try {
      if (action === 'approve') {
        await adminAPI.approveVendor(vendorId);
      } else {
        await adminAPI.rejectVendor(vendorId);
      }

      await fetchDashboardData();
      showToast(`Vendor ${action === 'approve' ? 'approved' : 'rejected'} successfully.`, 'success');

      if (selectedVendorId === vendorId) {
        const details = await adminAPI.getVendorDetails(vendorId);
        setSelectedVendor(details);
      }
    } catch (error) {
      console.error(`Error trying to ${action} vendor:`, error);
      showToast(getErrorMessage(error, `Error trying to ${action} vendor`), 'error');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      await adminAPI.deleteUser(userId);
      fetchDashboardData();
      showToast('User deleted successfully.', 'success');
    } catch (error) {
      console.error('Error deleting user:', error);
      showToast(getErrorMessage(error, 'Error deleting user'), 'error');
    }
  };

  const pendingVendors = useMemo(
    () => vendors.filter((vendor) => !vendor.approved || vendor.venue?.status === 'pending'),
    [vendors]
  );

  const statCards = [
    { label: 'Total Users', value: stats.users || 0, icon: Users, color: 'bg-blue-500' },
    { label: 'Total Vendors', value: stats.vendors || 0, icon: Building2, color: 'bg-green-500' },
    { label: 'Total Venues', value: stats.products || 0, icon: MapPin, color: 'bg-purple-500' },
    { label: 'Pending Approval', value: stats.pending || 0, icon: Clock, color: 'bg-yellow-500' },
  ];

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-[#FAFAF9]">
      <div className="bg-[#1C1917] text-white py-12">
        <div className="px-6 md:px-8">
          <h1 className="font-heading text-4xl tracking-tight mb-2">Admin Dashboard</h1>
          <p className="text-stone-300">Approve vendors, review venue submissions, and manage platform access.</p>
        </div>
      </div>

      <div className="px-6 md:px-8 py-8">
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            {error}
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat) => (
            <div
              key={stat.label}
              className="bg-white border border-stone-200 rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.color} p-3 rounded-lg text-white`}>
                  <stat.icon size={24} />
                </div>
                <span className="text-3xl font-heading font-medium">{stat.value}</span>
              </div>
              <p className="text-xs tracking-[0.2em] uppercase font-bold text-[#57534E]">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
          <div className="flex flex-wrap border-b border-stone-200">
            {[
              ['overview', 'Overview'],
              ['vendors', 'Vendor Approval'],
              ['users', 'Manage Users']
            ].map(([key, label]) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`px-6 py-4 text-sm font-medium transition-colors ${
                  activeTab === key ? 'bg-[#1C1917] text-white' : 'text-[#57534E] hover:bg-stone-50'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-heading text-2xl mb-2">Approval Queue</h2>
                  <p className="text-[#57534E]">Vendors waiting for review appear here first, along with their current venue status.</p>
                </div>

                <div className="grid gap-4">
                  {pendingVendors.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-stone-300 bg-stone-50 p-8 text-center text-[#57534E]">
                      No pending vendor submissions right now.
                    </div>
                  ) : (
                    pendingVendors.map((vendor) => (
                      <button
                        key={vendor.id}
                        onClick={() => {
                          setActiveTab('vendors');
                          setSelectedVendorId(vendor.id);
                        }}
                        className="flex items-center justify-between rounded-xl border border-stone-200 p-4 text-left hover:bg-stone-50"
                      >
                        <div>
                          <p className="font-semibold text-[#1C1917]">{vendor.business_name}</p>
                          <p className="text-sm text-[#57534E]">{vendor.user?.email || 'No email available'}</p>
                        </div>
                        <span className={`text-xs px-3 py-1 rounded-full ${statusBadgeClass(vendor.venue?.status)}`}>
                          {vendor.venue?.status || 'No venue yet'}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === 'vendors' && (
              <div className="grid gap-6 lg:grid-cols-[360px,1fr]">
                <div className="border border-stone-200 rounded-xl overflow-hidden">
                  <div className="px-4 py-3 border-b border-stone-200 bg-stone-50">
                    <h2 className="font-heading text-xl">Vendor Submissions</h2>
                  </div>
                  <div className="max-h-[70vh] overflow-y-auto">
                    {vendors.map((vendor) => {
                      const isActive = selectedVendorId === vendor.id;

                      return (
                        <button
                          key={vendor.id}
                          onClick={() => setSelectedVendorId(vendor.id)}
                          className={`w-full px-4 py-4 text-left border-b border-stone-100 transition-colors ${
                            isActive ? 'bg-stone-900 text-white' : 'hover:bg-stone-50'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-semibold">{vendor.business_name}</p>
                              <p className={`text-sm ${isActive ? 'text-stone-300' : 'text-[#57534E]'}`}>
                                {vendor.user?.name || 'Unknown owner'}
                              </p>
                            </div>
                            <span className={`text-[11px] px-2.5 py-1 rounded-full ${isActive ? 'bg-white/15 text-white' : statusBadgeClass(vendor.venue?.status)}`}>
                              {vendor.venue?.status || 'draft'}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="border border-stone-200 rounded-xl p-6 bg-stone-50/50 min-h-[500px]">
                  {detailLoading ? (
                    <div className="h-full flex items-center justify-center text-[#57534E]">Loading vendor review details...</div>
                  ) : !selectedVendor?.vendor ? (
                    <div className="h-full flex items-center justify-center text-[#57534E]">Select a vendor to review their venue and documents.</div>
                  ) : (
                    <div className="space-y-6">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <BadgeCheck className="w-5 h-5 text-emerald-600" />
                            <h2 className="font-heading text-2xl">{selectedVendor.vendor.business_name}</h2>
                          </div>
                          <div className="space-y-1 text-sm text-[#57534E]">
                            <p className="flex items-center gap-2"><Mail className="w-4 h-4" /> {selectedVendor.vendor.user?.email || 'No email'}</p>
                            <p className="flex items-center gap-2"><Phone className="w-4 h-4" /> {selectedVendor.vendor.phone || 'No phone'}</p>
                            <p>{selectedVendor.vendor.address || 'No address added'}</p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <span className={`text-xs px-3 py-1 rounded-full ${selectedVendor.vendor.approved ? 'bg-[#DCFCE7] text-[#166534]' : 'bg-[#FEF9C3] text-[#854D0E]'}`}>
                            {selectedVendor.vendor.approved ? 'Vendor Approved' : 'Vendor Pending'}
                          </span>
                          <span className={`text-xs px-3 py-1 rounded-full ${statusBadgeClass(selectedVendor.venue?.status)}`}>
                            Venue {selectedVendor.venue?.status || 'not submitted'}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-3">
                        <button
                          onClick={() => handleVendorAction(selectedVendor.vendor.id, 'approve')}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700"
                        >
                          <Check size={16} />
                          Approve Vendor
                        </button>
                        <button
                          onClick={() => handleVendorAction(selectedVendor.vendor.id, 'reject')}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
                        >
                          <X size={16} />
                          Reject Vendor
                        </button>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        {[
                          ['Venue Title', selectedVendor.venue?.title || 'Not submitted'],
                          ['Category', selectedVendor.venue?.category || 'Not set'],
                          ['Location', selectedVendor.venue?.location || 'Not set'],
                          ['Price', selectedVendor.venue?.price ? `₹${Number(selectedVendor.venue.price).toLocaleString('en-IN')}` : 'Not set'],
                          ['Capacity', selectedVendor.venue?.capacity ? `${selectedVendor.venue.capacity} guests` : 'Not set'],
                          ['Zone', selectedVendor.venue?.zone || 'Not set'],
                          ['Landmark', selectedVendor.venue?.landmark || 'Not set'],
                          ['Owner', selectedVendor.vendor.user?.name || 'Unknown']
                        ].map(([label, value]) => (
                          <div key={label} className="rounded-xl border border-stone-200 bg-white p-4">
                            <p className="text-xs tracking-[0.15em] uppercase font-bold text-[#78716C] mb-2">{label}</p>
                            <p className="text-sm font-semibold text-[#1C1917]">{value}</p>
                          </div>
                        ))}
                      </div>

                      <div className="rounded-xl border border-stone-200 bg-white p-5">
                        <h3 className="font-heading text-xl mb-3">Venue Description</h3>
                        <p className="text-sm leading-6 text-[#44403C] whitespace-pre-wrap">
                          {selectedVendor.venue?.description || 'No description submitted yet.'}
                        </p>
                      </div>

                      <div className="rounded-xl border border-stone-200 bg-white p-5">
                        <div className="flex items-center gap-2 mb-4">
                          <ImageIcon className="w-5 h-5 text-[#57534E]" />
                          <h3 className="font-heading text-xl">Venue Images</h3>
                        </div>
                        {selectedVendor.images?.length ? (
                          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                            {selectedVendor.images.map((image, index) => (
                              <a
                                key={`${image}-${index}`}
                                href={toAssetUrl(image)}
                                target="_blank"
                                rel="noreferrer"
                                className="group overflow-hidden rounded-xl border border-stone-200 bg-stone-100"
                              >
                                <img
                                  src={toAssetUrl(image)}
                                  alt={`Venue ${index + 1}`}
                                  className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                />
                              </a>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-[#57534E]">No venue images uploaded yet.</p>
                        )}
                      </div>

                      <div className="rounded-xl border border-stone-200 bg-white p-5">
                        <div className="flex items-center gap-2 mb-4">
                          <FileText className="w-5 h-5 text-[#57534E]" />
                          <h3 className="font-heading text-xl">Verification Documents</h3>
                        </div>
                        {selectedVendor.documents?.length ? (
                          <div className="grid gap-3">
                            {selectedVendor.documents.map((doc, index) => (
                              <a
                                key={`${doc.url}-${index}`}
                                href={toAssetUrl(doc.url)}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center justify-between rounded-lg border border-stone-200 px-4 py-3 hover:bg-stone-50"
                              >
                                <span className="text-sm font-medium text-[#1C1917]">Document {index + 1}</span>
                                <span className="text-xs text-[#57534E]">
                                  {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleString() : 'Recently uploaded'}
                                </span>
                              </a>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-[#57534E]">No verification documents uploaded yet.</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div>
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
                        <tr key={user._id || user.id} className="border-b border-stone-100 hover:bg-stone-50">
                          <td className="py-3 px-4">{user.name}</td>
                          <td className="py-3 px-4 text-sm text-[#57534E]">{user.email}</td>
                          <td className="py-3 px-4">
                            <span className="text-xs px-3 py-1 rounded-full bg-stone-200 text-stone-700">
                              {user.role}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            {user.role !== 'admin' && (
                              <button
                                onClick={() => handleDeleteUser(user._id || user.id)}
                                className="p-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                                title="Delete"
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
