import React, { useState, useEffect } from 'react';
import { ILostFoundItem, ItemType } from '../types';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

// Helper: Format phone number for WhatsApp
const formatPhoneNumber = (phone: string) => {
  let cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '94' + cleaned.substring(1);
  }
  return cleaned;
};

const Home: React.FC = () => {
  const [items, setItems] = useState<ILostFoundItem[]>([]);
  const [filter, setFilter] = useState<'All' | ItemType>('All');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const navigate = useNavigate();

  // --- NEW: Get User Info ---
  const isLoggedIn = Boolean(localStorage.getItem('token'));
  const currentUserId = localStorage.getItem('userId');

  const fetchItems = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/items');
      const data = await response.json();
      setItems(data);
    } catch (error) {
      console.error("Failed to fetch items:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // --- DELETE FUNCTION (Now sends Token) ---
  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); 
    
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#800000',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem('token'); // <--- Get Token
        const response = await fetch(`http://localhost:5000/api/items/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` } // <--- Send Token
        });

        if (response.ok) {
          setItems(prevItems => prevItems.filter(item => item._id !== id));
          Swal.fire('Deleted!', 'The item has been removed.', 'success');
        } else {
          Swal.fire('Error!', 'Only the owner can delete this item.', 'error');
        }
      } catch (error) {
        Swal.fire('Error!', 'Something went wrong.', 'error');
      }
    }
  };

  // --- CLAIM FUNCTION (New Feature) ---
  const handleClaim = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!isLoggedIn) return Swal.fire('Error', 'Please login to mark items as found.', 'error');

    const result = await Swal.fire({
      title: 'Mark as Solved?',
      text: "This will mark the item as 'Claimed' / 'Found'.",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10B981', 
      confirmButtonText: 'Yes, it is solved!'
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/api/items/${id}/claim`, {
          method: 'PATCH',
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          // Update UI locally
          setItems(prev => prev.map(item => 
            item._id === id ? { ...item, status: 'Claimed' } : item
          ));
          Swal.fire('Success', 'Item marked as Solved!', 'success');
        } else {
          Swal.fire('Error', 'Failed to update status.', 'error');
        }
      } catch (error) {
        console.error(error);
      }
    }
  };

  const filteredItems = items.filter(item => {
    const matchesCategory = filter === 'All' || item.type === filter;
    const matchesSearch = 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-8 animate-fadeIn">
      <header className="text-center space-y-4">
        <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
          Recently <span className="text-[#800000]">Lost & Found</span>
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          A dedicated portal for the USJP community.
        </p>
        <div className="max-w-md mx-auto mt-6 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <i className="fas fa-search text-gray-400"></i>
          </div>
          <input
            type="text"
            placeholder="Search for items, locations, or descriptions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#800000] focus:border-[#800000] sm:text-sm shadow-sm transition-all"
          />
        </div>
      </header>

      {/* Filter Buttons */}
      <div className="flex flex-wrap justify-center gap-3">
        {(['All', ItemType.LOST, ItemType.FOUND] as const).map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-6 py-2 rounded-full font-medium transition-all duration-200 border-2 ${
              filter === type ? 'bg-[#800000] border-[#800000] text-white' : 'bg-white border-gray-200 text-gray-600'
            }`}
          >
            {type} Items
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#800000]"></div>
        </div>
      ) : filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div 
              key={item._id} 
              className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group relative flex flex-col ${item.status === 'Claimed' ? 'opacity-80' : ''}`}
            >
              <div className="relative h-48 overflow-hidden shrink-0">
                <img 
                  src={item.imageUrl || 'https://placehold.co/600x400/EEE/31343C?font=lato&text=No+Image+Available'} 
                  alt={item.title}
                  className={`w-full h-full object-cover transition-transform duration-300 ${item.status === 'Claimed' ? 'grayscale' : 'group-hover:scale-105'}`}
                />
                <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  item.status === 'Claimed' 
                    ? 'bg-gray-800 text-white' 
                    : item.type === ItemType.LOST ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                }`}>
                  {item.status === 'Claimed' ? 'SOLVED' : item.type}
                </div>
              </div>
              
              <div className="p-5 flex flex-col flex-grow space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className={`text-lg font-bold truncate ${item.status === 'Claimed' ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                        {item.title}
                    </h3>
                    <span className="text-xs font-semibold text-gray-400 uppercase">{item.category}</span>
                  </div>
                  
                  {/* BUTTONS LOGIC */}
                  <div className="flex shrink-0">
                    
                    {/* CHECK: Is the logged-in user the owner? */}
                    {currentUserId === item.createdBy && (
                      <>
                        {/* 1. CLAIM BUTTON (Owner Only) */}
                        {item.status !== 'Claimed' && (
                           <button 
                             onClick={(e) => handleClaim(item._id, e)}
                             className="text-gray-400 hover:text-green-600 transition-colors p-1 bg-gray-50 rounded-full h-8 w-8 flex items-center justify-center hover:bg-green-50 mr-2"
                             title="Mark as Solved"
                           >
                             <i className="fas fa-check"></i>
                           </button>
                        )}

                        {/* 2. EDIT BUTTON (Owner Only) */}
                        <button 
                          onClick={(e) => { e.stopPropagation(); navigate(`/edit/${item._id}`); }}
                          className="text-gray-400 hover:text-blue-600 transition-colors p-1 bg-gray-50 rounded-full h-8 w-8 flex items-center justify-center hover:bg-blue-50 mr-2"
                          title="Edit"
                        >
                          <i className="fas fa-pen"></i>
                        </button>

                        {/* 3. DELETE BUTTON (Owner Only) */}
                        <button 
                          onClick={(e) => handleDelete(item._id, e)}
                          className="text-gray-400 hover:text-red-600 transition-colors p-1 bg-gray-50 rounded-full h-8 w-8 flex items-center justify-center hover:bg-red-50"
                          title="Delete"
                        >
                          <i className="fas fa-trash-alt"></i>
                        </button>
                      </>
                    )}
                  </div>
                </div>
                
                <p className="text-gray-600 text-sm line-clamp-2 min-h-[2.5rem]">
                  {item.description}
                </p>
                
                <div className="pt-4 mt-auto border-t border-gray-50 flex flex-col space-y-2 text-xs text-gray-500">
                  <div className="flex items-center">
                    <i className="fas fa-map-marker-alt w-4 text-[#800000]"></i>
                    <span className="ml-2 truncate">{item.location}</span>
                  </div>
                  <div className="flex items-center">
                    <i className="fas fa-calendar-alt w-4 text-[#800000]"></i>
                    <span className="ml-2">{item.date}</span>
                  </div>

                  {/* CONTACT INFO */}
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {/* WhatsApp Button */}
                    <a 
                      href={`https://wa.me/${formatPhoneNumber(item.contactNumber)}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="col-span-1 flex items-center justify-center py-2 bg-[#25D366] text-white rounded-lg hover:bg-[#1da851] text-xs font-bold gap-1 shadow-sm"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <i className="fab fa-whatsapp text-sm"></i>
                      <span>WhatsApp</span>
                    </a>

                    {/* Live Chat Button (Only for Logged In users) */}
                    {isLoggedIn ? (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/chat/${item._id}`);
                        }}
                        className="col-span-1 flex items-center justify-center py-2 bg-[#800000] text-white rounded-lg hover:bg-[#600000] text-xs font-bold gap-1 shadow-sm"
                      >
                        <i className="fas fa-comments text-sm"></i>
                        <span>Live Chat</span>
                      </button>
                    ) : (
                      <button 
                         disabled
                         className="col-span-1 flex items-center justify-center py-2 bg-gray-200 text-gray-400 rounded-lg text-xs font-bold gap-1 cursor-not-allowed"
                      >
                        <i className="fas fa-lock text-sm"></i>
                        <span>Login to Chat</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
          <i className="fas fa-search text-5xl text-gray-300 mb-4"></i>
          <h3 className="text-xl font-medium text-gray-500">No matching items found</h3>
          <p className="text-gray-400 mt-1">Try adjusting your search or filters.</p>
        </div>
      )}
    </div>
  );
};

export default Home;