import React, { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';

interface BarcodeRendererProps {
  value: string;
  format?: string;
  width?: number;
  height?: number;
  displayValue?: boolean;
  fontSize?: number;
  margin?: number;
  className?: string;
}

export const BarcodeRenderer: React.FC<BarcodeRendererProps> = ({
  value,
  format = 'CODE128',
  width = 1.6,
  height = 40,
  displayValue = true,
  fontSize = 12,
  margin = 4,
  className = ''
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (svgRef.current && value) {
      try {
        JsBarcode(svgRef.current, value, {
          format: format,
          width: width,
          height: height,
          displayValue: displayValue,
          fontSize: fontSize,
          margin: margin,
          background: '#ffffff',
          lineColor: '#000000'
        });
      } catch {
        // Fallback to CODE128 if requested format (e.g. EAN13) fails validation
        try {
          JsBarcode(svgRef.current, value, {
            format: 'CODE128',
            width: width,
            height: height,
            displayValue: displayValue,
            fontSize: fontSize,
            margin: margin,
            background: '#ffffff',
            lineColor: '#000000'
          });
        } catch (e) {
          console.warn('Barcode render error:', e);
        }
      }
    }
  }, [value, format, width, height, displayValue, fontSize, margin]);

  if (!value) return null;

  return <svg ref={svgRef} className={`inline-block ${className}`} />;
};
