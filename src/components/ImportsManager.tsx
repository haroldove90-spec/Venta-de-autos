import React, { useState } from 'react';
import { Vehicle, UserRole, VehicleStatus } from '../types';
import { 
  Ship, DollarSign, Calculator, Globe, Star, TrendingUp, 
  AlertTriangle, Edit2, Save, X, Info, PlusCircle, CheckCircle, 
  ArrowRight, ShieldCheck, HelpCircle, FileText
} from 'lucide-react';

interface ImportsManagerProps {
  vehicles: Vehicle[];
  onUpdateVehicle?: (updated: Vehicle) => void;
  onAddVehicle?: (newVehicle: Omit<Vehicle, 'id'>) => void;
  role?: UserRole;
}

export default function ImportsManager({ vehicles, onUpdateVehicle, onAddVehicle, role }: ImportsManagerProps) {
  const [exchangeRate, setExchangeRate] = useState(16.8);
  const [usaCost, setUsaCost] = useState(12000);
  const [fleteEstimate, setFleteEstimate] = useState(1100);
  const [customsPercent, setCustomsPercent] = useState(15); 

  // New vehicle form states
  const [newBrand, setNewBrand] = useState('');
  const [newModel, setNewModel] = useState('');
  const [newYear, setNewYear] = useState(new Date().getFullYear());
  const [newVin, setNewVin] = useState('');
  const [newAcquistionCost, setNewAcquisitionCost] = useState(0);
  const [newFreightCost, setNewFreightCost] = useState(0);
  const [newNationalizationCost, setNewNationalizationCost] = useState(0);
  const [newBridgeCost, setNewBridgeCost] = useState(0);
  const [newSalePrice, setNewSalePrice] = useState(0);
  const [newNotes, setNewNotes] = useState('');
  const [newFirstStatus, setNewFirstStatus] = useState<VehicleStatus>('Hojalateria');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // Active state for selective physical activation on the list
  const [activationTargetId, setActivationTargetId] = useState<string | null>(null);
  const [activationStatus, setActivationStatus] = useState<VehicleStatus>('Hojalateria');

  // Editor states for admin/comprador
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [editAcquisition, setEditAcquisition] = useState(0);
  const [editFreight, setEditFreight] = useState(0);
  const [editNationalization, setEditNationalization] = useState(0);
  const [editOther, setEditOther] = useState(0);
  const [editSalePrice, setEditSalePrice] = useState(0);

  // Calculations for simulator
  const calculatedDuty = (usaCost * customsPercent) / 100;
  const totalUSD = usaCost + fleteEstimate + calculatedDuty;
  const totalMXN = totalUSD * exchangeRate;

  const handleStartEdit = (v: Vehicle) => {
    setEditingVehicle(v);
    setEditAcquisition(v.acquisitionCost);
    setEditFreight(v.freightCost);
    setEditNationalization(v.nationalizationCost);
    setEditOther(v.otherExpenses);
    setEditSalePrice(v.salePrice);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVehicle || !onUpdateVehicle) return;

    const updated: Vehicle = {
      ...editingVehicle,
      acquisitionCost: Number(editAcquisition) || 0,
      freightCost: Number(editFreight) || 0,
      nationalizationCost: Number(editNationalization) || 0,
      otherExpenses: Number(editOther) || 0,
      salePrice: Number(editSalePrice) || 0,
    };

    onUpdateVehicle(updated);
    setEditingVehicle(null);
  };

  // Autocomplete values from the active simulator values!
  const handleAutofillSimulatorValues = () => {
    setNewAcquisitionCost(usaCost);
    setNewFreightCost(fleteEstimate);
    setNewNationalizationCost(calculatedDuty);
    setNewBridgeCost(250); // standard average border bridge crossing fee
    setNewSalePrice(Math.round((usaCost + fleteEstimate + calculatedDuty) * 1.35)); // 35% suggested margin mark-up
    setFormSuccess('Valores del simulador aplicados correctamente al formulario.');
    setTimeout(() => setFormSuccess(''), 3000);
  };

  // Submit new unit handler
  const handleCreateVehicleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    // Strictly enforce VIN code requirement
    const trimmedVin = newVin.trim();
    if (!trimmedVin) {
      setFormError('El Número de Serie (VIN) de la unidad es requerido de forma obligatoria.');
      return;
    }

    // Check for duplicate VIN files
    const duplicate = vehicles.find(v => v.vin.toLowerCase() === trimmedVin.toLowerCase());
    if (duplicate) {
      setFormError(`El VIN "${trimmedVin}" ya está registrado en el expediente del auto "${duplicate.brand} ${duplicate.model}".`);
      return;
    }

    if (!newBrand.trim()) {
      setFormError('La marca del vehículo es un campo requerido.');
      return;
    }

    if (!newModel.trim()) {
      setFormError('El modelo del vehículo es un campo requerido.');
      return;
    }

    if (!onAddVehicle) {
      setFormError('El sistema no está listo para registrar vehículos en memoria. Contacte soporte.');
      return;
    }

    // Call state register with physical entrance pending
    onAddVehicle({
      vin: trimmedVin,
      brand: newBrand.trim(),
      model: newModel.trim(),
      year: Number(newYear) || new Date().getFullYear(),
      acquisitionCost: Number(newAcquistionCost) || 0,
      freightCost: Number(newFreightCost) || 0,
      nationalizationCost: Number(newNationalizationCost) || 0,
      otherExpenses: Number(newBridgeCost) || 0,
      salePrice: Number(newSalePrice) || 0,
      status: newFirstStatus,
      notes: newNotes.trim() || 'Unidad importada por gestor logístico',
      isActivatedInPipeline: false // Starts as inactive transit until formally admitted physically
    });

    setFormSuccess(`¡Unidad ${newBrand} ${newModel} (VIN: ${trimmedVin}) registrada en tránsito exitosamente.`);
    
    // Clear inputs
    setNewBrand('');
    setNewModel('');
    setNewVin('');
    setNewNotes('');
    setNewAcquisitionCost(0);
    setNewFreightCost(0);
    setNewNationalizationCost(0);
    setNewBridgeCost(0);
    setNewSalePrice(0);

    setTimeout(() => {
      setFormSuccess('');
    }, 4000);
  };

  // Perform physical entry trigger of a vehicle
  const handleActivatePhysicalEntry = (id: string, stage: VehicleStatus) => {
    if (!onUpdateVehicle) return;
    const item = vehicles.find(v => v.id === id);
    if (!item) return;

    onUpdateVehicle({
      ...item,
      status: stage,
      isActivatedInPipeline: true // Formally marked as physical inside boundaries of workshops
    });

    setActivationTargetId(null);
  };

  const isCompradorOrAdmin = role === 'Administrador' || role === 'Comprador';
  const isAdmin = role === 'Administrador';

  // Group vehicles into Transit vs Completed lists
  const transitVehicles = vehicles.filter(v => v.isActivatedInPipeline === false);
  const activeAndSoldVehicles = vehicles.filter(v => v.isActivatedInPipeline !== false);

  return (
    <div className="space-y-6" id="imports-workspace-view">
      
      {/* Dynamic Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-xl font-sans font-bold text-slate-800 tracking-tight flex items-center gap-2">
            Consola Logística de Importación y Compras
            <span className="text-xs bg-indigo-50 text-indigo-600 border border-indigo-150 py-0.5 px-2 rounded-full font-mono font-bold">
              Rol: {role === 'Administrador' ? 'Dueño / Admin' : 'Comprador'}
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Registro inicial de unidades de subastas, desglose de fletes terrestres, impuestos de nacionalización y trámites de cruces.
          </p>
        </div>
        <div className="text-xs bg-white border border-slate-200 py-2 px-3 rounded-xl shadow-sm text-slate-600 font-medium">
          Dólar de Referencia: <strong className="font-mono text-slate-900">${exchangeRate} MXN</strong>
        </div>
      </div>

      {/* Editor Modal for editing cost files */}
      {editingVehicle && (
        <div className="bg-white border border-amber-200 p-5 rounded-2xl space-y-4 shadow-xl max-w-3xl animate-in fade-in zoom-in duration-200" id="historical-costs-editor">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
                <Edit2 className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Supervisión y Edición de Costes de Importación</h3>
                <span className="text-[10px] text-slate-500">Expediente: {editingVehicle.year} {editingVehicle.brand} {editingVehicle.model} (VIN: {editingVehicle.vin})</span>
              </div>
            </div>
            <button 
              onClick={() => setEditingVehicle(null)}
              className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-800 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSaveEdit} className="grid grid-cols-1 md:grid-cols-5 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-500 font-bold uppercase">Subasta Adquisición ($ USD)</label>
              <input 
                type="number" required
                value={editAcquisition} onChange={(e) => setEditAcquisition(Number(e.target.value) || 0)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-amber-500 rounded-lg p-2.5 font-mono text-slate-800 text-xs outline-none focus:bg-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-500 font-bold uppercase">Flete / Traslado ($ USD)</label>
              <input 
                type="number" required
                value={editFreight} onChange={(e) => setEditFreight(Number(e.target.value) || 0)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-amber-500 rounded-lg p-2.5 font-mono text-slate-800 text-xs outline-none focus:bg-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-500 font-bold uppercase">Nacionalización ($ USD)</label>
              <input 
                type="number" required
                value={editNationalization} onChange={(e) => setEditNationalization(Number(e.target.value) || 0)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-amber-500 rounded-lg p-2.5 font-mono text-slate-800 text-xs outline-none focus:bg-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-500 font-bold uppercase">Aduana / Cruce ($ USD)</label>
              <input 
                type="number" required
                value={editOther} onChange={(e) => setEditOther(Number(e.target.value) || 0)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-amber-500 rounded-lg p-2.5 font-mono text-slate-800 text-xs outline-none focus:bg-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] text-emerald-600 font-bold uppercase">Precio Sugerido ($ USD)</label>
              <input 
                type="number" required
                value={editSalePrice} onChange={(e) => setEditSalePrice(Number(e.target.value) || 0)}
                className="w-full bg-emerald-50 border border-emerald-100 focus:border-emerald-500 rounded-lg p-2.5 font-mono text-emerald-700 text-xs outline-none font-bold focus:bg-white"
              />
            </div>

            <div className="md:col-span-5 flex justify-end gap-3 pt-2">
              <button 
                type="button" onClick={() => setEditingVehicle(null)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold py-2 px-4 rounded-xl cursor-pointer"
              >
                Cancelar
              </button>
              <button 
                type="submit"
                className="bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2 px-4 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Save className="w-4 h-4" />
                Guardar Costos Finales
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Main Grid View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (Forms and Simulator) - spans 5 */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* MÓDULO 1: Registro Inicial de la Unidad Form */}
          {isCompradorOrAdmin ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                    <PlusCircle className="w-4 h-4" />
                  </span>
                  <div>
                    <h2 className="text-xs font-bold text-slate-850 uppercase tracking-wider">Alta Inicial de Unidad en Tránsito</h2>
                    <p className="text-[9px] text-slate-500">Abre expediente único asociado físicamente con VIN.</p>
                  </div>
                </div>
                
                {/* Auto-fill tool */}
                <button
                  type="button"
                  onClick={handleAutofillSimulatorValues}
                  className="text-[9px] bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-bold py-1 px-2.5 border border-indigo-150 rounded-lg cursor-pointer transition-all"
                  title="Copiar del simulador de costos de la derecha"
                >
                  Autollena con Simulador
                </button>
              </div>

              {formError && (
                <div className="bg-rose-50 border-l-4 border-rose-500 p-3 rounded-r-xl flex items-center gap-2 text-[10px] text-rose-700 font-medium">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {formSuccess && (
                <div className="bg-emerald-50 border-l-4 border-emerald-500 p-3 rounded-r-xl flex items-center gap-2 text-[10px] text-emerald-700 font-medium">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span>{formSuccess}</span>
                </div>
              )}

              <form onSubmit={handleCreateVehicleSubmit} className="space-y-4 text-xs">
                
                {/* Visual Identification Block */}
                <div className="bg-slate-50/50 p-3.5 border border-slate-100 rounded-xl space-y-3">
                  <span className="text-[9px] uppercase tracking-wider font-bold text-slate-400 block pb-1 border-b border-slate-100">
                    1. Identificación del Vehículo
                  </span>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] text-slate-500 font-bold uppercase">VIN / Núm. de Serie (Obligatorio)</label>
                      <input 
                        type="text" required placeholder="Ej: 2019050607"
                        value={newVin} onChange={(e) => setNewVin(e.target.value)}
                        className="w-full bg-white border border-slate-200 focus:border-emerald-500 rounded-lg p-2 font-mono text-slate-800 text-xs outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] text-slate-500 font-bold uppercase font-sans">Marca / Fabricante</label>
                      <input 
                        type="text" required placeholder="Ej: Toyota"
                        value={newBrand} onChange={(e) => setNewBrand(e.target.value)}
                        className="w-full bg-white border border-slate-200 focus:border-emerald-500 rounded-lg p-2 font-medium text-slate-800 text-xs outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] text-slate-500 font-bold uppercase">Modelo / Línea</label>
                      <input 
                        type="text" required placeholder="Ej: Tacoma Sport"
                        value={newModel} onChange={(e) => setNewModel(e.target.value)}
                        className="w-full bg-white border border-slate-200 focus:border-emerald-500 rounded-lg p-2 font-medium text-slate-800 text-xs outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] text-slate-500 font-bold uppercase">Año Modelo</label>
                      <input 
                        type="number" required min="1990" max={new Date().getFullYear() + 2}
                        value={newYear} onChange={(e) => setNewYear(Number(e.target.value) || 2020)}
                        className="w-full bg-white border border-slate-200 focus:border-emerald-500 rounded-lg p-2 font-mono text-slate-800 text-xs outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Costs breakdown block */}
                <div className="bg-slate-50/50 p-3.5 border border-slate-100 rounded-xl space-y-3">
                  <span className="text-[9px] uppercase tracking-wider font-bold text-slate-400 block pb-1 border-b border-slate-100">
                    2. Desglose de Gastos de Importación ($ USD)
                  </span>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] text-slate-500 font-bold uppercase">Precio Subasta / Compra</label>
                      <div className="relative">
                        <span className="absolute left-2.5 top-2 text-slate-400 font-mono font-semibold">$</span>
                        <input 
                          type="number" min="0" required
                          value={newAcquistionCost} onChange={(e) => setNewAcquisitionCost(Number(e.target.value) || 0)}
                          className="w-full bg-white border border-slate-200 focus:border-emerald-500 rounded-lg p-2 pl-6 font-mono text-slate-800 text-xs outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] text-slate-500 font-bold uppercase">Flete Terrestre (Frontera)</label>
                      <div className="relative">
                        <span className="absolute left-2.5 top-2 text-slate-400 font-mono font-semibold">$</span>
                        <input 
                          type="number" min="0" required
                          value={newFreightCost} onChange={(e) => setNewFreightCost(Number(e.target.value) || 0)}
                          className="w-full bg-white border border-slate-200 focus:border-emerald-500 rounded-lg p-2 pl-6 font-mono text-slate-800 text-xs outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] text-slate-500 font-bold uppercase">Aduana / Nacionalización</label>
                      <div className="relative">
                        <span className="absolute left-2.5 top-2 text-slate-400 font-mono font-semibold">$</span>
                        <input 
                          type="number" min="0" required
                          value={newNationalizationCost} onChange={(e) => setNewNationalizationCost(Number(e.target.value) || 0)}
                          className="w-full bg-white border border-slate-200 focus:border-emerald-500 rounded-lg p-2 pl-6 font-mono text-slate-800 text-xs outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] text-slate-500 font-bold uppercase font-mono">Cruce de Puente / Aduanas</label>
                      <div className="relative">
                        <span className="absolute left-2.5 top-2 text-slate-400 font-mono font-semibold">$</span>
                        <input 
                          type="number" min="0" required
                          value={newBridgeCost} onChange={(e) => setNewBridgeCost(Number(e.target.value) || 0)}
                          className="w-full bg-white border border-slate-200 focus:border-emerald-500 rounded-lg p-2 pl-6 font-mono text-slate-800 text-xs outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div className="space-y-1">
                      <label className="text-[9px] text-emerald-600 font-bold uppercase">Precio Sugerido Venta</label>
                      <div className="relative">
                        <span className="absolute left-2.5 top-2 text-emerald-500 font-mono font-semibold">$</span>
                        <input 
                          type="number" min="0" required
                          value={newSalePrice} onChange={(e) => setNewSalePrice(Number(e.target.value) || 0)}
                          className="w-full bg-emerald-50/40 border border-emerald-100 focus:border-emerald-500 text-emerald-700 rounded-lg p-2 pl-6 font-mono text-xs outline-none font-bold"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] text-slate-500 font-bold uppercase">Destino Taller Previsto</label>
                      <select
                        value={newFirstStatus} onChange={(e) => setNewFirstStatus(e.target.value as VehicleStatus)}
                        className="w-full bg-white border border-slate-200 focus:border-emerald-500 rounded-lg p-2 text-slate-700 text-xs outline-none"
                      >
                        <option value="Hojalateria">Hojalatería (Taller 1)</option>
                        <option value="Mecanica">Mecánica (Taller 2)</option>
                        <option value="Clima">Aire Acondicionado (Taller 3)</option>
                        <option value="Estetica">Estética / Limpieza</option>
                        <option value="Listo para Venta">Listo para Exhibición (Stock)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Additional notes */}
                <div className="space-y-1">
                  <label className="text-[9px] text-slate-500 font-bold uppercase">Observaciones de Adquisición</label>
                  <textarea 
                    value={newNotes} onChange={(e) => setNewNotes(e.target.value)}
                    placeholder="Ej: Comprado en subasta Copart Houston con golpe menor. Requiere laminado en salpicadera."
                    className="w-full bg-white border border-slate-200 focus:border-emerald-500 rounded-lg p-3 text-slate-700 text-xs outline-none"
                    rows={2}
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-emerald-500/10 transition-colors"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Inscribir Expediente de Importación</span>
                </button>
              </form>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm text-center py-6 text-slate-500 text-xs">
              <ShieldCheck className="w-8 h-8 text-amber-500 mx-auto mb-2" />
              <span>El registro inicial de contratos e inscripciones está restringido para consultores de taller o esteticistas. Su rol ({role}) tiene acceso de solo lectura.</span>
            </div>
          )}

          {/* SIMULADOR DE COSTEO DE IMPORTACIÓN */}
          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <span className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                <Calculator className="w-4 h-4" />
              </span>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Simulador de Costeo Logístico</h3>
            </div>

            <div className="space-y-3 text-xs" id="imports-calc-fields">
              <div className="space-y-1">
                <label className="text-[9px] text-slate-500 font-bold uppercase">Tipo de Cambio Aduanal (MXN/USD)</label>
                <input 
                  type="number" step="0.05"
                  value={exchangeRate} onChange={(e) => setExchangeRate(Number(e.target.value) || 16.8)}
                  className="w-full bg-white border border-slate-200 focus:border-emerald-500 rounded-lg p-2 font-mono text-slate-800 text-xs outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] text-slate-500 font-bold uppercase">Valor Adquisición en Subasta ($ USD)</label>
                <input 
                  type="number" 
                  value={usaCost} onChange={(e) => setUsaCost(Number(e.target.value) || 0)}
                  className="w-full bg-white border border-slate-200 focus:border-emerald-500 rounded-lg p-2 font-mono text-slate-800 text-xs outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] text-slate-500 font-bold uppercase">Costo Estimado de Flete ($ USD)</label>
                <input 
                  type="number"
                  value={fleteEstimate} onChange={(e) => setFleteEstimate(Number(e.target.value) || 0)}
                  className="w-full bg-white border border-slate-200 focus:border-emerald-500 rounded-lg p-2 font-mono text-slate-800 text-xs outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] text-slate-500 font-bold uppercase">Tratamiento de Aranceles (%)</label>
                <select
                  value={customsPercent} onChange={(e) => setCustomsPercent(Number(e.target.value))}
                  className="w-full bg-white border border-slate-200 focus:border-emerald-500 rounded-lg p-2 text-slate-700 text-xs outline-none font-medium text-slate-800"
                >
                  <option value={10}>10% - Cruce Fronterizo (Pedimento L-1)</option>
                  <option value={15}>15% - Internación Nacional Completa</option>
                  <option value={20}>20% - Camionetas Pesadas / Pickups</option>
                </select>
              </div>
            </div>

            {/* Calibrated totals block */}
            <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl space-y-2 text-[11px] font-mono text-slate-500 font-medium">
              <div className="flex justify-between">
                <span>Arancel Provisional:</span>
                <span className="text-slate-800 font-bold">${calculatedDuty.toLocaleString()} USD</span>
              </div>
              <div className="flex justify-between">
                <span>Total Estimado (USD):</span>
                <span className="text-slate-800 font-bold">${totalUSD.toLocaleString()} USD</span>
              </div>
              <div className="border-t border-slate-200 pt-2 flex justify-between font-bold text-indigo-650 text-[11px]">
                <span>Costo de Entrada en Pesos:</span>
                <span>${Math.round(totalMXN).toLocaleString('es-MX')} MXN</span>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column (Tables log for Cruces & Pendientes activation) - spans 7 */}
        <div className="lg:col-span-7 space-y-6 text-xs">
          
          {/* MÓDULO 3: Activación en el Pipeline / Kanban */}
          {isCompradorOrAdmin && (
            <div className="bg-white border border-amber-100 rounded-2xl p-5 shadow-sm space-y-3">
              <div className="flex items-center gap-2 border-b border-amber-50 pb-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                <div>
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest flex items-center gap-2">
                    Módulo 3: Activar Entrada Física (Frente de Lote)
                  </h3>
                  <p className="text-[10px] text-slate-500">Unidades adquiridas que acaban de llegar físicamente al lote. Asígnalas al taller correspondiente para colocarlas en el Kanban activo.</p>
                </div>
              </div>

              {transitVehicles.length === 0 ? (
                <div className="border border-dashed border-slate-250 py-8 px-4 rounded-xl text-center text-slate-400 font-sans">
                  <CheckCircle className="w-6 h-6 text-emerald-500 mx-auto mb-1.5" />
                  <span className="block font-bold text-slate-700">Todas las unidades están activas</span>
                  <span className="text-[10px] text-slate-500">No hay vehículos en tránsito pendientes de ingreso físico.</span>
                </div>
              ) : (
                <div className="space-y-3">
                  {transitVehicles.map(v => {
                    const totalAdquisitionUSD = v.acquisitionCost + v.freightCost + v.nationalizationCost + v.otherExpenses;
                    const isAdmittedTarget = activationTargetId === v.id;

                    return (
                      <div key={v.id} className="bg-amber-50/30 border border-amber-100 rounded-xl p-3.5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all hover:bg-amber-50/50">
                        <div className="space-y-1 shrink-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-800">{v.year} {v.brand} {v.model}</span>
                            <span className="text-[9px] bg-slate-100 text-slate-600 font-semibold py-0.5 px-1.5 rounded font-mono">
                              VIN: {v.vin}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            Costo de Importación: <strong className="text-slate-700">${totalAdquisitionUSD.toLocaleString()} USD</strong> (${Math.round(totalAdquisitionUSD * exchangeRate).toLocaleString('es-MX')} MXN)
                          </div>
                          {v.notes && <div className="text-[10px] text-slate-400 italic font-medium">Nota: "{v.notes}"</div>}
                        </div>

                        {/* Interactive trigger controls */}
                        <div className="w-full md:w-auto flex flex-col items-end gap-1.5 pt-2.5 md:pt-0 border-t md:border-t-0 border-amber-100">
                          {isAdmittedTarget ? (
                            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-2 duration-150">
                              <select
                                value={activationStatus}
                                onChange={(e) => setActivationStatus(e.target.value as VehicleStatus)}
                                className="bg-white border border-slate-350 rounded-lg p-1.5 text-[10px] font-bold text-slate-750 outline-none cursor-pointer"
                              >
                                <option value="Hojalateria">Hojalatería (Taller 1)</option>
                                <option value="Mecanica">Mecánica (Taller 2)</option>
                                <option value="Clima">Preclima (Taller 3)</option>
                                <option value="Estetica">Estética / Limpieza</option>
                                <option value="Listo para Venta">Listo para Exhibir</option>
                              </select>
                              <button
                                onClick={() => handleActivatePhysicalEntry(v.id, activationStatus)}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1.5 px-2.5 rounded-lg text-[10px] flex items-center gap-1 cursor-pointer transition-colors"
                              >
                                <span>Confirmar</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => setActivationTargetId(null)}
                                className="p-1.5 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-800 cursor-pointer"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setActivationTargetId(v.id);
                                setActivationStatus(v.status || 'Hojalateria');
                              }}
                              className="w-full md:w-auto bg-amber-500 hover:bg-amber-600 text-white font-bold py-1.5 px-3 rounded-lg text-[10px] flex items-center justify-center gap-1.5 cursor-pointer shadow-sm shadow-amber-500/10 transition-colors"
                            >
                              <Ship className="w-3.5 h-3.5" />
                              <span>Dar Entrada al Lote</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* HISTÓRICO DE CRUCES & NACIONALIZACIONES TABLE */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                  <FileText className="w-4 h-4" />
                </span>
                <h3 className="text-xs font-bold text-slate-850 uppercase tracking-wider">Carpeta de Unidades del Concesionario</h3>
              </div>
              <span className="text-[10px] text-slate-400 font-bold bg-slate-50 border border-slate-150 py-0.5 px-2 rounded-full uppercase">
                {activeAndSoldVehicles.length} Registros
              </span>
            </div>

            {/* Table layout responsive */}
            <div className="overflow-x-auto text-[10.5px]">
              <table className="w-full text-left text-slate-600">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-bold bg-slate-50/50">
                    <th className="py-2.5 px-2">VIN / ID</th>
                    <th className="py-2.5 px-2">Vehículo</th>
                    <th className="py-2.5 px-2 text-right">Compra USD</th>
                    <th className="py-2.5 px-2 text-right">Flete USD</th>
                    <th className="py-2.5 px-2 text-right font-mono">Arancel</th>
                    <th className="py-2.5 px-2 text-right font-mono">Cruce</th>
                    <th className="py-2.5 px-2 text-right text-indigo-650 font-bold">Total USD</th>
                    <th className="py-2.5 px-2 text-center text-slate-500 font-sans">Estado</th>
                    {isCompradorOrAdmin && <th className="py-2.5 px-2 text-center">Acción</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {vehicles.map((v) => {
                    const usdTotal = v.acquisitionCost + v.freightCost + v.nationalizationCost + v.otherExpenses;
                    const isTransit = v.isActivatedInPipeline === false;

                    return (
                      <tr key={v.id} className={`hover:bg-slate-50/50 transition-colors ${isTransit ? 'bg-amber-50/15' : ''}`}>
                        <td className="py-2.5 px-2 font-mono text-indigo-600 font-semibold">{v.vin}</td>
                        <td className="py-2.5 px-2 font-medium text-slate-800">
                          <span className="block leading-tight font-sans font-bold">{v.year} {v.brand} {v.model}</span>
                          {isTransit && (
                            <span className="text-[8px] bg-amber-50 text-amber-600 border border-amber-100 tracking-wider py-0.2 px-1 rounded uppercase font-bold mt-0.5 inline-block">
                              Tránsito / Arribando
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-2 text-right font-mono text-slate-700">${v.acquisitionCost.toLocaleString()}</td>
                        <td className="py-2.5 px-2 text-right font-mono text-slate-700">${v.freightCost.toLocaleString()}</td>
                        <td className="py-2.5 px-2 text-right font-mono text-slate-700">${v.nationalizationCost.toLocaleString()}</td>
                        <td className="py-2.5 px-2 text-right font-mono text-slate-700">${v.otherExpenses.toLocaleString()}</td>
                        <td className="py-2.5 px-2 text-right font-mono text-indigo-650 font-extrabold">${usdTotal.toLocaleString()}</td>
                        
                        <td className="py-2.5 px-2 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                            v.status === 'Vendido' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                            v.status === 'Listo para Venta' ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' :
                            'bg-violet-50 text-violet-600 border border-violet-100'
                          }`}>
                            {v.status}
                          </span>
                        </td>

                        {isCompradorOrAdmin && (
                          <td className="py-2.5 px-1 text-center">
                            <button
                              onClick={() => handleStartEdit(v)}
                              className="bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 rounded px-2 py-1 text-[9px] font-bold cursor-pointer transition-colors"
                              title="Editar Expediente de Gastos"
                            >
                              Editar
                            </button>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="bg-[#F4F4F5] p-3 rounded-xl border border-zinc-200 flex items-start gap-2.5 text-[10px] text-slate-600 leading-relaxed">
              <Info className="w-5 h-5 text-zinc-500 shrink-0 mt-0.5" />
              <span>
                <strong>Aviso Copart/Adsubasta:</strong> El comprador tiene la obligación legal de registrar todos los impuestos de importación de forma pormenorizada por número de serie (VIN) antes de dar entrada del vehículo a los talleres de reparación o estética en la parte superior.
              </span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
