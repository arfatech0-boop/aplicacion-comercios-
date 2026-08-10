import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  CreditCard, 
  Printer, 
  User, 
  CheckCircle,
  FileText,
  DollarSign,
  ArrowUpDown,
  CornerDownLeft,
  Keyboard
} from 'lucide-react';
import { AppState, Product, Customer, PaymentMethod, SaleItem, Sale, InvoiceType, TaxCondition } from '../types';
import { DataService } from '../services/dataService';
import { generateSaleInvoicePDF, generateThermalTicketPDF } from '../utils/pdfGenerator';

interface POSViewProps {
  appState: AppState;
  onOpenCardRates?: () => void;
}

export const POSView: React.FC<POSViewProps> = ({ appState, onOpenCardRates }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [amountPaidCash, setAmountPaidCash] = useState<number | ''>('');
  const [saleNotes, setSaleNotes] = useState('');
  const [lastCompletedSale, setLastCompletedSale] = useState<Sale | null>(null);

  // Mixed Payment Breakdown State
  const [mixedCash, setMixedCash] = useState<number | ''>('');
  const [mixedCard, setMixedCard] = useState<number | ''>('');
  const [mixedTransfer, setMixedTransfer] = useState<number | ''>('');
  const [mixedCurrentAccount, setMixedCurrentAccount] = useState<number | ''>('');

  // Card & Bank Surcharge State
  const [cardSurchargePercent, setCardSurchargePercent] = useState<number>(
    appState.storeInfo.cardSurchargePercent || 10
  );
  const [selectedBankName, setSelectedBankName] = useState<string>('Visa / Mastercard (10%)');

  // AFIP Invoice Type & Custom CUIT
  const [selectedInvoiceType, setSelectedInvoiceType] = useState<InvoiceType>(
    appState.storeInfo.defaultCounterInvoiceType || 'FACTURA_B'
  );
  const [isManualInvoiceType, setIsManualInvoiceType] = useState<boolean>(false);
  const [customCuitDni, setCustomCuitDni] = useState<string>('');

  // Auto-suggest document type when changing payment mode or customer, unless manually changed by user
  useEffect(() => {
    if (isManualInvoiceType) return; // Respect cashier's manual choice

    if (paymentMethod === 'current_account') {
      setSelectedInvoiceType(appState.storeInfo.defaultCurrentAccountInvoiceType || 'REMITO');
    } else if (selectedCustomer && selectedCustomer.dniCuit && selectedCustomer.dniCuit.length >= 10) {
      setSelectedInvoiceType(appState.storeInfo.defaultRespInscriptoInvoiceType || 'FACTURA_A');
    } else {
      setSelectedInvoiceType(appState.storeInfo.defaultCounterInvoiceType || 'FACTURA_B');
    }
  }, [paymentMethod, selectedCustomer, isManualInvoiceType, appState.storeInfo.defaultCounterInvoiceType, appState.storeInfo.defaultCurrentAccountInvoiceType, appState.storeInfo.defaultRespInscriptoInvoiceType]);

  // Keyboard navigation states
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [recentlyAddedId, setRecentlyAddedId] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const productRefs = useRef<(HTMLDivElement | null)[]>([]);

  const categories = Array.from(
    new Set(appState.products.map(p => p.category).filter(Boolean))
  );

  // Filter products
  const filteredProducts = appState.products.filter(p => {
    const matchesCategory = selectedCategory === 'ALL' || p.category === selectedCategory;
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      p.name.toLowerCase().includes(query) || 
      p.code.toLowerCase().includes(query) ||
      p.category.toLowerCase().includes(query) ||
      (p.size && p.size.toLowerCase().includes(query)) ||
      (p.color && p.color.toLowerCase().includes(query)) ||
      (p.brand && p.brand.toLowerCase().includes(query));
    return matchesCategory && matchesSearch;
  });

  // Focus search input on mount
  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  // Reset keyboard selection whenever search query or category changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [searchQuery, selectedCategory]);

  // Scroll active product into view
  useEffect(() => {
    if (filteredProducts.length > 0 && selectedIndex >= 0 && selectedIndex < filteredProducts.length) {
      productRefs.current[selectedIndex]?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      });
    }
  }, [selectedIndex, filteredProducts.length]);

  const addToCart = (product: Product) => {
    setCart(prevCart => {
      const existing = prevCart.find(item => item.productId === product.id);
      if (existing) {
        return prevCart.map(item =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * item.unitPrice }
            : item
        );
      } else {
        return [
          ...prevCart,
          {
            productId: product.id,
            code: product.code,
            productName: product.name,
            quantity: 1,
            unitPrice: product.salePrice,
            costPrice: product.costPrice,
            subtotal: product.salePrice
          }
        ];
      }
    });
  };

  const handleSelectProduct = (product: Product, index: number) => {
    setSelectedIndex(index);
    if (product.stock > 0) {
      addToCart(product);
      setRecentlyAddedId(product.id);
      setTimeout(() => setRecentlyAddedId(null), 800);
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const trimmedQuery = searchQuery.trim().toLowerCase();

      // First check for EXACT barcode / code match in all products
      const exactMatch = appState.products.find(
        p => p.code.toLowerCase() === trimmedQuery
      );

      if (exactMatch) {
        if (exactMatch.stock > 0) {
          addToCart(exactMatch);
          setRecentlyAddedId(exactMatch.id);
          setTimeout(() => setRecentlyAddedId(null), 800);
          setSearchQuery(''); // Clear search input for fast barcode scanning stream
        } else {
          alert(`El producto "${exactMatch.name}" no tiene stock disponible.`);
        }
        return;
      }

      // Otherwise add selected product from filtered list
      if (filteredProducts.length > 0) {
        const targetProduct = filteredProducts[selectedIndex];
        if (targetProduct && targetProduct.stock > 0) {
          addToCart(targetProduct);
          setRecentlyAddedId(targetProduct.id);
          setTimeout(() => setRecentlyAddedId(null), 800);
          setSearchQuery(''); // Clear search input after selection
        }
      }
      return;
    }

    if (filteredProducts.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, filteredProducts.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Escape') {
      setSearchQuery('');
    }
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev =>
      prev
        .map(item => {
          if (item.productId === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0
              ? { ...item, quantity: newQty, subtotal: newQty * item.unitPrice }
              : null;
          }
          return item;
        })
        .filter(Boolean) as SaleItem[]
    );
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.productId !== productId));
  };

  const cartSubtotal = cart.reduce((acc, item) => acc + item.subtotal, 0);
  const cardSurchargeAmount = paymentMethod === 'card'
    ? Math.round((cartSubtotal * (cardSurchargePercent || 0)) / 100)
    : 0;

  const totalAmount = Math.max(0, cartSubtotal - discountAmount + cardSurchargeAmount);

  const changeDue = typeof amountPaidCash === 'number' && amountPaidCash > totalAmount
    ? amountPaidCash - totalAmount
    : 0;

  const handleCompleteSale = async () => {
    if (cart.length === 0) return;

    let paymentsBreakdown: { method: PaymentMethod; amount: number }[] | undefined = undefined;

    if (paymentMethod === 'mixed') {
      const cashAmt = Number(mixedCash) || 0;
      const cardAmt = Number(mixedCard) || 0;
      const transferAmt = Number(mixedTransfer) || 0;
      const ccAmt = Number(mixedCurrentAccount) || 0;
      const totalParts = cashAmt + cardAmt + transferAmt + ccAmt;

      if (Math.abs(totalParts - totalAmount) > 0.01) {
        alert(`¡Atención! La suma de las partes ($${totalParts.toLocaleString('es-AR')}) no coincide con el total a cobrar ($${totalAmount.toLocaleString('es-AR')}). Revisa los montos asignados.`);
        return;
      }

      if (ccAmt > 0 && !selectedCustomer) {
        alert('Para incluir una porción a Cuenta Corriente debe seleccionar un cliente registrado.');
        return;
      }

      paymentsBreakdown = [
        { method: 'cash' as PaymentMethod, amount: cashAmt },
        { method: 'card' as PaymentMethod, amount: cardAmt },
        { method: 'transfer' as PaymentMethod, amount: transferAmt },
        { method: 'current_account' as PaymentMethod, amount: ccAmt }
      ].filter(p => p.amount > 0);
    }

    if (paymentMethod === 'current_account' && !selectedCustomer) {
      alert('Para vender a Cuenta Corriente debe seleccionar un cliente registrado.');
      return;
    }

    if (selectedInvoiceType === 'FACTURA_A') {
      const cuitToUse = selectedCustomer?.dniCuit || customCuitDni;
      if (!cuitToUse || cuitToUse.trim().length < 8) {
        alert('Para emitir Factura A se requiere ingresar el CUIT del cliente (Responsable Inscripto). Por favor complete el campo CUIT / DNI.');
        return;
      }
    }

    if ((paymentMethod === 'current_account' || (paymentsBreakdown && paymentsBreakdown.some(p => p.method === 'current_account'))) && selectedCustomer) {
      const ccPortion = paymentsBreakdown
        ? (paymentsBreakdown.find(p => p.method === 'current_account')?.amount || 0)
        : totalAmount;
      const prospectiveBalance = selectedCustomer.currentBalance + ccPortion;
      if (prospectiveBalance > selectedCustomer.creditLimit) {
        const confirmExceed = window.confirm(
          `¡Atención! La compra supera el límite de crédito del cliente ($${selectedCustomer.creditLimit.toLocaleString('es-AR')}). Saldo resultante: $${prospectiveBalance.toLocaleString('es-AR')}. ¿Desea autorizar la venta de todas formas?`
        );
        if (!confirmExceed) return;
      }
    }

    const nextInvoiceNum = `FC-${appState.storeInfo.invoicePrefix}-${(appState.sales.length + 1052).toString().padStart(8, '0')}`;
    const generatedCae = `743${Math.floor(10000000000 + Math.random() * 90000000000)}`;
    const caeDueDate = new Date(Date.now() + 10 * 86400000).toLocaleDateString('es-AR');

    const cuitOrDni = selectedCustomer?.dniCuit || customCuitDni || '20-00000000-0';
    const taxCond: TaxCondition = selectedInvoiceType === 'FACTURA_A' ? 'Responsable Inscripto' : 'Consumidor Final / General';

    const cardSurchargeVal = (paymentMethod === 'card' || (paymentsBreakdown && paymentsBreakdown.some(p => p.method === 'card'))) ? cardSurchargeAmount : 0;

    const newSale: Sale = {
      id: `sale-${Date.now()}`,
      invoiceNumber: nextInvoiceNum,
      invoiceType: selectedInvoiceType,
      cae: generatedCae,
      caeDueDate,
      customerCuitDni: cuitOrDni,
      customerTaxCondition: taxCond,
      date: new Date().toISOString(),
      customerId: selectedCustomer?.id,
      customerName: selectedCustomer?.name || (selectedInvoiceType === 'FACTURA_A' ? 'Cliente Resp. Inscripto' : 'Consumidor Final'),
      items: [...cart],
      subtotal: cartSubtotal,
      discount: discountAmount,
      surcharge: cardSurchargeVal,
      cardBankName: paymentMethod === 'card' ? selectedBankName : undefined,
      totalAmount,
      paymentMethod,
      paymentsBreakdown,
      notes: saleNotes,
      status: 'completed'
    };

    await DataService.processSale(newSale);
    setLastCompletedSale(newSale);

    // Reset Form
    setCart([]);
    setDiscountAmount(0);
    setAmountPaidCash('');
    setMixedCash('');
    setMixedCard('');
    setMixedTransfer('');
    setMixedCurrentAccount('');
    setSaleNotes('');
    setCustomCuitDni('');
    setIsManualInvoiceType(false);
    setCardSurchargePercent(appState.storeInfo.cardSurchargePercent || 10);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Punto de Venta (POS)</h1>
          <p className="text-xs text-slate-500">Seleccione productos, cliente y registre comprobantes de venta al instante.</p>
        </div>
      </div>

      {/* Main POS Layout (Left: Product Catalog & Search | Right: Active Cart & Checkout) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (Catalog): 7 cols */}
        <div className="lg:col-span-7 space-y-4">
          {/* Search & Category Filters */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Buscar por código de barras, SKU o nombre..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                className="w-full pl-9 pr-24 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              />
              <div className="absolute right-2 top-2 flex items-center space-x-1 text-[10px] text-slate-400 font-mono pointer-events-none">
                <span className="bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-bold">↑↓ Navegar</span>
                <span className="bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded font-bold">↵ ENTER</span>
              </div>
            </div>

            {/* Keyboard Shortcuts Status Bar */}
            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5 px-0.5">
              <div className="flex items-center space-x-2">
                <span className="flex items-center space-x-1 text-slate-600 font-mono font-medium text-[11px]">
                  <ArrowUpDown className="w-3.5 h-3.5 text-indigo-600 mr-0.5" />
                  <span>Usa flechas para navegar productos</span>
                </span>
              </div>
              {filteredProducts.length > 0 && (
                <span className="font-medium text-slate-500">
                  Seleccionado: <strong className="text-indigo-600 font-mono">{selectedIndex + 1}</strong> de {filteredProducts.length}
                </span>
              )}
            </div>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[560px] overflow-y-auto pr-1 pt-2 pb-2">
            {filteredProducts.map((product, idx) => {
              const isSelected = idx === selectedIndex;
              const isLow = product.stock <= product.minStock;
              const isOut = product.stock <= 0;
              const isJustAdded = recentlyAddedId === product.id;

              return (
                <div
                  key={product.id}
                  ref={el => (productRefs.current[idx] = el)}
                  onClick={() => !isOut && handleSelectProduct(product, idx)}
                  className={`relative bg-white p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between hover:shadow-md ${
                    isOut
                      ? 'opacity-60 border-slate-200 cursor-not-allowed'
                      : isSelected
                      ? 'ring-2 ring-indigo-600 border-indigo-600 bg-indigo-50/20 shadow-md scale-[1.01]'
                      : 'border-slate-200 hover:border-indigo-300'
                  }`}
                >
                  {isJustAdded && (
                    <div className="absolute inset-0 bg-emerald-500/20 border-2 border-emerald-500 rounded-xl flex items-center justify-center backdrop-blur-3xs z-20 animate-fade-in">
                      <span className="bg-emerald-600 text-white font-bold text-xs px-3 py-1 rounded-full shadow-lg flex items-center space-x-1.5">
                        <CheckCircle className="w-4 h-4" />
                        <span>¡Agregado al Carrito!</span>
                      </span>
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center space-x-1.5">
                        <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">{product.code}</span>
                        {isSelected && !isOut && (
                          <span className="bg-indigo-600 text-white text-[9px] font-mono font-bold px-2 py-0.5 rounded-full shadow-xs flex items-center space-x-1 animate-pulse">
                            <CornerDownLeft className="w-2.5 h-2.5" />
                            <span>[ENTER]</span>
                          </span>
                        )}
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        isOut ? 'bg-red-100 text-red-700' : isLow ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        Stock: {product.stock} {product.unit}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1.5 mt-1 flex-wrap">
                      <h4 className="font-bold text-slate-800 text-sm">{product.name}</h4>
                      {product.brand && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-slate-800 text-white">
                          {product.brand}
                        </span>
                      )}
                    </div>
                    
                    {(product.size || product.color) && (
                      <div className="flex items-center space-x-1 mt-1 flex-wrap gap-y-1">
                        {product.size && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                            Talle: {product.size}
                          </span>
                        )}
                        {product.color && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                            Color: {product.color}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-base font-extrabold text-indigo-700">${product.salePrice.toLocaleString('es-AR')}</span>
                    <button
                      disabled={isOut}
                      className={`px-2.5 py-1 rounded-lg font-semibold text-xs transition-colors flex items-center space-x-1 ${
                        isSelected
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white'
                      }`}
                    >
                      <span>+ Agregar</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column (Cart & Checkout): 5 cols */}
        <div className="lg:col-span-5 bg-white rounded-xl shadow-md border border-slate-200 p-5 flex flex-col justify-between">
          <div>
            {/* Header Cart */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <ShoppingCart className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-base">Carrito de Venta</h3>
              </div>
              <span className="text-xs text-slate-500 font-medium">{cart.length} productos</span>
            </div>

            {/* Customer Selector */}
            <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
              <label className="text-xs font-semibold text-slate-700 block flex items-center space-x-1">
                <User className="w-3.5 h-3.5 text-slate-500" />
                <span>Cliente Asignado</span>
              </label>
              <select
                value={selectedCustomer?.id || 'FINAL'}
                onChange={e => {
                  const val = e.target.value;
                  if (val === 'FINAL') setSelectedCustomer(null);
                  else {
                    const found = appState.customers.find(c => c.id === val);
                    setSelectedCustomer(found || null);
                  }
                }}
                className="w-full bg-white border border-slate-200 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="FINAL">Consumidor Final (Venta Contado)</option>
                {appState.customers.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} (Saldo: ${c.currentBalance.toLocaleString('es-AR')})
                  </option>
                ))}
              </select>
            </div>

            {/* Cart Items List */}
            <div className="mt-4 space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {cart.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <ShoppingCart className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="text-xs">El carrito está vacío. Haga clic en un producto para agregarlo.</p>
                </div>
              ) : (
                cart.map(item => {
                  const linkedProd = appState.products.find(p => p.id === item.productId);
                  return (
                    <div key={item.productId} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg text-xs border border-slate-100">
                      <div className="flex-1 pr-2">
                        <span className="font-semibold text-slate-800 block truncate">{item.productName}</span>
                        {(linkedProd?.size || linkedProd?.color) && (
                          <span className="text-[10px] text-indigo-700 font-bold block">
                            {linkedProd.size ? `Talle: ${linkedProd.size}` : ''} {linkedProd.color ? `| Color: ${linkedProd.color}` : ''}
                          </span>
                        )}
                        <span className="text-slate-500 text-[11px]">${item.unitPrice.toLocaleString('es-AR')} c/u</span>
                      </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => updateQuantity(item.productId, -1)}
                        className="p-1 rounded bg-slate-200 text-slate-700 hover:bg-slate-300"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="font-bold w-6 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, 1)}
                        className="p-1 rounded bg-slate-200 text-slate-700 hover:bg-slate-300"
                      >
                        <Plus className="w-3 h-3" />
                      </button>

                      <span className="font-bold text-slate-900 min-w-[60px] text-right">
                        ${item.subtotal.toLocaleString('es-AR')}
                      </span>

                      <button
                        onClick={() => removeFromCart(item.productId)}
                        className="text-slate-400 hover:text-red-600 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
              )}
            </div>
          </div>

          {/* Checkout Controls */}
          <div className="mt-6 pt-4 border-t border-slate-200 space-y-3">
            {/* Tipo de Comprobante / Factura AFIP */}
            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1">Tipo de Comprobante / Facturación</label>
              <div className="grid grid-cols-5 gap-1 text-[11px]">
                {[
                  { id: 'FACTURA_B', label: 'Factura B', sub: 'Cons. Final' },
                  { id: 'FACTURA_A', label: 'Factura A', sub: 'Resp. Insc.' },
                  { id: 'FACTURA_C', label: 'Factura C', sub: 'Monotrib.' },
                  { id: 'TICKET_X', label: 'Ticket X', sub: 'Interno' },
                  { id: 'REMITO', label: 'Remito', sub: 'Entrega' },
                ].map(item => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setSelectedInvoiceType(item.id as InvoiceType);
                      setIsManualInvoiceType(true);
                    }}
                    className={`py-1.5 px-1 rounded border text-center font-medium transition-all ${
                      selectedInvoiceType === item.id
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs font-bold'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div className="leading-tight">{item.label}</div>
                    <div className={`text-[9px] ${selectedInvoiceType === item.id ? 'text-indigo-300' : 'text-slate-400'}`}>{item.sub}</div>
                  </button>
                ))}
              </div>

              {/* CUIT / DNI Input for Factura A or manual customer identification */}
              {(selectedInvoiceType === 'FACTURA_A' || selectedInvoiceType === 'FACTURA_B') && (
                <div className="mt-2">
                  <label className="text-[10px] font-bold text-slate-600 block">
                    {selectedInvoiceType === 'FACTURA_A' ? 'CUIT Cliente (Requerido para Factura A)' : 'DNI / CUIT Cliente (Opcional)'}
                  </label>
                  <input
                    type="text"
                    value={selectedCustomer ? selectedCustomer.dniCuit : customCuitDni}
                    onChange={e => setCustomCuitDni(e.target.value)}
                    disabled={!!selectedCustomer}
                    placeholder="Ej: 30-71234567-8"
                    className="w-full mt-0.5 px-2.5 py-1 border rounded bg-slate-50 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              )}
            </div>

            {/* Payment Method Selector */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700 block">Forma de Pago</label>
                {paymentMethod === 'cash' && (appState.storeInfo.cashDiscountPercent || 0) > 0 && (
                  <button
                    onClick={() => {
                      const disc = Math.round((cartSubtotal * (appState.storeInfo.cashDiscountPercent || 0)) / 100);
                      setDiscountAmount(disc);
                    }}
                    className="text-[10px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-1.5 py-0.5 rounded transition-colors"
                  >
                    Aplicar Dcto. Efectivo (-{appState.storeInfo.cashDiscountPercent}%)
                  </button>
                )}
              </div>
              <div className="grid grid-cols-3 gap-1.5 text-xs">
                {[
                  { id: 'cash', label: 'Efectivo' },
                  { id: 'card', label: 'Tarjeta' },
                  { id: 'transfer', label: 'Transferencia' },
                  { id: 'cheque', label: 'Cheque' },
                  { id: 'current_account', label: 'Cuenta Cte.' },
                  { id: 'mixed', label: '🔀 Cobro Mixto' }
                ].map(m => (
                  <button
                    key={m.id}
                    onClick={() => setPaymentMethod(m.id as PaymentMethod)}
                    className={`py-1.5 px-2 rounded border font-medium transition-colors text-[11px] ${
                      paymentMethod === m.id
                        ? 'bg-indigo-600 text-white border-indigo-600 font-bold'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Mixed Payment Breakdown Panel */}
            {paymentMethod === 'mixed' && (
              <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3 space-y-2.5 text-xs">
                <div className="flex items-center justify-between font-bold text-amber-950">
                  <span>Desglose de Cobro Combinado / Mixto</span>
                  <span className="text-[10px] text-amber-800 font-mono">Total a cubrir: ${totalAmount.toLocaleString('es-AR')}</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-semibold text-slate-700 block">Efectivo ($)</label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      placeholder="0"
                      value={mixedCash}
                      onChange={e => setMixedCash(e.target.value ? Number(e.target.value) : '')}
                      className="w-full px-2 py-1 border rounded bg-white font-semibold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-slate-700 block">Tarjeta / Mercado Pago ($)</label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      placeholder="0"
                      value={mixedCard}
                      onChange={e => setMixedCard(e.target.value ? Number(e.target.value) : '')}
                      className="w-full px-2 py-1 border rounded bg-white font-semibold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-slate-700 block">Transferencia ($)</label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      placeholder="0"
                      value={mixedTransfer}
                      onChange={e => setMixedTransfer(e.target.value ? Number(e.target.value) : '')}
                      className="w-full px-2 py-1 border rounded bg-white font-semibold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-slate-700 block">A Cuenta Corriente ($)</label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      placeholder="0"
                      value={mixedCurrentAccount}
                      onChange={e => setMixedCurrentAccount(e.target.value ? Number(e.target.value) : '')}
                      className="w-full px-2 py-1 border rounded bg-white font-bold text-red-600"
                    />
                  </div>
                </div>

                {(() => {
                  const currentSum = (Number(mixedCash) || 0) + (Number(mixedCard) || 0) + (Number(mixedTransfer) || 0) + (Number(mixedCurrentAccount) || 0);
                  const diff = totalAmount - currentSum;
                  return (
                    <div className="flex justify-between items-center pt-2 border-t border-amber-200 text-[11px]">
                      <span className="font-bold text-slate-800">
                        Suma ingresada: <strong className="text-amber-900">${currentSum.toLocaleString('es-AR')}</strong>
                      </span>
                      {Math.abs(diff) < 0.01 ? (
                        <span className="text-emerald-700 font-extrabold bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                          ✓ Monto Cubierto Totalmente
                        </span>
                      ) : diff > 0 ? (
                        <span className="text-amber-800 font-bold bg-amber-100 px-2 py-0.5 rounded">
                          Falta asignar: ${diff.toLocaleString('es-AR')}
                        </span>
                      ) : (
                        <span className="text-red-700 font-bold bg-red-100 px-2 py-0.5 rounded">
                          Exceso de asignación: ${Math.abs(diff).toLocaleString('es-AR')}
                        </span>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Configuración de Recargo por Tarjeta y Banco */}
            {paymentMethod === 'card' && (
              <div className="bg-indigo-50/80 border border-indigo-200 rounded-xl p-3 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5 font-extrabold text-xs text-indigo-950">
                    <CreditCard className="w-4 h-4 text-indigo-600" />
                    <span>Pago con Tarjeta - Recargo por Banco / Cuotas</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    {onOpenCardRates && (
                      <button
                        type="button"
                        onClick={onOpenCardRates}
                        className="text-[10px] font-bold text-indigo-700 bg-white hover:bg-indigo-100 border border-indigo-300 px-2 py-0.5 rounded-md transition-colors shadow-2xs"
                        title="Modificar tasas de interés o agregar cuotas"
                      >
                        ⚙️ Editar Cuotas / Tasas
                      </button>
                    )}
                    <span className="text-[10px] font-mono font-bold bg-indigo-200 text-indigo-900 px-2 py-0.5 rounded-full">
                      +{cardSurchargePercent}% Recargo
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-indigo-900 leading-snug">
                  Seleccione el plan de cuotas/banco del cliente o ingrese un % personalizado:
                </p>

                {/* Quick Presets from Configured Plans */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-[10px]">
                  {(appState.storeInfo.cardInterestPlans?.length
                    ? appState.storeInfo.cardInterestPlans
                    : [
                        { id: 'p1', name: 'Débito / 1 Pago', surchargePercent: 0 },
                        { id: 'p2', name: 'Visa/Master 1 Pago', surchargePercent: 5 },
                        { id: 'p3', name: 'Mercado Pago / QR', surchargePercent: 8 },
                        { id: 'p4', name: '3 Cuotas (Cuota Simple)', surchargePercent: 15 },
                        { id: 'p5', name: '6 Cuotas Financiamiento', surchargePercent: 28 },
                        { id: 'p6', name: '12 Cuotas Larga Duración', surchargePercent: 42 },
                      ]
                  ).map(preset => {
                    const labelText = `${preset.name} (${preset.surchargePercent}%)`;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => {
                          setCardSurchargePercent(preset.surchargePercent);
                          setSelectedBankName(preset.name);
                        }}
                        className={`py-1.5 px-2 rounded-lg border text-left font-bold transition-all ${
                          cardSurchargePercent === preset.surchargePercent && selectedBankName === preset.name
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                            : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <div className="truncate">{preset.name}</div>
                        <div className={`text-[9px] font-mono ${cardSurchargePercent === preset.surchargePercent && selectedBankName === preset.name ? 'text-indigo-100' : 'text-indigo-700'}`}>
                          +{preset.surchargePercent}% recargo
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Custom Surcharge % and Bank Name Input */}
                <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-indigo-100">
                  <div>
                    <label className="text-[10px] font-bold text-slate-700 block">% Recargo Personalizado</label>
                    <div className="relative mt-0.5">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={cardSurchargePercent}
                        onChange={e => {
                          const val = Math.max(0, Number(e.target.value));
                          setCardSurchargePercent(val);
                          setSelectedBankName(`Personalizado (${val}%)`);
                        }}
                        className="w-full px-2.5 py-1 border border-indigo-300 rounded bg-white text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <span className="absolute right-2 top-1 text-slate-400 font-bold text-xs">%</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-700 block">Banco / Entidad Emisora</label>
                    <input
                      type="text"
                      value={selectedBankName}
                      onChange={e => setSelectedBankName(e.target.value)}
                      placeholder="Ej: Galicia, Santander, MP"
                      className="w-full mt-0.5 px-2.5 py-1 border border-indigo-300 rounded bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                {/* Surcharge Live Calculation Breakdown */}
                <div className="bg-white p-2 rounded-lg border border-indigo-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 text-xs">
                  <span className="text-slate-600">
                    Subtotal: <strong className="text-slate-900">${cartSubtotal.toLocaleString('es-AR')}</strong> + Recargo Tarjeta: <strong className="text-amber-800 font-bold">+${cardSurchargeAmount.toLocaleString('es-AR')}</strong>
                  </span>
                  <span className="text-indigo-900 font-black text-xs bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                    Total a Cobrar en Posnet: ${(cartSubtotal + cardSurchargeAmount - discountAmount).toLocaleString('es-AR')}
                  </span>
                </div>
              </div>
            )}

            {/* Discount & Cash Change calculation */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="text-[11px] text-slate-500 block">Descuento ($)</label>
                <input
                  type="number"
                  min="0"
                  value={discountAmount || ''}
                  onChange={e => setDiscountAmount(Number(e.target.value) || 0)}
                  className="w-full px-2 py-1 border rounded bg-slate-50 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="0"
                />
              </div>

              {paymentMethod === 'cash' && (
                <div>
                  <label className="text-[11px] text-slate-500 block">Efectivo Recibido ($)</label>
                  <input
                    type="number"
                    min="0"
                    value={amountPaidCash}
                    onChange={e => setAmountPaidCash(e.target.value ? Number(e.target.value) : '')}
                    className="w-full px-2 py-1 border rounded bg-slate-50 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="Monto entregado"
                  />
                </div>
              )}
            </div>

            {/* Totals Summary */}
            <div className="bg-slate-900 text-white rounded-lg p-3 space-y-1">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Subtotal:</span>
                <span>${cartSubtotal.toLocaleString('es-AR')}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-xs text-emerald-400">
                  <span>Descuento:</span>
                  <span>-${discountAmount.toLocaleString('es-AR')}</span>
                </div>
              )}
              {cardSurchargeAmount > 0 && paymentMethod === 'card' && (
                <div className="flex justify-between text-xs text-amber-300 font-bold">
                  <span>Recargo Tarjeta ({cardSurchargePercent}%):</span>
                  <span>+${cardSurchargeAmount.toLocaleString('es-AR')}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-extrabold text-white pt-1 border-t border-slate-800">
                <span>TOTAL A PAGAR:</span>
                <span>${totalAmount.toLocaleString('es-AR')}</span>
              </div>
              {paymentMethod === 'cash' && changeDue > 0 && (
                <div className="flex justify-between text-xs font-bold text-amber-300 pt-1">
                  <span>VUELTO A ENTREGAR:</span>
                  <span>${changeDue.toLocaleString('es-AR')}</span>
                </div>
              )}
            </div>

            {/* Complete Sale Button */}
            <button
              disabled={cart.length === 0}
              onClick={handleCompleteSale}
              className={`w-full py-3 rounded-lg font-bold text-sm shadow-md flex items-center justify-center space-x-2 transition-all ${
                cart.length > 0
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/30'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <CheckCircle className="w-4 h-4" />
              <span>FINALIZAR VENTA Y EMITIR COMPROBANTE</span>
            </button>
          </div>
        </div>
      </div>

      {/* Completed Sale Ticket Modal / Download */}
      {lastCompletedSale && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8" />
            </div>

            <h3 className="text-xl font-bold text-slate-900">¡Venta Registrada Exitosamente!</h3>
            <div className="inline-flex items-center space-x-2 bg-slate-100 px-3 py-1 rounded-full text-xs text-slate-700 font-semibold border border-slate-200">
              <FileText className="w-3.5 h-3.5 text-indigo-600" />
              <span>{lastCompletedSale.invoiceType?.replace('_', ' ') || 'FACTURA B'} N° {lastCompletedSale.invoiceNumber}</span>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl text-left text-xs space-y-2 border border-slate-200">
              <div className="flex justify-between text-slate-600">
                <span>Cliente:</span>
                <span className="font-semibold text-slate-900">{lastCompletedSale.customerName || 'Consumidor Final'}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>CUIT / DNI:</span>
                <span className="font-mono text-slate-900">{lastCompletedSale.customerCuitDni || '-'}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>CAE Autorizado:</span>
                <span className="font-mono text-emerald-700 font-bold">{lastCompletedSale.cae || '74310293847212'}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Forma de Pago:</span>
                <span className="font-semibold capitalize text-slate-900">
                  {lastCompletedSale.paymentMethod === 'card' ? `Tarjeta (${lastCompletedSale.cardBankName || 'Crédito/Débito'})` : lastCompletedSale.paymentMethod}
                </span>
              </div>
              {lastCompletedSale.surcharge && lastCompletedSale.surcharge > 0 ? (
                <div className="flex justify-between text-amber-700 font-medium">
                  <span>Recargo Aplicado:</span>
                  <span className="font-bold">+${lastCompletedSale.surcharge.toLocaleString('es-AR')}</span>
                </div>
              ) : null}
              <div className="flex justify-between text-slate-600 pt-2 border-t border-slate-200">
                <span className="font-bold text-slate-800">Total Venta:</span>
                <span className="font-extrabold text-indigo-700 text-sm">${lastCompletedSale.totalAmount.toLocaleString('es-AR')}</span>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <button
                onClick={() => generateSaleInvoicePDF(lastCompletedSale, appState.storeInfo)}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-md transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span>Descargar Factura Oficial AFIP (PDF A4)</span>
              </button>

              <button
                onClick={() => generateThermalTicketPDF(lastCompletedSale, appState.storeInfo)}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-xs transition-colors"
              >
                <FileText className="w-4 h-4 text-emerald-400" />
                <span>Imprimir Ticket Térmico de Caja (80mm)</span>
              </button>

              <button
                onClick={() => setLastCompletedSale(null)}
                className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
              >
                Cerrar / Nueva Venta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
