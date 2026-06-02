import React, { useState } from 'react';
import { SupplyExpense, UserRole } from '../types';
import { Sparkles, ShoppingBag, PlusCircle, CheckCircle, Tag, TrendingDown, Trash2 } from 'lucide-react';

interface ExpensesManagerProps {
  supplies: SupplyExpense[];
  onAddSupply: (newSupply: Omit<SupplyExpense, 'id'>) => void;
  onDeleteSupply?: (id: string) => void;
  role: UserRole;
}

export default function ExpensesManager({ supplies, onAddSupply, onDeleteSupply, role }: ExpensesManagerProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<'Estetica' | 'Taller' | 'Oficina'>('Estetica');
  const [cost, setCost] = useState(0);

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
  const isAdmin = role === 'Administrador';

  return (
    <div className="space-y-6" id="expenses-workspace">
      
      {/* Header */}
      <div>
        <h2 className="text-base font-sans font-bold text-white tracking-tight flex items-center gap-2">
          Gestión de Insumos Globales del Lote
          {isAdmin && (
            <span className="text-[9px] bg-purple-500/10 text-purple-400 border border-purple-500/20 py-0.5 px-2 rounded-full font-mono uppercase font-bold">
              Auditoría Absoluta
            </span>
          )}
        </h2>
        <p className="text-[11px] text-slate-500 mt-0.5">Control de inventario de lavados, ceras, aromatizantes y pulimentos para acondicionamiento estético.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Register supplies expense */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl lg:col-span-1 shadow-xl flex flex-col justify-between h-fit">
          <div>
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3 mb-4">
              <PlusCircle className="w-5 h-5 text-purple-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Adquirir Insumo de Estética</h3>
            </div>

            <form onSubmit={handleAddSupplySubmit} className="space-y-4">
              
              {/* Supply Name */}
              <div className="space-y-1.5 text-xs">
                <label className="text-[10px] text-slate-400 font-bold uppercase">Nombre del Producto / Consumible</label>
                <input 
                  type="text" required placeholder="Llantil brillo, microfibras premium"
                  value={name} onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-lg p-2.5 text-xs text-white outline-none"
                />
              </div>

              {/* Category */}
              <div className="space-y-1.5 text-xs">
                <label className="text-[10px] text-slate-400 font-bold uppercase">Área Operativa Destinada</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-lg p-2.5 text-slate-300 text-xs outline-none"
                >
                  <option value="Estetica">Estética y Detallado</option>
                  <option value="Taller">Taller y Mecánica (General)</option>
                  <option value="Oficina">Consumibles de Oficina / Lote</option>
                </select>
              </div>

              {/* Cost */}
              <div className="space-y-1.5 text-xs">
                <label className="text-[10px] text-purple-400 font-bold uppercase">Monto de la Factura ($ MXN)</label>
                <input 
                  type="number" required placeholder="1200"
                  value={cost > 0 ? cost : ''} onChange={(e) => setCost(Number(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-purple-950/40 focus:border-purple-500 rounded-lg p-2.5 font-mono text-purple-400 text-xs outline-none font-bold"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-500 text-white font-semibold py-2.5 rounded-xl text-xs flex justify-center items-center gap-1.5 shadow shadow-purple-600/10 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                Registrar Factura de Insumo
              </button>

            </form>
          </div>

          <div className="bg-slate-950 border border-slate-850 p-3 rounded-lg border border-slate-800 text-[10px] text-slate-500 mt-4 leading-relaxed">
            Consumo estimado mensual garantizado para maximizar el brillo y valor de las unidades antes de exhibición final.
          </div>
        </div>

        {/* Audit lists representing detailer supplies */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-purple-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Bitácora de Suministros Auditados</h3>
            </div>
            <span className="text-[10px] font-mono text-slate-400 font-bold bg-slate-950 py-1 px-2 border border-slate-800 rounded">
              Histórico
            </span>
          </div>

          <div className="overflow-y-auto max-h-[390px] space-y-2" id="supplies-details-wrapper">
            {supplies.map((s) => (
              <div key={s.id} className="bg-slate-950 border border-slate-850 p-3.5 rounded-xl flex items-center justify-between gap-3 hover:border-slate-800 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
                    <Tag className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white leading-tight">{s.name}</h4>
                    <span className="text-[9px] text-slate-500 font-semibold uppercase">{s.category} • Adquirido el {s.date}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-slate-200">${s.cost.toLocaleString('es-MX')}</span>
                    <span className="text-[8px] block text-slate-500">MXN</span>
                  </div>
                  {isAdmin && onDeleteSupply && (
                    <button
                      onClick={() => {
                        if (confirm('¿Confirmas que deseas revertir este cargo indirecto?')) {
                          onDeleteSupply(s.id);
                        }
                      }}
                      className="p-1 px-2 border border-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white rounded text-[10px] transition-colors cursor-pointer"
                      title="Eliminar registro"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl flex items-center justify-between text-xs font-mono text-slate-400">
            <span>Inversión Histórica Acumulada:</span>
            <div className="text-right">
              <span className="text-sm font-bold text-purple-400">${(totalSuppliesCost + 15200).toLocaleString('es-MX')}</span>
              <span className="text-[9px] block text-slate-500 uppercase">MXN</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
