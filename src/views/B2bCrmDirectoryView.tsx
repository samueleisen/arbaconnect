import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Outlet } from '../types';
import { exportCrmToCsv } from '../utils/exportUtils';

export const B2bCrmDirectoryView: React.FC = () => {
  const { outlets, addOutlet, selectedOutletId, setSelectedOutletId, scheduleSalesVisit, orders, setPath, showToast } = useApp();

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('ALL');
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedCredit, setSelectedCredit] = useState('ALL');
  const [activeRouteFilter, setActiveRouteFilter] = useState('all');

  // New Outlet Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newOutletName, setNewOutletName] = useState('');
  const [newOutletType, setNewOutletType] = useState<'Apotek Mandiri' | 'Jaringan Farmasi' | 'Minimarket'>('Apotek Mandiri');
  const [newOutletPic, setNewOutletPic] = useState('');
  const [newOutletPhone, setNewOutletPhone] = useState('');
  const [newOutletCity, setNewOutletCity] = useState<'Solo' | 'Sukoharjo' | 'Karanganyar' | 'Klaten' | 'Boyolali' | 'Sragen'>('Solo');
  const [newOutletSales, setNewOutletSales] = useState('Budi Santoso');
  const [newOutletAddress, setNewOutletAddress] = useState('');
  const [newOutletTerms, setNewOutletTerms] = useState<'Net 30 Hari' | 'Net 14 Hari' | 'COD Cash'>('Net 30 Hari');
  const [newOutletLimit, setNewOutletLimit] = useState(10000000);

  // WhatsApp Assistant Modal state
  const [whatsAppModalOpen, setWhatsAppModalOpen] = useState(false);
  const [waTemplate, setWaTemplate] = useState<'delivery' | 'invoice' | 'promo'>('delivery');
  const [waCustomMessage, setWaCustomMessage] = useState('');

  // Visit Schedule Modal state
  const [visitModalOutlet, setVisitModalOutlet] = useState<Outlet | null>(null);
  const [visitDate, setVisitDate] = useState('2026-04-02T10:00');
  const [visitPurpose, setVisitPurpose] = useState<import('../types').SalesVisit['purpose']>('Kunjungan Rutin');
  const [visitNotes, setVisitNotes] = useState('Pengecekan display produk dan pengambilan pesanan baru');

  // Transaction History Modal state
  const [historyModalOutlet, setHistoryModalOutlet] = useState<Outlet | null>(null);

  // Active selected outlet
  const selectedOutlet = outlets.find(o => o.id === selectedOutletId) || outlets[0];

  // Filtering outlets
  const filteredOutlets = outlets.filter(outlet => {
    const matchesSearch =
      outlet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      outlet.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      outlet.picName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      outlet.address.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRegion = selectedRegion === 'ALL' || outlet.city === selectedRegion;
    const matchesType = selectedType === 'ALL' || outlet.type === selectedType;
    const matchesCredit = selectedCredit === 'ALL' || outlet.creditStatus === selectedCredit;
    const matchesRoute =
      activeRouteFilter === 'all' ||
      outlet.salesRep.toLowerCase().includes(activeRouteFilter.toLowerCase());

    return matchesSearch && matchesRegion && matchesType && matchesCredit && matchesRoute;
  });

  const handleRegisterOutlet = (e: React.FormEvent) => {
    e.preventDefault();
    addOutlet({
      name: newOutletName,
      type: newOutletType,
      picName: newOutletPic,
      picPhone: newOutletPhone,
      city: newOutletCity,
      cityName: newOutletCity === 'Solo' ? 'Surakarta' : newOutletCity,
      salesRep: newOutletSales,
      address: newOutletAddress,
      terms: newOutletTerms,
      creditLimit: Number(newOutletLimit),
      creditRemaining: Number(newOutletLimit)
    });

    // Reset form
    setNewOutletName('');
    setNewOutletPic('');
    setNewOutletPhone('');
    setNewOutletAddress('');
    setIsModalOpen(false);
  };

  const handleExportCRM = () => {
    exportCrmToCsv(outlets);
    showToast(`Berhasil mengunduh data ${outlets.length} mitra B2B Solo Raya (.CSV)`, 'file_download');
  };

  const handleQuickWhatsApp = () => {
    if (selectedOutlet) {
      setWhatsAppModalOpen(true);
    }
  };

  const handleScheduleVisit = (outlet: Outlet) => {
    setVisitModalOutlet(outlet);
  };

  const handleViewHistory = (outlet: Outlet) => {
    setHistoryModalOutlet(outlet);
  };

  return (
    <div className="flex flex-col w-full gap-space-lg">
      {/* Header Title & Action Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 text-on-surface-variant text-xs mb-1 font-medium">
            <span>Sistem Distribusi Solo Raya</span>
            <span aria-hidden="true">·</span>
            <span className="text-primary font-semibold">Direktori B2B CRM</span>
            <span aria-hidden="true">·</span>
            <span>Relasi Apotek &amp; Ritel</span>
          </div>
          <h1 className="text-2xl text-on-surface tracking-tight font-bold">
            Direktori CRM Pelanggan B2B &amp; Kemitraan Outlet
          </h1>
          <p className="text-sm text-on-surface-variant max-w-4xl mt-0.5">
            Basis data kemitraan apotek, minimarket, plafon kredit, dan rute sales lapangan CV Arba'in di Solo Raya.
          </p>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleExportCRM}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-surface-container-low text-on-surface hover:bg-surface-container text-xs font-semibold transition-colors border border-border-subtle/50 cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">file_download</span>
            <span>Ekspor Data CRM</span>
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary-container text-xs font-semibold transition-colors shadow-xs cursor-pointer active:scale-95"
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">add_business</span>
            <span>+ Daftarkan Outlet Baru</span>
          </button>
        </div>
      </div>

      {/* Summary Metrics Cards (4 Metrics Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="bg-surface-container-lowest p-5 rounded-xl border border-border-subtle/60 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold">
                Total Mitra Terdaftar
              </span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-2xl text-on-surface font-bold">
                  {168 + (outlets.length - 6)}
                </span>
                <span className="text-xs text-on-surface-variant font-medium">Outlet</span>
              </div>
            </div>
            <div className="w-9 h-9 rounded-lg bg-surface-container-low flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[20px]">storefront</span>
            </div>
          </div>
          <div className="mt-4 pt-2.5 flex items-center justify-between text-xs text-on-surface-variant border-t border-border-subtle/40">
            <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
              <span>148 Aktif</span>
            </div>
            <span className="text-on-surface-variant">20 Baru / Evaluasi</span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-surface-container-lowest p-5 rounded-xl border border-border-subtle/60 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold">
                Jaringan Apotek
              </span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-2xl text-primary font-bold">104</span>
                <span className="text-xs text-on-surface-variant font-medium">Titik Relasi</span>
              </div>
            </div>
            <div className="w-9 h-9 rounded-lg bg-teal-50 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[20px]">medication</span>
            </div>
          </div>
          <div className="mt-4 pt-2.5 flex items-center justify-between text-xs border-t border-border-subtle/40 text-on-surface-variant">
            <span>Rata-rata termin:</span>
            <span className="font-semibold text-primary">
              Net 30 Hari
            </span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-surface-container-lowest p-5 rounded-xl border border-border-subtle/60 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold">
                Minimarket &amp; Ritel
              </span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-2xl text-on-surface font-bold">64</span>
                <span className="text-xs text-on-surface-variant font-medium">Toko</span>
              </div>
            </div>
            <div className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center text-on-surface-variant">
              <span className="material-symbols-outlined text-[20px]">shopping_cart</span>
            </div>
          </div>
          <div className="mt-4 pt-2.5 flex items-center justify-between text-xs border-t border-border-subtle/40 text-on-surface-variant">
            <span>Rata-rata termin:</span>
            <span className="font-semibold text-on-surface">
              Net 14 Hari
            </span>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-surface-container-lowest p-5 rounded-xl border border-border-subtle/60 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold">
                Kesehatan Kredit
              </span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-2xl text-emerald-700 font-bold">94.2%</span>
                <span className="text-xs font-semibold text-emerald-700">
                  Optimal
                </span>
              </div>
            </div>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-700">
              <span className="material-symbols-outlined text-[20px]">verified_user</span>
            </div>
          </div>
          <div className="mt-4 pt-2.5 flex items-center justify-between text-xs border-t border-border-subtle/40 text-on-surface-variant">
            <span className="text-amber-700 font-medium flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">warning</span>
              5.8% Jatuh Tempo &lt;7 hari
            </span>
            <span className="text-on-surface-variant font-code-table">0 Bad Debt</span>
          </div>
        </div>
      </div>

      {/* Search, Filter & Segmentation Bar */}
      <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-xs border border-border-subtle/40 flex flex-col gap-space-sm">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-space-sm">
          {/* Search Field */}
          <div className="md:col-span-5 relative flex items-center">
            <span className="material-symbols-outlined absolute left-3 text-on-surface-variant text-[20px] pointer-events-none">
              search
            </span>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface-container-low text-on-surface placeholder:text-on-surface-variant pl-10 pr-4 py-2.5 rounded-lg text-body-md font-body-md focus:outline-none focus:bg-surface-container transition-all"
              placeholder="Cari nama apotek, kode outlet, atau nama apoteker..."
              type="text"
            />
          </div>

          {/* Filter Wilayah Solo Raya */}
          <div className="md:col-span-3 relative flex items-center">
            <span className="material-symbols-outlined absolute left-3 text-on-surface-variant text-[18px] pointer-events-none">
              location_city
            </span>
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="w-full bg-surface-container-low text-on-surface pl-9 pr-8 py-2.5 rounded-lg text-body-md font-body-md appearance-none cursor-pointer focus:outline-none focus:bg-surface-container"
            >
              <option value="ALL">Semua Kota (Solo Raya)</option>
              <option value="Solo">Surakarta / Solo Kota</option>
              <option value="Sukoharjo">Sukoharjo &amp; Kartasura</option>
              <option value="Karanganyar">Karanganyar &amp; Palur</option>
              <option value="Klaten">Klaten Kota &amp; Delanggu</option>
              <option value="Boyolali">Boyolali</option>
              <option value="Sragen">Sragen</option>
            </select>
            <span className="material-symbols-outlined absolute right-3 text-on-surface-variant text-[18px] pointer-events-none">
              expand_more
            </span>
          </div>

          {/* Filter Tipe Outlet */}
          <div className="md:col-span-2 relative flex items-center">
            <span className="material-symbols-outlined absolute left-3 text-on-surface-variant text-[18px] pointer-events-none">
              category
            </span>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full bg-surface-container-low text-on-surface pl-9 pr-8 py-2.5 rounded-lg text-body-md font-body-md appearance-none cursor-pointer focus:outline-none focus:bg-surface-container"
            >
              <option value="ALL">Semua Tipe</option>
              <option value="Apotek Mandiri">Apotek Mandiri</option>
              <option value="Jaringan Farmasi">Jaringan Farmasi</option>
              <option value="Minimarket">Minimarket / Ritel</option>
            </select>
            <span className="material-symbols-outlined absolute right-3 text-on-surface-variant text-[18px] pointer-events-none">
              expand_more
            </span>
          </div>

          {/* Filter Status Kredit */}
          <div className="md:col-span-2 relative flex items-center">
            <span className="material-symbols-outlined absolute left-3 text-on-surface-variant text-[18px] pointer-events-none">
              credit_score
            </span>
            <select
              value={selectedCredit}
              onChange={(e) => setSelectedCredit(e.target.value)}
              className="w-full bg-surface-container-low text-on-surface pl-9 pr-8 py-2.5 rounded-lg text-body-md font-body-md appearance-none cursor-pointer focus:outline-none focus:bg-surface-container"
            >
              <option value="ALL">Semua Status Kredit</option>
              <option value="Lancar">Lancar (&gt;50% Sisa)</option>
              <option value="Perhatian">Menjelang Jatuh Tempo</option>
              <option value="Overdue">Overdue / Limit Habis</option>
            </select>
            <span className="material-symbols-outlined absolute right-3 text-on-surface-variant text-[18px] pointer-events-none">
              expand_more
            </span>
          </div>
        </div>

        {/* Active Segment Chips / Quick Filters */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-space-xs flex-wrap">
            <span className="text-on-surface-variant font-label-sm text-label-sm mr-1 font-semibold">
              Rute Sales Aktif:
            </span>
            {[
              { id: 'all', label: 'Semua Rute' },
              { id: 'Budi', label: 'Solo Tengah (Budi Santoso)' },
              { id: 'Tri', label: 'Sukoharjo-Solo Baru (Tri Wahyuni)' },
              { id: 'Agus', label: 'Karanganyar-Palur (Agus Hermawan)' },
              { id: 'Rian', label: 'Klaten-Boyolali (Rian Pratama)' }
            ].map(r => (
              <button
                key={r.id}
                onClick={() => setActiveRouteFilter(r.id)}
                type="button"
                className={`px-2.5 py-1 rounded-full text-label-sm font-label-sm transition-colors cursor-pointer ${
                  activeRouteFilter === r.id
                    ? 'bg-primary text-on-primary font-semibold shadow-xs'
                    : 'bg-surface-container-low text-on-surface hover:bg-surface-container'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
          <div className="text-on-surface-variant font-code-table text-code-table hidden lg:block">
            Menampilkan {filteredOutlets.length} dari {168 + (outlets.length - 6)} outlet
          </div>
        </div>
      </div>

      {/* Main Directory Table & Drawer Container */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-space-lg items-start">
        {/* Main Interactive Table (8 cols) */}
        <div className="xl:col-span-8 bg-surface-container-lowest rounded-xl shadow-xs border border-border-subtle/40 overflow-hidden flex flex-col">
          <div className="px-space-md py-space-sm bg-surface-container-low flex items-center justify-between border-b border-border-subtle/30">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">table_rows</span>
              <span className="font-title-sm text-title-sm text-on-surface font-bold">
                Daftar Mitra B2B Wilayah Solo Raya
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-label-sm text-label-sm text-on-surface-variant">
                Klik baris outlet untuk detail performa &amp; riwayat
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-surface-container-low/70 text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider">
                  <th className="py-3 px-space-md">Kode &amp; Nama Outlet</th>
                  <th className="py-3 px-3">Tipe</th>
                  <th className="py-3 px-3">Penanggung Jawab</th>
                  <th className="py-3 px-3">Kota</th>
                  <th className="py-3 px-3">Termin</th>
                  <th className="py-3 px-3">Plafon / Sisa Limit</th>
                  <th className="py-3 px-3">Sales Lapangan</th>
                  <th className="py-3 px-3">Order Terakhir</th>
                  <th className="py-3 px-space-md text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="text-on-surface text-body-md font-body-md divide-y divide-border-subtle/30">
                {filteredOutlets.map(outlet => {
                  const isSelected = outlet.id === selectedOutletId;
                  const percentRemaining = Math.round((outlet.creditRemaining / outlet.creditLimit) * 100);

                  return (
                    <tr
                      key={outlet.id}
                      onClick={() => setSelectedOutletId(outlet.id)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-surface-container'
                          : 'hover:bg-surface-container-low/70'
                      }`}
                    >
                      <td className="py-3.5 px-space-md">
                        <div className="flex flex-col">
                          <span className="font-label-sm text-label-sm text-primary font-semibold">
                            {outlet.code}
                          </span>
                          <span className="font-label-lg text-label-lg font-semibold text-on-surface leading-snug">
                            {outlet.name}
                          </span>
                          <span className="font-body-sm text-body-sm text-on-surface-variant truncate max-w-xs">
                            {outlet.address}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-label-sm font-label-sm font-semibold ${
                            outlet.type === 'Minimarket'
                              ? 'bg-surface-container text-primary'
                              : 'bg-secondary-fixed text-on-secondary-fixed'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[14px]">
                            {outlet.type === 'Minimarket' ? 'store' : 'local_pharmacy'}
                          </span>
                          {outlet.type === 'Minimarket' ? 'Minimarket' : 'Apotek'}
                        </span>
                      </td>

                      <td className="py-3.5 px-3">
                        <div className="flex flex-col">
                          <span className="font-label-md text-label-md text-on-surface font-medium">
                            {outlet.picName}
                          </span>
                          <a
                            href={`https://wa.me/${outlet.picPhone}`}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="font-label-sm text-label-sm text-primary hover:underline flex items-center gap-1 mt-0.5"
                          >
                            <span className="material-symbols-outlined text-[13px]">chat</span>
                            {outlet.picPhone.replace(/^62/, '0')}
                          </a>
                        </div>
                      </td>

                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span className="font-label-md text-label-md text-on-surface">{outlet.cityName}</span>
                      </td>

                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded bg-surface-container text-on-surface text-label-sm font-label-sm font-semibold">
                          {outlet.terms}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="font-code-table text-code-table font-semibold text-on-surface">
                            Rp {outlet.creditLimit.toLocaleString('id-ID')}
                          </span>
                          <span
                            className={`font-label-sm text-label-sm font-medium ${
                              outlet.creditStatus === 'Overdue'
                                ? 'text-status-danger-text'
                                : outlet.creditStatus === 'Perhatian'
                                ? 'text-status-warning-text'
                                : 'text-status-success-text'
                            }`}
                          >
                            Sisa: Rp {outlet.creditRemaining.toLocaleString('id-ID')} ({percentRemaining}%)
                          </span>
                          <div className="w-24 h-1.5 bg-surface-container rounded-full overflow-hidden mt-1">
                            <div
                              className={`h-full ${
                                outlet.creditStatus === 'Overdue'
                                  ? 'bg-badge-red'
                                  : outlet.creditStatus === 'Perhatian'
                                  ? 'bg-badge-amber'
                                  : 'bg-badge-green'
                              }`}
                              style={{ width: `${percentRemaining}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-3">
                        <div className="flex flex-col">
                          <span className="font-label-md text-label-md text-on-surface font-semibold">
                            {outlet.salesRep}
                          </span>
                          <span className="font-label-sm text-label-sm text-on-surface-variant">
                            {outlet.salesArea}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="font-label-md text-label-md text-on-surface">
                            {outlet.lastOrderDate}
                          </span>
                          <span
                            className={`font-label-sm text-label-sm ${
                              outlet.creditStatus === 'Overdue'
                                ? 'text-status-danger-text font-bold'
                                : outlet.creditStatus === 'Perhatian'
                                ? 'text-status-warning-text font-medium'
                                : 'text-on-surface-variant'
                            }`}
                          >
                            {outlet.orderFrequency}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-space-md text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewHistory(outlet);
                            }}
                            className="p-1.5 rounded-lg text-primary hover:bg-surface-container transition-colors cursor-pointer"
                            title="Profil &amp; Riwayat Transaksi"
                            type="button"
                          >
                            <span className="material-symbols-outlined text-[18px]">receipt_long</span>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleScheduleVisit(outlet);
                            }}
                            className="p-1.5 rounded-lg text-tertiary hover:bg-surface-container transition-colors cursor-pointer"
                            title="Jadwalkan Kunjungan"
                            type="button"
                          >
                            <span className="material-symbols-outlined text-[18px]">event_available</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination / Table Footer */}
          <div className="px-space-md py-3 bg-surface-container-low flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-border-subtle/30">
            <span className="font-label-sm text-label-sm text-on-surface-variant">
              Menampilkan {filteredOutlets.length} dari {168 + (outlets.length - 6)} outlet terdaftar CV Arba'in
            </span>
            <div className="flex items-center gap-1">
              <button
                disabled
                className="w-8 h-8 rounded flex items-center justify-center text-on-surface-variant bg-surface-container-lowest hover:bg-surface-container transition-colors disabled:opacity-50 cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-[16px]">chevron_left</span>
              </button>
              <span className="w-8 h-8 rounded bg-primary text-on-primary flex items-center justify-center font-label-sm text-label-sm font-semibold">
                1
              </span>
              <button
                className="w-8 h-8 rounded flex items-center justify-center text-on-surface-variant bg-surface-container-lowest hover:bg-surface-container transition-colors cursor-pointer"
                type="button"
              >
                2
              </button>
              <button
                className="w-8 h-8 rounded flex items-center justify-center text-on-surface-variant bg-surface-container-lowest hover:bg-surface-container transition-colors cursor-pointer"
                type="button"
              >
                3
              </button>
              <span className="px-1 text-on-surface-variant">...</span>
              <button
                className="w-8 h-8 rounded flex items-center justify-center text-on-surface-variant bg-surface-container-lowest hover:bg-surface-container transition-colors cursor-pointer"
                type="button"
              >
                28
              </button>
              <button
                className="w-8 h-8 rounded flex items-center justify-center text-on-surface-variant bg-surface-container-lowest hover:bg-surface-container transition-colors cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </button>
            </div>
          </div>
        </div>

        {/* Side Drawer / Detail Pane: Ringkasan Performa Outlet Terpilih (4 cols) */}
        <div className="xl:col-span-4 flex flex-col gap-space-md">
          {selectedOutlet ? (
            <div className="bg-surface-container-lowest rounded-xl shadow-xs border border-border-subtle/40 p-space-md flex flex-col gap-space-md">
              {/* Drawer Header with Outlet Badge */}
              <div className="flex items-start justify-between">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-primary text-on-primary font-code-table text-code-table font-semibold">
                      {selectedOutlet.code}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded font-label-sm text-label-sm font-semibold ${
                        selectedOutlet.creditStatus === 'Overdue'
                          ? 'bg-status-danger-bg text-status-danger-text'
                          : selectedOutlet.creditStatus === 'Perhatian'
                          ? 'bg-status-warning-bg text-status-warning-text'
                          : 'bg-status-success-bg text-status-success-text'
                      }`}
                    >
                      {selectedOutlet.creditStatus === 'Overdue' ? 'Overdue' : 'Akun Aktif'}
                    </span>
                  </div>
                  <h2 className="font-headline-md text-headline-md text-on-surface mt-2 font-bold leading-snug">
                    {selectedOutlet.name}
                  </h2>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    {selectedOutlet.address}, {selectedOutlet.cityName}
                  </p>
                </div>
              </div>

              {/* Omset Performa Snapshot & Chart Widget */}
              <div className="bg-surface-container-low p-space-md rounded-lg flex flex-col gap-space-sm border border-border-subtle/30">
                <div className="flex items-center justify-between">
                  <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">
                    Performa Omset YTD 2026
                  </span>
                  <span className="font-code-table text-code-table font-semibold text-primary">
                    Rp {selectedOutlet.ytdTotal.toLocaleString('id-ID')}
                  </span>
                </div>
                {/* Mini SVG Trend Sparkline */}
                <div className="h-20 w-full flex items-end pt-2">
                  <svg className="w-full h-full text-primary" fill="none" preserveAspectRatio="none" viewBox="0 0 240 60">
                    <line stroke="currentColor" strokeDasharray="2 2" strokeOpacity="0.1" x1="0" x2="240" y1="15" y2="15" />
                    <line stroke="currentColor" strokeDasharray="2 2" strokeOpacity="0.1" x1="0" x2="240" y1="35" y2="35" />
                    <line stroke="currentColor" strokeOpacity="0.1" x1="0" x2="240" y1="55" y2="55" />
                    <path
                      d="M0,45 C40,48 60,32 90,26 C120,20 150,28 180,12 C210,-2 230,8 240,4 L240,60 L0,60 Z"
                      fill="currentColor"
                      fillOpacity="0.12"
                    />
                    <path
                      d="M0,45 C40,48 60,32 90,26 C120,20 150,28 180,12 C210,-2 230,8 240,4"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeWidth="2.5"
                    />
                  </svg>
                </div>
                <div className="flex justify-between font-label-sm text-label-sm text-on-surface-variant">
                  <span>Jan: 16.2 Jt</span>
                  <span>Feb: 19.8 Jt</span>
                  <span>Mar: 22.5 Jt</span>
                  <span className="font-semibold text-primary">Apr: 26.0 Jt (▲15%)</span>
                </div>
              </div>

              {/* Credit Line & Terms Visualizer */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-body-sm font-body-sm">
                  <span className="text-on-surface-variant">Plafon Kredit Disetujui:</span>
                  <span className="font-semibold text-on-surface font-code-table">
                    Rp {selectedOutlet.creditLimit.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="flex justify-between items-center text-body-sm font-body-sm">
                  <span className="text-on-surface-variant">Pemakaian Berjalan:</span>
                  <span className="font-semibold text-status-warning-text font-code-table">
                    Rp {selectedOutlet.creditUsed.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="flex justify-between items-center text-body-sm font-body-sm">
                  <span className="text-on-surface-variant">Sisa Plafon Aman:</span>
                  <span className="font-semibold text-status-success-text font-code-table">
                    Rp {selectedOutlet.creditRemaining.toLocaleString('id-ID')}
                  </span>
                </div>
                {/* Limit Progress Bar */}
                <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary"
                    style={{
                      width: `${Math.round((selectedOutlet.creditUsed / selectedOutlet.creditLimit) * 100)}%`
                    }}
                  />
                </div>
              </div>

              {/* PIC & Sales Contact Block */}
              <div className="bg-surface-container-low p-space-sm rounded-lg flex flex-col gap-2 border border-border-subtle/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-white shadow-xs">
                    <span className="material-symbols-outlined text-[20px]">person</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-label-md text-label-md text-on-surface font-semibold">
                      {selectedOutlet.picName}
                    </span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">
                      {selectedOutlet.picRole}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-border-subtle/30">
                  <span className="font-label-sm text-label-sm text-on-surface-variant">Sales Dedikasi:</span>
                  <span className="font-label-sm text-label-sm text-on-surface font-semibold">
                    {selectedOutlet.salesRep} ({selectedOutlet.salesArea})
                  </span>
                </div>
              </div>

              {/* Catatan Kunjungan Terakhir (Field Log) */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">
                    Log Kunjungan Sales Terakhir
                  </span>
                  <span className="font-label-sm text-label-sm text-primary font-medium">
                    {selectedOutlet.lastVisitDate}
                  </span>
                </div>
                <div className="bg-surface-container-low/60 p-3 rounded-lg text-body-sm font-body-sm text-on-surface leading-relaxed border border-border-subtle/30">
                  <p>{selectedOutlet.visitNotes}</p>
                </div>
              </div>

              {/* Fast Actions inside Drawer */}
              <div className="grid grid-cols-2 gap-space-xs pt-1">
                <button
                  onClick={handleQuickWhatsApp}
                  className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg bg-surface-container-low text-on-surface hover:bg-surface-container text-label-md font-label-md transition-colors cursor-pointer shadow-xs active:scale-95"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[16px] text-badge-green">chat</span>
                  <span>Chat WhatsApp PIC</span>
                </button>
                <button
                  onClick={() => handleScheduleVisit(selectedOutlet)}
                  className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg bg-primary text-on-primary hover:bg-tertiary text-label-md font-label-md transition-colors shadow-xs cursor-pointer active:scale-95"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[16px]">add_task</span>
                  <span>Jadwal Kunjungan</span>
                </button>
                <button
                  onClick={() => handleViewHistory(selectedOutlet)}
                  className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface text-label-md font-label-md transition-colors cursor-pointer shadow-xs active:scale-95"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[16px] text-primary">receipt_long</span>
                  <span>Riwayat Faktur</span>
                </button>
                <button
                  onClick={() => {
                    setSelectedOutletId(selectedOutlet.id);
                    setPath('field-sales-pwa-preview');
                    showToast(`Beralih ke Field Sales PWA untuk ${selectedOutlet.name}`, 'smartphone');
                  }}
                  className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg bg-secondary text-on-secondary hover:bg-on-secondary-fixed-variant text-label-md font-label-md transition-colors shadow-xs cursor-pointer active:scale-95 font-semibold"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[16px]">point_of_sale</span>
                  <span>Buat Order PWA</span>
                </button>
              </div>
            </div>
          ) : null}

          {/* Quick Delivery Coverage Indicator (Solo Raya) */}
          <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-xs border border-border-subtle/40 flex flex-col gap-space-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-[20px]">local_shipping</span>
                <span className="font-title-sm text-title-sm text-on-surface font-bold">
                  Armada Pengiriman Hari Ini
                </span>
              </div>
              <span className="font-label-sm text-label-sm text-status-success-text font-semibold bg-status-success-bg px-2 py-0.5 rounded">
                Rute Terjadwal
              </span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Pemesanan outlet sebelum pukul 13:00 WIB dikirim pada slot sore (15:00 - 18:00 WIB) armada van gudang Solo Baru.
            </p>
            <div className="grid grid-cols-2 gap-2 pt-1 font-label-sm text-label-sm">
              <div className="bg-surface-container-low p-2 rounded flex flex-col">
                <span className="text-on-surface-variant">Slot Pagi (08:00 - 12:00)</span>
                <span className="font-semibold text-on-surface mt-0.5">34 Outlet Solo &amp; Sukoharjo</span>
              </div>
              <div className="bg-surface-container-low p-2 rounded flex flex-col">
                <span className="text-on-surface-variant">Slot Sore (13:00 - 17:00)</span>
                <span className="font-semibold text-on-surface mt-0.5">28 Outlet Karanganyar &amp; Klaten</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Registration Modal: + Daftarkan Outlet Baru */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-surface-container-lowest rounded-xl shadow-2xl max-w-2xl w-full p-space-lg flex flex-col gap-space-md max-h-[90vh] overflow-y-auto border border-border-subtle/50">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[24px]">add_business</span>
                <h2 className="font-headline-md text-headline-md text-on-surface font-bold">
                  Registrasi Outlet B2B Baru
                </h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:bg-surface-container transition-colors cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleRegisterOutlet} className="flex flex-col gap-space-md">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-space-sm">
                {/* Kode & Nama */}
                <div className="flex flex-col gap-1">
                  <label className="font-label-sm text-label-sm text-on-surface-variant font-medium">
                    Kode Outlet (Auto Generated)
                  </label>
                  <input
                    readOnly
                    type="text"
                    value={`AP-SLO-${168 + outlets.length + 1}`}
                    className="bg-surface-container-low text-on-surface px-3 py-2 rounded-lg font-code-table text-code-table cursor-not-allowed"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-label-sm text-label-sm text-on-surface-variant font-medium">
                    Tipe Outlet *
                  </label>
                  <select
                    value={newOutletType}
                    onChange={(e) => setNewOutletType(e.target.value as any)}
                    required
                    className="bg-surface-container-low text-on-surface px-3 py-2 rounded-lg font-body-md text-body-md focus:bg-surface-container cursor-pointer"
                  >
                    <option value="Apotek Mandiri">Apotek Mandiri</option>
                    <option value="Jaringan Farmasi">Jaringan Farmasi (Kimia Farma / K-24 / Roxy)</option>
                    <option value="Minimarket">Minimarket / Supermarket Ritel</option>
                  </select>
                </div>

                <div className="md:col-span-2 flex flex-col gap-1">
                  <label className="font-label-sm text-label-sm text-on-surface-variant font-medium">
                    Nama Resmi Outlet / Toko *
                  </label>
                  <input
                    value={newOutletName}
                    onChange={(e) => setNewOutletName(e.target.value)}
                    required
                    type="text"
                    placeholder="Contoh: Apotek K-24 Nusukan Solo"
                    className="bg-surface-container-low text-on-surface px-3 py-2 rounded-lg font-body-md text-body-md focus:bg-surface-container"
                  />
                </div>

                {/* PIC & Phone */}
                <div className="flex flex-col gap-1">
                  <label className="font-label-sm text-label-sm text-on-surface-variant font-medium">
                    Apoteker / Penanggung Jawab *
                  </label>
                  <input
                    value={newOutletPic}
                    onChange={(e) => setNewOutletPic(e.target.value)}
                    required
                    type="text"
                    placeholder="Nama lengkap &amp; gelar"
                    className="bg-surface-container-low text-on-surface px-3 py-2 rounded-lg font-body-md text-body-md focus:bg-surface-container"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-label-sm text-label-sm text-on-surface-variant font-medium">
                    No. WhatsApp Aktif *
                  </label>
                  <input
                    value={newOutletPhone}
                    onChange={(e) => setNewOutletPhone(e.target.value)}
                    required
                    type="tel"
                    placeholder="08xxxxxxxxxx"
                    className="bg-surface-container-low text-on-surface px-3 py-2 rounded-lg font-body-md text-body-md focus:bg-surface-container"
                  />
                </div>

                {/* Wilayah Solo Raya */}
                <div className="flex flex-col gap-1">
                  <label className="font-label-sm text-label-sm text-on-surface-variant font-medium">
                    Kota / Kabupaten (Solo Raya) *
                  </label>
                  <select
                    value={newOutletCity}
                    onChange={(e) => setNewOutletCity(e.target.value as any)}
                    required
                    className="bg-surface-container-low text-on-surface px-3 py-2 rounded-lg font-body-md text-body-md focus:bg-surface-container cursor-pointer"
                  >
                    <option value="Solo">Surakarta / Solo</option>
                    <option value="Sukoharjo">Sukoharjo</option>
                    <option value="Karanganyar">Karanganyar</option>
                    <option value="Klaten">Klaten</option>
                    <option value="Boyolali">Boyolali</option>
                    <option value="Sragen">Sragen</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-label-sm text-label-sm text-on-surface-variant font-medium">
                    Sales Dedikasi Lapangan *
                  </label>
                  <select
                    value={newOutletSales}
                    onChange={(e) => setNewOutletSales(e.target.value)}
                    required
                    className="bg-surface-container-low text-on-surface px-3 py-2 rounded-lg font-body-md text-body-md focus:bg-surface-container cursor-pointer"
                  >
                    <option value="Budi Santoso">Budi Santoso (Solo Tengah)</option>
                    <option value="Tri Wahyuni">Tri Wahyuni (Sukoharjo - Solo Baru)</option>
                    <option value="Agus Hermawan">Agus Hermawan (Karanganyar - Sragen)</option>
                    <option value="Rian Pratama">Rian Pratama (Klaten - Boyolali)</option>
                  </select>
                </div>

                {/* Alamat */}
                <div className="md:col-span-2 flex flex-col gap-1">
                  <label className="font-label-sm text-label-sm text-on-surface-variant font-medium">
                    Alamat Lengkap Outlet &amp; Patokan Pengiriman *
                  </label>
                  <textarea
                    value={newOutletAddress}
                    onChange={(e) => setNewOutletAddress(e.target.value)}
                    required
                    rows={2}
                    placeholder="Jl. Raya No. XX, Kelurahan, Kecamatan..."
                    className="bg-surface-container-low text-on-surface px-3 py-2 rounded-lg font-body-md text-body-md focus:bg-surface-container"
                  />
                </div>

                {/* Credit Terms & Plafon */}
                <div className="flex flex-col gap-1">
                  <label className="font-label-sm text-label-sm text-on-surface-variant font-medium">
                    Termin Pembayaran Disepakati *
                  </label>
                  <select
                    value={newOutletTerms}
                    onChange={(e) => setNewOutletTerms(e.target.value as any)}
                    required
                    className="bg-surface-container-low text-on-surface px-3 py-2 rounded-lg font-body-md text-body-md focus:bg-surface-container cursor-pointer"
                  >
                    <option value="Net 30 Hari">Net 30 Hari (Standar Apotek)</option>
                    <option value="Net 14 Hari">Net 14 Hari (Minimarket)</option>
                    <option value="COD Cash">COD / Cash On Delivery (Mitra Baru)</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-label-sm text-label-sm text-on-surface-variant font-medium">
                    Plafon Kredit Awal (IDR)
                  </label>
                  <input
                    value={newOutletLimit}
                    onChange={(e) => setNewOutletLimit(Number(e.target.value))}
                    type="number"
                    className="bg-surface-container-low text-on-surface px-3 py-2 rounded-lg font-body-md text-body-md focus:bg-surface-container"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-space-sm pt-4 border-t mt-2">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-space-md py-2.5 rounded-lg bg-surface-container text-on-surface font-label-lg text-label-lg hover:bg-surface-container-high transition-colors cursor-pointer"
                  type="button"
                >
                  Batal
                </button>
                <button
                  className="px-space-md py-2.5 rounded-lg bg-primary text-on-primary font-label-lg text-label-lg hover:bg-tertiary transition-colors shadow-sm cursor-pointer"
                  type="submit"
                >
                  Simpan &amp; Daftarkan Kemitraan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* WhatsApp Assistant Modal */}
      {whatsAppModalOpen && selectedOutlet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-surface-container-lowest rounded-xl shadow-2xl max-w-lg w-full p-6 flex flex-col gap-4 border border-border-subtle/50">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-badge-green text-[24px]">chat</span>
                <h3 className="font-title-sm text-title-sm text-on-surface font-bold">
                  Asisten Komunikasi WhatsApp PIC
                </h3>
              </div>
              <button
                onClick={() => setWhatsAppModalOpen(false)}
                className="text-on-surface-variant hover:text-on-surface p-1 rounded-lg cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="bg-surface-container-low p-3 rounded-lg flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-badge-green/20 text-badge-green flex items-center justify-center font-bold">
                <span className="material-symbols-outlined text-[20px]">person</span>
              </div>
              <div className="flex flex-col">
                <span className="font-title-sm text-title-sm font-semibold text-on-surface">{selectedOutlet.picName}</span>
                <span className="text-xs text-on-surface-variant font-mono">{selectedOutlet.picPhone} • {selectedOutlet.name}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-on-surface-variant">Pilih Template Pesan Cepat:</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setWaTemplate('delivery')}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer text-center ${
                    waTemplate === 'delivery'
                      ? 'bg-primary text-on-primary border-primary'
                      : 'bg-surface-container text-on-surface border-border-subtle/50'
                  }`}
                >
                  Jadwal Kirim
                </button>
                <button
                  type="button"
                  onClick={() => setWaTemplate('invoice')}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer text-center ${
                    waTemplate === 'invoice'
                      ? 'bg-primary text-on-primary border-primary'
                      : 'bg-surface-container text-on-surface border-border-subtle/50'
                  }`}
                >
                  Tagihan Tempo
                </button>
                <button
                  type="button"
                  onClick={() => setWaTemplate('promo')}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer text-center ${
                    waTemplate === 'promo'
                      ? 'bg-primary text-on-primary border-primary'
                      : 'bg-surface-container text-on-surface border-border-subtle/50'
                  }`}
                >
                  Promo Bundling
                </button>
              </div>

              <div className="mt-2">
                <label className="text-xs font-semibold text-on-surface-variant block mb-1">Pratinjau Pesan:</label>
                <textarea
                  rows={4}
                  readOnly
                  value={
                    waTemplate === 'delivery'
                      ? `Halo Ibu/Bapak ${selectedOutlet.picName}, menginformasikan bahwa pesanan produk herbal CV Arba'in untuk ${selectedOutlet.name} telah diproses gudang Kartasura dan siap dikirim dengan armada hari ini. Mohon stempel penerimaan disiapkan.`
                      : waTemplate === 'invoice'
                      ? `Halo Ibu/Bapak ${selectedOutlet.picName}, menginformasikan jatuh tempo faktur termin ${selectedOutlet.terms} untuk ${selectedOutlet.name}. Pemakaian kredit saat ini Rp ${selectedOutlet.creditUsed.toLocaleString('id-ID')} dari plafon Rp ${selectedOutlet.creditLimit.toLocaleString('id-ID')}. Terima kasih atas kerjasamanya.`
                      : `Halo Ibu/Bapak ${selectedOutlet.picName}, penawaran spesial CV Arba'in Solo Raya: Diskon bundling 12% untuk Madu Randu 500g dan Habbatussauda Oil Softgel 100s bagi apotek mitra minggu ini!`
                  }
                  className="w-full p-2.5 bg-surface-container-low rounded-lg text-xs text-on-surface font-body-sm border border-border-subtle/40 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t pt-3">
              <button
                type="button"
                onClick={() => setWhatsAppModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-surface-container text-on-surface text-xs font-semibold hover:bg-surface-container-high cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  const message =
                    waTemplate === 'delivery'
                      ? `Halo Ibu/Bapak ${selectedOutlet.picName}, pesanan produk herbal CV Arba'in untuk ${selectedOutlet.name} telah diproses gudang Kartasura dan siap dikirim hari ini.`
                      : waTemplate === 'invoice'
                      ? `Halo Ibu/Bapak ${selectedOutlet.picName}, pengingat jatuh tempo faktur termin ${selectedOutlet.terms} untuk ${selectedOutlet.name}.`
                      : `Halo Ibu/Bapak ${selectedOutlet.picName}, promo bundling khusus mitra apotek CV Arba'in Solo Raya minggu ini!`;
                  window.open(`https://wa.me/${selectedOutlet.picPhone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
                  showToast(`Membuka WhatsApp untuk ${selectedOutlet.picName}`, 'chat');
                  setWhatsAppModalOpen(false);
                }}
                className="px-4 py-2 rounded-lg bg-badge-green text-white text-xs font-semibold hover:opacity-90 flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">send</span>
                <span>Kirim via WhatsApp Web</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sales Visit Schedule Modal */}
      {visitModalOutlet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-surface-container-lowest rounded-xl shadow-2xl max-w-lg w-full p-6 flex flex-col gap-4 border border-border-subtle/50">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[24px]">calendar_month</span>
                <h3 className="font-title-sm text-title-sm text-on-surface font-bold">
                  Jadwalkan Kunjungan Sales Rep
                </h3>
              </div>
              <button
                onClick={() => setVisitModalOutlet(null)}
                className="text-on-surface-variant hover:text-on-surface p-1 rounded-lg cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                scheduleSalesVisit({
                  outletId: visitModalOutlet.id,
                  outletName: visitModalOutlet.name,
                  salesRep: visitModalOutlet.salesRep,
                  scheduledDate: visitDate,
                  purpose: visitPurpose,
                  notes: visitNotes
                });
                setVisitModalOutlet(null);
              }}
              className="flex flex-col gap-3"
            >
              <div className="bg-surface-container-low p-3 rounded-lg text-xs space-y-1">
                <span className="text-on-surface-variant block">Outlet Mitra:</span>
                <span className="font-bold text-sm text-on-surface block">{visitModalOutlet.name}</span>
                <span className="text-slate-500">{visitModalOutlet.address} • Wilayah: {visitModalOutlet.cityName}</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-on-surface-variant">Sales Dedikasi</label>
                  <input
                    type="text"
                    readOnly
                    value={visitModalOutlet.salesRep}
                    className="p-2 bg-surface-container-low rounded-lg text-xs font-semibold text-on-surface"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-on-surface-variant">Tujuan Kunjungan *</label>
                  <select
                    value={visitPurpose}
                    onChange={(e) => setVisitPurpose(e.target.value as any)}
                    className="p-2 bg-surface-container-low rounded-lg text-xs text-on-surface cursor-pointer focus:ring-1 focus:ring-primary"
                  >
                    <option value="Kunjungan Rutin">Kunjungan Rutin</option>
                    <option value="Penagihan Tempo">Penagihan Tempo</option>
                    <option value="Promosi Bundling">Promosi Bundling</option>
                    <option value="Follow Up At-Risk">Follow Up At-Risk</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-on-surface-variant">Waktu Rencana Kunjungan *</label>
                <input
                  type="datetime-local"
                  required
                  value={visitDate}
                  onChange={(e) => setVisitDate(e.target.value)}
                  className="p-2 bg-surface-container-low rounded-lg text-xs text-on-surface focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-on-surface-variant">Catatan Instruksi Sales *</label>
                <textarea
                  rows={2}
                  required
                  value={visitNotes}
                  onChange={(e) => setVisitNotes(e.target.value)}
                  className="p-2 bg-surface-container-low rounded-lg text-xs text-on-surface focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-2 border-t pt-3 mt-1">
                <button
                  type="button"
                  onClick={() => setVisitModalOutlet(null)}
                  className="px-4 py-2 rounded-lg bg-surface-container text-on-surface text-xs font-semibold hover:bg-surface-container-high cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-primary text-on-primary text-xs font-semibold hover:bg-primary-container flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">event_available</span>
                  <span>Simpan Agenda Kunjungan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invoice & Order History Modal */}
      {historyModalOutlet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-surface-container-lowest rounded-xl shadow-2xl max-w-2xl w-full p-6 flex flex-col gap-4 border border-border-subtle/50 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[24px]">receipt_long</span>
                <div>
                  <h3 className="font-title-sm text-title-sm text-on-surface font-bold">
                    Riwayat Transaksi &amp; Audit Faktur
                  </h3>
                  <span className="text-xs text-on-surface-variant">{historyModalOutlet.name} ({historyModalOutlet.code})</span>
                </div>
              </div>
              <button
                onClick={() => setHistoryModalOutlet(null)}
                className="text-on-surface-variant hover:text-on-surface p-1 rounded-lg cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Credit Gauge Summary */}
            <div className="grid grid-cols-3 gap-3 p-3 bg-surface-container-low rounded-xl text-center">
              <div>
                <span className="text-[11px] text-on-surface-variant block uppercase font-medium">Plafon Disetujui</span>
                <span className="font-bold text-sm text-on-surface">Rp {historyModalOutlet.creditLimit.toLocaleString('id-ID')}</span>
              </div>
              <div>
                <span className="text-[11px] text-on-surface-variant block uppercase font-medium">Pemakaian Berjalan</span>
                <span className="font-bold text-sm text-badge-amber">Rp {historyModalOutlet.creditUsed.toLocaleString('id-ID')}</span>
              </div>
              <div>
                <span className="text-[11px] text-on-surface-variant block uppercase font-medium">Sisa Plafon Tersedia</span>
                <span className="font-bold text-sm text-status-success-text">Rp {historyModalOutlet.creditRemaining.toLocaleString('id-ID')}</span>
              </div>
            </div>

            {/* History Table */}
            <div>
              <h4 className="font-semibold text-xs text-on-surface mb-2">Faktur Terbit &amp; Pemesanan Lapangan:</h4>
              <div className="overflow-x-auto rounded-lg border border-border-subtle/40">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-surface-container-high text-on-surface-variant font-semibold">
                    <tr>
                      <th className="p-2.5">No. Faktur</th>
                      <th className="p-2.5">Waktu</th>
                      <th className="p-2.5">Nilai Transaksi</th>
                      <th className="p-2.5">Termin</th>
                      <th className="p-2.5 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle/30">
                    {orders
                      .filter(
                        o =>
                          o.outletName.toLowerCase().includes(historyModalOutlet.name.toLowerCase()) ||
                          o.outletId === historyModalOutlet.code
                      )
                      .map((ord, idx) => (
                        <tr key={idx} className="hover:bg-surface-container-low">
                          <td className="p-2.5 font-mono font-semibold text-primary">{ord.clientUuid}</td>
                          <td className="p-2.5 text-slate-500">{ord.orderTime}</td>
                          <td className="p-2.5 font-semibold">Rp {ord.totalAmount.toLocaleString('id-ID')}</td>
                          <td className="p-2.5">{ord.terms}</td>
                          <td className="p-2.5 text-center">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-status-success-bg text-status-success-text">
                              {ord.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    {orders.filter(
                      o =>
                        o.outletName.toLowerCase().includes(historyModalOutlet.name.toLowerCase()) ||
                        o.outletId === historyModalOutlet.code
                    ).length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-4 text-center text-slate-400">
                          Belum ada transaksi historis terekam pada periode ini.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex items-center justify-between border-t pt-3">
              <span className="text-xs text-slate-500">Kepatuhan Audit: Sesuai Buku Besar Piutang Solo Raya</span>
              <button
                type="button"
                onClick={() => {
                  showToast(`Mencetak rekening koran mitra ${historyModalOutlet.name}`, 'print');
                  window.print();
                }}
                className="px-4 py-2 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-primary text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">print</span>
                <span>Cetak Rekap Piutang</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
