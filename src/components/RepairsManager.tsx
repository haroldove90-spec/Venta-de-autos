import React, { useState } from 'react';
import { Vehicle, Expense, UserRole } from '../types';
import { 
  Wrench, Plus, Archive, ChevronRight, Activity, 
  ShieldAlert, CheckCircle2, Trash2, Edit2, X, AlertCircle 
} from 'lucide-react';
import { motion } from 'motion/react';

interface RepairsManagerProps {
  vehicles: Vehicle[];
  expenses: Expense[];
  onAddExpense: (expense: Omit<Expense, 'id'>) => void;
  onUpdateExpense?: (updated: Expense) => void;
  onDeleteExpense?: (id: string) => void;
  role?: UserRole;
}

export default function RepairsManager({ 
  vehicles, 
  expenses, 
  onAddExpense, 
  onUpdateExpense, 
  onDeleteExpense,
  role 
}: RepairsManagerProps) {
  const [selectedVin, setSelectedVin] = useState('');
  const [expenseType, setExpenseType] = useState<'Hojalateria' | 'Mecanica' | 'Clima' | 'Estetica' | 'Otros'>('Mecanica');
  const [concept, setConcept] = useState('');
  const [provider, setProvider] = useState('');
  const [cost, setCost] = useState(0);

  // Editing state
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);

  // Filter vehicles currently in some repair state
  const vehiclesInRepair = vehicles.filter(v => 
    v.status === 'Hojalateria' || 
    v.status === 'Mecanica' || 
    v.status === 'Clima' || 
    v.status === 'Estetica'
  );

  const handleStartEditExpense = (expense: Expense) => {
    setEditingExpenseId(expense.id);
    setSelectedVin(expense.vin);
    setExpenseType(expense.type);
    setConcept(expense.concept);
    setProvider(expense.provider);
    setCost(expense.cost);
  };

  const handleCancelEdit = () => {
    setEditingExpenseId(null);
    setSelectedVin('');
    setConcept('');
    setProvider('');
    setCost(0);
  };

  const handleAddExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVin || !concept || !provider || cost <= 0) return;

    if (editingExpenseId && onUpdateExpense) {
      // Execute edit
      onUpdateExpense({
        id: editingExpenseId,
        vin: selectedVin,
        type: expenseType,
        concept,
        provider,
        cost: Number(cost),
        date: new Date().toISOString().slice(0, 10)
      });
      setEditingExpenseId(null);
    } else {
      // Execute insert
      onAddExpense({
        vin: selectedVin,
        type: expenseType,
        concept,
        provider,
        cost: Number(cost),
        date: new Date().toISOString().slice(0, 10)
      });
    }

    // Reset fields
    setConcept('');
    setProvider('');
    setCost(0);
  };

  const isAdmin = role === 'Administrador';

  // Desglose por categoría – "hojalatería, mecánica, clima, cristales (u otros)"
  const sumByCategory = (cat: 'Hojalateria' | 'Mecanica' | 'Clima' | 'Estetica' | 'Otros') => {
    return expenses.filter(e => e.type === cat).reduce((sum, e) => sum + e.cost, 0);
  };

  return (
    <div className="space-y-6" id="repairs-workspace">
      
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-base font-sans font-bold text-white tracking-tight">Consola de Control de Taller, Hojalatería y Clima</h2>
          <p className="text-[11px] text-slate-500 mt-0.5">Control pormenorizado de refacciones mecánicas, costos de materiales de laminado e insumos globales por vehículo.</p>
        </div>
      </div>

      {/* Categories summary metrics cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3" id="categories-summary-grid">
        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl text-center">
          <span className="text-[9px] text-amber-500 font-bold uppercase tracking-wider block">Hojalatería</span>
          <span className="text-xs font-mono font-bold text-slate-100 block mt-1">${sumByCategory('Hojalateria').toLocaleString('es-MX')}</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl text-center">
          <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider block">Mecánica</span>
          <span className="text-xs font-mono font-bold text-slate-100 block mt-1">${sumByCategory('Mecanica').toLocaleString('es-MX')}</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl text-center">
          <span className="text-[9px] text-blue-400 font-bold uppercase tracking-wider block">Climas/Aire</span>
          <span className="text-xs font-mono font-bold text-slate-100 block mt-1">${sumByCategory('Clima').toLocaleString('es-MX')}</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl text-center">
          <span className="text-[9px] text-purple-400 font-bold uppercase tracking-wider block">Estética / Cristales</span>
          <span className="text-xs font-mono font-bold text-slate-100 block mt-1">${sumByCategory('Estetica').toLocaleString('es-MX')}</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl text-center col-span-2 md:col-span-1">
          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Total Invertido Taller En Proceso</span>
          <span className="text-xs font-mono font-extrabold text-rose-400 block mt-1">
            ${expenses.reduce((sum, e) => sum + e.cost, 0).toLocaleString('es-MX')} MXN
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Form to log or EDIT dynamic repair expenses */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl lg:col-span-1 shadow-xl flex flex-col justify-between h-fit">
          <div>
            <div className={`flex items-center gap-2 border-b pb-3 mb-4 ${editingExpenseId ? 'border-amber-500/30' : 'border-slate-800'}`}>
              <Wrench className={`w-5 h-5 ${editingExpenseId ? 'text-amber-500' : 'text-emerald-400'}`} />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                {editingExpenseId ? 'Editar Cargo del Taller' : 'Registrar Gasto del Taller'}
              </h3>
            </div>

            <form onSubmit={handleAddExpenseSubmit} className="space-y-4">
              
              {/* Select vehicle by VIN */}
              <div className="space-y-1.5 text-xs">
                <label className="text-[10px] text-slate-400 font-bold uppercase">Seleccionar Vehículo Activo</label>
                <select
                  required
                  value={selectedVin}
                  onChange={(e) => setSelectedVin(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-lg p-2.5 text-slate-300 text-xs outline-none"
                >
                  <option value="">-- Elige un VIN --</option>
                  {vehiclesInRepair.map((v) => (
                    <option key={v.id} value={v.vin}>
                      VIN {v.vin} - {v.brand} {v.model} ({v.status})
                    </option>
                  ))}
                  {/* Append all non-sold vehicles as backup */}
                  {vehicles.filter(v => v.status === 'Listo para Venta' || v.status === 'Vendido').map((v) => (
                    <option key={v.id} value={v.vin}>
                      VIN {v.vin} - {v.brand} {v.model} ({v.status === 'Vendido' ? 'Vendido' : 'Stock'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Expense Type / Category */}
              <div className="space-y-1.5 text-xs">
                <label className="text-[10px] text-slate-400 font-bold uppercase">Especialidad de Taller</label>
                <select
                  value={expenseType}
                  onChange={(e) => setExpenseType(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-lg p-2.5 text-slate-300 text-xs outline-none"
                >
                  <option value="Hojalateria">Hojalatería (Taller 1)</option>
                  <option value="Mecanica">Mecánica (Taller 2)</option>
                  <option value="Clima">Clima (Taller 3)</option>
                  <option value="Estetica">Estética / Cristales / Pintura</option>
                  <option value="Otros">Otros Cargos Administrativos</option>
                </select>
              </div>

              {/* Concept description */}
              <div className="space-y-1.5 text-xs">
                <label className="text-[10px] text-slate-400 font-bold uppercase">Concepto / Refacción Adquirida</label>
                <input 
                  type="text" required placeholder="Bujías de iridio, bomba de agua, hojalateada"
                  value={concept} onChange={(e) => setConcept(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-lg p-2.5 text-xs text-white outline-none"
                />
              </div>

              {/* Provider */}
              <div className="space-y-1.5 text-xs">
                <label className="text-[10px] text-slate-400 font-bold uppercase">Taller o Refaccionaria (Proveedor)</label>
                <input 
                  type="text" required placeholder="Autozone, Laminados El Chapo"
                  value={provider} onChange={(e) => setProvider(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-lg p-2.5 text-xs text-white outline-none"
                />
              </div>

              {/* Cost in MXN */}
              <div className="space-y-1.5 text-xs">
                <label className="text-[10px] text-emerald-400 font-bold uppercase">Costo Material o Refacción ($ MXN)</label>
                <input 
                  type="number" required placeholder="1400"
                  value={cost > 0 ? cost : ''} onChange={(e) => setCost(Number(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-emerald-950/40 focus:border-emerald-500 rounded-lg p-2.5 font-mono text-emerald-400 text-xs outline-none font-bold"
                />
              </div>

              <div className="flex gap-2">
                {editingExpenseId && (
                  <button
                    type="button" onClick={handleCancelEdit}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-2.5 rounded-xl text-xs cursor-pointer text-center"
                  >
                    X Cancelar
                  </button>
                )}
                <button
                  type="submit"
                  className={`flex-2 w-full text-white font-semibold py-2.5 rounded-xl text-xs flex justify-center items-center gap-1.5 cursor-pointer transition-all ${
                    editingExpenseId ? 'bg-amber-600 hover:bg-amber-500 shadow-md shadow-amber-600/10' : 'bg-blue-600 hover:bg-blue-500 shadow shadow-blue-600/10'
                  }`}
                >
                  <Wrench className="w-4 h-4" />
                  {editingExpenseId ? 'Guardar Gasto' : 'Registrar Gasto de Reparación'}
                </button>
              </div>

            </form>
          </div>

          <div className="bg-slate-950 border border-slate-850 p-3 rounded-lg border border-slate-800 text-[10px] text-slate-500 mt-4 leading-relaxed">
            Los gastos de taller se suman automáticamente al Costo Real Total de la unidad en tiempo real para auditoría consolidada.
          </div>
        </div>

        {/* Detailed repairs logs overview (Bitácora) */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Archive className="w-5 h-5 text-blue-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Bitácora Activa de Refacciones</h3>
            </div>
            <Activity className="w-4 h-4 text-slate-600 animate-pulse" />
          </div>

          {/* List layout */}
          <div className="overflow-y-auto max-h-[500px] space-y-3 pr-1 scrollbar-thin scrollbar-thumb-slate-800" id="repairs-list-wrapper">
            {expenses.length === 0 ? (
              <div className="py-12 border-2 border-dashed border-slate-800/80 rounded-xl text-center text-slate-600 text-xs">
                Aún no existen registros de gastos para el taller.
              </div>
            ) : (
              expenses.map((expense) => {
                const correspondingVehicle = vehicles.find(v => v.vin === expense.vin);
                return (
                  <div key={expense.id} className="bg-slate-950 border border-slate-850 p-4 rounded-xl flex items-start justify-between gap-4 hover:border-slate-800 transition-colors">
                    <div className="flex gap-3">
                      <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 shrink-0 text-slate-400">
                        <Wrench className="w-4 h-4" />
                      </div>
                      <div className="space-y-1">
                        <span className={`px-2 py-0.5 rounded-full font-mono text-[9px] font-bold ${
                          expense.type === 'Hojalateria' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/10' :
                          expense.type === 'Mecanica' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/10' :
                          expense.type === 'Clima' ? 'bg-blue-500/15 text-blue-400 border border-blue-500/10' :
                          expense.type === 'Estetica' ? 'bg-purple-500/15 text-purple-400 border border-purple-500/10' :
                          'bg-slate-800 text-slate-400 border border-slate-700/30'
                        }`}>
                          {expense.type}
                        </span>
                        
                        <div className="text-xs font-bold text-white mt-1">
                          {expense.concept}
                        </div>
                        
                        <div className="text-[10px] text-slate-400 leading-relaxed font-semibold">
                          Proveedor: {expense.provider} • Auto ref: {correspondingVehicle ? `${correspondingVehicle.brand} ${correspondingVehicle.model}` : 'Vehículo general'}
                        </div>
                        
                        <div className="text-[9px] font-mono text-slate-600 font-bold">
                          VIN: {expense.vin} • Registrado el {expense.date}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0 flex flex-col items-end gap-1.5">
                      <span className="text-xs font-mono font-bold text-rose-400">
                        -${expense.cost.toLocaleString('es-MX')} <span className="text-[8px] text-slate-500 uppercase">MXN</span>
                      </span>
                      
                      {isAdmin && (
                        <div className="flex items-center gap-1.5 mt-2">
                          <button
                            onClick={() => handleStartEditExpense(expense)}
                            className="p-1 px-2 border border-amber-500/20 text-amber-500 hover:bg-amber-500 hover:text-white rounded text-[10px] font-bold cursor-pointer transition-colors"
                            title="Editar este costo"
                          >
                            Editar
                          </button>
                          
                          {onDeleteExpense && (
                            <button
                              onClick={() => {
                                if (confirm('¿Confirmado que desea vaciar este cargo de taller de la bitácora contable?')) {
                                  onDeleteExpense(expense.id);
                                }
                              }}
                              className="p-1.5 border border-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white rounded cursor-pointer transition-colors"
                              title="Eliminar este costo"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
