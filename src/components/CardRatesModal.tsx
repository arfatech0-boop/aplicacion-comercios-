import React, { useState } from 'react';
import { CreditCard, Plus, Trash2, Check, X, Percent, AlertCircle, Save } from 'lucide-react';
import { StoreInfo, CardInterestPlan } from '../types';
import { DataService } from '../services/dataService';

interface CardRatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  storeInfo: StoreInfo;
}

export const CardRatesModal: React.FC<CardRatesModalProps> = ({
  isOpen,
  onClose,
  storeInfo
}) => {
  const [plans, setPlans] = useState<CardInterestPlan[]>(
    storeInfo.cardInterestPlans?.length
      ? storeInfo.cardInterestPlans
      : [
          { id: 'p1', name: 'Débito / 1 Pago (Sin Recargo)', surchargePercent: 0, description: 'Debito / QR sin recargo' },
          { id: 'p2', name: 'Visa / Mastercard (1 Pago)', surchargePercent: 5, description: 'Crédito contado' },
          { id: 'p3', name: 'Mercado Pago / QR', surchargePercent: 8, description: 'Tasa cobro digital' },
          { id: 'p4', name: '3 Cuotas (Cuota Simple)', surchargePercent: 15, description: 'Plan nacional 3 pagos' },
          { id: 'p5', name: '6 Cuotas Bancarias', surchargePercent: 28, description: 'Plan banco 6 pagos' },
          { id: 'p6', name: '12 Cuotas Larga Duración', surchargePercent: 42, description: 'Plan banco 12 pagos' },
        ]
  );

  const [newName, setNewName] = useState('');
  const [newPercent, setNewPercent] = useState<number>(10);
  const [newDescription, setNewDescription] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen) return null;

  const handleAddPlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newPlan: CardInterestPlan = {
      id: `plan-${Date.now()}`,
      name: newName.trim(),
      surchargePercent: Math.max(0, Number(newPercent) || 0),
      description: newDescription.trim() || undefined
    };

    setPlans([...plans, newPlan]);
    setNewName('');
    setNewPercent(10);
    setNewDescription('');
  };

  const handleRemovePlan = (id: string) => {
    setPlans(plans.filter(p => p.id !== id));
  };

  const handleUpdatePercent = (id: string, newPct: number) => {
    setPlans(
      plans.map(p => (p.id === id ? { ...p, surchargePercent: Math.max(0, newPct) } : p))
    );
  };

  const handleSave = () => {
    DataService.updateStoreInfo({
      ...storeInfo,
      cardInterestPlans: plans,
      // Update default base card surcharge to first non-zero or default
      cardSurchargePercent: plans.find(p => p.surchargePercent > 0)?.surchargePercent || storeInfo.cardSurchargePercent || 10
    });
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-3 z-50 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400 shadow-xs">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold tracking-tight">
                Planes de Cuotas & Recargos de Tarjeta
              </h2>
              <p className="text-xs text-indigo-200">
                Actualice los intereses por banco, Posnet o cuotas en cualquier momento.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Informative Banner */}
        <div className="bg-amber-50 border-b border-amber-200 p-3 sm:px-5 flex items-start space-x-2 text-xs text-amber-900">
          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <p>
            En Argentina, las tasas de financiación cambian periódicamente. Modifique los porcentajes existentes o agregue nuevos planes (ej. <i>Cuota Simple, Galicia, MP</i>) para tener los valores listos al cobrar en el POS.
          </p>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* Active Plans List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                Planes y Cuotas Configuradas ({plans.length})
              </h3>
              <span className="text-[11px] text-slate-500">
                Modifique los porcentajes directamente en los campos
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {plans.map(plan => (
                <div
                  key={plan.id}
                  className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col justify-between space-y-2 hover:border-indigo-300 transition-all shadow-xs"
                >
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 pr-2">
                      <span className="font-bold text-xs text-slate-900 block truncate">
                        {plan.name}
                      </span>
                      {plan.description && (
                        <span className="text-[10px] text-slate-500 block truncate">
                          {plan.description}
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemovePlan(plan.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                      title="Eliminar plan"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center space-x-2 pt-1 border-t border-slate-200">
                    <span className="text-[11px] font-semibold text-slate-600">% Recargo:</span>
                    <div className="relative flex-1">
                      <input
                        type="number"
                        min="0"
                        max="200"
                        value={plan.surchargePercent}
                        onChange={e => handleUpdatePercent(plan.id, Number(e.target.value))}
                        className="w-full px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <span className="absolute right-2 top-1.5 text-xs text-slate-400 font-bold">
                        %
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form to Add New Plan */}
          <form onSubmit={handleAddPlan} className="bg-indigo-50/70 border border-indigo-200 rounded-xl p-4 space-y-3">
            <h4 className="text-xs font-extrabold text-indigo-950 flex items-center space-x-1.5">
              <Plus className="w-4 h-4 text-indigo-600" />
              <span>Agregar Nuevo Plan o Tasa de Tarjeta</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="sm:col-span-2">
                <label className="text-[10px] font-bold text-slate-700 block mb-0.5">
                  Nombre del Plan / Banco / Cuotas
                </label>
                <input
                  type="text"
                  placeholder="Ej: Cuota Simple 3 Pagos, Naranja 1 Pago..."
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-700 block mb-0.5">
                  % Recargo / Interés
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="200"
                    value={newPercent}
                    onChange={e => setNewPercent(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <span className="absolute right-2.5 top-1.5 text-xs text-slate-400 font-bold">%</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <input
                type="text"
                placeholder="Descripción opcional (ej: TNA 45%, Posnet directo)"
                value={newDescription}
                onChange={e => setNewDescription(e.target.value)}
                className="flex-1 mr-2 px-3 py-1 bg-white border border-slate-200 rounded-lg text-[11px] text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="submit"
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Agregar</span>
              </button>
            </div>
          </form>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-100 text-xs font-bold transition-colors"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white rounded-xl text-xs font-extrabold shadow-md shadow-indigo-500/20 transition-all flex items-center space-x-2"
          >
            {isSaved ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                <span>¡Guardado Correctamente!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Guardar Intereses y Cuotas</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
