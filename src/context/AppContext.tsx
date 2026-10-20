import React, { createContext, useContext, useState, useEffect } from 'react';
import { HerbalProduct, StockLedgerEntry, Outlet, B2BOrder, UserRole, NavigationPath } from '../types';
import { initialProducts, initialLedgerEntries, initialOutlets, initialOrders } from '../data/mockData';

interface ToastState {
  show: boolean;
  message: string;
  icon?: string;
}

interface AppContextType {
  products: HerbalProduct[];
  ledger: StockLedgerEntry[];
  outlets: Outlet[];
  orders: B2BOrder[];
  currentRole: UserRole;
  currentPath: NavigationPath;
  isOnline: boolean;
  isDarkMode: boolean;
  isSidebarCollapsed: boolean;
  toast: ToastState;
  setRole: (role: UserRole) => void;
  setPath: (path: NavigationPath) => void;
  toggleOnlineStatus: () => void;
  toggleDarkMode: () => void;
  toggleSidebar: () => void;
  showToast: (message: string, icon?: string) => void;
  addInboundBatch: (params: {
    sku: string;
    batch: string;
    qty: number;
    expiryDate: string;
    docRef: string;
  }) => void;
  approveOrder: (orderId: string) => void;
  batchApproveOrders: (orderIds: string[]) => void;
  rejectOrder: (orderId: string, reason?: string) => void;
  addOutlet: (outlet: Partial<Outlet>) => void;
  submitFieldSalesOrder: (newOrder: Partial<B2BOrder>) => void;
  selectedOutletId: string;
  setSelectedOutletId: (id: string) => void;
  offlineQueue: B2BOrder[];
  supplierPOs: import('../types').SupplierPO[];
  salesVisits: import('../types').SalesVisit[];
  driverManifests: import('../types').DriverManifest[];
  createSupplierPO: (params: {
    sku: string;
    productName: string;
    vendorName: string;
    quantity: number;
    unitPrice: number;
    leadTimeDays: number;
  }) => void;
  adjustStock: (params: {
    sku: string;
    batch: string;
    quantityDelta: number;
    reason: string;
    auditorName: string;
  }) => void;
  scheduleSalesVisit: (params: {
    outletId: string;
    outletName: string;
    salesRep: string;
    scheduledDate: string;
    purpose: import('../types').SalesVisit['purpose'];
    notes: string;
  }) => void;
  substituteOrderBatch: (params: {
    orderId: string;
    sku: string;
    newBatch: string;
    sourceWarehouse: string;
  }) => void;
  adjustOrderQuantity: (params: {
    orderId: string;
    sku: string;
    newQty: number;
  }) => void;
  markOrderDelivered: (orderId: string, driverName: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<HerbalProduct[]>(initialProducts);
  const [ledger, setLedger] = useState<StockLedgerEntry[]>(initialLedgerEntries);
  const [outlets, setOutlets] = useState<Outlet[]>(initialOutlets);
  const [orders, setOrders] = useState<B2BOrder[]>(initialOrders);
  const [currentRole, setCurrentRole] = useState<UserRole>('executive');
  const [currentPath, setCurrentPath] = useState<NavigationPath>('inventory-stock-ledger');
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(true);
  const [selectedOutletId, setSelectedOutletId] = useState<string>('AP-SLO-001');
  const [toast, setToast] = useState<ToastState>({ show: false, message: '', icon: 'check_circle' });
  const [offlineQueue, setOfflineQueue] = useState<B2BOrder[]>([]);

  const [supplierPOs, setSupplierPOs] = useState<import('../types').SupplierPO[]>([
    {
      id: 'PO-SUPP-2026-001',
      sku: 'SKU-ARB-HBT100',
      productName: 'Habbatussauda Oil Softgel 100s',
      vendorName: 'CV Sumber Herbal Barokah Solo',
      quantity: 300,
      unitPrice: 55000,
      totalCost: 16500000,
      leadTimeDays: 7,
      expectedDate: '04 Apr 2026',
      status: 'DALAM_PRODUKSI',
      createdAt: '28 Mar 2026, 09:00 WIB'
    }
  ]);

  const [salesVisits, setSalesVisits] = useState<import('../types').SalesVisit[]>([
    {
      id: 'VISIT-001',
      outletId: 'AP-SLO-001',
      outletName: 'Apotek Kimia Farma Slamet Riyadi',
      salesRep: 'Budi Santoso',
      scheduledDate: '30 Mar 2026, 10:00 WIB',
      purpose: 'Kunjungan Rutin',
      notes: 'Pengecekan display etalase depan dan follow-up pemesanan paket 3 varian',
      status: 'TERJADWAL'
    },
    {
      id: 'VISIT-002',
      outletId: 'AP-KRA-023',
      outletName: 'Apotek K-24 Karanganyar',
      salesRep: 'Agus Hermawan',
      scheduledDate: '31 Mar 2026, 14:00 WIB',
      purpose: 'Penagihan Tempo',
      notes: 'Faktur tempo 12 Mei dan pengantaran faktur pajak asli',
      status: 'TERJADWAL'
    }
  ]);

  const [driverManifests, setDriverManifests] = useState<import('../types').DriverManifest[]>([
    {
      driverName: 'Joko Susilo',
      vehiclePlate: 'AD-8941-KA (GranMax Box)',
      routeArea: 'Solo Tengah & Laweyan',
      wave: 'Wave 1 (08:00 - 12:00 WIB)',
      totalOutlets: 8,
      orders: [
        {
          orderId: 'ord-7f3b89-20260328',
          outletName: 'Apotek Kimia Farma Slamet Riyadi',
          address: 'Jl. Slamet Riyadi No. 340, Laweyan',
          amount: 8450000,
          delivered: false
        },
        {
          orderId: 'ord-1102e-20260328',
          outletName: 'Apotek K-24 UNS Kentingan',
          address: 'Jl. Ir. Sutami No. 36, Jebres',
          amount: 12600000,
          delivered: true,
          deliveredTime: '10:35 WIB'
        }
      ]
    },
    {
      driverName: 'Hartono Prabowo',
      vehiclePlate: 'AD-1044-YB (BlindVan)',
      routeArea: 'Sukoharjo & Solo Baru',
      wave: 'Wave 2 (13:00 - 17:00 WIB)',
      totalOutlets: 6,
      orders: [
        {
          orderId: 'ord-88c2f-20260328',
          outletName: 'Minimarket Sumber Rejeki Jaya',
          address: 'Jl. Pemuda No. 18, Boyolali',
          amount: 3120000,
          delivered: false
        }
      ]
    }
  ]);

  const showToast = (message: string, icon: string = 'check_circle') => {
    setToast({ show: true, message, icon });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 3500);
  };

  const setRole = (role: UserRole) => {
    setCurrentRole(role);
    if (role === 'field-sales') {
      setCurrentPath('field-sales-pwa-preview');
      showToast('Beralih ke mode Field Sales Rep (Mobile PWA)', 'smartphone');
    } else if (role === 'inventory') {
      setCurrentPath('inventory-stock-ledger');
      showToast('Beralih ke Manajemen Gudang & Stock Ledger', 'warehouse');
    } else if (role === 'sales-ops') {
      setCurrentPath('order-approval-queue');
      showToast('Beralih ke Antrean Otorisasi Pesanan', 'fact_check');
    } else {
      setCurrentPath('executive-dashboard');
      showToast('Beralih ke Executive Director & Management', 'dashboard');
    }
  };

  const setPath = (path: NavigationPath) => {
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleOnlineStatus = () => {
    const nextStatus = !isOnline;
    setIsOnline(nextStatus);

    if (nextStatus && offlineQueue.length > 0) {
      setOrders(prev =>
        prev.map(o =>
          o.syncStatus === 'OFFLINE_QUEUED' ? { ...o, syncStatus: 'SYNCED_DEDUCTED' } : o
        )
      );
      const count = offlineQueue.length;
      setOfflineQueue([]);
      showToast(`Online kembali: ${count} pesanan lokal disinkronisasi ke pusat!`, 'cloud_done');
    } else {
      showToast(
        nextStatus
          ? 'Status: Online - Semua data tersinkronisasi instan'
          : 'Status: Offline - Transaksi disimpan di IndexedDB lokal',
        nextStatus ? 'cloud_done' : 'cloud_off'
      );
    }
  };

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
    document.documentElement.classList.toggle('dark');
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(prev => !prev);
  };

  const addInboundBatch = ({
    sku,
    batch,
    qty,
    expiryDate,
    docRef
  }: {
    sku: string;
    batch: string;
    qty: number;
    expiryDate: string;
    docRef: string;
  }) => {
    const prod = products.find(p => p.sku === sku);
    const prodName = prod ? prod.name : 'Produk Herbal';
    const newStock = prod ? prod.stock + qty : qty;

    // Update product stock
    setProducts(prev =>
      prev.map(p => {
        if (p.sku === sku) {
          const updated = p.stock + qty;
          return {
            ...p,
            stock: updated,
            activeBatch: batch,
            fefoDate: expiryDate,
            status: updated >= p.rop ? 'optimal' : 'below-rop'
          };
        }
        return p;
      })
    );

    // Add immutable ledger entry
    const newEntry: StockLedgerEntry = {
      id: `LEDG-${Math.floor(10000 + Math.random() * 90000)}`,
      timestamp: 'Baru saja • Real-time',
      docRef,
      skuName: prodName,
      skuCode: sku,
      batch,
      type: 'MASUK',
      quantity: qty,
      finalStock: newStock,
      operator: 'Admin Operasional',
      operatorRole: 'Warehouse Inbound',
      hash: `${Math.random().toString(36).substring(2, 6)}...${Math.random().toString(36).substring(2, 6)}`
    };

    setLedger(prev => [newEntry, ...prev]);
    showToast(`Penerimaan +${qty} unit (${batch}) berhasil dicatat ke Ledger!`, 'check_circle');
  };

  const approveOrder = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    // Deduct stock for each item in the order
    setProducts(prev =>
      prev.map(p => {
        const item = order.items.find(i => i.sku === p.sku || p.sku.includes(i.sku) || i.sku.includes(p.sku.replace('SKU-ARB-', '')));
        if (item) {
          const updatedStock = Math.max(0, p.stock - item.quantity);
          return {
            ...p,
            stock: updatedStock,
            status: updatedStock <= p.safetyStock ? 'below-rop' : p.status
          };
        }
        return p;
      })
    );

    // Prepend KELUAR rows in Ledger for each item
    const newLedgerRows: StockLedgerEntry[] = order.items.map(item => ({
      id: `LEDG-${Math.floor(10000 + Math.random() * 90000)}`,
      timestamp: 'Baru saja • Real-time',
      docRef: order.clientUuid,
      skuName: item.name,
      skuCode: item.sku,
      batch: item.batch.replace('Batch: ', ''),
      type: 'KELUAR',
      quantity: -item.quantity,
      finalStock: Math.max(0, item.remainingBatchStock - item.quantity),
      operator: order.salesRep,
      operatorRole: `Field Sales ${order.salesRepId}`,
      hash: `${Math.random().toString(36).substring(2, 6)}...${Math.random().toString(36).substring(2, 6)}`
    }));

    setLedger(prev => [...newLedgerRows, ...prev]);

    // Update order status
    setOrders(prev =>
      prev.map(o => {
        if (o.id === orderId) {
          return {
            ...o,
            status: 'APPROVED',
            syncStatus: 'SYNCED_DEDUCTED'
          };
        }
        return o;
      })
    );

    showToast(`Pesanan ${order.outletName} berhasil disetujui & stok dipotong otomatis!`, 'task_alt');
  };

  const batchApproveOrders = (orderIds: string[]) => {
    orderIds.forEach(id => approveOrder(id));
    showToast(`${orderIds.length} pesanan berhasil disetujui & dialokasikan ke armada pengiriman!`, 'done_all');
  };

  const rejectOrder = (orderId: string, reason?: string) => {
    setOrders(prev =>
      prev.map(o => (o.id === orderId ? { ...o, status: 'REJECTED' } : o))
    );
    showToast(`Pesanan #${orderId} ditolak: ${reason || 'Pembatalan manual'}`, 'block');
  };

  const addOutlet = (newOutlet: Partial<Outlet>) => {
    const id = `AP-SLO-${168 + outlets.length + 1}`;
    const fullOutlet: Outlet = {
      id,
      code: id,
      name: newOutlet.name || 'Apotek Mitra Baru',
      address: newOutlet.address || 'Solo Raya',
      city: newOutlet.city || 'Solo',
      cityName: newOutlet.cityName || 'Surakarta',
      type: newOutlet.type || 'Apotek Mandiri',
      picName: newOutlet.picName || 'Apoteker Penanggung Jawab',
      picRole: 'Apoteker Pengelola Apotek (APA)',
      picPhone: newOutlet.picPhone || '62812000000',
      salesRep: newOutlet.salesRep || 'Budi Santoso',
      salesArea: 'Solo Tengah',
      terms: newOutlet.terms || 'Net 30 Hari',
      creditLimit: newOutlet.creditLimit || 10000000,
      creditUsed: 0,
      creditRemaining: newOutlet.creditLimit || 10000000,
      creditStatus: 'Lancar',
      lastOrderDate: 'Hari Ini (Baru)',
      orderFrequency: 'Akun Baru',
      ytdTotal: 0,
      lastVisitDate: 'Hari Ini',
      visitNotes: `"Outlet baru berhasil didaftarkan ke sistem ERP CV Arba'in. Alokasi rute pengiriman telah terdaftar."`
    };

    setOutlets(prev => [fullOutlet, ...prev]);
    setSelectedOutletId(id);
    showToast(`Outlet ${fullOutlet.name} (${id}) berhasil didaftarkan!`, 'add_business');
  };

  const submitFieldSalesOrder = (newOrder: Partial<B2BOrder>) => {
    const id = `ord-${Math.random().toString(36).substring(2, 7)}-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}`;
    const orderObj: B2BOrder = {
      id,
      clientUuid: id,
      outletId: newOrder.outletId || 'AP-SLO-001',
      outletName: newOrder.outletName || 'Apotek Mitra',
      address: newOrder.address || 'Surakarta',
      city: newOrder.city || 'Surakarta',
      salesRep: newOrder.salesRep || 'Budi Santoso',
      salesRepId: 'REP-SR-04',
      orderTime: 'Baru saja (<1m lalu)',
      orderTimestamp: Date.now(),
      totalAmount: newOrder.totalAmount || 0,
      terms: newOrder.terms || 'Net 30 Hari',
      limitMax: 15000000,
      limitRemaining: 8000000,
      geofenceValid: true,
      geofenceCoords: '-7.5583, 110.8214 (Presisi GPS)',
      npwp: '01.324.891.4-528.000',
      status: 'PENDING',
      syncStatus: isOnline ? 'SYNCED_DEDUCTED' : 'OFFLINE_QUEUED',
      priority: 'Normal',
      items: newOrder.items || []
    };

    if (!isOnline) {
      setOfflineQueue(prev => [orderObj, ...prev]);
    }

    setOrders(prev => [orderObj, ...prev]);
    showToast(
      isOnline
        ? `Pesanan ${orderObj.outletName} dikirim ke antrean pusat!`
        : `Pesanan disimpan di offline storage lokal (akan sync otomatis saat online)`,
      isOnline ? 'cloud_upload' : 'save'
    );
  };

  const createSupplierPO = ({
    sku,
    productName,
    vendorName,
    quantity,
    unitPrice,
    leadTimeDays
  }: {
    sku: string;
    productName: string;
    vendorName: string;
    quantity: number;
    unitPrice: number;
    leadTimeDays: number;
  }) => {
    const expDate = new Date();
    expDate.setDate(expDate.getDate() + leadTimeDays);
    const newPO: import('../types').SupplierPO = {
      id: `PO-SUPP-2026-${Math.floor(100 + Math.random() * 900)}`,
      sku,
      productName,
      vendorName,
      quantity,
      unitPrice,
      totalCost: quantity * unitPrice,
      leadTimeDays,
      expectedDate: expDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
      status: 'TERKIRIM',
      createdAt: 'Baru saja'
    };

    setSupplierPOs(prev => [newPO, ...prev]);
    showToast(`PO Supplier ${newPO.id} berhasil diterbitkan ke ${vendorName}!`, 'local_mall');
  };

  const adjustStock = ({
    sku,
    batch,
    quantityDelta,
    reason,
    auditorName
  }: {
    sku: string;
    batch: string;
    quantityDelta: number;
    reason: string;
    auditorName: string;
  }) => {
    const prod = products.find(p => p.sku === sku);
    const prodName = prod ? prod.name : 'Produk Herbal';
    const newStock = Math.max(0, (prod ? prod.stock : 0) + quantityDelta);

    setProducts(prev =>
      prev.map(p => {
        if (p.sku === sku) {
          const updated = Math.max(0, p.stock + quantityDelta);
          return {
            ...p,
            stock: updated,
            status: updated <= p.safetyStock ? 'below-rop' : 'optimal'
          };
        }
        return p;
      })
    );

    const newEntry: StockLedgerEntry = {
      id: `LEDG-${Math.floor(10000 + Math.random() * 90000)}`,
      timestamp: 'Baru saja • Real-time',
      docRef: `ADJ-${Math.floor(100 + Math.random() * 900)}`,
      skuName: prodName,
      skuCode: sku,
      batch,
      type: 'PENYESUAIAN',
      quantity: quantityDelta,
      finalStock: newStock,
      operator: auditorName || 'Dewi Lestari',
      operatorRole: 'Chief Auditor Intern',
      hash: `${Math.random().toString(36).substring(2, 6)}...${Math.random().toString(36).substring(2, 6)}`
    };

    setLedger(prev => [newEntry, ...prev]);
    showToast(`Penyesuaian stok (${quantityDelta > 0 ? '+' : ''}${quantityDelta} unit) dicatat ke Ledger: ${reason}`, 'tune');
  };

  const substituteOrderBatch = ({
    orderId,
    sku,
    newBatch,
    sourceWarehouse
  }: {
    orderId: string;
    sku: string;
    newBatch: string;
    sourceWarehouse: string;
  }) => {
    setOrders(prev =>
      prev.map(o => {
        if (o.id === orderId) {
          const updatedItems = o.items.map(it => {
            if (it.sku === sku || it.name.includes(sku)) {
              return {
                ...it,
                batch: `Batch: ${newBatch} (${sourceWarehouse})`,
                allocated: true
              };
            }
            return it;
          });
          return {
            ...o,
            items: updatedItems,
            stockWarning: undefined
          };
        }
        return o;
      })
    );
    showToast(`Batch dialihkan ke ${newBatch} (${sourceWarehouse}). Pesanan siap disetujui!`, 'swap_horiz');
  };

  const adjustOrderQuantity = ({
    orderId,
    sku,
    newQty
  }: {
    orderId: string;
    sku: string;
    newQty: number;
  }) => {
    setOrders(prev =>
      prev.map(o => {
        if (o.id === orderId) {
          const updatedItems = o.items.map(it => {
            if (it.sku === sku) {
              return {
                ...it,
                quantity: newQty,
                subtotal: newQty * it.unitPrice
              };
            }
            return it;
          });
          const newTotal = updatedItems.reduce((acc, it) => acc + it.subtotal, 0);
          return {
            ...o,
            items: updatedItems,
            totalAmount: newTotal
          };
        }
        return o;
      })
    );
    showToast(`Kuantitas SKU ${sku} disesuaikan menjadi ${newQty} unit!`, 'tune');
  };

  const markOrderDelivered = (orderId: string, driverName: string) => {
    setDriverManifests(prev =>
      prev.map(m => {
        const orderIndex = m.orders.findIndex(o => o.orderId === orderId);
        if (orderIndex >= 0) {
          const updatedOrders = [...m.orders];
          updatedOrders[orderIndex] = {
            ...updatedOrders[orderIndex],
            delivered: true,
            deliveredTime: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB'
          };
          return { ...m, orders: updatedOrders };
        }
        return m;
      })
    );

    setOrders(prev =>
      prev.map(o => (o.clientUuid === orderId || o.id === orderId ? { ...o, status: 'DISPATCHED' } : o))
    );

    showToast(`Bukti Serah Terima (POD) berhasil dicatat oleh Driver ${driverName}!`, 'verified');
  };

  const scheduleSalesVisit = (params: {
    outletId: string;
    outletName: string;
    salesRep: string;
    scheduledDate: string;
    purpose: import('../types').SalesVisit['purpose'];
    notes: string;
  }) => {
    const newVisit: import('../types').SalesVisit = {
      id: `VISIT-${Math.floor(100 + Math.random() * 900)}`,
      ...params,
      status: 'TERJADWAL'
    };
    setSalesVisits(prev => [newVisit, ...prev]);

    setOutlets(prev =>
      prev.map(o => {
        if (o.id === params.outletId || o.code === params.outletId) {
          return {
            ...o,
            lastVisitDate: params.scheduledDate,
            visitNotes: `"${params.purpose}: ${params.notes}"`
          };
        }
        return o;
      })
    );

    showToast(`Kunjungan ke ${params.outletName} dijadwalkan pada ${params.scheduledDate}`, 'event_available');
  };

  return (
    <AppContext.Provider
      value={{
        products,
        ledger,
        outlets,
        orders,
        currentRole,
        currentPath,
        isOnline,
        isDarkMode,
        isSidebarCollapsed,
        toast,
        offlineQueue,
        supplierPOs,
        salesVisits,
        driverManifests,
        setRole,
        setPath,
        toggleOnlineStatus,
        toggleDarkMode,
        toggleSidebar,
        showToast,
        addInboundBatch,
        createSupplierPO,
        adjustStock,
        approveOrder,
        batchApproveOrders,
        rejectOrder,
        substituteOrderBatch,
        adjustOrderQuantity,
        markOrderDelivered,
        scheduleSalesVisit,
        addOutlet,
        submitFieldSalesOrder,
        selectedOutletId,
        setSelectedOutletId
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
