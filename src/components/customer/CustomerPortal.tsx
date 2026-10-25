import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Product, Store, CustomerOrder } from '../../types';
import {
  ShoppingBag,
  Search,
  MapPin,
  Clock,
  Phone,
  Star,
  CheckCircle2,
  AlertCircle,
  XCircle,
  QrCode,
  ShieldCheck,
  CreditCard,
  Truck,
  Heart,
  ChevronRight,
  Sparkles,
  Compass,
  ArrowRight
} from 'lucide-react';

export const CustomerPortal: React.FC = () => {
  const {
    products,
    stores,
    customerOrders,
    createCustomerOrder,
    currentUser
  } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStore, setSelectedStore] = useState<Store>(stores[0]);
  const [activeTab, setActiveTab] = useState<'products' | 'stores' | 'my_orders'>('products');

  // Reservation / Order Modal
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [orderQty, setOrderQty] = useState<number>(1);
  const [orderType, setOrderType] = useState<'pickup' | 'delivery'>('pickup');
  const [paymentOption, setPaymentOption] = useState<'pay_online' | 'pay_at_store'>('pay_online');
  const [deliveryAddr, setDeliveryAddr] = useState('14 Sea View Towers, Worli, Mumbai');
  const [confirmedOrder, setConfirmedOrder] = useState<CustomerOrder | null>(null);

  const filteredProducts = products.filter(
    p =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    const total = selectedProduct.sellingPrice * orderQty;

    const newOrd = createCustomerOrder({
      customerId: 'cust-1',
      customerName: 'Rahul Deshmukh',
      customerPhone: '+91 98211 22334',
      storeId: selectedStore.id,
      storeName: selectedStore.name,
      orderType,
      deliveryAddress: orderType === 'delivery' ? deliveryAddr : undefined,
      items: [
        {
          productId: selectedProduct.id,
          productName: selectedProduct.name,
          quantity: orderQty,
          unitPrice: selectedProduct.sellingPrice,
          image: selectedProduct.image
        }
      ],
      totalAmount: total,
      paymentStatus: paymentOption === 'pay_online' ? 'paid_online' : 'pay_at_store',
      paymentMethod: paymentOption === 'pay_online' ? 'UPI / Card' : 'Pay at Counter',
      orderStatus: 'placed'
    });

    setConfirmedOrder(newOrd);
    setSelectedProduct(null);
  };

  const getStockBadge = (prod: Product) => {
    if (prod.stock === 0) {
      return (
        <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-extrabold text-[10px] border border-rose-500/30 flex items-center gap-1">
          <XCircle className="w-3 h-3" />
          Out of Stock
        </span>
      );
    } else if (prod.stock <= prod.minThreshold) {
      return (
        <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-extrabold text-[10px] border border-amber-500/30 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          Low Stock ({prod.stock} left)
        </span>
      );
    } else {
      return (
        <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 font-extrabold text-[10px] border border-sky-500/30 flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3" />
          In Stock ({prod.stock} available)
        </span>
      );
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Customer Hero Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 border border-sky-500/30 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 z-10 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-sky-300 bg-sky-500/20 px-2.5 py-0.5 rounded-full border border-sky-400/30">
              Ellic Customer Hub
            </span>
            <span className="text-xs text-sky-200/80">Real-Time Store Inventory Search</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            Reserve Nearby Products & Order Before Visiting
          </h1>
          <p className="text-xs text-slate-300 leading-relaxed">
            Check stock availability across local stores, reserve products for instant pickup with a QR Code, or order online.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-900/80 p-3 rounded-2xl border border-sky-500/30 shadow-xl z-10">
          <MapPin className="w-5 h-5 text-sky-400 shrink-0" />
          <div className="text-xs">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Active Store Outlet</span>
            <span className="font-extrabold text-white">{selectedStore.name}</span>
          </div>
        </div>

        <div className="absolute right-0 bottom-0 -mb-12 -mr-12 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Search & Mode Tabs */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col md:flex-row items-center justify-between gap-3">
        
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search products across nearby stores (e.g., Basmati Rice, Milk, Coffee)..."
            className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
          />
        </div>

        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 w-full md:w-auto">
          <button
            onClick={() => setActiveTab('products')}
            className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'products'
                ? 'bg-sky-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Product Catalog
          </button>
          <button
            onClick={() => setActiveTab('stores')}
            className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'stores'
                ? 'bg-sky-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Nearby Stores
          </button>
          <button
            onClick={() => setActiveTab('my_orders')}
            className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'my_orders'
                ? 'bg-sky-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            My Orders ({customerOrders.length})
          </button>
        </div>

      </div>

      {/* Tab 1: Product Catalog & Stock Badges */}
      {activeTab === 'products' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map(prod => (
            <div
              key={prod.id}
              className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl flex flex-col justify-between space-y-3 hover:border-sky-500/40 transition-all group"
            >
              <div className="space-y-3">
                <div className="h-40 w-full rounded-xl overflow-hidden bg-slate-800 relative">
                  <img
                    src={prod.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=300'}
                    alt={prod.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 left-2">
                    {getStockBadge(prod)}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-extrabold text-white group-hover:text-sky-300 transition-colors">
                    {prod.name}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2 mt-1">{prod.description}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-lg font-black text-sky-400">₹{prod.sellingPrice}</div>
                  <div className="text-[10px] text-slate-500 line-through">MRP ₹{prod.mrp}</div>
                </div>

                <button
                  disabled={prod.stock === 0}
                  onClick={() => setSelectedProduct(prod)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    prod.stock > 0
                      ? 'bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white shadow-lg shadow-blue-600/20 hover:scale-105'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>{prod.stock > 0 ? 'Reserve / Order' : 'Out of Stock'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Nearby Stores Map & Store Details */}
      {activeTab === 'stores' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {stores.map(st => (
            <div
              key={st.id}
              className={`p-5 rounded-2xl bg-slate-900 border transition-all space-y-4 ${
                selectedStore.id === st.id
                  ? 'border-sky-500 ring-2 ring-sky-500/20 shadow-2xl'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="h-44 w-full rounded-xl overflow-hidden bg-slate-800 relative">
                <img src={st.image} alt={st.name} className="w-full h-full object-cover" />
                <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-slate-950/80 text-sky-300 text-xs font-extrabold backdrop-blur-md border border-sky-500/30 flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-sky-400 text-sky-400" />
                  {st.rating} ({st.reviewCount} reviews)
                </span>
              </div>

              <div>
                <h3 className="text-base font-black text-white">{st.name}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{st.address}, {st.city}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
                <div className="flex items-center gap-1.5 p-2 rounded-lg bg-slate-800">
                  <Clock className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  <span>{st.timings}</span>
                </div>
                <div className="flex items-center gap-1.5 p-2 rounded-lg bg-slate-800">
                  <Phone className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  <span>{st.phone}</span>
                </div>
              </div>

              <button
                onClick={() => setSelectedStore(st)}
                className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  selectedStore.id === st.id
                    ? 'bg-sky-600 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <span>{selectedStore.id === st.id ? 'Selected Active Store' : 'Select This Store'}</span>
                {selectedStore.id === st.id && <CheckCircle2 className="w-4 h-4 text-white" />}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Customer Order History & Pickup QR Code */}
      {activeTab === 'my_orders' && (
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center justify-between">
            <span>Order History & Store Pickup QR Codes</span>
            <span className="text-xs text-slate-400">{customerOrders.length} Orders</span>
          </h3>

          <div className="space-y-4">
            {customerOrders.map(ord => (
              <div
                key={ord.id}
                className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-extrabold text-white font-mono">{ord.orderNumber}</span>
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-extrabold uppercase border border-sky-500/30">
                      {ord.orderStatus.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="text-xs text-slate-300">
                    Outlet: <strong>{ord.storeName}</strong> | Type: <strong className="uppercase">{ord.orderType}</strong>
                  </div>

                  <div className="text-xs text-slate-400">
                    {ord.items.map(i => `${i.quantity}x ${i.productName}`).join(', ')}
                  </div>
                </div>

                {/* Pickup QR Code Banner */}
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-700 flex items-center gap-3 shrink-0">
                  <div className="p-1.5 bg-white rounded border border-slate-300">
                    <QrCode className="w-10 h-10 text-slate-900" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-extrabold text-sky-400 block">Pickup QR Code</span>
                    <span className="text-xs font-mono font-bold text-white">{ord.pickupQrCode}</span>
                    <span className="text-[9px] text-slate-400 block mt-0.5">Show QR to cashier at counter</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reserve / Checkout Product Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Reserve / Order Product</h3>
              <button onClick={() => setSelectedProduct(null)} className="text-slate-400 hover:text-white">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePlaceOrder} className="p-6 space-y-4 text-xs">
              <div className="flex gap-3">
                <img
                  src={selectedProduct.image}
                  alt={selectedProduct.name}
                  className="w-16 h-16 rounded-lg object-cover border border-slate-700"
                />
                <div>
                  <h4 className="font-extrabold text-white text-sm">{selectedProduct.name}</h4>
                  <div className="text-sky-400 font-bold text-xs mt-1">₹{selectedProduct.sellingPrice} / unit</div>
                  <div className="text-[10px] text-slate-400">Outlet: {selectedStore.name}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Quantity</label>
                  <input
                    type="number"
                    min={1}
                    max={selectedProduct.stock}
                    value={orderQty}
                    onChange={e => setOrderQty(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-bold"
                  />
                </div>

                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Order Type</label>
                  <select
                    value={orderType}
                    onChange={e => setOrderType(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  >
                    <option value="pickup">Store Pickup (Generate QR)</option>
                    <option value="delivery">Home Delivery</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1">Payment Option</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentOption('pay_online')}
                    className={`p-2 rounded-lg text-xs font-bold border ${
                      paymentOption === 'pay_online'
                        ? 'bg-sky-600 text-white border-sky-400'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    Pay Online Now
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentOption('pay_at_store')}
                    className={`p-2 rounded-lg text-xs font-bold border ${
                      paymentOption === 'pay_at_store'
                        ? 'bg-sky-600 text-white border-sky-400'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    Pay At Counter
                  </button>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-between items-center">
                <div>
                  <span className="text-[10px] text-slate-400 block">Total Price</span>
                  <span className="text-base font-black text-sky-400">₹{selectedProduct.sellingPrice * orderQty}</span>
                </div>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 text-white font-bold shadow-lg"
                >
                  Confirm Reservation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Order Confirmation Banner */}
      {confirmedOrder && (
        <div className="p-5 rounded-2xl bg-sky-500/10 border border-sky-500/30 text-sky-300 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-sm flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-sky-400" />
              <span>Order Reserved Successfully! ({confirmedOrder.orderNumber})</span>
            </span>
            <button onClick={() => setConfirmedOrder(null)} className="text-slate-400 hover:text-white">
              <XCircle className="w-5 h-5" />
            </button>
          </div>
          <p className="text-xs text-slate-300">
            Show your Pickup QR Code <strong>{confirmedOrder.pickupQrCode}</strong> at the counter in {confirmedOrder.storeName}.
          </p>
        </div>
      )}

    </div>
  );
};
