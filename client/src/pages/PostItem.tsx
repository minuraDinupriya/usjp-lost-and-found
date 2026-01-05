import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ItemType } from '../types';
import Swal from 'sweetalert2'; // Import SweetAlert2

const PostItem: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams(); 
  const isEditing = Boolean(id); 

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    type: ItemType.LOST,
    category: '',
    title: '',
    description: '',
    location: '',
    date: '',
    contactNumber: '',
  });

  useEffect(() => {
    if (isEditing) {
      const fetchItem = async () => {
        try {
          const response = await fetch(`http://localhost:5000/api/items`);
          const data = await response.json();
          const item = data.find((i: any) => i._id === id);
          
          if (item) {
            setFormData({
              type: item.type,
              category: item.category,
              title: item.title,
              description: item.description,
              location: item.location,
              date: item.date,
              contactNumber: item.contactNumber,
            });
          }
        } catch (error) {
          console.error("Failed to load item", error);
        }
      };
      fetchItem();
    }
  }, [id, isEditing]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const data = new FormData();
      data.append('type', formData.type);
      data.append('category', formData.category);
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('location', formData.location);
      data.append('date', formData.date);
      data.append('contact', formData.contactNumber);

      if (selectedFile) {
        data.append('image', selectedFile);
      }

      const url = isEditing 
        ? `http://localhost:5000/api/items/${id}` 
        : 'http://localhost:5000/api/items';
      
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        body: data,
      });

      if (response.ok) {
        // --- SWEET ALERT SUCCESS ---
        await Swal.fire({
          title: 'Success!',
          text: isEditing ? 'Item updated successfully!' : 'Item reported successfully!',
          icon: 'success',
          confirmButtonColor: '#800000',
          timer: 2000,
          timerProgressBar: true
        });
        navigate('/');
      } else {
        // --- SWEET ALERT SERVER ERROR ---
        Swal.fire({
          title: 'Error!',
          text: 'Failed to save item. Server rejected the data.',
          icon: 'error',
          confirmButtonColor: '#800000'
        });
      }

    } catch (error) {
      console.error("Error:", error);
      // --- SWEET ALERT NETWORK ERROR ---
      Swal.fire({
        title: 'Oops!',
        text: 'Something went wrong. Check your connection.',
        icon: 'error',
        confirmButtonColor: '#800000'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = ['Electronics', 'Bags', 'Identity Cards', 'Documents', 'Books', 'Miscellaneous'];

  return (
    <div className="max-w-2xl mx-auto animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-[#800000] px-6 py-4">
          <h2 className="text-xl font-bold text-[#FFD700]">
            {isEditing ? 'Edit Item Details' : 'Report Lost or Found Item'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700">Status</label>
            <div className="flex gap-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input type="radio" name="type" value={ItemType.LOST} checked={formData.type === ItemType.LOST} onChange={handleChange} />
                <span>Lost Item</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input type="radio" name="type" value={ItemType.FOUND} checked={formData.type === ItemType.FOUND} onChange={handleChange} />
                <span>Found Item</span>
              </label>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700">Category</label>
            <select name="category" required value={formData.category} onChange={handleChange} className="w-full px-3 py-2 bg-gray-50 border rounded-lg">
              <option value="">Select Category</option>
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700">Item Title</label>
            <input type="text" name="title" required value={formData.title} onChange={handleChange} className="w-full px-3 py-2 bg-gray-50 border rounded-lg" />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700">Description</label>
            <textarea name="description" rows={3} required value={formData.description} onChange={handleChange} className="w-full px-3 py-2 bg-gray-50 border rounded-lg" />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">Location</label>
              <input type="text" name="location" required value={formData.location} onChange={handleChange} className="w-full px-3 py-2 bg-gray-50 border rounded-lg" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">Date</label>
              <input type="date" name="date" required value={formData.date} onChange={handleChange} className="w-full px-3 py-2 bg-gray-50 border rounded-lg" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">Contact</label>
              <input type="tel" name="contactNumber" required value={formData.contactNumber} onChange={handleChange} className="w-full px-3 py-2 bg-gray-50 border rounded-lg" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">{isEditing ? 'New Image (Optional)' : 'Upload Image'}</label>
              <input type="file" accept="image/*" onChange={handleFileChange} className="w-full px-3 py-2 bg-gray-50 border rounded-lg" />
            </div>
          </div>

          <div className="pt-4 flex gap-4">
            <button type="button" onClick={() => navigate('/')} className="flex-1 px-6 py-3 border rounded-xl hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="flex-1 px-6 py-3 bg-[#800000] text-white rounded-xl hover:bg-[#600000]">
              {isSubmitting ? 'Processing...' : (isEditing ? 'Update Item' : 'Submit Report')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostItem;