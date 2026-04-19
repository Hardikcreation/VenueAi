import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { authAPI } from '../services/api';
import { getErrorMessage } from '../utils/errors';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.login(formData);
      login(response.user, response.token);
      showToast(`Welcome back, ${response.user.name || 'user'}!`, 'success');
      
      if (response.user.role === 'admin') {
        navigate('/admin');
      } else if (response.user.role === 'vendor') {
        navigate('/vendor');
      } else {
        navigate('/');
      }
    } catch (err) {
      console.error('Login error details:', err);
      const message = getErrorMessage(err, 'Login failed');
      setError(message);
      showToast(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" data-testid="login-page">
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
          <h1 className="font-heading text-4xl sm:text-5xl tracking-tight mb-2" data-testid="login-heading">Welcome Back</h1>
          <p className="text-[#57534E] mb-8">Login to your account</p>

          {error && (
            <div className="bg-[#FEE2E2] text-[#991B1B] p-4 rounded-lg mb-6 text-sm" data-testid="login-error">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
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

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1C1917] text-white py-3 rounded-lg font-medium hover:bg-[#9A3412] transition-all disabled:opacity-50"
              data-testid="login-submit-btn"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[#57534E]">
            Don't have an account?{' '}
            <Link to="/signup" className="text-[#9A3412] font-medium hover:underline" data-testid="signup-link">
              Sign up
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
