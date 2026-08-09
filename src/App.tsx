import React, { useEffect, useState } from 'react';
import { AppState } from './types';
import { DataService } from './services/dataService';
import { Navbar, ActiveTab } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { POSView } from './components/POSView';
import { StockView } from './components/StockView';
import { SuppliersView } from './components/SuppliersView';
import { CurrentAccountsView } from './components/CurrentAccountsView';
import { WithdrawalsView } from './components/WithdrawalsView';
import { ChequesView } from './components/ChequesView';
import { CashRegisterView } from './components/CashRegisterView';
import { AdvancedSearchFilterView } from './components/AdvancedSearchFilterView';
import { ReportsView } from './components/ReportsView';
import { UserGuideView } from './components/UserGuideView';
import { StoreSettingsModal } from './components/StoreSettingsModal';
import { CardRatesModal } from './components/CardRatesModal';
import { Search, Plus, AlertTriangle, ShieldCheck, User, Settings, Store, CreditCard, BookOpen } from 'lucide-react';

export default function App() {
  const [appState, setAppState] = useState<AppState>(DataService.getState());
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [quickSearch, setQuickSearch] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [cardRatesOpen, setCardRatesOpen] = useState(false);

  useEffect(() => {
    // Initialize data service & real-time SSE listener
    DataService.init();

    const unsubscribe = DataService.subscribe(newState => {
      setAppState(newState);
    });

    return () => unsubscribe();
  }, []);

  const lowStockCount = appState.products.filter(p => p.stock <= p.minStock).length;

  const handleQuickSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickSearch.trim()) {
      setActiveTab('search');
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen w-full bg-slate-100 font-sans text-slate-900 overflow-hidden">
      {/* Sidebar Navigation */}
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        appState={appState} 
        onOpenSettings={() => setSettingsOpen(true)}
        onOpenCardRates={() => setCardRatesOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-14 bg-white border-b border-slate-200/80 flex items-center justify-between px-4 sm:px-6 flex-shrink-0 z-10 shadow-xs">
          <form onSubmit={handleQuickSearchSubmit} className="flex-1 max-w-md">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar por talle, color, código de barras, cliente, producto..."
                value={quickSearch}
                onChange={e => setQuickSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 bg-slate-100/80 border border-slate-200 focus:bg-white focus:border-indigo-600 rounded-xl text-xs sm:text-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>
          </form>

          <div className="flex items-center space-x-2 sm:space-x-3 ml-3">
            {/* Rubro Badge */}
            <button
              onClick={() => setSettingsOpen(true)}
              className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-all text-xs font-bold border border-slate-700 shadow-xs"
              title="Ajustar Rubro o Tipo de Comercio"
            >
              <Settings className="w-3.5 h-3.5 text-indigo-400" />
              <span>{appState.storeInfo.businessType || 'Boutique & Indumentaria'}</span>
            </button>

            {lowStockCount > 0 && (
              <button
                onClick={() => setActiveTab('stock')}
                className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition-colors text-xs font-extrabold"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 animate-bounce" />
                <span>{lowStockCount} Bajo Stock</span>
              </button>
            )}

            <button
              onClick={() => setActiveTab('guide')}
              className="hidden md:flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 transition-colors text-xs font-bold"
              title="Manual & Guía Explicativa"
            >
              <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
              <span>Manual</span>
            </button>

            <button
              onClick={() => setActiveTab('pos')}
              className="px-3.5 py-1.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-indigo-500/20 transition-all flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>+ Nueva Venta</span>
            </button>

            <div className="hidden md:flex items-center space-x-2.5 pl-3 border-l border-slate-200 text-xs">
              <div className="w-8 h-8 rounded-full bg-slate-900 text-indigo-400 font-bold flex items-center justify-center border border-indigo-500/30 shadow-xs">
                <User className="w-4 h-4" />
              </div>
              <div className="text-left">
                <span className="font-extrabold text-slate-800 block text-[11px] leading-tight">Cajero Activo</span>
                <span className="text-[10px] text-emerald-600 block font-bold">Turno Abierto</span>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard / View Content Canvas */}
        <main className="flex-1 p-4 sm:p-5 lg:p-6 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <DashboardView appState={appState} setActiveTab={setActiveTab} />
          )}

          {activeTab === 'pos' && (
            <POSView appState={appState} onOpenCardRates={() => setCardRatesOpen(true)} />
          )}

          {activeTab === 'stock' && (
            <StockView appState={appState} />
          )}

          {activeTab === 'suppliers' && (
            <SuppliersView appState={appState} />
          )}

          {activeTab === 'customers' && (
            <CurrentAccountsView appState={appState} />
          )}

          {activeTab === 'withdrawals' && (
            <WithdrawalsView appState={appState} />
          )}

          {activeTab === 'cheques' && (
            <ChequesView appState={appState} />
          )}

          {activeTab === 'cash' && (
            <CashRegisterView appState={appState} />
          )}

          {activeTab === 'search' && (
            <AdvancedSearchFilterView appState={appState} />
          )}

          {activeTab === 'reports' && (
            <ReportsView appState={appState} />
          )}

          {activeTab === 'guide' && (
            <UserGuideView appState={appState} setActiveTab={setActiveTab} />
          )}
        </main>

        {/* Footer Status Bar */}
        <footer className="h-8 bg-slate-900 text-slate-400 px-4 sm:px-6 flex items-center justify-between text-[10px] flex-shrink-0 border-t border-slate-800 select-none">
          <div className="flex items-center space-x-4 sm:space-x-6">
            <span className="font-mono">DB: v2.4.1 (Cloud-Sync)</span>
            <span className="flex items-center">
              <div className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
              <span className="text-slate-300 font-semibold">Sincronizado</span>
            </span>
            <span className="hidden md:inline">Terminal ID: PX-99</span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="hidden sm:inline text-indigo-300 font-mono font-bold">DASHBOARD_LIVE_STREAM: TRUE</span>
            <span className="text-slate-400 uppercase font-mono">{new Date().toLocaleDateString('es-AR')}</span>
          </div>
        </footer>
      </div>

      {/* Store Settings Modal */}
      <StoreSettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        storeInfo={appState.storeInfo}
      />

      {/* Card Interest & Surcharges Modal */}
      <CardRatesModal
        isOpen={cardRatesOpen}
        onClose={() => setCardRatesOpen(false)}
        storeInfo={appState.storeInfo}
      />
    </div>
  );
}

