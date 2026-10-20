import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { B2BOrder } from '../types';
import { exportExecutiveReportToCsv } from '../utils/exportUtils';

export const ExecutiveDashboardView: React.FC = () => {
  const { orders, products, outlets, scheduleSalesVisit, approveOrder, setPath, showToast } = useApp();

  const [periodFilter, setPeriodFilter] = useState<'month' | 'q1'>('month');
  const [streamFilter, setStreamFilter] = useState<'ALL' | 'SYNCED' | 'PENDING'>('ALL');
  const [streamSearch, setStreamSearch] = useState('');
  const [selectedOrderForDetail, setSelectedOrderForDetail] = useState<B2BOrder | null>(null);
  const [showExecutivePdfModal, setShowExecutivePdfModal] = useState(false);
  const [showAtRiskDispatchModal, setShowAtRiskDispatchModal] = useState(false);

  // Filter orders in stream
  const filteredOrders = orders.filter(order => {
    const matchesSearch =
      order.outletName.toLowerCase().includes(streamSearch.toLowerCase()) ||
      order.clientUuid.toLowerCase().includes(streamSearch.toLowerCase()) ||
      order.city.toLowerCase().includes(streamSearch.toLowerCase());

    const matchesStatus =
      streamFilter === 'ALL' ||
      (streamFilter === 'SYNCED' && order.syncStatus === 'SYNCED_DEDUCTED') ||
      (streamFilter === 'PENDING' && order.syncStatus === 'PENDING_WAREHOUSE');

    return matchesSearch && matchesStatus;
  });

  const handleExportExcel = () => {
    exportExecutiveReportToCsv(orders, products, outlets);
    showToast("Berhasil mengunduh Rekap Eksekutif Omset & Penjualan B2B (.CSV)", 'table_chart');
  };

  const handleDownloadPDF = () => {
    setShowExecutivePdfModal(true);
  };

  const handleSendSalesVisit = () => {
    setShowAtRiskDispatchModal(true);
  };

  return (
    <div className="flex flex-col w-full gap-space-lg pb-space-xl">
      {/* Top Command & Filter Bar */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-surface-container-lowest p-6 rounded-xl border border-border-subtle/60">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-xs text-on-surface-variant font-medium">
            <span className="text-primary font-semibold">Operasional Distribusi</span>
            <span aria-hidden="true">·</span>
            <span>Wilayah Solo Raya</span>
            <span aria-hidden="true">·</span>
            <span>Standar CDOB &amp; FEFO</span>
          </div>
          <h1 className="text-2xl text-on-surface tracking-tight font-bold">
            Executive &amp; Management Dashboard
          </h1>
          <p className="text-sm text-on-surface-variant">
            Ikhtisar Performa Penjualan B2B, Target Kunjungan Sales, &amp; Kesiapan Stok CV Arba'in
          </p>
        </div>

        {/* Actions & Timeline Filter */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center bg-surface-container-low px-3 py-1.5 rounded-lg border border-border-subtle/40">
            <span className="material-symbols-outlined text-primary text-[18px] mr-2">calendar_today</span>
            <div className="flex flex-col text-left">
              <span className="text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">
                Periode Analisis
              </span>
              <span className="text-xs text-on-surface font-semibold">
                Bulan Ini: Maret 2026
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportExcel}
              className="flex items-center gap-1.5 bg-surface-container-low hover:bg-surface-container text-on-surface text-xs font-semibold px-3.5 py-2 rounded-lg border border-border-subtle/50 transition-colors cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">table_chart</span>
              <span>Ekspor Excel</span>
            </button>
            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-1.5 bg-primary hover:bg-primary-container text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors cursor-pointer shadow-xs"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">picture_as_pdf</span>
              <span>Unduh Laporan PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Section 1: KPI Stat Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Card 1: Omset Bulanan */}
        <div className="bg-surface-container-lowest p-5 rounded-xl border border-border-subtle/60 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold">
                Total Omset Bulanan
              </span>
              <span className="flex items-center gap-0.5 text-xs font-semibold text-emerald-700">
                <span className="material-symbols-outlined text-[15px]">trending_up</span>
                +14.8% MoM
              </span>
            </div>
            <div className="text-2xl text-on-surface tracking-tight font-bold mb-1">
              Rp 482.650<span className="text-on-surface-variant font-medium text-base">.000</span>
            </div>
            <div className="flex items-center justify-between text-xs text-on-surface-variant mb-2">
              <span>Target: Rp 500.000.000</span>
              <span className="font-semibold text-primary">96.5%</span>
            </div>
          </div>
          {/* Progress Bar */}
          <div className="w-full bg-surface-container-high rounded-full h-1.5 overflow-hidden mt-1">
            <div className="bg-primary h-full rounded-full transition-all duration-700" style={{ width: '96.5%' }} />
          </div>
        </div>

        {/* Card 2: Outlet B2B Aktif */}
        <div className="bg-surface-container-lowest p-5 rounded-xl border border-border-subtle/60 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold">
                Outlet B2B Aktif
              </span>
              <span className="text-xs font-medium text-primary">
                +6 Mitra Baru
              </span>
            </div>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-2xl text-on-surface tracking-tight font-bold">
                148
              </span>
              <span className="text-xs text-on-surface-variant font-medium">
                Titik Distribusi
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-on-surface-variant mt-2 mb-2">
              <span className="text-on-surface font-semibold">92 Apotek (62%)</span>
              <span aria-hidden="true">·</span>
              <span className="text-on-surface font-semibold">56 Minimarket (38%)</span>
            </div>
          </div>
          <div className="w-full flex rounded-full h-1.5 overflow-hidden bg-surface-container-high">
            <div className="bg-primary h-full" style={{ width: '62%' }} title="Apotek: 62%" />
            <div className="bg-secondary h-full" style={{ width: '38%' }} title="Minimarket: 38%" />
          </div>
        </div>

        {/* Card 3: Kunjungan Sales Hari Ini */}
        <div className="bg-surface-container-lowest p-5 rounded-xl border border-border-subtle/60 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold">
                Kunjungan Sales Hari Ini
              </span>
              <span className="flex items-center gap-1 text-xs font-semibold text-emerald-700">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                84.4% Capaian
              </span>
            </div>
            <div className="flex items-baseline gap-1.5 mb-1">
              <span className="text-2xl text-on-surface tracking-tight font-bold">
                38
              </span>
              <span className="text-sm text-on-surface-variant font-medium">
                / 45 Target
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-on-surface-variant mt-2 mb-2">
              <span className="material-symbols-outlined text-[15px] text-primary">my_location</span>
              <span>5 Sales Rep Aktif (GPS Terverifikasi)</span>
            </div>
          </div>
          <div className="w-full bg-surface-container-high rounded-full h-1.5 overflow-hidden">
            <div className="bg-emerald-600 h-full rounded-full transition-all duration-700" style={{ width: '84.4%' }} />
          </div>
        </div>

        {/* Card 4: Integritas Stok & ROP */}
        <div className="bg-surface-container-lowest p-5 rounded-xl border border-border-subtle/60 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold">
                Integritas Stok &amp; ROP
              </span>
              <span className="flex items-center gap-1 text-xs font-semibold text-amber-700">
                <span className="material-symbols-outlined text-[14px]">warning</span>
                Perlu Tindakan
              </span>
            </div>
            <div className="flex items-baseline gap-1.5 mb-1">
              <span className="text-2xl text-rose-600 tracking-tight font-bold">
                4
              </span>
              <span className="text-xs text-on-surface-variant font-medium">
                SKU Kritis Terdeteksi
              </span>
            </div>
            <p className="text-xs text-on-surface-variant leading-tight mt-1 mb-2">
              <span className="font-semibold text-rose-600">2 butuh restock</span> ·{' '}
              <span className="font-semibold text-amber-700">2 batch near-expiry</span>
            </p>
          </div>
          <button
            onClick={() => setPath('inventory-stock-ledger')}
            className="flex items-center justify-between bg-surface-container-low px-2.5 py-1.5 rounded-lg text-left hover:bg-surface-container transition-colors cursor-pointer border border-border-subtle/40"
            type="button"
          >
            <span className="text-xs text-on-surface font-medium">
              Prioritas FEFO: Madu Habbatus
            </span>
            <span className="material-symbols-outlined text-primary text-[16px]">chevron_right</span>
          </button>
        </div>
      </div>

      {/* Section 2: Analytics & Insights Section (60% / 40%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
        {/* Left Panel (60%): Sales Performance & Herbal Categories */}
        <div className="lg:col-span-7 bg-surface-container-lowest p-space-lg rounded-xl shadow-xs border border-border-subtle/40 flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-space-md">
              <div>
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-primary font-bold">
                  Distribusi &amp; Realisasi Q1 2026
                </span>
                <h2 className="font-title-sm text-title-sm text-on-surface font-bold">
                  Tren Penjualan B2B Produk Herbal CV Arba'in
                </h2>
              </div>
              {/* Segmented Filter View */}
              <div className="flex items-center bg-surface-container-low p-1 rounded-lg">
                <button
                  onClick={() => setPeriodFilter('month')}
                  className={`px-2.5 py-1 font-label-sm text-label-sm font-bold rounded shadow-xs cursor-pointer transition-all ${
                    periodFilter === 'month'
                      ? 'bg-surface-container-lowest text-primary'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                  type="button"
                >
                  Bulan Ini
                </button>
                <button
                  onClick={() => setPeriodFilter('q1')}
                  className={`px-2.5 py-1 font-label-sm text-label-sm font-bold rounded shadow-xs cursor-pointer transition-all ${
                    periodFilter === 'q1'
                      ? 'bg-surface-container-lowest text-primary'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                  type="button"
                >
                  Kumulatif Q1
                </button>
              </div>
            </div>

            {/* High Impact SVG Visualization */}
            <div className="w-full bg-surface-container-low/40 rounded-xl p-space-md relative mb-space-md border border-border-subtle/30">
              <div className="flex items-center justify-between text-label-sm font-label-sm text-on-surface-variant mb-2">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-xs bg-[#005c55]" /> Target (Juta Rp)
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-xs bg-[#5bb8fe]" /> Realisasi Penjualan
                  </span>
                </div>
                <span className="font-code-table text-code-table text-primary font-semibold">
                  Update: 28 Mar 2026, 17:30 WIB
                </span>
              </div>

              {/* Dual Bar Chart by Herbal Product Category */}
              <svg className="w-full h-56" fill="none" preserveAspectRatio="none" viewBox="0 0 600 220">
                {/* Grid Lines */}
                <line stroke="#E2E8F0" strokeDasharray="4 4" x1="40" x2="580" y1="30" y2="30" />
                <line stroke="#E2E8F0" strokeDasharray="4 4" x1="40" x2="580" y1="80" y2="80" />
                <line stroke="#E2E8F0" strokeDasharray="4 4" x1="40" x2="580" y1="130" y2="130" />
                <line stroke="#CBD5E1" x1="40" x2="580" y1="180" y2="180" />
                {/* Y Axis Labels */}
                <text fill="#64748B" fontFamily="Inter" fontSize="10" textAnchor="end" x="32" y="34">150M</text>
                <text fill="#64748B" fontFamily="Inter" fontSize="10" textAnchor="end" x="32" y="84">100M</text>
                <text fill="#64748B" fontFamily="Inter" fontSize="10" textAnchor="end" x="32" y="134">50M</text>
                <text fill="#64748B" fontFamily="Inter" fontSize="10" textAnchor="end" x="32" y="184">0</text>
                
                {/* Group 1: Madu Herbal */}
                <g className="transition-all hover:opacity-80 cursor-pointer">
                  <rect fill="#005c55" height={periodFilter === 'month' ? 125 : 140} rx="3" width="26" x="75" y={periodFilter === 'month' ? 55 : 40} />
                  <rect fill="#5bb8fe" height={periodFilter === 'month' ? 132 : 148} rx="3" width="26" x="105" y={periodFilter === 'month' ? 48 : 32} />
                  <text fill="#1E293B" fontFamily="Inter" fontSize="11" fontWeight="600" textAnchor="middle" x="103" y="198">Madu Herbal</text>
                  <text fill="#006398" fontFamily="Inter" fontSize="10" fontWeight="700" textAnchor="middle" x="118" y={periodFilter === 'month' ? 42 : 26}>138M</text>
                </g>

                {/* Group 2: Habbatussauda */}
                <g className="transition-all hover:opacity-80 cursor-pointer">
                  <rect fill="#005c55" height={periodFilter === 'month' ? 110 : 125} rx="3" width="26" x="180" y={periodFilter === 'month' ? 70 : 55} />
                  <rect fill="#5bb8fe" height={periodFilter === 'month' ? 118 : 130} rx="3" width="26" x="210" y={periodFilter === 'month' ? 62 : 50} />
                  <text fill="#1E293B" fontFamily="Inter" fontSize="11" fontWeight="600" textAnchor="middle" x="208" y="198">Habbatus</text>
                  <text fill="#006398" fontFamily="Inter" fontSize="10" fontWeight="700" textAnchor="middle" x="223" y={periodFilter === 'month' ? 56 : 44}>114M</text>
                </g>

                {/* Group 3: Minyak Zaitun */}
                <g className="transition-all hover:opacity-80 cursor-pointer">
                  <rect fill="#005c55" height={periodFilter === 'month' ? 90 : 105} rx="3" width="26" x="285" y={periodFilter === 'month' ? 90 : 75} />
                  <rect fill="#5bb8fe" height={periodFilter === 'month' ? 94 : 108} rx="3" width="26" x="315" y={periodFilter === 'month' ? 86 : 72} />
                  <text fill="#1E293B" fontFamily="Inter" fontSize="11" fontWeight="600" textAnchor="middle" x="313" y="198">M. Zaitun</text>
                  <text fill="#006398" fontFamily="Inter" fontSize="10" fontWeight="700" textAnchor="middle" x="328" y={periodFilter === 'month' ? 80 : 66}>92M</text>
                </g>

                {/* Group 4: Jamu Cair */}
                <g className="transition-all hover:opacity-80 cursor-pointer">
                  <rect fill="#005c55" height={periodFilter === 'month' ? 75 : 88} rx="3" width="26" x="390" y={periodFilter === 'month' ? 105 : 92} />
                  <rect fill="#5bb8fe" height={periodFilter === 'month' ? 80 : 95} rx="3" width="26" x="420" y={periodFilter === 'month' ? 100 : 85} />
                  <text fill="#1E293B" fontFamily="Inter" fontSize="11" fontWeight="600" textAnchor="middle" x="418" y="198">Jamu Cair</text>
                  <text fill="#006398" fontFamily="Inter" fontSize="10" fontWeight="700" textAnchor="middle" x="433" y={periodFilter === 'month' ? 94 : 79}>78M</text>
                </g>

                {/* Group 5: Suplemen Imun */}
                <g className="transition-all hover:opacity-80 cursor-pointer">
                  <rect fill="#005c55" height={periodFilter === 'month' ? 55 : 68} rx="3" width="26" x="495" y={periodFilter === 'month' ? 125 : 112} />
                  <rect fill="#5bb8fe" height={periodFilter === 'month' ? 62 : 75} rx="3" width="26" x="525" y={periodFilter === 'month' ? 118 : 105} />
                  <text fill="#1E293B" fontFamily="Inter" fontSize="11" fontWeight="600" textAnchor="middle" x="523" y="198">Suplemen</text>
                  <text fill="#006398" fontFamily="Inter" fontSize="10" fontWeight="700" textAnchor="middle" x="538" y={periodFilter === 'month' ? 112 : 99}>60M</text>
                </g>
              </svg>
            </div>
          </div>

          {/* Footer Micro-Insights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-sm pt-space-xs">
            <div className="bg-surface-container-low p-2.5 rounded-lg flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-status-success-bg flex items-center justify-center text-status-success-text shadow-xs">
                <span className="material-symbols-outlined text-[18px]">verified</span>
              </div>
              <div>
                <div className="font-label-sm text-label-sm text-on-surface-variant">Top SKU Q1</div>
                <div className="font-label-md text-label-md text-on-surface font-bold">Madu Murni Arba 500g</div>
              </div>
            </div>
            <div className="bg-surface-container-low p-2.5 rounded-lg flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-secondary-fixed flex items-center justify-center text-secondary shadow-xs">
                <span className="material-symbols-outlined text-[18px]">local_shipping</span>
              </div>
              <div>
                <div className="font-label-sm text-label-sm text-on-surface-variant">Rata-rata Order</div>
                <div className="font-label-md text-label-md text-on-surface font-bold">Rp 3.260.000 / PO</div>
              </div>
            </div>
            <div className="bg-surface-container-low p-2.5 rounded-lg flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-primary shadow-xs">
                <span className="material-symbols-outlined text-[18px]">published_with_changes</span>
              </div>
              <div>
                <div className="font-label-sm text-label-sm text-on-surface-variant">Fulfillment FEFO</div>
                <div className="font-label-md text-label-md text-on-surface font-bold">99.4% Kepatuhan</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel (40%): RFM Customer Segmentation */}
        <div className="lg:col-span-5 bg-surface-container-lowest p-space-lg rounded-xl shadow-xs border border-border-subtle/40 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-space-md">
              <div>
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary font-bold">
                  Customer Loyalty Strategy
                </span>
                <h2 className="font-title-sm text-title-sm text-on-surface font-bold">
                  Segmentasi Pelanggan RFM
                </h2>
              </div>
              <span className="material-symbols-outlined text-on-surface-variant">hub</span>
            </div>

            {/* RFM Tiers List */}
            <div className="flex flex-col gap-space-sm mb-space-md">
              {/* Champions Tier */}
              <div className="bg-surface-container-low/70 p-3 rounded-lg hover:bg-surface-container-low transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[18px]">verified</span>
                    <span className="font-label-lg text-label-lg text-on-surface font-bold">
                      Champions (RO &lt;7 Hari)
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-primary text-on-primary font-label-sm text-label-sm font-semibold">
                    34 Apotek
                  </span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Nilai pembelian kuartalan &gt;Rp 25 Juta. Contoh: Apotek Kimia Farma Slamet Riyadi, Apotek K-24 UNS.
                </p>
              </div>

              {/* Loyal Customers Tier */}
              <div className="bg-surface-container-low/70 p-3 rounded-lg hover:bg-surface-container-low transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-secondary text-[18px]">loyalty</span>
                    <span className="font-label-lg text-label-lg text-on-surface font-bold">
                      Loyal Customers (Rutin 2 Minggu)
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-secondary-fixed text-on-secondary-fixed font-label-sm text-label-sm font-semibold">
                    58 Mitra
                  </span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Arus kas stabil dengan kepatuhan pembayaran termin Net 30 tepat waktu.
                </p>
              </div>

              {/* At-Risk Tier with Direct Action Trigger */}
              <div className="bg-status-warning-bg/40 p-3 rounded-lg border border-status-warning-bg">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-status-warning-text text-[18px]">alarm_on</span>
                    <span className="font-label-lg text-label-lg text-status-warning-text font-bold">
                      At-Risk (&gt;30 Hari Tanpa Order)
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-status-warning-bg text-status-warning-text font-label-sm text-label-sm font-bold">
                    12 Mitra
                  </span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <p className="font-body-sm text-body-sm text-on-surface-variant leading-tight pr-2">
                    Mayoritas minimarket klaster Solo Baru &amp; Boyolali.
                  </p>
                  <button
                    onClick={handleSendSalesVisit}
                    className="whitespace-nowrap flex items-center gap-1 bg-badge-amber hover:bg-status-warning-text text-white font-label-sm text-label-sm px-2.5 py-1.5 rounded-lg shadow-xs font-semibold transition-all cursor-pointer active:scale-95"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[14px]">send</span>
                    <span>Kirim Sales Visit</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Proyeksi Repeat Order Otomatis (Mini Table) */}
            <div className="bg-surface-container-low p-3 rounded-lg border border-border-subtle/30">
              <div className="flex items-center justify-between mb-2">
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface font-bold">
                  Proyeksi Repeat Order Minggu Ini
                </span>
                <span className="font-code-table text-code-table text-primary font-semibold">
                  Algoritma Prediktif
                </span>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-body-sm font-body-sm bg-surface-container-lowest px-2.5 py-1.5 rounded-sm shadow-2xs">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-badge-green" />
                    <span className="font-medium text-on-surface">Apotek Sehat Mandiri Kartasura</span>
                  </div>
                  <span className="font-code-table text-code-table text-on-surface-variant font-semibold">
                    Besok (Est. Rp 4.5M)
                  </span>
                </div>
                <div className="flex items-center justify-between text-body-sm font-body-sm bg-surface-container-lowest px-2.5 py-1.5 rounded-sm shadow-2xs">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-badge-green" />
                    <span className="font-medium text-on-surface">Minimarket Barokah Sukoharjo</span>
                  </div>
                  <span className="font-code-table text-code-table text-on-surface-variant font-semibold">
                    Kamis (Est. Rp 2.8M)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: Live Operations Table (PWA Stream) */}
      <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-xs border border-border-subtle/40 flex flex-col gap-space-md">
        {/* Header of Stream */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-container text-on-primary flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-[24px]">phonelink_ring</span>
            </div>
            <div>
              <h2 className="font-title-sm text-title-sm text-on-surface font-bold">
                Pesanan Lapangan Masuk Real-Time (PWA Stream)
              </h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Aliran order dari aplikasi sales lapangan dengan sinkronisasi instan ke stok gudang
              </p>
            </div>
          </div>

          {/* Filters & Live Sync Status */}
          <div className="flex flex-wrap items-center gap-space-xs">
            <div className="flex items-center bg-surface-container-low px-2.5 py-1.5 rounded-lg border border-border-subtle/30">
              <span className="material-symbols-outlined text-on-surface-variant text-[18px] mr-1.5">search</span>
              <input
                value={streamSearch}
                onChange={(e) => setStreamSearch(e.target.value)}
                className="bg-transparent font-body-sm text-body-sm text-on-surface focus:outline-none w-36 sm:w-44 placeholder:text-on-surface-variant"
                placeholder="Cari UUID / Outlet..."
                type="text"
              />
            </div>
            <div className="flex items-center bg-surface-container-low rounded-lg p-0.5 border border-border-subtle/30">
              <button
                onClick={() => setStreamFilter('ALL')}
                className={`px-2.5 py-1 rounded font-label-sm text-label-sm transition-all cursor-pointer ${
                  streamFilter === 'ALL'
                    ? 'bg-surface-container-lowest text-primary font-bold shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
                type="button"
              >
                Semua
              </button>
              <button
                onClick={() => setStreamFilter('SYNCED')}
                className={`px-2.5 py-1 rounded font-label-sm text-label-sm transition-all cursor-pointer ${
                  streamFilter === 'SYNCED'
                    ? 'bg-surface-container-lowest text-primary font-bold shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
                type="button"
              >
                Sync Sukses
              </button>
              <button
                onClick={() => setStreamFilter('PENDING')}
                className={`px-2.5 py-1 rounded font-label-sm text-label-sm transition-all cursor-pointer ${
                  streamFilter === 'PENDING'
                    ? 'bg-surface-container-lowest text-primary font-bold shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
                type="button"
              >
                Menunggu Gudang
              </button>
            </div>
          </div>
        </div>

        {/* Data Table Container */}
        <div className="overflow-x-auto rounded-lg bg-surface-container-low/30 border border-border-subtle/30">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider h-10">
                <th className="px-4 py-2 font-bold">Client UUID</th>
                <th className="px-4 py-2 font-bold">Nama Outlet &amp; Kota</th>
                <th className="px-4 py-2 font-bold">Sales Rep</th>
                <th className="px-4 py-2 font-bold">Waktu Order</th>
                <th className="px-4 py-2 font-bold text-right">Total Nilai</th>
                <th className="px-4 py-2 font-bold">Metode / Termin</th>
                <th className="px-4 py-2 font-bold">Status Sinkronisasi</th>
                <th className="px-4 py-2 font-bold text-center">Aksi Cepat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle font-body-sm text-body-sm text-on-surface">
              {filteredOrders.map((order) => {
                const isSynced = order.syncStatus === 'SYNCED_DEDUCTED';
                const initials = order.salesRep
                  .split(' ')
                  .map((w) => w[0])
                  .join('')
                  .slice(0, 2);

                return (
                  <tr key={order.id} className="hover:bg-surface-container-lowest transition-colors h-14">
                    <td className="px-4 py-3 font-code-table text-code-table text-primary font-semibold">
                      {order.clientUuid}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-on-surface">{order.outletName}</div>
                      <div className="text-label-sm text-on-surface-variant">
                        {order.city} • ID: {order.outletId}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-label-sm">
                          {initials}
                        </span>
                        <span>{order.salesRep}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-code-table text-code-table text-on-surface-variant">
                      {order.orderTime}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-on-surface font-code-table text-code-table">
                      Rp {order.totalAmount.toLocaleString('id-ID')}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded bg-surface-container font-label-sm text-label-sm text-secondary font-semibold">
                        {order.terms}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {isSynced ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-status-success-bg text-status-success-text font-label-sm text-label-sm font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-badge-green" />
                          Synced &amp; Stok Terpotong
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-status-warning-bg text-status-warning-text font-label-sm text-label-sm font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-badge-amber" />
                          Menunggu Konfirmasi Gudang
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => setSelectedOrderForDetail(order)}
                          className="p-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container text-primary transition-colors cursor-pointer"
                          title="Lihat Detail Pesanan"
                          type="button"
                        >
                          <span className="material-symbols-outlined text-[18px]">visibility</span>
                        </button>
                        <button
                          onClick={() => setPath('inventory-stock-ledger')}
                          className="p-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container text-secondary transition-colors cursor-pointer"
                          title="Buku Besar"
                          type="button"
                        >
                          <span className="material-symbols-outlined text-[18px]">receipt_long</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Table Footer / Stream Pagination & Quick Sync Stats */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-space-sm pt-space-xs text-on-surface-variant font-label-sm text-label-sm">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-badge-green animate-pulse" />
            <span>
              WebSocket PWA Stream Terhubung: <strong>Latency 42ms</strong>
            </span>
            <span>•</span>
            <span>Menampilkan {filteredOrders.length} dari 38 transaksi masuk hari ini</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              className="px-3 py-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface font-semibold cursor-pointer"
              type="button"
            >
              Sebelumnya
            </button>
            <button
              className="px-3 py-1.5 rounded-lg bg-primary-container text-on-primary font-bold cursor-pointer"
              type="button"
            >
              1
            </button>
            <button
              className="px-3 py-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface font-semibold cursor-pointer"
              type="button"
            >
              2
            </button>
            <button
              className="px-3 py-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface font-semibold cursor-pointer"
              type="button"
            >
              3
            </button>
            <button
              className="px-3 py-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface font-semibold cursor-pointer"
              type="button"
            >
              Berikutnya
            </button>
          </div>
        </div>
      </div>

      {/* Quick Detail Inspection Modal for Stream Item */}
      {selectedOrderForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-surface-container-lowest rounded-xl max-w-xl w-full p-6 shadow-2xl flex flex-col gap-4 border border-border-subtle/50">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <span className="font-code-table text-xs text-primary font-semibold">
                  {selectedOrderForDetail.clientUuid}
                </span>
                <h3 className="font-title-sm text-title-sm text-on-surface font-bold">
                  {selectedOrderForDetail.outletName}
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrderForDetail(null)}
                className="text-on-surface-variant hover:text-on-surface cursor-pointer p-1 rounded-lg"
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-2 p-3 bg-surface-container-low rounded-lg text-xs">
                <div>
                  <span className="text-on-surface-variant">Sales Rep:</span>
                  <p className="font-semibold text-on-surface">{selectedOrderForDetail.salesRep} ({selectedOrderForDetail.salesRepId})</p>
                </div>
                <div>
                  <span className="text-on-surface-variant">Termin Pembayaran:</span>
                  <p className="font-semibold text-on-surface">{selectedOrderForDetail.terms}</p>
                </div>
                <div>
                  <span className="text-on-surface-variant">Koordinat GPS Outlet:</span>
                  <p className="font-mono text-on-surface">{selectedOrderForDetail.geofenceCoords}</p>
                </div>
                <div>
                  <span className="text-on-surface-variant">Total Nilai Faktur:</span>
                  <p className="font-bold text-primary text-sm">Rp {selectedOrderForDetail.totalAmount.toLocaleString('id-ID')}</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-xs uppercase tracking-wider text-on-surface-variant mb-2">
                  Daftar SKU Herbal Dipesan
                </h4>
                <div className="divide-y divide-border-subtle/40 border border-border-subtle/40 rounded-lg overflow-hidden">
                  {selectedOrderForDetail.items.map((it, idx) => (
                    <div key={idx} className="p-2.5 flex items-center justify-between text-xs bg-surface-container-lowest">
                      <div>
                        <div className="font-semibold text-on-surface">{it.name}</div>
                        <div className="text-[11px] text-on-surface-variant font-mono">{it.batch} • {it.fefoPriority}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-on-surface">{it.quantity} unit</div>
                        <div className="text-[11px] text-on-surface-variant">Rp {it.subtotal.toLocaleString('id-ID')}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t pt-3">
              <button
                onClick={() => setSelectedOrderForDetail(null)}
                className="px-4 py-2 rounded-lg bg-surface-container text-on-surface font-label-md text-label-md cursor-pointer hover:bg-surface-container-high"
                type="button"
              >
                Tutup
              </button>
              <button
                onClick={() => {
                  setSelectedOrderForDetail(null);
                  setPath('order-approval-queue');
                }}
                className="px-4 py-2 rounded-lg bg-primary text-on-primary font-label-md text-label-md cursor-pointer hover:bg-primary-container font-semibold"
                type="button"
              >
                Buka di Antrean Otorisasi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Executive Strategic PDF Report Modal */}
      {showExecutivePdfModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-surface-container-lowest rounded-xl shadow-2xl max-w-2xl w-full p-6 flex flex-col gap-4 border border-border-subtle/50 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[24px]">picture_as_pdf</span>
                <h3 className="font-title-sm text-title-sm text-on-surface font-bold">
                  Laporan Strategis Eksekutif CV Arba'in Solo Raya
                </h3>
              </div>
              <button
                onClick={() => setShowExecutivePdfModal(false)}
                className="text-on-surface-variant hover:text-on-surface p-1 rounded-lg cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="p-4 bg-white rounded-xl border border-slate-200 text-slate-800 space-y-4">
              <div className="flex justify-between items-start border-b pb-3">
                <div>
                  <h2 className="text-xl font-bold text-teal-800">CV ARBA'IN SURAKARTA</h2>
                  <p className="text-xs text-slate-500">Pusat Distribusi Produk Herbal Solo Raya</p>
                  <p className="text-xs text-slate-500">Periode: Maret 2026 (Kuartal I 2026)</p>
                </div>
                <div className="text-right text-xs">
                  <span className="inline-block px-2.5 py-1 bg-teal-100 text-teal-800 rounded-full font-bold">
                    VALIDATED TKT 5
                  </span>
                  <p className="text-slate-500 mt-1">Dicetak: {new Date().toLocaleDateString('id-ID')}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-[11px] text-slate-500 uppercase font-semibold">Total Omset</span>
                  <div className="text-lg font-bold text-teal-700">Rp 482.650.000</div>
                  <span className="text-[10px] text-emerald-600 font-semibold">+14.8% vs Target</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-[11px] text-slate-500 uppercase font-semibold">Mitra B2B Aktif</span>
                  <div className="text-lg font-bold text-slate-800">{outlets.length} Outlet</div>
                  <span className="text-[10px] text-slate-500">Solo Raya 7 Kota</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-[11px] text-slate-500 uppercase font-semibold">Kepatuhan FEFO</span>
                  <div className="text-lg font-bold text-emerald-600">99.4%</div>
                  <span className="text-[10px] text-slate-500">Standar Audit CDOB</span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-700 mb-2 uppercase">Distribusi Omset Wilayah Solo Raya:</h4>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
                    <span>1. Kota Surakarta (Solo Tengah &amp; Laweyan)</span>
                    <span className="font-bold">Rp 195.400.000 (40.5%)</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
                    <span>2. Kab. Sukoharjo &amp; Solo Baru</span>
                    <span className="font-bold">Rp 132.800.000 (27.5%)</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
                    <span>3. Kab. Karanganyar &amp; Sragen</span>
                    <span className="font-bold">Rp 88.200.000 (18.3%)</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
                    <span>4. Kab. Klaten &amp; Boyolali</span>
                    <span className="font-bold">Rp 66.250.000 (13.7%)</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t text-xs text-slate-500 flex justify-between">
                <span>Disahkan oleh: Direktur Operasional CV Arba'in</span>
                <span>Tanda Tangan Elektronik Terverifikasi</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t pt-3">
              <button
                type="button"
                onClick={() => setShowExecutivePdfModal(false)}
                className="px-4 py-2 rounded-lg bg-surface-container text-on-surface text-xs font-semibold hover:bg-surface-container-high cursor-pointer"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={() => {
                  window.print();
                  setShowExecutivePdfModal(false);
                }}
                className="px-4 py-2 rounded-lg bg-primary text-on-primary text-xs font-semibold hover:bg-primary-container flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">print</span>
                <span>Cetak Lembar Laporan</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* At-Risk Sales Visit Dispatch Modal */}
      {showAtRiskDispatchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-surface-container-lowest rounded-xl shadow-2xl max-w-lg w-full p-6 flex flex-col gap-4 border border-border-subtle/50">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-badge-amber text-[24px]">send</span>
                <h3 className="font-title-sm text-title-sm text-on-surface font-bold">
                  Disposisi Kunjungan Prioritas (At-Risk Accounts)
                </h3>
              </div>
              <button
                onClick={() => setShowAtRiskDispatchModal(false)}
                className="text-on-surface-variant hover:text-on-surface p-1 rounded-lg cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <p className="text-xs text-on-surface-variant">
              Sistem mendeteksi 12 mitra yang belum melakukan repeat order &gt;30 hari. Kirimkan jadwal kunjungan langsung ke sales rep penanggung jawab di wilayah Solo Baru dan Boyolali.
            </p>

            <div className="space-y-2">
              <div className="p-3 bg-surface-container-low rounded-lg text-xs space-y-1">
                <div className="flex justify-between font-bold text-on-surface">
                  <span>Apotek Medika Boyolali</span>
                  <span className="text-badge-amber">38 Hari Tidak Ada Order</span>
                </div>
                <div className="text-slate-500">Sales Dedikasi: Budi Santoso • Termin Net 30 Hari</div>
                <button
                  type="button"
                  onClick={() => {
                    scheduleSalesVisit({
                      outletId: 'AP-SLO-004',
                      outletName: 'Apotek Medika Boyolali',
                      salesRep: 'Budi Santoso',
                      scheduledDate: '2026-04-01T09:30',
                      purpose: 'Follow Up At-Risk',
                      notes: 'Tawarkan restock Madu Randu dan perpanjangan kelonggaran plafon kredit.'
                    });
                    showToast('Disposisi terkirim ke Budi Santoso untuk Apotek Medika Boyolali', 'send');
                  }}
                  className="mt-2 w-full py-1.5 bg-primary text-on-primary rounded text-xs font-semibold hover:bg-primary-container cursor-pointer"
                >
                  Jadwalkan Kunjungan ke Outlet Ini
                </button>
              </div>

              <div className="p-3 bg-surface-container-low rounded-lg text-xs space-y-1">
                <div className="flex justify-between font-bold text-on-surface">
                  <span>Toko Herbal Sehat Karanganyar</span>
                  <span className="text-badge-amber">42 Hari Tidak Ada Order</span>
                </div>
                <div className="text-slate-500">Sales Dedikasi: Agus Hermawan • Termin COD Cash</div>
                <button
                  type="button"
                  onClick={() => {
                    scheduleSalesVisit({
                      outletId: 'AP-SLO-005',
                      outletName: 'Toko Herbal Sehat Karanganyar',
                      salesRep: 'Agus Hermawan',
                      scheduledDate: '2026-04-01T14:00',
                      purpose: 'Follow Up At-Risk',
                      notes: 'Edukasi produk baru Kapsul Temulawak dan penawaran sampel display gratis.'
                    });
                    showToast('Disposisi terkirim ke Agus Hermawan untuk Toko Herbal Sehat', 'send');
                  }}
                  className="mt-2 w-full py-1.5 bg-primary text-on-primary rounded text-xs font-semibold hover:bg-primary-container cursor-pointer"
                >
                  Jadwalkan Kunjungan ke Outlet Ini
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end border-t pt-3">
              <button
                type="button"
                onClick={() => setShowAtRiskDispatchModal(false)}
                className="px-4 py-2 rounded-lg bg-surface-container text-on-surface text-xs font-semibold hover:bg-surface-container-high cursor-pointer"
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
