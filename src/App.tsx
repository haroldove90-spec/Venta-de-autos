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
import { ShieldAlert, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<{ role: UserRole; name: string } | null>(null);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  
  // Real-time local state engine with local storage persistence
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [supplies, setSupplies] = useState<SupplyExpense[]>([]);
  
  // Active payment gateway proxy variables
  const [activePaymentVehicle, setActivePaymentVehicle] = useState<Vehicle | null>(null);

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
          <div className="bg-slate-900 border-l-4 border-amber-500 p-3 rounded-r-xl flex items-center justify-between text-[11px] text-slate-300 font-sans mb-4 shadow" id="notice-admin">
            <span className="flex items-center gap-2 font-medium">
              <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0" />
              <span>Consola del <strong>Administrador General (Dueño)</strong> activa. Permisos absolutos de auditoría, adquisición o depuración de lotes habilitados.</span>
            </span>
          </div>
        );
      case 'Comprador':
        return (
          <div className="bg-slate-900 border-l-4 border-blue-500 p-3 rounded-r-xl flex items-center justify-between text-[11px] text-slate-300 font-sans mb-4 shadow" id="notice-buyer">
            <span className="flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 text-blue-500 shrink-0" />
              <span>Consola del <strong>Comprador y Logística</strong> activa. Inscribe carros adquiridos en subasta extranjeras y calcula aranceles de cruce.</span>
            </span>
          </div>
        );
      case 'Taller':
        return (
          <div className="bg-slate-900 border-l-4 border-emerald-500 p-3 rounded-r-xl flex items-center justify-between text-[11px] text-slate-300 font-sans mb-4 shadow" id="notice-workshop">
            <span className="flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Consola del <strong>Jefe de Taller</strong> activa. Administra las fases físicas de laminado, afinación, y registra costos de refacciones en bitácora.</span>
            </span>
          </div>
        );
      case 'Estetica':
        return (
          <div className="bg-slate-900 border-l-4 border-purple-500 p-3 rounded-r-xl flex items-center justify-between text-[11px] text-slate-300 font-sans mb-4 shadow" id="notice-aesthetic">
            <span className="flex items-center gap-2 font-medium">
              <Sparkles className="w-4 h-4 text-purple-500 shrink-0" />
              <span>Consola de <strong>Estética y Detallado</strong> activa. Marca unidades como terminadas (Listo para Venta) y controle mermas de insumos.</span>
            </span>
          </div>
        );
      case 'Contador':
        return (
          <div className="bg-slate-900 border-l-4 border-rose-500 p-3 rounded-r-xl flex items-center justify-between text-[11px] text-slate-300 font-sans mb-4 shadow" id="notice-accounting">
            <span className="flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 text-rose-500 shrink-0" />
              <span>Consola de <strong>Contabilidad y Rentabilidad</strong> activa. Monitoreo del flujo de ingresos SPEI/Tarjetas y cálculo provisional ISR/IVA.</span>
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
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden" id="app-main-view">
      
      {/* 1. Left Sidebar Navigation Panel */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        currentUser={currentUser} 
        onLogout={handleLogout}
        onSwitchRole={handleSwitchRole}
      />

      {/* 2. Main Content Board */}
      <main className="flex-1 flex flex-col h-full bg-slate-950 overflow-hidden" id="dashboard-content-frame">
        
        {/* Top interactive navbar */}
        <header className="h-14 border-b border-slate-900 px-6 flex items-center justify-between shrink-0 bg-slate-900/10">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <span>Grupo Concesionarios del Lote</span>
            <span>/</span>
            <span className="text-slate-300 capitalize">{activeTab}</span>
          </div>
          
          <div className="flex items-center gap-6">
            <span className="text-[10px] font-mono text-slate-500 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
              Servidor Activo • UTC-6 Monterrey
            </span>
            <div className="text-[11px] font-bold text-white flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              {currentUser.name}
              <span className="text-[9px] bg-blue-500/10 text-blue-400 py-0.5 px-1.5 border border-blue-500/20 rounded-md font-mono lowercase">
                {currentUser.role}
              </span>
            </div>
          </div>
        </header>

        {/* Dynamic Inner Workspace body */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-slate-900">
          
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
