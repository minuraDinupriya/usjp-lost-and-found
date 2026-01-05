import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ItemType } from '../types';

const PostItem: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // We keep track of the file separately
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    type: ItemType.LOST,
    category: '',
    title: '',
    description: '',
    location: '',
    date: '',
    contactNumber: '', // Backend expects 'contact', we will map this later
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Special handler just for the file input
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 1. Create a FormData object (Required for sending files)
      const data = new FormData();
      data.append('type', formData.type);
      data.append('category', formData.category);
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('location', formData.location);
      data.append('date', formData.date);
      data.append('contact', formData.contactNumber); // Mapping contactNumber -> contact

      // 2. Add the file if the user picked one
      if (selectedFile) {
        data.append('image', selectedFile);
      }

      // 3. Send to your Backend
      const response = await fetch('http://localhost:5000/api/items', {
        method: 'POST',
        body: data, // No 'Content-Type' header needed; browser sets it automatically for FormData
      });

      if (response.ok) {
        alert('Item reported successfully!');
        navigate('/'); // Go back home
      } else {
        alert('Failed to save item. Server error.');
      }

    } catch (error) {
      console.error("Submission failed:", error);
      alert('Failed to report item. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = ['Electronics', 'Bags', 'Identity Cards', 'Documents', 'Books', 'Miscellaneous'];

  return (
    <div className="max-w-2xl mx-auto animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-[#800000] px-6 py-4">
          <h2 className="text-xl font-bold text-[#FFD700]">Report Lost or Found Item</h2>
          <p className="text-maroon-100 text-sm opacity-90 text-white">Fill out the details below to help someone find their item.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Status Radio Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">Status</label>
              <div className="flex gap-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="type"
                    value={ItemType.LOST}
                    checked={formData.type === ItemType.LOST}
                    onChange={handleChange}
                    className="w-4 h-4 text-[#800000] focus:ring-[#800000]"
                  />
                  <span className="text-sm">Lost Item</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="type"
                    value={ItemType.FOUND}
                    checked={formData.type === ItemType.FOUND}
                    onChange={handleChange}
                    className="w-4 h-4 text-[#800000] focus:ring-[#800000]"
                  />
                  <span className="text-sm">Found Item</span>
                </label>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">Category</label>
              <select
                name="category"
                required
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#800000]/20 focus:border-[#800000] transition-all"
              >
                <option value="">Select Category</option>
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700">Item Title</label>
            <input
              type="text"
              name="title"
              required
              placeholder="e.g. Blue Dell Laptop, Red Umbrella"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#800000]/20 focus:border-[#800000] transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700">Detailed Description</label>
            <textarea
              name="description"
              rows={3}
              required
              placeholder="Provide specific details that help identify the item..."
              value={formData.description}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#800000]/20 focus:border-[#800000] transition-all"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">Location</label>
              <input
                type="text"
                name="location"
                required
                placeholder="e.g. Science Lecture Hall 01"
                value={formData.location}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#800000]/20 focus:border-[#800000] transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">Date</label>
              <input
                type="date"
                name="date"
                required
                value={formData.date}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#800000]/20 focus:border-[#800000] transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">Contact Number</label>
              <input
                type="tel"
                name="contactNumber"
                required
                placeholder="07X XXX XXXX"
                value={formData.contactNumber}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#800000]/20 focus:border-[#800000] transition-all"
              />
            </div>

            {/* --- NEW FILE INPUT SECTION --- */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">Upload Image</label>
              <input
                type="file"
                accept="image/*" // Only allow image files
                onChange={handleFileChange}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#800000]/20 focus:border-[#800000] transition-all file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#800000]/10 file:text-[#800000] hover:file:bg-[#800000]/20"
              />
            </div>
          </div>

          <div className="pt-4 flex gap-4">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="flex-1 px-6 py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 rounded-xl bg-[#800000] text-white font-semibold hover:bg-[#600000] disabled:bg-gray-400 disabled:cursor-not-allowed transition-all shadow-lg shadow-[#800000]/20"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <i className="fas fa-spinner animate-spin mr-2"></i> Submitting...
                </span>
              ) : 'Submit Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostItem;