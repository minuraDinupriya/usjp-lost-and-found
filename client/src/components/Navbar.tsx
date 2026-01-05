
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-[#800000] text-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-[#FFD700] p-1.5 rounded">
              <i className="fas fa-search text-[#800000] text-xl"></i>
            </div>
            <span className="font-bold text-xl tracking-tight hidden sm:block">
              USJP <span className="text-[#FFD700]">Lost & Found</span>
            </span>
            <span className="font-bold text-xl tracking-tight sm:hidden">
              USJP <span className="text-[#FFD700]">L&F</span>
            </span>
          </Link>

          <div className="flex space-x-4">
            <Link
              to="/"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/') ? 'bg-[#A00000] text-[#FFD700]' : 'hover:bg-[#A00000] hover:text-[#FFD700]'
              }`}
            >
              Browse Items
            </Link>
            <Link
              to="/post"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/post') ? 'bg-[#A00000] text-[#FFD700]' : 'hover:bg-[#A00000] hover:text-[#FFD700]'
              }`}
            >
              Report Item
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
