import { Link, Outlet, useLocation } from 'react-router-dom';
import { Home, LayoutDashboard, Building2, Calendar, Image, ShieldCheck } from 'lucide-react';

const menu = [
    { name: 'Home', path: '.', icon: Home },
    { name: 'Dashboard', path: 'dashboard', icon: LayoutDashboard },
    { name: 'My Venue', path: 'venue', icon: Building2 },
    { name: 'Bookings', path: 'bookings', icon: Calendar },
    { name: 'Images', path: 'images', icon: Image },
    { name: 'Verification', path: 'verification', icon: ShieldCheck },
];

const VendorLayout = () => {
    const location = useLocation();

    return (
        <div className="flex min-h-screen bg-[#F6F3EE]">

            {/* Sidebar */}
            <div className="w-64 bg-[#1C1917] text-white p-6 flex flex-col justify-between">
                <div>
                    <h2 className="text-2xl font-bold mb-8">Vendor Panel</h2>

                    <nav className="space-y-3">
                        {menu.map((item) => {
                            const Icon = item.icon;
                            const isHome = item.path === '.';
                            const active = isHome 
                                ? location.pathname === '/vendor' || location.pathname === '/vendor/' 
                                : location.pathname.includes(item.path);

                            return (
                                <Link
                                    key={item.name}
                                    to={item.path}
                                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition ${active ? 'bg-white text-black' : 'hover:bg-white/10'
                                        }`}
                                >
                                    <Icon size={18} />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                <p className="text-xs text-gray-400">© 2026 Vendor System</p>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-6">
                {/* Topbar */}
                <div className="bg-white p-4 rounded-2xl shadow mb-6 flex justify-between items-center">
                    <h1 className="text-xl font-semibold">Welcome Back 👋</h1>
                    <div className="text-sm text-gray-500">Vendor</div>
                </div>

                <Outlet />
            </div>
        </div>
    );
};

export default VendorLayout;