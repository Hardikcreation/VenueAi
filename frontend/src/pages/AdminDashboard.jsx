import React, { useEffect, useMemo, useState } from 'react';
import {
  BadgeCheck,
  Building2,
  FileText,
  Image as ImageIcon,
  Mail,
  Phone,
  ShieldCheck,
  Trash2,
  Users
} from 'lucide-react';
import { adminAPI } from '../services/api';
import { useToast } from '../context/ToastContext';
import { getErrorMessage } from '../utils/errors';
import { BACKEND_BASE_URL } from '../config/env';

const toAssetUrl = (value) => {
  if (!value) return '';
  if (value.startsWith('http://') || value.startsWith('https://')) return value;
  return `${BACKEND_BASE_URL}${value}`;
};

const badgeStyles = {
  approved: 'bg-[#DCFCE7] text-[#166534]',
  rejected: 'bg-[#FEE2E2] text-[#991B1B]',
  pending: 'bg-[#FEF3C7] text-[#92400E]',
};

const AdminDashboard = () => {
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [selectedVendorId, setSelectedVendorId] = useState(null);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [activeTab, setActiveTab] = useState('review');
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
        adminAPI.getAllVendors(),
      ]);

      setStats(statsRes);
      setUsers(usersRes);
      setVendors(vendorsRes);
      if (!selectedVendorId && vendorsRes.length > 0) {
        setSelectedVendorId(vendorsRes[0].id);
      }
      setError('');
    } catch (err) {
      const message = getErrorMessage(err, 'Error fetching admin data');
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
      } catch (err) {
        setSelectedVendor(null);
        showToast(getErrorMessage(err, 'Error fetching vendor details'), 'error');
      } finally {
        setDetailLoading(false);
      }
    };

    fetchVendorDetails();
  }, [selectedVendorId]);

  const pendingVendors = useMemo(
    () => vendors.filter((vendor) => !vendor.approved || vendor.venue?.status === 'pending'),
    [vendors]
  );

  const statCards = [
    { label: 'Users', value: stats.users || 0, icon: Users },
    { label: 'Vendors', value: stats.vendors || 0, icon: Building2 },
    { label: 'Listings', value: stats.products || 0, icon: ShieldCheck },
    { label: 'Pending', value: stats.pending || 0, icon: BadgeCheck },
  ];

  const handleVendorAction = async (vendorId, action) => {
    try {
      if (action === 'approve') {
        await adminAPI.approveVendor(vendorId);
      } else {
        await adminAPI.rejectVendor(vendorId);
      }
      await fetchDashboardData();
      const details = await adminAPI.getVendorDetails(vendorId);
      setSelectedVendor(details);
      showToast(`Vendor ${action === 'approve' ? 'approved' : 'rejected'} successfully.`, 'success');
    } catch (err) {
      showToast(getErrorMessage(err, `Error trying to ${action} vendor`), 'error');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Delete this user?')) return;

    try {
      await adminAPI.deleteUser(userId);
      await fetchDashboardData();
      showToast('User deleted successfully.', 'success');
    } catch (err) {
      showToast(getErrorMessage(err, 'Error deleting user'), 'error');
    }
  };

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-[#F8F5FF]">Loading admin workspace...</div>;
  }

  return (
    <div className="min-h-screen bg-[#F8F5FF] px-4 py-5 md:px-6">
      <div className="mx-auto max-w-[1400px] space-y-5">
        <section className="rounded-[34px] bg-gradient-to-br from-[#2A104F] via-[#5B21B6] to-[#9333EA] p-6 text-white shadow-[0_30px_70px_rgba(76,29,149,0.35)]">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-white/70">Admin HQ</p>
          <h1 className="mt-2 text-4xl font-extrabold">Marketplace Control Center</h1>
          <p className="mt-3 max-w-2xl text-sm text-white/82">
            Review vendor submissions, approve listings, and keep the marketplace quality bar high across discovery, trust and bookings.
          </p>
        </section>

        {error && <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.label} className="rounded-[28px] bg-white p-5 shadow-[0_18px_45px_rgba(109,40,217,0.08)]">
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F3E8FF] text-[#7C3AED]">
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="text-3xl font-extrabold text-[#22103D]">{card.value}</span>
                </div>
                <p className="mt-4 text-xs font-bold uppercase tracking-[0.22em] text-[#A293BB]">{card.label}</p>
              </div>
            );
          })}
        </section>

        <section className="rounded-[32px] bg-white p-3 shadow-[0_18px_45px_rgba(109,40,217,0.08)]">
          <div className="flex flex-wrap gap-2">
            {[
              ['review', 'Vendor Review'],
              ['queue', `Approval Queue (${pendingVendors.length})`],
              ['users', 'Users'],
            ].map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setActiveTab(key)}
                className={`rounded-full px-4 py-2 text-sm font-semibold ${
                  activeTab === key ? 'bg-[#6D28D9] text-white' : 'bg-[#F3E8FF] text-[#6D28D9]'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </section>

        {activeTab === 'queue' && (
          <section className="grid gap-4">
            {pendingVendors.length === 0 ? (
              <div className="rounded-[28px] bg-white p-8 text-center text-sm text-[#7D6F95] shadow-[0_18px_45px_rgba(109,40,217,0.08)]">
                No pending submissions right now.
              </div>
            ) : (
              pendingVendors.map((vendor) => (
                <button
                  key={vendor.id}
                  type="button"
                  onClick={() => {
                    setSelectedVendorId(vendor.id);
                    setActiveTab('review');
                  }}
                  className="flex items-center justify-between rounded-[28px] bg-white p-5 text-left shadow-[0_18px_45px_rgba(109,40,217,0.08)]"
                >
                  <div>
                    <h3 className="text-lg font-bold text-[#22103D]">{vendor.business_name}</h3>
                    <p className="mt-1 text-sm text-[#7D6F95]">{vendor.user?.email || 'No email available'}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${badgeStyles[vendor.venue?.status] || badgeStyles.pending}`}>
                    {vendor.venue?.status || 'pending'}
                  </span>
                </button>
              ))
            )}
          </section>
        )}

        {activeTab === 'review' && (
          <section className="grid gap-5 lg:grid-cols-[340px_1fr]">
            <div className="rounded-[32px] bg-white p-4 shadow-[0_18px_45px_rgba(109,40,217,0.08)]">
              <h2 className="mb-4 text-lg font-extrabold text-[#22103D]">Vendor Review List</h2>
              <div className="space-y-3">
                {vendors.map((vendor) => {
                  const active = selectedVendorId === vendor.id;
                  return (
                    <button
                      key={vendor.id}
                      type="button"
                      onClick={() => setSelectedVendorId(vendor.id)}
                      className={`w-full rounded-[22px] px-4 py-4 text-left ${
                        active ? 'bg-[#6D28D9] text-white' : 'bg-[#F8F5FF] text-[#2A174A]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-bold">{vendor.business_name}</p>
                          <p className={`mt-1 text-xs ${active ? 'text-white/75' : 'text-[#7D6F95]'}`}>{vendor.user?.name || 'Unknown owner'}</p>
                        </div>
                        <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${active ? 'bg-white/15 text-white' : badgeStyles[vendor.venue?.status] || badgeStyles.pending}`}>
                          {vendor.venue?.status || 'draft'}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-[32px] bg-white p-6 shadow-[0_18px_45px_rgba(109,40,217,0.08)]">
              {detailLoading ? (
                <div className="py-20 text-center text-sm text-[#7D6F95]">Loading vendor details...</div>
              ) : !selectedVendor?.vendor ? (
                <div className="py-20 text-center text-sm text-[#7D6F95]">Select a vendor to review their listing.</div>
              ) : (
                <div className="space-y-6">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <BadgeCheck className="h-5 w-5 text-[#7C3AED]" />
                        <h2 className="text-2xl font-extrabold text-[#22103D]">{selectedVendor.vendor.business_name}</h2>
                      </div>
                      <div className="mt-3 space-y-1 text-sm text-[#7D6F95]">
                        <p className="flex items-center gap-2"><Mail className="h-4 w-4" /> {selectedVendor.vendor.user?.email || 'No email'}</p>
                        <p className="flex items-center gap-2"><Phone className="h-4 w-4" /> {selectedVendor.vendor.phone || 'No phone'}</p>
                        <p>{selectedVendor.vendor.address || 'No address added'}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <span className={`rounded-full px-3 py-1 text-xs font-bold ${selectedVendor.vendor.approved ? badgeStyles.approved : badgeStyles.pending}`}>
                        {selectedVendor.vendor.approved ? 'Vendor Approved' : 'Vendor Pending'}
                      </span>
                      <span className={`rounded-full px-3 py-1 text-xs font-bold ${badgeStyles[selectedVendor.venue?.status] || badgeStyles.pending}`}>
                        Listing {selectedVendor.venue?.status || 'not submitted'}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => handleVendorAction(selectedVendor.vendor.id, 'approve')}
                      className="rounded-full bg-[#16A34A] px-5 py-3 text-sm font-semibold text-white"
                    >
                      Approve Vendor
                    </button>
                    <button
                      type="button"
                      onClick={() => handleVendorAction(selectedVendor.vendor.id, 'reject')}
                      className="rounded-full bg-[#DC2626] px-5 py-3 text-sm font-semibold text-white"
                    >
                      Reject Vendor
                    </button>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {[
                      ['Title', selectedVendor.venue?.title || 'Not submitted'],
                      ['Category', selectedVendor.venue?.category || 'Not set'],
                      ['Location', selectedVendor.venue?.location || 'Not set'],
                      ['Price', selectedVendor.venue?.price ? `₹${Number(selectedVendor.venue.price).toLocaleString('en-IN')}` : 'Not set'],
                      ['Tag', selectedVendor.venue?.tag_label || 'Not set'],
                      ['Budget', selectedVendor.venue?.budget_tier || 'Not set'],
                      ['Rating', selectedVendor.venue?.rating ? Number(selectedVendor.venue.rating).toFixed(1) : 'N/A'],
                      ['Capacity', selectedVendor.venue?.capacity ? `${selectedVendor.venue.capacity} guests` : 'N/A'],
                    ].map(([label, value]) => (
                      <div key={label} className="rounded-[22px] bg-[#F8F5FF] p-4">
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#A293BB]">{label}</p>
                        <p className="mt-3 text-sm font-bold text-[#22103D]">{value}</p>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-[26px] bg-[#F8F5FF] p-5">
                    <h3 className="text-lg font-bold text-[#22103D]">Description</h3>
                    <p className="mt-3 text-sm leading-7 text-[#5C5174]">{selectedVendor.venue?.description || 'No description submitted yet.'}</p>
                  </div>

                  <div className="rounded-[26px] bg-[#F8F5FF] p-5">
                    <div className="mb-4 flex items-center gap-2">
                      <ImageIcon className="h-5 w-5 text-[#7C3AED]" />
                      <h3 className="text-lg font-bold text-[#22103D]">Images</h3>
                    </div>
                    {selectedVendor.images?.length ? (
                      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        {selectedVendor.images.map((image, index) => (
                          <a key={`${image}-${index}`} href={toAssetUrl(image)} target="_blank" rel="noreferrer" className="overflow-hidden rounded-[22px]">
                            <img src={toAssetUrl(image)} alt={`Venue ${index + 1}`} className="h-44 w-full object-cover" />
                          </a>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-[#7D6F95]">No images uploaded yet.</p>
                    )}
                  </div>

                  <div className="rounded-[26px] bg-[#F8F5FF] p-5">
                    <div className="mb-4 flex items-center gap-2">
                      <FileText className="h-5 w-5 text-[#7C3AED]" />
                      <h3 className="text-lg font-bold text-[#22103D]">Verification Documents</h3>
                    </div>
                    {selectedVendor.documents?.length ? (
                      <div className="space-y-3">
                        {selectedVendor.documents.map((doc, index) => (
                          <a
                            key={`${doc.url}-${index}`}
                            href={toAssetUrl(doc.url)}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center justify-between rounded-[18px] bg-white px-4 py-3 text-sm font-semibold text-[#2A174A]"
                          >
                            <span>Document {index + 1}</span>
                            <span className="text-xs text-[#8A7AAE]">
                              {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : 'Recent'}
                            </span>
                          </a>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-[#7D6F95]">No verification documents uploaded yet.</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {activeTab === 'users' && (
          <section className="rounded-[32px] bg-white p-6 shadow-[0_18px_45px_rgba(109,40,217,0.08)]">
            <h2 className="mb-5 text-2xl font-extrabold text-[#22103D]">User Management</h2>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px]">
                <thead>
                  <tr className="border-b border-[#EEE7FF] text-left text-xs uppercase tracking-[0.2em] text-[#A293BB]">
                    <th className="px-3 py-3">Name</th>
                    <th className="px-3 py-3">Email</th>
                    <th className="px-3 py-3">Role</th>
                    <th className="px-3 py-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user._id || user.id} className="border-b border-[#F4EDFF] text-sm text-[#3D2A60]">
                      <td className="px-3 py-4 font-semibold">{user.name}</td>
                      <td className="px-3 py-4">{user.email}</td>
                      <td className="px-3 py-4 capitalize">{user.role}</td>
                      <td className="px-3 py-4">
                        {user.role !== 'admin' && (
                          <button
                            type="button"
                            onClick={() => handleDeleteUser(user._id || user.id)}
                            className="rounded-full bg-[#FEE2E2] p-2 text-[#991B1B]"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
