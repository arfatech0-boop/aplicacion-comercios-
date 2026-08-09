import React, { useState } from 'react';
import { AppState, SystemUser, UserRole } from '../types';
import { DataService } from '../services/dataService';
import { Users, Plus, X, Pencil, Trash2, Key, Shield, UserCheck, UserX, CheckCircle, AlertCircle } from 'lucide-react';

interface UserManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  appState: AppState;
  currentUser: SystemUser | null;
}

export const UserManagementModal: React.FC<UserManagementModalProps> = ({
  isOpen,
  onClose,
  appState,
  currentUser
}) => {
  const [editingUser, setEditingUser] = useState<Partial<SystemUser> | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleOpenCreate = () => {
    setEditingUser({
      id: `user-${Date.now()}`,
      name: '',
      username: '',
      password: '',
      role: 'cashier',
      active: true,
      createdAt: new Date().toISOString()
    });
    setErrorMsg('');
    setSuccessMsg('');
    setIsFormOpen(true);
  };

  const handleOpenEdit = (user: SystemUser) => {
    setEditingUser({ ...user });
    setErrorMsg('');
    setSuccessMsg('');
    setIsFormOpen(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser || !editingUser.name || !editingUser.username || !editingUser.password) {
      setErrorMsg('Por favor complete todos los campos obligatorios.');
      return;
    }

    setErrorMsg('');
    setSuccessMsg('');

    const res = await DataService.saveUser(editingUser as SystemUser);

    if (res.success) {
      setSuccessMsg('¡Usuario guardado correctamente!');
      setIsFormOpen(false);
      setEditingUser(null);
    } else {
      setErrorMsg(res.error || 'Error al guardar el usuario.');
    }
  };

  const handleDeleteUser = async (user: SystemUser) => {
    if (user.id === currentUser?.id) {
      alert('No puede eliminar su propio usuario mientras está con la sesión iniciada.');
      return;
    }

    if (window.confirm(`¿Está seguro de eliminar al usuario "${user.name}" (${user.username})?`)) {
      const res = await DataService.deleteUser(user.id);
      if (res.success) {
        setSuccessMsg('Usuario eliminado con éxito.');
      } else {
        alert(res.error || 'Error al eliminar el usuario.');
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl space-y-4 text-xs">
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-indigo-100 rounded-lg text-indigo-700">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Administración de Usuarios y Contraseñas</h3>
              <p className="text-xs text-slate-500 font-medium">Cree y gestione los accesos para los empleados y administradores del negocio.</p>
            </div>
          </div>

          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Alert */}
        {successMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg font-semibold flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Users List Table */}
        <div className="flex items-center justify-between">
          <span className="font-bold text-slate-700 text-xs">
            Usuarios Registrados ({appState.users.length})
          </span>
          <button
            onClick={handleOpenCreate}
            className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center space-x-1 shadow transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>+ Crear Nuevo Usuario</span>
          </button>
        </div>

        <div className="max-h-72 overflow-y-auto border rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-600 uppercase font-semibold text-[10px]">
              <tr>
                <th className="p-2.5">Nombre</th>
                <th className="p-2.5">Usuario</th>
                <th className="p-2.5">Rol</th>
                <th className="p-2.5">Estado</th>
                <th className="p-2.5">Último Ingreso</th>
                <th className="p-2.5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {appState.users.map(user => (
                <tr key={user.id} className="hover:bg-slate-50">
                  <td className="p-2.5 font-bold text-slate-900">
                    {user.name}
                    {user.id === currentUser?.id && (
                      <span className="ml-1.5 px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-800 text-[9px] font-extrabold">
                        (Tú)
                      </span>
                    )}
                  </td>
                  <td className="p-2.5 font-mono text-slate-600">{user.username}</td>
                  <td className="p-2.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                      user.role === 'admin'
                        ? 'bg-purple-100 text-purple-800 border border-purple-200'
                        : 'bg-blue-100 text-blue-800 border border-blue-200'
                    }`}>
                      {user.role === 'admin' ? 'Administrador' : 'Cajero / Vendedor'}
                    </span>
                  </td>
                  <td className="p-2.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold flex items-center space-x-1 w-max ${
                      user.active ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {user.active ? <UserCheck className="w-3 h-3" /> : <UserX className="w-3 h-3" />}
                      <span>{user.active ? 'Activo' : 'Inactivo'}</span>
                    </span>
                  </td>
                  <td className="p-2.5 text-slate-500 font-mono text-[10px]">
                    {user.lastLogin ? new Date(user.lastLogin).toLocaleString('es-AR') : 'Nunca'}
                  </td>
                  <td className="p-2.5 text-right space-x-1">
                    <button
                      onClick={() => handleOpenEdit(user)}
                      className="p-1.5 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition-colors"
                      title="Editar / Cambiar Clave"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user)}
                      className="p-1.5 rounded bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
                      title="Eliminar Usuario"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* User Create / Edit Form Modal */}
        {isFormOpen && editingUser && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-xs">
              <div className="flex items-center justify-between border-b pb-3">
                <h4 className="font-bold text-slate-900 text-sm">
                  {editingUser.createdAt ? 'Editar Usuario / Cambiar Contraseña' : 'Crear Nuevo Usuario'}
                </h4>
                <button onClick={() => setIsFormOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg font-semibold flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSaveUser} className="space-y-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nombre Completo de la Persona *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Juan Pérez"
                    value={editingUser.name || ''}
                    onChange={e => setEditingUser({ ...editingUser, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg bg-slate-50 font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nombre de Usuario (Para Login) *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. juanperez o vendedor1"
                    value={editingUser.username || ''}
                    onChange={e => setEditingUser({ ...editingUser, username: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg bg-slate-50 font-mono font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Contraseña *</label>
                  <input
                    type="text"
                    required
                    placeholder="Escriba la clave de acceso"
                    value={editingUser.password || ''}
                    onChange={e => setEditingUser({ ...editingUser, password: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg bg-slate-50 font-mono font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Rol / Permisos en el Sistema *</label>
                  <select
                    value={editingUser.role || 'cashier'}
                    onChange={e => setEditingUser({ ...editingUser, role: e.target.value as UserRole })}
                    className="w-full px-3 py-2 border rounded-lg bg-slate-50 font-semibold text-slate-900"
                  >
                    <option value="cashier">Cajero / Vendedor (Acceso a POS, Caja y Cobros)</option>
                    <option value="admin">Administrador (Acceso Total + Gestión de Usuarios)</option>
                  </select>
                </div>

                <div className="pt-2">
                  <label className="flex items-center space-x-2 cursor-pointer font-bold text-slate-800">
                    <input
                      type="checkbox"
                      checked={editingUser.active ?? true}
                      onChange={e => setEditingUser({ ...editingUser, active: e.target.checked })}
                      className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
                    />
                    <span>Usuario Habilitado / Activo</span>
                  </label>
                </div>

                <div className="flex items-center justify-end space-x-2 pt-3 border-t">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-md"
                  >
                    Guardar Usuario
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
