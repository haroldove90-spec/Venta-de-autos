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
  const [expenseType, setExpenseType] = useState<'Hojalateria' | 'Mecanica' | 'Clima' | 'Estetica' | 'Otros' | 'Cristales'>('Mecanica');
  const [subtype, setSubtype] = useState<'Mano de Obra' | 'Refacciones'>('Refacciones');
  const [concept, setConcept] = useState('');
  const [provider, setProvider] = useState('');
  const [cost, setCost] = useState(0);

  // Editing state
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);

  // Filter vehicles currently in some repair state or lot stock
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
    setSubtype(expense.subtype || 'Refacciones');
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
    setSubtype('Refacciones');
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
        subtype,
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
        subtype,
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
    setSubtype('Refacciones');
  };

  // Full permission authorized for Administrador AND Jefe de Taller (Taller) 
  const canModifyExpenses = role === 'Administrador' || role === 'Taller';

  // Desglose por categoría
  const sumByCategory = (cat: 'Hojalateria' | 'Mecanica' | 'Clima' | 'Estetica' | 'Otros' | 'Cristales') => {
    return expenses.filter(e => e.type === cat).reduce((sum, e) => sum + e.cost, 0);
  };

  // Human category names lookup
  const getCategoryLabel = (type: string) => {
    switch (type) {
      case 'Hojalateria': return 'Hojalatería y pintura';
      case 'Mecanica': return 'Mecánica general y suspensión';
      case 'Clima': return 'Sistema de aire acondicionado (clima)';
      case 'Cristales': return 'Cristales / Vidrios';
      case 'Estetica': return 'Estética / Detallado';
      default: return 'Otros / Varios';
    }
  };

  return (
    <div className="space-y-6" id="repairs-workspace">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-lg font-sans font-black text-slate-800 tracking-tight flex items-center gap-2">
            Módulo de Control de Gastos de Taller y Reparaciones
            <span className="text-xs bg-emerald-50 text-emerald-600 border border-emerald-100 py-0.5 px-2.5 rounded-full font-mono font-bold uppercase">
              Acceso Completo
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Registro en bitácora táctica de repuestos, mano de obra y refacciones asociadas por número de serie (VIN).
          </p>
        </div>
        
        <div className="flex items-center gap-2 text-xs bg-white border border-slate-200 py-2 px-3 rounded-xl shadow-sm text-slate-600">
          <Wrench className="w-4 h-4 text-emerald-500" />
          <span className="font-semibold">Balanza de Talleres Activos</span>
        </div>
      </div>

      {/* Categories summary metrics cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3" id="categories-summary-grid">
        <div className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-sm hover:border-slate-300 transition-all text-center">
          <span className="text-[10px] text-amber-600 font-bold uppercase tracking-wider block">Hojalatería y Pintura</span>
          <span className="text-sm font-mono font-black text-slate-800 block mt-1.5">${sumByCategory('Hojalateria').toLocaleString('es-MX')}</span>
        </div>
        <div className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-sm hover:border-slate-300 transition-all text-center">
          <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider block">Mecánica y Suspensión</span>
          <span className="text-sm font-mono font-black text-slate-800 block mt-1.5">${sumByCategory('Mecanica').toLocaleString('es-MX')}</span>
        </div>
        <div className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-sm hover:border-slate-300 transition-all text-center">
          <span className="text-[10px] text-cyan-600 font-bold uppercase tracking-wider block">Aire / Climas</span>
          <span className="text-sm font-mono font-black text-slate-800 block mt-1.5">${sumByCategory('Clima').toLocaleString('es-MX')}</span>
        </div>
        <div className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-sm hover:border-slate-300 transition-all text-center">
          <span className="text-[10px] text-purple-600 font-bold uppercase tracking-wider block">Cristales / Vidrios</span>
          <span className="text-sm font-mono font-black text-slate-800 block mt-1.5">${sumByCategory('Cristales').toLocaleString('es-MX')}</span>
        </div>
        <div className="bg-gradient-to-tr from-slate-800 to-slate-900 border border-slate-700/30 p-4 rounded-2xl text-center col-span-2 md:col-span-1 shadow-md">
          <span className="text-[10px] text-slate-300 font-bold uppercase tracking-wider block">Total Invertido Taller</span>
          <span className="text-sm font-mono font-extrabold text-emerald-400 block mt-1.5">
            ${expenses.reduce((sum, e) => sum + e.cost, 0).toLocaleString('es-MX')} MXN
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Form to log or EDIT dynamic repair expenses */}
        <div className="bg-white border border-slate-200 p-5 rounded-3xl lg:col-span-1 shadow-sm flex flex-col justify-between h-fit">
          <div>
            <div className={`flex items-center gap-2 border-b pb-3 mb-4 ${editingExpenseId ? 'border-amber-500/30' : 'border-slate-100'}`}>
              <Wrench className={`w-5 h-5 ${editingExpenseId ? 'text-amber-500' : 'text-emerald-600'}`} />
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                {editingExpenseId ? 'Editar Cargo del Taller' : 'Registrar Gasto del Taller'}
              </h3>
            </div>

            {canModifyExpenses ? (
              <form onSubmit={handleAddExpenseSubmit} className="space-y-4">
                
                {/* Select vehicle by VIN */}
                <div className="space-y-1 text-xs">
                  <label className="text-[10px] text-slate-500 font-bold uppercase">Seleccionar Vehículo Activo (Asociación por ID / VIN)</label>
                  <select
                    required
                    value={selectedVin}
                    onChange={(e) => setSelectedVin(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-xl p-2.5 text-slate-800 text-xs outline-none transition-all"
                  >
                    <option value="">-- Seleccionar número de serie / VIN --</option>
                    {vehiclesInRepair.map((v) => (
                      <option key={v.id} value={v.vin}>
                        {v.brand} {v.model} - VIN {v.vin} ({v.status})
                      </option>
                    ))}
                    {/* Append all non-sold vehicles as backup */}
                    {vehicles.filter(v => v.status === 'Listo para Venta' || v.status === 'Vendido').map((v) => (
                      <option key={v.id} value={v.vin}>
                        {v.brand} {v.model} - VIN {v.vin} ({v.status === 'Vendido' ? 'Vendido' : 'Stock'})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Expense Type / Category */}
                <div className="space-y-1 text-xs">
                  <label className="text-[10px] text-slate-500 font-bold uppercase">Especialidad de Taller</label>
                  <select
                    value={expenseType}
                    onChange={(e) => setExpenseType(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-xl p-2.5 text-slate-800 text-xs outline-none transition-all"
                  >
                    <option value="Hojalateria">Hojalatería y pintura</option>
                    <option value="Mecanica">Mecánica general y suspensión</option>
                    <option value="Clima">Sistema de aire acondicionado (clima)</option>
                    <option value="Cristales">Cristales / Vidrios</option>
                    <option value="Estetica">Estética y pulido</option>
                    <option value="Otros">Otros</option>
                  </select>
                </div>

                {/* Categorización Obligatoria entre Mano de Obra y Refacciones */}
                <div className="space-y-1.5 text-xs">
                  <label className="text-[10px] text-slate-500 font-bold uppercase block">Clasificación Obligatoria de Costo</label>
                  <div className="grid grid-cols-2 gap-2 bg-slate-50 p-1 rounded-xl border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setSubtype('Refacciones')}
                      className={`text-[10px] font-bold py-1.5 rounded-lg transition-all cursor-pointer text-center ${
                        subtype === 'Refacciones' 
                          ? 'bg-emerald-600 text-white shadow-sm' 
                          : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100'
                      }`}
                    >
                      Refacciones / Componentes
                    </button>
                    <button
                      type="button"
                      onClick={() => setSubtype('Mano de Obra')}
                      className={`text-[10px] font-bold py-1.5 rounded-lg transition-all cursor-pointer text-center ${
                        subtype === 'Mano de Obra' 
                          ? 'bg-emerald-600 text-white shadow-sm' 
                          : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100'
                      }`}
                    >
                      Mano de Obra (Labor)
                    </button>
                  </div>
                </div>

                {/* Concept description */}
                <div className="space-y-1 text-xs">
                  <label className="text-[10px] text-slate-500 font-bold uppercase">Concepto / Refacción Adquirida</label>
                  <input 
                    type="text" required placeholder="Bujías de iridio, bomba de agua, hojalateada"
                    value={concept} onChange={(e) => setConcept(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-xl p-2.5 text-xs text-slate-850 outline-none transition-all"
                  />
                </div>

                {/* Provider */}
                <div className="space-y-1 text-xs">
                  <label className="text-[10px] text-slate-500 font-bold uppercase">Taller o Refaccionaria (Proveedor)</label>
                  <input 
                    type="text" required placeholder="Autozone, Laminados El Chapo"
                    value={provider} onChange={(e) => setProvider(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-xl p-2.5 text-xs text-slate-850 outline-none transition-all"
                  />
                </div>

                {/* Cost in MXN */}
                <div className="space-y-1 text-xs">
                  <label className="text-[10px] text-emerald-600 font-bold uppercase">Costo ($ MXN)</label>
                  <input 
                    type="number" required placeholder="1400"
                    value={cost > 0 ? cost : ''} onChange={(e) => setCost(Number(e.target.value) || 0)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-xl p-2.5 font-mono text-emerald-600 text-xs outline-none font-bold"
                  />
                </div>

                <div className="flex gap-2">
                  {editingExpenseId && (
                    <button
                      type="button" onClick={handleCancelEdit}
                      className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-xs cursor-pointer text-center"
                    >
                      Cancelar
                    </button>
                  )}
                  <button
                    type="submit"
                    className={`flex-2 w-full text-white font-bold py-2.5 rounded-xl text-xs flex justify-center items-center gap-1.5 cursor-pointer transition-all ${
                      editingExpenseId ? 'bg-amber-600 hover:bg-amber-500 shadow-md shadow-amber-605/10' : 'bg-emerald-600 hover:bg-emerald-505 shadow shadow-emerald-600/10'
                    }`}
                  >
                    <Wrench className="w-4 h-4" />
                    {editingExpenseId ? 'Guardar Gasto' : 'Registrar Gasto'}
                  </button>
                </div>

              </form>
            ) : (
              <div className="p-4 bg-amber-50 border border-amber-200 text-amber-700 text-xs rounded-xl flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Privilegios Insuficientes</span>
                  <span className="mt-0.5 block text-[11px]">Su rol actual de <strong>{role}</strong> no cuenta con autorización de escritura en esta bitácora financiera. Solo el Jefe de Taller y Administrador General pueden modificar rubros del taller.</span>
                </div>
              </div>
            )}
          </div>

          <div className="bg-slate-50 border border-slate-150 p-3 rounded-xl text-[10px] text-slate-500 mt-5 leading-relaxed font-medium">
            Los gastos de taller se suman automáticamente al Costo Real Total del vehículo en tiempo real para auditoría consolidada.
          </div>
        </div>

        {/* Detailed repairs logs overview (Bitácora) */}
        <div className="bg-white border border-slate-200 p-5 rounded-3xl lg:col-span-2 space-y-4 shadow-sm">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Archive className="w-5 h-5 text-indigo-650" />
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Bitácora Activa de Refacciones y Mano de Obra</h3>
            </div>
            <Activity className="w-4 h-4 text-emerald-500 animate-pulse" />
          </div>

          {/* List layout */}
          <div className="overflow-y-auto max-h-[500px] space-y-3 pr-1 scrollbar-thin scrollbar-thumb-slate-200" id="repairs-list-wrapper">
            {expenses.length === 0 ? (
              <div className="py-12 border-2 border-dashed border-slate-200 rounded-2xl text-center text-slate-400 text-xs">
                Aún no existen registros de gastos para el taller.
              </div>
            ) : (
              expenses.map((expense) => {
                const correspondingVehicle = vehicles.find(v => v.vin === expense.vin);
                return (
                  <div key={expense.id} className="bg-slate-50 border border-slate-150 p-4 rounded-2xl flex items-start justify-between gap-4 hover:border-slate-300 hover:bg-white transition-all">
                    <div className="flex gap-3">
                      <div className="p-2.5 rounded-xl bg-white border border-slate-200 shrink-0 text-slate-500 shadow-sm">
                        <Wrench className="w-4 h-4 text-slate-600" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className={`px-2 py-0.5 rounded-full font-sans text-[8.5px] font-extrabold tracking-wider uppercase border ${
                            expense.type === 'Hojalateria' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                            expense.type === 'Mecanica' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            expense.type === 'Clima' ? 'bg-cyan-50 text-cyan-700 border-cyan-200' :
                            expense.type === 'Cristales' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                            expense.type === 'Estetica' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                            'bg-slate-100 text-slate-700 border-slate-300'
                          }`}>
                            {getCategoryLabel(expense.type)}
                          </span>
                          
                          <span className={`px-2 py-0.5 rounded-full font-sans text-[8.5px] font-extrabold tracking-wider uppercase border ${
                            expense.subtype === 'Mano de Obra' 
                              ? 'bg-indigo-50 text-indigo-700 border-indigo-150' 
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}>
                            {expense.subtype || 'Refacciones'}
                          </span>
                        </div>
                        
                        <div className="text-xs font-black text-slate-800 mt-1.5">
                          {expense.concept}
                        </div>
                        
                        <div className="text-[10px] text-slate-500 leading-relaxed font-semibold">
                          Proveedor: {expense.provider} • Auto ref: {correspondingVehicle ? `${correspondingVehicle.brand} ${correspondingVehicle.model}` : 'Vehículo general'}
                        </div>
                        
                        <div className="text-[9px] font-mono text-slate-400 font-bold">
                          VIN: {expense.vin} • Registrado el {expense.date}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0 flex flex-col items-end gap-1.5">
                      <span className="text-xs font-mono font-bold text-rose-600">
                        -${expense.cost.toLocaleString('es-MX')} <span className="text-[8px] text-slate-400 uppercase">MXN</span>
                      </span>
                      
                      {canModifyExpenses && (
                        <div className="flex items-center gap-1 mt-2">
                          <button
                            onClick={() => handleStartEditExpense(expense)}
                            className="p-1 px-2 border border-amber-200 text-amber-600 hover:bg-amber-600 hover:text-white rounded text-[9px] font-bold cursor-pointer transition-all"
                            title="Editar este costo"
                          >
                            Editar
                          </button>
                          
                          {onDeleteExpense && (
                            <button
                              onClick={() => {
                                if (confirm('¿Confirmado que desea eliminar este cargo del taller de la bitácora contable?')) {
                                  onDeleteExpense(expense.id);
                                }
                              }}
                              className="p-1.5 border border-rose-200 text-rose-500 hover:bg-rose-500 hover:text-white rounded cursor-pointer transition-all"
                              title="Eliminar este costo"
                            >
                              <Trash2 className="w-3 h-3" />
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
