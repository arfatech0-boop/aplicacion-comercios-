import React, { useState } from 'react';
import { 
  CreditCard, 
  Plus, 
  Search, 
  FileSpreadsheet, 
  Calendar, 
  AlertCircle, 
  CheckCircle2, 
  X,
  Edit,
  Clock
} from 'lucide-react';
import { AppState, Cheque, ChequeStatus } from '../types';
import { DataService } from '../services/dataService';
import { exportChequesExcel } from '../utils/excelExporter';

interface ChequesViewProps {
  appState: AppState;
}

export const ChequesView: React.FC<ChequesViewProps> = ({ appState }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCheque, setEditingCheque] = useState<Partial<Cheque> | null>(null);

  const filteredCheques = appState.cheques.filter(c => {
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    const q = searchQuery.toLowerCase();
    const matchesSearch = 
      c.number.toLowerCase().includes(q) ||
      c.bank.toLowerCase().includes(q) ||
      c.issuerName.toLowerCase().includes(q) ||
      (c.customerName && c.customerName.toLowerCase().includes(q));
    return matchesStatus && matchesSearch;
  });

  const totalWalletAmount = appState.cheques
    .filter(c => c.status === 'in_wallet' || c.status === 'pending')
    .reduce((acc, c) => acc + c.amount, 0);

  const handleSaveCheque = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCheque?.number || !editingCheque?.bank || !editingCheque?.amount) return;

    const chequeToSave: Cheque = {
      id: editingCheque.id || `chq-${Date.now()}`,
      number: editingCheque.number,
      bank: editingCheque.bank,
      issuerName: editingCheque.issuerName || 'Emisor Desconocido',
      issuerCuit: editingCheque.issuerCuit || '',
      customerId: editingCheque.customerId || '',
      customerName: editingCheque.customerName || '',
      amount: Number(editingCheque.amount),
      issueDate: editingCheque.issueDate || new Date().toISOString(),
      dueDate: editingCheque.dueDate || new Date().toISOString(),
      status: (editingCheque.status as ChequeStatus) || 'in_wallet',
      notes: editingCheque.notes || ''
    };

    await DataService.saveCheque(chequeToSave);
    setIsModalOpen(false);
    setEditingCheque(null);
  };

  const handleChangeStatus = async (cheque: Cheque, newStatus: ChequeStatus) => {
    await DataService.saveCheque({ ...cheque, status: newStatus });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Cartera de Cheques (Ingresos & Vencimientos)</h1>
          <p className="text-xs text-slate-500">Gestione cheques recibidos, fechas de cobro/depósito y su trazabilidad.</p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => exportChequesExcel(appState.cheques)}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Exportar Excel</span>
          </button>
          <button
            onClick={() => {
              setEditingCheque({
                number: '',
                bank: '',
                issuerName: '',
                amount: 0,
                status: 'in_wallet',
                issueDate: new Date().toISOString().slice(0, 10),
                dueDate: new Date().toISOString().slice(0, 10)
              });
              setIsModalOpen(true);
            }}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>+ Ingresar Cheque</span>
          </button>
        </div>
      </div>

      {/* KPI Wallet Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-xl p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-semibold text-indigo-300 tracking-wider">Monto Total de Cheques en Cartera</span>
          <div className="text-3xl font-extrabold text-white mt-1">
            ${totalWalletAmount.toLocaleString('es-AR')}
          </div>
        </div>
        <div className="text-xs text-slate-300">
          <span className="font-bold text-white">{appState.cheques.filter(c => c.status === 'in_wallet').length} cheques</span> listos para depositar o cobrar
        </div>
      </div>

      {/* Filter & Search */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Buscar por N° cheque, banco o emisor..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center space-x-2 text-xs overflow-x-auto">
          <span className="text-slate-500 font-semibold">Estado:</span>
          {[
            { id: 'ALL', label: 'Todos' },
            { id: 'in_wallet', label: 'En Cartera' },
            { id: 'cashed', label: 'Cobrados' },
            { id: 'deposited', label: 'Depositados' },
            { id: 'rejected', label: 'Rechazados' }
          ].map(st => (
            <button
              key={st.id}
              onClick={() => setStatusFilter(st.id)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
                statusFilter === st.id ? 'bg-indigo-600 text-white font-bold' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Cheques Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">N° Cheque</th>
                <th className="px-4 py-3">Banco</th>
                <th className="px-4 py-3">Emisor / Cliente</th>
                <th className="px-4 py-3 text-right">Monto ($)</th>
                <th className="px-4 py-3 text-center">Fecha Emisión</th>
                <th className="px-4 py-3 text-center">Fecha Cobro/Venc.</th>
                <th className="px-4 py-3 text-center">Estado</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCheques.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-slate-400">
                    No se encontraron cheques registrados.
                  </td>
                </tr>
              ) : (
                filteredCheques.map(cheque => {
                  const isDueSoon = new Date(cheque.dueDate).getTime() - Date.now() < 3 * 86400000 && cheque.status === 'in_wallet';

                  return (
                    <tr key={cheque.id} className={`hover:bg-slate-50 transition-colors ${isDueSoon ? 'bg-amber-50/50' : ''}`}>
                      <td className="px-4 py-3 font-mono font-bold text-slate-900">{cheque.number}</td>
                      <td className="px-4 py-3 font-medium text-slate-800">{cheque.bank}</td>
                      <td className="px-4 py-3">
                        <span className="font-bold text-slate-900 block">{cheque.issuerName}</span>
                        {cheque.customerName && <span className="text-[11px] text-slate-500">Cliente: {cheque.customerName}</span>}
                      </td>
                      <td className="px-4 py-3 text-right font-extrabold text-slate-900">${cheque.amount.toLocaleString('es-AR')}</td>
                      <td className="px-4 py-3 text-center text-slate-500">{new Date(cheque.issueDate).toLocaleDateString('es-AR')}</td>
                      <td className="px-4 py-3 text-center font-semibold text-slate-800">
                        {new Date(cheque.dueDate).toLocaleDateString('es-AR')}
                        {isDueSoon && <span className="block text-[10px] text-amber-600 font-bold">¡Próximo a Vencer!</span>}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                          cheque.status === 'in_wallet' ? 'bg-indigo-100 text-indigo-800' :
                          cheque.status === 'cashed' ? 'bg-emerald-100 text-emerald-800' :
                          cheque.status === 'deposited' ? 'bg-blue-100 text-blue-800' :
                          cheque.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {cheque.status === 'in_wallet' ? 'En Cartera' : cheque.status === 'cashed' ? 'Cobrado' : cheque.status === 'deposited' ? 'Depositado' : cheque.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right space-x-1 whitespace-nowrap">
                        {cheque.status === 'in_wallet' && (
                          <>
                            <button
                              onClick={() => handleChangeStatus(cheque, 'cashed')}
                              className="px-2 py-1 rounded bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold text-[11px]"
                            >
                              Cobrado
                            </button>
                            <button
                              onClick={() => handleChangeStatus(cheque, 'deposited')}
                              className="px-2 py-1 rounded bg-blue-100 hover:bg-blue-200 text-blue-800 font-bold text-[11px]"
                            >
                              Depositar
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => {
                            setEditingCheque(cheque);
                            setIsModalOpen(true);
                          }}
                          className="p-1 text-slate-400 hover:text-indigo-600"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cheque Modal */}
      {isModalOpen && editingCheque && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-xs">
            <h3 className="font-bold text-slate-900 text-base">Ingresar / Editar Cheque</h3>

            <form onSubmit={handleSaveCheque} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">N° de Cheque *</label>
                  <input
                    type="text"
                    required
                    value={editingCheque.number || ''}
                    onChange={e => setEditingCheque({ ...editingCheque, number: e.target.value })}
                    className="w-full px-3 py-1.5 border rounded bg-slate-50"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Banco Emisor *</label>
                  <input
                    type="text"
                    required
                    value={editingCheque.bank || ''}
                    onChange={e => setEditingCheque({ ...editingCheque, bank: e.target.value })}
                    className="w-full px-3 py-1.5 border rounded bg-slate-50"
                    placeholder="Ej. Banco Galicia"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Emisor (Razón Social / Nombre) *</label>
                <input
                  type="text"
                  required
                  value={editingCheque.issuerName || ''}
                  onChange={e => setEditingCheque({ ...editingCheque, issuerName: e.target.value })}
                  className="w-full px-3 py-1.5 border rounded bg-slate-50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Monto ($) *</label>
                  <input
                    type="number"
                    min="1"
                    step="any"
                    required
                    value={editingCheque.amount || ''}
                    onChange={e => setEditingCheque({ ...editingCheque, amount: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 border rounded bg-slate-50 font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Estado</label>
                  <select
                    value={editingCheque.status || 'in_wallet'}
                    onChange={e => setEditingCheque({ ...editingCheque, status: e.target.value as any })}
                    className="w-full px-3 py-1.5 border rounded bg-slate-50"
                  >
                    <option value="in_wallet">En Cartera</option>
                    <option value="cashed">Cobrado</option>
                    <option value="deposited">Depositado</option>
                    <option value="rejected">Rechazado</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Fecha Emisión</label>
                  <input
                    type="date"
                    value={editingCheque.issueDate ? editingCheque.issueDate.slice(0, 10) : ''}
                    onChange={e => setEditingCheque({ ...editingCheque, issueDate: new Date(e.target.value).toISOString() })}
                    className="w-full px-3 py-1.5 border rounded bg-slate-50"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Fecha Cobro / Venc.</label>
                  <input
                    type="date"
                    value={editingCheque.dueDate ? editingCheque.dueDate.slice(0, 10) : ''}
                    onChange={e => setEditingCheque({ ...editingCheque, dueDate: new Date(e.target.value).toISOString() })}
                    className="w-full px-3 py-1.5 border rounded bg-slate-50"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded bg-slate-100 text-slate-700 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
                >
                  Guardar Cheque
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
