import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import ImageDropzone from '../components/ImageDropzone';

interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url: string;
}

export default function AdminPanel() {
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    image_url: ''
  });

  const { data: items, isLoading } = useQuery({
    queryKey: ['menu-items'],
    queryFn: () => axios.get('http://localhost:3000/api/menu-items').then(res => res.data)
  });

  const addMutation = useMutation({
    mutationFn: (newItem: Omit<MenuItem, 'id'>) => 
      axios.post('http://localhost:3000/api/menu-items', newItem),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu-items'] });
      toast.success('Item added successfully');
      setIsAdding(false);
      setFormData({ name: '', description: '', price: '', category: '', image_url: '' });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => 
      axios.delete(`http://localhost:3000/api/menu-items/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu-items'] });
      toast.success('Item deleted successfully');
    }
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Menu Management</h1>
        <button
          onClick={() => setIsAdding(true)}
          className="bg-orange-500 text-white px-4 py-2 rounded-lg flex items-center hover:bg-orange-600 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add New Item
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">Add New Menu Item</h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              addMutation.mutate({
                name: formData.name,
                description: formData.description,
                price: parseFloat(formData.price),
                category: formData.category,
                image_url: formData.image_url
              });
            }}
            className="space-y-4"
          >
            <ImageDropzone
              value={formData.image_url}
              onChange={(url) => setFormData({ ...formData, image_url: url })}
              className="mb-4"
            />
            <input
              type="text"
              placeholder="Item Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-2 border rounded"
              required
            />
            <textarea
              placeholder="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-2 border rounded"
              required
            />
            <input
              type="number"
              placeholder="Price"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="w-full p-2 border rounded"
              required
            />
            <input
              type="text"
              placeholder="Category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full p-2 border rounded"
              required
            />
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 text-gray-600 border rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
              >
                Add Item
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid gap-6">
        {items?.map((item: MenuItem) => (
          <div key={item.id} className="bg-white p-4 rounded-lg shadow-md flex items-center">
            <img
              src={item.image_url}
              alt={item.name}
              className="w-24 h-24 object-cover rounded-lg mr-4"
            />
            <div className="flex-1">
              <h3 className="text-lg font-semibold">{item.name}</h3>
              <p className="text-gray-600">{item.description}</p>
              <div className="flex items-center mt-2">
                <span className="text-orange-500 font-semibold">${item.price}</span>
                <span className="ml-4 text-sm text-gray-500">{item.category}</span>
              </div>
            </div>
            <div className="flex space-x-2">
              <button className="p-2 text-blue-500 hover:bg-blue-50 rounded">
                <Pencil className="w-5 h-5" />
              </button>
              <button
                onClick={() => deleteMutation.mutate(item.id)}
                className="p-2 text-red-500 hover:bg-red-50 rounded"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}