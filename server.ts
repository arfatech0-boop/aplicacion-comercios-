import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { initialAppData } from './src/data/mockData';
import { AppState, Product, Supplier, Customer, Sale, CustomerWithdrawal, Cheque, CashRegister } from './src/types';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// In-Memory & File-Persisted Database
const DATA_FILE = path.join(process.cwd(), 'app-data.json');

let appState: AppState = { ...initialAppData };

// Load data if exists
if (fs.existsSync(DATA_FILE)) {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    appState = JSON.parse(raw);
    console.log('[Server] Loaded persisted database state from file.');
  } catch (err) {
    console.error('[Server] Failed to load data file, using default mock data.', err);
  }
} else {
  saveState();
}

function saveState() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(appState, null, 2));
  } catch (err) {
    console.error('[Server] Error saving database state:', err);
  }
}

// Real-time SSE Clients list for multi-device sync
let sseClients: express.Response[] = [];

function broadcastUpdate(type: string, payload: any) {
  const message = `data: ${JSON.stringify({ type, payload, timestamp: new Date().toISOString() })}\n\n`;
  sseClients.forEach(res => res.write(message));
}

// --- API ENDPOINTS ---

// Server Sent Events (SSE) stream for real-time multi-device synchronization
app.get('/api/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  sseClients.push(res);

  req.on('close', () => {
    sseClients = sseClients.filter(client => client !== res);
  });
});

// Ensure storeInfo defaults
appState.storeInfo = { ...initialAppData.storeInfo, ...appState.storeInfo };

// GET full state
app.get('/api/data', (req, res) => {
  res.json({ success: true, data: appState });
});

// POST store info update
app.post('/api/store-info', (req, res) => {
  if (req.body) {
    appState.storeInfo = { ...appState.storeInfo, ...req.body };
    saveState();
    broadcastUpdate('STORE_INFO_UPDATED', appState.storeInfo);
    return res.json({ success: true, data: appState.storeInfo });
  }
  res.status(400).json({ success: false, error: 'Invalid store info payload' });
});

// POST save entire state / sync
app.post('/api/sync', (req, res) => {
  if (req.body && req.body.data) {
    appState = req.body.data;
    saveState();
    broadcastUpdate('FULL_SYNC', appState);
    return res.json({ success: true, data: appState });
  }
  res.status(400).json({ success: false, error: 'Invalid data payload' });
});

// POST add/update product
app.post('/api/products', (req, res) => {
  const product: Product = req.body;
  const index = appState.products.findIndex(p => p.id === product.id);
  if (index >= 0) {
    appState.products[index] = product;
  } else {
    appState.products.unshift(product);
  }
  saveState();
  broadcastUpdate('PRODUCTS_UPDATED', appState.products);
  res.json({ success: true, data: appState.products });
});

// POST delete product
app.delete('/api/products/:id', (req, res) => {
  const { id } = req.params;
  appState.products = appState.products.filter(p => p.id !== id);
  saveState();
  broadcastUpdate('PRODUCTS_UPDATED', appState.products);
  res.json({ success: true, data: appState.products });
});

// POST replace all products (e.g. when changing store rubro / catalog)
app.post('/api/products/replace', (req, res) => {
  if (Array.isArray(req.body.products)) {
    appState.products = req.body.products;
    saveState();
    broadcastUpdate('PRODUCTS_UPDATED', appState.products);
    return res.json({ success: true, data: appState.products });
  }
  res.status(400).json({ success: false, error: 'Invalid products array' });
});

// POST Bulk Global Price Increase by Supplier/Category
app.post('/api/suppliers/increase-prices', (req, res) => {
  const { supplierId, categoryFilter, percentage, applyToCost, applyToSale, recalculateMargin } = req.body;
  if (!percentage || percentage === 0) {
    return res.status(400).json({ success: false, error: 'Percentage is required' });
  }

  const factor = 1 + percentage / 100;
  let count = 0;

  appState.products = appState.products.map(p => {
    let match = true;
    if (supplierId && supplierId !== 'ALL' && p.supplierId !== supplierId) match = false;
    if (categoryFilter && categoryFilter !== 'ALL' && p.category !== categoryFilter) match = false;

    if (match) {
      count++;
      let newCost = p.costPrice;
      let newSale = p.salePrice;

      if (applyToCost) {
        newCost = Math.round(p.costPrice * factor);
      }

      if (applyToSale) {
        if (recalculateMargin && applyToCost) {
          // Keep margin constant: margin = sale / oldCost => newSale = newCost * margin
          const marginRatio = p.salePrice / (p.costPrice || 1);
          newSale = Math.round(newCost * marginRatio);
        } else {
          newSale = Math.round(p.salePrice * factor);
        }
      }

      return {
        ...p,
        costPrice: newCost,
        salePrice: newSale,
        updatedAt: new Date().toISOString()
      };
    }
    return p;
  });

  const supplierObj = appState.suppliers.find(s => s.id === supplierId);
  const supplierName = supplierId === 'ALL' ? 'Todos los Proveedores' : (supplierObj ? supplierObj.name : 'Proveedor');

  const logEntry = {
    id: `inc-${Date.now()}`,
    supplierId,
    supplierName,
    categoryFilter,
    percentage,
    applyToCost,
    applyToSale,
    recalculateMargin,
    affectedProductsCount: count,
    date: new Date().toISOString()
  };

  appState.priceIncreaseLogs.unshift(logEntry);
  saveState();
  broadcastUpdate('PRICE_INCREASE_APPLIED', { products: appState.products, log: logEntry });

  res.json({ success: true, affectedCount: count, data: appState });
});

// POST process sale
app.post('/api/sales', (req, res) => {
  const sale: Sale = req.body;

  // 1. Deduct stock and log movements
  sale.items.forEach(item => {
    const prod = appState.products.find(p => p.id === item.productId);
    if (prod) {
      const prev = prod.stock;
      prod.stock = Math.max(0, prod.stock - item.quantity);
      prod.updatedAt = new Date().toISOString();

      appState.stockMovements.unshift({
        id: `sm-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        productId: prod.id,
        productName: prod.name,
        type: 'sale',
        quantity: item.quantity,
        previousStock: prev,
        newStock: prod.stock,
        date: sale.date,
        reason: `Venta ${sale.invoiceNumber}`
      });
    }
  });

  // 2. Add Sale record
  appState.sales.unshift(sale);

  // 3. Handle Current Account if paymentMethod === 'current_account'
  if (sale.paymentMethod === 'current_account' && sale.customerId) {
    const customer = appState.customers.find(c => c.id === sale.customerId);
    if (customer) {
      customer.currentBalance += sale.totalAmount;
      customer.updatedAt = new Date().toISOString();

      appState.customerTransactions.unshift({
        id: `tx-${Date.now()}`,
        customerId: customer.id,
        type: 'sale',
        amount: sale.totalAmount,
        balanceAfter: customer.currentBalance,
        date: sale.date,
        description: `Venta ${sale.invoiceNumber} a Cuenta Corriente`,
        saleId: sale.id
      });
    }
  }

  // 4. Handle Cash Register movement if cash
  if (sale.paymentMethod === 'cash') {
    const openCash = appState.cashRegisters.find(c => c.status === 'open');
    if (openCash) {
      openCash.cashSales += sale.totalAmount;
      openCash.expectedTotal += sale.totalAmount;
      openCash.movements.unshift({
        id: `mov-${Date.now()}`,
        type: 'in',
        amount: sale.totalAmount,
        description: `Venta ${sale.invoiceNumber} (Efectivo)`,
        category: 'sale',
        date: sale.date,
        paymentMethod: 'cash'
      });
    }
  }

  saveState();
  broadcastUpdate('SALE_COMPLETED', { sale, state: appState });

  res.json({ success: true, sale, data: appState });
});

// POST add customer payment
app.post('/api/customers/payment', (req, res) => {
  const { customerId, amount, paymentMethod, notes, receiptNumber } = req.body;
  const customer = appState.customers.find(c => c.id === customerId);

  if (!customer) {
    return res.status(404).json({ success: false, error: 'Cliente no encontrado' });
  }

  customer.currentBalance = Math.max(0, customer.currentBalance - amount);
  customer.updatedAt = new Date().toISOString();

  const transaction = {
    id: `tx-${Date.now()}`,
    customerId: customer.id,
    type: 'payment' as const,
    amount,
    balanceAfter: customer.currentBalance,
    date: new Date().toISOString(),
    description: `Cobro Cuenta Corriente (${paymentMethod}) ${notes ? '- ' + notes : ''}`,
    receiptNumber: receiptNumber || `REC-${Date.now().toString().slice(-6)}`
  };

  appState.customerTransactions.unshift(transaction);

  // If cash, update open cash register
  if (paymentMethod === 'cash') {
    const openCash = appState.cashRegisters.find(c => c.status === 'open');
    if (openCash) {
      openCash.accountPayments += amount;
      openCash.expectedTotal += amount;
      openCash.movements.unshift({
        id: `mov-${Date.now()}`,
        type: 'in',
        amount,
        description: `Cobro Cta. Cte. ${customer.name}`,
        category: 'customer_payment',
        date: new Date().toISOString(),
        paymentMethod: 'cash'
      });
    }
  }

  saveState();
  broadcastUpdate('CUSTOMER_PAYMENT', { customer, transaction, state: appState });

  res.json({ success: true, customer, transaction, data: appState });
});

// POST Customer Withdrawal (Mercadería retirada)
app.post('/api/withdrawals', (req, res) => {
  const withdrawal: CustomerWithdrawal = req.body;

  // Deduct stock
  withdrawal.items.forEach(item => {
    const prod = appState.products.find(p => p.id === item.productId);
    if (prod) {
      const prev = prod.stock;
      prod.stock = Math.max(0, prod.stock - item.quantity);
      prod.updatedAt = new Date().toISOString();

      appState.stockMovements.unshift({
        id: `sm-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        productId: prod.id,
        productName: prod.name,
        type: 'withdrawal',
        quantity: item.quantity,
        previousStock: prev,
        newStock: prod.stock,
        date: withdrawal.date,
        reason: `Retiro de cliente ${withdrawal.customerName} (${withdrawal.withdrawalNumber})`
      });
    }
  });

  appState.withdrawals.unshift(withdrawal);
  saveState();
  broadcastUpdate('WITHDRAWAL_REGISTERED', { withdrawal, state: appState });

  res.json({ success: true, withdrawal, data: appState });
});

// POST Update Withdrawal status (e.g. Billed)
app.patch('/api/withdrawals/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const item = appState.withdrawals.find(w => w.id === id);
  if (item) {
    item.status = status;
    saveState();
    broadcastUpdate('WITHDRAWAL_STATUS_UPDATED', appState.withdrawals);
    return res.json({ success: true, data: appState.withdrawals });
  }
  res.status(404).json({ success: false, error: 'Retiro no encontrado' });
});

// POST Add or update Cheque
app.post('/api/cheques', (req, res) => {
  const cheque: Cheque = req.body;
  const index = appState.cheques.findIndex(c => c.id === cheque.id);
  if (index >= 0) {
    appState.cheques[index] = cheque;
  } else {
    appState.cheques.unshift(cheque);
  }
  saveState();
  broadcastUpdate('CHEQUES_UPDATED', appState.cheques);
  res.json({ success: true, data: appState.cheques });
});

// POST Reset Demo State
app.post('/api/reset-demo', (req, res) => {
  appState = JSON.parse(JSON.stringify(initialAppData));
  saveState();
  broadcastUpdate('FULL_SYNC', appState);
  res.json({ success: true, data: appState });
});

// --- VITE MIDDLEWARE SETUP ---
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] GestiónComercio Pro backend listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
