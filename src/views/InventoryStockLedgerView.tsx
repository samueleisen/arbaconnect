import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { MutationType, HerbalProduct } from '../types';
import { exportStockLedgerToCsv } from '../utils/exportUtils';

export const InventoryStockLedgerView: React.FC = () => {
  const { products, ledger, addInboundBatch, createSupplierPO, adjustStock, supplierPOs, showToast } = useApp();

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedRopStatus, setSelectedRopStatus] = useState('all');
  const [activeLedgerFilter, setActiveLedgerFilter] = useState<'ALL' | MutationType>('ALL');

  // Modal state - Batch Entry
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalSku, setModalSku] = useState('SKU-ARB-MDR500');
  const [modalBatch, setModalBatch] = useState('BATCH-2026-052');
  const [modalQty, setModalQty] = useState(250);
  const [modalExp, setModalExp] = useState('2028-02-28');
  const [modalRef, setModalRef] = useState('PO-2026-092');

  // Supplier PO Modal state
  const [poModalProduct, setPoModalProduct] = useState<HerbalProduct | null>(null);
  const [poVendor, setPoVendor] = useState('CV Sumber Herbal Barokah Solo');
  const [poQty, setPoQty] = useState(200);
  const [poLeadTime, setPoLeadTime] = useState(7);
  const [showPoListModal, setShowPoListModal] = useState(false);

  // Stock Opname Adjustment Modal state
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [adjSku, setAdjSku] = useState('SKU-ARB-MDR500');
  const [adjBatch, setAdjBatch] = useState('BATCH-2026-018');
  const [adjDelta, setAdjDelta] = useState(5);
  const [adjReason, setAdjReason] = useState('Selisih fisik opname berkala gudang');
  const [adjAuditor, setAdjAuditor] = useState('Dewi Lestari (Chief Auditor)');

  // Print Opname state
  const [showPrintModal, setShowPrintModal] = useState(false);

  // Pagination state
  const [catalogPage, setCatalogPage] = useState(1);
  const [ledgerPage, setLedgerPage] = useState(1);
  const itemsPerPage = 5;

  // Compute stats
  const totalPhysicalUnits = products.reduce((acc, p) => acc + p.stock, 0);
  const belowRopCount = products.filter(p => p.stock <= p.rop).length;
  const criticalExpiryCount = products.filter(p => p.fefoStatus === 'Kritis (<30 Hari)').length;
  const warningExpiryCount = products.filter(p => p.fefoStatus === 'Mendekati ED (<3 Bulan)').length;

  // Filter products
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || 
      (selectedCategory === 'madu' && p.category === 'Madu Herbal') ||
      (selectedCategory === 'kapsul' && p.category === 'Kapsul Herbal') ||
      (selectedCategory === 'minyak' && p.category === 'Minyak & Cairan') ||
      (selectedCategory === 'serbuk' && p.category === 'Serbuk');
    const matchesStatus = selectedRopStatus === 'all' ||
      (selectedRopStatus === 'safe' && p.stock > p.rop) ||
      (selectedRopStatus === 'below-rop' && p.stock <= p.rop && p.stock > 0) ||
      (selectedRopStatus === 'empty' && p.stock === 0);
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Filter ledger
  const filteredLedger = ledger.filter(entry => {
    if (activeLedgerFilter === 'ALL') return true;
    return entry.type === activeLedgerFilter;
  });

  const handleInboundSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addInboundBatch({
      sku: modalSku,
      batch: modalBatch,
      qty: Number(modalQty),
      expiryDate: modalExp,
      docRef: modalRef
    });
    setIsModalOpen(false);
  };

  const triggerPO = (product: HerbalProduct) => {
    setPoModalProduct(product);
    setPoQty(Math.max(100, (product.rop - product.stock) + product.safetyStock));
  };

  const handleCreatePO = (e: React.FormEvent) => {
    e.preventDefault();
    if (!poModalProduct) return;
    createSupplierPO({
      sku: poModalProduct.sku,
      productName: poModalProduct.name,
      vendorName: poVendor,
      quantity: Number(poQty),
      unitPrice: Math.round(poModalProduct.unitPrice * 0.65), // Wholesale vendor purchase cost ~65%
      leadTimeDays: Number(poLeadTime)
    });
    setPoModalProduct(null);
  };

  const handleAdjustSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    adjustStock({
      sku: adjSku,
      batch: adjBatch,
      quantityDelta: Number(adjDelta),
      reason: adjReason,
      auditorName: adjAuditor
    });
    setIsAdjustModalOpen(false);
  };

  return (
    <div className="flex flex-col w-full gap-space-lg">
      {/* Top Bar / Action Center */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-surface-container-lowest p-5 rounded-xl border border-border-subtle/60">
        <div className="flex flex-col gap-0.5 min-w-0">
          <div className="flex items-center gap-2 text-primary text-xs uppercase tracking-wider font-semibold">
            <span className="material-symbols-outlined text-[15px]">warehouse</span>
            <span>Gudang CV Arba'in · Standar CDOB &amp; FEFO</span>
          </div>
          <h1 className="text-xl text-on-surface tracking-tight font-bold">
            Kelola Stok Real-Time &amp; Buku Besar Stok (Stock Ledger)
          </h1>
          <p className="text-xs text-on-surface-variant max-w-xl">
            Audit mutasi inventaris atomik, kalkulasi otomatis Reorder Point (ROP), &amp; kontrol FEFO batch
          </p>
        </div>

        {/* Compact & Tidy Action Cluster on the Right */}
        <div className="flex flex-col sm:items-end gap-2 shrink-0">
          {/* Primary Operations Row */}
          <div className="flex items-center gap-1.5 flex-wrap sm:flex-nowrap">
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary hover:bg-primary-container text-white text-xs font-semibold whitespace-nowrap transition-colors shadow-xs active:scale-95 cursor-pointer"
              type="button"
              title="Input penerimaan batch herbal baru masuk gudang"
            >
              <span className="material-symbols-outlined text-[16px]">add_box</span>
              <span>+ Penerimaan Batch</span>
            </button>

            <button
              onClick={() => setIsAdjustModalOpen(true)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer border border-border-subtle/50"
              type="button"
              title="Penyesuaian selisih fisik opname berkala"
            >
              <span className="material-symbols-outlined text-[15px] text-on-surface-variant">tune</span>
              <span>Penyesuaian Opname</span>
            </button>
          </div>

          {/* Secondary Report & PO Tools Row */}
          <div className="flex items-center gap-1.5 flex-wrap sm:flex-nowrap">
            <button
              onClick={() => setShowPoListModal(true)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-surface-container-low hover:bg-surface-container text-primary text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer border border-border-subtle/50"
              type="button"
              title="Daftar Purchase Order ke Supplier Herbal"
            >
              <span className="material-symbols-outlined text-[15px]">local_mall</span>
              <span>PO Supplier</span>
              {supplierPOs.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-primary text-white text-[10px] font-bold">
                  {supplierPOs.length}
                </span>
              )}
            </button>

            <button
              onClick={() => exportStockLedgerToCsv(ledger)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-surface-container-low hover:bg-surface-container text-on-surface text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer border border-border-subtle/50"
              type="button"
              title="Unduh seluruh mutasi Stock Ledger dalam format CSV"
            >
              <span className="material-symbols-outlined text-[15px] text-on-surface-variant">table_chart</span>
              <span>Ekspor CSV</span>
            </button>

            <button
              onClick={() => setShowPrintModal(true)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-surface-container-low hover:bg-surface-container text-on-surface text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer border border-border-subtle/50"
              type="button"
              title="Cetak lembar formulir opname fisik gudang"
            >
              <span className="material-symbols-outlined text-[15px] text-on-surface-variant">print</span>
              <span>Cetak Opname</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Metric Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-space-md">
        {/* Card 1: Total SKU Aktif */}
        <div className="relative overflow-hidden bg-surface-container-lowest p-space-md rounded-xl shadow-xs border border-border-subtle/40 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                Total SKU Aktif
              </span>
              <div className="font-headline-xl text-headline-xl text-on-surface mt-1 tracking-tight font-bold">
                {products.length} <span className="font-title-sm text-title-sm text-on-surface-variant font-normal">SKU</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-surface-container-low flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[22px]">medication</span>
            </div>
          </div>
          <div className="mt-4 pt-3 bg-surface-container-low/50 rounded-lg p-2.5 flex items-center justify-between">
            <span className="font-body-sm text-body-sm text-on-surface-variant">Total Saldo Fisik:</span>
            <span className="font-code-table text-code-table font-semibold text-primary">
              {totalPhysicalUnits.toLocaleString('id-ID')} unit
            </span>
          </div>
        </div>

        {/* Card 2: Di Bawah ROP */}
        <div className="bg-surface-container-lowest p-5 rounded-xl border border-border-subtle/60 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-amber-700 uppercase tracking-wider font-semibold">
                  Di Bawah ROP
                </span>
                <span className="w-2 h-2 rounded-full bg-amber-500" />
              </div>
              <div className="text-2xl text-amber-700 mt-1 tracking-tight font-bold">
                {belowRopCount} <span className="text-xs text-on-surface-variant font-normal">SKU Segera Pesan</span>
              </div>
            </div>
            <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center text-amber-700">
              <span className="material-symbols-outlined text-[20px]">production_quantity_limits</span>
            </div>
          </div>
          <div className="mt-4 pt-2.5 border-t border-border-subtle/40 flex items-center justify-between text-xs text-on-surface-variant">
            <span>Buffer Pengaman (95%)</span>
            <span className="font-semibold text-amber-700">Perlu Reorder Segera</span>
          </div>
        </div>

        {/* Card 3: Peringatan FEFO */}
        <div className="bg-surface-container-lowest p-5 rounded-xl border border-border-subtle/60 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs text-rose-700 uppercase tracking-wider font-semibold">
                Peringatan FEFO
              </span>
              <div className="text-2xl text-rose-700 mt-1 tracking-tight font-bold">
                {criticalExpiryCount} <span className="text-xs text-on-surface-variant font-normal">Kritis &lt;30 Hari</span>
              </div>
            </div>
            <div className="w-9 h-9 rounded-lg bg-rose-50 flex items-center justify-center text-rose-700">
              <span className="material-symbols-outlined text-[20px]">event_busy</span>
            </div>
          </div>
          <div className="mt-4 pt-2.5 border-t border-border-subtle/40 flex items-center justify-between text-xs text-on-surface-variant">
            <span>{warningExpiryCount} Batch &lt;90 Hari</span>
            <span className="font-semibold text-rose-700">Rp 14.200.000 Nilai Stok</span>
          </div>
        </div>

        {/* Card 4: Status Ledger Sync */}
        <div className="bg-surface-container-lowest p-5 rounded-xl border border-border-subtle/60 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs text-primary uppercase tracking-wider font-semibold">
                Status Ledger Sync
              </span>
              <div className="text-2xl text-primary mt-1 tracking-tight font-bold">
                100% <span className="text-xs text-on-surface-variant font-normal">Tersinkronisasi</span>
              </div>
            </div>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-700">
              <span className="material-symbols-outlined text-[20px]">enhanced_encryption</span>
            </div>
          </div>
          <div className="mt-4 pt-3 bg-status-success-bg/50 rounded-lg p-2.5 flex items-center justify-between">
            <span className="font-body-sm text-body-sm text-status-success-text">Idempoten &amp; Anti-Selisih</span>
            <span className="font-code-table text-code-table font-semibold text-primary">SHA256 OK</span>
          </div>
        </div>
      </div>

      {/* Visual Quick Glance: FEFO Distribution Chart & Warehouse Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-space-md">
        {/* Visual 1: Stock Status Distribution SVG Metric Card */}
        <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-xs border border-border-subtle/40 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="font-title-sm text-title-sm text-on-surface font-bold">Sebaran Ketahanan FEFO Batch</span>
            <span className="font-label-sm text-label-sm text-on-surface-variant">Batch Aktif</span>
          </div>
          <div className="flex items-center gap-space-md">
            {/* SVG Donut Chart */}
            <div className="relative w-28 h-28 flex-shrink-0 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-surface-container-high"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3.8"
                />
                <path
                  className="text-primary"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeDasharray="70, 100"
                  strokeWidth="3.8"
                />
                <path
                  className="text-badge-amber"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeDasharray="20, 100"
                  strokeDashoffset="-70"
                  strokeWidth="3.8"
                />
                <path
                  className="text-badge-red"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeDasharray="10, 100"
                  strokeDashoffset="-90"
                  strokeWidth="3.8"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="font-headline-md text-headline-md text-on-surface font-bold leading-none">42</span>
                <span className="font-label-sm text-label-sm text-on-surface-variant">Batch</span>
              </div>
            </div>
            <div className="flex flex-col gap-2 flex-grow">
              <div className="flex items-center justify-between text-on-surface">
                <div className="flex items-center gap-1.5 font-label-md text-label-md">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                  <span>Aman (&gt;6 Bulan)</span>
                </div>
                <span className="font-code-table text-code-table font-semibold">35 (83%)</span>
              </div>
              <div className="flex items-center justify-between text-on-surface">
                <div className="flex items-center gap-1.5 font-label-md text-label-md">
                  <span className="w-2.5 h-2.5 rounded-full bg-badge-amber" />
                  <span>Waspada (&lt;90 Hari)</span>
                </div>
                <span className="font-code-table text-code-table font-semibold">5 (12%)</span>
              </div>
              <div className="flex items-center justify-between text-on-surface">
                <div className="flex items-center gap-1.5 font-label-md text-label-md">
                  <span className="w-2.5 h-2.5 rounded-full bg-badge-red" />
                  <span>Kritis (&lt;30 Hari)</span>
                </div>
                <span className="font-code-table text-code-table font-semibold text-status-danger-text">2 (5%)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Visual 2: Quick ROP Health Indicator */}
        <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-xs border border-border-subtle/40 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-title-sm text-title-sm text-on-surface font-bold">Progres Safety Stock Keseluruhan</span>
            <span className="px-2 py-0.5 rounded-full bg-status-success-bg text-status-success-text font-label-sm text-label-sm font-semibold">
              Terkendali 91%
            </span>
          </div>
          <div className="my-3 flex flex-col gap-1.5">
            <div className="w-full bg-surface-container h-3 rounded-full overflow-hidden flex">
              <div className="bg-primary h-full" style={{ width: '78%' }} />
              <div className="bg-badge-amber h-full" style={{ width: '13%' }} />
              <div className="bg-badge-red h-full" style={{ width: '9%' }} />
            </div>
            <div className="flex justify-between font-label-sm text-label-sm text-on-surface-variant">
              <span>Stok Normal (33 SKU)</span>
              <span>Buffer Menipis (5 SKU)</span>
              <span>Kritis ROP (4 SKU)</span>
            </div>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Pemesanan otomatis terintegrasi langsung dengan Purchase Order Vendor CV Arba'in di Kartasura.
          </p>
        </div>

        {/* Visual 3: Photo Rich Operational Warehouse Unit */}
        <div className="relative bg-surface-container-lowest rounded-xl shadow-xs overflow-hidden min-h-[140px] flex items-center border border-border-subtle/40">
          <img
            className="absolute inset-0 w-full h-full object-cover"
            alt="Warehouse CV Arba'in Kartasura"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCXSkCCkRfjOjEsxVM3gjkn_FdhuEZVzJw9g39lPyfJZH1wt00Sz6FuthN0pSTVc5I_JKr0X5vakXqjr0q0kC7dvrYCUMRSm6TFMpadVeQXtgQuxGOTWrxKWUPVu9iQvBU7QLOlYwqOiuBCObsnpcZHdh6nHwKBZmKkVmJARgwO6m7eiqRkqqT8aBjveWpwnZZTctEVaKvU2nG1tpuhQRwSL2pq3WuqE1mKp7FOabRUrhf1dAW4BtyA"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-on-surface/90 via-on-surface/60 to-transparent" />
          <div className="relative p-space-md text-white flex flex-col justify-center">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-primary-fixed font-bold">
              Audit Operasional
            </span>
            <h2 className="font-headline-md text-headline-md text-white font-bold">
              Gudang Utama Kartasura
            </h2>
            <p className="font-body-sm text-body-sm text-surface-container-high mt-1 max-w-[200px]">
              SOP FEFO Strict 100% dipatuhi seluruh staff logistik.
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 1: Warehouse Stock Catalog & ROP Monitor */}
      <section className="flex flex-col gap-space-md bg-surface-container-lowest p-space-lg rounded-xl shadow-xs border border-border-subtle/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-headline-md text-headline-md text-on-surface font-bold">
                Katalog Stok Gudang &amp; Monitoring Reorder Point (ROP)
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-surface-container text-primary font-label-sm text-label-sm font-semibold">
                Live Audit
              </span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Perhitungan dinamis waktu tenggang (Lead Time L) dan rata-rata permintaan harian (d) produk herbal CV Arba'in.
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <span className="material-symbols-outlined text-on-surface-variant absolute left-2.5 top-2.5 text-[18px]">
                search
              </span>
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-2 bg-surface-container-low rounded-lg font-body-sm text-body-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:bg-surface-container w-52 sm:w-60"
                placeholder="Cari SKU / Nama Herbal..."
                type="text"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-surface-container-low font-label-md text-label-md text-on-surface px-3 py-2 rounded-lg cursor-pointer focus:outline-none focus:bg-surface-container"
            >
              <option value="all">Semua Kategori</option>
              <option value="madu">Madu Herbal</option>
              <option value="kapsul">Kapsul Herbal</option>
              <option value="minyak">Minyak &amp; Cairan</option>
              <option value="serbuk">Serbuk</option>
            </select>
            <select
              value={selectedRopStatus}
              onChange={(e) => setSelectedRopStatus(e.target.value)}
              className="bg-surface-container-low font-label-md text-label-md text-on-surface px-3 py-2 rounded-lg cursor-pointer focus:outline-none focus:bg-surface-container"
            >
              <option value="all">Semua Status ROP</option>
              <option value="safe">Stok Aman</option>
              <option value="below-rop">Di Bawah ROP</option>
              <option value="empty">Stok Habis</option>
            </select>
          </div>
        </div>

        {/* Data Table ROP & Catalog */}
        <div className="overflow-x-auto rounded-xl">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface-container-low/60 text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider">
                <th className="py-3 px-4 rounded-l-lg">SKU / Nama Produk Herbal</th>
                <th className="py-3 px-3">Kategori</th>
                <th className="py-3 px-3 text-right">Saldo Fisik</th>
                <th className="py-3 px-3 text-right">Safety Stock</th>
                <th className="py-3 px-3 text-right">ROP Kalkulasi</th>
                <th className="py-3 px-3">Batch Aktif</th>
                <th className="py-3 px-3">FEFO Exp. Date</th>
                <th className="py-3 px-4 rounded-r-lg text-center">Tindakan Logistik</th>
              </tr>
            </thead>
            <tbody className="font-body-md text-body-md divide-y-0">
              {filteredProducts.map((p) => {
                const isBelowRop = p.stock <= p.rop;
                const isCriticalExp = p.fefoStatus === 'Kritis (<30 Hari)';
                const isWarningExp = p.fefoStatus === 'Mendekati ED (<3 Bulan)';

                let rowBgClass = 'hover:bg-surface-container-low/40 transition-colors';
                if (isCriticalExp) {
                  rowBgClass = 'bg-status-danger-bg/20 hover:bg-status-danger-bg/30 transition-colors';
                } else if (isBelowRop) {
                  rowBgClass = 'bg-status-warning-bg/20 hover:bg-status-warning-bg/30 transition-colors';
                }

                return (
                  <tr key={p.sku} className={rowBgClass}>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold ${
                            isCriticalExp
                              ? 'bg-status-danger-bg text-status-danger-text'
                              : isBelowRop
                              ? 'bg-status-warning-bg text-status-warning-text'
                              : 'bg-surface-container text-primary'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[18px]">{p.icon}</span>
                        </div>
                        <div>
                          <div className="font-label-lg text-label-lg text-on-surface font-semibold">{p.name}</div>
                          <div className="font-code-table text-code-table text-on-surface-variant">{p.sku}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded bg-surface-container font-label-sm text-label-sm text-on-surface">
                        {p.category}
                      </span>
                    </td>
                    <td
                      className={`py-3 px-3 text-right font-code-table text-code-table font-semibold ${
                        isCriticalExp
                          ? 'text-status-danger-text font-bold'
                          : isBelowRop
                          ? 'text-badge-red font-bold'
                          : 'text-on-surface'
                      }`}
                    >
                      {p.stock.toLocaleString('id-ID')} unit
                    </td>
                    <td className="py-3 px-3 text-right font-code-table text-code-table text-on-surface-variant">
                      {p.safetyStock} unit
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div
                        className={`font-code-table text-code-table font-semibold ${
                          isBelowRop ? 'text-status-warning-text font-bold' : 'text-primary'
                        }`}
                      >
                        {p.rop} unit
                      </div>
                      <div className="font-label-sm text-label-sm text-on-surface-variant">{p.ropFormula}</div>
                    </td>
                    <td className="py-3 px-3 font-code-table text-code-table">
                      <span
                        className={`px-2 py-0.5 rounded ${
                          isCriticalExp
                            ? 'bg-status-danger-bg text-status-danger-text font-bold'
                            : 'bg-surface-container-low text-on-surface'
                        }`}
                      >
                        {p.activeBatch}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isCriticalExp
                              ? 'bg-rose-600'
                              : isWarningExp
                              ? 'bg-amber-500'
                              : 'bg-emerald-600'
                          }`}
                        />
                        <span
                          className={`font-code-table text-code-table ${
                            isCriticalExp ? 'text-status-danger-text font-bold' : 'text-on-surface'
                          }`}
                        >
                          {p.fefoDate}
                        </span>
                      </div>
                      <span
                        className={`font-label-sm text-label-sm ${
                          isCriticalExp
                            ? 'text-status-danger-text font-bold'
                            : isWarningExp
                            ? 'text-status-warning-text'
                            : 'text-status-success-text'
                        }`}
                      >
                        {p.fefoStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {isCriticalExp ? (
                        <button
                          onClick={() => triggerPO(p)}
                          className="flex items-center justify-center gap-1 w-full px-3 py-1.5 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-label-sm text-label-sm font-semibold transition-all cursor-pointer shadow-xs active:scale-95"
                          type="button"
                        >
                          <span className="material-symbols-outlined text-[16px]">priority_high</span>
                          <span>Prioritas Restock / PO</span>
                        </button>
                      ) : isBelowRop ? (
                        <button
                          onClick={() => triggerPO(p)}
                          className="animate-pulse flex items-center justify-center gap-1 w-full px-3 py-1.5 rounded-lg bg-badge-amber hover:bg-status-warning-text text-white font-label-sm text-label-sm font-semibold transition-all shadow-xs cursor-pointer active:scale-95"
                          type="button"
                        >
                          <span className="material-symbols-outlined text-[16px]">shopping_cart_checkout</span>
                          <span>Trigger Restock / PO</span>
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-status-success-bg text-status-success-text font-label-sm text-label-sm font-semibold">
                          <span className="material-symbols-outlined text-[14px]">check_circle</span> Stok Optimal
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Table Pagination & Count Note */}
        <div className="flex flex-col sm:flex-row items-center justify-between text-on-surface-variant font-label-sm text-label-sm pt-2">
          <div>Menampilkan {filteredProducts.length} dari 42 Master SKU Herbal CV Arba'in</div>
          <div className="flex items-center gap-1">
            <button className="px-2.5 py-1 rounded bg-surface-container-low hover:bg-surface-container text-on-surface font-semibold">
              1
            </button>
            <button className="px-2.5 py-1 rounded bg-surface-container-lowest hover:bg-surface-container text-on-surface">
              2
            </button>
            <button className="px-2.5 py-1 rounded bg-surface-container-lowest hover:bg-surface-container text-on-surface">
              3
            </button>
            <button className="px-2.5 py-1 rounded bg-surface-container-lowest hover:bg-surface-container text-on-surface">
              Berikutnya &gt;
            </button>
          </div>
        </div>
      </section>

      {/* SECTION 2: Stock Ledger Audit Log (Immutable Transaction Ledger) */}
      <section className="flex flex-col gap-space-md bg-surface-container-lowest p-space-lg rounded-xl shadow-xs border border-border-subtle/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-headline-md text-headline-md text-on-surface font-bold">
                Audit Log Buku Besar Stok (Real-Time Stock Ledger)
              </h2>
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-status-success-bg text-status-success-text font-label-sm text-label-sm font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-badge-green" /> Tamper-Proof
              </span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Pencatatan mutasi inventaris atomik berurutan anti-selisih untuk CV Arba'in
            </p>
          </div>

          {/* Mutation Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {(['ALL', 'MASUK', 'KELUAR', 'PENYESUAIAN', 'RETUR'] as const).map((filter) => {
              const isActive = activeLedgerFilter === filter;
              let label = 'Semua Tipe';
              if (filter === 'MASUK') label = '+ MASUK (Supplier)';
              if (filter === 'KELUAR') label = '- KELUAR (Sales Order)';
              if (filter === 'PENYESUAIAN') label = 'PENYESUAIAN (Opname)';
              if (filter === 'RETUR') label = 'RETUR (Klien)';

              return (
                <button
                  key={filter}
                  onClick={() => setActiveLedgerFilter(filter)}
                  type="button"
                  className={`px-3 py-1.5 rounded-lg font-label-md text-label-md transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-primary text-on-primary font-semibold shadow-xs'
                      : 'bg-surface-container-low hover:bg-surface-container text-on-surface'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Ledger Table */}
        <div className="overflow-x-auto rounded-xl">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface-container-low/60 text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider">
                <th className="py-3 px-4 rounded-l-lg">ID Transaksi &amp; Waktu</th>
                <th className="py-3 px-3">Ref Dokumen</th>
                <th className="py-3 px-3">SKU &amp; Batch Terkait</th>
                <th className="py-3 px-3 text-center">Tipe Mutasi</th>
                <th className="py-3 px-3 text-right">Kuantitas</th>
                <th className="py-3 px-3 text-right">Saldo Akhir</th>
                <th className="py-3 px-3">Petugas / Operator</th>
                <th className="py-3 px-4 rounded-r-lg">Checksum / Hash</th>
              </tr>
            </thead>
            <tbody className="font-body-md text-body-md divide-y-0">
              {filteredLedger.map((entry) => {
                let badgeClass = 'bg-status-success-bg text-status-success-text';
                let typeIcon = 'arrow_downward';
                let typeText = '+ MASUK';
                let qtyClass = 'text-status-success-text font-bold';

                if (entry.type === 'KELUAR') {
                  badgeClass = 'bg-status-danger-bg text-status-danger-text';
                  typeIcon = 'arrow_upward';
                  typeText = '- KELUAR';
                  qtyClass = 'text-status-danger-text font-bold';
                } else if (entry.type === 'PENYESUAIAN') {
                  badgeClass = 'bg-secondary-fixed text-on-secondary-fixed';
                  typeIcon = 'tune';
                  typeText = 'PENYESUAIAN';
                  qtyClass = 'text-secondary font-bold';
                } else if (entry.type === 'RETUR') {
                  badgeClass = 'bg-surface-container-high text-on-surface';
                  typeIcon = 'assignment_return';
                  typeText = 'RETUR';
                  qtyClass = 'text-primary font-bold';
                }

                return (
                  <tr key={entry.id} className="hover:bg-surface-container-low/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-code-table text-code-table font-bold text-on-surface">{entry.id}</div>
                      <div className="font-label-sm text-label-sm text-on-surface-variant">{entry.timestamp}</div>
                    </td>
                    <td className="py-3 px-3 font-code-table text-code-table text-secondary font-medium">
                      {entry.docRef}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-label-md text-label-md text-on-surface font-semibold">{entry.skuName}</div>
                      <div className="font-code-table text-code-table text-on-surface-variant">{entry.batch}</div>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded font-label-sm text-label-sm font-bold ${badgeClass}`}>
                        <span className="material-symbols-outlined text-[14px]">{typeIcon}</span> {typeText}
                      </span>
                    </td>
                    <td className={`py-3 px-3 text-right font-code-table text-code-table ${qtyClass}`}>
                      {entry.quantity > 0 ? `+${entry.quantity}` : entry.quantity} unit
                    </td>
                    <td className="py-3 px-3 text-right font-code-table text-code-table font-bold text-on-surface">
                      {entry.finalStock.toLocaleString('id-ID')} unit
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-label-md text-label-md text-on-surface font-semibold">{entry.operator}</div>
                      <div className="font-label-sm text-label-sm text-on-surface-variant">{entry.operatorRole}</div>
                    </td>
                    <td className="py-3 px-4 font-code-table text-code-table text-on-surface-variant">
                      <span className="bg-surface-container px-2 py-0.5 rounded text-[11px] font-mono text-on-surface-variant" title="Verified SHA-256 Ledger Node">
                        {entry.hash}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Ledger Integrity Footer Indicator */}
        <div className="flex flex-col sm:flex-row items-center justify-between p-space-md bg-surface-container-low rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-status-success-bg flex items-center justify-center text-status-success-text shadow-xs">
              <span className="material-symbols-outlined text-[18px]">lock</span>
            </div>
            <div>
              <div className="font-label-lg text-label-lg text-on-surface font-bold">
                Buku Besar Stok Terkunci Secara Kriptografis
              </div>
              <div className="font-body-sm text-body-sm text-on-surface-variant">
                Tidak ada selisih mutasi fisik dan catatan digital sejak audit terakhir (24 Feb 2026, 08:00 WIB).
              </div>
            </div>
          </div>
          <div className="mt-2 sm:mt-0 font-code-table text-code-table text-primary font-bold">
            Blok Hash: 9d8f...3e2a1 (Status Sinkron)
          </div>
        </div>
      </section>

      {/* Interactive Modal: Penerimaan Barang (Batch Masuk) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-surface-container-lowest rounded-xl max-w-lg w-full p-space-lg shadow-2xl flex flex-col gap-space-md border border-border-subtle/50">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[24px]">input</span>
                <h3 className="font-title-sm text-title-sm text-on-surface font-bold">Penerimaan Barang (Batch Masuk)</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-on-surface-variant hover:text-on-surface cursor-pointer p-1 rounded-lg"
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Masukkan data batch manufaktur produk herbal baru CV Arba'in untuk dimasukkan langsung ke Stock Ledger.
            </p>
            <form onSubmit={handleInboundSubmit} className="flex flex-col gap-3">
              <div>
                <label className="block font-label-md text-label-md text-on-surface mb-1">Pilih Produk SKU Herbal</label>
                <select
                  value={modalSku}
                  onChange={(e) => setModalSku(e.target.value)}
                  className="w-full bg-surface-container-low font-body-sm text-body-sm text-on-surface p-2.5 rounded-lg focus:outline-none focus:bg-surface-container cursor-pointer"
                >
                  {products.map(p => (
                    <option key={p.sku} value={p.sku}>
                      {p.name} ({p.sku})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-label-md text-label-md text-on-surface mb-1">Nomor Batch Baru</label>
                  <input
                    value={modalBatch}
                    onChange={(e) => setModalBatch(e.target.value)}
                    required
                    type="text"
                    className="w-full bg-surface-container-low font-code-table text-code-table text-on-surface p-2.5 rounded-lg focus:outline-none focus:bg-surface-container"
                  />
                </div>
                <div>
                  <label className="block font-label-md text-label-md text-on-surface mb-1">Kuantitas Masuk (Unit)</label>
                  <input
                    value={modalQty}
                    onChange={(e) => setModalQty(Number(e.target.value))}
                    min="1"
                    required
                    type="number"
                    className="w-full bg-surface-container-low font-code-table text-code-table text-on-surface p-2.5 rounded-lg focus:outline-none focus:bg-surface-container"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-label-md text-label-md text-on-surface mb-1">Tanggal Kedaluwarsa (ED)</label>
                  <input
                    value={modalExp}
                    onChange={(e) => setModalExp(e.target.value)}
                    required
                    type="date"
                    className="w-full bg-surface-container-low font-body-sm text-body-sm text-on-surface p-2 rounded-lg focus:outline-none focus:bg-surface-container cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block font-label-md text-label-md text-on-surface mb-1">Referensi Dokumen PO</label>
                  <input
                    value={modalRef}
                    onChange={(e) => setModalRef(e.target.value)}
                    required
                    type="text"
                    className="w-full bg-surface-container-low font-code-table text-code-table text-on-surface p-2.5 rounded-lg focus:outline-none focus:bg-surface-container"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t mt-1">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-surface-container-high hover:bg-surface-container text-on-surface font-label-md text-label-md cursor-pointer"
                  type="button"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md font-semibold shadow-sm cursor-pointer transition-all active:scale-95"
                >
                  Simpan Mutasi Masuk
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Opname Modal */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-surface-container-lowest rounded-xl max-w-2xl w-full p-6 shadow-2xl flex flex-col gap-4 border border-border-subtle/50 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[24px]">print</span>
                <h3 className="font-title-sm text-title-sm text-on-surface font-bold">
                  Pratinjau Berkas Cetak Laporan Opname Stok CV Arba'in
                </h3>
              </div>
              <button
                onClick={() => setShowPrintModal(false)}
                className="text-on-surface-variant hover:text-on-surface cursor-pointer p-1 rounded-lg"
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="p-4 bg-surface-container-low/50 rounded-xl space-y-3 border border-border-subtle/40 text-on-surface">
              <div className="flex justify-between items-center border-b pb-2">
                <div>
                  <h4 className="font-bold text-lg text-primary">CV ARBA'IN SURAKARTA</h4>
                  <p className="text-xs text-on-surface-variant">Gudang Utama Kartasura • Sertifikasi CDOB &amp; ISO 9001:2015</p>
                </div>
                <div className="text-right text-xs">
                  <p className="font-semibold">Kode Audit: OPN-2026-Q1-B</p>
                  <p className="text-on-surface-variant">Tanggal: 28 Maret 2026</p>
                </div>
              </div>

              <div className="text-xs space-y-1">
                <p><strong>Total SKU Aktif:</strong> {products.length} SKU</p>
                <p><strong>Total Saldo Fisik:</strong> {totalPhysicalUnits.toLocaleString('id-ID')} unit</p>
                <p><strong>Tingkat Kepatuhan FEFO:</strong> 99.4% Kepatuhan Strict</p>
              </div>

              <table className="w-full text-xs text-left border-collapse border border-slate-300">
                <thead>
                  <tr className="bg-slate-200">
                    <th className="border border-slate-300 p-1.5">SKU</th>
                    <th className="border border-slate-300 p-1.5">Nama Produk</th>
                    <th className="border border-slate-300 p-1.5 text-right">Saldo</th>
                    <th className="border border-slate-300 p-1.5 text-right">ROP</th>
                    <th className="border border-slate-300 p-1.5">Batch</th>
                    <th className="border border-slate-300 p-1.5">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(p => (
                    <tr key={p.sku} className="border-b border-slate-200">
                      <td className="border border-slate-300 p-1.5 font-mono">{p.sku}</td>
                      <td className="border border-slate-300 p-1.5">{p.name}</td>
                      <td className="border border-slate-300 p-1.5 text-right font-bold">{p.stock}</td>
                      <td className="border border-slate-300 p-1.5 text-right">{p.rop}</td>
                      <td className="border border-slate-300 p-1.5 font-mono">{p.activeBatch}</td>
                      <td className="border border-slate-300 p-1.5">{p.status === 'optimal' ? 'Aman' : 'Perlu PO'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="pt-3 text-[11px] text-on-surface-variant flex justify-between">
                <div>Petugas Pemeriksa: <b>Dewi Lestari (Chief Auditor)</b></div>
                <div>Disetujui Oleh: <b>Direktur Operasional CV Arba'in</b></div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t pt-3">
              <button
                onClick={() => setShowPrintModal(false)}
                className="px-4 py-2 rounded-lg bg-surface-container text-on-surface font-label-md text-label-md cursor-pointer hover:bg-surface-container-high"
                type="button"
              >
                Tutup
              </button>
              <button
                onClick={() => {
                  window.print();
                  setShowPrintModal(false);
                }}
                className="px-5 py-2 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md font-semibold shadow-sm cursor-pointer flex items-center gap-1.5"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">print</span>
                <span>Cetak Lembar Dokumen</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Modal: Terbitkan PO ke Vendor Supplier */}
      {poModalProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-surface-container-lowest rounded-xl max-w-lg w-full p-space-lg shadow-2xl flex flex-col gap-space-md border border-border-subtle/50">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[24px]">shopping_cart_checkout</span>
                <h3 className="font-title-sm text-title-sm text-on-surface font-bold">
                  Terbitkan PO Supplier (Vendor Restock)
                </h3>
              </div>
              <button
                onClick={() => setPoModalProduct(null)}
                className="text-on-surface-variant hover:text-on-surface cursor-pointer p-1 rounded-lg"
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="p-3 bg-surface-container-low rounded-lg text-xs space-y-1 border border-border-subtle/30">
              <div className="font-bold text-sm text-on-surface">{poModalProduct.name}</div>
              <div className="text-on-surface-variant font-mono">{poModalProduct.sku} • Saldo Fisik: {poModalProduct.stock} unit (ROP: {poModalProduct.rop})</div>
              <div className="text-status-danger-text font-semibold">Defisit Buffer: {Math.max(0, poModalProduct.rop - poModalProduct.stock)} unit</div>
            </div>

            <form onSubmit={handleCreatePO} className="flex flex-col gap-3 text-xs">
              <div>
                <label className="block font-semibold text-on-surface mb-1">Pilih Vendor Mitra Pabrik / Peternak</label>
                <select
                  value={poVendor}
                  onChange={(e) => setPoVendor(e.target.value)}
                  className="w-full bg-surface-container-low p-2.5 rounded-lg border-0 font-medium cursor-pointer focus:bg-surface-container"
                >
                  <option value="CV Sumber Herbal Barokah Solo">CV Sumber Herbal Barokah Solo (Pabrik Ekstrak)</option>
                  <option value="Kelompok Tani Lebah Rimba Boyolali">Kelompok Tani Lebah Rimba Boyolali (Madu Murni)</option>
                  <option value="PT Kapsulindo Ekstrak Alami Karanganyar">PT Kapsulindo Ekstrak Alami Karanganyar</option>
                  <option value="Importir Minyak Zaitun Al-Barokah Jakarta">Importir Minyak Zaitun Al-Barokah Jakarta</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-on-surface mb-1">Kuantitas Pesan (Unit)</label>
                  <input
                    value={poQty}
                    onChange={(e) => setPoQty(Number(e.target.value))}
                    min={10}
                    required
                    type="number"
                    className="w-full bg-surface-container-low p-2 rounded-lg font-mono font-bold focus:bg-surface-container"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-on-surface mb-1">Lead Time Produksi &amp; Kirim</label>
                  <select
                    value={poLeadTime}
                    onChange={(e) => setPoLeadTime(Number(e.target.value))}
                    className="w-full bg-surface-container-low p-2 rounded-lg cursor-pointer"
                  >
                    <option value={3}>3 Hari (Express)</option>
                    <option value={7}>7 Hari (Standar L=7)</option>
                    <option value={14}>14 Hari (Batch Besar)</option>
                  </select>
                </div>
              </div>

              <div className="p-2.5 bg-surface-container-low rounded-lg flex items-center justify-between font-semibold">
                <span className="text-on-surface-variant">Estimasi Nilai PO Supplier:</span>
                <span className="text-primary font-bold text-sm">
                  Rp {(poQty * Math.round(poModalProduct.unitPrice * 0.65)).toLocaleString('id-ID')}
                </span>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t">
                <button
                  onClick={() => setPoModalProduct(null)}
                  className="px-4 py-2 rounded-lg bg-surface-container text-on-surface font-label-md text-label-md cursor-pointer"
                  type="button"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md font-semibold shadow-sm cursor-pointer transition-all active:scale-95"
                >
                  Kirim PO ke Vendor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Interactive Modal: Penyesuaian Selisih Opname Fisik (Audit Reconciliation) */}
      {isAdjustModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-surface-container-lowest rounded-xl max-w-lg w-full p-space-lg shadow-2xl flex flex-col gap-space-md border border-border-subtle/50">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-[24px]">tune</span>
                <h3 className="font-title-sm text-title-sm text-on-surface font-bold">
                  Penyesuaian Stok (Stock Opname Reconciliation)
                </h3>
              </div>
              <button
                onClick={() => setIsAdjustModalOpen(false)}
                className="text-on-surface-variant hover:text-on-surface cursor-pointer p-1 rounded-lg"
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Gunakan formulir ini untuk rekonsiliasi selisih hitung fisik saat audit opname berkala gudang. Setiap perubahan akan dicatat permanen dalam Stock Ledger.
            </p>

            <form onSubmit={handleAdjustSubmit} className="flex flex-col gap-3 text-xs">
              <div>
                <label className="block font-semibold text-on-surface mb-1">Pilih Produk SKU</label>
                <select
                  value={adjSku}
                  onChange={(e) => {
                    setAdjSku(e.target.value);
                    const p = products.find(prod => prod.sku === e.target.value);
                    if (p) setAdjBatch(p.activeBatch);
                  }}
                  className="w-full bg-surface-container-low p-2.5 rounded-lg border-0 font-medium cursor-pointer focus:bg-surface-container"
                >
                  {products.map(p => (
                    <option key={p.sku} value={p.sku}>
                      {p.name} ({p.sku}) — Stok saat ini: {p.stock}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-on-surface mb-1">Batch Terkait</label>
                  <input
                    value={adjBatch}
                    onChange={(e) => setAdjBatch(e.target.value)}
                    required
                    type="text"
                    className="w-full bg-surface-container-low p-2 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-on-surface mb-1">Selisih (+ / - Unit)</label>
                  <input
                    value={adjDelta}
                    onChange={(e) => setAdjDelta(Number(e.target.value))}
                    required
                    type="number"
                    className="w-full bg-surface-container-low p-2 rounded-lg font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-on-surface mb-1">Alasan Penyesuaian Audit</label>
                <select
                  value={adjReason}
                  onChange={(e) => setAdjReason(e.target.value)}
                  className="w-full bg-surface-container-low p-2 rounded-lg cursor-pointer"
                >
                  <option value="Selisih fisik opname berkala gudang">Selisih fisik opname berkala gudang</option>
                  <option value="Kerusakan kemasan / segel saat handling transit">Kerusakan kemasan / segel saat handling transit</option>
                  <option value="Pengambilan sampel uji laboratorium QC">Pengambilan sampel uji laboratorium QC</option>
                  <option value="Koreksi salah input nomor batch sebelumnya">Koreksi salah input nomor batch sebelumnya</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-on-surface mb-1">Nama Auditor / Penanggung Jawab</label>
                <input
                  value={adjAuditor}
                  onChange={(e) => setAdjAuditor(e.target.value)}
                  required
                  type="text"
                  className="w-full bg-surface-container-low p-2 rounded-lg"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t">
                <button
                  onClick={() => setIsAdjustModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-surface-container text-on-surface font-label-md text-label-md cursor-pointer"
                  type="button"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-secondary text-on-secondary hover:bg-secondary-container hover:text-on-secondary-container font-label-md text-label-md font-semibold shadow-sm cursor-pointer transition-all active:scale-95"
                >
                  Simpan Penyesuaian ke Ledger
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Interactive Modal: Monitoring PO Supplier Aktif */}
      {showPoListModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-surface-container-lowest rounded-xl max-w-2xl w-full p-space-lg shadow-2xl flex flex-col gap-space-md border border-border-subtle/50 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[24px]">local_mall</span>
                <h3 className="font-title-sm text-title-sm text-on-surface font-bold">
                  Daftar Purchase Order (PO) Supplier Vendor CV Arba'in
                </h3>
              </div>
              <button
                onClick={() => setShowPoListModal(false)}
                className="text-on-surface-variant hover:text-on-surface cursor-pointer p-1 rounded-lg"
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="divide-y divide-border-subtle/30 border border-border-subtle/40 rounded-xl overflow-hidden">
              {supplierPOs.map((po) => (
                <div key={po.id} className="p-3 bg-surface-container-low/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold font-mono text-primary">{po.id}</span>
                      <span className="px-2 py-0.5 rounded-full bg-status-warning-bg text-status-warning-text font-semibold">
                        {po.status}
                      </span>
                    </div>
                    <div className="font-semibold text-on-surface mt-0.5">{po.productName}</div>
                    <div className="text-on-surface-variant">Vendor: {po.vendorName} • Lead time: {po.leadTimeDays} hari (Est: {po.expectedDate})</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-sm text-on-surface">{po.quantity} Unit</div>
                    <div className="text-on-surface-variant font-mono">Rp {po.totalCost.toLocaleString('id-ID')}</div>
                    <button
                      onClick={() => {
                        addInboundBatch({
                          sku: po.sku,
                          batch: `BATCH-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
                          qty: po.quantity,
                          expiryDate: '2028-06-30',
                          docRef: po.id
                        });
                        showToast(`PO ${po.id} telah diterima di loading dock & stok bertambah!`, 'inventory');
                        setShowPoListModal(false);
                      }}
                      className="mt-1 px-2.5 py-1 rounded bg-primary text-on-primary font-semibold text-[11px] cursor-pointer shadow-xs active:scale-95"
                      type="button"
                    >
                      Terima Barang Sekarang
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end gap-2 border-t pt-3">
              <button
                onClick={() => setShowPoListModal(false)}
                className="px-4 py-2 rounded-lg bg-surface-container text-on-surface font-label-md text-label-md cursor-pointer"
                type="button"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
