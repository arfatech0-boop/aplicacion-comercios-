import React, { useState } from 'react';
import { AppState, SystemUser } from '../types';
import { ShieldCheck, User, Lock, Eye, EyeOff, AlertCircle, Sparkles, Building2 } from 'lucide-react';

interface LoginViewProps {
  appState: AppState;
  onLoginSuccess: (user: SystemUser) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ appState, onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setErrorMsg('Por favor ingrese su usuario y contraseña.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password: password.trim() })
      });

      const json = await res.json();
      setIsLoading(false);

      if (res.ok && json.success && json.user) {
        onLoginSuccess(json.user);
      } else {
        setErrorMsg(json.error || 'Credenciales inválidas.');
      }
    } catch (e) {
      setIsLoading(false);
      // Fallback local authentication
      const user = appState.users.find(
        u => u.username.toLowerCase() === username.trim().toLowerCase()
      );
      if (user) {
        if (user.password === password.trim()) {
          if (user.active) {
            onLoginSuccess(user);
          } else {
            setErrorMsg('El usuario está inactivo. Contacte al administrador.');
          }
        } else {
          setErrorMsg('Contraseña incorrecta.');
        }
      } else {
        setErrorMsg('Usuario no encontrado.');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 p-4 font-sans text-slate-100 overflow-y-auto">
      {/* Dynamic Background Glows */}
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-md bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-gradient-to-tr from-indigo-600 to-emerald-500 text-white shadow-lg shadow-indigo-500/30 mb-1">
            <ShieldCheck className="w-8 h-8" />
          </div>

          <h1 className="text-2xl font-black text-white tracking-tight">
            {appState.storeInfo.name || 'GestiónComercio Pro'}
          </h1>
          <p className="text-xs text-slate-400 font-medium">
            Sistema Comercial & Control de Accesos
          </p>

          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-indigo-300 text-[11px] font-semibold mt-1">
            <Building2 className="w-3.5 h-3.5 text-indigo-400" />
            <span>{appState.storeInfo.businessType || 'Comercio General'}</span>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-950/80 border border-red-800 text-red-200 text-xs font-semibold flex items-start space-x-2.5 animate-shake">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
              Nombre de Usuario
            </label>
            <div className="relative">
              <input
                type="text"
                required
                autoFocus
                placeholder="Ej. admin o vendedor1"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-xs sm:text-sm text-white font-medium focus:bg-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all"
              />
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
              Contraseña
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-xs sm:text-sm text-white font-medium focus:bg-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-200 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white font-black text-sm shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <span>Validando...</span>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>🔐 Iniciar Sesión en el Sistema</span>
              </>
            )}
          </button>
        </form>

        {/* Initial Access Hint Box */}
        <div className="p-3 bg-indigo-950/40 rounded-2xl border border-indigo-900/60 text-[11px] text-slate-400 text-center space-y-1">
          <p className="font-semibold text-indigo-300 flex items-center justify-center space-x-1">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Acceso inicial de Administración:</span>
          </p>
          <p className="font-mono text-slate-300">
            Usuario: <strong className="text-white">admin</strong> | Clave: <strong className="text-white">admin</strong>
          </p>
          <p className="text-[10px] text-slate-500 italic">
            (Puede crear y cambiar contraseñas desde Configuración)
          </p>
        </div>
      </div>
    </div>
  );
};
