import { useState, useEffect } from 'react';
import { UserRole, Vehicle, Expense, SupplyExpense, VehicleStatus } from './types';
import { INITIAL_VEHICLES, INITIAL_EXPENSES, INITIAL_SUPPLIES } from './mockData';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import DashboardOverview from './components/DashboardOverview';
import InventoryManager from './components/InventoryManager';
import ImportsManager from './components/ImportsManager';
import RepairsManager from './components/RepairsManager';
import ExpensesManager from './components/ExpensesManager';
import ReportsView from './components/ReportsView';
import PaymentGateway from './components/PaymentGateway';
import { ShieldAlert, AlertCircle, Sparkles, CheckCircle2, Menu, Smartphone, Download } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<{ role: UserRole; name: string } | null>(null);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  
  // PWA & Mobile drawer global states
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState<boolean>(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // Real-time local state engine with local storage persistence
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [supplies, setSupplies] = useState<SupplyExpense[]>([]);
  
  // Active payment gateway proxy variables
  const [activePaymentVehicle, setActivePaymentVehicle] = useState<Vehicle | null>(null);

  // PWA listener hook
  useEffect(() => {
    const handleBeforePrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforePrompt);
    
    // Check if running on standalone mode
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setShowInstallBanner(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforePrompt);
    };
  }, []);

  const triggerPWAInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`PWA Installation outcome choice: ${outcome}`);
      setDeferredPrompt(null);
      setShowInstallBanner(false);
    } else {
      // Elegant, styled modal-based alert info
      alert("📲 ¡Instala AUTO-GESTOR PRO en tu celular!\n\n🤖 Android / Chrome:\n1. Toca los tres puntos de opciones arriba a la derecha de tu navegador.\n2. Selecciona 'Instalar aplicación' o 'Agregar a la pantalla principal'.\n\n🍏 iOS/Safari (iPhone/iPad):\n1. Presiona el botón de 'Compartir' (el panel cuadrado con la flecha apuntando arriba).\n2. Desliza hacia abajo y presiona 'Agregar a inicio'.");
    }
  };

  // Initialize data on load
  useEffect(() => {
    // 1. Load active user if exists
    const cachedUser = localStorage.getItem('autogestor_user');
    if (cachedUser) {
      setCurrentUser(JSON.parse(cachedUser));
    }

    // 2. Load vehicles
    const cachedVehicles = localStorage.getItem('autogestor_vehicles');
    if (cachedVehicles) {
      setVehicles(JSON.parse(cachedVehicles));
    } else {
      setVehicles(INITIAL_VEHICLES);
      localStorage.setItem('autogestor_vehicles', JSON.stringify(INITIAL_VEHICLES));
    }

    // 3. Load repair expenses
    const cachedExpenses = localStorage.getItem('autogestor_expenses');
    if (cachedExpenses) {
      setExpenses(JSON.parse(cachedExpenses));
    } else {
      setExpenses(INITIAL_EXPENSES);
      localStorage.setItem('autogestor_expenses', JSON.stringify(INITIAL_EXPENSES));
    }

    // 4. Load supplies
    const cachedSupplies = localStorage.getItem('autogestor_supplies');
    if (cachedSupplies) {
      setSupplies(JSON.parse(cachedSupplies));
    } else {
      setSupplies(INITIAL_SUPPLIES);
      localStorage.setItem('autogestor_supplies', JSON.stringify(INITIAL_SUPPLIES));
    }
  }, []);

  // Sync utilities
  const saveVehiclesToStorage = (updated: Vehicle[]) => {
    setVehicles(updated);
    localStorage.setItem('autogestor_vehicles', JSON.stringify(updated));
  };

  const saveExpensesToStorage = (updated: Expense[]) => {
    setExpenses(updated);
    localStorage.setItem('autogestor_expenses', JSON.stringify(updated));
  };

  const saveSuppliesToStorage = (updated: SupplyExpense[]) => {
    setSupplies(updated);
    localStorage.setItem('autogestor_supplies', JSON.stringify(updated));
  };

  // Auth managers
  const handleLogin = (role: UserRole, userRealName: string) => {
    const session = { role, name: userRealName };
    setCurrentUser(session);
    localStorage.setItem('autogestor_user', JSON.stringify(session));
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('autogestor_user');
  };

  const handleSwitchRole = (newRole: UserRole) => {
    if (!currentUser) return;
    const defaultNames: Record<UserRole, string> = {
      Administrador: 'Haroid (Dueño)',
      Comprador: 'Marcos Ruiz',
      Taller: 'Ing. Roberto Flores',
      Estetica: 'Santi Villa',
      Contador: 'Lic. Gabriela Garza'
    };
    const updated = { role: newRole, name: defaultNames[newRole] };
    setCurrentUser(updated);
    localStorage.setItem('autogestor_user', JSON.stringify(updated));
    setActiveTab('dashboard'); // Force dynamic redirection to dashboard
  };

  // State Updates Managers
  const handleAddVehicle = (newVehicleData: Omit<Vehicle, 'id'>) => {
    const fresh: Vehicle = {
      ...newVehicleData,
      id: 'v_' + Math.floor(Math.random() * 100000)
    };
    const updatedList = [fresh, ...vehicles];
    saveVehiclesToStorage(updatedList);
  };

  const handleUpdateVehicleStatus = (id: string, newStatus: VehicleStatus) => {
    const updatedList = vehicles.map(v => v.id === id ? { ...v, status: newStatus } : v);
    saveVehiclesToStorage(updatedList);
  };

  const handleUpdateVehicle = (updatedVehicle: Vehicle) => {
    const updatedList = vehicles.map(v => v.id === updatedVehicle.id ? updatedVehicle : v);
    saveVehiclesToStorage(updatedList);
  };

  const handleDeleteVehicle = (id: string) => {
    const updatedList = vehicles.filter(v => v.id !== id);
    saveVehiclesToStorage(updatedList);
  };

  // Repairs adding/updating/deleting managers
  const handleAddRepairExpense = (newExpData: Omit<Expense, 'id'>) => {
    const fresh: Expense = {
      ...newExpData,
      id: 'exp_' + Math.floor(Math.random() * 100000)
    };
    const updatedList = [fresh, ...expenses];
    saveExpensesToStorage(updatedList);
  };

  const handleUpdateRepairExpense = (updatedExpense: Expense) => {
    const updatedList = expenses.map(e => e.id === updatedExpense.id ? updatedExpense : e);
    saveExpensesToStorage(updatedList);
  };

  const handleDeleteRepairExpense = (id: string) => {
    const updatedList = expenses.filter(e => e.id !== id);
    saveExpensesToStorage(updatedList);
  };

  // Supplies adding/deleting managers
  const handleAddSupplyExpense = (newSupData: Omit<SupplyExpense, 'id'>) => {
    const fresh: SupplyExpense = {
      ...newSupData,
      id: 'sup_' + Math.floor(Math.random() * 100000)
    };
    const updatedList = [fresh, ...supplies];
    saveSuppliesToStorage(updatedList);
  };

  const handleDeleteSupplyExpense = (id: string) => {
    const updatedList = supplies.filter(s => s.id !== id);
    saveSuppliesToStorage(updatedList);
  };

  // Payment complete webhook callback
  const handlePaymentSuccessful = (vehicleId: string, finalPaidPrice: number, textMethod: string) => {
    const updatedList = vehicles.map(v => {
      if (v.id === vehicleId) {
        return {
          ...v,
          status: 'Vendido' as VehicleStatus,
          actualSalePrice: finalPaidPrice,
          paymentMethod: textMethod,
          paymentDate: new Date().toISOString().slice(0, 10)
        };
      }
      return v;
    });
    saveVehiclesToStorage(updatedList);
    setActivePaymentVehicle(null);
  };

  // Rendering router for Active Tab content
  const renderActiveTabContent = () => {
    if (!currentUser) return null;

    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardOverview 
            vehicles={vehicles}
            expenses={expenses}
            supplies={supplies}
            role={currentUser.role}
            onUpdateVehicleStatus={handleUpdateVehicleStatus}
            onOpenPaymentGateway={(vehicle) => setActivePaymentVehicle(vehicle)}
            onAddQuickExpense={handleAddRepairExpense}
          />
        );
      case 'inventory':
        return (
          <InventoryManager 
            vehicles={vehicles}
            onAddVehicle={handleAddVehicle}
            onUpdateStatus={handleUpdateVehicleStatus}
            onDeleteVehicle={handleDeleteVehicle}
            onOpenPayment={(v) => setActivePaymentVehicle(v)}
            role={currentUser.role}
          />
        );
      case 'imports':
        return (
          <ImportsManager 
            vehicles={vehicles}
            onUpdateVehicle={handleUpdateVehicle}
            onAddVehicle={handleAddVehicle}
            role={currentUser.role}
          />
        );
      case 'repairs':
        return (
          <RepairsManager 
            vehicles={vehicles}
            expenses={expenses}
            onAddExpense={handleAddRepairExpense}
            onUpdateExpense={handleUpdateRepairExpense}
            onDeleteExpense={handleDeleteRepairExpense}
            role={currentUser.role}
          />
        );
      case 'expenses':
        return (
          <ExpensesManager 
            supplies={supplies}
            onAddSupply={handleAddSupplyExpense}
            onDeleteSupply={handleDeleteSupplyExpense}
            role={currentUser.role}
          />
        );
      case 'reports':
        return (
          <ReportsView 
            vehicles={vehicles}
            expenses={expenses}
            supplies={supplies}
            role={currentUser.role}
          />
        );
      default:
        return (
          <div className="py-12 text-center text-slate-500 font-sans text-xs">
            Próximamente disponible. Seleccione otra pestaña de administración en el menú sidebar.
          </div>
        );
    }
  };

  // Overriding notification alerts matching role permissions
  const getRoleAlertNotice = () => {
    if (!currentUser) return null;
    
    switch (currentUser.role) {
      case 'Administrador':
        return (
          <div className="bg-white border border-slate-200/80 border-l-4 border-l-amber-500 p-3 rounded-r-xl flex items-center justify-between text-[11px] text-slate-600 font-sans mb-4 shadow-sm" id="notice-admin">
            <span className="flex items-center gap-2 font-semibold">
              <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0" />
              <span>Consola del <strong className="text-slate-900">Administrador General (Dueño)</strong> activa. Permisos absolutos de auditoría, adquisición o depuración de lotes habilitados.</span>
            </span>
          </div>
        );
      case 'Comprador':
        return (
          <div className="bg-white border border-slate-200/80 border-l-4 border-l-indigo-500 p-3 rounded-r-xl flex items-center justify-between text-[11px] text-slate-600 font-sans mb-4 shadow-sm" id="notice-buyer">
            <span className="flex items-center gap-2 font-semibold">
              <AlertCircle className="w-4 h-4 text-indigo-500 shrink-0" />
              <span>Consola del <strong className="text-slate-900">Comprador y Logística</strong> activa. Inscribe carros adquiridos en subasta extranjeras y calcula aranceles de cruce.</span>
            </span>
          </div>
        );
      case 'Taller':
        return (
          <div className="bg-white border border-slate-200/80 border-l-4 border-l-emerald-500 p-3 rounded-r-xl flex items-center justify-between text-[11px] text-slate-600 font-sans mb-4 shadow-sm" id="notice-workshop">
            <span className="flex items-center gap-2 font-semibold">
              <AlertCircle className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Consola del <strong className="text-slate-900">Jefe de Taller</strong> activa. Administra las fases físicas de laminado, afinación, y registra costos de refacciones en bitácora.</span>
            </span>
          </div>
        );
      case 'Estetica':
        return (
          <div className="bg-white border border-slate-200/80 border-l-4 border-l-purple-500 p-3 rounded-r-xl flex items-center justify-between text-[11px] text-slate-600 font-sans mb-4 shadow-sm" id="notice-aesthetic">
            <span className="flex items-center gap-2 font-semibold">
              <Sparkles className="w-4 h-4 text-purple-500 shrink-0" />
              <span>Consola de <strong className="text-slate-900">Estética y Detallado</strong> activa. Marca unidades como terminadas (Listo para Venta) y controle mermas de insumos.</span>
            </span>
          </div>
        );
      case 'Contador':
        return (
          <div className="bg-white border border-slate-200/80 border-l-4 border-l-rose-500 p-3 rounded-r-xl flex items-center justify-between text-[11px] text-slate-600 font-sans mb-4 shadow-sm" id="notice-accounting">
            <span className="flex items-center gap-2 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-rose-500 shrink-0" />
              <span>Consola de <strong className="text-slate-900">Contabilidad y Rentabilidad</strong> activa. Monitoreo del flujo de ingresos SPEI/Tarjetas y cálculo provisional ISR/IVA.</span>
            </span>
          </div>
        );
    }
  };

  // If no user session is valid, render portal log-in select role
  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen bg-slate-100 text-slate-800 overflow-hidden" id="app-main-view">
      
      {/* Mobile Drawer Backdrop Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs z-45 md:hidden transition-opacity" 
          onClick={() => setIsMobileMenuOpen(false)} 
        />
      )}

      {/* 1. Left Sidebar Navigation Panel */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setIsMobileMenuOpen(false); // Auto-close drawer on click on mobile
        }} 
        currentUser={currentUser} 
        onLogout={handleLogout}
        onSwitchRole={handleSwitchRole}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* 2. Main Content Board */}
      <main className="flex-1 flex flex-col h-full bg-[#f1f5f9] overflow-hidden" id="dashboard-content-frame">
        
        {/* Top interactive navbar */}
        <header className="h-14 border-b border-slate-200 px-4 md:px-6 flex items-center justify-between shrink-0 bg-white shadow-sm gap-2">
          
          <div className="flex items-center gap-2">
            {/* Mobile Hamburger menu toggle button */}
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all mr-1 cursor-pointer"
              title="Abrir Menú"
            >
              <Menu className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
              <span className="hidden sm:inline">Grupo Concesionarios del Lote</span>
              <span className="hidden sm:inline">/</span>
              <span className="text-slate-750 capitalize font-extrabold">{activeTab}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3 md:gap-6">
            
            {/* HIGHLIGHTED FLASHY PWA INSTALL BUTTON */}
            <button 
              onClick={triggerPWAInstall}
              className="bg-gradient-to-r from-emerald-600 via-teal-600 to-purple-600 hover:from-emerald-500 hover:to-purple-500 text-white font-sans font-black text-[9px] md:text-[10px] uppercase py-2 px-3.5 rounded-xl shadow-lg shadow-emerald-650/20 active:translate-y-[1px] hover:scale-102 transition-all cursor-pointer animate-bounce shrink-0 border border-emerald-400 flex items-center gap-1.5"
              id="pwa-install-header-btn"
            >
              <Smartphone className="w-3 md:w-3.5 h-3 md:h-3.5" />
              <span>Instalar App 📲</span>
            </button>

            <span className="hidden lg:inline text-[10px] font-mono text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 font-bold">
              Servidor Activo • UTC-6
            </span>
            
            <div className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5 max-w-[120px] md:max-w-none truncate">
              {currentUser.name}
              <span className="hidden xs:inline text-[9px] bg-emerald-50 text-emerald-700 py-0.5 px-1.5 border border-emerald-100 rounded-md font-mono font-bold uppercase">
                {currentUser.role}
              </span>
            </div>
          </div>
        </header>

        {/* Dynamic Inner Workspace body */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 scrollbar-thin scrollbar-thumb-slate-300">
          
          {/* Top warning alerts depending on selected role privileges */}
          {getRoleAlertNotice()}

          {/* Active component tab render */}
          {renderActiveTabContent()}

        </div>

      </main>

      {/* 3. Global Pasarela de Pagos Dialog */}
      <PaymentGateway 
        vehicle={activePaymentVehicle}
        expenses={expenses}
        onClose={() => setActivePaymentVehicle(null)}
        onPaymentSuccess={handlePaymentSuccessful}
      />

    </div>
  );
}
