import { useQuery } from '@tanstack/react-query';
import { ShoppingCart } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useCartStore } from '../store/cartStore';

interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url: string;
}

export default function CustomerPanel() {
  const { data: items, isLoading } = useQuery({
    queryKey: ['menu-items'],
    queryFn: () => axios.get('http://localhost:3000/api/menu-items').then(res => res.data)
  });

  const addItem = useCartStore((state) => state.addItem);

  const addToCart = (item: MenuItem) => {
    addItem({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: 1
    });
    toast.success(`${item.name} added to cart`);
  };

  if (isLoading) return <div>Loading...</div>;

  const categories = [...new Set(items?.map((item: MenuItem) => item.category))];

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Our Menu</h1>
      
      {categories.map(category => (
        <div key={category} className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-700 mb-6 capitalize">{category}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items
              ?.filter((item: MenuItem) => item.category === category)
              .map((item: MenuItem) => (
                <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="text-xl font-semibold text-gray-800">{item.name}</h3>
                    <p className="text-gray-600 mt-2">{item.description}</p>
                    <div className="flex justify-between items-center mt-4">
                      <span className="text-2xl font-bold text-orange-500">
                        ${item.price}
                      </span>
                      <button
                        onClick={() => addToCart(item)}
                        className="flex items-center space-x-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
                      >
                        <ShoppingCart className="w-5 h-5" />
                        <span>Add to Cart</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}