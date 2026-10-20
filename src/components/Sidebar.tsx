import React from 'react';
import { useApp } from '../context/AppContext';
import { NavigationPath } from '../types';

interface NavItem {
  id: NavigationPath;
  label: string;
  icon: string;
  badge?: number;
}

export const Sidebar: React.FC = () => {
  const { currentPath, setPath, orders, products, isSidebarCollapsed, toggleSidebar } = useApp();

  const pendingOrdersCount = orders.filter(o => o.status === 'PENDING').length;
  const criticalStockCount = products.filter(p => p.status === 'below-rop' || p.status === 'critical-expiry').length;

  const navItems: NavItem[] = [
    {
      id: 'executive-dashboard',
      label: 'Executive Dashboard',
      icon: 'dashboard'
    },
    {
      id: 'inventory-stock-ledger',
      label: 'Inventory & Stock Ledger',
      icon: 'inventory_2',
      badge: criticalStockCount > 0 ? criticalStockCount : undefined
    },
    {
      id: 'b2b-crm-directory',
      label: 'B2B CRM & Directory',
      icon: 'store'
    },
    {
      id: 'order-approval-queue',
      label: 'Order Approval Queue',
      icon: 'fact_check',
      badge: pendingOrdersCount > 0 ? pendingOrdersCount : undefined
    },
    {
      id: 'field-sales-pwa-preview',
      label: 'Field Sales PWA Preview',
      icon: 'smartphone'
    }
  ];

  return (
    <>
      {/* Dimmed backdrop when unfolded to allow clicking outside to fold */}
      {!isSidebarCollapsed && (
        <div
          className="fixed inset-0 top-16 z-30 bg-black/15 cursor-pointer"
          onClick={toggleSidebar}
          aria-hidden="true"
        />
      )}

      {/* Static Sidebar Panel (Overlaps statically when unfolded) */}
      <aside
        className={`fixed left-0 top-16 bottom-0 ${
          isSidebarCollapsed ? 'w-16 z-20 border-r border-border-subtle/60' : 'w-64 z-40 border-r border-border-subtle/80 shadow-2xl'
        } bg-surface-container-lowest flex flex-col justify-between py-3 select-none`}
      >
        {/* Navigation Items */}
        <div className="flex flex-col gap-1 px-2">
          <div className="flex items-center justify-between px-2 py-1 mb-1">
            {!isSidebarCollapsed ? (
              <span className="text-on-surface-variant text-[11px] uppercase tracking-wider font-semibold">
                Navigasi Modul
              </span>
            ) : (
              <span className="mx-auto text-[10px] text-on-surface-variant uppercase font-semibold">
                Menu
              </span>
            )}
          </div>

          <nav className="flex flex-col gap-1">
            {navItems.map((item) => {
              const isActive = currentPath === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setPath(item.id);
                    // Automatically fold sidebar upon selection if it was unfolded
                    if (!isSidebarCollapsed) {
                      toggleSidebar();
                    }
                  }}
                  type="button"
                  title={item.label}
                  className={`relative flex items-center ${
                    isSidebarCollapsed ? 'justify-center p-2.5' : 'justify-between px-3 py-2.5'
                  } rounded-lg text-left cursor-pointer text-sm font-medium ${
                    isActive
                      ? 'bg-primary text-white shadow-xs'
                      : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
                  }`}
                >
                  <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-3 min-w-0'}`}>
                    <span
                      className={`material-symbols-outlined text-[20px] shrink-0 ${
                        isActive ? 'text-white' : 'text-primary'
                      }`}
                    >
                      {item.icon}
                    </span>
                    {!isSidebarCollapsed && (
                      <span className="truncate">{item.label}</span>
                    )}
                  </div>

                  {/* Badge Indicator */}
                  {item.badge !== undefined && (
                    isSidebarCollapsed ? (
                      <span
                        className={`absolute top-1.5 right-1.5 w-2 h-2 rounded-full ${
                          isActive ? 'bg-white' : 'bg-amber-500'
                        }`}
                      />
                    ) : (
                      <span
                        className={`text-xs px-2 py-0.5 rounded-md font-semibold shrink-0 ml-2 ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section: Audit Status & Static Fold / Unfold Button */}
        <div className="flex flex-col gap-2 px-2">
          {!isSidebarCollapsed ? (
            <div className="px-3 py-2.5 bg-surface-container-low rounded-xl border border-border-subtle/50">
              <div className="flex items-center gap-1.5 text-primary text-xs font-semibold mb-0.5">
                <span className="material-symbols-outlined text-[15px]">verified</span>
                <span>Integritas CDOB &amp; FEFO</span>
              </div>
              <p className="text-[11px] text-on-surface-variant leading-relaxed">
                Penerapan mutasi stok tanggal kedaluwarsa terdekat aktif.
              </p>
            </div>
          ) : (
            <div
              title="Integritas CDOB & FEFO Aktif"
              className="w-10 h-10 mx-auto rounded-lg bg-surface-container-low flex items-center justify-center text-primary cursor-default border border-border-subtle/40"
            >
              <span className="material-symbols-outlined text-[18px]">verified</span>
            </div>
          )}

          {/* Static Fold / Unfold Control Button at Bottom Left */}
          <button
            onClick={toggleSidebar}
            type="button"
            title={isSidebarCollapsed ? 'Buka Menu Samping' : 'Lipat Menu Samping'}
            className={`flex items-center ${
              isSidebarCollapsed
                ? 'w-10 h-10 mx-auto justify-center rounded-lg bg-surface-container-low hover:bg-surface-container text-primary border border-border-subtle/50'
                : 'justify-between px-3 py-2 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface-variant hover:text-on-surface border border-border-subtle/50 text-xs font-medium'
            } cursor-pointer`}
          >
            {!isSidebarCollapsed ? (
              <>
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">dock_to_left</span>
                  <span>Lipat Menu</span>
                </span>
                <span className="material-symbols-outlined text-[16px]">chevron_left</span>
              </>
            ) : (
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            )}
          </button>
        </div>
      </aside>
    </>
  );
};
