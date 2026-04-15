import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { authAPI } from '../services/api';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user',
    businessName: '',
    phone: '',
    address: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authAPI.signup(formData);
      navigate('/login');
    } catch (err) {
      console.error('Signup error:', err);
      setError(err.data?.message || err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" data-testid="signup-page">
      <div 
        className="hidden lg:block lg:w-1/2 bg-cover bg-center relative"
        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1715156153744-d5fd2f1f66eb?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA3MDB8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBnbGFzcyUyMGFyY2hpdGVjdHVyZSUyMGV4dGVyaW9yfGVufDB8fHx8MTc3NTc5OTg1OXww&ixlib=rb-4.1.0&q=85)' }}
      >
        <div className="absolute inset-0 bg-black/30" />
      </div>
      
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <h1 className="font-heading text-4xl sm:text-5xl tracking-tight mb-2" data-testid="signup-heading">Create Account</h1>
          <p className="text-[#57534E] mb-8">Join Venue AI today</p>

          {error && (
            <div className="bg-[#FEE2E2] text-[#991B1B] p-4 rounded-lg mb-6 text-sm" data-testid="signup-error">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="text-xs tracking-[0.2em] uppercase font-bold block mb-2">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9A3412]"
                required
                data-testid="name-input"
              />
            </div>

            <div>
              <label className="text-xs tracking-[0.2em] uppercase font-bold block mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9A3412]"
                required
                data-testid="email-input"
              />
            </div>

            <div>
              <label className="text-xs tracking-[0.2em] uppercase font-bold block mb-2">Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9A3412]"
                required
                data-testid="password-input"
              />
            </div>

            <div>
              <label className="text-xs tracking-[0.2em] uppercase font-bold block mb-2">Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9A3412]"
                data-testid="role-select"
              >
                <option value="user">User</option>
                <option value="vendor">Vendor</option>
              </select>
            </div>

            {formData.role === 'vendor' && (
              <>
                <div>
                  <label className="text-xs tracking-[0.2em] uppercase font-bold block mb-2">Business Name</label>
                  <input
                    type="text"
                    value={formData.businessName}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                    className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9A3412]"
                    required
                    data-testid="business-name-input"
                  />
                </div>

                <div>
                  <label className="text-xs tracking-[0.2em] uppercase font-bold block mb-2">Phone</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9A3412]"
                    data-testid="phone-input"
                  />
                </div>

                <div>
                  <label className="text-xs tracking-[0.2em] uppercase font-bold block mb-2">Address</label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9A3412] min-h-24"
                    data-testid="address-input"
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1C1917] text-white py-3 rounded-lg font-medium hover:bg-[#9A3412] transition-all disabled:opacity-50"
              data-testid="signup-submit-btn"
            >
              {loading ? 'Creating account...' : 'Sign Up'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[#57534E]">
            Already have an account?{' '}
            <Link to="/login" className="text-[#9A3412] font-medium hover:underline" data-testid="login-link">
              Login
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Signup;
