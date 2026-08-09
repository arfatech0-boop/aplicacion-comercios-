import React, { useState } from 'react';
import { 
  PackageMinus, 
  Plus, 
  Search, 
  FileSpreadsheet, 
  FileText, 
  CheckCircle2, 
  Trash2, 
  X,
  User,
  PlusCircle,
  Clock
} from 'lucide-react';
import { AppState, CustomerWithdrawal, WithdrawalItem, Customer } from '../types';
import { DataService } from '../services/dataService';
import { exportWithdrawalsExcel } from '../utils/excelExporter';
import { generateWithdrawalReceiptPDF } from '../utils/pdfGenerator';

interface WithdrawalsViewProps {
  appState: AppState;
}

export const WithdrawalsView: React.FC<WithdrawalsViewProps> = ({ appState }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'pending' | 'billed' | 'returned'>('ALL');

  // Bulk Billing Selection State
  const [selectedWithdrawalIds, setSelectedWithdrawalIds] = useState<string[]>([]);

  // Modal to add new withdrawal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [items, setItems] = useState<WithdrawalItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [addQuantity, setAddQuantity] = useState<number>(1);
  const [notes, setNotes] = useState('');
  const [authorizedBy, setAuthorizedBy] = useState('');

  const filteredWithdrawals = appState.withdrawals.filter(w => {
    const matchesStatus = statusFilter === 'ALL' || w.status === statusFilter;
    const q = searchQuery.toLowerCase();
    const matchesSearch = 
      w.customerName.toLowerCase().includes(q) ||
      w.withdrawalNumber.toLowerCase().includes(q) ||
      w.items.some(i => i.productName.toLowerCase().includes(q));
    return matchesStatus && matchesSearch;
  });

  const pendingFilteredWithdrawals = filteredWithdrawals.filter(w => w.status === 'pending');

  const toggleSelectWithdrawal = (id: string) => {
    setSelectedWithdrawalIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAllPending = () => {
    const pendingIds = pendingFilteredWithdrawals.map(w => w.id);
    const allSelected = pendingIds.every(id => selectedWithdrawalIds.includes(id));
    if (allSelected) {
      setSelectedWithdrawalIds(prev => prev.filter(id => !pendingIds.includes(id)));
    } else {
      setSelectedWithdrawalIds(prev => Array.from(new Set([...prev, ...pendingIds])));
    }
  };

  const handleBillSelectedWithdrawals = async () => {
    if (selectedWithdrawalIds.length === 0) return;

    const selectedWithdrawals = appState.withdrawals.filter(w => selectedWithdrawalIds.includes(w.id));
    const totalSelectedAmount = selectedWithdrawals.reduce((sum, w) => sum + w.totalAmount, 0);

    if (!window.confirm(`¿Confirmar facturación unificada de ${selectedWithdrawalIds.length} remito(s) seleccionado(s) por un total de $${totalSelectedAmount.toLocaleString('es-AR')}?`)) {
      return;
    }

    for (const w of selectedWithdrawals) {
      await DataService.updateWithdrawalStatus(w.id, 'billed');
    }

    setSelectedWithdrawalIds([]);
    alert(`¡Se facturaron exitosamente ${selectedWithdrawals.length} remitos por un valor total de $${totalSelectedAmount.toLocaleString('es-AR')}!`);
  };

  const handleAddItemToWithdrawal = () => {
    if (!selectedProductId) return;
    const prod = appState.products.find(p => p.id === selectedProductId);
    if (!prod) return;

    if (prod.stock < addQuantity) {
      alert(`Stock insuficiente. Stock actual disponible: ${prod.stock} ${prod.unit}`);
      return;
    }

    setItems(prev => {
      const existing = prev.find(i => i.productId === prod.id);
      if (existing) {
        return prev.map(i =>
          i.productId === prod.id
            ? { ...i, quantity: i.quantity + addQuantity, totalPrice: (i.quantity + addQuantity) * i.unitPrice }
            : i
        );
      }
      return [
        ...prev,
        {
          productId: prod.id,
          productCode: prod.code,
          productName: prod.name,
          quantity: addQuantity,
          unitPrice: prod.salePrice,
          totalPrice: addQuantity * prod.salePrice
        }
      ];
    });

    setSelectedProductId('');
    setAddQuantity(1);
  };

  const handleRemoveItem = (prodId: string) => {
    setItems(prev => prev.filter(i => i.productId !== prodId));
  };

  const totalWithdrawalAmount = items.reduce((acc, i) => acc + i.totalPrice, 0);

  const handleSaveWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) {
      alert('Debe seleccionar un cliente para registrar el retiro de mercadería.');
      return;
    }
    if (items.length === 0) {
      alert('Debe agregar al menos un producto al retiro.');
      return;
    }

    const nextNumber = `RET-${appState.storeInfo.invoicePrefix}-${(appState.withdrawals.length + 46).toString().padStart(5, '0')}`;

    const newWithdrawal: CustomerWithdrawal = {
      id: `with-${Date.now()}`,
      withdrawalNumber: nextNumber,
      customerId: selectedCustomer.id,
      customerName: selectedCustomer.name,
      date: new Date().toISOString(),
      items: [...items],
      totalAmount: totalWithdrawalAmount,
      status: 'pending',
      notes,
      authorizedBy
    };

    await DataService.registerWithdrawal(newWithdrawal);

    setIsModalOpen(false);
    setItems([]);
    setSelectedCustomer(null);
    setNotes('');
    setAuthorizedBy('');

    alert('¡Retiro de mercadería registrado con éxito y stock descontado!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Mercadería Retirada por Cliente (Remitos)</h1>
          <p className="text-xs text-slate-500">Historial completo de retiros y entregas parciales pendientes de facturación.</p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => exportWithdrawalsExcel(appState.withdrawals)}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Exportar Excel</span>
          </button>
          <button
            onClick={() => {
              setSelectedCustomer(appState.customers[0] || null);
              setItems([]);
              setIsModalOpen(true);
            }}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>+ Registrar Nuevo Retiro</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Buscar por cliente, N° remito o producto..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <span className="text-slate-500 font-semibold">Estado:</span>
          {[
            { id: 'ALL', label: 'Todos' },
            { id: 'pending', label: 'Pendiente Facturar' },
            { id: 'billed', label: 'Facturados' }
          ].map(st => (
            <button
              key={st.id}
              onClick={() => setStatusFilter(st.id as any)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                statusFilter === st.id ? 'bg-indigo-600 text-white font-bold' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bulk Billing Action Bar */}
      {pendingFilteredWithdrawals.length > 0 && (
        <div className="bg-indigo-900 text-white p-3.5 rounded-xl shadow-md flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={
                pendingFilteredWithdrawals.length > 0 &&
                pendingFilteredWithdrawals.every(w => selectedWithdrawalIds.includes(w.id))
              }
              onChange={toggleSelectAllPending}
              className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
            />
            <span className="font-semibold">
              {selectedWithdrawalIds.length > 0
                ? `${selectedWithdrawalIds.length} remito(s) seleccionado(s) para facturar (Total: $${appState.withdrawals.filter(w => selectedWithdrawalIds.includes(w.id)).reduce((sum, w) => sum + w.totalAmount, 0).toLocaleString('es-AR')})`
                : 'Seleccionar todos los remitos pendientes'}
            </span>
          </div>

          {selectedWithdrawalIds.length > 0 && (
            <button
              onClick={handleBillSelectedWithdrawals}
              className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white font-extrabold shadow flex items-center space-x-1.5 transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>🧾 Facturar Remitos Seleccionados ({selectedWithdrawalIds.length})</span>
            </button>
          )}
        </div>
      )}

      {/* Withdrawals List */}
      <div className="space-y-4">
        {filteredWithdrawals.map(withdrawal => {
          const isSelected = selectedWithdrawalIds.includes(withdrawal.id);
          const isPending = withdrawal.status === 'pending';

          return (
            <div
              key={withdrawal.id}
              className={`bg-white rounded-xl shadow-sm border transition-all p-5 space-y-3 ${
                isSelected ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-50/10' : 'border-slate-200'
              }`}
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b pb-3 gap-2">
                <div className="flex items-center space-x-3">
                  {isPending && (
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelectWithdrawal(withdrawal.id)}
                      className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
                    />
                  )}
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-extrabold text-slate-900 text-base">{withdrawal.withdrawalNumber}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                        isPending ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {isPending ? 'Pendiente Facturar' : 'Facturado'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Fecha: <span className="font-medium text-slate-800">{new Date(withdrawal.date).toLocaleString('es-AR')}</span> | Cliente: <span className="font-bold text-slate-900">{withdrawal.customerName}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {isPending && (
                    <button
                      onClick={async () => {
                        if (window.confirm(`¿Marcar remito ${withdrawal.withdrawalNumber} como facturado?`)) {
                          await DataService.updateWithdrawalStatus(withdrawal.id, 'billed');
                        }
                      }}
                      className="px-3 py-1.5 rounded bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-700 font-bold text-xs flex items-center space-x-1 border border-emerald-200 transition-colors"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Facturar Remito</span>
                    </button>
                  )}
                  <button
                    onClick={() => generateWithdrawalReceiptPDF(withdrawal, appState.storeInfo)}
                    className="px-3 py-1.5 rounded bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-600 font-bold text-xs flex items-center space-x-1 transition-colors"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Imprimir Remito PDF</span>
                  </button>
                </div>
              </div>

            {/* Items Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-[10px]">
                  <tr>
                    <th className="px-3 py-2">Código</th>
                    <th className="px-3 py-2">Producto Retirado</th>
                    <th className="px-3 py-2 text-center">Cantidad</th>
                    <th className="px-3 py-2 text-right">Precio Est. ($)</th>
                    <th className="px-3 py-2 text-right">Subtotal ($)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {withdrawal.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="px-3 py-2 font-mono text-slate-500">{item.productCode}</td>
                      <td className="px-3 py-2 font-medium text-slate-800">{item.productName}</td>
                      <td className="px-3 py-2 text-center font-bold text-slate-900">{item.quantity}</td>
                      <td className="px-3 py-2 text-right text-slate-600">${item.unitPrice.toLocaleString('es-AR')}</td>
                      <td className="px-3 py-2 text-right font-bold text-slate-900">${item.totalPrice.toLocaleString('es-AR')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-2 border-t text-xs text-slate-600">
              <span className="italic">{withdrawal.notes ? `Notas: ${withdrawal.notes}` : ''}</span>
              <span className="font-extrabold text-slate-900 text-sm">
                Total Estimado Retirado: ${withdrawal.totalAmount.toLocaleString('es-AR')}
              </span>
            </div>
          </div>
        );
      })}
      </div>

      {/* New Withdrawal Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-900 text-base">Registrar Nuevo Retiro de Mercadería</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveWithdrawal} className="space-y-4">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Cliente que retira *</label>
                <select
                  value={selectedCustomer?.id || ''}
                  onChange={e => {
                    const c = appState.customers.find(cust => cust.id === e.target.value);
                    setSelectedCustomer(c || null);
                  }}
                  className="w-full px-3 py-2 border rounded bg-slate-50 font-medium"
                >
                  <option value="">Seleccionar Cliente</option>
                  {appState.customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.dniCuit})</option>
                  ))}
                </select>
              </div>

              {/* Add Product selector */}
              <div className="p-3 bg-slate-50 rounded-lg border space-y-2">
                <span className="font-bold text-slate-800 block">Agregar Productos a la Entrega</span>
                <div className="flex gap-2">
                  <select
                    value={selectedProductId}
                    onChange={e => setSelectedProductId(e.target.value)}
                    className="flex-1 px-3 py-1.5 border rounded bg-white"
                  >
                    <option value="">Seleccionar Producto del Inventario</option>
                    {appState.products.map(p => (
                      <option key={p.id} value={p.id}>{p.name} (Stock: {p.stock} {p.unit}) - ${p.salePrice}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min="1"
                    value={addQuantity}
                    onChange={e => setAddQuantity(Number(e.target.value))}
                    className="w-20 px-2 py-1.5 border rounded bg-white text-center font-bold"
                  />
                  <button
                    type="button"
                    onClick={handleAddItemToWithdrawal}
                    className="px-3 py-1.5 bg-indigo-600 text-white rounded font-bold hover:bg-indigo-500"
                  >
                    + Añadir
                  </button>
                </div>
              </div>

              {/* Added Items List */}
              <div className="max-h-40 overflow-y-auto border rounded">
                <table className="w-full text-left">
                  <thead className="bg-slate-100 font-semibold text-slate-600">
                    <tr>
                      <th className="p-2">Producto</th>
                      <th className="p-2 text-center">Cant.</th>
                      <th className="p-2 text-right">Total ($)</th>
                      <th className="p-2"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {items.map(item => (
                      <tr key={item.productId}>
                        <td className="p-2 font-medium text-slate-800">{item.productName}</td>
                        <td className="p-2 text-center font-bold">{item.quantity}</td>
                        <td className="p-2 text-right font-bold">${item.totalPrice.toLocaleString('es-AR')}</td>
                        <td className="p-2 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item.productId)}
                            className="text-slate-400 hover:text-red-600"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Autorizado por / Empleado</label>
                  <input
                    type="text"
                    value={authorizedBy}
                    onChange={e => setAuthorizedBy(e.target.value)}
                    className="w-full px-3 py-1.5 border rounded bg-slate-50"
                    placeholder="Ej. Carlos Gómez"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Notas / Observaciones</label>
                  <input
                    type="text"
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    className="w-full px-3 py-1.5 border rounded bg-slate-50"
                    placeholder="Ej. Retirado por chofer de la obra"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center pt-3 border-t">
                <span className="font-bold text-slate-900 text-sm">
                  Total Estimado: ${totalWithdrawalAmount.toLocaleString('es-AR')}
                </span>
                <div className="space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded bg-slate-100 text-slate-700 font-semibold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                  >
                    Guardar y Emitir Remito
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
