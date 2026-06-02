import React, { useState } from 'react';
import { Vehicle, UserRole, VehicleStatus } from '../types';
import { 
  Car, Plus, Search, Filter, Trash2, Edit2, ShieldAlert,
  ArrowRight, DollarSign, Layers, ChevronRight, CheckCircle2 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface InventoryManagerProps {
  vehicles: Vehicle[];
  onAddVehicle: (newVehicle: Omit<Vehicle, 'id'>) => void;
  onUpdateStatus: (id: string, newStatus: VehicleStatus) => void;
  onDeleteVehicle: (id: string) => void;
  onOpenPayment: (vehicle: Vehicle) => void;
  role: UserRole;
}

export default function InventoryManager({ 
  vehicles, 
  onAddVehicle, 
  onUpdateStatus, 
  onDeleteVehicle, 
  onOpenPayment,
  role 
}: InventoryManagerProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Registration Form states
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState(2019);
  const [vin, setVin] = useState('');
  const [acquisitionCost, setAcquisitionCost] = useState(0);
  const [freightCost, setFreightCost] = useState(0);
  const [nationalizationCost, setNationalizationCost] = useState(0);
  const [otherExpenses, setOtherExpenses] = useState(0);
  const [salePrice, setSalePrice] = useState(0);
  const [notes, setNotes] = useState('');

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!brand || !model || !vin) return;

    onAddVehicle({
      brand,
      model,
      year: Number(year),
      vin,
      acquisitionCost: Number(acquisitionCost),
      freightCost: Number(freightCost),
      nationalizationCost: Number(nationalizationCost),
      otherExpenses: Number(otherExpenses),
      salePrice: Number(salePrice),
      status: 'Hojalateria', // starts at the beginning of the workflow column
      notes
    });

    // Reset fields
    setBrand('');
    setModel('');
    setYear(2019);
    setVin('');
    setAcquisitionCost(0);
    setFreightCost(0);
    setNationalizationCost(0);
    setOtherExpenses(0);
    setSalePrice(0);
    setNotes('');
    setShowAddForm(false);
  };

  // Filter vehicles
  const filteredVehicles = vehicles.filter(v => {
    const matchesSearch = 
      v.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.vin.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || v.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: VehicleStatus) => {
    switch (status) {
      case 'Hojalateria': return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      case 'Mecanica': return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      case 'Clima': return 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20';
      case 'Estetica': return 'bg-purple-500/10 text-purple-400 border border-purple-500/20';
      case 'Listo para Venta': return 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20';
      case 'Vendido': return 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/35 font-bold';
    }
  };

  return (
    <div className="space-y-6" id="inventory-workspace">
      
      {/* Action panel header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-base font-sans font-bold text-white tracking-tight">Seguimiento Detallado de Inventario</h2>
          <p className="text-[11px] text-slate-500 mt-0.5">Gestione y audite el listado integral de vehículos ingresados, fletes y estadios operativos.</p>
        </div>
        
        {/* Only Comprador or Administrador can physically insert assets to the database */}
        {(role === 'Administrador' || role === 'Comprador') && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-sans font-semibold text-xs py-2 px-4 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-500/15"
            id="register-vehicle-btn"
          >
            <Plus className="w-4 h-4" />
            Adquirir Auto de Subasta
          </button>
        )}
      </div>

      {/* Auto Auction Registry Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <form onSubmit={handleRegister} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h3 className="text-xs font-bold text-white tracking-tight uppercase border-b border-slate-800 pb-2">
                Registro de Nueva Adquisición Comercial
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                
                {/* Brand */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Marca</label>
                  <input 
                    type="text" required placeholder="Toyota, Ford, Nissan"
                    value={brand} onChange={(e) => setBrand(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg p-2 text-xs text-white outline-none"
                  />
                </div>

                {/* Model */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Modelo</label>
                  <input 
                    type="text" required placeholder="Tacoma Sport, F-150 Lariat"
                    value={model} onChange={(e) => setModel(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg p-2 text-xs text-white outline-none"
                  />
                </div>

                {/* Year */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Año</label>
                  <input 
                    type="number" required placeholder="2018"
                    value={year} onChange={(e) => setYear(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg p-2 text-xs text-white outline-none"
                  />
                </div>

                {/* VIN */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Número de Identificación (VIN)</label>
                  <input 
                    type="text" required placeholder="17-digitos o código de lote"
                    value={vin} onChange={(e) => setVin(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg p-2 text-xs font-mono text-white outline-none"
                  />
                </div>

              </div>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 pt-2">
                
                {/* Auction Cost */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Subasta ($ USD)</label>
                  <input 
                    type="number" required placeholder="12000"
                    value={acquisitionCost} onChange={(e) => setAcquisitionCost(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg p-2 text-xs font-mono text-white outline-none"
                  />
                </div>

                {/* Freight Cost */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Coste Flete ($ USD)</label>
                  <input 
                    type="number" required placeholder="1100"
                    value={freightCost} onChange={(e) => setFreightCost(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg p-2 text-xs font-mono text-white outline-none"
                  />
                </div>

                {/* Nationalization */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Nacionalización ($ USD)</label>
                  <input 
                    type="number" required placeholder="1800"
                    value={nationalizationCost} onChange={(e) => setNationalizationCost(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg p-2 text-xs font-mono text-white outline-none"
                  />
                </div>

                {/* Cruce Fees */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Otros Gastos Subasta ($ USD)</label>
                  <input 
                    type="number" required placeholder="200"
                    value={otherExpenses} onChange={(e) => setOtherExpenses(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg p-2 text-xs font-mono text-white outline-none"
                  />
                </div>

                {/* Sale Price suggested (calculated in base scope reference) */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-emerald-400 uppercase">Venta Sugerida ($ USD)</label>
                  <input 
                    type="number" required placeholder="18500"
                    value={salePrice} onChange={(e) => setSalePrice(Number(e.target.value))}
                    className="w-full bg-slate-950 border-emerald-950/40 focus:border-emerald-500 rounded-lg p-2 text-xs font-mono text-emerald-400 outline-none font-bold"
                  />
                </div>

              </div>

              {/* Notes */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Notas y Detalle de Adquisición</label>
                <textarea
                  placeholder="Detallar condiciones mecánicas de compra, origen, etc."
                  value={notes} onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg p-2 text-xs text-white outline-none h-14"
                />
              </div>

              {/* Automatic calculator helper block */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-950 p-3 rounded-lg border border-slate-850 gap-2 font-mono text-[10px] text-slate-400">
                <div className="flex items-center gap-4">
                  <span>Inversión de Importación ($USD): <span className="text-white font-bold">${(acquisitionCost + freightCost + nationalizationCost + otherExpenses).toLocaleString()}</span></span>
                  <span>En Pesos (~M): <span className="text-purple-400 font-bold">${((acquisitionCost + freightCost + nationalizationCost + otherExpenses) * 16).toLocaleString('es-MX')} MXN</span></span>
                </div>
                <div className="text-emerald-400 font-semibold">
                  Márgen Utilidad Bruto proyectado: +${Math.max(0, (salePrice - (acquisitionCost + freightCost + nationalizationCost + otherExpenses)) * 16).toLocaleString()} MXN
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-1">
                <button 
                  type="button" onClick={() => setShowAddForm(false)}
                  className="bg-slate-950 text-slate-400 hover:text-white px-4 py-2 border border-slate-800 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit" 
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2 rounded-lg text-xs font-semibold cursor-pointer flex items-center gap-1 shadow-lg shadow-emerald-600/10"
                >
                  Confirmar Registro
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter and search bar wrapper */}
      <div className="bg-slate-900 border border-slate-800/80 p-4 rounded-xl flex flex-col md:flex-row items-center gap-4">
        <div className="relative w-full md:flex-1">
          <Search className="absolute left-3 top-2.5 text-slate-500 w-4 h-4" />
          <input
            type="text"
            placeholder="Buscar por marca, modelo, VIN o palabras clave..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl py-2 pl-9 pr-3 text-xs text-slate-300 outline-none transition-all"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto self-stretch md:self-auto justify-end">
          <span className="text-[10px] text-slate-500 font-bold uppercase flex items-center gap-1.5 shrink-0">
            <Filter className="w-3.5 h-3.5" />
            Estado de Taller:
          </span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-xs text-slate-300 py-2 px-3 rounded-xl outline-none"
          >
            <option value="all">Todas las Unidades</option>
            <option value="Hojalateria">Hojalatería (Taller 1)</option>
            <option value="Mecanica">Mecánica (Taller 2)</option>
            <option value="Clima">Clima (Taller 3)</option>
            <option value="Estetica">Estética / Detallado</option>
            <option value="Listo para Venta">Listo para Venta</option>
            <option value="Vendido">Vendido / Entregado</option>
          </select>
        </div>
      </div>

      {/* Grid of vehiculares details */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" id="inventory-grid">
        {filteredVehicles.length === 0 ? (
          <div className="col-span-full bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center" id="empty-inventory-state">
            <Layers className="w-8 h-8 text-slate-700 mx-auto mb-2" />
            <h4 className="text-xs font-bold text-slate-300">No se encontraron vehículos</h4>
            <p className="text-[11px] text-slate-500 max-w-sm mx-auto mt-1">Intente cambiar el status de filtro o refine su búsqueda de VINs.</p>
          </div>
        ) : (
          filteredVehicles.map((vehicle) => {
            const totalImportationBasis = vehicle.acquisitionCost + vehicle.freightCost + vehicle.nationalizationCost + vehicle.otherExpenses;
            
            return (
              <div 
                key={vehicle.id} 
                className="bg-slate-900 border border-slate-800 hover:border-slate-750/80 p-5 rounded-2xl relative flex flex-col justify-between transition-all"
                id={`inventory-card-${vehicle.id}`}
              >
                {/* Main branding & VIN header */}
                <div className="space-y-1">
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-[10px] text-slate-500 font-mono tracking-wider font-semibold">
                      VIN: {vehicle.vin}
                    </span>
                    <span className={`text-[9px] font-bold font-mono py-0.5 px-2 rounded-full uppercase ${getStatusBadge(vehicle.status)}`}>
                      {vehicle.status}
                    </span>
                  </div>
                  <h4 className="text-sm font-sans font-bold text-white tracking-tight">
                    {vehicle.year} {vehicle.brand} {vehicle.model}
                  </h4>
                  <p className="text-[11px] text-slate-400 italic">
                    {vehicle.notes || 'Inscripción standard sin comentarios adicionales.'}
                  </p>
                </div>

                {/* Financial overview breakdown for this vehicle */}
                <div className="space-y-2 my-4 pt-3 border-t border-slate-850 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Inversión Logística ($USD):</span>
                    <span className="font-mono text-slate-300">${totalImportationBasis.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Costo Base MXN (~16x):</span>
                    <span className="font-mono text-purple-400 font-semibold">${(totalImportationBasis * 16).toLocaleString('es-MX')}</span>
                  </div>
                  <div className="flex justify-between font-bold pt-1.5 border-t border-slate-850/50">
                    <span className="text-emerald-400">Importe Venta Sugg:</span>
                    <span className="font-mono text-emerald-400">${(vehicle.salePrice * 15 * 10).toLocaleString('es-MX')}</span>
                  </div>
                </div>

                {/* Interactive Status & action triggers */}
                <div className="flex items-center gap-2 pt-3 border-t border-slate-850 text-[10px]">
                  
                  {/* Select menu to hot-swap status instantly */}
                  <select
                    value={vehicle.status}
                    onChange={(e) => onUpdateStatus(vehicle.id, e.target.value as VehicleStatus)}
                    className="flex-1 bg-slate-950 border border-slate-850 rounded-lg p-2 font-semibold text-slate-400 outline-none"
                    id={`select-status-${vehicle.id}`}
                  >
                    <option value="Hojalateria">Hojalatería (Taller 1)</option>
                    <option value="Mecanica">Mecánica (Taller 2)</option>
                    <option value="Clima">Clima (Taller 3)</option>
                    <option value="Estetica">Estética / Detalle</option>
                    <option value="Listo para Venta">Listo para Venta</option>
                    <option value="Vendido">Vendido / Liquidado</option>
                  </select>

                  {/* Payment checkout direct action (only active if ready for sale) */}
                  {vehicle.status === 'Listo para Venta' ? (
                    <button
                      onClick={() => onOpenPayment(vehicle)}
                      className="bg-[#6366F1] hover:bg-indigo-500 text-white font-bold p-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0"
                      title="Procesar pago"
                    >
                      <DollarSign className="w-3.5 h-3.5" />
                      Vender
                    </button>
                  ) : vehicle.status === 'Vendido' ? (
                    <div className="bg-emerald-600/10 text-emerald-400 border border-emerald-500/10 p-2 rounded-lg flex items-center gap-1 font-bold shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Pagado
                    </div>
                  ) : null}

                  {/* Delete button (Only for Owner/Admin to clean databases) */}
                  {role === 'Administrador' && (
                    <button
                      onClick={() => onDeleteVehicle(vehicle.id)}
                      className="p-2.5 bg-rose-950/20 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-950 rounded-lg transition-colors cursor-pointer shrink-0"
                      title="Eliminar de Lote"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}

                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
