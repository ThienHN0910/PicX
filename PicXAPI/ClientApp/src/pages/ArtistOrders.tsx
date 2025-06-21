import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function ArtistOrders() {
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('/api/orders/artist', { withCredentials: true })
      .then(res => {
        setOrders(res.data.orders || []);
      })
      .catch(() => {
        alert("Can't not load orders");
      });
  }, []);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Orders List</h1>

      {orders.length === 0 ? (
        <p className="text-gray-500">No one has bought your product yet...</p>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div
              key={order.orderId}
              className="border p-4 rounded hover:bg-gray-50 cursor-pointer shadow"
              onClick={() => navigate(`/artist/order/${order.orderId}`)}
            >
              <h2 className="text-lg font-semibold">Order #{order.orderId}</h2>
              <p>Total: ${order.totalAmount}</p>
              <p>Date: {new Date(order.orderDate).toLocaleString()}</p>
              <p>{order.items.length} item(s)</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
