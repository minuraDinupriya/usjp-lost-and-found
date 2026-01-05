
import React, { useState, useEffect } from 'react';
import { ILostFoundItem, ItemType } from '../types';

// Mock data for initial demonstration if backend is not connected
const MOCK_ITEMS: ILostFoundItem[] = [
  {
    _id: '1',
    title: 'Silver Casio Watch',
    description: 'Found near the main library entrance. It has a blue face.',
    type: ItemType.FOUND,
    category: 'Electronics',
    location: 'Main Library',
    date: '2024-05-15',
    contactNumber: '0712345678',
    imageUrl: 'https://picsum.photos/400/300?random=1',
    createdAt: new Date().toISOString()
  },
  {
    _id: '2',
    title: 'Red Backpack',
    description: 'Contains a laptop and several notebooks. Lost near the canteen.',
    type: ItemType.LOST,
    category: 'Bags',
    location: 'Science Faculty Canteen',
    date: '2024-05-14',
    contactNumber: '0778899001',
    imageUrl: 'https://picsum.photos/400/300?random=2',
    createdAt: new Date().toISOString()
  },
  {
    _id: '3',
    title: 'Car Keys',
    description: 'Toyota keys found in the parking lot.',
    type: ItemType.FOUND,
    category: 'Miscellaneous',
    location: 'Faculty Parking',
    date: '2024-05-16',
    contactNumber: '0701122334',
    imageUrl: 'https://picsum.photos/400/300?random=3',
    createdAt: new Date().toISOString()
  }
];

const Home: React.FC = () => {
  const [items, setItems] = useState<ILostFoundItem[]>([]);
  const [filter, setFilter] = useState<'All' | ItemType>('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real project, this would fetch from http://localhost:5000/api/items
    // We simulate a fetch here
    const fetchItems = async () => {
      setLoading(true);
      try {
        // Simulating API latency
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Try fetching from local storage first (simulated persistent storage for the demo)
        const stored = localStorage.getItem('usjp_items');
        if (stored) {
          setItems([...JSON.parse(stored), ...MOCK_ITEMS]);
        } else {
          setItems(MOCK_ITEMS);
        }
      } catch (error) {
        console.error("Failed to fetch items:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  const filteredItems = filter === 'All' 
    ? items 
    : items.filter(item => item.type === filter);

  return (
    <div className="space-y-8 animate-fadeIn">
      <header className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
          Recently <span className="text-[#800000]">Lost & Found</span>
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          A dedicated portal for the USJP community to help reconnect lost belongings with their owners.
        </p>
      </header>

      {/* Filter Bar */}
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
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group"
            >
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={item.imageUrl || 'https://picsum.photos/400/300?random=0'} 
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
                <div>
                  <h3 className="text-lg font-bold text-gray-900 truncate">{item.title}</h3>
                  <span className="text-xs font-semibold text-gray-400 uppercase">{item.category}</span>
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
          <i className="fas fa-box-open text-5xl text-gray-300 mb-4"></i>
          <h3 className="text-xl font-medium text-gray-500">No items found in this category</h3>
          <p className="text-gray-400 mt-1">Be the first to report something!</p>
        </div>
      )}
    </div>
  );
};

export default Home;
