import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Footer } from './components/Footer';
import { Toast } from './components/Toast';
import { InventoryStockLedgerView } from './views/InventoryStockLedgerView';
import { ExecutiveDashboardView } from './views/ExecutiveDashboardView';
import { B2bCrmDirectoryView } from './views/B2bCrmDirectoryView';
import { OrderApprovalQueueView } from './views/OrderApprovalQueueView';
import { FieldSalesPwaView } from './views/FieldSalesPwaView';

const MainContent: React.FC = () => {
  const { currentPath } = useApp();

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Header />
      <Sidebar />

      {/* Main Content Area stays permanently expanded, sidebar overlaps statically when unfolded */}
      <div className="pl-16 flex flex-col flex-grow">
        <main className="relative pt-16 bg-surface min-h-[calc(100vh-48px)] px-gutter-desktop py-space-lg flex-grow">
          {currentPath === 'inventory-stock-ledger' && <InventoryStockLedgerView />}
          {currentPath === 'executive-dashboard' && <ExecutiveDashboardView />}
          {currentPath === 'b2b-crm-directory' && <B2bCrmDirectoryView />}
          {currentPath === 'order-approval-queue' && <OrderApprovalQueueView />}
          {currentPath === 'field-sales-pwa-preview' && <FieldSalesPwaView />}
        </main>
        <Footer />
      </div>

      <Toast />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
