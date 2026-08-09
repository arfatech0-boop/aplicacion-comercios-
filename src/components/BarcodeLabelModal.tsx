import React, { useState } from 'react';
import { X, Printer, Barcode, Check, Copy, RefreshCw, Layers, Tag } from 'lucide-react';
import { Product, StoreInfo } from '../types';
import { BarcodeRenderer } from './BarcodeRenderer';
import jsPDF from 'jspdf';

interface BarcodeLabelModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  selectedProduct?: Product | null;
  storeInfo: StoreInfo;
}

export const BarcodeLabelModal: React.FC<BarcodeLabelModalProps> = ({
  isOpen,
  onClose,
  products,
  selectedProduct,
  storeInfo
}) => {
  if (!isOpen) return null;

  const [activeProductId, setActiveProductId] = useState<string>(
    selectedProduct ? selectedProduct.id : (products[0]?.id || '')
  );
  const [copies, setCopies] = useState<number>(12);
  const [showPrice, setShowPrice] = useState<boolean>(true);
  const [showStoreName, setShowStoreName] = useState<boolean>(true);
  const [labelSize, setLabelSize] = useState<'thermal' | 'a4_3col' | 'a4_2col'>('a4_3col');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const currentProduct = products.find(p => p.id === activeProductId) || products[0];

  if (!currentProduct) return null;

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handlePrintWindow = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const labelsHtml = Array.from({ length: copies }).map((_, i) => `
      <div class="label-card">
        ${showStoreName ? `<div class="store-name">${storeInfo.name}</div>` : ''}
        <div class="product-name">${currentProduct.name}</div>
        ${(currentProduct.size || currentProduct.color) ? `
          <div class="variant-info">
            ${currentProduct.size ? `<span>Talle: <strong>${currentProduct.size}</strong></span>` : ''}
            ${currentProduct.color ? `<span>Color: <strong>${currentProduct.color}</strong></span>` : ''}
          </div>
        ` : ''}
        <div class="barcode-container">
          <svg id="barcode-${i}"></svg>
        </div>
        ${showPrice ? `<div class="price">$${currentProduct.salePrice.toLocaleString('es-AR')}</div>` : ''}
      </div>
    `).join('');

    const gridCss = labelSize === 'thermal'
      ? `
        @page { size: 50mm 30mm; margin: 0; }
        body { margin: 0; padding: 2mm; width: 50mm; font-family: sans-serif; text-align: center; }
        .label-card { width: 46mm; height: 26mm; padding: 2px; box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between; align-items: center; border: 1px dashed #ccc; page-break-after: always; }
        .store-name { font-size: 8px; font-weight: bold; text-transform: uppercase; color: #444; }
        .product-name { font-size: 9px; font-weight: bold; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; max-width: 100%; }
        .variant-info { font-size: 8px; color: #222; margin: 1px 0; }
        .price { font-size: 11px; font-weight: 900; color: #000; }
      `
      : labelSize === 'a4_3col'
      ? `
        @page { size: A4; margin: 10mm; }
        body { font-family: sans-serif; margin: 0; padding: 0; }
        .grid-container { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6mm; padding: 5mm; }
        .label-card { border: 1px solid #ddd; border-radius: 6px; padding: 8px; text-align: center; display: flex; flex-direction: column; justify-content: space-between; align-items: center; background: #fff; height: 34mm; box-sizing: border-box; }
        .store-name { font-size: 9px; font-weight: bold; text-transform: uppercase; color: #555; }
        .product-name { font-size: 11px; font-weight: bold; margin: 2px 0; color: #111; max-height: 24px; overflow: hidden; }
        .variant-info { font-size: 9px; color: #333; margin: 1px 0; }
        .price { font-size: 13px; font-weight: 900; color: #0d9488; }
      `
      : `
        @page { size: A4; margin: 10mm; }
        body { font-family: sans-serif; margin: 0; padding: 0; }
        .grid-container { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8mm; padding: 5mm; }
        .label-card { border: 1px solid #ccc; border-radius: 8px; padding: 10px; text-align: center; display: flex; flex-direction: column; justify-content: space-between; align-items: center; background: #fff; height: 42mm; box-sizing: border-box; }
        .store-name { font-size: 10px; font-weight: bold; text-transform: uppercase; color: #444; }
        .product-name { font-size: 12px; font-weight: bold; margin: 2px 0; color: #000; }
        .variant-info { font-size: 10px; color: #333; margin: 2px 0; }
        .price { font-size: 15px; font-weight: 900; color: #15803d; }
      `;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Etiquetas - ${currentProduct.name}</title>
          <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
          <style>
            ${gridCss}
          </style>
        </head>
        <body>
          <div class="grid-container">
            ${labelsHtml}
          </div>
          <script>
            window.onload = function() {
              for (let i = 0; i < ${copies}; i++) {
                try {
                  JsBarcode("#barcode-" + i, "${currentProduct.code}", {
                    format: "CODE128",
                    width: ${labelSize === 'thermal' ? 1.2 : 1.5},
                    height: ${labelSize === 'thermal' ? 25 : 35},
                    displayValue: true,
                    fontSize: 10,
                    margin: 2
                  });
                } catch(e) {}
              }
              setTimeout(function() {
                window.print();
              }, 500);
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-600 rounded-lg">
              <Barcode className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Impresor de Etiquetas con Código de Barras</h2>
              <p className="text-xs text-slate-300">Genere e imprima etiquetas adhesivas para góndola o productos</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Controls Column */}
          <div className="md:col-span-5 space-y-4 text-xs text-slate-700">
            {/* Product Selector */}
            <div>
              <label className="font-semibold block mb-1 text-slate-800">Producto Seleccionado</label>
              <select
                value={activeProductId}
                onChange={e => setActiveProductId(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg bg-slate-50 font-medium text-xs focus:ring-2 focus:ring-indigo-500"
              >
                {products.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.code}) - ${p.salePrice.toLocaleString('es-AR')}
                  </option>
                ))}
              </select>
            </div>

            {/* Code Display & Quick Action */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between text-slate-500 text-[11px] mb-1">
                <span>Código de Barras Actual</span>
                <button
                  onClick={() => handleCopyCode(currentProduct.code)}
                  className="text-indigo-600 hover:underline flex items-center space-x-1 font-semibold"
                >
                  {copiedCode === currentProduct.code ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span className="text-emerald-600">¡Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copiar</span>
                    </>
                  )}
                </button>
              </div>
              <div className="font-mono font-bold text-sm text-slate-900 bg-white px-3 py-1.5 rounded border border-slate-300 text-center tracking-wider">
                {currentProduct.code}
              </div>
            </div>

            {/* Layout Size Selector */}
            <div>
              <label className="font-semibold block mb-1 text-slate-800">Formato / Impresora</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setLabelSize('a4_3col')}
                  className={`p-2 rounded-lg border text-center transition-all ${
                    labelSize === 'a4_3col'
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-bold'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Hoja A4 (3 col)
                </button>
                <button
                  type="button"
                  onClick={() => setLabelSize('a4_2col')}
                  className={`p-2 rounded-lg border text-center transition-all ${
                    labelSize === 'a4_2col'
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-bold'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Hoja A4 (2 col)
                </button>
                <button
                  type="button"
                  onClick={() => setLabelSize('thermal')}
                  className={`p-2 rounded-lg border text-center transition-all ${
                    labelSize === 'thermal'
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-bold'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Térmica 50x30
                </button>
              </div>
            </div>

            {/* Number of Copies */}
            <div>
              <label className="font-semibold block mb-1 text-slate-800">Cantidad de Etiquetas a Imprimir</label>
              <input
                type="number"
                min="1"
                max="100"
                value={copies}
                onChange={e => setCopies(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-3 py-2 border rounded-lg bg-slate-50 text-xs font-semibold focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Print Options */}
            <div className="space-y-2 pt-2 border-t border-slate-200">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showPrice}
                  onChange={e => setShowPrice(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span className="font-medium text-slate-700">Mostrar Precio de Venta (${currentProduct.salePrice.toLocaleString('es-AR')})</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showStoreName}
                  onChange={e => setShowStoreName(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span className="font-medium text-slate-700">Mostrar Nombre de Comercio ({storeInfo.name})</span>
              </label>
            </div>
          </div>

          {/* Preview Column */}
          <div className="md:col-span-7 bg-slate-100 p-4 rounded-xl border border-slate-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center space-x-1">
                  <Tag className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Vista Previa de la Etiqueta</span>
                </span>
                <span className="text-[10px] bg-slate-200 text-slate-700 font-mono px-2 py-0.5 rounded-full">
                  {copies} etiquetas
                </span>
              </div>

              {/* Individual Sticker Preview Box */}
              <div className="flex justify-center my-4">
                <div className="bg-white border-2 border-dashed border-indigo-300 rounded-xl p-4 shadow-sm w-64 text-center flex flex-col items-center justify-between min-h-[140px] space-y-2">
                  {showStoreName && (
                    <span className="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider">
                      {storeInfo.name}
                    </span>
                  )}
                  <span className="text-xs font-bold text-slate-900 leading-tight line-clamp-2">
                    {currentProduct.name}
                  </span>

                  {(currentProduct.size || currentProduct.color) && (
                    <div className="flex items-center justify-center space-x-1 text-[10px] font-bold text-indigo-800 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                      {currentProduct.size && <span>Talle: {currentProduct.size}</span>}
                      {currentProduct.size && currentProduct.color && <span>•</span>}
                      {currentProduct.color && <span>Color: {currentProduct.color}</span>}
                    </div>
                  )}

                  <div className="w-full flex justify-center py-1">
                    <BarcodeRenderer
                      value={currentProduct.code}
                      width={1.4}
                      height={36}
                      fontSize={11}
                      margin={2}
                    />
                  </div>

                  {showPrice && (
                    <span className="text-lg font-black text-emerald-700">
                      ${currentProduct.salePrice.toLocaleString('es-AR')}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handlePrintWindow}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center space-x-2 transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir {copies} Etiquetas</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
