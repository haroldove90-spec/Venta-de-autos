import { Vehicle, Expense, SupplyExpense, UserRole, RoleConfig } from './types';

export const ROLES: RoleConfig[] = [
  {
    id: 'Administrador',
    title: 'Administrador General',
    subtitle: 'Dueño del Lote / Socio Principal',
    description: 'Visualiza reportes de rentabilidad en tiempo real, controla el flujo completo de vehículos (Kanban), gestiona la asignación de presupuestos y aprueba ventas.',
    color: 'from-amber-500 to-orange-600',
    permissions: ['Ver métricas financieras', 'Cambiar estados globales', 'Registrar compras/ventas', 'Editar configuraciones', 'Aprobar transacciones']
  },
  {
    id: 'Comprador',
    title: 'Comprador y Logística',
    subtitle: 'Gestor de Importaciones y Cruces',
    description: 'Inscribe nuevos autos adquiridos en subastas extranjeras, calcula el flete, impuestos de nacionalización o cruce, y estima costos reales de adquisición.',
    color: 'from-violet-550 to-indigo-600',
    permissions: ['Crear nuevos vehículos', 'Ver módulo de importaciones', 'Editar fletes y nacionalizaciones', 'Calcular costos de cruce']
  },
  {
    id: 'Taller',
    title: 'Jefe de Taller',
    subtitle: 'Encargado de Mecánica, Clima y Hojalatería',
    description: 'Asigna mecánicos a reparaciones de motor, aire acondicionado, frenos u hojalatería. Registra costos de refacciones y diagnostica fallas activas.',
    color: 'from-emerald-500 to-teal-600',
    permissions: ['Ver vehículos en taller', 'Registrar bitácora de gastos mecánicos', 'Mover vehículos a estado Clima/Estética', 'Ingresar mano de obra']
  },
  {
    id: 'Estetica',
    title: 'Encargado de Estética',
    subtitle: 'Detallado, Pulido y Limpieza Interior',
    description: 'Gestor de la fase final de alistamiento de imagen. Controla insumos de lavado, ceras purificadoras, aromatizantes y marca unidades como "Listo para Venta".',
    color: 'from-purple-500 to-pink-600',
    permissions: ['Ver vehículos en detallado', 'Marcar auto como Listo para Venta', 'Registrar insumos globales (Champú, ceras, etc.)']
  },
  {
    id: 'Contador',
    title: 'Contabilidad y Rentabilidad',
    subtitle: 'Gestor de Caja, Impuestos y Utilidades',
    description: 'Audita el flujo de caja, monitorea la rentabilidad de cada unidad vendida (precio venta vs costo real) y simula ingresos por la pasarela de pagos integrada.',
    color: 'from-rose-500 to-red-600',
    permissions: ['Ver balanza de pagos', 'Configurar pasarela de pagos', 'Generar reportes fiscales en tiempo real', 'Ver gastos operativos totales']
  }
];

export const INITIAL_VEHICLES: Vehicle[] = [
  {
    id: 'v1',
    vin: '2019010020',
    brand: 'Ford',
    model: 'F-150 Raptor',
    year: 2018,
    acquisitionCost: 12000,
    freightCost: 1200,
    nationalizationCost: 1800,
    otherExpenses: 300,
    salePrice: 19800,
    actualSalePrice: 19800,
    status: 'Vendido',
    notes: 'Detalles mínimos en pintura, importado desde Texas.',
    assignedTo: 'Carlos Gómez',
    paymentMethod: 'Tarjeta de Crédito',
    paymentDate: '2026-05-18'
  },
  {
    id: 'v2',
    vin: '2019507080',
    brand: 'Toyota',
    model: 'Tacoma TRD',
    year: 2019,
    acquisitionCost: 13000,
    freightCost: 1100,
    nationalizationCost: 1900,
    otherExpenses: 200,
    salePrice: 18000,
    actualSalePrice: 17800,
    status: 'Vendido',
    notes: 'Impecable estado de suspensión.',
    assignedTo: 'Raúl Martínez',
    paymentMethod: 'Transferencia SPEI',
    paymentDate: '2026-05-28'
  },
  {
    id: 'v3',
    vin: '2019350830',
    brand: 'Toyota',
    model: 'Tundra CrewMax',
    year: 2019,
    acquisitionCost: 14000,
    freightCost: 1500,
    nationalizationCost: 2000,
    otherExpenses: 500,
    salePrice: 22000,
    status: 'Listo para Venta',
    notes: 'Ya detallado en estética, listo para exhibición principal.',
    assignedTo: 'Santi Villa'
  },
  {
    id: 'v4',
    vin: '2019300060',
    brand: 'Jeep',
    model: 'Wrangler Rubicon',
    year: 2018,
    acquisitionCost: 11500,
    freightCost: 1000,
    nationalizationCost: 1700,
    otherExpenses: 800,
    salePrice: 18500,
    status: 'Listo para Venta',
    notes: 'Varios accesorios off-road agregados.',
    assignedTo: 'Jorge Luis'
  },
  {
    id: 'v5',
    vin: '2019060388',
    brand: 'Ford',
    model: 'F-150 Lariat',
    year: 2018,
    acquisitionCost: 12000,
    freightCost: 1200,
    nationalizationCost: 1800,
    otherExpenses: 200,
    salePrice: 17900,
    status: 'Hojalateria',
    notes: 'Golpe menor en salpicadera derecha.',
    assignedTo: 'Taller Don Rul'
  },
  {
    id: 'v6',
    vin: '2019560377',
    brand: 'Toyota',
    model: 'Tacoma Sport',
    year: 2019,
    acquisitionCost: 13000,
    freightCost: 1200,
    nationalizationCost: 1800,
    otherExpenses: 200,
    salePrice: 18500,
    status: 'Mecanica',
    notes: 'Afinación de motor de 6 cilindros y bujías.',
    assignedTo: 'Electromecánica Express'
  },
  {
    id: 'v7',
    vin: '2019650377',
    brand: 'Nissan',
    model: 'Frontier PRO-4X',
    year: 2019,
    acquisitionCost: 12000,
    freightCost: 1100,
    nationalizationCost: 1900,
    otherExpenses: 150,
    salePrice: 17500,
    status: 'Clima',
    notes: 'Recarga de aire acondicionado y cambio de filtro de cabina.',
    assignedTo: 'Frosty Auto'
  },
  {
    id: 'v8',
    vin: '2019360357',
    brand: 'Chevrolet',
    model: 'Silverado RST',
    year: 2019,
    acquisitionCost: 12500,
    freightCost: 1300,
    nationalizationCost: 1850,
    otherExpenses: 400,
    salePrice: 18900,
    status: 'Estetica',
    notes: 'Detallado de vestiduras de piel y cera líquida.',
    assignedTo: 'Brillo Extremo'
  }
];

export const INITIAL_EXPENSES: Expense[] = [
  {
    id: 'exp1',
    vin: '2019060388',
    type: 'Hojalateria',
    concept: 'Enderezado de Chasis y Laminado Completo',
    provider: 'Laminados Mojalatería',
    cost: 15300,
    date: '2026-05-15'
  },
  {
    id: 'exp2',
    vin: '2019560377',
    type: 'Mecanica',
    concept: 'Cambio de Frenos e Inyectores de Combustión',
    provider: 'Taller Mecánica Pro',
    cost: 5000,
    date: '2026-05-18'
  },
  {
    id: 'exp3',
    vin: '2019650377',
    type: 'Clima',
    concept: 'Mantenimiento del Clima e Intercambiador',
    provider: 'Climos Monterrey',
    cost: 1000,
    date: '2026-05-15'
  },
  {
    id: 'exp4',
    vin: '2019360357',
    type: 'Estetica',
    concept: 'Repulido de Faros y Cambio de Parabrisas',
    provider: 'Cristales del Lote',
    cost: 1000,
    date: '2026-05-16'
  }
];

export const INITIAL_SUPPLIES: SupplyExpense[] = [
  {
    id: 'sup1',
    name: 'Productos Lavado (Champú Car)',
    category: 'Estetica',
    cost: 6500,
    date: '2026-05-10'
  },
  {
    id: 'sup2',
    name: 'Almohadillas de Pulido',
    category: 'Estetica',
    cost: 4200,
    date: '2026-05-12'
  },
  {
    id: 'sup3',
    name: 'Pulimentos y Ceras Importadas',
    category: 'Estetica',
    cost: 3000,
    date: '2026-05-14'
  },
  {
    id: 'sup4',
    name: 'Aromatizantes Nueva Era',
    category: 'Estetica',
    cost: 1500,
    date: '2026-05-14'
  }
];
