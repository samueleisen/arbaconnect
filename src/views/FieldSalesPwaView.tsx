import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { HerbalProduct, OrderItem } from '../types';

export const FieldSalesPwaView: React.FC = () => {
  const {
    products,
    outlets,
    isOnline,
    toggleOnlineStatus,
    submitFieldSalesOrder,
    selectedOutletId,
    offlineQueue,
    showToast
  } = useApp();

  const [isPhoneFrame, setIsPhoneFrame] = useState(true);
  const [selectedOutletCode, setSelectedOutletCode] = useState(() => {
    const match = outlets.find(o => o.id === selectedOutletId || o.code === selectedOutletId);
    return match ? match.code : 'AP-SLO-001';
  });

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [productSearch, setProductSearch] = useState<string>('');
  const [cart, setCart] = useState<{ [sku: string]: number }>({
    'SKU-ARB-MDR500': 6,
    'SKU-ARB-HBT100': 4
  });
  const [selectedTerm, setSelectedTerm] = useState('Net 30 Hari');
  const [orderNotes, setOrderNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showThermalReceipt, setShowThermalReceipt] = useState(false);

  // GPS Geofence state for outdoor check-in
  const [gpsCheckedIn, setGpsCheckedIn] = useState(true);
  const [gpsDistance, setGpsDistance] = useState(12);
  const [checkinTime, setCheckinTime] = useState('10:15 WIB');

  const currentOutlet = outlets.find(o => o.code === selectedOutletCode) || outlets[0];

  const updateCartQty = (sku: string, delta: number) => {
    setCart(prev => {
      const current = prev[sku] || 0;
      const next = Math.max(0, current + delta);
      if (next === 0) {
        const copy = { ...prev };
        delete copy[sku];
        return copy;
      }
      return { ...prev, [sku]: next };
    });
  };

  const calculateTotal = () => {
    return Object.entries(cart).reduce((total, [sku, qty]) => {
      const prod = products.find(p => p.sku === sku);
      return total + (prod ? prod.unitPrice * qty : 0);
    }, 0);
  };

  const totalQuantity = Object.values(cart).reduce((a, b) => a + b, 0);
  const totalAmount = calculateTotal();

  const handleGpsCheckIn = () => {
    const dist = Math.floor(8 + Math.random() * 12);
    const now = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    setGpsDistance(dist);
    setGpsCheckedIn(true);
    setCheckinTime(`${now} WIB`);
    showToast(`GPS Check-in: ${dist}m dari ${currentOutlet.name} (${now} WIB)`, 'pin_drop');
  };

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (totalQuantity === 0) {
      showToast('Pilih minimal satu produk herbal untuk dipesan', 'warning');
      return;
    }

    setIsSubmitting(true);

    const items: OrderItem[] = Object.entries(cart).map(([sku, qty]) => {
      const prod = products.find(p => p.sku === sku) as HerbalProduct;
      return {
        sku: prod.sku.replace('SKU-', ''),
        name: prod.name,
        batch: `Batch: ${prod.activeBatch}`,
        expiry: prod.fefoDate,
        fefoPriority: 'FEFO Prioritas 1',
        quantity: qty,
        unitPrice: prod.unitPrice,
        subtotal: prod.unitPrice * qty,
        allocated: true,
        remainingBatchStock: prod.stock
      };
    });

    setTimeout(() => {
      submitFieldSalesOrder({
        outletId: currentOutlet.code,
        outletName: currentOutlet.name,
        address: currentOutlet.address,
        city: currentOutlet.cityName,
        salesRep: 'Budi Santoso',
        salesRepId: 'REP-SR-04',
        terms: selectedTerm,
        totalAmount: totalAmount,
        items
      });
      setIsSubmitting(false);
      setShowThermalReceipt(true);
    }, 500);
  };

  // Filter products for outdoor order catalog
  const filteredProducts = products.filter(prod => {
    const matchesCategory =
      activeCategory === 'all' ||
      (activeCategory === 'madu' && prod.category === 'Madu Herbal') ||
      (activeCategory === 'kapsul' && prod.category === 'Kapsul Herbal') ||
      (activeCategory === 'minyak' && prod.category === 'Minyak & Cairan') ||
      (activeCategory === 'serbuk' && prod.category === 'Serbuk');

    const matchesSearch =
      prod.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      prod.sku.toLowerCase().includes(productSearch.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const handleShareWhatsApp = () => {
    const itemsText = Object.entries(cart)
      .map(([sku, qty]) => {
        const prod = products.find(p => p.sku === sku);
        return `• ${prod?.name}: ${qty} unit (Rp ${(prod?.unitPrice || 0) * qty})`;
      })
      .join('%0A');

    const message = `*SURAT PESANAN B2B - CV ARBA'IN*%0AOutlet: ${currentOutlet.name}%0ATanggal: ${new Date().toLocaleDateString('id-ID')}%0ASales: Budi Santoso%0ATermin: ${selectedTerm}%0A%0A*Rincian Produk:*%0A${itemsText}%0A%0A*Total: Rp ${totalAmount.toLocaleString('id-ID')}*%0A_Garansi resmi CDOB & FEFO CV Arba'in_`;
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  return (
    <div className="flex flex-col items-center w-full pb-12">
      {/* Viewport Control Bar */}
      <div className="w-full max-w-xl flex items-center justify-between mb-4 bg-surface-container-lowest p-3 rounded-xl border border-border-subtle/50 text-xs text-on-surface-variant">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[18px]">smartphone</span>
          <span className="font-semibold text-on-surface">Field Sales Mobile App</span>
          <span className="hidden sm:inline">· PWA Lapangan</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsPhoneFrame(true)}
            className={`px-2.5 py-1 rounded-md font-medium cursor-pointer transition-colors ${
              isPhoneFrame
                ? 'bg-primary text-white'
                : 'bg-surface-container hover:bg-surface-container-high text-on-surface'
            }`}
            type="button"
          >
            Smartphone (390px)
          </button>
          <button
            onClick={() => setIsPhoneFrame(false)}
            className={`px-2.5 py-1 rounded-md font-medium cursor-pointer transition-colors ${
              !isPhoneFrame
                ? 'bg-primary text-white'
                : 'bg-surface-container hover:bg-surface-container-high text-on-surface'
            }`}
            type="button"
          >
            Layar Penuh
          </button>
        </div>
      </div>

      {/* Smartphone Body Simulation Container (Exempted from 10% scale to preserve 100% phone proportions) */}
      <div
        style={isPhoneFrame ? { zoom: 1.1111 } : undefined}
        className={`w-full transition-all duration-200 ${
          isPhoneFrame
            ? 'max-w-[400px] rounded-3xl border border-border-subtle/70 bg-surface shadow-xl overflow-hidden'
            : 'max-w-2xl bg-surface rounded-2xl border border-border-subtle/60 p-4'
        }`}
      >
        {/* Smartphone App Frame */}
        <div className="flex flex-col min-h-[680px] bg-white text-slate-900 relative">
          {/* Top Bar - Sales Profile & Offline Switch */}
          <div className="bg-[#005c55] text-white px-4 py-3 sticky top-0 z-30 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-xs text-white">
                BS
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-xs leading-tight">Budi Santoso</span>
                <span className="text-[11px] text-teal-100 font-medium">Sales Rep · Solo Raya</span>
              </div>
            </div>

            {/* Offline/Online Network Indicator Button */}
            <button
              onClick={toggleOnlineStatus}
              title="Klik untuk simulasi mode Online/Offline"
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                isOnline
                  ? 'bg-white/15 text-white hover:bg-white/25'
                  : 'bg-amber-400 text-slate-950 font-bold'
              }`}
              type="button"
            >
              <span
                className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-300' : 'bg-amber-950'}`}
              />
              <span>{isOnline ? 'Online' : 'Offline'}</span>
              {!isOnline && offlineQueue.length > 0 && (
                <span className="ml-1 px-1 bg-amber-900 text-amber-200 text-[10px] rounded">
                  {offlineQueue.length}
                </span>
              )}
            </button>
          </div>

          {/* Main App Body */}
          <div className="flex-1 p-3.5 space-y-3 pb-24 overflow-y-auto">
            {/* Step 1: Outdoor GPS Check-In & Outlet Card */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] uppercase tracking-wider font-bold text-slate-600">
                  Target Outlet Mitra
                </label>
                {/* 1-Tap GPS Geofence Check-in Button */}
                <button
                  type="button"
                  onClick={handleGpsCheckIn}
                  className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold cursor-pointer transition-colors ${
                    gpsCheckedIn
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : 'bg-amber-100 text-amber-900 border border-amber-200'
                  }`}
                >
                  <span className="material-symbols-outlined text-[14px]">
                    {gpsCheckedIn ? 'pin_drop' : 'location_searching'}
                  </span>
                  <span>{gpsCheckedIn ? `GPS Valid (${gpsDistance}m)` : 'Check-in Lokasi'}</span>
                </button>
              </div>

              {/* Outlet Selector Dropdown */}
              <select
                aria-label="Pilih Outlet Mitra"
                value={selectedOutletCode}
                onChange={(e) => setSelectedOutletCode(e.target.value)}
                className="w-full bg-white p-2.5 rounded-lg text-xs font-semibold text-slate-900 border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#005c55] cursor-pointer"
              >
                {outlets.map(o => (
                  <option key={o.code} value={o.code}>
                    {o.name} ({o.cityName})
                  </option>
                ))}
              </select>

              {/* Outlet Metadata at a glance */}
              <div className="flex items-center justify-between text-xs text-slate-600 pt-1 border-t border-slate-200/60">
                <div className="truncate max-w-[200px]">
                  <span>PIC: <b>{currentOutlet.picName}</b></span>
                  <span className="text-slate-400 mx-1">·</span>
                  <span className="text-[11px] text-slate-500">{currentOutlet.cityName}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 block">Sisa Plafon</span>
                  <span className="font-semibold text-emerald-700 text-xs">
                    Rp {(currentOutlet.creditRemaining).toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            </div>

            {/* Step 2: Simplified Product Order Catalog */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Ambil Order Produk Herbal
                </span>
                <span className="text-[11px] text-teal-800 font-semibold">
                  {totalQuantity} item dipilih
                </span>
              </div>

              {/* Quick Category Filter Bar */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs">
                {[
                  { id: 'all', label: 'Semua' },
                  { id: 'madu', label: 'Madu' },
                  { id: 'kapsul', label: 'Kapsul' },
                  { id: 'minyak', label: 'Minyak' }
                ].map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    type="button"
                    className={`px-2.5 py-1 rounded-md text-xs font-medium cursor-pointer transition-colors whitespace-nowrap ${
                      activeCategory === cat.id
                        ? 'bg-slate-900 text-white font-semibold'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Quick Search */}
              <div className="relative">
                <span className="material-symbols-outlined text-slate-400 absolute left-2.5 top-2 text-[16px] pointer-events-none">
                  search
                </span>
                <input
                  type="text"
                  placeholder="Cari nama produk / SKU..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-100 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#005c55] border-0"
                />
              </div>

              {/* Product List with Big Touch Steppers */}
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-0.5">
                {filteredProducts.map(prod => {
                  const qty = cart[prod.sku] || 0;
                  const isLow = prod.stock <= prod.rop;

                  return (
                    <div
                      key={prod.sku}
                      className={`p-2.5 rounded-xl border transition-colors flex items-center justify-between gap-2.5 ${
                        qty > 0
                          ? 'bg-teal-50/50 border-teal-200'
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-xs text-slate-900 truncate">
                          {prod.name}
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                          <span className="font-mono font-semibold text-slate-800">
                            Rp {prod.unitPrice.toLocaleString('id-ID')}
                          </span>
                          <span>·</span>
                          <span className="font-mono text-slate-500">Stok: {prod.stock}</span>
                        </div>
                        {isLow && (
                          <div className="text-[10px] text-amber-700 font-medium mt-0.5">
                            Mendekati ROP Gudang
                          </div>
                        )}
                      </div>

                      {/* Touch-Friendly Steppers (>= 44px hit area) */}
                      <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => updateCartQty(prod.sku, -1)}
                          disabled={qty === 0}
                          aria-label={`Kurangi ${prod.name}`}
                          className="w-10 h-10 rounded-md bg-white text-slate-700 flex items-center justify-center font-bold text-base shadow-2xs hover:bg-slate-200 active:scale-95 disabled:opacity-30 cursor-pointer"
                        >
                          -
                        </button>
                        <span className="w-8 text-center font-bold text-xs font-mono text-slate-900">
                          {qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateCartQty(prod.sku, 1)}
                          aria-label={`Tambah ${prod.name}`}
                          className="w-10 h-10 rounded-md bg-[#005c55] text-white flex items-center justify-center font-bold text-base shadow-2xs hover:bg-teal-800 active:scale-95 cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step 3: Payment Terms & Simple Notes */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">Termin Faktur:</span>
                <select
                  value={selectedTerm}
                  onChange={(e) => setSelectedTerm(e.target.value)}
                  className="bg-white px-2.5 py-1 rounded-md text-xs font-semibold text-slate-800 border border-slate-200 cursor-pointer focus:outline-none"
                >
                  <option value="Net 30 Hari">Net 30 Hari</option>
                  <option value="Net 14 Hari">Net 14 Hari</option>
                  <option value="COD Tunai">COD Tunai</option>
                </select>
              </div>
              <input
                type="text"
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                placeholder="Catatan tambahan apoteker (opsional)..."
                className="w-full bg-white px-2.5 py-1.5 rounded-lg text-xs text-slate-800 border border-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#005c55]"
              />
            </div>
          </div>

          {/* Sticky Bottom Action Bar - Mobile Friendly */}
          <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-3.5 py-2.5 shadow-lg flex items-center justify-between gap-3 z-20">
            <div>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-medium">
                Total {totalQuantity} Item
              </span>
              <span className="font-bold text-sm text-[#005c55]">
                Rp {totalAmount.toLocaleString('id-ID')}
              </span>
            </div>

            <button
              onClick={handleCheckout}
              disabled={isSubmitting || totalQuantity === 0}
              className="flex-1 py-3 px-4 rounded-xl bg-[#005c55] hover:bg-teal-800 text-white font-bold text-xs shadow-md active:scale-95 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5 transition-colors"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">send</span>
              <span>{isSubmitting ? 'Mengirim...' : 'Kirim Pesanan Lapangan'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation & Thermal Receipt Modal */}
      {showThermalReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-4 flex flex-col gap-3 border border-slate-200">
            <div className="flex items-center justify-between border-b pb-2">
              <div className="flex items-center gap-2 text-slate-900">
                <span className="material-symbols-outlined text-emerald-600 text-[20px]">check_circle</span>
                <h3 className="font-bold text-xs">Pesanan Berhasil Disimpan</h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowThermalReceipt(false);
                  setCart({});
                }}
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Clean Monospace Thermal Receipt Simulation */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-dashed border-slate-300 font-mono text-[11px] text-slate-800 space-y-1.5 leading-tight">
              <div className="text-center pb-1 border-b border-dashed border-slate-300">
                <div className="font-bold text-xs">CV ARBA'IN SURAKARTA</div>
                <div className="text-[10px] text-slate-500">Distributor Logistik Farmasi Herbal</div>
              </div>

              <div className="text-[10px] py-1 border-b border-dashed border-slate-300 space-y-0.5 text-slate-600">
                <div>Outlet: <b>{currentOutlet.name}</b></div>
                <div>Sales: Budi Santoso ({checkinTime})</div>
                <div>Status: {isOnline ? 'Tersinkron ke Pusat' : 'Tersimpan Offline'}</div>
                <div>Termin: {selectedTerm}</div>
              </div>

              <div className="py-1 space-y-1">
                {Object.entries(cart).map(([sku, qty]) => {
                  const prod = products.find(p => p.sku === sku);
                  if (!prod) return null;
                  return (
                    <div key={sku} className="flex justify-between">
                      <span className="truncate max-w-[170px]">{prod.name} x{qty}</span>
                      <span className="font-semibold">Rp {(prod.unitPrice * qty).toLocaleString('id-ID')}</span>
                    </div>
                  );
                })}
              </div>

              <div className="pt-1.5 border-t border-dashed border-slate-300 flex justify-between font-bold text-xs text-slate-900">
                <span>TOTAL:</span>
                <span>Rp {totalAmount.toLocaleString('id-ID')}</span>
              </div>
            </div>

            {/* Action buttons: WhatsApp Share + Thermal Print */}
            <div className="flex flex-col gap-2 pt-1">
              <button
                type="button"
                onClick={handleShareWhatsApp}
                className="w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <span className="material-symbols-outlined text-[16px]">share</span>
                <span>Kirim Bukti via WhatsApp Apotek</span>
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    showToast('Struk dicetak ke printer Bluetooth 58mm', 'print');
                    window.print();
                  }}
                  className="flex-1 py-2 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[15px]">print</span>
                  <span>Cetak Struk</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowThermalReceipt(false);
                    setCart({});
                  }}
                  className="flex-1 py-2 px-3 rounded-lg bg-slate-900 hover:bg-black text-white text-xs font-semibold cursor-pointer"
                >
                  Selesai
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
