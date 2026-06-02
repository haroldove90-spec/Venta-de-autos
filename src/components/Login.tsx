import React, { useState } from 'react';
import { ROLES } from '../mockData';
import { UserRole } from '../types';
import { Car, Shield, ShoppingBag, Wrench, Sparkles, DollarSign, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

interface LoginProps {
  onLogin: (role: UserRole, userName: string) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [customName, setCustomName] = useState('');

  const getRoleIcon = (roleId: UserRole) => {
    switch (roleId) {
      case 'Administrador': return <Shield className="w-6 h-6 text-amber-500" id="icon-admin" />;
      case 'Comprador': return <ShoppingBag className="w-6 h-6 text-blue-500" id="icon-buyer" />;
      case 'Taller': return <Wrench className="w-6 h-6 text-emerald-500" id="icon-workshop" />;
      case 'Estetica': return <Sparkles className="w-6 h-6 text-purple-500" id="icon-aesthetic" />;
      case 'Contador': return <DollarSign className="w-6 h-6 text-rose-500" id="icon-accounting" />;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) return;
    const finalName = customName.trim() || getDefaultName(selectedRole);
    onLogin(selectedRole, finalName);
  };

  const getDefaultName = (role: UserRole) => {
    switch (role) {
      case 'Administrador': return 'Haroid (Dueño)';
      case 'Comprador': return 'Marcos Ruiz';
      case 'Taller': return 'Ing. Roberto Flores';
      case 'Estetica': return 'Santi Villa';
      case 'Contador': return 'Lic. Gabriela Garza';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden" id="login-container">
      {/* Background decorations matching sleek dealership aesthetic */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[60%] rounded-full bg-blue-900/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[60%] rounded-full bg-violet-900/10 blur-[120px] pointer-events-none" />
      
      {/* Brand Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center mb-8 text-center"
        id="login-brand"
      >
        <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 px-5 py-3 rounded-2xl shadow-xl shadow-slate-950/50 mb-3 hover:border-blue-500/30 transition-all">
          <div className="p-2 bg-blue-600/10 text-blue-400 rounded-lg">
            <Car className="w-7 h-7" id="logo-car" />
          </div>
          <span className="font-sans font-bold tracking-wider text-xl text-white">
            AUTO-GESTOR <span className="text-blue-500 font-extrabold text-xs align-super bg-blue-500/10 py-0.5 px-1.5 rounded ml-1">PRO</span>
          </span>
        </div>
        <p className="text-slate-400 text-sm max-w-md">
          Sistema modular premium de gestión de lote de autos, logística, taller, estética y utilidades en tiempo real.
        </p>
      </motion.div>

      {/* Main Auth Card */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="w-full max-w-4xl bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl shadow-black/80"
        id="login-auth-card"
      >
        <h2 className="text-lg font-semibold text-white mb-1">Selecciona tu Rol Operativo</h2>
        <p className="text-slate-400 text-xs mb-6">Elige el perfil con el que deseas ingresar para interactuar con la consola y realizar operaciones en tiempo real.</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4" id="role-grid">
            {ROLES.map((role) => {
              const isSelected = selectedRole === role.id;
              return (
                <button
                  type="button"
                  key={role.id}
                  onClick={() => {
                    setSelectedRole(role.id);
                    setCustomName(getDefaultName(role.id));
                  }}
                  className={`relative flex flex-col text-left p-4 rounded-2xl border transition-all duration-300 group overflow-hidden h-full ${
                    isSelected 
                      ? 'bg-slate-800/80 border-blue-500 ring-2 ring-blue-500/20 shadow-lg shadow-blue-500/5' 
                      : 'bg-slate-900/50 border-slate-800/80 hover:border-slate-700/80 hover:bg-slate-800/40'
                  }`}
                  id={`role-btn-${role.id}`}
                >
                  {/* Decorative indicator bar */}
                  <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${role.color} opacity-80`} />
                  
                  <div className="flex items-center justify-between mt-1 mb-3">
                    <div className="p-2 bg-slate-950/60 rounded-xl border border-slate-800/60 group-hover:border-slate-700">
                      {getRoleIcon(role.id)}
                    </div>
                    {isSelected && (
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
                    )}
                  </div>
                  
                  <h3 className="font-sans font-semibold text-sm text-white group-hover:text-blue-400 transition-colors">
                    {role.title}
                  </h3>
                  <span className="text-[10px] text-slate-500 font-medium tracking-tight mt-0.5 uppercase">
                    {role.subtitle}
                  </span>
                  
                  <p className="text-[11px] text-slate-400 mt-2 leading-relaxed flex-grow">
                    {role.description}
                  </p>
                </button>
              );
            })}
          </div>

          {selectedRole && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-950/60 border border-slate-800/60 p-4 rounded-2xl max-w-2xl mx-auto flex flex-col md:flex-row items-center gap-4 justify-between"
              id="name-input-container"
            >
              <div className="w-full md:w-auto flex-grow max-w-md">
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Nombre del Operador (Opcional)
                </label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder={getDefaultName(selectedRole)}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm text-white rounded-xl py-2 px-3 outline-none transition-all placeholder:text-slate-600 font-sans"
                  id="operator-name-input"
                />
              </div>
              
              <button
                type="submit"
                className="w-full md:w-auto bg-blue-600 hover:bg-blue-500 text-white font-sans font-semibold text-xs py-3 px-6 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-500/10 cursor-pointer hover:shadow-blue-500/20 active:translate-y-[1px] transition-all self-end"
                id="enter-app-btn"
              >
                Ingresar al Dashboard
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </form>
      </motion.div>

      {/* Footer Info */}
      <div className="absolute bottom-4 text-center text-[10px] text-slate-600" id="login-footer">
        AUTO-GESTOR PRO v2.1 • Diseñado para alto rendimiento y control financiero exacto.
      </div>
    </div>
  );
}
