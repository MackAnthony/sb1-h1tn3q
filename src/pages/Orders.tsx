import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export default function Orders() {
  const { data: orders, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: () => axios.get('http://localhost:3000/api/orders').then(res => res.data)
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Your Orders</h1>
      
      <div className="space-y-4">
        {orders?.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-600">No orders yet</p>
          </div>
        ) : (
          orders?.map((order: any) => (
            <div key={order.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Order #{order.id}</h3>
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
                  {order.status}
                </span>
              </div>
              {/* Order details will go here */}
            </div>
          ))
        )}
      </div>
    </div>
  );
}