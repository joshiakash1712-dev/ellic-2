import {
  Store,
  Product,
  Supplier,
  RestockLog,
  BusinessApplication,
  Wholesaler,
  WholesalerProduct,
  RetailerWholesalerConnection,
  CustomerProfile,
  POSInvoice,
  RestockOrder,
  CustomerOrder,
  Employee,
  AppNotification,
  AuditLog,
  SubscriptionPlan,
  InvoiceTemplate
} from '../types';

export const mockStores: Store[] = [
  {
    id: 'store-1',
    clientId: 'client-001',
    ownerUid: 'usr-client-01',
    name: 'Ellic Mart - Downtown Flagship (Store A)',
    ownerName: 'Vikram Malhotra',
    phone: '+91 98765 43210',
    email: 'downtown@ellicmart.com',
    address: '42 MG Road, Commercial Hub',
    city: 'Mumbai',
    gstin: '27AAAAA0000A1Z5',
    rating: 4.8,
    reviewCount: 342,
    timings: '08:00 AM - 10:00 PM',
    image: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&q=80&w=800',
    latitude: 19.076,
    longitude: 72.8777,
    isOnline: true
  },
  {
    id: 'store-2',
    clientId: 'client-001',
    ownerUid: 'usr-client-01',
    name: 'Ellic Express - Westside (Store B)',
    ownerName: 'Vikram Malhotra',
    phone: '+91 98123 45678',
    email: 'westside@ellicmart.com',
    address: '108 Hill Road, Bandra West',
    city: 'Mumbai',
    gstin: '27BBBBB1111B2Z6',
    rating: 4.6,
    reviewCount: 189,
    timings: '09:00 AM - 11:00 PM',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800',
    latitude: 19.06,
    longitude: 72.83,
    isOnline: true
  },
  {
    id: 'store-3',
    clientId: 'client-001',
    ownerUid: 'usr-client-01',
    name: 'Ellic Hyper - Phoenix Mall (Store C)',
    ownerName: 'Vikram Malhotra',
    phone: '+91 98333 77889',
    email: 'phoenix@ellicmart.com',
    address: 'L2 Phoenix Palladium, Lower Parel',
    city: 'Mumbai',
    gstin: '27CCCCC2222C3Z7',
    rating: 4.9,
    reviewCount: 512,
    timings: '10:00 AM - 11:00 PM',
    image: 'https://images.unsplash.com/photo-1580913428706-c311e67898b3?auto=format&fit=crop&q=80&w=800',
    latitude: 18.995,
    longitude: 72.825,
    isOnline: true
  }
];

export const mockProducts: Product[] = [
  {
    id: 'prod-101',
    name: 'Organic Whole Milk 1L',
    category: 'Dairy & Eggs',
    brand: 'Amul Pure',
    unit: 'ltr',
    purchasePrice: 52,
    sellingPrice: 66,
    mrp: 68,
    stock: 45,
    minThreshold: 15,
    barcode: '8901234567890',
    qrCode: 'ELLIC-P101-MILK',
    expiryDate: '2026-08-12',
    batchNumber: 'BT-2026-08A',
    warehouseLocation: 'Shelf A-01 (Cold Storage)',
    sharedWithWholesalers: true,
    image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&q=80&w=300',
    description: 'Pasteurized, homogenized whole cow milk rich in calcium and vitamin D.',
    taxRate: 5,
    storeId: 'store-1'
  },
  {
    id: 'prod-102',
    name: 'Premium Basmati Rice 5kg',
    category: 'Grains & Pulses',
    brand: 'India Gate',
    unit: 'pack',
    purchasePrice: 420,
    sellingPrice: 540,
    mrp: 590,
    stock: 8, // Low stock!
    minThreshold: 12,
    barcode: '8902345678901',
    qrCode: 'ELLIC-P102-RICE',
    expiryDate: '2027-06-30',
    batchNumber: 'BT-GR-9921',
    warehouseLocation: 'Bay B - Grain Rack 4',
    sharedWithWholesalers: true,
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=300',
    description: 'Long grain aromatic basmati rice aged for 12 months.',
    taxRate: 5,
    storeId: 'store-1'
  },
  {
    id: 'prod-103',
    name: 'Extra Virgin Olive Oil 1L',
    category: 'Oils & Spices',
    brand: 'Borges',
    unit: 'pcs',
    purchasePrice: 850,
    sellingPrice: 1150,
    mrp: 1299,
    stock: 24,
    minThreshold: 5,
    barcode: '8903456789012',
    qrCode: 'ELLIC-P103-OIL',
    expiryDate: '2027-12-31',
    batchNumber: 'BT-OL-3011',
    warehouseLocation: 'Shelf C-03',
    sharedWithWholesalers: true,
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&q=80&w=300',
    description: 'First cold pressed olive oil ideal for dressing and cooking.',
    taxRate: 12,
    storeId: 'store-1'
  },
  {
    id: 'prod-104',
    name: 'Dark Roast Coffee Beans 500g',
    category: 'Beverages',
    brand: 'Blue Tokai',
    unit: 'pack',
    purchasePrice: 380,
    sellingPrice: 520,
    mrp: 550,
    stock: 4, // Low stock!
    minThreshold: 10,
    barcode: '8904567890123',
    qrCode: 'ELLIC-P104-COFFEE',
    expiryDate: '2026-11-15',
    batchNumber: 'BT-CF-8812',
    warehouseLocation: 'Shelf D-02',
    sharedWithWholesalers: true,
    image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&q=80&w=300',
    description: 'Artisanal 100% Arabica roasted whole coffee beans with chocolate notes.',
    taxRate: 12,
    storeId: 'store-1'
  },
  {
    id: 'prod-105',
    name: 'Wireless Ergonomic Mouse',
    category: 'Electronics',
    brand: 'Logitech',
    unit: 'pcs',
    purchasePrice: 1250,
    sellingPrice: 1799,
    mrp: 1999,
    stock: 18,
    minThreshold: 4,
    barcode: '8905678901234',
    qrCode: 'ELLIC-P105-MOUSE',
    warehouseLocation: 'Tech Section - Counter 2',
    sharedWithWholesalers: false,
    image: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&q=80&w=300',
    description: 'Multi-device Bluetooth wireless mouse with high precision tracking.',
    taxRate: 18,
    storeId: 'store-1'
  },
  {
    id: 'prod-106',
    name: 'Natural Almonds 500g',
    category: 'Snacks & Nuts',
    brand: 'Happilo',
    unit: 'pack',
    purchasePrice: 310,
    sellingPrice: 420,
    mrp: 450,
    stock: 35,
    minThreshold: 8,
    barcode: '8906789012345',
    qrCode: 'ELLIC-P106-ALMOND',
    expiryDate: '2027-04-20',
    batchNumber: 'BT-NT-1002',
    warehouseLocation: 'Shelf A-04',
    sharedWithWholesalers: true,
    image: 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?auto=format&fit=crop&q=80&w=300',
    description: 'Raw California almonds packed with protein and dietary fiber.',
    taxRate: 5,
    storeId: 'store-1'
  }
];

export const mockWholesalers: Wholesaler[] = [
  {
    id: 'ws-101',
    name: 'Metro Mega Distribution Pvt Ltd',
    contactPerson: 'Rajesh Agarwal',
    phone: '+91 98200 99887',
    email: 'orders@metromega.com',
    gstin: '27MMMMM9999M1Z3',
    address: 'Plot 45, Logistics Park, Bhiwandi Industrial Hub',
    rating: 4.9,
    categories: ['Dairy & Eggs', 'Grains & Pulses', 'Oils & Spices', 'Beverages', 'Snacks & Nuts'],
    minimumOrderValue: 5000,
    performance: {
      avgLeadTimeDays: 1.4,
      fulfillmentSuccessRate: 98.6,
      onTimeDispatchRate: 97.5,
      accuracyRate: 99.4,
      totalOrdersFulfilled: 142,
      qualityRating: 4.9,
      tierStatus: 'Platinum',
      leadTimeCategoryBreakdown: [
        { category: 'Dairy & Eggs', avgLeadTimeDays: 0.8, fulfillmentRate: 99.2 },
        { category: 'Grains & Pulses', avgLeadTimeDays: 1.5, fulfillmentRate: 98.5 },
        { category: 'Oils & Spices', avgLeadTimeDays: 1.2, fulfillmentRate: 98.8 },
        { category: 'Beverages', avgLeadTimeDays: 1.8, fulfillmentRate: 97.9 }
      ]
    }
  },
  {
    id: 'ws-102',
    name: 'Apex FMCG Supply Chain',
    contactPerson: 'Sunil Mehta',
    phone: '+91 98333 11223',
    email: 'supply@apexfmcg.com',
    gstin: '27APEXX8888A1Z2',
    address: 'Warehouse Complex 12, Kurla West',
    rating: 4.7,
    categories: ['Beverages', 'Electronics', 'Personal Care'],
    minimumOrderValue: 3000,
    performance: {
      avgLeadTimeDays: 2.1,
      fulfillmentSuccessRate: 95.8,
      onTimeDispatchRate: 94.2,
      accuracyRate: 98.1,
      totalOrdersFulfilled: 88,
      qualityRating: 4.7,
      tierStatus: 'Gold',
      leadTimeCategoryBreakdown: [
        { category: 'Beverages', avgLeadTimeDays: 1.9, fulfillmentRate: 96.5 },
        { category: 'Electronics', avgLeadTimeDays: 2.5, fulfillmentRate: 94.0 },
        { category: 'Personal Care', avgLeadTimeDays: 2.0, fulfillmentRate: 97.0 }
      ]
    }
  }
];

export const mockWholesalerProducts: WholesalerProduct[] = [
  {
    id: 'wsp-1',
    wholesalerId: 'ws-101',
    name: 'Premium Basmati Rice 5kg (Carton of 10)',
    category: 'Grains & Pulses',
    brand: 'India Gate',
    unit: 'box',
    wholesalePrice: 3900, // 390 per pack
    mrp: 5900,
    stockAvailable: 450,
    moq: 2,
    tierPrices: [
      { minQty: 2, price: 3900 },
      { minQty: 10, price: 3750 }
    ],
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=300'
  },
  {
    id: 'wsp-2',
    wholesalerId: 'ws-101',
    name: 'Dark Roast Coffee Beans 500g (Case of 12)',
    category: 'Beverages',
    brand: 'Blue Tokai',
    unit: 'box',
    wholesalePrice: 4200, // 350 per pack
    mrp: 6600,
    stockAvailable: 200,
    moq: 1,
    tierPrices: [
      { minQty: 1, price: 4200 },
      { minQty: 5, price: 4000 }
    ],
    image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&q=80&w=300'
  },
  {
    id: 'wsp-3',
    wholesalerId: 'ws-101',
    name: 'Organic Whole Milk 1L (Crate of 20)',
    category: 'Dairy & Eggs',
    brand: 'Amul Pure',
    unit: 'box',
    wholesalePrice: 980, // 49 per ltr
    mrp: 1360,
    stockAvailable: 600,
    moq: 5,
    image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&q=80&w=300'
  }
];

export const mockConnections: RetailerWholesalerConnection[] = [
  {
    id: 'conn-1',
    retailerStoreId: 'store-1',
    retailerName: 'Ellic Mart - Downtown Flagship',
    wholesalerId: 'ws-101',
    wholesalerName: 'Metro Mega Distribution Pvt Ltd',
    status: 'connected',
    sharedProductIds: ['prod-101', 'prod-102', 'prod-103', 'prod-104', 'prod-106'],
    connectedSince: '2026-01-15'
  },
  {
    id: 'conn-2',
    retailerStoreId: 'store-1',
    retailerName: 'Ellic Mart - Downtown Flagship',
    wholesalerId: 'ws-102',
    wholesalerName: 'Apex FMCG Supply Chain',
    status: 'pending',
    sharedProductIds: ['prod-104', 'prod-105'],
    connectedSince: '2026-08-01'
  }
];

export const mockCustomers: CustomerProfile[] = [
  {
    id: 'cust-1',
    name: 'Rahul Deshmukh',
    phone: '+91 98211 22334',
    email: 'rahul.d@gmail.com',
    address: '14 Sea View Towers, Worli',
    creditBalance: 1250,
    loyaltyPoints: 340,
    phoneVerified: true,
    totalPurchases: 28400,
    savedAddresses: ['14 Sea View Towers, Worli', 'Office: BKC Financial Center Floor 8'],
    segment: 'VIP / Corporate',
    assignedTemplateId: 'tpl-1'
  },
  {
    id: 'cust-2',
    name: 'Pooja Iyer',
    phone: '+91 98999 77665',
    email: 'pooja.iyer@yahoo.com',
    address: '88 Blue Crest Road, Juhu',
    creditBalance: 0,
    loyaltyPoints: 520,
    phoneVerified: true,
    totalPurchases: 41200,
    savedAddresses: ['88 Blue Crest Road, Juhu'],
    segment: 'VIP / Corporate',
    assignedTemplateId: 'tpl-1'
  },
  {
    id: 'cust-3',
    name: 'Amit Patel',
    phone: '+91 97654 32109',
    email: 'apatel@gmail.com',
    address: '302 Silver Apartments, Dadar',
    creditBalance: 450,
    loyaltyPoints: 110,
    phoneVerified: false,
    totalPurchases: 9500,
    segment: 'Regular Retail',
    assignedTemplateId: 'tpl-2'
  },
  {
    id: 'cust-4',
    name: 'Reliance Fresh Procurement',
    phone: '+91 98111 88776',
    email: 'b2b@reliancefresh.com',
    address: 'Corporate Park, Powai',
    creditBalance: 12500,
    loyaltyPoints: 1200,
    phoneVerified: true,
    totalPurchases: 185000,
    segment: 'B2B Clients',
    assignedTemplateId: 'tpl-3'
  },
  {
    id: 'cust-5',
    name: 'Vikram Enterprise Wholesalers',
    phone: '+91 98333 44556',
    email: 'orders@vikramwholesale.in',
    address: 'APMC Market Yard, Vashi',
    creditBalance: 8200,
    loyaltyPoints: 850,
    phoneVerified: true,
    totalPurchases: 94000,
    segment: 'Wholesale Buyers',
    assignedTemplateId: 'tpl-3'
  },
  {
    id: 'cust-6',
    name: 'Sneha Kulkarni',
    phone: '+91 98700 11223',
    email: 'sneha.k@hotmail.com',
    address: '401 Hill Road, Bandra West',
    creditBalance: 0,
    loyaltyPoints: 210,
    phoneVerified: true,
    totalPurchases: 14800,
    segment: 'Regular Retail',
    assignedTemplateId: 'tpl-2'
  }
];

export const mockInvoices: POSInvoice[] = [
  {
    id: 'inv-1001',
    invoiceNumber: 'INV-2026-0805-01',
    storeId: 'store-1',
    storeName: 'Ellic Mart - Downtown Flagship',
    storeGSTIN: '27AAAAA0000A1Z5',
    storeAddress: '42 MG Road, Commercial Hub, Mumbai',
    customerName: 'Rahul Deshmukh',
    customerPhone: '+91 98211 22334',
    date: '2026-08-05 14:32',
    isGSTInvoice: true,
    items: [
      {
        productId: 'prod-101',
        productName: 'Organic Whole Milk 1L',
        quantity: 2,
        unitPrice: 66,
        discount: 0,
        taxRate: 5,
        taxAmount: 6.28,
        total: 132
      },
      {
        productId: 'prod-106',
        productName: 'Natural Almonds 500g',
        quantity: 1,
        unitPrice: 420,
        discount: 20,
        taxRate: 5,
        taxAmount: 19.05,
        total: 400
      }
    ],
    subtotal: 552,
    discountTotal: 20,
    cgst: 12.66,
    sgst: 12.66,
    igst: 0,
    grandTotal: 532,
    paymentMethod: 'upi',
    upiTxnRef: 'UPI/981273912/OKAXIS',
    loyaltyPointsEarned: 15,
    loyaltyPointsRedeemed: 0
  },
  {
    id: 'inv-1002',
    invoiceNumber: 'INV-2026-0805-02',
    storeId: 'store-1',
    storeName: 'Ellic Mart - Downtown Flagship',
    storeGSTIN: '27AAAAA0000A1Z5',
    storeAddress: '42 MG Road, Commercial Hub, Mumbai',
    customerName: 'Pooja Iyer',
    customerPhone: '+91 98999 77665',
    date: '2026-08-05 16:10',
    isGSTInvoice: true,
    items: [
      {
        productId: 'prod-103',
        productName: 'Extra Virgin Olive Oil 1L',
        quantity: 1,
        unitPrice: 1150,
        discount: 50,
        taxRate: 12,
        taxAmount: 117.85,
        total: 1100
      }
    ],
    subtotal: 1150,
    discountTotal: 50,
    cgst: 58.92,
    sgst: 58.92,
    igst: 0,
    grandTotal: 1100,
    paymentMethod: 'card',
    loyaltyPointsEarned: 33,
    loyaltyPointsRedeemed: 0
  }
];

export const mockRestockOrders: RestockOrder[] = [
  {
    id: 'ro-501',
    retailerStoreId: 'store-1',
    retailerName: 'Ellic Mart - Downtown Flagship',
    wholesalerId: 'ws-101',
    wholesalerName: 'Metro Mega Distribution Pvt Ltd',
    productId: 'prod-102',
    productName: 'Premium Basmati Rice 5kg',
    suggestedQty: 20,
    quotedQty: 20,
    quotedUnitPrice: 390,
    totalQuotedAmount: 7800,
    status: 'quotation_sent',
    createdAt: '2026-08-05 10:15',
    notes: 'Auto-triggered low stock alert (Stock: 8 / Threshold: 12).'
  },
  {
    id: 'ro-502',
    retailerStoreId: 'store-1',
    retailerName: 'Ellic Mart - Downtown Flagship',
    wholesalerId: 'ws-101',
    wholesalerName: 'Metro Mega Distribution Pvt Ltd',
    productId: 'prod-104',
    productName: 'Dark Roast Coffee Beans 500g',
    suggestedQty: 15,
    quotedQty: 15,
    quotedUnitPrice: 350,
    totalQuotedAmount: 5250,
    status: 'dispatched',
    createdAt: '2026-08-04 18:30',
    deliveryDate: '2026-08-06',
    trackingNumber: 'LOGX-998812',
    notes: 'Order confirmed and in transit via express dispatch.'
  }
];

export const mockCustomerOrders: CustomerOrder[] = [
  {
    id: 'co-901',
    orderNumber: 'ORD-ELLIC-7711',
    customerId: 'cust-1',
    customerName: 'Rahul Deshmukh',
    customerPhone: '+91 98211 22334',
    storeId: 'store-1',
    storeName: 'Ellic Mart - Downtown Flagship',
    orderType: 'pickup',
    items: [
      {
        productId: 'prod-104',
        productName: 'Dark Roast Coffee Beans 500g',
        quantity: 1,
        unitPrice: 520,
        image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&q=80&w=300'
      },
      {
        productId: 'prod-106',
        productName: 'Natural Almonds 500g',
        quantity: 2,
        unitPrice: 420,
        image: 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?auto=format&fit=crop&q=80&w=300'
      }
    ],
    totalAmount: 1360,
    paymentStatus: 'paid_online',
    paymentMethod: 'UPI',
    orderStatus: 'ready_for_pickup',
    createdAt: '2026-08-05 18:45',
    pickupQrCode: 'QR-PICKUP-ORD-7711'
  }
];

export const mockSuppliers: Supplier[] = [
  {
    id: 'sup-1',
    storeId: 'store-1',
    name: 'Maharashtra Agro & Dairy Ltd',
    contactPerson: 'Sunil Patil',
    phone: '+91 98200 11223',
    email: 'agro.orders@mahaagro.in',
    address: 'APMC Market Yard, Vashi, Navi Mumbai',
    gstin: '27AABCM8821K1Z4',
    categories: ['Dairy & Eggs', 'Grains & Pulses'],
    rating: 4.8,
    createdAt: '2026-01-10'
  },
  {
    id: 'sup-2',
    storeId: 'store-1',
    name: 'Hindustan Fast Consumer Goods',
    contactPerson: 'Rajesh Agarwal',
    phone: '+91 98300 44556',
    email: 'b2b@hfcg-distributors.com',
    address: 'Warehouse Complex #4, Bhiwandi',
    gstin: '27AABCH1092Q1Z9',
    categories: ['Snacks & Beverages', 'Instant Food'],
    rating: 4.6,
    createdAt: '2026-02-15'
  },
  {
    id: 'sup-3',
    storeId: 'store-2',
    name: 'Bandra Organic Farms Co.',
    contactPerson: 'Priya Hegde',
    phone: '+91 98400 77889',
    email: 'priya@bandraorganic.com',
    address: 'Linking Road, Bandra West, Mumbai',
    gstin: '27AAECB4491J1ZT',
    categories: ['Dairy & Eggs', 'Organic Staples'],
    rating: 4.9,
    createdAt: '2026-03-01'
  }
];

export const mockRestockLogs: RestockLog[] = [
  {
    id: 'rst-log-01',
    storeId: 'store-1',
    productId: 'prod-101',
    productName: 'Organic Whole Milk 1L',
    quantityAdded: 50,
    previousStock: 10,
    newStock: 60,
    date: '2026-08-04 10:30',
    addedBy: 'Rahul Sharma',
    addedById: 'emp-3',
    supplierId: 'sup-1',
    supplierName: 'Maharashtra Agro & Dairy Ltd',
    notes: 'Morning fresh milk delivery verified and stocked'
  },
  {
    id: 'rst-log-02',
    storeId: 'store-1',
    productId: 'prod-102',
    productName: 'Premium Basmati Rice 5kg',
    quantityAdded: 25,
    previousStock: 8,
    newStock: 33,
    date: '2026-08-05 14:15',
    addedBy: 'Rahul Sharma',
    addedById: 'emp-3',
    supplierId: 'sup-1',
    supplierName: 'Maharashtra Agro & Dairy Ltd',
    notes: 'Bulk sack restock received'
  }
];

export const mockBusinessApplications: BusinessApplication[] = [
  {
    id: 'app-001',
    businessName: 'Apex Electronics & Hardware',
    ownerName: 'Manish Chawla',
    email: 'manish@apexelectronics.in',
    phone: '+91 98760 12345',
    city: 'Pune',
    gstin: '27AABCA9912K1Z8',
    appliedAt: '2026-08-05 09:20',
    status: 'pending_review',
    assignedAdminId: 'admin-01',
    assignedAdminName: 'Siddharth Admin',
    selectedPlanId: 'plan-enterprise',
    notes: 'Storefront with 2 branches in Shivaji Nagar, Pune.'
  },
  {
    id: 'app-002',
    businessName: 'Royal Sweets & Bakery',
    ownerName: 'Deepak Purohit',
    email: 'deepak@royalsweets.com',
    phone: '+91 98111 55667',
    city: 'Ahmedabad',
    gstin: '24AAACD4421M1ZX',
    appliedAt: '2026-08-05 11:45',
    status: 'pending_review',
    assignedAdminId: 'admin-01',
    assignedAdminName: 'Siddharth Admin',
    selectedPlanId: 'plan-growth',
    notes: 'Requires dual billing counter for festive season peak.'
  },
  {
    id: 'app-003',
    businessName: 'Heritage Textiles & Apparels',
    ownerName: 'Sunita Mehra',
    email: 'sunita@heritagetextiles.in',
    phone: '+91 98222 88990',
    city: 'Jaipur',
    gstin: '08AABCH7712N1ZY',
    appliedAt: '2026-08-04 16:10',
    status: 'approved',
    assignedAdminId: 'admin-01',
    assignedAdminName: 'Siddharth Admin',
    reviewedAt: '2026-08-05 08:30',
    reviewedBy: 'Siddharth Admin',
    selectedPlanId: 'plan-growth',
    notes: 'Approved after verification of GSTIN and trade license.'
  }
];

export const mockEmployees: Employee[] = [
  {
    id: 'emp-1',
    storeId: 'store-1',
    clientId: 'client-001',
    assignedStoreIds: ['store-1', 'store-2', 'store-3'],
    name: 'Vikram Malhotra',
    role: 'owner',
    email: 'client@ellic.com',
    phone: '+91 98765 43210',
    permissions: {
      canApplyDiscount: true,
      inventoryEdit: true,
      reports: true,
      employeeManagement: true,
      restockOrders: true
    },
    status: 'active'
  },
  {
    id: 'emp-2',
    storeId: 'store-1',
    clientId: 'client-001',
    assignedStoreIds: ['store-1', 'store-2'],
    name: 'Siddharth Rao',
    role: 'manager',
    email: 'siddharth@ellicmart.com',
    phone: '+91 98111 22233',
    permissions: {
      canApplyDiscount: true,
      inventoryEdit: true,
      reports: true,
      employeeManagement: false,
      restockOrders: true
    },
    status: 'active'
  },
  {
    id: 'emp-3',
    storeId: 'store-1',
    clientId: 'client-001',
    assignedStoreIds: ['store-1', 'store-2'],
    name: 'Rahul Sharma',
    role: 'crew',
    email: 'crew@ellic.com',
    phone: '+91 98222 33344',
    permissions: {
      canApplyDiscount: false, // Strict Rule: Crew cannot apply or approve discounts
      inventoryEdit: true,
      reports: false,
      employeeManagement: false,
      restockOrders: true
    },
    status: 'active'
  },
  {
    id: 'emp-4',
    storeId: 'store-2',
    clientId: 'client-001',
    assignedStoreIds: ['store-2'],
    name: 'Ramesh Patel',
    role: 'crew',
    email: 'ramesh@ellicmart.com',
    phone: '+91 98333 44455',
    permissions: {
      canApplyDiscount: false, // Strict Rule: Crew cannot apply or approve discounts
      inventoryEdit: true,
      reports: false,
      employeeManagement: false,
      restockOrders: true
    },
    status: 'active'
  }
];

export const mockNotifications: AppNotification[] = [
  {
    id: 'notif-1',
    title: 'Low Stock Alert: Basmati Rice',
    message: 'Stock dropped to 8 units (Threshold: 12). Restock needed.',
    category: 'low_stock',
    timestamp: '10 mins ago',
    read: false,
    linkModule: 'retailer'
  },
  {
    id: 'notif-2',
    title: 'New Quotation Received',
    message: 'Maharashtra Agro & Dairy prepared quotation for 20x Basmati Rice @ ₹390/unit.',
    category: 'restock',
    timestamp: '25 mins ago',
    read: false,
    linkModule: 'retailer'
  },
  {
    id: 'notif-3',
    title: 'Customer Pickup Order Ready',
    message: 'Order #ORD-ELLIC-7711 by Rahul Deshmukh is ready for store pickup.',
    category: 'customer_order',
    timestamp: '1 hour ago',
    read: true,
    linkModule: 'retailer'
  },
  {
    id: 'notif-4',
    title: 'UPI Payment Confirmed',
    message: 'Invoice #INV-2026-0805-01 ₹532 paid via UPI.',
    category: 'payment',
    timestamp: '2 hours ago',
    read: true,
    linkModule: 'retailer'
  }
];

export const mockAuditLogs: AuditLog[] = [
  {
    id: 'log-1',
    user: 'Vikram Malhotra',
    role: 'owner',
    action: 'POS Sale Executed',
    details: 'Generated GST Invoice #INV-2026-0805-01 for ₹532',
    timestamp: '2026-08-05 14:32:10',
    ipAddress: '103.22.141.5',
    status: 'success'
  },
  {
    id: 'log-2',
    user: 'Metro Mega Wholesaler',
    role: 'wholesaler_admin',
    action: 'Quotation Generated',
    details: 'Submitted Restock Quote for PO #ro-501 (20 units Basmati Rice)',
    timestamp: '2026-08-05 10:15:22',
    ipAddress: '115.98.201.12',
    status: 'success'
  },
  {
    id: 'log-3',
    user: 'Rahul Deshmukh',
    role: 'customer',
    action: 'Pickup Order Placed',
    details: 'Placed Pickup Order #ORD-ELLIC-7711 online for ₹1,360',
    timestamp: '2026-08-05 18:45:00',
    ipAddress: '49.207.50.88',
    status: 'success'
  }
];

export const mockSubscriptions: SubscriptionPlan[] = [
  {
    id: 'plan-enterprise',
    name: 'Ellic Suite - Multi-Store Growth',
    tier: 'enterprise',
    priceMonthly: 2999,
    priceYearly: 29990,
    monthlyCharge: 2999,
    modulesIncluded: ['Multi-Store Isolation', 'Billing POS', 'Inventory Management', 'Supplier Management', 'Sales Reports', 'Crew Access Control'],
    activeStoresCount: 3,
    maxStores: 5,
    maxProducts: 10000,
    status: 'active',
    renewalDate: '2026-10-01',
    gracePeriodDays: 7
  }
];

export const mockInvoiceTemplates: InvoiceTemplate[] = [
  {
    id: 'tpl-luxury-gold-a4',
    name: 'A4 Elegant Gold GST Tax Invoice (Classic Ornament)',
    targetSegment: 'VIP / Corporate',
    paperSize: 'a4',
    templateStyle: 'a4_luxury_gold',
    isDefault: true,
    branding: {
      storeDisplayName: 'SK Trading Company',
      headerTagline: 'Annapurna Catering & Premium Wholesale',
      logoUrl: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&q=80&w=200',
      primaryColor: '#c59b27',
      accentColor: '#92400e',
      footerNote: 'Thank you for your business! Visit our online store at shreeramart.in',
      termsAndConditions: '1. Payment is due at the time of purchase; no credit offered.\n2. Goods cannot be returned or exchanged unless defective.\n3. All products are subject to availability, and prices may change without prior notice.\n4. The customer is responsible for checking product quality before purchase.\n5. Taxes applicable as per government regulations will be added to the final bill.'
    },
    variableFields: {
      showGSTIN: true,
      showCustomerPhone: true,
      showLoyaltyPoints: true,
      showUPIRef: true,
      showBarcodeQR: true,
      showItemTaxBreakdown: true,
      showItemDiscount: true,
      showPaymentSplitDetails: true,
      customHeaderFieldLabel: 'Sub Company',
      customHeaderFieldValue: 'Annapurna Catering'
    },
    columnSettings: {
      showSNo: true,
      showItemName: true,
      showItemDesc: true,
      showHSN: true,
      showBatchNo: false,
      showExpDate: false,
      showMfgDate: false,
      showQuantity: true,
      showMRP: true,
      showUnitPrice: true,
      showDiscount: false,
      showTax: true,
      showAmount: true
    },
    additionalInfo: {
      panNo: 'AAGCV9438G',
      bankName: 'State Bank of India, NARAINA',
      accountHolder: 'rohit',
      accountNo: '3425322435376423',
      ifscCode: 'sbin0001703',
      upiId: '3425322435376423@ybl',
      showUPIQR: true,
      showBankDetails: true,
      showTerms: true,
      showSignatureBlock: true,
      showAmountInWords: true,
      showDecorativeBorder: true,
      documentType: 'TAX INVOICE',
      dueDate: '2026-03-26',
      previousBalance: 73978,
      receivedAmount: 0
    },
    createdAt: '2026-08-01'
  },
  {
    id: 'tpl-custom-blueprint-a4',
    name: 'A4 Customizable Blueprint (Multi-Column Detailed)',
    targetSegment: 'Regular Retail',
    paperSize: 'a4',
    templateStyle: 'a4_modern_custom',
    isDefault: false,
    branding: {
      storeDisplayName: 'Business Name',
      headerTagline: 'Business karne ka naya tareeka',
      logoUrl: '',
      primaryColor: '#0284c7',
      accentColor: '#38bdf8',
      footerNote: 'Official GST Compliant Bill generated with custom layout columns.',
      termsAndConditions: '1. Verified GST Invoice eligible for ITC under CGST/SGST Acts.\n2. Goods once sold can only be replaced within 3 days with original packaging.'
    },
    variableFields: {
      showGSTIN: true,
      showCustomerPhone: true,
      showLoyaltyPoints: false,
      showUPIRef: true,
      showBarcodeQR: true,
      showItemTaxBreakdown: true,
      showItemDiscount: true,
      showPaymentSplitDetails: true,
      customHeaderFieldLabel: 'State',
      customHeaderFieldValue: 'Delhi'
    },
    columnSettings: {
      showSNo: true,
      showItemName: true,
      showItemDesc: true,
      showHSN: true,
      showBatchNo: true,
      showExpDate: true,
      showMfgDate: true,
      showQuantity: true,
      showMRP: false,
      showUnitPrice: true,
      showDiscount: true,
      showTax: true,
      showAmount: true
    },
    additionalInfo: {
      showUPIQR: true,
      showBankDetails: true,
      showTerms: true,
      showSignatureBlock: false,
      showAmountInWords: false,
      showDecorativeBorder: false,
      documentType: 'TAX INVOICE',
      receivedAmount: 14050,
      previousBalance: 0
    },
    createdAt: '2026-08-01'
  },
  {
    id: 'tpl-a5-raju-supply',
    name: 'A5 Landscape Compact Box Grid (Bill of Supply)',
    targetSegment: 'Wholesale Buyers',
    paperSize: 'a5_landscape',
    templateStyle: 'a5_compact_box',
    isDefault: false,
    branding: {
      storeDisplayName: 'Shree Raju Agencies',
      headerTagline: 'Trusted for quality • Prasad Salai, Block 9, Chennai - 600006',
      logoUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=200',
      primaryColor: '#0f172a',
      accentColor: '#dc2626',
      footerNote: 'Thank you for your business!',
      termsAndConditions: '1. Goods once sold will not be taken back or exchanged.\n2. All disputes are subject to Chennai jurisdiction only.'
    },
    variableFields: {
      showGSTIN: false,
      showCustomerPhone: true,
      showLoyaltyPoints: false,
      showUPIRef: true,
      showBarcodeQR: true,
      showItemTaxBreakdown: false,
      showItemDiscount: false,
      showPaymentSplitDetails: false
    },
    columnSettings: {
      showSNo: true,
      showItemName: true,
      showItemDesc: false,
      showHSN: false,
      showQuantity: true,
      showUnitPrice: false,
      showDiscount: false,
      showTax: false,
      showAmount: true
    },
    additionalInfo: {
      panNo: 'GGSDU9603R',
      bankName: 'State Bank of India, CHENNAI MAIN',
      accountHolder: 'Raju shree',
      accountNo: '377244297135925',
      ifscCode: 'SBIN0000800',
      upiId: '7777333333@ybl',
      showUPIQR: true,
      showBankDetails: true,
      showTerms: true,
      showSignatureBlock: false,
      showAmountInWords: false,
      showDecorativeBorder: false,
      documentType: 'BILL OF SUPPLY',
      recipientType: 'ORIGINAL FOR RECIPIENT',
      dueDate: '2026-12-07',
      receivedAmount: 5000,
      previousBalance: 27797
    },
    createdAt: '2026-08-02'
  },
  {
    id: 'tpl-a5-balaji-hardware',
    name: 'A5 Landscape Hardware & Transport Grid (Tax Invoice)',
    targetSegment: 'B2B Clients',
    paperSize: 'a5_landscape',
    templateStyle: 'a5_hardware_transport',
    isDefault: false,
    branding: {
      storeDisplayName: 'Shree Balaji Hardware Store',
      headerTagline: 'Most affordable Hardware store in town • Gol Chauraha, Indore',
      logoUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=200',
      primaryColor: '#0284c7',
      accentColor: '#0369a1',
      footerNote: 'Authorized Industrial & Hardware Distributors.',
      termsAndConditions: '1. Goods once sold will not be taken back or exchanged.\n2. All disputes are subject to Indore jurisdiction only.'
    },
    variableFields: {
      showGSTIN: true,
      showCustomerPhone: true,
      showLoyaltyPoints: false,
      showUPIRef: true,
      showBarcodeQR: true,
      showItemTaxBreakdown: true,
      showItemDiscount: false,
      showPaymentSplitDetails: false
    },
    columnSettings: {
      showSNo: true,
      showItemName: true,
      showItemDesc: false,
      showHSN: true,
      showQuantity: true,
      showUnitPrice: false,
      showDiscount: false,
      showTax: true,
      showAmount: true
    },
    additionalInfo: {
      panNo: 'YTERW9603R',
      challanNo: '10147',
      poNo: 'PN-122',
      ewayBillNo: '223',
      vehicleNo: 'MP-09-HG-4821',
      bankName: 'HDFC Bank, INDORE MAIN - MADHYA PRADESH',
      accountHolder: 'Rohit Prasad',
      accountNo: '6345464664664',
      ifscCode: 'HDFC0000036',
      upiId: '5345535555@ybl',
      showUPIQR: true,
      showBankDetails: true,
      showTerms: true,
      showSignatureBlock: false,
      showAmountInWords: false,
      showDecorativeBorder: false,
      documentType: 'TAX INVOICE',
      recipientType: 'ORIGINAL FOR RECIPIENT',
      dueDate: '2026-01-28',
      receivedAmount: 0,
      previousBalance: 0
    },
    createdAt: '2026-08-02'
  },
  {
    id: 'tpl-thermal-3inch',
    name: '3-Inch Thermal POS Roll (80mm Detailed)',
    targetSegment: 'Regular Retail',
    paperSize: 'thermal_3inch',
    templateStyle: 'thermal_3inch',
    isDefault: false,
    branding: {
      storeDisplayName: 'SuperMart Express',
      headerTagline: 'Doorstep delivery for large orders',
      logoUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=200',
      primaryColor: '#0f172a',
      accentColor: '#16a34a',
      footerNote: 'We offer doorstep delivery for large orders. Enquire at cash counter or call us for details.',
      termsAndConditions: '1. Goods once sold will not be taken back or exchanged.\n2. All disputes are subject to local jurisdiction only.'
    },
    variableFields: {
      showGSTIN: true,
      showCustomerPhone: true,
      showLoyaltyPoints: true,
      showUPIRef: true,
      showBarcodeQR: true,
      showItemTaxBreakdown: true,
      showItemDiscount: true,
      showPaymentSplitDetails: true
    },
    columnSettings: {
      showSNo: true,
      showItemName: true,
      showItemDesc: true,
      showHSN: true,
      showBatchNo: true,
      showExpDate: true,
      showMfgDate: true,
      showQuantity: true,
      showMRP: false,
      showUnitPrice: true,
      showDiscount: true,
      showTax: true,
      showAmount: true
    },
    additionalInfo: {
      showSavingsHighlight: true,
      showUPIQR: true,
      showBankDetails: false,
      showTerms: true,
      documentType: 'TAX INVOICE',
      receivedAmount: 1420,
      previousBalance: 0
    },
    createdAt: '2026-08-03'
  },
  {
    id: 'tpl-thermal-2inch',
    name: '2-Inch Thermal Mini POS Roll (58mm Compact)',
    targetSegment: 'Regular Retail',
    paperSize: 'thermal_2inch',
    templateStyle: 'thermal_2inch',
    isDefault: false,
    branding: {
      storeDisplayName: 'Quick Mart Mini',
      headerTagline: 'Fast Counter Express',
      primaryColor: '#0f172a',
      accentColor: '#1D4ED8',
      footerNote: '*** THANK YOU - VISIT AGAIN ***',
      termsAndConditions: 'No exchange without physical receipt.'
    },
    variableFields: {
      showGSTIN: true,
      showCustomerPhone: true,
      showLoyaltyPoints: false,
      showUPIRef: true,
      showBarcodeQR: true,
      showItemTaxBreakdown: false,
      showItemDiscount: true,
      showPaymentSplitDetails: false
    },
    columnSettings: {
      showSNo: true,
      showItemName: true,
      showItemDesc: false,
      showHSN: false,
      showQuantity: true,
      showUnitPrice: true,
      showDiscount: false,
      showTax: false,
      showAmount: true
    },
    additionalInfo: {
      showSavingsHighlight: true,
      documentType: 'TAX INVOICE'
    },
    createdAt: '2026-08-03'
  },
  {
    id: 'tpl-wholesale-intl',
    name: 'Global Multi-Currency Wholesale Export (USD / EUR Proforma)',
    targetSegment: 'Wholesale Buyers',
    paperSize: 'a4',
    templateStyle: 'standard',
    isDefault: false,
    branding: {
      storeDisplayName: 'Ellic Global Trade & Wholesale Supply',
      headerTagline: 'Cross-Border Supply Chain & International Distribution',
      primaryColor: '#092340',
      accentColor: '#2563eb',
      footerNote: 'International Trade Certified Bill. Payment via Telegraphic Transfer (T/T) or SWIFT Wire.',
      termsAndConditions: '1. Standard Incoterms 2020 apply.\n2. Foreign exchange conversion benchmarked against Interbank Spot FX.\n3. Goods insured under Marine Cargo Policy up to port of discharge.'
    },
    variableFields: {
      showGSTIN: true,
      showCustomerPhone: true,
      showLoyaltyPoints: false,
      showUPIRef: false,
      showBarcodeQR: true,
      showItemTaxBreakdown: true,
      showItemDiscount: true,
      showPaymentSplitDetails: false,
      showInternationalTradeDetails: true,
      showDualCurrencySummary: true,
      customHeaderFieldLabel: 'Bill of Lading / Export Ref',
      customHeaderFieldValue: 'EXP-GLB-2026-884'
    },
    internationalSettings: {
      primaryCurrency: 'USD',
      enableDualCurrency: true,
      secondaryCurrency: 'EUR',
      fxSpreadPercentage: 0.75,
      showExchangeRateOnBill: true,
      showSwiftIban: true,
      swiftCode: 'ELLXUS33NYC',
      ibanNumber: 'US89 3000 1234 5678 9012 34',
      bankName: 'Global International Trade Bank NA',
      beneficiaryName: 'Ellic Global Supply Corp.',
      incoterms: 'CIF',
      portOfLoadingOrDischarge: 'Port of Nhava Sheva / Port of Rotterdam',
      countryOfOrigin: 'India',
      customsTariffHSN: 'HSN 0402.10.00 / 1509.10.00',
      vatTaxRegistrationNumber: 'EU-VAT-992384102'
    },
    createdAt: '2026-08-03'
  },
  {
    id: 'tpl-gulf-proforma',
    name: 'Middle East & Gulf Proforma Invoice (AED / SAR)',
    targetSegment: 'Wholesale Buyers',
    paperSize: 'a4',
    templateStyle: 'standard',
    isDefault: false,
    branding: {
      storeDisplayName: 'Ellic Middle East Trading FZ-LLC',
      headerTagline: 'GCC Wholesaler & Institutional Distributor',
      primaryColor: '#064e3b',
      accentColor: '#d97706',
      footerNote: 'Federal Tax Authority (FTA) Compliant Tax Invoice & Customs Clearance.',
      termsAndConditions: '1. Payment in AED / USD within 30 days.\n2. Subject to Dubai International Financial Centre (DIFC) arbitration laws.'
    },
    variableFields: {
      showGSTIN: false,
      showCustomerPhone: true,
      showLoyaltyPoints: false,
      showUPIRef: false,
      showBarcodeQR: true,
      showItemTaxBreakdown: true,
      showItemDiscount: true,
      showPaymentSplitDetails: false,
      showInternationalTradeDetails: true,
      showDualCurrencySummary: true,
      customHeaderFieldLabel: 'GCC Customs Clearance ID',
      customHeaderFieldValue: 'GCC-DXB-991204'
    },
    internationalSettings: {
      primaryCurrency: 'AED',
      enableDualCurrency: true,
      secondaryCurrency: 'SAR',
      fxSpreadPercentage: 0.25,
      showExchangeRateOnBill: true,
      showSwiftIban: true,
      swiftCode: 'EBILAEADXXX',
      ibanNumber: 'AE07 0331 2345 6789 0123 45',
      bankName: 'Emirates Global Islamic Bank PJSC',
      beneficiaryName: 'Ellic Middle East Trading LLC',
      incoterms: 'DAP',
      portOfLoadingOrDischarge: 'Jebel Ali Port / Port of Dammam',
      countryOfOrigin: 'United Arab Emirates',
      customsTariffHSN: 'GCC-HSN 2106.90',
      vatTaxRegistrationNumber: 'TRN 100234567800003'
    },
    createdAt: '2026-08-05'
  }
];

