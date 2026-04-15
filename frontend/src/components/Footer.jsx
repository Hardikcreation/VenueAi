import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-[#1C1917] text-white py-12 mt-24">
      <div className="px-6 md:px-12 lg:px-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-heading text-2xl mb-4">Venue AI</h3>
            <p className="text-stone-400 text-sm leading-relaxed">Premium venue booking platform powered by AI</p>
          </div>
          <div>
            <h4 className="text-xs tracking-[0.2em] uppercase font-bold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-stone-400">
              <li>About Us</li>
              <li>Contact</li>
              <li>Privacy Policy</li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs tracking-[0.2em] uppercase font-bold mb-4">Contact</h4>
            <p className="text-sm text-stone-400">contact@venue.ai</p>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-stone-800 text-center text-xs text-stone-500">
          © 2026 Venue AI. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;