import { useState, useEffect } from "react";

interface OrderItem {
  name: string;
  qty: number;
  price: number;
  img: string;
}

interface Order {
  id: string;
  date: string;
  status: "Processing" | "Shipped" | "Delivered" | "Cancelled";
  total: number;
  items: OrderItem[];
}

// ─── Replace with your real backend API call ─────────────────────────────────
const fetchOrders = async (): Promise<Order[]> => {
  // Example: const res = await fetch("/api/orders"); return res.json();
  return new Promise((resolve) =>
    setTimeout(() =>
      resolve([
        {
          id: "ORD-10042",
          date: "28 Feb 2026",
          status: "Delivered",
          total: 4299,
          items: [
            { name: "DeWalt 20V Cordless Drill", qty: 1, price: 3499, img: "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=100&q=80" },
            { name: "Stanley Toolbox Set", qty: 1, price: 800, img: "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=100&q=80" },
          ],
        },
        {
          id: "ORD-10031",
          date: "14 Feb 2026",
          status: "Shipped",
          total: 1850,
          items: [
            { name: "Makita Angle Grinder 4.5\"", qty: 2, price: 925, img: "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=100&q=80" },
          ],
        },
        {
          id: "ORD-10018",
          date: "02 Feb 2026",
          status: "Processing",
          total: 6799,
          items: [
            { name: "Bosch Professional Jigsaw", qty: 1, price: 4299, img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100&q=80" },
            { name: "Safety Gloves Pack (5 pairs)", qty: 1, price: 500, img: "https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=100&q=80" },
            { name: "Irwin Clamp Set", qty: 2, price: 1000, img: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=100&q=80" },
          ],
        },
        {
          id: "ORD-09987",
          date: "10 Jan 2026",
          status: "Cancelled",
          total: 2100,
          items: [
            { name: "Klein Tools Wire Stripper", qty: 1, price: 2100, img: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=100&q=80" },
          ],
        },
      ]),
    800)
  );
};
// ─────────────────────────────────────────────────────────────────────────────

const statusConfig: Record<Order["status"], { label: string; classes: string }> = {
  Processing: { label: "Processing", classes: "bg-blue-50 text-blue-600 border border-blue-200" },
  Shipped:    { label: "Shipped",    classes: "bg-yellow-50 text-[#CC9200] border border-[#FFB700]" },
  Delivered:  { label: "Delivered",  classes: "bg-green-50 text-green-600 border border-green-200" },
  Cancelled:  { label: "Cancelled",  classes: "bg-red-50 text-red-500 border border-red-200" },
};

function AccountOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders().then((data) => {
      setOrders(data);
      setLoading(false);
    });
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-[#FFB700] rounded-full flex items-center justify-center shadow-sm flex-shrink-0">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900">My Orders</h1>
            <p className="text-gray-400 text-sm mt-0.5">Track and manage your purchases</p>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <svg className="w-8 h-8 animate-spin text-[#FFB700]" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <p className="text-gray-400 text-sm">Loading your orders...</p>
          </div>
        )}

        {/* Empty */}
        {!loading && orders.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col items-center justify-center py-20 px-6 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h3 className="text-gray-800 font-bold text-lg mb-1">No orders yet</h3>
            <p className="text-gray-400 text-sm mb-6">When you place an order, it will appear here.</p>
            <button
              onClick={() => { window.location.href = "/"; }}
              className="bg-[#FFB700] hover:bg-[#FFC933] text-black font-bold px-6 py-2.5 rounded-lg text-sm transition-colors"
            >
              Start Shopping
            </button>
          </div>
        )}

        {/* Orders */}
        {!loading && orders.length > 0 && (
          <div className="flex flex-col gap-4">
            {orders.map((order) => {
              const status = statusConfig[order.status];
              const isExpanded = expandedId === order.id;

              return (
                <div key={order.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">

                  {/* Row */}
                  <div
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => toggleExpand(order.id)}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                      <div>
                        <p className="text-xs text-gray-400 font-medium">Order ID</p>
                        <p className="text-gray-900 font-bold text-sm">{order.id}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 font-medium">Placed On</p>
                        <p className="text-gray-700 text-sm font-medium">{order.date}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 font-medium">Items</p>
                        <p className="text-gray-700 text-sm font-medium">{order.items.length} item{order.items.length > 1 ? "s" : ""}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4">
                      <div className="text-right">
                        <p className="text-xs text-gray-400 font-medium">Total</p>
                        <p className="text-gray-900 font-extrabold text-base">₹{order.total.toLocaleString()}</p>
                      </div>
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full ${status.classes}`}>
                        {status.label}
                      </span>
                      <svg
                        className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ${isExpanded ? "rotate-180" : ""}`}
                        fill="none" stroke="currentColor" viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>

                  {/* Expanded items */}
                  {isExpanded && (
                    <div className="border-t border-gray-100 px-5 py-4">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Order Items</p>
                      <div className="flex flex-col gap-3">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-4">
                            <img src={item.img} alt={item.name} className="w-14 h-14 object-cover rounded-lg border border-gray-100 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-gray-800 font-semibold text-sm truncate">{item.name}</p>
                              <p className="text-gray-400 text-xs mt-0.5">Qty: {item.qty}</p>
                            </div>
                            <p className="text-gray-900 font-bold text-sm flex-shrink-0">₹{(item.price * item.qty).toLocaleString()}</p>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-100">
                        <div>
                          <p className="text-xs text-gray-400">Order Total</p>
                          <p className="text-gray-900 font-extrabold text-lg">₹{order.total.toLocaleString()}</p>
                        </div>
                        <div className="flex gap-2 flex-wrap justify-end">
                          {order.status === "Delivered" && (
                            <button className="text-xs sm:text-sm font-semibold border border-[#FFB700] text-[#FFB700] hover:bg-[#FFB700] hover:text-black px-4 py-2 rounded-lg transition-colors">
                              Reorder
                            </button>
                          )}
                          {(order.status === "Processing" || order.status === "Shipped") && (
                            <button className="text-xs sm:text-sm font-semibold bg-[#FFB700] hover:bg-[#FFC933] text-black px-4 py-2 rounded-lg transition-colors">
                              Track Order
                            </button>
                          )}
                          <button className="text-xs sm:text-sm font-semibold border border-gray-200 text-gray-500 hover:border-gray-400 px-4 py-2 rounded-lg transition-colors">
                            Invoice
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        )}

        {!loading && orders.length > 0 && (
          <p className="text-center text-gray-400 text-xs mt-6">
            Showing {orders.length} order{orders.length > 1 ? "s" : ""}
          </p>
        )}
      </div>
    </div>
  );
}

export default AccountOrders;