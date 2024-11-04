import { Link } from 'react-router-dom';
import { ShoppingCart, ChefHat, ClipboardList } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <ChefHat className="w-8 h-8 text-orange-500" />
            <span className="text-xl font-bold text-gray-800">FoodieHub</span>
          </Link>
          
          <div className="flex items-center space-x-6">
            <Link 
              to="/admin" 
              className="text-gray-600 hover:text-orange-500 transition-colors"
            >
              Admin Panel
            </Link>
            <Link 
              to="/orders" 
              className="text-gray-600 hover:text-orange-500 transition-colors flex items-center"
            >
              <ClipboardList className="w-5 h-5 mr-1" />
              Orders
            </Link>
            <Link 
              to="/cart" 
              className="text-gray-600 hover:text-orange-500 transition-colors flex items-center"
            >
              <ShoppingCart className="w-5 h-5 mr-1" />
              Cart
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}