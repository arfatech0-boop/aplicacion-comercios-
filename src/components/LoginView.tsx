import React, { useState } from 'react';
import { 
  Store, 
  Lock, 
  User, 
  Building, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  PlusCircle, 
  Sparkles,
  KeyRound,
  Eye,
  EyeOff
} from 'lucide-react';
import { AppState, SystemUser, StoreAccount } from '../types';

interface LoginViewProps {
  appState: AppState;
  onLogin: (user: SystemUser, storeId: string) => void;
  onCreateStore: (newStore: StoreAccount, adminUser: SystemUser) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ appState, onLogin, onCreateStore }) => {
  const [mode, setMode] = useState<'login' | 'register_store'>('login');
  
  // Login form state
  const [selectedStoreId, setSelectedStoreId] = useState<string>(
    appState.stores && appState.stores.length > 0 ? appState.stores[0].id : 'store-demo-a'
  );
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Register Store Form State
  const [newStoreName, setNewStoreName] = useState('');
  const [newStoreCuit, setNewStoreCuit] = useState('');
  const [newStoreRubro, setNewStoreRubro] = useState('Comercio General / Multirrubro');
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminUsername, setNewAdminUsername] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');

  const stores = appState.stores || [
    {
      id: 'store-demo-a',
      name: 'Comercio Demo A - Ferretería Central',
      cuit: '20-12345678-9',
      businessType: 'Ferretería / Corralón' as any,
      address: 'Av. Corrientes 1234, CABA',
      phone: '11 4444-5555',
      email: 'contacto@ferreteriacentral.com',
      active: true,
      createdAt: new Date().toISOString()
    },
    {
      id: 'store-demo-b',
      name: 'Comercio Demo B - Almacén Don Pedro',
      cuit: '30-98765432-1',
      businessType: 'Supermercado / Almacén' as any,
      address: 'Calle San Martín 456, Rosario',
      phone: '341 555-6666',
      email: 'ventas@almacendonpedro.com',
      active: true,
      createdAt: new Date().toISOString()
    }
  ];

  const handleQuickLogin = (storeId: string, demoUser: string, pass: string) => {
    setSelectedStoreId(storeId);
    setUsername(demoUser);
    setPassword(pass);
    setErrorMessage('');
    
    // Trigger login
    const targetStoreUsers = appState.users.filter(u => u.storeId === storeId || !u.storeId);
    const user = targetStoreUsers.find(u => u.username.toLowerCase() === demoUser.toLowerCase()) || {
      id: `usr-${Date.now()}`,
      storeId,
      username: demoUser,
      password: pass,
      name: demoUser === 'admin' ? 'Administrador' : 'Don Pedro',
      role: 'admin',
      active: true,
      createdAt: new Date().toISOString()
    };

    onLogin(user, storeId);
  };

  const handleSubmitLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!username.trim()) {
      setErrorMessage('Por favor ingrese su usuario o correo.');
      return;
    }

    const storeUsers = appState.users.filter(u => !u.storeId || u.storeId === selectedStoreId);
    const foundUser = storeUsers.find(u => u.username.toLowerCase() === username.trim().toLowerCase());

    if (foundUser) {
      if (foundUser.password && foundUser.password !== password) {
        setErrorMessage('Contraseña incorrecta. Por favor intente nuevamente.');
        return;
      }
      onLogin(foundUser, selectedStoreId);
    } else {
      // Create user automatically for fast testing if needed
      const newUser: SystemUser = {
        id: `usr-${Date.now()}`,
        storeId: selectedStoreId,
        username: username.trim(),
        password: password || '123456',
        name: username.trim().toUpperCase(),
        role: 'admin',
        active: true,
        createdAt: new Date().toISOString()
      };
      onLogin(newUser, selectedStoreId);
    }
  };

  const handleRegisterStoreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStoreName.trim() || !newAdminUsername.trim()) {
      setErrorMessage('Por favor complete los campos obligatorios del nuevo comercio.');
      return;
    }

    const newStoreId = `store-${Date.now()}`;
    const newStore: StoreAccount = {
      id: newStoreId,
      name: newStoreName.trim(),
      cuit: newStoreCuit.trim() || '20-00000000-0',
      businessType: newStoreRubro as any,
      address: 'Dirección Comercial',
      phone: '11 0000-0000',
      email: `${newAdminUsername}@comercio.com`,
      active: true,
      createdAt: new Date().toISOString()
    };

    const newAdmin: SystemUser = {
      id: `usr-${Date.now()}`,
      storeId: newStoreId,
      username: newAdminUsername.trim(),
      password: newAdminPassword || '123456',
      name: newAdminName.trim() || newAdminUsername.trim(),
      role: 'admin',
      active: true,
      createdAt: new Date().toISOString()
    };

    onCreateStore(newStore, newAdmin);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white font-sans relative overflow-hidden">
      {/* Background Animated Glow Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-emerald-600/20 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Navbar Header */}
      <header className="px-6 py-4 flex items-center justify-between z-10 border-b border-slate-800/60 backdrop-blur-md bg-slate-950/40">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-black text-lg text-white tracking-tight flex items-center gap-2">
              GestiónComercio <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full font-bold border border-indigo-500/30">SaaS Multi-Comercio</span>
            </h1>
            <p className="text-[11px] text-slate-400">Plataforma de Control Comercial & Punto de Venta Aislado</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Aislamiento 100% Garantizado</span>
          </span>
        </div>
      </header>

      {/* Main Form Box Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 z-10 my-6">
        <div className="max-w-md w-full bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/80 space-y-6">
          {/* Header Title Tabs */}
          <div className="flex items-center p-1 bg-slate-950/60 rounded-2xl border border-slate-800/80 text-xs font-bold">
            <button
              onClick={() => { setMode('login'); setErrorMessage(''); }}
              className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center space-x-2 ${
                mode === 'login' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <KeyRound className="w-4 h-4" />
              <span>Iniciar Sesión</span>
            </button>
            <button
              onClick={() => { setMode('register_store'); setErrorMessage(''); }}
              className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center space-x-2 ${
                mode === 'register_store' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Nuevo Comercio</span>
            </button>
          </div>

          {errorMessage && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-300 rounded-xl text-xs font-semibold flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-red-400 animate-ping" />
              <span>{errorMessage}</span>
            </div>
          )}

          {mode === 'login' ? (
            <form onSubmit={handleSubmitLogin} className="space-y-4">
              {/* Select Comercio */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center justify-between">
                  <span className="flex items-center space-x-1.5">
                    <Building className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Seleccionar Tu Comercio</span>
                  </span>
                  <span className="text-[10px] text-indigo-400 font-normal">Base Aislada</span>
                </label>
                <select
                  value={selectedStoreId}
                  onChange={e => setSelectedStoreId(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-white text-xs font-semibold focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                >
                  {stores.map(st => (
                    <option key={st.id} value={st.id} className="bg-slate-900 text-white">
                      {st.name} ({st.businessType})
                    </option>
                  ))}
                </select>
              </div>

              {/* Username Input */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center space-x-1.5">
                  <User className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Usuario o Correo *</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. admin o donpedro"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-white text-xs font-medium focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center space-x-1.5">
                  <Lock className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Contraseña *</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-white text-xs font-medium focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-extrabold rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center space-x-2 text-xs uppercase tracking-wider"
              >
                <span>Entrar a Mi Comercio</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Demo 1-Click Fast Login Shortcuts */}
              <div className="pt-3 border-t border-slate-800/80 space-y-2">
                <span className="text-[11px] font-bold text-slate-400 block text-center uppercase tracking-wider">
                  ⚡ Ingreso Rápido de Prueba (Demo)
                </span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('store-demo-a', 'admin', '123456')}
                    className="p-2.5 bg-indigo-950/50 hover:bg-indigo-900/60 border border-indigo-800/50 rounded-xl text-left transition-colors group"
                  >
                    <span className="font-extrabold text-indigo-300 block text-[11px] group-hover:text-white">
                      Comercio A: Ferretería
                    </span>
                    <span className="text-[10px] text-slate-400 block font-mono">
                      Usuario: admin (123456)
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickLogin('store-demo-b', 'donpedro', '123456')}
                    className="p-2.5 bg-emerald-950/50 hover:bg-emerald-900/60 border border-emerald-800/50 rounded-xl text-left transition-colors group"
                  >
                    <span className="font-extrabold text-emerald-300 block text-[11px] group-hover:text-white">
                      Comercio B: Almacén
                    </span>
                    <span className="text-[10px] text-slate-400 block font-mono">
                      Usuario: donpedro (123456)
                    </span>
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegisterStoreSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Nombre del Comercio / Negocio *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Tienda San Martín"
                  value={newStoreName}
                  onChange={e => setNewStoreName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-white text-xs font-medium focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">CUIT / DNI</label>
                  <input
                    type="text"
                    placeholder="20-12345678-9"
                    value={newStoreCuit}
                    onChange={e => setNewStoreCuit(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-white text-xs font-medium focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Rubro Principal</label>
                  <select
                    value={newStoreRubro}
                    onChange={e => setNewStoreRubro(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-white text-xs font-semibold focus:border-indigo-500"
                  >
                    <option value="Comercio General / Multirrubro">Comercio General</option>
                    <option value="Supermercado / Almacén">Supermercado / Almacén</option>
                    <option value="Ferretería / Corralón">Ferretería / Corralón</option>
                    <option value="Indumentaria / Calzado">Indumentaria & Calzado</option>
                    <option value="Electrónica / Computación">Electrónica & Tech</option>
                    <option value="Gastronomía / Panadería">Gastronomía & Panadería</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/80">
                <span className="font-bold text-indigo-400 block mb-2 text-xs">Datos del Administrador</span>
                
                <div className="space-y-3">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Nombre Completo</label>
                    <input
                      type="text"
                      placeholder="Ej. Juan Pérez"
                      value={newAdminName}
                      onChange={e => setNewAdminName(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-white text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-300 mb-1">Usuario / Email *</label>
                      <input
                        type="text"
                        required
                        placeholder="juanperez"
                        value={newAdminUsername}
                        onChange={e => setNewAdminUsername(e.target.value)}
                        className="w-full px-3.5 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-300 mb-1">Contraseña</label>
                      <input
                        type="password"
                        placeholder="123456"
                        value={newAdminPassword}
                        onChange={e => setNewAdminPassword(e.target.value)}
                        className="w-full px-3.5 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-white text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 text-xs mt-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Crear Comercio e Ingresar</span>
              </button>
            </form>
          )}
        </div>
      </main>

      {/* Footer info */}
      <footer className="py-3 text-center text-[11px] text-slate-500 z-10 border-t border-slate-900 bg-slate-950">
        GestiónComercio Pro SaaS &copy; 2026 - Aisle de datos por `storeId` para venta comercial.
      </footer>
    </div>
  );
};
