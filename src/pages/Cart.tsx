import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCartStore } from '../store/cartStore';
import axios from 'axios';

export default function Cart() {
  const { items, removeItem, updateQuantity, clearCart, total } = useCartStore();
  const [customerName, setCustomerName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const placeOrder = async () => {
    if (items.length === 0) {
      toast.error('Your cart is empty!');
      return;
    }

    if (!customerName.trim()) {
      toast.error('Please enter your name');
      return;
    }

    setIsSubmitting(true);
    try {
      await axios.post('http://localhost:3000/api/orders', {
        customer_name: customerName,
        items: items.map(item => ({
          menu_item_id: item.id,
          quantity: item.quantity,
          price: item.price
        }))
      });

      clearCart();
      setCustomerName('');
      toast.success('Order placed successfully!');
    } catch (error) {
      toast.error('Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Your Cart is Empty</h2>
        <p className="text-gray-600">Add some delicious items to your cart!</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Your Cart</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between py-4 border-b">
              <div className="flex-1">
                <h3 className="text-lg font-semibold">{item.name}</h3>
                <p className="text-gray-600">${item.price} each</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                    className="px-2 py-1 bg-gray-100 rounded"
                  >
                    -
                  </button>
                  <span className="w-8 text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="px-2 py-1 bg-gray-100 rounded"
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={() => removeItem(item.id)}
                  className="text-red-500 hover:text-red-600"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-lg text-gray-600">Total:</p>
            <p className="text-2xl font-bold text-orange-500">${total().toFixed(2)}</p>
          </div>

          <div className="space-y-4">
            <input
              type="text"
              placeholder="Your Name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
            <button
              onClick={placeOrder}
              disabled={isSubmitting}
              className="w-full bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors disabled:bg-orange-300"
            >
              {isSubmitting ? 'Placing Order...' : 'Place Order'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}