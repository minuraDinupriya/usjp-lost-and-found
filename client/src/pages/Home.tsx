import React, { useState, useEffect } from 'react';
import { ILostFoundItem, ItemType } from '../types';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2'; // Import SweetAlert2

const Home: React.FC = () => {
  const [items, setItems] = useState<ILostFoundItem[]>([]);
  const [filter, setFilter] = useState<'All' | ItemType>('All');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const navigate = useNavigate();

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

  // --- SWEET ALERT DELETE FUNCTION ---
  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); 
    
    // 1. Show Confirmation Popup
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#800000',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    });

    // 2. If User Clicked "Yes"
    if (result.isConfirmed) {
      try {
        const response = await fetch(`http://localhost:5000/api/items/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          // Remove item from screen
          setItems(prevItems => prevItems.filter(item => item._id !== id));
          
          // 3. Show Success Popup
          Swal.fire({
            title: 'Deleted!',
            text: 'The item has been removed.',
            icon: 'success',
            confirmButtonColor: '#800000'
          });
        } else {
          // Show Error Popup
          Swal.fire({
            title: 'Error!',
            text: 'Failed to delete the item.',
            icon: 'error',
            confirmButtonColor: '#800000'
          });
        }
      } catch (error) {
        console.error("Error deleting:", error);
        Swal.fire({
          title: 'Error!',
          text: 'Something went wrong. Please try again.',
          icon: 'error',
          confirmButtonColor: '#800000'
        });
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
          A dedicated portal for the USJP community to help reconnect lost belongings with their owners.
        </p>

        {/* Search Bar */}
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
              filter === type
                ? 'bg-[#800000] border-[#800000] text-white shadow-md'
                : 'bg-white border-gray-200 text-gray-600 hover:border-[#800000] hover:text-[#800000]'
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
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group relative"
            >
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={item.imageUrl || 'https://placehold.co/600x400/EEE/31343C?font=lato&text=No+Image+Available'} 
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  item.type === ItemType.LOST ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                }`}>
                  {item.type}
                </div>
              </div>
              
              <div className="p-5 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 truncate">{item.title}</h3>
                    <span className="text-xs font-semibold text-gray-400 uppercase">{item.category}</span>
                  </div>
                  
                  <div className="flex">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/edit/${item._id}`);
                      }}
                      className="text-gray-400 hover:text-blue-600 transition-colors p-1 bg-gray-50 rounded-full h-8 w-8 flex items-center justify-center hover:bg-blue-50 mr-2"
                      title="Edit Item"
                    >
                      <i className="fas fa-pen"></i>
                    </button>

                    <button 
                      onClick={(e) => handleDelete(item._id, e)}
                      className="text-gray-400 hover:text-red-600 transition-colors p-1 bg-gray-50 rounded-full h-8 w-8 flex items-center justify-center hover:bg-red-50"
                      title="Delete Item"
                    >
                      <i className="fas fa-trash-alt"></i>
                    </button>
                  </div>
                </div>
                
                <p className="text-gray-600 text-sm line-clamp-2 min-h-[2.5rem]">
                  {item.description}
                </p>
                
                <div className="pt-4 border-t border-gray-50 flex flex-col space-y-1.5 text-xs text-gray-500">
                  <div className="flex items-center">
                    <i className="fas fa-map-marker-alt w-4 text-[#800000]"></i>
                    <span className="ml-2 truncate">{item.location}</span>
                  </div>
                  <div className="flex items-center">
                    <i className="fas fa-calendar-alt w-4 text-[#800000]"></i>
                    <span className="ml-2">{item.date}</span>
                  </div>
                  <div className="flex items-center">
                    <i className="fas fa-phone-alt w-4 text-[#800000]"></i>
                    <span className="ml-2 font-medium text-gray-700">{item.contactNumber}</span>
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