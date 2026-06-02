export type UserRole = 
  | 'Administrador' 
  | 'Comprador' 
  | 'Taller' 
  | 'Estetica' 
  | 'Contador';

export interface RoleConfig {
  id: UserRole;
  title: string;
  subtitle: string;
  description: string;
  color: string;
  permissions: string[];
}

export type VehicleStatus = 
  | 'Hojalateria' 
  | 'Mecanica' 
  | 'Clima' 
  | 'Estetica' 
  | 'Listo para Venta' 
  | 'Vendido';

export interface Vehicle {
  id: string; // Unique UUID
  vin: string;
  brand: string;
  model: string;
  year: number;
  acquisitionCost: number; // Costo Adquisición (en Lote/Subasta)
  freightCost: number;     // Flete / Transporte
  nationalizationCost: number; // Cruce / Aduana
  otherExpenses: number;   // Gastos varios (Contador/Comprador)
  salePrice: number;       // Precio de venta sugerido
  actualSalePrice?: number; // Precio de venta final (si ya se vendió)
  status: VehicleStatus;
  notes?: string;
  assignedTo?: string; // Mechanic or details technician name
  imageUrl?: string;
  paymentMethod?: string;
  paymentDate?: string;
  isActivatedInPipeline?: boolean; // Track physical entrance into the lot workshops
}

export interface Expense {
  id: string;
  vin: string;
  type: 'Hojalateria' | 'Mecanica' | 'Clima' | 'Estetica' | 'Otros' | 'Cristales';
  subtype?: 'Mano de Obra' | 'Refacciones';
  concept: string;
  provider: string;
  cost: number;
  date: string;
}

export interface SupplyExpense {
  id: string;
  name: string;
  category: string;
  cost: number;
  date: string;
}
