import React from 'react';
import { ROLES } from '../mockData';
import { UserRole } from '../types';
import { Car, Shield, ShoppingBag, Wrench, Sparkles, DollarSign } from 'lucide-react';
import { motion } from 'motion/react';

interface LoginProps {
  onLogin: (role: UserRole, userName: string) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const getRoleIcon = (roleId: UserRole) => {
    switch (roleId) {
      case 'Administrador': return <Shield className="w-6 h-6 text-amber-500" id="icon-admin" />;
      case 'Comprador': return <ShoppingBag className="w-6 h-6 text-indigo-400" id="icon-buyer" />;
      case 'Taller': return <Wrench className="w-6 h-6 text-emerald-500" id="icon-workshop" />;
      case 'Estetica': return <Sparkles className="w-6 h-6 text-purple-500" id="icon-aesthetic" />;
      case 'Contador': return <DollarSign className="w-6 h-6 text-rose-500" id="icon-accounting" />;
    }
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
    <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-4 relative overflow-hidden" id="login-container">
      {/* Background decorations matching sleek dealership aesthetic */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[60%] rounded-full bg-emerald-100/40 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[60%] rounded-full bg-violet-100/40 blur-[120px] pointer-events-none" />
      
      {/* Brand Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center mb-8 text-center"
        id="login-brand"
      >
        <div className="flex items-center gap-3 bg-white border border-zinc-250 px-5 py-3 rounded-2xl shadow-md mb-3 hover:border-emerald-500/30 transition-all">
          <div className="p-2 bg-emerald-600/10 text-emerald-600 rounded-lg">
            <Car className="w-7 h-7" id="logo-car" />
          </div>
          <span className="font-sans font-bold tracking-wider text-xl text-zinc-900">
            AUTO-GESTOR <span className="text-emerald-600 font-extrabold text-xs align-super bg-emerald-555/10 py-0.5 px-1.5 rounded ml-1">PRO</span>
          </span>
        </div>
        <p className="text-zinc-550 text-sm max-w-md">
          Sistema modular premium de gestión de lote de autos, logística, taller, estética y utilidades en tiempo real.
        </p>
      </motion.div>

      {/* Main Auth Card */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="w-full max-w-4xl bg-white border border-zinc-200 rounded-3xl p-6 md:p-8 shadow-xl shadow-zinc-205/35"
        id="login-auth-card"
      >
        <h2 className="text-lg font-semibold text-zinc-800 mb-1">Selecciona tu Rol Operativo</h2>
        <p className="text-zinc-500 text-xs mb-6">Elige el perfil con el que deseas ingresar para interactuar con la consola y realizar operaciones en tiempo real.</p>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4" id="role-grid">
            {ROLES.map((role) => {
              return (
                <button
                  type="button"
                  key={role.id}
                  onClick={() => {
                    onLogin(role.id, getDefaultName(role.id));
                  }}
                  className="relative flex flex-col text-left p-4 rounded-2xl border transition-all duration-300 group overflow-hidden h-full bg-zinc-50 border-zinc-200 hover:border-zinc-300 hover:bg-zinc-100 hover:scale-[1.02] active:scale-[0.99] cursor-pointer shadow-sm"
                  id={`role-btn-${role.id}`}
                >
                  {/* Decorative indicator bar */}
                  <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${role.color} opacity-80`} />
                  
                  <div className="flex items-center justify-between mt-1 mb-3">
                    <div className="p-2 bg-white rounded-xl border border-zinc-200 shadow-sm group-hover:border-slate-350 transition-colors">
                      {getRoleIcon(role.id)}
                    </div>
                  </div>
                  
                  <h3 className="font-sans font-semibold text-xs text-zinc-800 group-hover:text-emerald-700 transition-colors">
                    {role.title}
                  </h3>
                  <span className="text-[9px] text-zinc-400 font-medium tracking-tight mt-0.5 uppercase">
                    {role.subtitle}
                  </span>
                  
                  <p className="text-[10px] text-zinc-500 mt-2 leading-relaxed flex-grow">
                    {role.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Footer Info */}
      <div className="absolute bottom-4 text-center text-[10px] text-zinc-500" id="login-footer">
        AUTO-GESTOR PRO v2.1 • Diseñado para alto rendimiento y control financiero exacto.
      </div>
    </div>
  );
}
