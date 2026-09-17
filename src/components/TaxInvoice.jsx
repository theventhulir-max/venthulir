'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Printer, Download, X, CheckCircle, FileText, Maximize2, Minimize2 } from 'lucide-react';
import './TaxInvoice.css';

/**
 * Converts a numeric amount to Indian Currency Words
 * Example: 799 -> "Seven Hundred Ninety Nine"
 */
function numberToWords(num) {
  if (num === null || num === undefined || isNaN(num)) return 'Zero';
  num = Math.round(Number(num));
  if (num === 0) return 'Zero';

  const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 
             'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function convertSection(n) {
    if (n === 0) return '';
    if (n < 20) return a[n] + ' ';
    if (n < 100) return b[Math.floor(n / 10)] + ' ' + a[n % 10] + ' ';
    return a[Math.floor(n / 100)] + ' Hundred ' + convertSection(n % 100);
  }

  let words = '';
  const crore = Math.floor(num / 10000000);
  num %= 10000000;
  const lakh = Math.floor(num / 100000);
  num %= 100000;
  const thousand = Math.floor(num / 1000);
  num %= 1000;

  if (crore > 0) words += convertSection(crore).trim() + ' Crore ';
  if (lakh > 0) words += convertSection(lakh).trim() + ' Lakh ';
  if (thousand > 0) words += convertSection(thousand).trim() + ' Thousand ';
  if (num > 0) words += convertSection(num).trim() + ' ';

  return words.trim();
}

/**
 * Returns appropriate HSN Code based on product name/category
 */
function getHsnCode(name = '', category = '') {
  const lower = (name + ' ' + category).toLowerCase();
  if (lower.includes('coconut') || lower.includes('thellingey')) return '1513';
  if (lower.includes('groundnut') || lower.includes('kadala')) return '1508';
  if (lower.includes('gingelly') || lower.includes('sesame') || lower.includes('nallennai')) return '1515';
  if (lower.includes('turmeric') || lower.includes('manjal')) return '0910';
  if (lower.includes('chilli') || lower.includes('milagai')) return '0904';
  if (lower.includes('coriander') || lower.includes('dhaniya')) return '0909';
  if (lower.includes('masala') || lower.includes('sambar') || lower.includes('powder')) return '2103';
  if (lower.includes('honey') || lower.includes('then')) return '0409';
  if (lower.includes('ghee') || lower.includes('nei')) return '0405';
  if (lower.includes('jaggery') || lower.includes('nattuchakkarai')) return '1701';
  return '1513'; // Standard food/agricultural code fallback
}

/**
 * Formats a Date object to DD/MM/YYYY
 */
function formatDate(d) {
  if (!d) d = new Date();
  const dateObj = new Date(d);
  if (isNaN(dateObj.getTime())) return new Date().toLocaleDateString('en-GB');
  const day = String(dateObj.getDate()).padStart(2, '0');
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const year = dateObj.getFullYear();
  return `${day}/${month}/${year}`;
}

export default function TaxInvoice({ order, isOpen, onClose }) {
  const invoiceRef = useRef(null);
  const [viewMode, setViewMode] = useState('scroll'); // 'scroll' (100% swipe) | 'fit' (scale to fit phone)
  const [isMobile, setIsMobile] = useState(false);
  const [scale, setScale] = useState(1);
  const [invoiceHeight, setInvoiceHeight] = useState(0);

  // Lock background scroll when invoice is open
  useEffect(() => {
    if (isOpen) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [isOpen]);

  // Handle responsive scale calculations for mobile view
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (mobile) {
        const availableWidth = window.innerWidth - (window.innerWidth <= 480 ? 16 : 28);
        const calculatedScale = Math.min(1, Math.max(0.38, availableWidth / 780));
        setScale(calculatedScale);
      } else {
        setScale(1);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Update measured invoice height for fit mode scaling
  useEffect(() => {
    if (invoiceRef.current) {
      setInvoiceHeight(invoiceRef.current.offsetHeight);
    }
  }, [isOpen, viewMode, scale]);

  if (!isOpen || !order) return null;

  const orderIdRaw = order.orderId || order._id || 'ORD';
  const invoiceNo = (order.orderId || order._id || 'VEN').toString().slice(-8).toUpperCase();
  const invoiceDate = formatDate(order.createdAt || order.date);
  const challanNo = `CH-${invoiceNo}`;
  const challanDate = invoiceDate;

  const buyerName = order.customerName || order.customer?.name || order.shippingAddress?.fullName || 'Valued Patron';
  const buyerPhone = order.phone || order.customer?.phone || order.shippingAddress?.phone || 'Not Provided';
  
  const addressObj = order.deliveryAddress || order.shippingAddress || order.address || {};
  const buyerAddress = [
    addressObj.address || addressObj.street,
    addressObj.city,
    addressObj.state || 'Tamil Nadu',
    addressObj.zipCode ? `- ${addressObj.zipCode}` : ''
  ].filter(Boolean).join(', ') || 'Address on file';

  const paymentMethod = order.paymentMethod || 'Cash on Delivery';
  const isPaid = paymentMethod.toLowerCase().includes('razorpay') || 
                 paymentMethod.toLowerCase().includes('online') || 
                 paymentMethod.toLowerCase().includes('paid') ||
                 order.paymentStatus === 'Paid';

  const rawItems = order.items || order.orderItems || [];
  
  // Calculate line items with 5% GST (2.5% CGST + 2.5% SGST)
  const gstRate = 0.05;
  const cgstRate = 0.025;
  const sgstRate = 0.025;

  let totalTaxableValue = 0;
  let totalCgst = 0;
  let totalSgst = 0;
  let totalLineItemsGross = 0;

  const processedItems = rawItems.map((item, idx) => {
    const qty = Number(item.quantity) || 1;
    const itemTotal = (Number(item.price) || 0) * qty;
    
    // Reverse calculation from gross to taxable
    const taxableValue = itemTotal / (1 + gstRate);
    const cgst = taxableValue * cgstRate;
    const sgst = taxableValue * sgstRate;

    totalTaxableValue += taxableValue;
    totalCgst += cgst;
    totalSgst += sgst;
    totalLineItemsGross += itemTotal;

    const variantLabel = item.variant?.label || item.variant || item.selectedWeight || '';
    const hsn = item.hsn || getHsnCode(item.name, item.category);

    return {
      sNo: idx + 1,
      name: item.name || 'Organic Farm Harvest',
      variant: variantLabel,
      hsn,
      qty,
      rate: Number(item.price) || 0,
      taxableValue,
      cgst,
      sgst,
      total: itemTotal
    };
  });

  const grandTotal = Number(order.totalAmount || order.amount || totalLineItemsGross);
  const totalTax = totalCgst + totalSgst;
  const amountInWords = numberToWords(grandTotal);

  const handlePrint = () => {
    window.print();
  };

  const isFitActive = isMobile && viewMode === 'fit';

  return (
    <div className="tax-invoice-modal-overlay" onClick={onClose}>
      <div className="tax-invoice-modal-container" onClick={(e) => e.stopPropagation()}>
        
        {/* Modal Action Controls Bar (Hidden during printing) */}
        <div className="invoice-action-toolbar no-print">
          <div className="invoice-toolbar-title">
            <FileText size={17} color="#0c2f34" />
            <span className="toolbar-title-text">Tax Invoice</span>
            <span className="invoice-pill-badge">#{invoiceNo}</span>
          </div>

          <div className="invoice-toolbar-actions">
            {/* View Mode Switcher for Mobile */}
            {isMobile && (
              <button
                type="button"
                className={`btn-invoice-action secondary ${isFitActive ? 'active' : ''}`}
                onClick={() => setViewMode(v => v === 'fit' ? 'scroll' : 'fit')}
                title={isFitActive ? 'Switch to 100% zoom with swipe' : 'Fit entire invoice to screen'}
              >
                {isFitActive ? <Maximize2 size={13} /> : <Minimize2 size={13} />}
                <span>{isFitActive ? '100% Zoom' : 'Fit Screen'}</span>
              </button>
            )}

            <button type="button" className="btn-invoice-action primary" onClick={handlePrint}>
              <Printer size={15} />
              <span className="btn-print-text">Print / PDF</span>
            </button>
            
            <button type="button" className="btn-invoice-close" onClick={onClose} aria-label="Close invoice">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Mobile Swipe Helper Hint (shown on mobile when in full scroll mode) */}
        {isMobile && !isFitActive && (
          <div className="mobile-scroll-hint no-print">
            <span>👈 Swipe horizontally to view all invoice columns 👉</span>
          </div>
        )}

        {/* Printable Tax Invoice Paper Document Scroll Wrapper */}
        <div 
          className={`tax-invoice-paper-wrapper ${isFitActive ? 'mode-fit' : 'mode-scroll'}`}
          style={isFitActive && invoiceHeight ? {
            height: `${Math.round(invoiceHeight * scale) + 16}px`,
            overflow: 'hidden'
          } : {}}
        >
          <div 
            className="tax-invoice-sheet" 
            ref={invoiceRef}
            style={isFitActive ? {
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
              width: '780px',
              minWidth: '780px'
            } : {}}
          >
          
          {/* Top Dark Header Bar */}
          <div className="tax-invoice-top-banner">
            <span>TAX INVOICE</span>
          </div>

          {/* Company Brand & Address Header */}
          <div className="tax-invoice-header-row">
            <div className="company-info-block">
              <h1 className="company-brand-name">
                <span className="brand-primary">VENTHULIR</span>{' '}
                <span className="brand-accent">ORGANIC HARVEST</span>
              </h1>
              <div className="company-address-text">
                IInd Floor, OM Shiva Towers, 259-B, Advaitha Ashram Rd, Fairlands, Salem, Tamil Nadu - 636004<br />
                <strong>GSTIN:</strong> 33AAFTO2026V1Z8 &nbsp;|&nbsp; <strong>Phone:</strong> +91 8778476414 &nbsp;|&nbsp; <strong>Email:</strong> theventhulir@gmail.com
              </div>
            </div>

            <div className="company-logo-block">
              <img 
                src="/logo.png" 
                alt="Venthulir Logo" 
                className="invoice-logo-img"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <div className="company-crest-text">VENTHULIR</div>
            </div>
          </div>

          {/* Details Table: Single Unified 4-Column Grid */}
          <table className="tax-grid-table">
            <tbody>
              {/* Row 1: Invoice & Challan Info */}
              <tr>
                <td className="grid-cell w-25">
                  <span className="cell-label">INVOICE (OR) BILL NO</span>
                  <div className="cell-value">VEN-{invoiceNo}</div>
                </td>
                <td className="grid-cell w-25">
                  <span className="cell-label">INVOICE DATE</span>
                  <div className="cell-value">{invoiceDate}</div>
                </td>
                <td className="grid-cell w-25">
                  <span className="cell-label">CHALLAN NO</span>
                  <div className="cell-value">{challanNo}</div>
                </td>
                <td className="grid-cell w-25">
                  <span className="cell-label">CHALLAN DATE</span>
                  <div className="cell-value">{challanDate}</div>
                </td>
              </tr>

              {/* Row 2: Buyer, Invoice No & Delivery */}
              <tr>
                <td className="grid-cell" colSpan={2}>
                  <span className="cell-label">BUYER</span>
                  <div className="cell-value buyer-name">{buyerName}</div>
                </td>
                <td className="grid-cell">
                  <span className="cell-label">INVOICE NO</span>
                  <div className="cell-value font-mono">ORD-{invoiceNo}</div>
                </td>
                <td className="grid-cell">
                  <span className="cell-label">DELIVERY MODE</span>
                  <div className="cell-value">Standard</div>
                </td>
              </tr>

              {/* Row 3: Address, Phone & Payment */}
              <tr>
                <td className="grid-cell" colSpan={2}>
                  <span className="cell-label">ADDRESS</span>
                  <div className="cell-value-text">{buyerAddress}</div>
                </td>
                <td className="grid-cell">
                  <span className="cell-label">PHONE</span>
                  <div className="cell-value font-mono">{buyerPhone}</div>
                </td>
                <td className="grid-cell">
                  <span className="cell-label">PAYMENT STATUS</span>
                  <div className={`cell-value invoice-payment-badge ${isPaid ? 'paid' : 'cod'}`}>
                    {isPaid ? 'Paid' : 'Cash on Delivery'}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          {/* Main Line Items Table */}
          <table className="tax-items-table">
            <thead>
              <tr>
                <th style={{ width: '42px', textAlign: 'center' }}>S.NO</th>
                <th style={{ textAlign: 'left' }}>PRODUCT NAME</th>
                <th style={{ width: '75px', textAlign: 'center' }}>HSN/SAC</th>
                <th style={{ width: '48px', textAlign: 'center' }}>QTY</th>
                <th style={{ width: '80px', textAlign: 'right' }}>RATE (₹)</th>
                <th style={{ width: '95px', textAlign: 'right' }}>TAXABLE VALUE</th>
                <th style={{ width: '65px', textAlign: 'right' }}>CGST 2.5%</th>
                <th style={{ width: '65px', textAlign: 'right' }}>SGST 2.5%</th>
                <th style={{ width: '85px', textAlign: 'right' }}>TOTAL (₹)</th>
              </tr>
            </thead>
            <tbody>
              {processedItems.map((item) => (
                <tr key={item.sNo}>
                  <td className="text-center">{item.sNo}</td>
                  <td className="item-name-cell">
                    <span className="item-title">{item.name}</span>
                    {item.variant && <span className="item-variant"> ({item.variant})</span>}
                  </td>
                  <td className="text-center tabular-num">{item.hsn}</td>
                  <td className="text-center tabular-num">{item.qty}</td>
                  <td className="text-right tabular-num">{item.rate.toFixed(2)}</td>
                  <td className="text-right tabular-num">{item.taxableValue.toFixed(2)}</td>
                  <td className="text-right tabular-num">{item.cgst.toFixed(2)}</td>
                  <td className="text-right tabular-num">{item.sgst.toFixed(2)}</td>
                  <td className="text-right tabular-num font-bold">{item.total.toFixed(2)}</td>
                </tr>
              ))}

              {/* Subtotal Total Row */}
              <tr className="tr-subtotal-row">
                <td colSpan={5} className="text-right font-bold subtotal-label">Total</td>
                <td className="text-right font-bold tabular-num">{totalTaxableValue.toFixed(2)}</td>
                <td className="text-right font-bold tabular-num">{totalCgst.toFixed(2)}</td>
                <td className="text-right font-bold tabular-num">{totalSgst.toFixed(2)}</td>
                <td className="text-right font-bold tabular-num total-highlight">₹{totalLineItemsGross.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>

          {/* Amount In Words & Financial Summary */}
          <div className="tax-bottom-summary-grid">
            <div className="amount-in-words-box">
              <span className="words-label">AMOUNT IN WORDS</span>
              <div className="words-content">
                Indian Rupees {amountInWords} Only
              </div>
            </div>

            <div className="tax-totals-breakdown-box">
              <div className="total-line-row">
                <span>Taxable Amount:</span>
                <span>₹{totalTaxableValue.toFixed(2)}</span>
              </div>
              <div className="total-line-row">
                <span>Total Tax (GST 5%):</span>
                <span>₹{totalTax.toFixed(2)}</span>
              </div>
              {order.shippingCharge > 0 && (
                <div className="total-line-row">
                  <span>Shipping Fee:</span>
                  <span>₹{order.shippingCharge.toFixed(2)}</span>
                </div>
              )}
              {order.discountAmount > 0 && (
                <div className="total-line-row discount-row">
                  <span>Coupon Discount:</span>
                  <span>-₹{order.discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="grand-total-divider" />
              <div className="grand-total-row">
                <span>Grand Total:</span>
                <span>₹{grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Formal Computer Generated Footer */}
          <div className="tax-invoice-footer-notes">
            <p>This is a computer-generated invoice. No signature required.</p>
            <p>Thank you for shopping with Venthulir Organic Harvest.</p>
          </div>

        </div>
        {/* End of tax-invoice-paper-wrapper */}
        </div>

      </div>
    </div>
  );
}
