import * as XLSX from 'xlsx';
import { Product, Sale, Customer, CustomerWithdrawal, Cheque, Supplier } from '../types';

export const exportToExcel = (data: any[], fileName: string, sheetName = 'Datos') => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
};

export const exportProductsExcel = (products: Product[], suppliers: Supplier[]) => {
  const supplierMap = new Map(suppliers.map(s => [s.id, s.name]));
  const rows = products.map(p => ({
    'Código/SKU': p.code,
    'Producto': p.name,
    'Categoría': p.category,
    'Proveedor': supplierMap.get(p.supplierId) || 'Sin Proveedor',
    'Precio Costo ($)': p.costPrice,
    'Precio Venta ($)': p.salePrice,
    'Margen (%)': (((p.salePrice - p.costPrice) / (p.costPrice || 1)) * 100).toFixed(1) + '%',
    'Stock Actual': p.stock,
    'Stock Mínimo': p.minStock,
    'Estado Stock': p.stock <= p.minStock ? 'BAJO STOCK' : 'Normal',
    'Unidad': p.unit,
    'Última Actualización': new Date(p.updatedAt).toLocaleDateString()
  }));

  exportToExcel(rows, `Inventario_Productos_${new Date().toISOString().slice(0, 10)}`, 'Inventario');
};

export const exportSalesExcel = (sales: Sale[]) => {
  const rows = sales.map(s => ({
    'Comprobante': s.invoiceNumber,
    'Fecha': new Date(s.date).toLocaleString(),
    'Cliente': s.customerName || 'Consumidor Final',
    'Total ($)': s.totalAmount,
    'Método de Pago': formatPaymentMethod(s.paymentMethod),
    'Estado': s.status === 'completed' ? 'Completada' : 'Anulada',
    'Cant. Ítems': s.items.reduce((acc, i) => acc + i.quantity, 0),
    'Notas': s.notes || ''
  }));

  exportToExcel(rows, `Ventas_${new Date().toISOString().slice(0, 10)}`, 'Ventas');
};

export const exportCustomersExcel = (customers: Customer[]) => {
  const rows = customers.map(c => ({
    'Cliente': c.name,
    'DNI / CUIT': c.dniCuit,
    'Teléfono': c.phone,
    'Email': c.email,
    'Dirección': c.address,
    'Límite de Crédito ($)': c.creditLimit,
    'Saldo Deuda ($)': c.currentBalance,
    'Estado Deuda': c.currentBalance > c.creditLimit ? 'EXCEDIDO' : (c.currentBalance > 0 ? 'CON DEUDA' : 'AL DÍA')
  }));

  exportToExcel(rows, `Cuentas_Corrientes_${new Date().toISOString().slice(0, 10)}`, 'Clientes');
};

export const exportWithdrawalsExcel = (withdrawals: CustomerWithdrawal[]) => {
  const rows: any[] = [];
  withdrawals.forEach(w => {
    w.items.forEach(item => {
      rows.push({
        'N° Retiro': w.withdrawalNumber,
        'Fecha': new Date(w.date).toLocaleString(),
        'Cliente': w.customerName,
        'Producto': item.productName,
        'Código': item.productCode,
        'Cantidad': item.quantity,
        'Precio Unit. ($)': item.unitPrice,
        'Total ($)': item.totalPrice,
        'Estado': w.status === 'pending' ? 'Pendiente Facturar' : (w.status === 'billed' ? 'Facturado' : 'Devuelto'),
        'Notas': w.notes || ''
      });
    });
  });

  exportToExcel(rows, `Mercaderia_Retirada_${new Date().toISOString().slice(0, 10)}`, 'Retiros');
};

export const exportChequesExcel = (cheques: Cheque[]) => {
  const rows = cheques.map(c => ({
    'N° Cheque': c.number,
    'Banco': c.bank,
    'Emisor': c.issuerName,
    'CUIT Emisor': c.issuerCuit || '-',
    'Cliente': c.customerName || '-',
    'Monto ($)': c.amount,
    'Fecha Emisión': new Date(c.issueDate).toLocaleDateString(),
    'Fecha Cobro/Venc.': new Date(c.dueDate).toLocaleDateString(),
    'Estado': formatChequeStatus(c.status),
    'Notas': c.notes || ''
  }));

  exportToExcel(rows, `Cartera_Cheques_${new Date().toISOString().slice(0, 10)}`, 'Cheques');
};

const formatPaymentMethod = (method: string) => {
  switch (method) {
    case 'cash': return 'Efectivo';
    case 'card': return 'Tarjeta (Débito/Crédito)';
    case 'transfer': return 'Transferencia Bancaria';
    case 'cheque': return 'Cheque';
    case 'current_account': return 'Cuenta Corriente';
    default: return method;
  }
};

const formatChequeStatus = (status: string) => {
  switch (status) {
    case 'pending': return 'Pendiente';
    case 'in_wallet': return 'En Cartera';
    case 'deposited': return 'Depositado';
    case 'cashed': return 'Cobrado';
    case 'endorsed': return 'Endosado';
    case 'rejected': return 'Rechazado';
    default: return status;
  }
};
