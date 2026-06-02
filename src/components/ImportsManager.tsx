import React, { useState } from 'react';
import { Vehicle, UserRole } from '../types';
import { 
  Ship, DollarSign, Calculator, Globe, Star, TrendingUp, 
  AlertTriangle, Edit2, Save, X, Info 
} from 'lucide-react';

interface ImportsManagerProps {
  vehicles: Vehicle[];
  onUpdateVehicle?: (updated: Vehicle) => void;
  role?: UserRole;
}

export default function ImportsManager({ vehicles, onUpdateVehicle, role }: ImportsManagerProps) {
  const [exchangeRate, setExchangeRate] = useState(16.8);
  const [usaCost, setUsaCost] = useState(12000);
  const [fleteEstimate, setFleteEstimate] = useState(1100);
  const [customsPercent, setCustomsPercent] = useState(15); // standard import duty metric

  // Editor states for admin role
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

  const isAdmin = role === 'Administrador';

  return (
    <div className="space-y-6" id="imports-workspace">
      
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-base font-sans font-bold text-white tracking-tight flex items-center gap-2">
            Consola de Logística e Importación
            {isAdmin && (
              <span className="text-[9px] bg-amber-500/10 text-amber-500 border border-amber-500/20 py-0.5 px-2 rounded-full font-mono uppercase font-bold">
                Modo Co-Editor Activo
              </span>
            )}
          </h2>
          <p className="text-[11px] text-slate-500 mt-0.5">Herramientas y simuladores para el cálculo de fletes extranjeros, cruces fronterizos y aranceles de importación.</p>
        </div>
      </div>

      {/* Editor Modal / Panel for Admin */}
      {editingVehicle && (
        <div className="bg-slate-900 border-2 border-amber-500/40 p-5 rounded-2xl space-y-4 shadow-xl shadow-black max-w-3xl animate-in fade-in zoom-in duration-200">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Edit2 className="w-5 h-5 text-amber-500" />
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Supervisión y Edición de Costas de Adquisición</h3>
                <span className="text-[10px] text-slate-400">VIN: {editingVehicle.vin} • {editingVehicle.year} {editingVehicle.brand} {editingVehicle.model}</span>
              </div>
            </div>
            <button 
              onClick={() => setEditingVehicle(null)}
              className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSaveEdit} className="grid grid-cols-1 md:grid-cols-5 gap-4 text-xs">
            
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-400 font-bold uppercase">Subasta / Adquisición ($ USD)</label>
              <input 
                type="number" required
                value={editAcquisition} onChange={(e) => setEditAcquisition(Number(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-lg p-2.5 font-mono text-white text-xs outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-400 font-bold uppercase">Flete / Transporte ($ USD)</label>
              <input 
                type="number" required
                value={editFreight} onChange={(e) => setEditFreight(Number(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-lg p-2.5 font-mono text-white text-xs outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-400 font-bold uppercase">Nacionalización ($ USD)</label>
              <input 
                type="number" required
                value={editNationalization} onChange={(e) => setEditNationalization(Number(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-lg p-2.5 font-mono text-white text-xs outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-400 font-bold uppercase">Aduana / Cruce ($ USD)</label>
              <input 
                type="number" required
                value={editOther} onChange={(e) => setEditOther(Number(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-lg p-2.5 font-mono text-white text-xs outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] text-emerald-400 font-bold uppercase">Precio Sugerido ($ USD)</label>
              <input 
                type="number" required
                value={editSalePrice} onChange={(e) => setEditSalePrice(Number(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-emerald-900 focus:border-emerald-500 rounded-lg p-2.5 font-mono text-emerald-400 text-xs outline-none font-bold"
              />
            </div>

            <div className="md:col-span-5 flex justify-end gap-3 pt-2">
              <button 
                type="button" onClick={() => setEditingVehicle(null)}
                className="bg-slate-850 hover:bg-slate-800 text-slate-300 font-semibold py-2 px-4 rounded-xl cursor-pointer"
              >
                Cancelar
              </button>
              <button 
                type="submit"
                className="bg-amber-600 hover:bg-amber-500 text-white font-semibold py-2 px-4 rounded-xl flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                Guardar Costos Finales
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Simulador de Gastos de Cruce y Nacionalización */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl lg:col-span-1 space-y-4 shadow-xl h-fit">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Calculator className="w-5 h-5 text-blue-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Simulador de Costeo de Importación</h3>
          </div>

          <div className="space-y-3 text-xs" id="imports-calc-fields">
            {/* Exchange rate */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-400 font-bold uppercase">Tipo de Cambio Promedio (MXN/USD)</label>
              <input 
                type="number" step="0.05"
                value={exchangeRate} onChange={(e) => setExchangeRate(Number(e.target.value) || 16.8)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-lg p-2.5 font-mono text-white text-xs outline-none"
              />
            </div>

            {/* Subasta value USA */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-400 font-bold uppercase">Valor de Compra en Subasta ($ USD)</label>
              <input 
                type="number" 
                value={usaCost} onChange={(e) => setUsaCost(Number(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-lg p-2.5 font-mono text-white text-xs outline-none"
              />
            </div>

            {/* Flete estimate */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-400 font-bold uppercase">Flete Terrestre o Grúa ($ USD)</label>
              <input 
                type="number"
                value={fleteEstimate} onChange={(e) => setFleteEstimate(Number(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-lg p-2.5 font-mono text-white text-xs outline-none"
              />
            </div>

            {/* Duty selector */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-400 font-bold uppercase">Arancel de Nacionalización (%)</label>
              <select
                value={customsPercent} onChange={(e) => setCustomsPercent(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-lg p-2.5 text-slate-300 text-xs outline-none"
              >
                <option value={10}>10% - Vehículos Fronterizos (Bajo Tratado)</option>
                <option value={15}>15% - Vehículos Nacionalizados (Acuerdo General)</option>
                <option value={20}>20% - Camionetas Pesadas / Pickups</option>
              </select>
            </div>
          </div>

          {/* Calibrated totals block */}
          <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl space-y-2.5 text-[11px] font-mono text-slate-400 font-medium">
            <div className="flex justify-between">
              <span>Arancel Calculado (USD):</span>
              <span className="text-white">${calculatedDuty.toLocaleString()} USD</span>
            </div>
            <div className="flex justify-between">
              <span>Total Estimado (USD):</span>
              <span className="text-white">${totalUSD.toLocaleString()} USD</span>
            </div>
            <div className="border-t border-slate-850 pt-2.5 flex justify-between font-bold text-emerald-400 text-xs">
              <span>Costo Real Total (MXN):</span>
              <span>${totalMXN.toLocaleString('es-MX', { maximumFractionDigits: 2 })} MXN</span>
            </div>
          </div>

          <div className="text-[10px] text-slate-500 leading-relaxed bg-blue-500/5 p-3 border border-blue-500/10 rounded-xl flex items-start gap-2">
            <Globe className="w-5 h-5 text-blue-400 shrink-0" />
            <span>Este simulador ayuda a calcular precios finales de venta sugeridos antes de internar el vehículo al taller físico.</span>
          </div>
        </div>

        {/* List of imported assets and logs */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Ship className="w-5 h-5 text-blue-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Histórico de Cruces & Nacionalizaciones</h3>
            </div>
            <span className="text-[10px] text-slate-500 font-bold uppercase">Balanza de Aduanas</span>
          </div>

          {/* Historical list */}
          <div className="overflow-x-auto text-[11px]" id="imports-details-wrapper">
            <table className="w-full text-left text-slate-300">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500 font-bold bg-slate-950/40">
                  <th className="py-2.5 px-2">VIN / ID</th>
                  <th className="py-2.5 px-2">Vehículo</th>
                  <th className="py-2.5 px-2 text-right">Compra</th>
                  <th className="py-2.5 px-2 text-right">Flete</th>
                  <th className="py-2.5 px-2 text-right">Nacionalización</th>
                  <th className="py-2.5 px-2 text-right">Aduana/Cruce</th>
                  <th className="py-2.5 px-2 text-right text-blue-400">Total USD</th>
                  {isAdmin && <th className="py-2.5 px-2 text-center text-amber-500">Acción</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {vehicles.map((v) => {
                  const usdTotal = v.acquisitionCost + v.freightCost + v.nationalizationCost + v.otherExpenses;
                  return (
                    <tr key={v.id} className="hover:bg-slate-800/25 transition-colors">
                      <td className="py-2.5 px-2 font-mono text-blue-400 font-semibold">{v.vin}</td>
                      <td className="py-2.5 px-2">
                        <span className="font-semibold text-slate-200 block leading-tight">{v.year} {v.brand} {v.model}</span>
                        {v.status && (
                          <span className="text-[8px] tracking-wide inline-block bg-slate-950 text-slate-400 border border-slate-850 px-1 py-0.2 rounded uppercase font-bold mt-0.5">
                            {v.status}
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-2 text-right font-mono">${v.acquisitionCost.toLocaleString()}</td>
                      <td className="py-2.5 px-2 text-right font-mono">${v.freightCost.toLocaleString()}</td>
                      <td className="py-2.5 px-2 text-right font-mono">${v.nationalizationCost.toLocaleString()}</td>
                      <td className="py-2.5 px-2 text-right font-mono">${v.otherExpenses.toLocaleString()}</td>
                      <td className="py-2.5 px-2 text-right font-mono text-blue-400 font-semibold">${usdTotal.toLocaleString()}</td>
                      
                      {isAdmin && (
                        <td className="py-2.5 px-2 text-center">
                          <button
                            onClick={() => handleStartEdit(v)}
                            className="bg-amber-600/10 hover:bg-amber-500 text-amber-400 hover:text-white border border-amber-500/20 rounded px-2.5 py-1 text-[10px] font-bold cursor-pointer transition-colors"
                            title="Editar Costos Administrativos"
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

          {/* Advice card */}
          <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="space-y-0.5 text-[11px] text-slate-400">
              <span className="font-bold text-white block">Aviso Logístico Importante</span>
              <span>Todos los cruces aduanales deben estar respaldados por el pedimento original del agente aduanal antes de la pre-exhibición.</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
