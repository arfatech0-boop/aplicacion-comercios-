import { AppState } from '../types';

export const initialAppData: AppState = {
  storeInfo: {
    name: "Comercial Central Pro",
    cuit: "30-71234567-8",
    taxCondition: "Responsable Inscripto",
    businessType: "Comercio General / Multirrubro",
    address: "Av. San Martín 1450, Ciudad",
    phone: "011 4589-2310",
    email: "ventas@comercialcentral.com",
    invoicePrefix: "0001",
    currencySymbol: "$",
    defaultTaxRate: 21,
    cashDiscountPercent: 5,
    cardSurchargePercent: 10,
    receiptHeaderMessage: "¡Gracias por su compra! Conserve este comprobante.",
    defaultCounterInvoiceType: "FACTURA_B",
    defaultCurrentAccountInvoiceType: "REMITO",
    defaultRespInscriptoInvoiceType: "FACTURA_A",
    afipPointOfSale: "0001",
    cardInterestPlans: [
      { id: 'p1', name: 'Débito / 1 Pago Efectivo', surchargePercent: 0, description: 'Sin recargo' },
      { id: 'p2', name: 'Visa / Mastercard 1 Pago', surchargePercent: 5, description: 'Recargo contado Posnet' },
      { id: 'p3', name: 'Mercado Pago / QR', surchargePercent: 8, description: 'Tasa cobro digital' },
      { id: 'p4', name: '3 Cuotas (Cuota Simple)', surchargePercent: 15, description: 'Plan nacional 3 pagos' },
      { id: 'p5', name: '6 Cuotas Financiamiento', surchargePercent: 28, description: 'Plan banco 6 pagos' },
      { id: 'p6', name: '12 Cuotas Larga Duración', surchargePercent: 42, description: 'Plan banco 12 pagos' },
    ],
    customCategories: [
      "Construcción",
      "Pinturas",
      "Herramientas",
      "Electricidad",
      "Ferretería",
      "General"
    ]
  },
  suppliers: [
    {
      id: "sup-1",
      name: "Distribuidora San José",
      cuit: "30-58912344-2",
      phone: "011 4782-9900",
      email: "pedidos@distribusanjose.com",
      contact: "Roberto Gómez",
      notes: "Proveedor principal de ferretería y grifería"
    },
    {
      id: "sup-2",
      name: "Materiales del Norte S.A.",
      cuit: "33-67123984-9",
      phone: "011 4200-1122",
      email: "ventas@matnorte.com.ar",
      contact: "Mariana Fernández",
      notes: "Proveedor de cemento, cal, arena y construcción"
    },
    {
      id: "sup-3",
      name: "Pinturas & Revestimientos S.R.L.",
      cuit: "30-70984123-5",
      phone: "011 4331-5544",
      email: "contacto@pinturasrevest.com",
      contact: "Esteban Rossi",
      notes: "Entrega los días martes y jueves"
    }
  ],
  products: [
    {
      id: "prod-1",
      code: "779123456001",
      name: "Cemento Portland 50kg Loma Negra",
      category: "Construcción",
      supplierId: "sup-2",
      costPrice: 7500,
      salePrice: 10500,
      stock: 45,
      minStock: 20,
      unit: "un",
      size: "50 kg",
      brand: "Loma Negra",
      description: "Bolsa de cemento hidratado de alto rendimiento 50kg",
      updatedAt: "2026-08-01T10:00:00.000Z"
    },
    {
      id: "prod-2",
      code: "779123456002",
      name: "Cal Hidratada 25kg Horcajo",
      category: "Construcción",
      supplierId: "sup-2",
      costPrice: 2800,
      salePrice: 4200,
      stock: 6, // Low stock alert!
      minStock: 15,
      unit: "un",
      size: "25 kg",
      brand: "Horcajo",
      description: "Bolsa de cal común hidratada para construcción",
      updatedAt: "2026-08-01T10:00:00.000Z"
    },
    {
      id: "prod-3",
      code: "779123456003",
      name: "Pintura Látex Interior Blanco 20L",
      category: "Pinturas",
      supplierId: "sup-3",
      costPrice: 28000,
      salePrice: 42000,
      stock: 12,
      minStock: 5,
      unit: "un",
      size: "20 Litros",
      color: "Blanco Mate",
      brand: "Albalatex",
      description: "Látex super lavable blanco mate para interiores",
      updatedAt: "2026-08-02T11:30:00.000Z"
    },
    {
      id: "prod-4",
      code: "779123456004",
      name: "Esmalte Sintético 4L Satinado",
      category: "Pinturas",
      supplierId: "sup-3",
      costPrice: 11000,
      salePrice: 16500,
      stock: 3, // Low stock alert!
      minStock: 8,
      unit: "un",
      size: "4 Litros",
      color: "Negro Satinado",
      brand: "Tersuave",
      description: "Esmalte antioxidante para maderas y metales",
      updatedAt: "2026-08-02T11:30:00.000Z"
    },
    {
      id: "prod-5",
      code: "779123456005",
      name: "Juego Grifería Monocomando Cocina",
      category: "Ferretería",
      supplierId: "sup-1",
      costPrice: 35000,
      salePrice: 52000,
      stock: 8,
      minStock: 4,
      unit: "un",
      size: "Especial",
      brand: "FV",
      description: "Monocomando pico alto metálico cromado FV",
      updatedAt: "2026-08-03T09:15:00.000Z"
    },
    {
      id: "prod-6",
      code: "779123456006",
      name: "Taladro Percutor 750W 13mm",
      category: "Herramientas",
      supplierId: "sup-1",
      costPrice: 48000,
      salePrice: 72000,
      stock: 5,
      minStock: 3,
      unit: "un",
      size: "13mm",
      brand: "DeWalt",
      description: "Taladro industrial velocidad variable e inversión de giro",
      updatedAt: "2026-08-03T09:15:00.000Z"
    },
    {
      id: "prod-7",
      code: "779123456007",
      name: "Discos de Corte Metal 115mm (Pack x10)",
      category: "Herramientas",
      supplierId: "sup-1",
      costPrice: 4500,
      salePrice: 7500,
      stock: 25,
      minStock: 10,
      unit: "pack",
      size: "115mm",
      brand: "Bosch",
      description: "Discos ultra finos 1mm para amoladora angular",
      updatedAt: "2026-08-04T14:20:00.000Z"
    },
    {
      id: "prod-8",
      code: "779123456008",
      name: "Remera Algodón Premium M/C",
      category: "Indumentaria",
      supplierId: "sup-1",
      costPrice: 8500,
      salePrice: 15900,
      stock: 18,
      minStock: 5,
      unit: "un",
      size: "L",
      color: "Negro",
      brand: "Levi's",
      description: "Remera 100% algodón peinado escote C",
      updatedAt: "2026-08-05T12:00:00.000Z"
    },
    {
      id: "prod-9",
      code: "779123456009",
      name: "Remera Algodón Premium M/C",
      category: "Indumentaria",
      supplierId: "sup-1",
      costPrice: 8500,
      salePrice: 15900,
      stock: 14,
      minStock: 5,
      unit: "un",
      size: "M",
      color: "Blanco",
      brand: "Levi's",
      description: "Remera 100% algodón peinado escote C",
      updatedAt: "2026-08-05T12:00:00.000Z"
    },
    {
      id: "prod-10",
      code: "779123456010",
      name: "Pantalón Jean Slim Fit Stretch",
      category: "Indumentaria",
      supplierId: "sup-1",
      costPrice: 22000,
      salePrice: 39500,
      stock: 9,
      minStock: 4,
      unit: "un",
      size: "42",
      color: "Azul Denim",
      brand: "Wrangler",
      description: "Jean elastizado tiro medio 5 bolsillos",
      updatedAt: "2026-08-05T12:00:00.000Z"
    },
    {
      id: "prod-11",
      code: "779123456011",
      name: "Buzo Canguro Friado Capucha",
      category: "Indumentaria",
      supplierId: "sup-1",
      costPrice: 28000,
      salePrice: 48900,
      stock: 7,
      minStock: 3,
      unit: "un",
      size: "XL",
      color: "Gris Melange",
      brand: "Puma",
      description: "Buzo frisa algodón abrigado con bolsillo frontal",
      updatedAt: "2026-08-05T12:00:00.000Z"
    },
    {
      id: "prod-12",
      code: "779123456012",
      name: "Zapatillas Urbanas Running",
      category: "Indumentaria",
      supplierId: "sup-1",
      costPrice: 42000,
      salePrice: 74900,
      stock: 6,
      minStock: 2,
      unit: "un",
      size: "41",
      color: "Negro/Blanco",
      brand: "Nike",
      description: "Calzado deportivo amortiguación alta densidad",
      updatedAt: "2026-08-05T12:00:00.000Z"
    }
  ],
  priceIncreaseLogs: [
    {
      id: "inc-1",
      supplierId: "sup-2",
      supplierName: "Materiales del Norte S.A.",
      percentage: 12.5,
      applyToCost: true,
      applyToSale: true,
      recalculateMargin: true,
      affectedProductsCount: 2,
      date: "2026-07-25T14:30:00.000Z"
    }
  ],
  customers: [
    {
      id: "cust-1",
      name: "Constructora Horizon S.R.L.",
      dniCuit: "30-78112233-4",
      phone: "011 4455-6677",
      email: "administracion@constructorahorizon.com",
      address: "Calle Los Ciruelos 450",
      creditLimit: 500000,
      currentBalance: 185000, // Owes 185.000
      notes: "Cliente corporativo habitual. Pago a 30 días",
      updatedAt: "2026-08-05T12:00:00.000Z"
    },
    {
      id: "cust-2",
      name: "Juan Carlos Pérez (Electricidad)",
      dniCuit: "20-28991234-8",
      phone: "011 15-6789-0123",
      email: "jcperez.elec@gmail.com",
      address: "Av. Belgrano 1280",
      creditLimit: 150000,
      currentBalance: 42500, // Owes 42.500
      notes: "Contratista de obras particulares",
      updatedAt: "2026-08-04T16:00:00.000Z"
    },
    {
      id: "cust-3",
      name: "María Elena Soria",
      dniCuit: "27-31445566-3",
      phone: "011 15-4123-9876",
      email: "maria.soria@hotmail.com",
      address: "Mitre 890, 2do B",
      creditLimit: 80000,
      currentBalance: 0, // Al día
      notes: "Cliente final recurrente",
      updatedAt: "2026-08-01T09:00:00.000Z"
    }
  ],
  customerTransactions: [
    {
      id: "tx-1",
      customerId: "cust-1",
      type: "sale",
      amount: 215000,
      balanceAfter: 215000,
      date: "2026-07-28T11:00:00.000Z",
      description: "Venta FC-0001-00001042 a Cuenta Corriente",
      saleId: "sale-101"
    },
    {
      id: "tx-2",
      customerId: "cust-1",
      type: "payment",
      amount: 30000,
      balanceAfter: 185000,
      date: "2026-08-02T15:30:00.000Z",
      description: "Pago parcial de cuenta corriente - Transferencia",
      receiptNumber: "REC-0001-0089"
    },
    {
      id: "tx-3",
      customerId: "cust-2",
      type: "sale",
      amount: 42500,
      balanceAfter: 42500,
      date: "2026-08-04T16:00:00.000Z",
      description: "Venta FC-0001-00001048 a Cuenta Corriente",
      saleId: "sale-102"
    }
  ],
  withdrawals: [
    {
      id: "with-1",
      withdrawalNumber: "RET-0001-00045",
      customerId: "cust-1",
      customerName: "Constructora Horizon S.R.L.",
      date: "2026-08-03T10:15:00.000Z",
      items: [
        {
          productId: "prod-1",
          productCode: "779123456001",
          productName: "Cemento Portland 50kg Loma Negra",
          quantity: 10,
          unitPrice: 10500,
          totalPrice: 105000
        },
        {
          productId: "prod-2",
          productCode: "779123456002",
          productName: "Cal Hidratada 25kg Horcajo",
          quantity: 5,
          unitPrice: 4200,
          totalPrice: 21000
        }
      ],
      totalAmount: 126000,
      status: "pending",
      notes: "Retirado por capataz Miguel Ángel. Pendiente de facturar a fin de mes.",
      authorizedBy: "Carlos Gómez (Encargado)"
    }
  ],
  sales: [
    {
      id: "sale-201",
      invoiceNumber: "FC-0001-00001050",
      date: "2026-08-06T10:30:00.000Z",
      customerId: "cust-3",
      customerName: "María Elena Soria",
      items: [
        {
          productId: "prod-3",
          code: "779123456003",
          productName: "Pintura Látex Interior Blanco 20L",
          quantity: 1,
          unitPrice: 42000,
          costPrice: 28000,
          subtotal: 42000
        },
        {
          productId: "prod-4",
          code: "779123456004",
          productName: "Esmalte Sintético 4L Satinado",
          quantity: 1,
          unitPrice: 16500,
          costPrice: 11000,
          subtotal: 16500
        }
      ],
      subtotal: 58500,
      discount: 0,
      totalAmount: 58500,
      paymentMethod: "cash",
      status: "completed",
      notes: "Venta contado mostrador"
    },
    {
      id: "sale-202",
      invoiceNumber: "FC-0001-00001051",
      date: "2026-08-06T14:15:00.000Z",
      customerId: "cust-2",
      customerName: "Juan Carlos Pérez (Electricidad)",
      items: [
        {
          productId: "prod-6",
          code: "779123456006",
          productName: "Taladro Percutor 750W 13mm",
          quantity: 1,
          unitPrice: 72000,
          costPrice: 48000,
          subtotal: 72000
        },
        {
          productId: "prod-7",
          code: "779123456007",
          productName: "Discos de Corte Metal 115mm (Pack x10)",
          quantity: 2,
          unitPrice: 7500,
          costPrice: 4500,
          subtotal: 15000
        }
      ],
      subtotal: 87000,
      discount: 2000,
      totalAmount: 85000,
      paymentMethod: "transfer",
      status: "completed",
      notes: "Descuento por pago contado transferencia"
    },
    {
      id: "sale-203",
      invoiceNumber: "FC-0001-00001049",
      date: "2026-08-05T17:40:00.000Z",
      items: [
        {
          productId: "prod-1",
          code: "779123456001",
          productName: "Cemento Portland 50kg Loma Negra",
          quantity: 5,
          unitPrice: 10500,
          costPrice: 7500,
          subtotal: 52500
        }
      ],
      subtotal: 52500,
      discount: 0,
      totalAmount: 52500,
      paymentMethod: "card",
      status: "completed"
    }
  ],
  cheques: [
    {
      id: "chq-1",
      number: "00849120",
      bank: "Banco Galicia",
      issuerName: "Constructora Horizon S.R.L.",
      issuerCuit: "30-78112233-4",
      customerId: "cust-1",
      customerName: "Constructora Horizon S.R.L.",
      amount: 120000,
      issueDate: "2026-08-01T00:00:00.000Z",
      dueDate: "2026-08-15T00:00:00.000Z",
      status: "in_wallet",
      notes: "Cheque diferido entregado a cuenta de factura anterior"
    },
    {
      id: "chq-2",
      number: "11928340",
      bank: "Banco Nación",
      issuerName: "Instalaciones SRL",
      amount: 75000,
      issueDate: "2026-07-20T00:00:00.000Z",
      dueDate: "2026-08-05T00:00:00.000Z",
      status: "cashed",
      notes: "Cobrado por ventanilla el 05/08"
    }
  ],
  cashRegisters: [
    {
      id: "cash-today",
      openDate: "2026-08-06T08:00:00.000Z",
      initialAmount: 25000,
      cashSales: 58500,
      accountPayments: 0,
      cashExpenses: 5000,
      expectedTotal: 78500,
      status: "open",
      movements: [
        {
          id: "mov-1",
          type: "in",
          amount: 58500,
          description: "Venta FC-0001-00001050 (Efectivo)",
          category: "sale",
          date: "2026-08-06T10:30:00.000Z",
          paymentMethod: "cash"
        },
        {
          id: "mov-2",
          type: "out",
          amount: 5000,
          description: "Flete local envíos de insumos",
          category: "expense",
          date: "2026-08-06T11:45:00.000Z",
          paymentMethod: "cash"
        }
      ],
      notes: "Caja abierta de turno mañana/tarde"
    }
  ],
  stockMovements: [
    {
      id: "sm-1",
      productId: "prod-3",
      productName: "Pintura Látex Interior Blanco 20L",
      type: "sale",
      quantity: 1,
      previousStock: 13,
      newStock: 12,
      date: "2026-08-06T10:30:00.000Z",
      reason: "Venta FC-0001-00001050"
    },
    {
      id: "sm-2",
      productId: "prod-4",
      productName: "Esmalte Sintético 4L Satinado",
      type: "sale",
      quantity: 1,
      previousStock: 4,
      newStock: 3,
      date: "2026-08-06T10:30:00.000Z",
      reason: "Venta FC-0001-00001050"
    },
    {
      id: "sm-3",
      productId: "prod-1",
      productName: "Cemento Portland 50kg Loma Negra",
      type: "withdrawal",
      quantity: 10,
      previousStock: 55,
      newStock: 45,
      date: "2026-08-03T10:15:00.000Z",
      reason: "Retiro de cliente Constructora Horizon (RET-0001-00045)"
    }
  ],
  users: [
    {
      id: "user-admin-default",
      username: "admin",
      password: "admin",
      name: "Administrador Principal",
      role: "admin",
      active: true,
      createdAt: "2026-08-01T00:00:00.000Z"
    }
  ]
};
