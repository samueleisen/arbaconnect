import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { B2BOrder } from '../types';

export const OrderApprovalQueueView: React.FC = () => {
  const {
    orders,
    approveOrder,
    batchApproveOrders,
    rejectOrder,
    adjustOrderQuantity,
    markOrderDelivered,
    driverManifests,
    setPath,
    showToast
  } = useApp();

  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'manifest' | 'rejected'>('pending');
  const [selectedSalesRep, setSelectedSalesRep] = useState('all');
  const [selectedSort, setSelectedSort] = useState('latest');
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>(['ord-7f3b89-20260328']);
  const [openActionMenuId, setOpenActionMenuId] = useState<string | null>(null);

  // Invoice / Surat Jalan Print Modal
  const [printOrderModal, setPrintOrderModal] = useState<B2BOrder | null>(null);

  // Batch replacement dialog for Luwes Gading (ord-48e02d)
  const [batchModalOrder, setBatchModalOrder] = useState<B2BOrder | null>(null);

  // Adjust order item quantity modal
  const [adjustModalOrder, setAdjustModalOrder] = useState<B2BOrder | null>(null);
  const [adjustItemSku, setAdjustItemSku] = useState<string>('');
  const [adjustItemQty, setAdjustItemQty] = useState<number>(10);

  // Reject order modal
  const [rejectModalOrder, setRejectModalOrder] = useState<B2BOrder | null>(null);
  const [rejectReason, setRejectReason] = useState<string>('Plafon kredit mitra terlampaui');

  // Counts
  const pendingOrders = orders.filter(o => o.status === 'PENDING');
  const approvedOrders = orders.filter(o => o.status === 'APPROVED');
  const rejectedOrders = orders.filter(o => o.status === 'REJECTED');

  // Filter based on active tab and filters
  let displayedOrders = orders.filter(o => {
    if (activeTab === 'pending') return o.status === 'PENDING';
    if (activeTab === 'approved') return o.status === 'APPROVED';
    if (activeTab === 'rejected') return o.status === 'REJECTED';
    return true;
  });

  if (selectedSalesRep !== 'all') {
    displayedOrders = displayedOrders.filter(o =>
      o.salesRep.toLowerCase().includes(selectedSalesRep.toLowerCase())
    );
  }

  const toggleSelectOrder = (id: string) => {
    setSelectedOrderIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedOrderIds(displayedOrders.map(o => o.id));
    } else {
      setSelectedOrderIds([]);
    }
  };

  const handleBatchApprove = () => {
    if (selectedOrderIds.length === 0) {
      showToast('Pilih setidaknya satu pesanan untuk disetujui', 'warning');
      return;
    }
    batchApproveOrders(selectedOrderIds);
    setSelectedOrderIds([]);
  };

  const handleBatchPrint = () => {
    showToast(`Mencetak ${selectedOrderIds.length || displayedOrders.length} berkas Surat Jalan Kolektif (Rangkap 3)...`, 'print');
  };

  return (
    <div className="flex flex-col w-full">
      {/* Top Section: Metric Ribbon & Audit Integrity Indicator */}
      <div className="flex flex-col gap-space-lg mb-space-lg">
        {/* Breadcrumb & Status Tracker */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1 text-on-surface-variant text-xs font-medium">
              <span>Penjualan &amp; Distribusi</span>
              <span aria-hidden="true">·</span>
              <span className="text-primary font-semibold">Otorisasi Pesanan B2B</span>
              <span aria-hidden="true">·</span>
              <span>Kepatuhan FEFO</span>
            </div>
            <h1 className="text-2xl text-on-surface font-bold tracking-tight">
              Antrean Verifikasi &amp; Persetujuan Pesanan B2B
            </h1>
            <p className="text-sm text-on-surface-variant mt-0.5 max-w-4xl">
              Validasi pesanan masuk dari sales lapangan PWA, alokasi stok gudang otomatis, dan cetak Surat Jalan CV Arba'in dengan penegakan FEFO.
            </p>
          </div>

          {/* Audit & Compliance Status */}
          <div className="flex items-center gap-3 bg-surface-container-low px-4 py-2.5 rounded-xl border border-border-subtle/50 self-start xl:self-center">
            <span className="w-2 h-2 rounded-full bg-emerald-600" />
            <div className="flex flex-col">
              <span className="text-xs text-on-surface font-semibold">
                Alokasi Stok FEFO Otomatis
              </span>
              <span className="text-[11px] text-on-surface-variant">
                Terhubung Buku Besar Stok Gudang
              </span>
            </div>
            <span className="material-symbols-outlined text-primary text-[20px] ml-1">verified_user</span>
          </div>
        </div>

        {/* Status Tabs Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button
            onClick={() => setActiveTab('pending')}
            className={`flex flex-col p-4 rounded-xl text-left transition-colors cursor-pointer border ${
              activeTab === 'pending'
                ? 'bg-primary text-white border-primary shadow-xs'
                : 'bg-surface-container-lowest text-on-surface hover:bg-surface-container-low border-border-subtle/60'
            }`}
            type="button"
          >
            <div className="flex items-center justify-between w-full mb-1">
              <span className="text-xs uppercase tracking-wider font-semibold opacity-90">
                Perlu Otorisasi
              </span>
              <span className="material-symbols-outlined text-[18px]">pending_actions</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold">{pendingOrders.length}</span>
              <span className="text-xs font-medium opacity-90">Pesanan</span>
            </div>
            <span className="text-xs mt-1 opacity-80">Menunggu Persetujuan Admin</span>
          </button>

          <button
            onClick={() => setActiveTab('approved')}
            className={`flex flex-col p-4 rounded-xl text-left transition-colors cursor-pointer border ${
              activeTab === 'approved'
                ? 'bg-primary text-white border-primary shadow-xs'
                : 'bg-surface-container-lowest text-on-surface hover:bg-surface-container-low border-border-subtle/60'
            }`}
            type="button"
          >
            <div className={`flex items-center justify-between w-full mb-1 ${activeTab === 'approved' ? 'text-white' : 'text-on-surface-variant'}`}>
              <span className="text-xs uppercase tracking-wider font-semibold">
                Diproses Hari Ini
              </span>
              <span className="material-symbols-outlined text-[18px]">task_alt</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold">
                {28 + approvedOrders.length - 1}
              </span>
              <span className={`text-xs ${activeTab === 'approved' ? 'text-white/80' : 'text-on-surface-variant'}`}>Pesanan</span>
            </div>
            <span className={`text-xs mt-1 ${activeTab === 'approved' ? 'text-white/80' : 'text-on-surface-variant'}`}>Telah Dikonfirmasi</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('manifest');
              showToast("Membuka 14 Manifest Faktur Pengiriman Armada Hari Ini", 'local_shipping');
            }}
            className={`flex flex-col p-4 rounded-xl text-left transition-colors cursor-pointer border ${
              activeTab === 'manifest'
                ? 'bg-primary text-white border-primary shadow-xs'
                : 'bg-surface-container-lowest text-on-surface hover:bg-surface-container-low border-border-subtle/60'
            }`}
            type="button"
          >
            <div className={`flex items-center justify-between w-full mb-1 ${activeTab === 'manifest' ? 'text-white' : 'text-on-surface-variant'}`}>
              <span className="text-xs uppercase tracking-wider font-semibold">
                Manifest Armada
              </span>
              <span className="material-symbols-outlined text-[18px]">local_shipping</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold">14</span>
              <span className={`text-xs ${activeTab === 'manifest' ? 'text-white/80' : 'text-on-surface-variant'}`}>Faktur</span>
            </div>
            <span className={`text-xs mt-1 ${activeTab === 'manifest' ? 'text-white/80' : 'text-on-surface-variant'}`}>Siap Dikirim Logistik</span>
          </button>

          <button
            onClick={() => setActiveTab('rejected')}
            className={`flex flex-col p-4 rounded-xl text-left transition-colors cursor-pointer border ${
              activeTab === 'rejected'
                ? 'bg-rose-700 text-white border-rose-700 shadow-xs'
                : 'bg-surface-container-lowest text-on-surface hover:bg-surface-container-low border-border-subtle/60'
            }`}
            type="button"
          >
            <div className={`flex items-center justify-between w-full mb-1 ${activeTab === 'rejected' ? 'text-white' : 'text-on-surface-variant'}`}>
              <span className="text-xs uppercase tracking-wider font-semibold">
                Ditolak / Retur
              </span>
              <span className="material-symbols-outlined text-[18px]">cancel</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold">
                {1 + rejectedOrders.length}
              </span>
              <span className={`text-xs ${activeTab === 'rejected' ? 'text-white/80' : 'text-on-surface-variant'}`}>Kasus</span>
            </div>
            <span className={`text-xs mt-1 ${activeTab === 'rejected' ? 'text-white/80' : 'text-on-surface-variant'}`}>Kredit / Kuota Terlampaui</span>
          </button>
        </div>
      </div>

      {/* Batch Action Header & Filter Controls */}
      <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-xs border border-border-subtle/40 mb-space-lg flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-space-md">
        {/* Filter Segments */}
        <div className="flex flex-wrap items-center gap-space-sm">
          <div className="relative min-w-[220px]">
            <span className="material-symbols-outlined text-on-surface-variant absolute left-3 top-2.5 text-[18px] pointer-events-none">
              badge
            </span>
            <select
              value={selectedSalesRep}
              onChange={(e) => setSelectedSalesRep(e.target.value)}
              className="w-full bg-surface-container-low font-body-md text-body-md text-on-surface pl-9 pr-8 py-2 rounded-lg border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">Semua Sales Rep (Aktif)</option>
              <option value="budi">Budi Santoso (Solo Timur &amp; Tengah)</option>
              <option value="anita">Anita Rahmawati (Sukoharjo)</option>
              <option value="hadi">Hadi Kurniawan (Karanganyar)</option>
            </select>
            <span className="material-symbols-outlined text-on-surface-variant absolute right-2.5 top-2.5 text-[18px] pointer-events-none">
              expand_more
            </span>
          </div>

          <div className="relative min-w-[210px]">
            <span className="material-symbols-outlined text-on-surface-variant absolute left-3 top-2.5 text-[18px] pointer-events-none">
              sort
            </span>
            <select
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value)}
              className="w-full bg-surface-container-low font-body-md text-body-md text-on-surface pl-9 pr-8 py-2 rounded-lg border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="latest">Waktu Masuk (Terbaru)</option>
              <option value="urgency">Tingkat Urgensi Outlet</option>
              <option value="highest_val">Nilai Pesanan Tertinggi</option>
              <option value="credit_risk">Limit Kredit Mendekati Batas</option>
            </select>
            <span className="material-symbols-outlined text-on-surface-variant absolute right-2.5 top-2.5 text-[18px] pointer-events-none">
              expand_more
            </span>
          </div>

          <div className="flex items-center gap-2 pl-2">
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                checked={selectedOrderIds.length === displayedOrders.length && displayedOrders.length > 0}
                onChange={(e) => handleSelectAll(e.target.checked)}
                className="w-4 h-4 rounded text-primary focus:ring-primary border-0 bg-surface-container accent-primary cursor-pointer"
                id="selectAllOrders"
                type="checkbox"
              />
              <span className="font-label-md text-label-md text-on-surface-variant">
                Pilih Semua ({displayedOrders.length} Pesanan)
              </span>
            </label>
          </div>
        </div>

        {/* Collective Action Buttons */}
        <div className="flex items-center gap-space-sm flex-wrap sm:flex-nowrap">
          <button
            onClick={handleBatchPrint}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-space-md py-2.5 bg-surface-container hover:bg-surface-container-high text-primary font-label-lg text-label-lg rounded-lg shadow-xs transition-all active:scale-[0.98] cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">print</span>
            <span>Cetak Surat Jalan Kolektif</span>
          </button>
          <button
            onClick={handleBatchApprove}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-space-lg py-2.5 bg-primary-container text-on-primary font-label-lg text-label-lg rounded-lg shadow-sm transition-all hover:bg-primary active:scale-[0.98] cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">checklist</span>
            <span>Setujui Pesanan Terpilih (Batch Approve)</span>
          </button>
        </div>
      </div>

      {/* Verification Queue (Cards & Rows) */}
      <div className="flex flex-col gap-space-lg mb-space-xl">
        {activeTab === 'manifest' ? (
          /* MANIFEST TAB: Driver Logistics & Fleet Dispatch */
          <div className="flex flex-col gap-space-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface-container-low p-4 rounded-xl border border-border-subtle/40">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary text-on-primary flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-[24px]">local_shipping</span>
                </div>
                <div>
                  <h3 className="font-title-sm text-title-sm text-on-surface font-bold">
                    Manifest Armada Logistik CV Arba'in Solo Raya
                  </h3>
                  <p className="text-xs text-on-surface-variant">
                    Pengawalan pengantaran pesanan B2B, verifikasi serah terima (POD), dan surat jalan resmi rangkap 3.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  showToast('Mencetak seluruh berkas Manifest Armada Solo Raya hari ini', 'print');
                  window.print();
                }}
                className="px-4 py-2 bg-primary text-on-primary text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-sm hover:bg-primary-container cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">print</span>
                <span>Cetak Lembar Manifest Rute</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
              {driverManifests.map((manifest, mIdx) => (
                <div key={mIdx} className="bg-surface-container-lowest p-space-md rounded-xl shadow-xs border border-border-subtle/50 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-3 border-b border-border-subtle/30">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-secondary text-[20px]">directions_car</span>
                          <h4 className="font-title-sm text-title-sm text-on-surface font-bold">
                            {manifest.vehiclePlate}
                          </h4>
                        </div>
                        <span className="text-xs text-on-surface-variant">Driver: <b>{manifest.driverName}</b> • {manifest.wave}</span>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary">
                        {manifest.routeArea}
                      </span>
                    </div>

                    <div className="py-3 space-y-2">
                      <span className="text-xs uppercase tracking-wider font-semibold text-on-surface-variant block">
                        Daftar Titik Kirim Outlet:
                      </span>
                      {manifest.orders.map((ord, oIdx) => (
                        <div
                          key={oIdx}
                          className="p-3 rounded-lg bg-surface-container-low border border-border-subtle/30 flex items-center justify-between text-xs"
                        >
                          <div>
                            <div className="font-bold text-on-surface">{ord.outletName}</div>
                            <div className="text-slate-500">{ord.address}</div>
                            <div className="text-[11px] font-mono text-primary font-semibold mt-0.5">
                              Nilai: Rp {ord.amount.toLocaleString('id-ID')}
                            </div>
                          </div>
                          <div>
                            {ord.delivered ? (
                              <span className="px-2.5 py-1 rounded-full bg-status-success-bg text-status-success-text font-bold text-[11px] flex items-center gap-1">
                                <span className="material-symbols-outlined text-[14px]">check_circle</span>
                                Terkirim ({ord.deliveredTime})
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => markOrderDelivered(ord.orderId, manifest.driverName)}
                                className="px-3 py-1.5 rounded-lg bg-secondary text-on-secondary font-semibold hover:bg-on-secondary-fixed-variant shadow-xs flex items-center gap-1 cursor-pointer active:scale-95 text-[11px]"
                              >
                                <span className="material-symbols-outlined text-[14px]">done_all</span>
                                <span>Konfirmasi POD</span>
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-border-subtle/30 flex items-center justify-between text-xs text-on-surface-variant">
                    <span>Target Penyelesaian: 100% Hari Ini</span>
                    <span className="font-semibold text-primary">Status Armada: Beroperasi di Rute</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : activeTab === 'rejected' ? (
          /* REJECTED / VOID TAB */
          <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-xs border border-border-subtle/40">
            <h3 className="font-title-sm text-title-sm font-bold text-badge-red mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">cancel</span>
              <span>Daftar Pesanan Dibatalkan / Void (Audit CDOB)</span>
            </h3>
            {rejectedOrders.length === 0 ? (
              <div className="p-8 text-center text-on-surface-variant text-xs">
                Tidak ada pesanan yang berstatus ditolak / void saat ini.
              </div>
            ) : (
              <div className="divide-y divide-border-subtle/30">
                {rejectedOrders.map((ord, idx) => (
                  <div key={idx} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-on-surface text-sm">{ord.outletName}</div>
                      <div className="text-slate-500 font-mono">{ord.clientUuid} • Rp {ord.totalAmount.toLocaleString('id-ID')} • {ord.salesRep}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="px-2.5 py-1 rounded bg-status-danger-bg text-badge-red font-semibold">
                        Dibatalkan
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          approveOrder(ord.id);
                          showToast(`Pesanan ${ord.outletName} dipulihkan dan disetujui!`, 'restore');
                        }}
                        className="px-3 py-1.5 bg-surface-container hover:bg-surface-container-high rounded text-xs font-semibold cursor-pointer"
                      >
                        Pulihkan &amp; Setujui
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : displayedOrders.length === 0 ? (
          <div className="bg-surface-container-lowest p-12 rounded-xl text-center shadow-xs border border-border-subtle/40">
            <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-2">inbox</span>
            <h3 className="font-bold text-on-surface text-base">Tidak ada antrean pesanan dalam status ini</h3>
            <p className="text-xs text-on-surface-variant mt-1">Semua pesanan B2B pada kriteria ini telah diproses.</p>
          </div>
        ) : (
          <>
            {/* CARD 1: EXPANDED DETAIL INSPECTION VIEW for selected or first order */}
            {displayedOrders
              .filter(o => o.id === (selectedOrderIds[0] || displayedOrders[0]?.id))
              .slice(0, 1)
              .map(order => (
                <div key={order.id} className="bg-surface-container-lowest rounded-xl shadow-md border border-border-subtle/50 overflow-hidden relative">
                  <div className="h-1.5 w-full bg-primary-container" />
                  <div className="p-space-lg">
              {/* Header Info Ribbon */}
              <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-space-md pb-space-md border-b border-border-subtle/30">
                <div className="flex items-start gap-space-md">
                  <input
                    checked={selectedOrderIds.includes(order.id)}
                    onChange={() => toggleSelectOrder(order.id)}
                    className="mt-1 w-5 h-5 rounded text-primary accent-primary cursor-pointer"
                    type="checkbox"
                  />
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-code-table text-code-table font-semibold px-2.5 py-0.5 rounded-full bg-surface-container-high text-on-surface">
                        {order.clientUuid}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-status-success-bg text-status-success-text font-label-sm text-label-sm font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-badge-green" />
                        Idempotent Verified &amp; Signed
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-sm text-label-sm font-semibold">
                        Priority: High (Apotek Inti)
                      </span>
                    </div>
                    <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold">
                      {order.outletName}
                    </h2>
                    <div className="flex flex-wrap items-center gap-y-1 gap-x-space-md mt-1 text-on-surface-variant font-body-sm text-body-sm">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px] text-primary">location_on</span>
                        {order.address}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px] text-on-surface-variant">schedule</span>
                        {order.orderTime}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Total Value & Term Gauge */}
                <div className="flex flex-row xl:flex-col items-end justify-between xl:justify-center bg-surface-container-low p-space-md rounded-xl min-w-[280px] border border-border-subtle/30">
                  <div className="flex flex-col text-left xl:text-right">
                    <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">
                      Total Nilai Pesanan
                    </span>
                    <span className="font-headline-lg text-headline-lg text-primary font-bold">
                      Rp {order.totalAmount.toLocaleString('id-ID')}
                    </span>
                  </div>
                  <div className="flex flex-col text-right mt-1">
                    <div className="flex items-center justify-end gap-1.5 font-label-md text-label-md text-status-success-text font-semibold">
                      <span className="material-symbols-outlined text-[16px]">credit_score</span>
                      <span>Termin: {order.terms} (Plafon Rp {order.limitMax.toLocaleString('id-ID')})</span>
                    </div>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">
                      Sisa Limit: Rp {order.limitRemaining.toLocaleString('id-ID')} (Aman)
                    </span>
                  </div>
                </div>
              </div>

              {/* Sales Origin & Geofence Verification Metadata Box */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md my-space-md p-space-md bg-surface-container-low rounded-xl border border-border-subtle/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-surface-container-lowest flex items-center justify-center text-primary shadow-xs">
                    <span className="material-symbols-outlined text-[20px]">person_pin</span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-label-sm text-label-sm text-on-surface-variant">
                      Sales Lapangan (PWA App)
                    </span>
                    <span className="font-title-sm text-title-sm text-on-surface truncate font-semibold">
                      {order.salesRep}
                    </span>
                    <span className="font-code-table text-code-table text-on-surface-variant">
                      ID: {order.salesRepId}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-surface-container-lowest flex items-center justify-center text-badge-green shadow-xs">
                    <span className="material-symbols-outlined text-[20px]">pin_drop</span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-label-sm text-label-sm text-on-surface-variant">
                      Validasi GPS Geofence (Radius 12m)
                    </span>
                    <span className="font-code-table text-code-table text-on-surface truncate font-semibold">
                      {order.geofenceCoords}
                    </span>
                    <span className="font-body-sm text-body-sm text-status-success-text font-semibold">
                      Lokasi Terotentikasi di Titik Toko
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-surface-container-lowest flex items-center justify-center text-secondary shadow-xs">
                    <span className="material-symbols-outlined text-[20px]">receipt_long</span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-label-sm text-label-sm text-on-surface-variant">
                      Status Faktur &amp; Pajak
                    </span>
                    <span className="font-title-sm text-title-sm text-on-surface truncate font-semibold">
                      Faktur Pajak Standar B2B
                    </span>
                    <span className="font-code-table text-code-table text-on-surface-variant">
                      NPWP: {order.npwp}
                    </span>
                  </div>
                </div>
              </div>

              {/* SKU Breakdown Table with Visual Verification */}
              <div className="overflow-x-auto rounded-xl bg-surface-container-lowest shadow-xs border border-border-subtle/30 mt-space-md">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-surface-container-high text-on-surface-variant font-label-md text-label-md uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4 font-semibold">Produk &amp; Kemasan</th>
                      <th className="py-3 px-4 font-semibold">Batch &amp; Kadaluarsa (FEFO)</th>
                      <th className="py-3 px-4 font-semibold text-center">Kuantitas</th>
                      <th className="py-3 px-4 font-semibold text-right">Harga Satuan</th>
                      <th className="py-3 px-4 font-semibold text-right">Subtotal</th>
                      <th className="py-3 px-4 font-semibold text-center">Status Alokasi Gudang</th>
                    </tr>
                  </thead>
                  <tbody className="font-body-md text-body-md text-on-surface divide-y divide-border-subtle/30">
                    {order.items.map((it, idx) => (
                      <tr key={idx} className="hover:bg-surface-container-low transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center text-primary font-bold">
                              <span className="material-symbols-outlined text-[20px]">
                                {it.sku.includes('MDR') ? 'medication' : it.sku.includes('HBT') ? 'vaccines' : 'science'}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="font-title-sm text-title-sm font-semibold">{it.name}</span>
                              <span className="font-code-table text-code-table text-on-surface-variant">
                                SKU: {it.sku}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-col">
                            <span className="font-code-table text-code-table font-semibold text-primary">
                              {it.batch}
                            </span>
                            <span className="font-label-sm text-label-sm text-on-surface-variant">
                              Exp: {it.expiry} ({it.fefoPriority})
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="font-title-sm text-title-sm font-bold">{it.quantity}</span>{' '}
                          <span className="font-body-sm text-body-sm text-on-surface-variant">botol</span>
                        </td>
                        <td className="py-3 px-4 text-right font-code-table text-code-table">
                          Rp {it.unitPrice.toLocaleString('id-ID')}
                        </td>
                        <td className="py-3 px-4 text-right font-code-table text-code-table font-semibold">
                          Rp {it.subtotal.toLocaleString('id-ID')}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-status-success-bg text-status-success-text font-label-sm text-label-sm font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-badge-green" />
                            Tersedia &amp; Siap Potong (Sisa: {it.remainingBatchStock})
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Action Call-To-Action Toolbar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-space-md pt-space-lg mt-space-md bg-surface-container-lowest">
                <div className="flex items-center gap-2 text-on-surface-variant font-body-sm text-body-sm">
                  <span className="material-symbols-outlined text-primary text-[18px]">lock</span>
                  <span>Alokasi stok otomatis akan mengunci kuantitas dalam sistem secara instan.</span>
                </div>
                <div className="flex items-center gap-space-sm w-full sm:w-auto justify-end">
                  {/* Dropdown Actions */}
                  <div className="relative">
                    <button
                      onClick={() => setOpenActionMenuId(openActionMenuId === order.id ? null : order.id)}
                      className="px-space-md py-2.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-lg text-label-lg flex items-center gap-2 transition-all cursor-pointer"
                      type="button"
                    >
                      <span>Opsi Tindakan</span>
                      <span className="material-symbols-outlined text-[18px]">arrow_drop_down</span>
                    </button>
                    {openActionMenuId === order.id && (
                      <div className="absolute right-0 bottom-full mb-1 bg-surface-container-lowest shadow-xl rounded-xl p-1.5 min-w-[220px] z-20 border border-border-subtle/50">
                        <button
                          onClick={() => {
                            setOpenActionMenuId(null);
                            setAdjustModalOrder(order);
                            setAdjustItemSku(order.items[0]?.sku || '');
                            setAdjustItemQty(order.items[0]?.quantity || 10);
                          }}
                          className="w-full text-left flex items-center gap-2.5 px-3 py-2 text-on-surface hover:bg-surface-container-low rounded-lg font-label-md text-label-md cursor-pointer"
                          type="button"
                        >
                          <span className="material-symbols-outlined text-badge-amber text-[18px]">tune</span>
                          <span>Sesuaikan Kuantitas SKU</span>
                        </button>
                        <button
                          onClick={() => {
                            setOpenActionMenuId(null);
                            setBatchModalOrder(order);
                          }}
                          className="w-full text-left flex items-center gap-2.5 px-3 py-2 text-on-surface hover:bg-surface-container-low rounded-lg font-label-md text-label-md cursor-pointer"
                          type="button"
                        >
                          <span className="material-symbols-outlined text-secondary text-[18px]">swap_horiz</span>
                          <span>Alihkan ke Batch Alternatif</span>
                        </button>
                        <button
                          onClick={() => {
                            setOpenActionMenuId(null);
                            setRejectModalOrder(order);
                          }}
                          className="w-full text-left flex items-center gap-2.5 px-3 py-2 text-badge-red hover:bg-status-danger-bg rounded-lg font-label-md text-label-md cursor-pointer"
                          type="button"
                        >
                          <span className="material-symbols-outlined text-badge-red text-[18px]">block</span>
                          <span>Tolak Pesanan Ini</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Print Secondary */}
                  <button
                    onClick={() => setPrintOrderModal(order)}
                    className="px-space-md py-2.5 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-primary font-label-lg text-label-lg flex items-center gap-2 transition-all cursor-pointer"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[18px]">print</span>
                    <span>Cetak Surat Jalan &amp; Faktur B2B</span>
                  </button>

                  {/* Primary Approve */}
                  <button
                    onClick={() => approveOrder(order.id)}
                    className="px-space-lg py-2.5 rounded-lg bg-primary text-on-primary hover:bg-primary-container font-label-lg text-label-lg flex items-center gap-2 shadow-sm hover:shadow-md transition-all active:scale-[0.98] cursor-pointer"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[20px]">check_circle</span>
                    <span>Konfirmasi Pesanan (Potong Stok Otomatis)</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* SUMMARY ROWS FOR OTHER ORDERS */}
        {displayedOrders
          .filter(o => o.id !== (selectedOrderIds[0] || displayedOrders[0]?.id))
          .map(order => {
            const isWarningState = !!order.stockWarning;
            const isChecked = selectedOrderIds.includes(order.id);

            return (
              <div
                key={order.id}
                className={`bg-surface-container-lowest p-space-md rounded-xl shadow-xs border border-border-subtle/40 hover:shadow-md transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-space-md relative overflow-hidden ${
                  isWarningState ? 'border-l-4 border-l-badge-amber' : ''
                }`}
              >
                <div className="flex items-center gap-space-md">
                  <input
                    checked={isChecked}
                    onChange={() => toggleSelectOrder(order.id)}
                    className="w-5 h-5 rounded text-primary accent-primary cursor-pointer"
                    type="checkbox"
                  />
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-code-table text-code-table font-semibold px-2 py-0.5 rounded bg-surface-container-high text-on-surface">
                        {order.clientUuid.slice(0, 10)}
                      </span>
                      {order.status === 'APPROVED' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-status-success-bg text-status-success-text font-label-sm text-label-sm font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-badge-green" /> Telah Disetujui
                        </span>
                      ) : isWarningState ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-status-warning-bg text-status-warning-text font-label-sm text-label-sm font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-badge-amber" />
                          Menunggu Alokasi Sebagian
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-status-success-bg text-status-success-text font-label-sm text-label-sm font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-badge-green" />
                          Siap Potong
                        </span>
                      )}
                      <span className="font-label-sm text-label-sm text-on-surface-variant">
                        {order.orderTime} • Sales: {order.salesRep}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-title-sm text-title-sm font-bold text-on-surface">
                        {order.outletName}
                      </h3>
                      <span className="text-on-surface-variant">•</span>
                      <span
                        className={`font-body-md text-body-md ${
                          isWarningState ? 'text-badge-amber font-semibold' : 'text-on-surface-variant'
                        }`}
                      >
                        {order.stockWarning || `${order.items.length} SKU (${order.items.map(i => i.name).join(', ')})`}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between lg:justify-end gap-space-lg">
                  <div className="flex flex-col text-left lg:text-right">
                    <span className="font-headline-md text-headline-md font-bold text-primary">
                      Rp {order.totalAmount.toLocaleString('id-ID')}
                    </span>
                    <span className="font-label-sm text-label-sm text-status-success-text font-medium">
                      Termin {order.terms}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {isWarningState ? (
                      <button
                        onClick={() => setBatchModalOrder(order)}
                        className="px-space-md py-2 rounded-lg bg-status-warning-bg text-status-warning-text hover:bg-badge-amber hover:text-white font-label-md text-label-md flex items-center gap-1.5 transition-all cursor-pointer font-semibold shadow-xs"
                        type="button"
                      >
                        <span className="material-symbols-outlined text-[18px]">alt_route</span>
                        <span>Pilih Batch Pengganti</span>
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => setPrintOrderModal(order)}
                          className="p-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface transition-colors cursor-pointer"
                          title="Periksa Detil Lengkap"
                          type="button"
                        >
                          <span className="material-symbols-outlined text-[20px]">visibility</span>
                        </button>
                        {order.status === 'PENDING' && (
                          <button
                            onClick={() => approveOrder(order.id)}
                            className="px-space-md py-2 rounded-lg bg-primary-container text-on-primary font-label-md text-label-md flex items-center gap-1.5 shadow-xs hover:bg-primary transition-all cursor-pointer font-semibold active:scale-95"
                            type="button"
                          >
                            <span className="material-symbols-outlined text-[18px]">done</span>
                            <span>Konfirmasi Cepat</span>
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          </>
        )}
      </div>

      {/* Operational Real-time Logistics & Warehouse Feed Footer Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-md">
        {/* Left 7 Cols: Quick Stock Ledger Synchronization Stream */}
        <div className="lg:col-span-7 bg-surface-container-lowest p-space-md rounded-xl shadow-xs border border-border-subtle/40 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">history_edu</span>
                <h4 className="font-title-sm text-title-sm font-bold text-on-surface">
                  Riwayat Alokasi Stok Otomatis Terbaru (FEFO Ledger)
                </h4>
              </div>
              <span className="font-code-table text-code-table text-status-success-text font-medium">
                Realtime WebSocket Sync
              </span>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between p-2 rounded-lg bg-surface-container-low text-on-surface font-body-sm text-body-sm">
                <div className="flex items-center gap-2">
                  <span className="font-code-table text-code-table font-semibold text-primary">10:12:44</span>
                  <span>Potong Stok <b>50 Botol</b> SKU: ARB-ZTN-250 (Batch B-2026-031)</span>
                </div>
                <span className="font-label-sm text-label-sm px-2 py-0.5 rounded bg-status-success-bg text-status-success-text font-semibold">
                  Faktur ORD-9128 Diterbitkan
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-surface-container-low text-on-surface font-body-sm text-body-sm">
                <div className="flex items-center gap-2">
                  <span className="font-code-table text-code-table font-semibold text-primary">10:05:19</span>
                  <span>Kunci Cadangan <b>24 Botol</b> SKU: ARB-MDR-500 (Batch B-2026-018)</span>
                </div>
                <span className="font-label-sm text-label-sm px-2 py-0.5 rounded bg-secondary-fixed text-on-secondary-fixed font-semibold">
                  Reservasi Lapangan
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-surface-container-low text-on-surface font-body-sm text-body-sm">
                <div className="flex items-center gap-2">
                  <span className="font-code-table text-code-table font-semibold text-primary">09:51:02</span>
                  <span>Pemulihan Alokasi Void <b>10 Botol</b> SKU: ARB-HBT-100 (Rejeksi)</span>
                </div>
                <span className="font-label-sm text-label-sm px-2 py-0.5 rounded bg-status-danger-bg text-status-danger-text font-semibold">
                  Ledger Reversal OK
                </span>
              </div>
            </div>
          </div>
          <div className="pt-3 mt-3 flex items-center justify-between text-on-surface-variant font-label-sm text-label-sm border-t border-border-subtle/30">
            <span>Transparansi Audit: Sesuai pedoman CDOB (Cara Distribusi Obat yang Baik)</span>
            <button
              onClick={() => setPath('inventory-stock-ledger')}
              className="text-primary font-semibold hover:underline flex items-center gap-1 cursor-pointer"
              type="button"
            >
              Buka Buku Besar Lengkap <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>
        </div>

        {/* Right 5 Cols: Quick Print Dispatch Summary Widget */}
        <div className="lg:col-span-5 bg-surface-container-lowest p-space-md rounded-xl shadow-xs border border-border-subtle/40 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-[20px]">local_shipping</span>
                <h4 className="font-title-sm text-title-sm font-bold text-on-surface">
                  Jadwal Pengiriman Armada CV Arba'in
                </h4>
              </div>
              <span className="font-label-sm text-label-sm px-2 py-0.5 rounded bg-surface-container-high text-on-surface font-medium">
                Wave 1 (Siang)
              </span>
            </div>
            <div className="grid grid-cols-2 gap-space-sm mb-3">
              <div className="p-space-sm bg-surface-container-low rounded-lg border border-border-subtle/30">
                <span className="font-label-sm text-label-sm text-on-surface-variant block">
                  Armada GranMax AD-8941-KA
                </span>
                <span className="font-headline-md text-headline-md font-bold text-on-surface">8 Outlet</span>
                <span className="font-body-sm text-body-sm text-primary font-semibold block">
                  Rute: Solo Tengah &amp; Laweyan
                </span>
              </div>
              <div className="p-space-sm bg-surface-container-low rounded-lg border border-border-subtle/30">
                <span className="font-label-sm text-label-sm text-on-surface-variant block">
                  Armada BlindVan AD-1044-YB
                </span>
                <span className="font-headline-md text-headline-md font-bold text-on-surface">6 Outlet</span>
                <span className="font-body-sm text-body-sm text-secondary font-semibold block">
                  Rute: Sukoharjo &amp; Solo Baru
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between gap-space-sm pt-2 border-t border-border-subtle/30">
            <span className="font-body-sm text-body-sm text-on-surface-variant">Surat Jalan Dicetak Otomatis Rangkap 3</span>
            <button
              onClick={() => showToast('Manifest Driver terkirim ke PWA driver pengiriman (Joko & Hartono)', 'share_location')}
              className="px-space-md py-2 bg-secondary text-on-secondary hover:bg-on-secondary-fixed-variant font-label-md text-label-md rounded-lg flex items-center gap-1.5 transition-all cursor-pointer font-semibold shadow-xs"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">share_location</span>
              <span>Manifest Driver PWA</span>
            </button>
          </div>
        </div>
      </div>

      {/* Printable Surat Jalan / Faktur Modal */}
      {printOrderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-surface-container-lowest rounded-xl max-w-2xl w-full p-6 shadow-2xl flex flex-col gap-4 border border-border-subtle/50 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[24px]">local_shipping</span>
                <h3 className="font-title-sm text-title-sm text-on-surface font-bold">
                  Surat Jalan &amp; Faktur Penjualan B2B CV Arba'in
                </h3>
              </div>
              <button
                onClick={() => setPrintOrderModal(null)}
                className="text-on-surface-variant hover:text-on-surface cursor-pointer p-1 rounded-lg"
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="p-4 bg-surface-container-low/50 rounded-xl space-y-3 border border-border-subtle/40 text-on-surface">
              <div className="flex justify-between items-start border-b pb-2">
                <div>
                  <h4 className="font-bold text-lg text-primary">CV ARBA'IN SURAKARTA</h4>
                  <p className="text-xs text-on-surface-variant">Pusat Distribusi Produk Herbal Solo Raya</p>
                  <p className="text-xs text-on-surface-variant">Izin PBF / Penyalur Obat Herbal Terdaftar</p>
                </div>
                <div className="text-right text-xs">
                  <p className="font-bold text-sm">SURAT JALAN / FAKTUR</p>
                  <p className="font-mono text-primary font-semibold">{printOrderModal.clientUuid}</p>
                  <p className="text-on-surface-variant">Tanggal: 28 Maret 2026</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs bg-white p-3 rounded-lg border border-slate-200">
                <div>
                  <p className="text-slate-500 font-semibold">Tujuan Pengiriman:</p>
                  <p className="font-bold text-slate-800 text-sm">{printOrderModal.outletName}</p>
                  <p className="text-slate-600">{printOrderModal.address}</p>
                  <p className="text-slate-600">Kota: {printOrderModal.city}</p>
                </div>
                <div>
                  <p className="text-slate-500 font-semibold">Ketentuan Pembayaran:</p>
                  <p className="font-bold text-slate-800">{printOrderModal.terms}</p>
                  <p className="text-slate-600">NPWP: {printOrderModal.npwp}</p>
                  <p className="text-slate-600">Sales Lapangan: {printOrderModal.salesRep}</p>
                </div>
              </div>

              <table className="w-full text-xs text-left border-collapse border border-slate-300">
                <thead>
                  <tr className="bg-slate-200 text-slate-700">
                    <th className="border border-slate-300 p-2">No</th>
                    <th className="border border-slate-300 p-2">Nama Produk Herbal</th>
                    <th className="border border-slate-300 p-2">Batch / FEFO Exp</th>
                    <th className="border border-slate-300 p-2 text-center">Qty</th>
                    <th className="border border-slate-300 p-2 text-right">Harga</th>
                    <th className="border border-slate-300 p-2 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {printOrderModal.items.map((it, idx) => (
                    <tr key={idx} className="border-b border-slate-200 bg-white">
                      <td className="border border-slate-300 p-2">{idx + 1}</td>
                      <td className="border border-slate-300 p-2 font-medium">{it.name}</td>
                      <td className="border border-slate-300 p-2 font-mono text-[11px]">{it.batch} ({it.expiry})</td>
                      <td className="border border-slate-300 p-2 text-center font-bold">{it.quantity}</td>
                      <td className="border border-slate-300 p-2 text-right font-mono">Rp {it.unitPrice.toLocaleString('id-ID')}</td>
                      <td className="border border-slate-300 p-2 text-right font-mono font-bold">Rp {it.subtotal.toLocaleString('id-ID')}</td>
                    </tr>
                  ))}
                  <tr className="bg-slate-100 font-bold">
                    <td colSpan={5} className="border border-slate-300 p-2 text-right">TOTAL NILAI PEMESANAN:</td>
                    <td className="border border-slate-300 p-2 text-right font-mono text-primary text-sm">
                      Rp {printOrderModal.totalAmount.toLocaleString('id-ID')}
                    </td>
                  </tr>
                </tbody>
              </table>

              <div className="grid grid-cols-3 gap-2 pt-4 text-center text-xs text-slate-600">
                <div className="border-t border-slate-300 pt-8">Penerima Outlet (Stempel)</div>
                <div className="border-t border-slate-300 pt-8">Driver Ekspedisi CV Arba'in</div>
                <div className="border-t border-slate-300 pt-8">Kepala Gudang Kartasura</div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t pt-3">
              <button
                onClick={() => setPrintOrderModal(null)}
                className="px-4 py-2 rounded-lg bg-surface-container text-on-surface font-label-md text-label-md cursor-pointer hover:bg-surface-container-high"
                type="button"
              >
                Tutup
              </button>
              <button
                onClick={() => {
                  window.print();
                  setPrintOrderModal(null);
                }}
                className="px-5 py-2 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md font-semibold shadow-sm cursor-pointer flex items-center gap-1.5"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">print</span>
                <span>Cetak Lembar Surat Jalan</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Batch Replacement Modal */}
      {batchModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-surface-container-lowest rounded-xl max-w-lg w-full p-6 shadow-2xl flex flex-col gap-4 border border-border-subtle/50">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-[24px]">alt_route</span>
                <h3 className="font-title-sm text-title-sm text-on-surface font-bold">
                  Alihkan Batch Cadangan Gudang B
                </h3>
              </div>
              <button
                onClick={() => setBatchModalOrder(null)}
                className="text-on-surface-variant hover:text-on-surface cursor-pointer p-1 rounded-lg"
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <p className="text-xs text-on-surface-variant">
              SKU Madu Hutan Liar di Gudang Utama Kartasura tersisa 25 unit. Anda dapat mengalokasikan 15 unit sisanya dari <b>Gudang B Solo Baru</b> (Batch B-2026-002, Exp Nov 2027) untuk memenuhi pesanan {batchModalOrder.outletName}.
            </p>

            <div className="p-3 bg-status-success-bg/40 rounded-lg border border-status-success-bg text-xs">
              <div className="flex items-center gap-2 font-bold text-status-success-text mb-1">
                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                Tersedia 120 unit di Gudang B
              </div>
              <p className="text-slate-600">Alokasi otomatis FEFO tervalidasi. Surat jalan akan memuat keterangan 2 titik penjemputan armada.</p>
            </div>

            <div className="flex items-center justify-end gap-2 border-t pt-3">
              <button
                onClick={() => setBatchModalOrder(null)}
                className="px-4 py-2 rounded-lg bg-surface-container text-on-surface font-label-md text-label-md cursor-pointer"
                type="button"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  approveOrder(batchModalOrder.id);
                  setBatchModalOrder(null);
                  showToast('Batch pengganti Gudang B berhasil dialokasikan & pesanan disetujui!', 'task_alt');
                }}
                className="px-5 py-2 rounded-lg bg-primary text-on-primary font-label-md text-label-md font-semibold cursor-pointer shadow-sm hover:bg-primary-container"
                type="button"
              >
                Konfirmasi &amp; Alokasikan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quantity Adjustment Modal */}
      {adjustModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-surface-container-lowest rounded-xl max-w-md w-full p-6 shadow-2xl flex flex-col gap-4 border border-border-subtle/50">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-badge-amber text-[24px]">tune</span>
                <h3 className="font-title-sm text-title-sm text-on-surface font-bold">
                  Koreksi Kuantitas SKU Pesanan
                </h3>
              </div>
              <button
                onClick={() => setAdjustModalOrder(null)}
                className="text-on-surface-variant hover:text-on-surface cursor-pointer p-1 rounded-lg"
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="bg-surface-container-low p-3 rounded-lg text-xs space-y-1">
              <span className="text-on-surface-variant">Outlet:</span>
              <span className="font-bold text-on-surface block">{adjustModalOrder.outletName}</span>
              <span className="text-slate-500 font-mono">Invoice Ref: {adjustModalOrder.clientUuid}</span>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                adjustOrderQuantity({
                  orderId: adjustModalOrder.id,
                  sku: adjustItemSku,
                  newQty: Number(adjustItemQty)
                });
                setAdjustModalOrder(null);
              }}
              className="flex flex-col gap-3 text-xs"
            >
              <div className="flex flex-col gap-1">
                <label className="font-semibold text-on-surface-variant">Pilih SKU yang Disesuaikan:</label>
                <select
                  value={adjustItemSku}
                  onChange={(e) => {
                    setAdjustItemSku(e.target.value);
                    const item = adjustModalOrder.items.find(it => it.sku === e.target.value);
                    if (item) setAdjustItemQty(item.quantity);
                  }}
                  className="p-2 bg-surface-container-low rounded-lg border border-border-subtle/40 text-on-surface cursor-pointer"
                >
                  {adjustModalOrder.items.map((it, idx) => (
                    <option key={idx} value={it.sku}>
                      {it.name} (Saat ini: {it.quantity} botol)
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-semibold text-on-surface-variant">Kuantitas Baru Disetujui (Botol):</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={adjustItemQty}
                  onChange={(e) => setAdjustItemQty(Number(e.target.value))}
                  className="p-2 bg-surface-container-low rounded-lg border border-border-subtle/40 text-on-surface font-bold text-sm"
                />
              </div>

              <div className="flex items-center justify-end gap-2 border-t pt-3 mt-1">
                <button
                  type="button"
                  onClick={() => setAdjustModalOrder(null)}
                  className="px-4 py-2 rounded-lg bg-surface-container text-on-surface font-semibold hover:bg-surface-container-high cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-primary text-on-primary font-semibold hover:bg-primary-container shadow-sm cursor-pointer"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reject Order Modal */}
      {rejectModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-surface-container-lowest rounded-xl max-w-md w-full p-6 shadow-2xl flex flex-col gap-4 border border-border-subtle/50">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-badge-red text-[24px]">block</span>
                <h3 className="font-title-sm text-title-sm text-on-surface font-bold">
                  Konfirmasi Pembatalan / Rejeksi Pesanan
                </h3>
              </div>
              <button
                onClick={() => setRejectModalOrder(null)}
                className="text-on-surface-variant hover:text-on-surface cursor-pointer p-1 rounded-lg"
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="bg-surface-container-low p-3 rounded-lg text-xs space-y-1">
              <span className="text-on-surface-variant">Pesanan:</span>
              <span className="font-bold text-on-surface block">{rejectModalOrder.outletName}</span>
              <span className="text-slate-500 font-mono">{rejectModalOrder.clientUuid} • Rp {rejectModalOrder.totalAmount.toLocaleString('id-ID')}</span>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                rejectOrder(rejectModalOrder.id, rejectReason);
                setRejectModalOrder(null);
              }}
              className="flex flex-col gap-3 text-xs"
            >
              <div className="flex flex-col gap-1">
                <label className="font-semibold text-on-surface-variant">Alasan Rejeksi / Pembatalan:</label>
                <select
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="p-2 bg-surface-container-low rounded-lg border border-border-subtle/40 text-on-surface cursor-pointer"
                >
                  <option value="Plafon kredit mitra terlampaui">Plafon kredit mitra terlampaui</option>
                  <option value="Legalitas SIPA / Izin Apotek Kadaluarsa">Legalitas SIPA / Izin Apotek Kadaluarsa</option>
                  <option value="Permintaan pembatalan oleh Apoteker / PIC Outlet">Permintaan pembatalan oleh Apoteker / PIC Outlet</option>
                  <option value="Alokasi batch fisik di gudang habis">Alokasi batch fisik di gudang habis</option>
                  <option value="Alamat pengiriman di luar jangkauan armada Solo Raya">Alamat pengiriman di luar jangkauan armada Solo Raya</option>
                </select>
              </div>

              <div className="p-2.5 bg-status-danger-bg text-badge-red rounded-lg text-[11px] font-semibold flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">info</span>
                <span>Pesanan yang ditolak akan dipindahkan ke tab Void/Rejeksi untuk audit CDOB.</span>
              </div>

              <div className="flex items-center justify-end gap-2 border-t pt-3 mt-1">
                <button
                  type="button"
                  onClick={() => setRejectModalOrder(null)}
                  className="px-4 py-2 rounded-lg bg-surface-container text-on-surface font-semibold hover:bg-surface-container-high cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-badge-red text-white font-semibold hover:opacity-90 shadow-sm cursor-pointer"
                >
                  Tolak Pesanan Ini
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
