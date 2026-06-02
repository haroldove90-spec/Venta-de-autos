import React, { useState, useEffect } from 'react';
import { Vehicle, Expense } from '../types';
import { 
  CreditCard, ShieldCheck, User, Calendar, Lock, AlertCircle, 
  X, Check, RotateCw, Landmark, Receipt, Sparkles, Building, TrendingUp 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PaymentGatewayProps {
  vehicle: Vehicle | null;
  expenses: Expense[];
  onClose: () => void;
  onPaymentSuccess: (vehicleId: string, actualSalePrice: number, method: string) => void;
}

export default function PaymentGateway({ vehicle, expenses, onClose, onPaymentSuccess }: PaymentGatewayProps) {
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'spei'>('card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [negotiatedPrice, setNegotiatedPrice] = useState(0);

  // Initialize negotiatedPrice once vehicle is available
  useEffect(() => {
    if (vehicle) {
      setNegotiatedPrice(vehicle.salePrice);
    }
  }, [vehicle]);

  if (!vehicle) return null;

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 16) value = value.slice(0, 16);
    // Format card number with spaces (e.g., 4000 1234 5678 9010)
    const formatted = value.match(/.{1,4}/g)?.join(' ') || value;
    setCardNumber(formatted);
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 4) value = value.slice(0, 4);
    if (value.length > 2) {
      value = value.slice(0, 2) + '/' + value.slice(2);
    }
    setCardExpiry(value);
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 3) value = value.slice(0, 3);
    setCardCvv(value);
  };

  const executePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    
    // Simulate connection delay
    setTimeout(() => {
      setProcessing(false);
      setSuccess(true);
    }, 2800);
  };

  const handleFinish = () => {
    const finalMethodLabel = paymentMethod === 'card' ? 'Tarjeta de Crédito (Procesado)' : 'Transferencia Electrónica (SPEI)';
    onPaymentSuccess(vehicle.id, negotiatedPrice, finalMethodLabel);
    onClose();
  };

  // --- DYNAMIC FINANCIAL COMPILATION ---
  // constants
  const EX_RATE = 16.8;

  // 1. Acquisition & Import costs (USD converted to MXN)
  const importUSD = vehicle.acquisitionCost + vehicle.freightCost + vehicle.nationalizationCost + vehicle.otherExpenses;
  const importMXN = importUSD * EX_RATE;

  // 2. Repairs sum (from active expenses bitacora matching vehicle VIN)
  const carRepairsMXN = expenses.filter(e => e.vin === vehicle.vin).reduce((sum, e) => sum + e.cost, 0);

  // 3. Costo Real Total = Import costs MXN + Repairs MXN
  const totalRealCostMXN = importMXN + carRepairsMXN;

  // 4. Negotiated final selling price in MXN
  const finalSalePriceMXN = negotiatedPrice * 15 * 10; // keep the existing scaling logic for UI consistency

  // 5. Utilidad Neta por Unidad
  const netUtilityMXN = finalSalePriceMXN - totalRealCostMXN;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-[999]" id="payment-gateway-overlay">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl shadow-black relative scrollbar-thin" id="payment-modal-card">
        
        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-full transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Structure */}
        <div className="p-6 md:p-8">
          
          {/* Header */}
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 bg-emerald-600/10 text-emerald-450 rounded-xl">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Pasarela de Pagos & Registro de Venta</h2>
              <span className="text-[10px] text-slate-500 font-semibold block uppercase tracking-wider">Módulo de Finanzas y Utilidad Neta</span>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {!success ? (
              <div key="checkout-form" className="space-y-6">
                
                {/* 1. Vehicle info & Costo Real Total calculation */}
                <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-4">
                  <div className="flex justify-between items-start gap-4 border-b border-slate-900 pb-3">
                    <div>
                      <span className="text-[8px] bg-indigo-500/10 text-indigo-400 py-0.5 px-2 rounded-full font-mono font-bold uppercase">
                        Unidad lista para exhibición
                      </span>
                      <h3 className="text-xs font-bold text-white mt-1">{vehicle.year} {vehicle.brand} {vehicle.model}</h3>
                      <p className="text-[10px] text-slate-500 font-mono mt-0.5">VIN: {vehicle.vin}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 font-bold block uppercase">Precio Comercial Sugerido</span>
                      <div className="text-sm font-black text-white font-mono">${(vehicle.salePrice * 15 * 10).toLocaleString('es-MX')} MXN</div>
                    </div>
                  </div>

                  {/* Financial Breakdown Summary showing dynamic Costo Real Total */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[11px] font-mono text-slate-400 pt-1">
                    <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-900">
                      <span className="text-[9px] text-slate-500 block uppercase font-sans font-bold">1. Compra + Flete + Aduana</span>
                      <span className="text-xs font-bold text-white">${importMXN.toLocaleString('es-MX', { maximumFractionDigits: 0 })} MXN</span>
                      <span className="text-[9px] text-slate-500 block mt-0.5">${importUSD.toLocaleString()} USD (~16.80)</span>
                    </div>

                    <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-900">
                      <span className="text-[9px] text-slate-500 block uppercase font-sans font-bold">2. Reparaciones Taller</span>
                      <span className="text-xs font-bold text-rose-400">${carRepairsMXN.toLocaleString('es-MX', { maximumFractionDigits: 0 })} MXN</span>
                      <span className="text-[9px] text-slate-500 block mt-0.5">Bitácora de refacciones</span>
                    </div>

                    <div className="bg-indigo-500/10 p-2.5 rounded-lg border border-indigo-500/25">
                      <span className="text-[9px] text-indigo-400 block uppercase font-sans font-bold">Costo Real Total</span>
                      <span className="text-xs font-black text-indigo-300">${totalRealCostMXN.toLocaleString('es-MX', { maximumFractionDigits: 0 })} MXN</span>
                      <span className="text-[9px] text-slate-500 block mt-0.5">Suma física consolidada</span>
                    </div>
                  </div>

                  {/* Pricing adjustment input */}
                  <div className="pt-3 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center gap-3">
                    <span className="text-xs text-slate-300 font-semibold">Capturar Precio de Salida Final ($ MXN):</span>
                    <div className="relative w-full md:w-64">
                      <span className="absolute left-3 top-2 text-xs text-slate-500 font-bold font-mono">$</span>
                      <input 
                        type="number" 
                        value={negotiatedPrice * 15 * 10} 
                        onChange={(e) => {
                          const val = Number(e.target.value) || 0;
                          setNegotiatedPrice(Math.round(val / (15 * 10)));
                        }}
                        className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 text-right text-xs font-bold font-mono text-emerald-400 rounded-xl py-2 pl-6 pr-3 outline-none"
                      />
                    </div>
                  </div>

                  {/* Real-time Net Profit tracker indicator showing dynamic Margin */}
                  <div className={`p-3 rounded-xl border flex items-center justify-between text-xs font-semibold ${
                    netUtilityMXN >= 0 
                      ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400' 
                      : 'bg-rose-500/5 border-rose-500/20 text-rose-400'
                  }`}>
                    <span className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      <span>Utilidad Neta Estimada de la Unidad:</span>
                    </span>
                    <span className="font-mono text-sm font-black">
                      ${netUtilityMXN.toLocaleString('es-MX')} MXN ({((netUtilityMXN / totalRealCostMXN) * 100).toFixed(1)}% ROI)
                    </span>
                  </div>

                </div>

                {/* Method selector */}
                <div className="grid grid-cols-2 gap-4" id="payment-options-grid">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`flex items-center justify-center gap-2 p-3.5 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                      paymentMethod === 'card' 
                        ? 'bg-emerald-600/10 text-emerald-450 border-emerald-500 shadow-md' 
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                    Tarjeta de Crédito
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('spei')}
                    className={`flex items-center justify-center gap-2 p-3.5 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                      paymentMethod === 'spei' 
                        ? 'bg-emerald-600/10 text-emerald-450 border-emerald-500 shadow-md' 
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <Landmark className="w-4 h-4" />
                    SPEI Bancario (Transferencia)
                  </button>
                </div>

                {/* Form wrapper */}
                <form onSubmit={executePayment} className="space-y-4">
                  
                  {paymentMethod === 'card' ? (
                    <div className="space-y-4" id="card-form">
                      
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Número de Tarjeta</label>
                        <div className="relative">
                          <CreditCard className="absolute left-3.5 top-3 text-slate-500 w-4 h-4" />
                          <input 
                            type="text"
                            required
                            placeholder="4000 1234 5678 9010"
                            value={cardNumber}
                            onChange={handleCardNumberChange}
                            className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl py-2.5 pl-10 pr-3 text-xs font-mono text-white outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div className="col-span-2 space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Titular de la Tarjeta</label>
                          <div className="relative">
                            <User className="absolute left-3.5 top-3 text-slate-500 w-4 h-4" />
                            <input 
                              type="text"
                              required
                              placeholder="Juan Pérez Domínguez"
                              value={cardName}
                              onChange={(e) => setCardName(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl py-2.5 pl-10 pr-3 text-xs text-white outline-none"
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Vence (MM/AA)</label>
                          <div className="relative">
                            <Calendar className="absolute left-3 top-3 text-slate-600 w-3.5 h-3.5" />
                            <input 
                              type="text"
                              required
                              placeholder="12/29"
                              value={cardExpiry}
                              onChange={handleExpiryChange}
                              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl py-2.5 pl-8 pr-2 text-xs font-mono text-white text-center outline-none"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">CVV / Firma</label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-3 text-slate-600 w-3.5 h-3.5" />
                            <input 
                              type="password"
                              required
                              placeholder="•••"
                              value={cardCvv}
                              onChange={handleCvvChange}
                              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl py-2.5 pl-8 pr-2 text-xs font-mono text-white text-center outline-none select-all"
                            />
                          </div>
                        </div>

                        <div className="col-span-2 flex items-center gap-2 text-[10px] text-slate-500 pt-5 font-semibold font-sans">
                          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                          <span>Procesamiento seguro certificado PCI-DSS. Fondos con abono inmediato a cuenta operativa.</span>
                        </div>
                      </div>

                    </div>
                  ) : (
                    <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-4" id="spei-form">
                      <div className="flex items-center gap-3 border-b border-slate-900 pb-3">
                        <div className="p-2 bg-emerald-500/10 text-emerald-450 rounded-xl">
                          <Building className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block uppercase font-mono font-bold">CLABE Interbancaria Destino BBVA</span>
                          <span className="text-xs font-mono font-bold text-white select-all">0121 8000 4567 8901 23</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2 text-[11px] text-slate-400 leading-relaxed font-sans">
                        <p>1. Transfiere el monto total de <strong>${(negotiatedPrice * 15 * 10).toLocaleString('es-MX')} MXN</strong>.</p>
                        <p>2. Beneficiario: <strong>AUTO GESTOR GRUPO VEHICULAR S.A.</strong></p>
                        <p>3. Concepto o Referencia: <strong>VENTA VIN {vehicle.vin.slice(-5)}</strong></p>
                        <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 text-[10px] text-amber-400 flex items-start gap-2 font-semibold">
                          <AlertCircle className="w-4 h-4 shrink-0" />
                          <span>Hacer clic en "Conciliar Venta" abajo para simular la confirmación de la transferencia SPEI al instante.</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Submit Button with loader */}
                  <div className="pt-4 border-t border-slate-800" id="form-submission-panel">
                    <button
                      type="submit"
                      disabled={processing}
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3.5 rounded-xl font-sans font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/15 disabled:opacity-50 transition-all font-sans"
                    >
                      {processing ? (
                        <>
                          <RotateCw className="w-4 h-4 animate-spin" />
                          Verificando transacciones con el banco...
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="w-4 h-4" />
                          Registrar Venta de ${(negotiatedPrice * 15 * 10).toLocaleString('es-MX')} MXN
                        </>
                      )}
                    </button>
                  </div>

                </form>

              </div>
            ) : (
              <motion.div 
                key="checkout-success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center text-center py-6"
                id="receipt-container"
              >
                <div className="w-14 h-14 bg-emerald-600/10 text-emerald-400 rounded-full border border-emerald-500/20 flex items-center justify-center mb-4">
                  <Check className="w-7 h-7" />
                </div>

                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 py-0.5 px-2.5 border border-emerald-500/10 rounded-full font-bold font-mono">
                  VENTA AUTORIZADA
                </span>
                
                <h3 className="text-base font-bold text-white mt-2">¡Transacción Completada!</h3>
                <p className="text-[11px] text-slate-400 max-w-sm mt-1">
                  El carro se ha registrado como Vendido con un valor final de ${(negotiatedPrice * 15 * 10).toLocaleString('es-MX')} MXN de manera transparente.
                </p>

                {/* Printable receipt ticket mock */}
                <div className="bg-slate-950 border border-slate-850 p-5 rounded-2xl w-full max-w-sm my-6 text-left space-y-3 font-mono text-[10px] text-slate-400">
                  <div className="text-center font-bold text-white border-b border-dashed border-slate-800 pb-2 flex flex-col items-center">
                    <Receipt className="w-5 h-5 text-emerald-450 mb-1" />
                    <span>AUTO-GESTOR PRO S.A.</span>
                    <span className="text-[8px] text-slate-500">MONTERREY, N.L. • RFC: AGP190580AA1</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Folio Ticket:</span>
                    <span className="text-white">#{Math.floor(Math.random() * 900000) + 100000}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span>Fecha Pago:</span>
                    <span className="text-white">{new Date().toISOString().slice(0, 10)}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Vehículo:</span>
                    <span className="text-white truncate max-w-[150px]">{vehicle.year} {vehicle.brand} {vehicle.model}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Costo Real Consolidado:</span>
                    <span className="text-white">${totalRealCostMXN.toLocaleString('es-MX')} MXN</span>
                  </div>

                  <div className="flex justify-between border-t border-slate-900 pt-2 font-extrabold text-emerald-450">
                    <span>Precio Salida Final:</span>
                    <span>${(negotiatedPrice * 15 * 10).toLocaleString('es-MX')} MXN</span>
                  </div>

                  <div className="flex justify-between font-bold text-emerald-400">
                    <span>Utilidad Neta:</span>
                    <span>+${netUtilityMXN.toLocaleString('es-MX')} MXN</span>
                  </div>

                  <div className="flex justify-between text-slate-500 text-[8px] text-center pt-2 border-t border-dashed border-slate-800">
                    <span className="w-full">Conserve este comprobante para actualizar el balance e IVA en contabilidad.</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleFinish}
                  className="w-full max-w-xs bg-slate-800 hover:bg-slate-700 hover:text-white text-slate-300 py-3 rounded-xl border border-slate-700 font-sans font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  Actualizar Inventario y Salir
                </button>

              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </div>
  );
}
