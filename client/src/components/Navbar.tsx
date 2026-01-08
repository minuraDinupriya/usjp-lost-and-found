import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  
  // Check if user is logged in
  const isLoggedIn = Boolean(localStorage.getItem('token'));
  const username = localStorage.getItem('username');

  const handleLogout = () => {
    // 1. Remove the ID Card
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('userId');

    // 2. Show Success
    Swal.fire({
      title: 'Logged Out',
      text: 'See you next time!',
      icon: 'success',
      timer: 1500,
      showConfirmButton: false
    });
    
    // 3. Redirect to Home
    navigate('/');
    window.location.reload(); 
  };

  return (
    <nav className="bg-[#800000] text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">

        <a href="/" className="flex items-center space-x-2 text-xl font-bold hover:text-gray-200 transition-colors">
          <i className="fas fa-search-location text-[#FFD700]"></i>
          <span>USJP <span className="text-[#FFD700]">Lost & Found</span></span>
        </a>

        {/* Buttons */}
        <div className="flex items-center space-x-4">

          {isLoggedIn ? (
            // --- VIEW FOR LOGGED IN USERS ---
            <>
              <span className="text-[#FFD700] text-sm font-semibold hidden sm:inline">
                Hello, {username}
              </span>
              <Link 
                to="/post" 
                className="bg-white text-[#800000] px-4 py-2 rounded-lg font-bold hover:bg-gray-100 transition-all shadow-md"
              >
                <i className="fas fa-plus-circle mr-2"></i>
                Report Item
              </Link>
              <button 
                onClick={handleLogout}
                className="text-white/80 hover:text-white font-medium transition-colors border border-white/30 px-3 py-1.5 rounded-lg hover:bg-white/10"
              >
                Logout
              </button>
            </>
          ) : (
            // --- VIEW FOR GUESTS ---
            <>
              <Link 
                to="/login" 
                className="text-white/90 hover:text-white font-medium transition-colors"
              >
                Login
              </Link>
              <Link 
                to="/register" 
                className="bg-[#FFD700] text-[#800000] px-4 py-2 rounded-lg font-bold hover:bg-[#ffe44d] transition-all shadow-md"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;