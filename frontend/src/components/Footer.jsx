import React from 'react';
import { Sparkles, Phone, Mail, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-[#0A0A0B] border-t border-white/10 text-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-white/10 p-2 rounded-xl">
                <Sparkles size={20} className="text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold">VenueAI</h3>
                <p className="text-sm text-gray-400">Bhopal's #1 Venue Platform</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Discover and book the perfect venue for your special events in Bhopal. From weddings to corporate events, we've got you covered.
            </p>
          </div>

          <div className="md:col-span-1">
            <h4 className="font-bold mb-4 text-white">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm block">About Us</a>
              </li>
              <li>
                <a href="#venues" className="text-gray-400 hover:text-white transition-colors text-sm block">All Venues</a>
              </li>
              <li>
                <a href="#testimonials" className="text-gray-400 hover:text-white transition-colors text-sm block">Testimonials</a>
              </li>
              <li>
                <a href="#contact" className="text-gray-400 hover:text-white transition-colors text-sm block">Contact Us</a>
              </li>
            </ul>
          </div>

          <div className="md:col-span-1">
            <h4 className="font-bold mb-4 text-white">Categories</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm block">🌿 Gardens</a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm block">🏡 Farmhouses</a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm block">🏨 Resorts</a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm block">🎪 Banquet Halls</a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm block">🌾 Lawns</a>
              </li>
            </ul>
          </div>

          <div className="md:col-span-1">
            <h4 className="font-bold mb-4 text-white">Contact Info</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2">
                <Phone size={16} className="text-gray-400 flex-shrink-0" />
                <span className="text-gray-400 text-sm">+91 98765 43210</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={16} className="text-gray-400 flex-shrink-0" />
                <span className="text-gray-400 text-sm">info@venueai.com</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin size={16} className="text-gray-400 flex-shrink-0" />
                <span className="text-gray-400 text-sm">MP Nagar, Bhopal</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-8 pt-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-sm text-center sm:text-left">© 2024 VenueAI. All rights reserved.</p>
            <div className="flex flex-wrap items-center justify-center sm:justify-end gap-4">
              <a href="#" className="text-gray-500 hover:text-white transition-colors text-sm">Privacy Policy</a>
              <a href="#" className="text-gray-500 hover:text-white transition-colors text-sm">Terms of Service</a>
              <a href="#" className="text-gray-500 hover:text-white transition-colors text-sm">Cookie Policy</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;