import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import socketService from '../services/socketService';

const ManagerDashboardPage = () => {
  const [readyOrders, setReadyOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [bids, setBids] = useState([]);
  const [justification, setJustification] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchReadyOrders();

    socketService.on('new_bid', handleNewBid);
    socketService.on('new_order_ready', handleNewOrderReady);

    return () => {
      socketService.off('new_bid', handleNewBid);
      socketService.off('new_order_ready', handleNewOrderReady);
    };
  }, []);

  const handleNewBid = (data) => {
    if (selectedOrder && data.orderId === selectedOrder.order_id) {
      fetchBidsForOrder(selectedOrder.order_id);
    }
  };

  const handleNewOrderReady = (data) => {
    fetchReadyOrders();
  };

  const fetchReadyOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/orders?status=ready', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setReadyOrders(data);
      }
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch orders');
      setLoading(false);
    }
  };

  const fetchBidsForOrder = async (orderId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/bidding/orders/${orderId}/bids`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setBids(data);
      }
    } catch (err) {
      setError('Failed to fetch bids');
    }
  };

  const handleSelectOrder = (order) => {
    setSelectedOrder(order);
    setBids([]);
    setJustification('');
    fetchBidsForOrder(order.order_id);
  };

  const handleAcceptBid = async (bidId) => {
    if (!justification.trim()) {
      alert('Please provide a justification for accepting this bid');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/bidding/bids/${bidId}/accept`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ justification })
      });

      if (response.ok) {
        alert('Bid accepted successfully!');
        setSelectedOrder(null);
        setBids([]);
        setJustification('');
        fetchReadyOrders();
      } else {
        const data = await response.json();
        alert(`Failed to accept bid: ${data.error}`);
      }
    } catch (err) {
      alert('Failed to accept bid');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Manager Dashboard - Bid Management</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Orders Ready for Delivery */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Orders Ready for Delivery</h2>

            {readyOrders.length === 0 ? (
              <p className="text-gray-500">No orders ready for delivery</p>
            ) : (
              <div className="space-y-4">
                {readyOrders.map((order) => (
                  <div
                    key={order.order_id}
                    className={`border rounded-lg p-4 cursor-pointer transition ${
                      selectedOrder?.order_id === order.order_id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                    onClick={() => handleSelectOrder(order)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold">Order #{order.order_id}</p>
                        <p className="text-sm text-gray-600">{order.delivery_address}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(order.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-lg">${parseFloat(order.total).toFixed(2)}</p>
                        <p className="text-sm text-gray-500">
                          {order.assigned_delivery_person ? 'Assigned' : 'Pending'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bids for Selected Order */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">
              {selectedOrder ? `Bids for Order #${selectedOrder.order_id}` : 'Select an Order'}
            </h2>

            {!selectedOrder ? (
              <p className="text-gray-500">Select an order to view bids</p>
            ) : bids.length === 0 ? (
              <p className="text-gray-500">No bids yet for this order</p>
            ) : (
              <div className="space-y-4">
                {bids.map((bid) => (
                  <div key={bid.bid_id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-semibold">
                          {bid.DeliveryPerson?.User?.first_name} {bid.DeliveryPerson?.User?.last_name}
                        </p>
                        <p className="text-sm text-gray-600">{bid.DeliveryPerson?.User?.email}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-lg text-green-600">
                          ${parseFloat(bid.bid_amount).toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-500">{bid.estimated_time_minutes} min</p>
                      </div>
                    </div>

                    {bid.notes && (
                      <p className="text-sm text-gray-600 mb-3">
                        <span className="font-medium">Notes:</span> {bid.notes}
                      </p>
                    )}

                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500">Rating:</span>
                      <span className="text-sm font-medium">
                        {parseFloat(bid.DeliveryPerson?.average_rating || 0).toFixed(1)} ⭐
                      </span>
                      <span className="text-xs text-gray-500">
                        ({bid.DeliveryPerson?.total_ratings || 0} ratings)
                      </span>
                    </div>

                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Justification for accepting this bid:
                      </label>
                      <textarea
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                        rows="2"
                        placeholder="Explain why you are accepting this bid..."
                        value={justification}
                        onChange={(e) => setJustification(e.target.value)}
                      />
                      <button
                        onClick={() => handleAcceptBid(bid.bid_id)}
                        className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
                      >
                        Accept Bid
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboardPage;
