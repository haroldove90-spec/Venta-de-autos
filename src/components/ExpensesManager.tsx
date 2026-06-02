import React, { useState } from 'react';
import { SupplyExpense, UserRole } from '../types';
import { 
  Sparkles, ShoppingBag, PlusCircle, Trash2, ShieldAlert, 
  Tag, Box, Layers, AlertCircle, BookmarkCheck
} from 'lucide-react';

interface ExpensesManagerProps {
  supplies: SupplyExpense[];
  onAddSupply: (newSupply: Omit<SupplyExpense, 'id'>) => void;
  onDeleteSupply?: (id: string) => void;
  role: UserRole;
}

export default function ExpensesManager({ 
  supplies, 
  onAddSupply, 
  onDeleteSupply, 
  role 
}: ExpensesManagerProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<string>('Productos de lavado (Champú)');
  const [cost, setCost] = useState(0);

  // Users with authorized FULL access (Acceso Completo) to global supplies
  const hasFullAccess = role === 'Administrador' || role === 'Estetica' || role === 'Contador';

  const handleAddSupplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || cost <= 0) return;

    onAddSupply({
      name,
      category,
      cost: Number(cost),
      date: new Date().toISOString().slice(0, 10)
    });

    // Reset fields
    setName('');
    setCost(0);
  };

  // Pre-calculate supplies
  const totalSuppliesCost = supplies.reduce((sum, s) => sum + s.cost, 0);

  // Group costs by aesthetic categories for quick summary display
  const getSubtotalByCategory = (cat: string) => {
    return supplies
      .filter(s => s.category.toLowerCase().includes(cat.toLowerCase()))
      .reduce((sum, s) => sum + s.cost, 0);
  };

  return (
    <div className="space-y-6" id="expenses-workspace">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-lg font-sans font-black text-slate-800 tracking-tight flex items-center gap-2">
            Módulo 5: Control de Insumos y Suministros Globales
            <span className="text-xs bg-purple-50 text-purple-600 border border-purple-100 py-0.5 px-2.5 rounded-full font-mono font-bold uppercase">
              Acceso Completo
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Gestión integral de consumibles indirectos que afectan el balance comercial y acondicionamiento final.
          </p>
        </div>
        
        <div className="flex items-center gap-2 text-xs bg-white border border-slate-200 py-2 px-3 rounded-xl shadow-sm text-slate-600">
          <Sparkles className="w-4 h-4 text-purple-500" />
          <span className="font-semibold">Control de Merma y Cosméticos</span>
        </div>
      </div>

      {/* Aesthetic categories subtotal cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3" id="supplies-summary-grid">
        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm hover:border-slate-300 transition-all text-center">
          <span className="text-[10px] text-purple-600 font-bold uppercase tracking-wider block">Productos de Lavado (Champú)</span>
          <span className="text-sm font-mono font-black text-slate-800 block mt-1">
            ${getSubtotalByCategory('washed').toLocaleString('es-MX') || getSubtotalByCategory('lavado').toLocaleString('es-MX')}
          </span>
        </div>
        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm hover:border-slate-300 transition-all text-center">
          <span className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider block">Almohadillas / Microfibras</span>
          <span className="text-sm font-mono font-black text-slate-800 block mt-1">
            ${getSubtotalByCategory('pad').toLocaleString('es-MX') || getSubtotalByCategory('microfibra').toLocaleString('es-MX') || getSubtotalByCategory('almohadilla').toLocaleString('es-MX')}
          </span>
        </div>
        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm hover:border-slate-300 transition-all text-center">
          <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider block">Pulse / Ceras y Abrillantador</span>
          <span className="text-sm font-mono font-black text-slate-800 block mt-1">
            ${getSubtotalByCategory('wax').toLocaleString('es-MX') || getSubtotalByCategory('pulimento').toLocaleString('es-MX') || getSubtotalByCategory('cera').toLocaleString('es-MX')}
          </span>
        </div>
        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm hover:border-slate-300 transition-all text-center">
          <span className="text-[10px] text-amber-600 font-bold uppercase tracking-wider block">Aromatizantes Premium</span>
          <span className="text-sm font-mono font-black text-slate-800 block mt-1">
            ${getSubtotalByCategory('aroma').toLocaleString('es-MX') || getSubtotalByCategory('aromatizante').toLocaleString('es-MX')}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Register supplies expense Form */}
        <div className="bg-white border border-slate-200 p-5 rounded-3xl lg:col-span-1 shadow-sm flex flex-col justify-between h-fit">
          <div>
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
              <PlusCircle className="w-5 h-5 text-purple-600" />
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Adquirir Insumo Registrado</h3>
            </div>

            {hasFullAccess ? (
              <form onSubmit={handleAddSupplySubmit} className="space-y-4">
                
                {/* Supply Name */}
                <div className="space-y-1 text-xs">
                  <label className="text-[10px] text-slate-500 font-bold uppercase">Nombre del Producto / Consumible</label>
                  <input 
                    type="text" required placeholder="Llantil brillo 5L, kit de microfibras premium"
                    value={name} onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-purple-500 focus:bg-white rounded-xl p-2.5 text-xs text-slate-850 outline-none transition-all"
                  />
                </div>

                {/* Category classification */}
                <div className="space-y-1 text-xs">
                  <label className="text-[10px] text-slate-500 font-bold uppercase">Clasificación de Inventario de Estética</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-purple-500 focus:bg-white rounded-xl p-2.5 text-slate-800 text-xs outline-none transition-all"
                  >
                    <option value="Productos de lavado (Champú)">Productos de lavado (Champú)</option>
                    <option value="Almohadillas / Microfibras">Almohadillas / Microfibras</option>
                    <option value="Aromatizantes">Aromatizantes</option>
                    <option value="Pulimento / Ceras">Pulimento / Ceras</option>
                    <option value="Taller de colisión / Insumos">Taller de colisión / Insumos</option>
                    <option value="Oficina y Lote">Oficina y Lote</option>
                  </select>
                </div>

                {/* Cost */}
                <div className="space-y-1 text-xs">
                  <label className="text-[10px] text-purple-600 font-bold uppercase">Monto de la Factura ($ MXN)</label>
                  <input 
                    type="number" required placeholder="1200"
                    value={cost > 0 ? cost : ''} onChange={(e) => setCost(Number(e.target.value) || 0)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-purple-500 focus:bg-white rounded-xl p-2.5 font-mono text-purple-600 text-xs outline-none font-bold"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-2.5 rounded-xl text-xs flex justify-center items-center gap-1.5 shadow shadow-purple-600/10 cursor-pointer transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  Registrar Factura de Insumo
                </button>

              </form>
            ) : (
              <div className="p-4 bg-amber-50 border border-amber-200 text-amber-700 text-xs rounded-xl flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Privilegios Insuficientes</span>
                  <span className="mt-0.5 block text-[11px]">Su rol actual de <strong>{role}</strong> no cuenta con autorización de escritura en esta bitácora financiera. Solo el Encargado de Estética, Contabilidad o Administración General pueden registrar facturas globales.</span>
                </div>
              </div>
            )}
          </div>

          <div className="bg-slate-50 border border-slate-150 p-3 rounded-xl text-[10px] text-slate-500 mt-4 leading-relaxed font-semibold">
            Consumos indirectos debidamente auditados para deducir costos indirectos y resguardar margen operativo del lote.
          </div>
        </div>

        {/* Audit lists representing detailer supplies */}
        <div className="bg-white border border-slate-200 p-5 rounded-3xl lg:col-span-2 space-y-4 shadow-sm">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-purple-600" />
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Bitácora de Suministros Auditados</h3>
            </div>
            <span className="text-[10px] font-mono text-slate-500 font-bold bg-slate-100 py-1 px-2.5 border border-slate-200 rounded-lg">
              Histórico Operativo
            </span>
          </div>

          <div className="overflow-y-auto max-h-[390px] space-y-2 pr-1" id="supplies-details-wrapper">
            {supplies.length === 0 ? (
              <div className="py-12 border-2 border-dashed border-slate-200 rounded-2xl text-center text-slate-400 text-xs">
                Aún no existen registros de suministros cargados.
              </div>
            ) : (
              supplies.map((s) => (
                <div key={s.id} className="bg-slate-50 border border-slate-150 p-3.5 rounded-2xl flex items-center justify-between gap-3 hover:border-slate-205 hover:bg-white transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-505/20 flex items-center justify-center text-purple-600 shrink-0 shadow-sm">
                      <Tag className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-800 leading-tight">{s.name}</h4>
                      <span className="text-[9px] text-slate-500 font-extrabold uppercase bg-purple-50/50 border border-purple-100 px-1.5 py-0.5 rounded mt-1 inline-block">
                        {s.category}
                      </span>
                      <span className="text-[9px] text-slate-400 font-semibold block mt-0.5">Adquirido el {s.date}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <span className="text-xs font-mono font-bold text-slate-700">${s.cost.toLocaleString('es-MX')}</span>
                      <span className="text-[8px] block text-slate-400 uppercase font-bold">MXN</span>
                    </div>
                    {hasFullAccess && onDeleteSupply && (
                      <button
                        onClick={() => {
                          if (confirm('¿Confirmas que deseas revertir este cargo indirecto de consumibles?')) {
                            onDeleteSupply(s.id);
                          }
                        }}
                        className="p-1.5 border border-rose-200 text-rose-500 hover:bg-rose-500 hover:text-white rounded-lg transition-colors cursor-pointer"
                        title="Eliminar registro"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="bg-slate-50 border border-slate-150 p-4 rounded-2xl flex items-center justify-between text-xs font-mono text-slate-500">
            <span className="font-bold">Inversión Histórica en Cosméticos / Insumos:</span>
            <div className="text-right">
              <span className="text-sm font-extrabold text-purple-600">${(totalSuppliesCost).toLocaleString('es-MX')}</span>
              <span className="text-[9px] block text-slate-400 uppercase font-black">MXN</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
