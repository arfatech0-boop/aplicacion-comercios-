import React, { useState } from 'react';
import { 
  BookOpen, 
  ShoppingCart, 
  Package, 
  Users, 
  Wallet, 
  BarChart3, 
  Settings, 
  Search, 
  CheckCircle2, 
  HelpCircle, 
  Printer, 
  Download, 
  Sparkles, 
  ArrowRight,
  ShieldCheck,
  CreditCard,
  Building2,
  Tag,
  FileText
} from 'lucide-react';
import { AppState } from '../types';

import posGuideImg from '../assets/images/pos_system_guide_1786205109803.jpg';
import inventoryGuideImg from '../assets/images/inventory_stock_guide_1786205123344.jpg';
import customerGuideImg from '../assets/images/customer_accounts_guide_1786205144632.jpg';
import reportsGuideImg from '../assets/images/reports_finance_guide_1786205134849.jpg';

interface UserGuideViewProps {
  appState: AppState;
  setActiveTab: (tab: any) => void;
}

export const UserGuideView: React.FC<UserGuideViewProps> = ({ appState, setActiveTab }) => {
  const [selectedSection, setSelectedSection] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const guideSections = [
    {
      id: 'pos',
      title: '1. Ventas & Punto de Venta (POS)',
      badge: 'Módulo Principal',
      image: posGuideImg,
      icon: ShoppingCart,
      color: 'from-indigo-600 to-indigo-800',
      description: 'Sistema ultrarrápido de caja registrado para cobrar con lector de código de barras, teclado o pantalla táctil.',
      features: [
        'Búsqueda por código de barras, nombre, categoría, talle o color.',
        'Soporte instantáneo para Factura A, Factura B, Factura C, Ticket X y Remito.',
        'Cálculo automático de descuento por efectivo o recargo por cuotas en tarjeta.',
        'Atajos de teclado (F2 para cobrar en efectivo, F4 para tarjeta, F8 para cuenta corriente).'
      ],
      steps: [
        'Seleccione o busque el producto utilizando el buscador superior o haciendo clic en el catálogo visual.',
        'Ajuste la cantidad, aplique un descuento o seleccione el cliente asignado si corresponde.',
        'Haga clic en "+ Cobrar Venta" o presione F2/F4 según el medio de pago.',
        'El sistema actualizará el stock inmediatamente y emitirá el comprobante correspondiente.'
      ]
    },
    {
      id: 'stock',
      title: '2. Gestión de Stock & Inventario',
      badge: 'Control de Productos',
      image: inventoryGuideImg,
      icon: Package,
      color: 'from-emerald-600 to-teal-800',
      description: 'Catálogo de artículos, control de stock mínimo, variantes de color/talle y listas de precios.',
      features: [
        'Alertas automáticas de bajo stock en la barra superior.',
        'Aumento masivo de precios por proveedor o por categoría específica.',
        'Ajustes manuales de inventario (Entradas por compra, Salidas por rotura/pérdida).',
        'Impresión de etiquetas con código de barras en un solo clic.'
      ],
      steps: [
        'Acceda a la pestaña "Stock & Inventario" desde el menú lateral.',
        'Para agregar un artículo nuevo, haga clic en el botón "+ Nuevo Producto".',
        'Especifique precios de costo, margen de ganancia, precio de venta, talle y proveedor.',
        'Utilice el filtro por categoría o la pestaña "Proveedores & Aumento" para actualizar precios en masa.'
      ]
    },
    {
      id: 'customers',
      title: '3. Cuentas Corrientes & Clientes',
      badge: 'Crédito y Cobranzas',
      image: customerGuideImg,
      icon: Users,
      color: 'from-blue-600 to-indigo-800',
      description: 'Administración de deudas de clientes, entregas a cuenta, estados de cuenta e historial de compras.',
      features: [
        'Registro de clientes con CUIT / DNI, condición fiscal y límite de crédito.',
        'Imputación de ventas directo a Cuenta Corriente desde la pantalla de cobro POS.',
        'Cobro de entregas/pagos parciales con emisión de Recibo X de Cobranza.',
        'Resumen de saldo deudor actualizado en tiempo real y exportable a PDF.'
      ],
      steps: [
        'En la pestaña "Cuentas Corrientes", seleccione el cliente para ver su saldo pendiente.',
        'Para registrar un cobro o entrega a cuenta, presione el botón "Registrar Entrega / Pago".',
        'Para realizar una venta a crédito, en la caja POS elija el cliente y seleccione el medio "A Cuenta Corriente".'
      ]
    },
    {
      id: 'cash_reports',
      title: '4. Control de Caja & Reportes Financieros',
      badge: 'Finanzas & Arqueo',
      image: reportsGuideImg,
      icon: Wallet,
      color: 'from-purple-600 to-slate-800',
      description: 'Control diario de ingresos/egresos en efectivo, tarjetas, transferencias y balances consolidados.',
      features: [
        'Apertura y cierre de caja con arqueo ciego o controlado.',
        'Registro de egresos / gastos diarios y retiros de dinero.',
        'Estadísticas de productos más vendidos, mejores horarios y rendimiento por categoría.',
        'Exportación instantánea a Excel o reportes listos para imprimir.'
      ],
      steps: [
        'Al iniciar la jornada, confirme el monto inicial en la pestaña "Control de Caja Diaria".',
        'Durante el día, todas las ventas se computan automáticamente separadas por medio de pago.',
        'Realice el Cierre de Caja al finalizar el turno para obtener el balance neto exacto.'
      ]
    }
  ];

  const filteredSections = guideSections.filter(section => {
    const matchesSection = selectedSection === 'all' || section.id === selectedSection;
    const matchesQuery = !searchQuery || 
      section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      section.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      section.features.some(f => f.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSection && matchesQuery;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Banner Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold uppercase tracking-wider">
            <BookOpen className="w-4 h-4 text-indigo-400" />
            <span>Manual del Usuario & Documentación Ilustrada</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Guía Explicativa del Sistema Comercial
          </h1>
          <p className="text-slate-300 text-sm leading-relaxed">
            Bienvenido a la documentación oficial de <strong className="text-indigo-300 font-bold">{appState.storeInfo.name}</strong>. 
            Aquí encontrará la explicación paso a paso de cada módulo, junto con diagramas e imágenes ilustrativas de funcionamiento.
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <button
              onClick={() => setActiveTab('pos')}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center space-x-2 transition-all shadow-md shadow-indigo-600/30"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Ir al Punto de Venta (POS)</span>
            </button>
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold rounded-xl text-xs flex items-center space-x-2 transition-all"
            >
              <Printer className="w-4 h-4 text-slate-400" />
              <span>Imprimir / Guardar en PDF</span>
            </button>
          </div>
        </div>

        {/* Decorative Background Element */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-indigo-600/10 to-transparent pointer-events-none hidden md:block" />
      </div>

      {/* Filter and Search Navigation */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Quick Tabs */}
          <div className="flex items-center space-x-1.5 overflow-x-auto w-full sm:w-auto scrollbar-none pb-1 sm:pb-0">
            <button
              onClick={() => setSelectedSection('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                selectedSection === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Todas las Secciones
            </button>
            {guideSections.map(s => (
              <button
                key={s.id}
                onClick={() => setSelectedSection(s.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  selectedSection === s.id
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {s.title.split('.')[1] || s.title}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Buscar tema o función..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          </div>
        </div>
      </div>

      {/* Main Guide Modules */}
      <div className="space-y-8">
        {filteredSections.map(section => {
          const SectionIcon = section.icon;
          return (
            <div 
              key={section.id} 
              className="bg-white rounded-2xl border border-slate-200/90 shadow-md overflow-hidden transition-all hover:shadow-lg"
            >
              {/* Header Bar */}
              <div className={`bg-gradient-to-r ${section.color} p-4 sm:p-5 text-white flex items-center justify-between`}>
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-xs border border-white/20">
                    <SectionIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-200 bg-black/20 px-2 py-0.5 rounded-md border border-white/10">
                      {section.badge}
                    </span>
                    <h2 className="text-lg sm:text-xl font-black text-white mt-0.5">
                      {section.title}
                    </h2>
                  </div>
                </div>
              </div>

              {/* Main Content Grid */}
              <div className="p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                {/* Image Illustration Column */}
                <div className="lg:col-span-5 space-y-2">
                  <div className="rounded-xl overflow-hidden border border-slate-200 shadow-sm group bg-slate-100">
                    <img 
                      src={section.image} 
                      alt={section.title} 
                      className="w-full h-52 sm:h-60 object-cover group-hover:scale-105 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 text-center italic font-medium">
                    Ilustración del módulo {section.title.split('.')[1]}
                  </p>
                </div>

                {/* Text Explanation & Features Column */}
                <div className="lg:col-span-7 space-y-4">
                  <p className="text-slate-700 text-sm font-medium leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                    {section.description}
                  </p>

                  {/* Features List */}
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 mb-2 flex items-center space-x-1.5">
                      <Sparkles className="w-4 h-4 text-indigo-600" />
                      <span>Características Clave:</span>
                    </h3>
                    <ul className="space-y-1.5">
                      {section.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start space-x-2 text-xs text-slate-700 font-medium">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Step by Step Guide */}
                  <div className="pt-2 border-t border-slate-100">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 mb-2">
                      Pasos de Uso Recomendados:
                    </h3>
                    <div className="space-y-2">
                      {section.steps.map((step, idx) => (
                        <div key={idx} className="flex items-start space-x-2.5 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                          <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-extrabold text-[11px] flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs">
                            {idx + 1}
                          </span>
                          <span className="text-xs text-slate-800 font-medium leading-tight">
                            {step}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* FAQ & Support Section */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center space-x-3 text-slate-900 border-b border-slate-100 pb-3">
          <HelpCircle className="w-6 h-6 text-indigo-600" />
          <h2 className="text-lg font-black tracking-tight">Preguntas Frecuentes & Consejos Rápidos</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-700">
          <div className="bg-indigo-50/60 p-4 rounded-xl border border-indigo-100 space-y-1">
            <span className="font-extrabold text-indigo-950 block text-sm">¿Cómo cambiar el tipo de negocio / rubro?</span>
            <p className="text-indigo-900">
              Haga clic en el botón de ajustes en el menú lateral o en la barra superior. Allí puede elegir entre Indumentaria, Ferretería, Almacén, Electrónica, etc. El sistema adaptará automáticamente el catálogo y las plantillas.
            </p>
          </div>

          <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-100 space-y-1">
            <span className="font-extrabold text-emerald-950 block text-sm">¿Se requiere conexión permanente a Internet?</span>
            <p className="text-emerald-900">
              No. El sistema cuenta con arquitectura offline-first con sincronización automática en tiempo real cuando recupera conexión.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
