import { LayoutDashboard, Car, Ship, Wrench, DollarSign, Wallet, FileBarChart, LogOut, RefreshCw, ChevronDown, UserCircle, Shield, ShoppingBag, Sparkles } from 'lucide-react';
import { UserRole } from '../types';
import { ROLES } from '../mockData';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: { role: UserRole; name: string };
  onLogout: () => void;
  onSwitchRole: (role: UserRole) => void;
}

export default function Sidebar({ activeTab, setActiveTab, currentUser, onLogout, onSwitchRole }: SidebarProps) {
  
  // Custom filter of menuItems depending on role permissions of the active user
  const getMenuItemsForRole = (role: UserRole) => {
    switch (role) {
      case 'Comprador':
        return [
          { id: 'dashboard', label: 'Dashboard Resumen', icon: LayoutDashboard },
          { id: 'imports', label: 'Importaciones', icon: Ship }
        ];
      case 'Taller':
        return [
          { id: 'dashboard', label: 'Dashboard Resumen', icon: LayoutDashboard },
          { id: 'repairs', label: 'Reparaciones (Taller)', icon: Wrench }
        ];
      case 'Estetica':
        return [
          { id: 'dashboard', label: 'Dashboard Resumen', icon: LayoutDashboard },
          { id: 'expenses', label: 'Insumos / Estética', icon: Wallet }
        ];
      case 'Contador':
        return [
          { id: 'dashboard', label: 'Dashboard Resumen', icon: LayoutDashboard },
          { id: 'inventory', label: 'Inventario (Stock)', icon: Car },
          { id: 'sales', label: 'Ventas y Caja', icon: DollarSign },
          { id: 'reports', label: 'Reportes Mensuales', icon: FileBarChart }
        ];
      case 'Administrador':
      default:
        return [
          { id: 'dashboard', label: 'Dashboard Resumen', icon: LayoutDashboard },
          { id: 'inventory', label: 'Inventario (Stock)', icon: Car },
          { id: 'imports', label: 'Importaciones', icon: Ship },
          { id: 'repairs', label: 'Reparaciones (Taller)', icon: Wrench },
          { id: 'sales', label: 'Ventas y Caja', icon: DollarSign },
          { id: 'expenses', label: 'Gastos Operativos', icon: Wallet },
          { id: 'reports', label: 'Reportes Mensuales', icon: FileBarChart }
        ];
    }
  };

  const menuItems = getMenuItemsForRole(currentUser.role);

  const getRoleIconMini = (role: UserRole) => {
    switch (role) {
      case 'Administrador': return <Shield className="w-3.5 h-3.5 text-amber-500" />;
      case 'Comprador': return <ShoppingBag className="w-3.5 h-3.5 text-blue-500" />;
      case 'Taller': return <Wrench className="w-3.5 h-3.5 text-emerald-500" />;
      case 'Estetica': return <Sparkles className="w-3.5 h-3.5 text-purple-500" />;
      case 'Contador': return <DollarSign className="w-3.5 h-3.5 text-rose-500" />;
    }
  };

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 h-screen text-slate-300" id="app-sidebar">
      {/* Brand Logo in Sidebar */}
      <div className="p-5 border-b border-slate-800 flex items-center justify-between" id="sidebar-header">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-600/10 text-blue-400 rounded-lg">
            <Car className="w-5 h-5" />
          </div>
          <span className="font-sans font-bold tracking-wider text-sm text-white">
            AUTO-GESTOR <span className="text-blue-500 font-extrabold text-[9px] align-super bg-blue-500/10 py-0.5 px-1 rounded ml-0.5">PRO</span>
          </span>
        </div>
      </div>

      {/* Role State Banner */}
      <div className="mx-4 mt-4 p-3 bg-slate-950/80 rounded-xl border border-slate-800/80 flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Perfil Activo</span>
          <span className="text-[9px] bg-slate-800 text-slate-400 py-0.5 px-1.5 rounded-full font-mono font-bold uppercase">
            {currentUser.role.slice(0, 5)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {getRoleIconMini(currentUser.role)}
          <span className="text-xs font-semibold text-white truncate max-w-[170px]">
            {currentUser.role === 'Administrador' ? 'Owner / Admon' : currentUser.role}
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto" id="sidebar-nav">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs font-medium cursor-pointer transition-all ${
                isActive
                  ? 'bg-blue-600 font-semibold text-white shadow-lg shadow-blue-600/15'
                  : 'hover:bg-slate-800/60 hover:text-white text-slate-400'
              }`}
              id={`nav-item-${item.id}`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Operator and Quick Switcher / Logout Option */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40 space-y-2" id="sidebar-footer">
        
        {/* Quick swap role dropdown */}
        <div className="relative group">
          <button className="w-full flex items-center justify-between gap-2 p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-[10px] font-semibold text-slate-400 transition-all">
            <span className="flex items-center gap-1.5 truncate">
              <RefreshCw className="w-3 h-3 text-blue-400 animate-spin-slow" />
              Cambiar de Rol
            </span>
            <ChevronDown className="w-3 h-3 text-slate-500" />
          </button>
          
          {/* Dropdown list */}
          <div className="absolute bottom-full left-0 w-full mb-1 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl scale-0 origin-bottom group-hover:scale-100 transition-all duration-200 z-50 p-1 space-y-1">
            {ROLES.map((role) => (
              <button
                key={role.id}
                onClick={() => onSwitchRole(role.id)}
                className={`w-full text-left font-sans text-[11px] p-2 rounded-lg hover:bg-slate-800/80 hover:text-white flex items-center gap-2 transition-colors ${
                  currentUser.role === role.id ? 'text-blue-400 font-semibold bg-slate-800/50' : 'text-slate-400'
                }`}
              >
                {getRoleIconMini(role.id)}
                <span>{role.id}</span>
              </button>
            ))}
          </div>
        </div>

        {/* User Info & Logout Button */}
        <div className="flex items-center justify-between gap-2 pt-1">
          <div className="flex items-center gap-2 truncate">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-700 font-sans font-bold text-xs text-white flex items-center justify-center shrink-0 border border-slate-700/50 shadow shadow-black">
              {currentUser.name.charAt(0)}
            </div>
            <div className="flex flex-col truncate">
              <span className="text-[11px] font-bold text-white truncate max-w-[100px]">{currentUser.name}</span>
              <span className="text-[9px] text-slate-500 truncate capitalize">Operador</span>
            </div>
          </div>
          <button
            onClick={onLogout}
            title="Cerrar Sesión"
            className="p-1.5 hover:bg-slate-800 hover:text-rose-400 text-slate-500 rounded-lg transition-colors cursor-pointer"
            id="btn-logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
