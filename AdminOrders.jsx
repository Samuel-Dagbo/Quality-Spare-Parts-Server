import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Replace with your actual backend URL
  const API_URL = 'https://quality-spare-parts-server.onrender.com/api/v1/orders'; 

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      // Ensure you pass your auth token if required
      const config = {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      };
      const res = await axios.get(`${API_URL}/admin/all`, config);
      setOrders(res.data.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const config = {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      };
      await axios.patch(`${API_URL}/${orderId}/status`, { status: newStatus }, config);
      fetchOrders(); // Refresh list
      alert('Order status updated!');
    } catch (error) {
      alert('Failed to update status');
    }
  };

  if (loading) return <div>Loading Orders...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6">Order Management</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
              <th className="py-3 px-6 text-left">Order ID</th>
              <th className="py-3 px-6 text-left">User Info</th>
              <th className="py-3 px-6 text-left">Items Ordered</th>
              <th className="py-3 px-6 text-center">Total Price</th>
              <th className="py-3 px-6 text-center">Status</th>
              <th className="py-3 px-6 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="text-gray-600 text-sm font-light">
            {orders.map((order) => (
              <tr key={order._id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="py-3 px-6 text-left whitespace-nowrap">
                  <span className="font-medium">{order._id.substring(0, 8)}...</span>
                  <div className="text-xs text-gray-400">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </div>
                </td>
                <td className="py-3 px-6 text-left">
                  <div className="flex flex-col">
                    <span className="font-bold">{order.user?.name || order.customerInfo?.name || 'Unknown'}</span>
                    <span>{order.user?.email || order.customerInfo?.email}</span>
                    <span className="text-xs">{order.user?.phone || order.customerInfo?.phone}</span>
                  </div>
                </td>
                <td className="py-3 px-6 text-left">
                  <div className="flex flex-col gap-2">
                    {order.items?.map((item) => (
                      <div key={item._id} className="flex items-center gap-2">
                        <img 
                          src={`https://quality-spare-parts-server.onrender.com/${item.product?.images?.[0]}`} 
                          alt={item.name} 
                          className="w-12 h-12 object-cover rounded-lg border-2 shadow-md flex-shrink-0"
                        />
                        <div>
                          <p className="font-semibold">{item.name}</p>
                          <p className="text-xs">Qty: {item.quantity} | Price: GH₵{item.price}</p>
                        </div>
                      </div>
                    )) || 'No items'}
                  </div>
                </td>
                <td className="py-3 px-6 text-center">
                  GH₵{order.grandTotal}
                </td>
                <td className="py-3 px-6 text-center">
                  <span className={`py-1 px-3 rounded-full text-xs 
                    ${order.status === 'completed' ? 'bg-green-200 text-green-600' : 
                      order.status === 'shipped' ? 'bg-blue-200 text-blue-600' : 
                      order.status === 'pending' ? 'bg-yellow-200 text-yellow-600' : 'bg-gray-200 text-gray-600'}`}>
                    {order.status}
                  </span>
                </td>
                <td className="py-3 px-6 text-center">
                  <select 
                    value={order.status} 
                    onChange={(e) => handleStatusChange(order._id, e.target.value)}
                    className="border rounded px-2 py-1 bg-white"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="shipped">Shipped</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminOrders;
