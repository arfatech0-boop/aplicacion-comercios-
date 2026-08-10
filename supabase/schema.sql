-- SQL Migration Schema for GestiónComercio Pro in Supabase PostgreSQL

-- 1. STORE INFO
CREATE TABLE IF NOT EXISTS store_info (
  id TEXT PRIMARY KEY DEFAULT 'default',
  name TEXT NOT NULL,
  cuit TEXT,
  tax_condition TEXT,
  business_type TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  invoice_prefix TEXT DEFAULT '0001',
  currency_symbol TEXT DEFAULT '$',
  default_tax_rate NUMERIC DEFAULT 21,
  cash_discount_percent NUMERIC DEFAULT 5,
  card_surcharge_percent NUMERIC DEFAULT 10,
  receipt_header_message TEXT,
  custom_categories JSONB DEFAULT '[]'::jsonb,
  card_interest_plans JSONB DEFAULT '[]'::jsonb,
  default_counter_invoice_type TEXT,
  default_current_account_invoice_type TEXT,
  default_resp_inscripto_invoice_type TEXT,
  afip_point_of_sale TEXT
);

-- 2. USERS
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'cashier',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ
);

-- 3. SUPPLIERS
CREATE TABLE IF NOT EXISTS suppliers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  cuit TEXT,
  phone TEXT,
  email TEXT,
  contact TEXT,
  notes TEXT
);

-- 4. PRODUCTS
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  supplier_id TEXT,
  cost_price NUMERIC DEFAULT 0,
  sale_price NUMERIC DEFAULT 0,
  stock NUMERIC DEFAULT 0,
  min_stock NUMERIC DEFAULT 5,
  unit TEXT DEFAULT 'un',
  size TEXT,
  color TEXT,
  brand TEXT,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. CUSTOMERS
CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  dni_cuit TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  credit_limit NUMERIC DEFAULT 0,
  current_balance NUMERIC DEFAULT 0,
  notes TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. CUSTOMER TRANSACTIONS
CREATE TABLE IF NOT EXISTS customer_transactions (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  amount NUMERIC DEFAULT 0,
  balance_after NUMERIC DEFAULT 0,
  date TIMESTAMPTZ DEFAULT NOW(),
  description TEXT,
  receipt_number TEXT,
  sale_id TEXT,
  items_summary JSONB,
  payment_method TEXT
);

-- 7. WITHDRAWALS
CREATE TABLE IF NOT EXISTS withdrawals (
  id TEXT PRIMARY KEY,
  withdrawal_number TEXT NOT NULL,
  customer_id TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  date TIMESTAMPTZ DEFAULT NOW(),
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  total_amount NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'pending',
  notes TEXT,
  authorized_by TEXT
);

-- 8. SALES
CREATE TABLE IF NOT EXISTS sales (
  id TEXT PRIMARY KEY,
  invoice_number TEXT,
  invoice_type TEXT,
  cae TEXT,
  cae_due_date TEXT,
  customer_cuit_dni TEXT,
  customer_tax_condition TEXT,
  date TIMESTAMPTZ DEFAULT NOW(),
  customer_id TEXT,
  customer_name TEXT,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  subtotal NUMERIC DEFAULT 0,
  discount NUMERIC DEFAULT 0,
  surcharge NUMERIC DEFAULT 0,
  total_amount NUMERIC DEFAULT 0,
  payment_method TEXT DEFAULT 'cash',
  notes TEXT,
  status TEXT DEFAULT 'completed'
);

-- 9. CHEQUES
CREATE TABLE IF NOT EXISTS cheques (
  id TEXT PRIMARY KEY,
  number TEXT NOT NULL,
  bank TEXT NOT NULL,
  issuer_name TEXT NOT NULL,
  issuer_cuit TEXT,
  customer_id TEXT,
  customer_name TEXT,
  amount NUMERIC DEFAULT 0,
  issue_date TIMESTAMPTZ,
  due_date TIMESTAMPTZ,
  status TEXT DEFAULT 'in_wallet',
  notes TEXT
);

-- 10. CASH REGISTERS
CREATE TABLE IF NOT EXISTS cash_registers (
  id TEXT PRIMARY KEY,
  open_date TIMESTAMPTZ DEFAULT NOW(),
  close_date TIMESTAMPTZ,
  initial_amount NUMERIC DEFAULT 0,
  cash_sales NUMERIC DEFAULT 0,
  account_payments NUMERIC DEFAULT 0,
  cash_expenses NUMERIC DEFAULT 0,
  expected_total NUMERIC DEFAULT 0,
  actual_total NUMERIC,
  difference NUMERIC,
  status TEXT DEFAULT 'open',
  movements JSONB DEFAULT '[]'::jsonb,
  notes TEXT
);

-- 11. STOCK MOVEMENTS
CREATE TABLE IF NOT EXISTS stock_movements (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  type TEXT NOT NULL,
  quantity NUMERIC DEFAULT 0,
  previous_stock NUMERIC DEFAULT 0,
  new_stock NUMERIC DEFAULT 0,
  date TIMESTAMPTZ DEFAULT NOW(),
  reason TEXT
);

-- 12. PRICE INCREASE LOGS
CREATE TABLE IF NOT EXISTS price_increase_logs (
  id TEXT PRIMARY KEY,
  supplier_id TEXT NOT NULL,
  supplier_name TEXT NOT NULL,
  category_filter TEXT,
  percentage NUMERIC DEFAULT 0,
  apply_to_cost BOOLEAN DEFAULT true,
  apply_to_sale BOOLEAN DEFAULT true,
  recalculate_margin BOOLEAN DEFAULT true,
  affected_products_count INTEGER DEFAULT 0,
  date TIMESTAMPTZ DEFAULT NOW()
);

-- DISABLE RLS FOR ALL TABLES FOR DIRECT ACCESS
ALTER TABLE store_info DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers DISABLE ROW LEVEL SECURITY;
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE customer_transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawals DISABLE ROW LEVEL SECURITY;
ALTER TABLE sales DISABLE ROW LEVEL SECURITY;
ALTER TABLE cheques DISABLE ROW LEVEL SECURITY;
ALTER TABLE cash_registers DISABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements DISABLE ROW LEVEL SECURITY;
ALTER TABLE price_increase_logs DISABLE ROW LEVEL SECURITY;
