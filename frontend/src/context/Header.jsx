import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LogOut, Menu, X, Search } from 'lucide-react';
import { searchAPI } from '../services/api';
import { useToast } from './ToastContext';
import { getErrorMessage } from '../utils/errors';
import { normalizeVenueResults } from '../utils/venues';

const Header = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  const handleLogout = () => {
    logout();
    showToast('You have been logged out.', 'info');
    navigate('/');
    setIsMenuOpen(false);
  };

  useEffect(() => {
    if (!search.trim()) {
      setSuggestions([]);
      return;
    }

    const delay = setTimeout(async () => {
      try {
        const res = await searchAPI.searchVenues({ q: search });
        setSuggestions(normalizeVenueResults(res));
      } catch (err) {
        console.error(err);
        showToast(getErrorMessage(err, 'Search unavailable'), 'error');
      }
    }, 300);

    return () => clearTimeout(delay);
  }, [search]);

  const handleSelect = (value) => {
    setSearch('');
    setSuggestions([]);
    setIsMenuOpen(false);
    navigate(`/services?q=${encodeURIComponent(value)}`);
  };

  const navLinks = [
    { to: '/', label: 'Home', show: true },
    { to: '/about', label: 'About', show: true },
    { to: '/services', label: 'Services', show: true },
    { to: '/my-bookings', label: 'Bookings', show: user?.role === 'user' },
    { to: '/vendor', label: 'Vendor Panel', show: user?.role === 'vendor' },
    { to: '/admin', label: 'Admin Panel', show: user?.role === 'admin' },
  ].filter((link) => link.show);

  return (
    <header className="bg-[#23113F]/90 backdrop-blur-xl border-b border-[#7C3AED]/20 sticky top-0 z-50">
      <div className="px-4 md:px-8 lg:px-16 py-3 flex items-center justify-between max-w-7xl mx-auto">

        {/* Logo */}
        <Link to="/" className="text-[#F8F5FF] text-xl md:text-2xl font-bold">
          Venue <span className="text-[#7C3AED]">AI</span>
        </Link>

        {/* Desktop */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8">

          {navLinks.map((link) => (
            <Link key={link.to} to={link.to} className="text-[#F8F5FF]/70 hover:text-[#F8F5FF] text-sm">
              {link.label}
            </Link>
          ))}

          {/* Search */}
          <div className="relative w-64 lg:w-80">
            <Search className="absolute left-3 top-2.5 text-[#F8F5FF]/60" size={16} />

            <input
              type="text"
              placeholder="Search venues..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSelect(search)}
              className="w-full pl-9 pr-3 py-2 bg-[#7C3AED]/10 border border-[#7C3AED]/20 rounded-xl text-[#F8F5FF] text-sm focus:outline-none focus:border-[#7C3AED]/40"
            />

            {suggestions.length > 0 && (
              <div className="absolute top-11 w-full bg-[#23113F] border border-[#7C3AED]/20 rounded-xl shadow-xl overflow-hidden z-50">
                {suggestions.map((item) => (
                  <div
                    key={item._id || item.id}
                    onClick={() => handleSelect(item.title || item.name)}
                    className="px-4 py-2 hover:bg-[#7C3AED]/10 cursor-pointer"
                  >
                    <p className="text-sm text-[#F8F5FF]">{item.title || item.name}</p>
                    <p className="text-xs text-[#F8F5FF]/60">{item.category}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* User */}
          {user ? (
            <>
              <span className="text-[#F8F5FF]/70 text-sm">{user.name}</span>
              <button onClick={handleLogout} className="text-[#F8F5FF]">
                <LogOut size={18} />
              </button>
            </>
          ) : (
            <Link to="/login" className="bg-[#7C3AED] text-white px-3 py-1.5 rounded-lg text-sm hover:bg-[#6D28D9] transition-colors">
              Login
            </Link>
          )}
        </nav>

        {/* Mobile Right Icons */}
        <div className="flex items-center gap-3 md:hidden">

          {/* Search Icon */}
          <button
            onClick={() => setIsMenuOpen(true)}
            className="text-[#F8F5FF]"
          >
            <Search />
          </button>

          {/* Menu */}
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-[#F8F5FF]">
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-[#7C3AED]/20 px-4 pb-4 bg-[#23113F]">

          {/* Mobile Search */}
          <div className="relative mt-4">
            <input
              type="text"
              placeholder="Search venues..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-2 bg-[#7C3AED]/10 border border-[#7C3AED]/20 rounded-xl text-[#F8F5FF]"
            />

            {suggestions.length > 0 && (
              <div className="mt-2 bg-[#23113F] border border-[#7C3AED]/20 rounded-xl overflow-hidden">
                {suggestions.map((item) => (
                  <div
                    key={item._id || item.id}
                    onClick={() => handleSelect(item.title || item.name)}
                    className="px-4 py-2 hover:bg-[#7C3AED]/10 cursor-pointer"
                  >
                    <p className="text-sm text-[#F8F5FF]">{item.title || item.name}</p>
                    <p className="text-xs text-[#F8F5FF]/60">{item.category}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Links */}
          <nav className="flex flex-col gap-3 pt-4">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setIsMenuOpen(false)}
                className="text-[#F8F5FF]/70 hover:text-[#F8F5FF]"
              >
                {link.label}
              </Link>
            ))}

            {!user ? (
              <Link
                to="/login"
                onClick={() => setIsMenuOpen(false)}
                className="bg-[#7C3AED] text-white px-4 py-2 rounded-xl text-center hover:bg-[#6D28D9] transition-colors"
              >
                Login
              </Link>
            ) : (
              <button
                onClick={handleLogout}
                className="border border-[#7C3AED]/20 px-4 py-2 rounded-xl text-left text-[#F8F5FF]/70 hover:bg-[#7C3AED]/10 transition-colors"
              >
                Logout
              </button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;