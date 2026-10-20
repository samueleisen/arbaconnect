import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';

export const Header: React.FC = () => {
  const {
    currentRole,
    setRole,
    isOnline,
    toggleOnlineStatus,
    isDarkMode,
    toggleDarkMode,
    orders,
    products,
    outlets,
    setPath,
    setSelectedOutletId,
    showToast
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const pendingCount = orders.filter(o => o.status === 'PENDING').length;

  // Search matches
  const matchedOutlets = searchQuery.trim()
    ? outlets.filter(o => o.name.toLowerCase().includes(searchQuery.toLowerCase()) || o.code.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 3)
    : [];
  const matchedProducts = searchQuery.trim()
    ? products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.sku.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 3)
    : [];
  const matchedOrders = searchQuery.trim()
    ? orders.filter(o => o.clientUuid.toLowerCase().includes(searchQuery.toLowerCase()) || o.outletName.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 3)
    : [];

  const hasSearchResults = matchedOutlets.length > 0 || matchedProducts.length > 0 || matchedOrders.length > 0;

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-surface-container-lowest/95 backdrop-blur-md z-50 border-b border-border-subtle/60">
      <div className="h-16 w-full px-gutter-desktop flex items-center justify-between gap-4">
        {/* Brand Logo & Name - Untouched */}
        <div className="flex items-center gap-3">
          <img
            alt="ArbaConnect Brand Logo"
            className="h-8 w-auto object-contain cursor-pointer"
            onClick={() => setPath('executive-dashboard')}
            src="https://lh3.googleusercontent.com/aida/AEtjO1Uwe38vmG086Hh9taUzSVornhjOXOmqxRUjZh59glp8JC99KGV7BK4vzhY9IsW-fL7Zmvch7D9ibcBb7l2s2dSfeeERfruYrT3eCVKwuErwjk7ossKo-iLKZMLopcGTg2wiJTLaEjikW2CIrewYxmhL1_pIlODNnJmwNOWVkAnJQjF8q7ywGr91mXsRChhktrECPsyhySUVBYH84FPbS-LDMt_MooUBj64FbdKmPJJ5_2l9aTKuHj3zznY"
          />
          <div className="flex flex-col cursor-pointer" onClick={() => setPath('executive-dashboard')}>
            <span className="font-headline-md text-base text-primary font-bold leading-tight tracking-tight">
              ArbaConnect
            </span>
            <span className="text-xs text-on-surface-variant font-medium">
              CV Arba'in Logistics ERP
            </span>
          </div>
        </div>

        {/* Global Quick Search Bar */}
        <div className="hidden md:flex relative flex-1 max-w-md mx-2">
          <span className="material-symbols-outlined text-on-surface-variant absolute left-3 top-2 text-[18px] pointer-events-none">
            search
          </span>
          <input
            type="text"
            placeholder="Cari SKU Herbal, Apotek Mitra, atau Faktur..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSearchDropdown(true);
            }}
            onFocus={() => setShowSearchDropdown(true)}
            className="w-full pl-9 pr-8 py-1.5 bg-surface-container-low text-xs rounded-lg text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary border border-border-subtle/50 transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setShowSearchDropdown(false);
              }}
              className="absolute right-2.5 top-2 text-on-surface-variant hover:text-on-surface cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          )}

          {/* Search Results Dropdown */}
          {showSearchDropdown && searchQuery.trim() && (
            <div className="absolute left-0 right-0 top-full mt-1.5 bg-surface-container-lowest rounded-xl shadow-lg border border-border-subtle/80 p-2 z-50 max-h-80 overflow-y-auto">
              {hasSearchResults ? (
                <div className="flex flex-col gap-2 text-xs">
                  {matchedOutlets.length > 0 && (
                    <div>
                      <div className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider px-2 py-1">
                        Mitra B2B Outlet
                      </div>
                      {matchedOutlets.map(o => (
                        <div
                          key={o.id}
                          onClick={() => {
                            setSelectedOutletId(o.id);
                            setPath('b2b-crm-directory');
                            setShowSearchDropdown(false);
                            setSearchQuery('');
                          }}
                          className="p-2 hover:bg-surface-container-low rounded-lg cursor-pointer flex items-center justify-between transition-colors"
                        >
                          <div className="font-medium text-on-surface">{o.name}</div>
                          <span className="text-[11px] text-on-surface-variant">{o.cityName}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {matchedProducts.length > 0 && (
                    <div>
                      <div className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider px-2 py-1">
                        Produk &amp; SKU Herbal
                      </div>
                      {matchedProducts.map(p => (
                        <div
                          key={p.sku}
                          onClick={() => {
                            setPath('inventory-stock-ledger');
                            setShowSearchDropdown(false);
                            setSearchQuery('');
                          }}
                          className="p-2 hover:bg-surface-container-low rounded-lg cursor-pointer flex items-center justify-between transition-colors"
                        >
                          <div className="font-medium text-on-surface">{p.name}</div>
                          <span className="text-[11px] font-mono text-primary font-semibold">Stok: {p.stock}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {matchedOrders.length > 0 && (
                    <div>
                      <div className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider px-2 py-1">
                        Faktur Pesanan B2B
                      </div>
                      {matchedOrders.map(ord => (
                        <div
                          key={ord.id}
                          onClick={() => {
                            setPath('order-approval-queue');
                            setShowSearchDropdown(false);
                            setSearchQuery('');
                          }}
                          className="p-2 hover:bg-surface-container-low rounded-lg cursor-pointer flex items-center justify-between transition-colors"
                        >
                          <div>
                            <span className="font-mono font-semibold text-primary">{ord.clientUuid}</span>
                            <span className="ml-2 text-on-surface-variant">{ord.outletName}</span>
                          </div>
                          <span className="font-semibold text-xs text-on-surface">Rp {ord.totalAmount.toLocaleString('id-ID')}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-3 text-center text-xs text-on-surface-variant">
                  Tidak ditemukan hasil untuk "{searchQuery}"
                </div>
              )}
            </div>
          )}
        </div>

        {/* Global Controls & User Info */}
        <div className="flex items-center gap-3">
          {/* Role Perspective Switcher */}
          <div className="relative flex items-center">
            <span className="material-symbols-outlined text-on-surface-variant absolute left-2.5 text-[18px] pointer-events-none">
              tune
            </span>
            <select
              aria-label="Ganti Role Perspektif"
              value={currentRole}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="bg-surface-container-low text-xs text-on-surface pl-8 pr-7 py-1.5 rounded-lg border border-border-subtle/50 appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary hover:bg-surface-container transition-colors font-medium"
            >
              <option value="executive">Direksi &amp; Manajemen</option>
              <option value="field-sales">Field Sales (PWA)</option>
              <option value="inventory">Admin Gudang &amp; Stok</option>
              <option value="sales-ops">Admin Sales &amp; Verifikasi</option>
            </select>
            <span className="material-symbols-outlined text-on-surface-variant absolute right-1.5 text-[18px] pointer-events-none">
              expand_more
            </span>
          </div>

          {/* Online / Local Sync Status Indicator */}
          <button
            onClick={toggleOnlineStatus}
            type="button"
            title="Klik untuk simulasi mode Online / Offline"
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-border-subtle/50 bg-surface-container-low hover:bg-surface-container text-xs text-on-surface-variant font-medium transition-colors cursor-pointer"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isOnline ? 'bg-emerald-600' : 'bg-amber-600'
              }`}
            />
            <span className="hidden sm:inline">
              {isOnline ? 'Tersinkron' : 'Mode Lokal'}
            </span>
          </button>

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            aria-label="Toggle color mode"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface border border-transparent hover:border-border-subtle/40 transition-colors cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">
              {isDarkMode ? 'light_mode' : 'dark_mode'}
            </span>
          </button>

          {/* Notifications with Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              aria-label="Notifications"
              className="relative w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface border border-transparent hover:border-border-subtle/40 transition-colors cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">notifications</span>
              {pendingCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500" />
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-surface-container-lowest rounded-xl shadow-xl border border-border-subtle/70 p-3 z-50 flex flex-col gap-2">
                <div className="flex items-center justify-between border-b border-border-subtle/50 pb-2">
                  <span className="font-semibold text-xs text-on-surface">Notifikasi Sistem</span>
                  <span className="text-xs text-primary font-medium">{pendingCount} Pesanan Baru</span>
                </div>
                <div className="space-y-1.5 text-xs">
                  <div
                    onClick={() => {
                      setPath('order-approval-queue');
                      setShowNotifications(false);
                    }}
                    className="p-2 bg-surface-container-low hover:bg-surface-container rounded-lg cursor-pointer flex gap-2.5 transition-colors"
                  >
                    <span className="material-symbols-outlined text-primary text-[18px] shrink-0 mt-0.5">shopping_bag</span>
                    <div>
                      <div className="font-medium text-on-surface">Pesanan Baru Siap Validasi</div>
                      <div className="text-[11px] text-on-surface-variant">Apotek Kimia Farma Slamet Riyadi (Rp 8.450.000)</div>
                    </div>
                  </div>
                  <div
                    onClick={() => {
                      setPath('inventory-stock-ledger');
                      setShowNotifications(false);
                    }}
                    className="p-2 bg-surface-container-low hover:bg-surface-container rounded-lg cursor-pointer flex gap-2.5 transition-colors"
                  >
                    <span className="material-symbols-outlined text-amber-600 text-[18px] shrink-0 mt-0.5">warning</span>
                    <div>
                      <div className="font-medium text-on-surface">Peringatan Reorder Point (ROP)</div>
                      <div className="text-[11px] text-on-surface-variant">Madu Randu Murni 500g mendekati safety stock</div>
                    </div>
                  </div>
                  <div
                    onClick={() => {
                      showToast('Audit Kepatuhan CDOB: 99.4% Kepatuhan FEFO tervalidasi!', 'verified');
                      setShowNotifications(false);
                    }}
                    className="p-2 bg-surface-container-low hover:bg-surface-container rounded-lg cursor-pointer flex gap-2.5 transition-colors"
                  >
                    <span className="material-symbols-outlined text-emerald-600 text-[18px] shrink-0 mt-0.5">verified</span>
                    <div>
                      <div className="font-medium text-on-surface">Validasi Integritas CDOB</div>
                      <div className="text-[11px] text-on-surface-variant">Buku besar stok tervalidasi FEFO</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Info */}
          <div
            onClick={() => showToast(`Login sebagai: ${currentRole.toUpperCase()} (CV Arba'in Logistik)`, 'account_circle')}
            className="flex items-center gap-2 pl-2 border-l border-border-subtle/50 cursor-pointer hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-[18px]">person</span>
            </div>
            <div className="hidden xl:flex flex-col text-left">
              <span className="text-xs text-on-surface font-semibold leading-tight">
                Admin Operasional
              </span>
              <span className="text-[11px] text-on-surface-variant leading-none">
                CV Arba'in Logistik
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
