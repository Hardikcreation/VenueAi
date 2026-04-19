
import React from 'react';
import { BarChart3, Calendar, IndianRupee, Users } from 'lucide-react';

const VendorAnalytics = () => {
  // 🔥 Dummy Data
  const stats = [
    { title: 'Total Bookings', value: 128, icon: Calendar },
    { title: 'Revenue', value: '₹2,45,000', icon: IndianRupee },
    { title: 'Customers', value: 96, icon: Users },
    { title: 'Conversion Rate', value: '78%', icon: BarChart3 }
  ];

  const monthlyBookings = [10, 15, 20, 18, 25, 30, 28];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];

  return (
    <div className="p-6 bg-[#F8F7F4] min-h-screen">
      
      {/* Header */}
      <h1 className="text-3xl font-bold mb-6">Vendor Analytics</h1>

      {/* 🔢 Stats Cards */}
      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200">
            <div className="flex justify-between items-center mb-4">
              <span className="bg-[#FFF7ED] p-3 rounded-xl text-[#9A3412]">
                <stat.icon size={20} />
              </span>
              <span className="text-2xl font-bold">{stat.value}</span>
            </div>
            <p className="text-sm text-gray-500">{stat.title}</p>
          </div>
        ))}
      </div>

      {/* 📊 Graph Section */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200 mb-8">
        <h2 className="text-xl font-semibold mb-4">Monthly Bookings</h2>

        <div className="flex items-end gap-4 h-52">
          {monthlyBookings.map((value, i) => (
            <div key={i} className="flex flex-col items-center flex-1">
              
              {/* Bar */}
              <div
                className="w-full bg-[#9A3412] rounded-t-lg transition-all duration-300 hover:bg-[#7C2D12]"
                style={{ height: `${ value * 5 } px` }}
              />

              {/* Label */}
              <span className="text-xs mt-2 text-gray-600">{months[i]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 🧾 Recent Activity */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200">
        <h2 className="text-xl font-semibold mb-4">Recent Bookings</h2>

        <div className="space-y-4">
          {[
            { name: 'Rahul Sharma', date: '12 Apr', status: 'accepted' },
            { name: 'Priya Singh', date: '10 Apr', status: 'pending' },
            { name: 'Amit Verma', date: '08 Apr', status: 'completed' }
          ].map((item, index) => (
            <div key={index} className="flex justify-between items-center border-b pb-3">
              
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-gray-500">{item.date}</p>
              </div>

              <span
                className={`text - xs px - 3 py - 1 rounded - full ${
    item.status === 'accepted'
        ? 'bg-green-100 text-green-700'
        : item.status === 'pending'
            ? 'bg-yellow-100 text-yellow-700'
            : 'bg-blue-100 text-blue-700'
} `}
              >
                {item.status}
              </span>

            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default VendorAnalytics;