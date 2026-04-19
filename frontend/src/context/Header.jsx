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

  // 🔥 Debounced Suggestions Fetch
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
        showToast(getErrorMessage(err, 'Search suggestions are unavailable right now.'), 'error');
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
    <header className="bg-black/80 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50">
      <div className="px-4 md:px-8 lg:px-16 py-4 flex items-center justify-between max-w-7xl mx-auto">

        {/* Logo */}
        <Link to="/" className="text-white text-2xl font-bold">
          Venue <span className="text-purple-400">AI</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link key={link.to} to={link.to} className="text-gray-300 hover:text-white">
              {link.label}
            </Link>
          ))}

          {/* 🔍 SEARCH */}
          <div className="relative w-80">

            <input
              type="text"
              placeholder="Search venues..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSelect(search);
                }
              }}
              className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white"
            />

            {/* 🔥 Suggestions Dropdown */}
            {suggestions.length > 0 && (
              <div className="absolute top-12 w-full bg-[#111] border border-white/10 rounded-xl shadow-xl overflow-hidden z-50">
                {suggestions.map((item) => (
                  <div
                    key={item._id || item.id}
                    onClick={() => handleSelect(item.title || item.name)}
                    className="px-4 py-3 hover:bg-white/10 cursor-pointer border-b border-white/5"
                  >
                    <p className="text-sm text-white">{item.title || item.name}</p>
                    <p className="text-xs text-gray-400">{item.category}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* User */}
          {user ? (
            <>
              <span className="text-gray-400 text-sm">{user.name}</span>
              <button onClick={handleLogout}>
                <LogOut />
              </button>
            </>
          ) : (
            <Link to="/login" className="bg-white text-black px-4 py-2 rounded">
              Login
            </Link>
          )}
        </nav>

        {/* Mobile Menu */}
        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden text-white">
          {isMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {isMenuOpen && (
        <div className="md:hidden border-t border-white/10 px-4 pb-4">
          <nav className="flex flex-col gap-3 pt-4">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setIsMenuOpen(false)}
                className="text-gray-300 hover:text-white"
              >
                {link.label}
              </Link>
            ))}
            {!user ? (
              <Link
                to="/login"
                onClick={() => setIsMenuOpen(false)}
                className="bg-white text-black px-4 py-2 rounded-xl font-medium text-center"
              >
                Login
              </Link>
            ) : (
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-xl border border-white/10 px-4 py-2 text-left text-gray-300 hover:text-white"
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
