import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Swal from 'sweetalert2';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: '', password: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        // 1. AUTO-LOGIN: Save the credentials immediately
        localStorage.setItem('token', data.token);
        localStorage.setItem('username', data.username);
        localStorage.setItem('userId', data.userId);

        // 2. Success Popup
        await Swal.fire({
          title: 'Welcome!',
          text: 'Account created successfully. You are now logged in.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });

        // 3. Go straight to Home (and refresh to update Navbar)
        navigate('/');
        window.location.reload();
      } else {
        Swal.fire('Error', data.message || 'Registration failed', 'error');
      }
    } catch (error) {
      Swal.fire('Error', 'Server connection failed', 'error');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full border border-gray-100">
        <h2 className="text-3xl font-bold text-[#800000] mb-6 text-center">Create Account</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Username</label>
            <input
              type="text"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#800000] focus:ring-2 focus:ring-[#800000]/20 outline-none transition-all"
              placeholder="Choose a username"
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Password</label>
            <input
              type="password"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#800000] focus:ring-2 focus:ring-[#800000]/20 outline-none transition-all"
              placeholder="Choose a password"
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>
          <button type="submit" className="w-full bg-[#800000] text-white font-bold py-3 rounded-xl hover:bg-[#600000] transition-colors shadow-lg shadow-[#800000]/20">
            Sign Up
          </button>
        </form>
        <p className="mt-4 text-center text-gray-600">
          Already have an account? <Link to="/login" className="text-[#800000] font-bold hover:underline">Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;