import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LogOut } from 'lucide-react';

const Header = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-white/70 backdrop-blur-xl border-b border-stone-200 sticky top-0 z-50">
      <div className="px-6 md:px-12 lg:px-24 py-4 flex items-center justify-between">
        <Link to="/" className="font-heading text-2xl tracking-tight text-[#1C1917]" data-testid="logo-link">
          Venue <span className="text-[#9A3412]">AI</span>
        </Link>
        
        <nav className="flex items-center gap-8">
          <Link to="/" className="text-sm font-medium hover:text-[#9A3412] transition-colors" data-testid="nav-home">Home</Link>
          <Link to="/services" className="text-sm font-medium hover:text-[#9A3412] transition-colors" data-testid="nav-services">Services</Link>
          
          {user ? (
            <>
              {user.role === 'admin' && (
                <Link to="/admin" className="text-sm font-medium hover:text-[#9A3412] transition-colors" data-testid="nav-admin">Admin</Link>
              )}
              {user.role === 'vendor' && (
                <Link to="/vendor" className="text-sm font-medium hover:text-[#9A3412] transition-colors" data-testid="nav-vendor">Vendor</Link>
              )}
              {user.role === 'user' && (
                <Link to="/my-bookings" className="text-sm font-medium hover:text-[#9A3412] transition-colors">
                  My Bookings
                </Link>
              )}
              <div className="flex items-center gap-4">
                <span className="text-xs tracking-[0.2em] uppercase font-bold text-[#57534E]" data-testid="user-name">{user.name}</span>
                <button onClick={handleLogout} className="p-2 hover:bg-stone-100 rounded-lg transition-colors" data-testid="logout-btn">
                  <LogOut size={18} />
                </button>
              </div>
            </>
          ) : (
            <Link to="/login" className="bg-[#1C1917] text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-[#9A3412] transition-all" data-testid="login-link">
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
