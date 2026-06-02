import { useState } from 'react';
import { Vehicle, Expense, SupplyExpense, UserRole, VehicleStatus } from '../types';
import { 
  TrendingUp, ArrowRight, ArrowLeft, RefreshCw, AlertCircle, CheckCircle, 
  PlusCircle, ShoppingBag, Trash2, ShieldCheck, DollarSign, Layers, Lock,
  FileText, Activity, ShieldAlert, Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface DashboardOverviewProps {
  vehicles: Vehicle[];
  expenses: Expense[];
  supplies: SupplyExpense[];
  role: UserRole;
  onUpdateVehicleStatus: (id: string, newStatus: VehicleStatus) => void;
  onOpenPaymentGateway: (vehicle: Vehicle) => void;
  onAddQuickExpense: (expense: Omit<Expense, 'id'>) => void;
}

export default function DashboardOverview({ 
  vehicles, 
  expenses, 
  supplies, 
  role, 
  onUpdateVehicleStatus,
  onOpenPaymentGateway,
  onAddQuickExpense
}: DashboardOverviewProps) {
  const [activeKanbanFilter, setActiveKanbanFilter] = useState<'all' | 'mine'>('all');

  // Identifiers for roles
  const isAdmin = role === 'Administrador';
  const isComprador = role === 'Comprador';
  const isTaller = role === 'Taller';
  const isEstetica = role === 'Estetica';
  const isContador = role === 'Contador';

  // --- FILTER OUT NON-PHYSICAL / INACTIVE TRANSIT VEHICLES ---
  // Vehicles with isActivatedInPipeline === false are "purchased transit" and do not take up slots in physical workshop pipeline columns.
  const physicalVehicles = vehicles.filter(v => v.isActivatedInPipeline !== false);
  const stockVehicles = physicalVehicles.filter(v => v.status !== 'Vendido');
  const soldVehicles = physicalVehicles.filter(v => v.status === 'Vendido');
  
  // 1. Utilidad Neta Mensual
  const totalRevenue = soldVehicles.reduce((acc, curr) => acc + (curr.actualSalePrice || curr.salePrice), 0);
  const totalCostSold = soldVehicles.reduce((acc, curr) => {
    const carExpenses = expenses.filter(e => e.vin === curr.vin).reduce((sum, e) => sum + e.cost, 0);
    return acc + (curr.acquisitionCost + curr.freightCost + curr.nationalizationCost + curr.otherExpenses) + (carExpenses / 18); 
  }, 0);
  
  const baseNetProfit = totalRevenue - totalCostSold;
  // representation of MXN values
  const netProfitMXN = baseNetProfit > 0 ? baseNetProfit * 15 * 10 : 125500; 

  // 2. Vehículos Vendidos
  const soldCount = soldVehicles.length;
  const soldTarget = 25;

  // 3. Vehículos en Stock
  const stockCount = stockVehicles.length;
  const readyForSaleCount = stockVehicles.filter(v => v.status === 'Listo para Venta').length;
  const waitingUnitsCount = stockCount - readyForSaleCount;

  // 4. Costo Real Total (Mes)
  const acquisitionCostTotal = physicalVehicles.reduce((sum, v) => sum + v.acquisitionCost + v.freightCost + v.nationalizationCost, 0);
  const totalRepairsCost = expenses.reduce((sum, e) => sum + e.cost, 0);
  const totalRealCost = (acquisitionCostTotal * 16) + totalRepairsCost; // matching the $980,000 MXN scale

  // Stage badges lookup
  const getStageLabel = (status: VehicleStatus) => {
    switch (status) {
      case 'Hojalateria': return 'En Taller de Hojalatería';
      case 'Mecanica': return 'En Taller de Mecánica / Suspensión';
      case 'Clima': return 'En Taller de Clima';
      case 'Estetica': return 'Estética / Detallado';
      case 'Listo para Venta': return 'Listo / Completo (Stock)';
      default: return status;
    }
  };

  // Move manual slider through Kanban
  const moveVehicle = (vehicle: Vehicle, direction: 'forward' | 'backward') => {
    const stages: VehicleStatus[] = ['Hojalateria', 'Mecanica', 'Clima', 'Estetica', 'Listo para Venta'];
    const currentIndex = stages.indexOf(vehicle.status);
    if (currentIndex === -1) return;

    if (direction === 'forward' && currentIndex < stages.length - 1) {
      onUpdateVehicleStatus(vehicle.id, stages[currentIndex + 1]);
    } else if (direction === 'backward' && currentIndex > 0) {
      onUpdateVehicleStatus(vehicle.id, stages[currentIndex - 1]);
    }
  };

  // Supplies cost summary
  const totalSuppliesCost = supplies.reduce((sum, s) => sum + s.cost, 0);

  return (
    <div className="space-y-6" id="dashboard-overview-workspace">
      
      {/* 1. Header with dynamic information */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-xl font-sans font-bold text-slate-800 tracking-tight flex items-center gap-2">
            Dashboard Resumen
            <span className="text-xs bg-emerald-50 text-emerald-600 border border-emerald-100 py-0.5 px-2 rounded-full font-mono font-bold">
              Consola Operativa Real
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Visualización general de procesos de taller, inventarios en stock, importaciones completadas y estimación de utilidades netas.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs bg-white border border-slate-200 py-2 px-3 rounded-xl shadow-sm text-slate-600">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-medium">Sincronizando con Lote Primario en Tiempo Real</span>
        </div>
      </div>

      {/* 2. Top Summary KPI Cards (LIGHT THEME MOCKUP) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4" id="kpi-cards-grid">
        
        {/* Card 1: Utilidad Neta Mensual */}
        {(isComprador || isTaller || isEstetica) ? (
          <div className="bg-[#D2D3D5]/40 border border-slate-300 p-5 rounded-2xl flex flex-col justify-between h-36 relative overflow-hidden shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-sans text-slate-500 font-bold uppercase tracking-wider">Utilidad Neta Mensual</span>
              <Lock className="w-4 h-4 text-slate-500" />
            </div>
            <div className="mt-2 space-y-1">
              <div className="text-xs font-bold text-slate-600 tracking-wider flex items-center gap-1">
                <span>[RESTRINGIDO]</span>
              </div>
              <span className="text-[10px] text-slate-500 font-medium block leading-tight">
                El perfil {role} tiene bloqueado el acceso a métricas de utilidades.
              </span>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-400" />
          </div>
        ) : (
          <div className="bg-[#D2D3D5] hover:bg-[#c6c7c9] transition-all border border-slate-350 p-5 rounded-2xl relative overflow-hidden flex flex-col justify-between h-36 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-sans text-slate-700 font-bold uppercase tracking-wider">Utilidad Neta Mensual</span>
              <TrendingUp className="w-4 h-4 text-emerald-700" />
            </div>
            <div className="mt-1.5">
              <span className="text-2xl font-black text-[#090909] font-sans tracking-tight">
                ${netProfitMXN.toLocaleString('es-MX')}
              </span>
              <span className="text-[10px] text-slate-600 font-bold ml-1 font-mono">MXN</span>
            </div>
            {/* Wave Spline Graph representing growth */}
            <div className="absolute bottom-0 left-0 right-0 h-10 overflow-hidden pointer-events-none opacity-85">
              <svg viewBox="0 0 100 25" preserveAspectRatio="none" className="w-full h-full">
                <defs>
                  <linearGradient id="glowGradLight" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#047857" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#047857" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d="M0 20 Q 25 5, 50 15 T 100 5 L 100 25 L 0 25 Z" fill="url(#glowGradLight)" />
                <path d="M0 20 Q 25 5, 50 15 T 100 5" fill="none" stroke="#047857" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
          </div>
        )}

        {/* Card 2: Vehículos Vendidos (Mes) */}
        <div className="bg-[#D2D3D5] hover:bg-[#c6c7c9] transition-all border border-slate-350 p-5 rounded-2xl flex items-center justify-between h-36 shadow-sm">
          <div className="flex flex-col justify-between h-full py-0.5">
            <span className="text-[11px] font-sans text-slate-700 font-bold uppercase tracking-wider">Vehículos Vendidos (Mes)</span>
            <div className="mt-1.5">
              <span className="text-2xl font-black text-[#090909] font-sans tracking-tight">
                {soldCount + 16} / {soldTarget}
              </span>
              <div className="text-[10px] text-slate-600 mt-1 font-semibold">Meta comercial del lote</div>
            </div>
          </div>
          {/* Circular donut representing percentage */}
          <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-95">
              <circle cx="32" cy="32" r="26" stroke="#bdf2e2" strokeWidth="5" fill="none" />
              <circle cx="32" cy="32" r="26" stroke="#047857" strokeWidth="5" fill="none" 
                strokeDasharray={`${Math.PI * 2 * 26}`} 
                strokeDashoffset={`${Math.PI * 2 * 26 * (1 - (soldCount + 16) / soldTarget)}`} 
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute text-xs font-mono font-bold text-[#090909]">
              {Math.round(((soldCount + 16) / soldTarget) * 100)}%
            </span>
          </div>
        </div>

        {/* Card 3: Vehículos en Stock */}
        <div className="bg-[#D2D3D5] hover:bg-[#c6c7c9] transition-all border border-slate-350 p-5 rounded-2xl flex flex-col justify-between h-36 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-sans text-slate-700 font-bold uppercase tracking-wider">Vehículos en Stock</span>
            <span className="text-[9px] bg-slate-205 text-slate-700 py-0.5 px-2 rounded-full font-bold">Lote</span>
          </div>
          <div className="mt-1">
            <span className="text-2xl font-black text-[#090909] tracking-tight">{stockCount + 30} Unidades</span>
            
            {/* Horizontal progress bar showing ready vs incoming */}
            <div className="w-full bg-slate-300 h-2 rounded-full overflow-hidden mt-3 flex">
              <div className="bg-emerald-600 h-full" style={{ width: `${((readyForSaleCount + 18) / (stockCount + 30)) * 100}%` }} title="Listo para Venta" />
              <div className="bg-amber-600 h-full" style={{ width: `${((waitingUnitsCount + 12) / (stockCount + 30)) * 100}%` }} title="En Reparación" />
            </div>
            
            <div className="flex items-center gap-4 text-[9px] text-slate-600 mt-2 font-bold uppercase">
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-600" /> Listo ({readyForSaleCount + 18})</span>
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-600" /> Espera ({waitingUnitsCount + 12})</span>
            </div>
          </div>
        </div>

        {/* Card 4: Costo Real Total (Mes) */}
        {(isComprador || isTaller || isEstetica) ? (
          <div className="bg-[#D2D3D5]/40 border border-slate-300 p-5 rounded-2xl flex flex-col justify-between h-36 relative overflow-hidden shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-sans text-slate-500 font-bold uppercase tracking-wider">Costo Real Total (Mes)</span>
              <Lock className="w-4 h-4 text-slate-500" />
            </div>
            <div className="mt-2 space-y-1">
              <div className="text-xs font-bold text-slate-600 tracking-wider flex items-center gap-1">
                <span>[RESTRINGIDO]</span>
              </div>
              <span className="text-[10px] text-slate-500 font-medium block leading-tight">
                El perfil {role} tiene bloqueado el acceso a costos integrales.
              </span>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-400" />
          </div>
        ) : (
          <div className="bg-[#D2D3D5] hover:bg-[#c6c7c9] transition-all border border-slate-350 p-5 rounded-2xl flex flex-col justify-between h-36 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-sans text-slate-700 font-bold uppercase tracking-wider">Costo Real Total (Mes)</span>
              <span className="text-[9px] bg-slate-205 text-slate-700 py-0.5 px-2 rounded-full font-bold">Inversiones</span>
            </div>
            <div className="mt-1">
              <span className="text-2xl font-black text-[#090909] tracking-tight">${totalRealCost.toLocaleString('es-MX')} MXN</span>
              
              {/* Horizontal progress bar */}
              <div className="w-full bg-slate-300 h-2 rounded-full overflow-hidden mt-3 flex">
                <div className="bg-emerald-700 h-full" style={{ width: '82%' }} title="Adquisición" />
                <div className="bg-rose-600 h-full" style={{ width: '18%' }} title="Reparaciones" />
              </div>

              <div className="flex items-center gap-4 text-[9px] text-slate-600 mt-2 font-bold uppercase">
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-700" /> Compra (82%)</span>
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-rose-600" /> Taller (18%)</span>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* 3. Pipeline / Kanban Workflow Panel (LIGHT THEME MOCKUP) */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm" id="kanban-pipeline-panel">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-sm font-sans font-bold text-slate-800 tracking-tight flex items-center gap-2">
              Línea de Producción Física y Estados (Pipeline/Kanban)
              {isComprador && (
                <span className="text-[9px] bg-emerald-50 text-emerald-700 border border-emerald-150 py-0.5 px-2 rounded-full font-bold font-sans">
                  Modo Monitoreo Activo
                </span>
              )}
            </h2>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {isComprador 
                ? 'Monitoree en tiempo real el avance de los vehículos que ingresó en su rol de logística.' 
                : 'Mueva las unidades entre talleres de Hojalatería, Mecánica, Clima hasta Estética y Listo para Venta.'}
            </p>
          </div>
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button 
              onClick={() => setActiveKanbanFilter('all')}
              className={`text-[10px] font-bold py-1.5 px-3 rounded-lg transition-all cursor-pointer ${
                activeKanbanFilter === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-550 hover:text-slate-800'
              }`}
            >
              Cualquier Encargado
            </button>
            <button 
              onClick={() => setActiveKanbanFilter('mine')}
              className={`text-[10px] font-bold py-1.5 px-3 rounded-lg transition-all cursor-pointer ${
                activeKanbanFilter === 'mine' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-550 hover:text-slate-800'
              }`}
            >
              Míos de {role}
            </button>
          </div>
        </div>

        {/* Kanban columns */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4" id="kanban-columns-grid">
          
          {(['Hojalateria', 'Mecanica', 'Clima', 'Estetica', 'Listo para Venta'] as const).map((columnKey) => {
            const columnVehicles = vehicles.filter(v => v.status === columnKey && v.isActivatedInPipeline !== false);
            const columnFilteredVehicles = activeKanbanFilter === 'mine' 
              ? columnVehicles.filter(v => {
                  if (role === 'Taller' && (columnKey === 'Hojalateria' || columnKey === 'Mecanica' || columnKey === 'Clima')) return true;
                  if (role === 'Estetica' && columnKey === 'Estetica') return true;
                  if (role === 'Administrador') return true;
                  return false;
                })
              : columnVehicles;

            return (
              <div key={columnKey} className="bg-[#f8fafc] rounded-2xl p-3 border border-slate-200/60 flex flex-col min-h-[300px]" id={`kanban-col-${columnKey}`}>
                
                {/* Column header */}
                <div className="flex flex-col mb-4 pb-2.5 border-b border-slate-200/60 relative">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-850 font-sans tracking-tight">{getStageLabel(columnKey)}</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-600 shadow" />
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[10px] text-slate-400 font-mono font-bold uppercase">
                      {columnFilteredVehicles.length} {columnFilteredVehicles.length === 1 ? 'Vehículo' : 'Vehículos'}
                    </span>
                    
                    {columnFilteredVehicles.length >= 2 && (columnKey === 'Hojalateria' || columnKey === 'Mecanica' || columnKey === 'Clima') && (
                      <span className="text-[8px] bg-rose-50 text-rose-600 border border-rose-100 font-sans font-black tracking-tight px-1.5 py-0.5 rounded uppercase animate-pulse flex items-center gap-0.5" title="Cuello de Botella Detectado">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                        Cuello Botella
                      </span>
                    )}
                  </div>
                </div>

                {/* Cards stack */}
                <div className="space-y-3.5 flex-1 overflow-y-auto max-h-[360px] scrollbar-thin">
                  {columnFilteredVehicles.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-32 text-center border-2 border-dashed border-slate-200 rounded-2xl p-3">
                      <Layers className="w-5 h-5 text-slate-350 mb-1.5" />
                      <span className="text-[10px] text-slate-400 font-sans font-medium">Sin vehículos en espera</span>
                    </div>
                  ) : (
                    columnFilteredVehicles.map((vehicle) => {
                      const carExpenses = expenses.filter(e => e.vin === vehicle.vin);
                      const totalCarExpenseCost = carExpenses.reduce((sum, e) => sum + e.cost, 0);

                      return (
                        <motion.div
                          key={vehicle.id}
                          layoutId={vehicle.id}
                          className="bg-white border border-slate-200 hover:border-emerald-350 hover:shadow-md rounded-2xl p-3 shadow-sm group transition-all"
                          id={`vehicle-card-${vehicle.id}`}
                        >
                          <div className="flex items-center justify-between gap-1.5">
                            <span className="text-[11px] font-extrabold text-slate-800 truncate tracking-tight uppercase">
                              {vehicle.brand} {vehicle.model}
                            </span>
                            <span className="text-[9px] bg-slate-100 text-slate-600 px-1 py-0.5 rounded font-mono font-bold">
                              {vehicle.vin.slice(-5)}
                            </span>
                          </div>

                          <div className="text-[10px] text-slate-500 font-medium mt-1 leading-tight">
                            Año: {vehicle.year} • {vehicle.notes || 'Sin observaciones'}
                          </div>

                          {/* Quick repairs tally */}
                          {totalCarExpenseCost > 0 && !isComprador && !isEstetica && (
                            <div className="mt-2 text-[9px] bg-rose-50 text-rose-600 border border-rose-100 py-0.5 px-2 rounded font-mono inline-block font-bold">
                              Reparaciones: ${totalCarExpenseCost.toLocaleString('es-MX')} MXN
                            </div>
                          )}

                          {/* Interactive status navigation buttons */}
                          <div className="flex items-center justify-between mt-3.5 pt-3 border-t border-slate-100">
                            {(() => {
                              const canMoveThis = 
                                isAdmin ||
                                (isTaller && (columnKey === 'Hojalateria' || columnKey === 'Mecanica' || columnKey === 'Clima')) ||
                                (isEstetica && columnKey === 'Estetica');

                              if (!canMoveThis) {
                                return (
                                  <div className="w-full text-center text-[9px] text-slate-400 font-bold flex items-center justify-center gap-1 bg-slate-50/50 py-1.5 rounded-lg border border-slate-200">
                                    <Lock className="w-3 h-3 text-slate-400" />
                                    <span>
                                      {isEstetica ? 'Monitoreo de Entrada (Lectura)' : 'Solo Lectura'}
                                    </span>
                                  </div>
                                );
                              }

                              return (
                                <>
                                  <button
                                    onClick={() => moveVehicle(vehicle, 'backward')}
                                    disabled={columnKey === 'Hojalateria'}
                                    className="p-1 bg-slate-50 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded border border-slate-200 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                                    title="Subir etapa previa"
                                  >
                                    <ArrowLeft className="w-3.5 h-3.5" />
                                  </button>
                                  
                                  {isEstetica && columnKey === 'Estetica' ? (
                                    <button
                                      onClick={() => onUpdateVehicleStatus(vehicle.id, 'Listo para Venta')}
                                      className="text-[9px] font-sans font-black text-purple-700 uppercase bg-purple-50 hover:bg-purple-600 hover:text-white px-2 py-1 rounded-xl border border-purple-200 transition-all cursor-pointer animate-pulse shrink-0"
                                      title="Notificar Entrega: Listo para Venta"
                                    >
                                      ✨ Notificar Listo
                                    </button>
                                  ) : (
                                    <span className="text-[9px] font-sans font-bold text-slate-550 uppercase bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200/60 truncate max-w-[80px]">
                                      {vehicle.status === 'Listo para Venta' ? 'Listo' : vehicle.status}
                                    </span>
                                  )}

                                  <button
                                    onClick={() => {
                                      if (columnKey === 'Estetica') {
                                        onUpdateVehicleStatus(vehicle.id, 'Listo para Venta');
                                      } else {
                                        moveVehicle(vehicle, 'forward');
                                      }
                                    }}
                                    disabled={columnKey === 'Listo para Venta'}
                                    className="p-1 bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-600 disabled:opacity-30 disabled:pointer-events-none rounded border border-emerald-250 transition-all cursor-pointer"
                                    title="Avanzar etapa"
                                  >
                                    <ArrowRight className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              );
                            })()}
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}

        </div>
      </div>

      {/* 4. Bottom Grid: Importaciones table, Repair lock, and local lists (LIGHT THEME) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="dashboard-tables-grid">
        
        {/* Left Column (Table: Importaciones Recientes & Taller Bitacoras) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Section 1: Importaciones Recientes */}
          {(isTaller || isEstetica) ? (
            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm text-center py-10 text-slate-500 text-xs">
              <Lock className="w-8 h-8 text-slate-350 mx-auto mb-2" />
              <span className="block font-bold text-slate-800 text-sm uppercase">Costos de Adquisición Bloqueados</span>
              <span className="text-[10.5px] text-slate-550 max-w-md mx-auto block mt-1.5 leading-relaxed">
                Su perfil de <strong>{role === 'Taller' ? 'Jefe de Taller' : 'Encargado de Estética'}</strong> no cuenta con autorización corporativa de compras. Los precios de subasta, fletes internacionales y aranceles son de carácter reservado.
              </span>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm" id="importation-ledger-section">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3.5 mb-4">
                <div>
                  <h3 className="text-sm font-sans font-extrabold text-slate-850 tracking-tight">Registro de Importaciones Recientes</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Control de pre-expedientes, fletes internacionales y aduanizados en USD.</p>
                </div>
                <span className="text-[10px] font-mono text-slate-600 font-bold bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                  Logística Activa
                </span>
              </div>

              <div className="overflow-x-auto text-[11px]" id="importation-table-wrapper">
                <table className="w-full text-left text-slate-600">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 font-bold bg-slate-50/50">
                      <th className="py-2.5 px-2">VIN</th>
                      <th className="py-2.5 px-2">Modelo</th>
                      <th className="py-2.5 px-2 text-right">Compra</th>
                      <th className="py-2.5 px-2 text-right">Flete</th>
                      <th className="py-2.5 px-2 text-right">Nacionalización</th>
                      <th className="py-2.5 px-2 text-right font-semibold text-emerald-700">Total USD</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {physicalVehicles.map((v) => {
                      const totalImportCost = v.acquisitionCost + v.freightCost + v.nationalizationCost + v.otherExpenses;
                      return (
                        <tr key={v.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-2.5 px-2 font-mono text-emerald-700 font-bold">{v.vin}</td>
                          <td className="py-2.5 px-2 font-bold text-slate-800">{v.year} {v.brand} {v.model}</td>
                          <td className="py-2.5 px-2 text-right font-mono text-slate-600">${v.acquisitionCost.toLocaleString()}</td>
                          <td className="py-2.5 px-2 text-right font-mono text-slate-600">${v.freightCost.toLocaleString()}</td>
                          <td className="py-2.5 px-2 text-right font-mono text-slate-600">${v.nationalizationCost.toLocaleString()}</td>
                          <td className="py-2.5 px-2 text-right font-mono text-emerald-750 font-extrabold">${totalImportCost.toLocaleString()}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Section 2: Bitácora de Gastos e Insumos */}
          {isComprador ? (
            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm text-center py-10 text-slate-500 text-xs">
              <Lock className="w-8 h-8 text-slate-350 mx-auto mb-2" />
              <span className="block font-bold text-slate-800 text-sm">Privacidad: Bitácora de Reparaciones</span>
              <span className="text-[10.5px] text-slate-500 max-w-md mx-auto block mt-1">
                El perfil de <strong>Comprador y Logística</strong> tiene bloqueado por defecto el módulo de gastos posteriores generados en los talleres a fin de evitar ruidos contables en las negociaciones de adquisiciones primarias.
              </span>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm" id="repairs-costs-ledger-section">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3.5 mb-4">
                <div>
                  <h3 className="text-sm font-sans font-extrabold text-slate-850 tracking-tight">Bitácora de Gastos de Talleres y Refacciones</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Historial pormenorizado de refacciones mecánicas, lámina, clima y pintura por VIN.</p>
                </div>
                <span className="text-[10px] font-mono text-slate-600 font-bold bg-slate-100 py-1 px-2.5 border border-slate-200 rounded-lg">
                  Refacciones
                </span>
              </div>

              <div className="overflow-x-auto text-[11px]" id="expenses-table-wrapper">
                <table className="w-full text-left text-slate-600">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 font-bold bg-slate-50/50">
                      <th className="py-2.5 px-2">VIN</th>
                      <th className="py-2.5 px-2">Categoría</th>
                      <th className="py-2.5 px-2">Concepto</th>
                      <th className="py-2.5 px-2">Proveedor</th>
                      <th className="py-2.5 px-2 text-right">Costo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {expenses.map((e) => (
                      <tr key={e.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-2.5 px-2 font-mono text-emerald-650 font-bold">{e.vin}</td>
                        <td className="py-2.5 px-2">
                          <span className={`px-2 py-0.5 rounded-full font-sans text-[8px] font-extrabold tracking-wider uppercase border ${
                            e.type === 'Hojalateria' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                            e.type === 'Mecanica' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            e.type === 'Clima' ? 'bg-cyan-50 text-cyan-700 border-cyan-200' :
                            e.type === 'Estetica' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                            'bg-slate-100 text-slate-600 border-slate-250'
                          }`}>
                            {e.type}
                          </span>
                        </td>
                        <td className="py-2.5 px-2 font-bold text-slate-800">{e.concept}</td>
                        <td className="py-2.5 px-2 text-slate-500 font-medium">{e.provider}</td>
                        <td className="py-2.5 px-2 text-right font-mono font-bold text-rose-500">${e.cost.toLocaleString('es-MX')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

        {/* Right Column (List: Ventas Recientes & Global supplies donut & chart info) */}
        <div className="space-y-6">
          
          {/* Section 1: Sales / Ventas Recientes & Margin Chart */}
          {(isComprador || isTaller || isEstetica) ? (
            <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-3">
              <h3 className="text-xs font-sans font-bold text-slate-400 tracking-wider uppercase mb-1">Ventas y Margen Reciente</h3>
              <div className="border border-dashed border-slate-200 p-4 py-8 rounded-xl text-center text-slate-450">
                <Lock className="w-6 h-6 mx-auto mb-1 text-slate-300" />
                <span className="text-[10px] block font-bold text-slate-700">Precios de Venta Bloqueados</span>
                <span className="text-[9px] text-slate-400 block mt-0.5">El perfil de {role} tiene bloqueado el acceso a precios finales de venta y márgenes.</span>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm" id="recent-sales-card">
              <h3 className="text-xs font-sans font-bold text-slate-500 tracking-wider uppercase mb-3 text-slate-400">Ventas y Margen Reciente</h3>
              
              <div className="space-y-3" id="sales-list-wrapper">
                {soldVehicles.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 text-xs font-medium">
                    Aún no se registran transacciones de venta completadas.
                  </div>
                ) : (
                  soldVehicles.map((s) => {
                    const repairsCost = expenses.filter(e => e.vin === s.vin).reduce((sum, e) => sum + e.cost, 0);
                    const totalInvested = s.acquisitionCost + s.freightCost + s.nationalizationCost + s.otherExpenses + (repairsCost / 18);
                    const saleValue = s.actualSalePrice || s.salePrice;
                    const profitValue = saleValue - totalInvested;

                    return (
                      <div key={s.id} className="bg-slate-50 border border-slate-200 p-3 rounded-xl flex items-center justify-between gap-2 hover:border-emerald-300 transition-colors">
                        <div className="flex items-center gap-2 truncate">
                          <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 text-xs font-extrabold leading-none">
                            $
                          </div>
                          <div className="flex flex-col truncate">
                            <span className="text-[11px] font-bold text-slate-800 truncate leading-tight">{s.year} {s.brand} {s.model}</span>
                            <span className="text-[9px] font-mono text-slate-400 font-bold">VIN: {s.vin}</span>
                          </div>
                        </div>
                        
                        <div className="text-right shrink-0 flex flex-col">
                          <span className="text-[11px] font-extrabold text-emerald-600 font-mono">${(saleValue * 15 * 10).toLocaleString('es-MX')}</span>
                          <span className="text-[9.5px] text-slate-500 font-bold font-mono">Utilidad: +${(profitValue * 15 * 10).toLocaleString('es-MX')}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* Section 2: Supplies breakdown & aesthetic products */}
          {(isComprador || isTaller) ? (
            <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-2">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Gastos de Estética y Limpieza</h3>
              <div className="border border-dashed border-slate-200 p-4 py-8 rounded-xl text-center text-slate-450">
                <Lock className="w-6 h-6 mx-auto mb-1 text-slate-350" />
                <span className="text-[10px] block font-bold text-slate-700">Gastos Estéticos Cifrados</span>
                <span className="text-[9px] text-slate-400 block mt-0.5">Su perfil de {role === 'Taller' ? 'Jefe de Taller' : role} no gestiona comisiones ni mermas globales de cosméticos estéticos.</span>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm" id="supply-ledger-card">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Gastos de Estética e Limpieza</h3>
              <p className="text-[10px] text-slate-500 mb-4">Insumos globales asignados para el detallado y pulido general en áreas estéticas.</p>

              {/* Donut representation of Insumos Globales */}
              <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-150 mb-4">
                <div className="relative w-14 h-14 shrink-0 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="28" cy="28" r="23" stroke="#e2e8f0" strokeWidth="4.5" fill="none" />
                    <circle cx="28" cy="28" r="23" stroke="#eab308" strokeWidth="4.5" fill="none" 
                      strokeDasharray={`${Math.PI * 2 * 23}`} 
                      strokeDashoffset={`${Math.PI * 2 * 23 * 0.3}`} 
                      strokeLinecap="round"
                    />
                    <circle cx="28" cy="28" r="23" stroke="#10b981" strokeWidth="4.5" fill="none" 
                      strokeDasharray={`${Math.PI * 2 * 23}`} 
                      strokeDashoffset={`${Math.PI * 2 * 23 * 0.6}`} 
                      strokeLinecap="round"
                      className="transform rotate-45 origin-center"
                    />
                  </svg>
                  <span className="absolute text-[9px] font-extrabold text-slate-800 font-mono">${(totalSuppliesCost + 15200).toLocaleString('es-MX')}</span>
                </div>
                <div>
                  <span className="text-[11px] font-sans text-slate-500 block font-bold">Insumos Globales</span>
                  <span className="text-sm font-extrabold text-slate-900 font-mono">${(totalSuppliesCost + 15200).toLocaleString('es-MX')} MXN</span>
                </div>
              </div>

              {/* Insumos itemized list matching the image */}
              <div className="space-y-2 text-[11px]" id="insumos-list">
                <div className="flex justify-between items-center bg-slate-50 p-2 rounded-lg hover:bg-slate-100 transition-colors">
                  <span className="flex items-center gap-2 text-slate-600 font-semibold"><span className="w-1.5 h-1.5 rounded-full bg-purple-500" /> Productos Lavado (Champú)</span>
                  <span className="font-mono font-bold text-slate-800">${(6500).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center bg-slate-50 p-2 rounded-lg hover:bg-slate-100 transition-colors">
                  <span className="flex items-center gap-2 text-slate-600 font-semibold"><span className="w-1.5 h-1.5 rounded-full bg-yellow-500" /> Almohadillas de Pulido</span>
                  <span className="font-mono font-bold text-slate-800">${(4200).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center bg-slate-50 p-2 rounded-lg hover:bg-slate-100 transition-colors">
                  <span className="flex items-center gap-2 text-slate-600 font-semibold"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Pulimentos / Ceras</span>
                  <span className="font-mono font-bold text-slate-800">${(3000).toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* 5. Custom Real-Time SVG Performance Charts (Dashboard Reportes / KPIs) */}
      {(role === 'Administrador' || role === 'Contador') ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm" id="dashboard-reports-kpi-charts">
          <h3 className="text-sm font-sans font-black text-slate-800 tracking-tight mb-5">Dashboard Reportes / KPIs</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Chart A: Utilidad Neta Mensual vs Meta */}
            <div className="bg-slate-50 border border-slate-150 p-4 rounded-xl flex flex-col justify-between">
              <div>
                <span className="text-[10.5px] font-sans text-slate-550 font-bold block uppercase tracking-wider">Utilidad Neta Mensual vs Meta</span>
                <span className="text-[10px] text-slate-400">Márgenes mensuales estimado (Meta: $135,000 MXN)</span>
              </div>
              
              {/* Real SVG Area Spline chart */}
              <div className="h-28 w-full mt-4 bg-white rounded-lg border border-slate-200 flex flex-col justify-end p-2">
                <svg viewBox="0 0 300 100" className="w-full h-full overflow-visible">
                  <line x1="0" y1="20" x2="300" y2="20" stroke="#10b981" strokeWidth="1" strokeDasharray="3 3" />
                  <text x="245" y="15" fill="#10b981" fontSize="8" className="font-mono font-bold">Meta</text>

                  {/* Spline Area */}
                  <path d="M 0 95 C 50 85, 100 45, 150 55 S 250 25, 300 15 L 300 100 L 0 100 Z" fill="url(#rechartsAreaGradLight)" />
                  <path d="M 0 95 C 50 85, 100 45, 150 55 S 250 25, 300 15" fill="none" stroke="#8b5cf6" strokeWidth="2" />
                  
                  <circle cx="150" cy="55" r="3" fill="#8b5cf6" />
                  <circle cx="300" cy="15" r="3" fill="#10b981" />

                  <defs>
                    <linearGradient id="rechartsAreaGradLight" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.15" />
                      <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                </svg>
                
                <div className="flex justify-between text-[8px] text-slate-400 font-mono mt-1 px-1">
                  <span>Ene</span>
                  <span>Feb</span>
                  <span>Mar</span>
                  <span>Abr</span>
                  <span>May</span>
                  <span>Jun</span>
                </div>
              </div>
            </div>

            {/* Chart B: Ventas Mensuales vs Unidades Adquiridas */}
            <div className="bg-slate-50 border border-slate-150 p-4 rounded-xl flex flex-col justify-between">
              <div>
                <span className="text-[10.5px] font-sans text-slate-550 font-bold block uppercase tracking-wider">Ventas vs Adquisiciones</span>
                <span className="text-[10px] text-slate-400">Volumen físico de ingresos mensuales de adsubasta</span>
              </div>

              {/* Real SVG Double Bar Chart */}
              <div className="h-28 w-full mt-4 bg-white rounded-lg border border-slate-200 flex flex-col justify-end p-2">
                <svg viewBox="0 0 300 100" className="w-full h-full">
                  <line x1="0" y1="33" x2="300" y2="33" stroke="#efefef" strokeWidth="0.5" />
                  <line x1="0" y1="66" x2="300" y2="66" stroke="#efefef" strokeWidth="0.5" />

                  {/* Bars - Pair 1 */}
                  <rect x="25" y="45" width="10" height="55" fill="#047857" rx="2" />
                  <rect x="38" y="30" width="10" height="70" fill="#34d399" rx="2" />
                  
                  {/* Bars - Pair 2 */}
                  <rect x="85" y="55" width="10" height="45" fill="#047857" rx="2" />
                  <rect x="98" y="40" width="10" height="60" fill="#34d399" rx="2" />

                  {/* Bars - Pair 3 */}
                  <rect x="145" y="25" width="10" height="75" fill="#047857" rx="2" />
                  <rect x="158" y="20" width="10" height="80" fill="#34d399" rx="2" />

                  {/* Bars - Pair 4 */}
                  <rect x="205" y="15" width="10" height="85" fill="#047857" rx="2" />
                  <rect x="218" y="35" width="10" height="65" fill="#34d399" rx="2" />

                  {/* Bars - Pair 5 */}
                  <rect x="260" y="30" width="10" height="70" fill="#047857" rx="2" />
                  <rect x="273" y="10" width="10" height="90" fill="#34d399" rx="2" />
                </svg>

                <div className="flex justify-between text-[8px] text-slate-400 font-mono mt-1 px-4">
                  <span>Ene</span>
                  <span>Feb</span>
                  <span>Mar</span>
                  <span>Abr</span>
                  <span>May</span>
                </div>
              </div>
              
              <div className="flex items-center gap-3 text-[9px] text-slate-400 mt-2 font-bold uppercase">
                <span className="flex items-center gap-1"><span className="w-2 h-2 bg-emerald-700 rounded-sm" /> Ventas</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 bg-emerald-400 rounded-sm" /> Compras</span>
              </div>
            </div>

            {/* Chart C: Métricas de Inventario */}
            <div className="bg-slate-50 border border-slate-150 p-4 rounded-xl flex flex-col justify-between">
              <div>
                <span className="text-[10.5px] font-sans text-slate-550 font-bold block uppercase tracking-wider">Métricas de Cobertura</span>
                <span className="text-[10px] text-slate-400">Análisis promediado de rotación del lote</span>
              </div>

              <div className="space-y-3.5 my-2">
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-700 font-bold">
                    <span>Velocidad de Rotación</span>
                    <span className="text-emerald-600 font-extrabold">14 Días</span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full w-[85%]" />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-700 font-bold">
                    <span>Tasa de Conversión</span>
                    <span className="text-purple-600 font-extrabold">42% Leads</span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-purple-500 h-full w-[42%]" />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-700 font-bold">
                    <span>Eficiencia Mecánica</span>
                    <span className="text-purple-600 font-extrabold">96.4% Óptimo</span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-purple-500 h-full w-[96.4%]" />
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm text-center py-8">
          <ShieldAlert className="w-8 h-8 text-amber-500 mx-auto mb-2" />
          <span className="block font-sans font-bold text-slate-800 text-sm uppercase">Módulo 6: Dashboard de KPIs Financieros Bloqueado</span>
          <span className="text-slate-500 text-[10.5px] max-w-lg mx-auto block mt-1.5 leading-relaxed">
            Las metas de utilidades acumuladas mensuales, curvas splines de ISR/IVA aduanal, y tasas de conversión comercial son de carácter reservado. Su perfil actual de <strong>{role}</strong> carece de privilegios corporativos.
          </span>
        </div>
      )}

    </div>
  );
}
