// src/components/Invoice.tsx

import React from 'react';
import { Bill, Address } from '../types';

interface Props {
  bill: Bill;
}

const formatCurrency = (num: number) => num.toFixed(2);

const formatAddress = (addr: Address | undefined): string => {
    if (!addr) return '';
    const parts = [
        addr.attention,
        addr.addressLine1,
        addr.addressLine2,
        `${addr.city || ''} ${addr.state || ''} ${addr.pinCode || ''}`.trim(),
        addr.countryRegion,
        addr.phone ? `Ph: ${addr.phone}` : '',
        addr.faxNumber ? `Fax: ${addr.faxNumber}` : ''
    ];
    return parts.filter(part => part).join('\n');
};

const Invoice: React.FC<Props> = ({ bill }) => {

  const shopAddress = {
    name: "NATUREE NECTAR FOOD PRODUCTS",
    address: "Floor No.: FIRST FLOOR\nBuilding No./Flat No.: NO.172\n Name Of Premises/Building: SHIVAPRIYA NILAYA\nRoad/Street: 17TH B CROSS ROAD\nLocality/Sub Locality: Prashanth Nagar\nCity/Town/Village: Bengaluru\n District: Bengaluru Urban\nState: Karnataka\nPIN code :560057",
    gstin: " 29COEPN6277E1ZK",
  };
  
  const receiverName = bill.receiver?.displayName || 'N/A';
  const billingAddressText = formatAddress(bill.receiver?.billingAddress);
  const shippingAddressText = formatAddress(bill.receiver?.shippingAddress);

  const finalTotal = parseFloat(bill.subtotal.toFixed(2)) + parseFloat(bill.cgst.toFixed(2)) + parseFloat(bill.sgst.toFixed(2));
  const gstTotal = parseFloat(bill.cgst.toFixed(2)) + parseFloat(bill.sgst.toFixed(2));

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 border print:border-none print:shadow-none print:p-2 font-sans text-sm print:text-xs print:my-0">
      <div className="flex justify-center items-start mb-2 print:mb-1">
          <h1 className="text-2xl font-bold text-center">GST INVOICE</h1>
      </div>

      {/* Header and Address sections */}
      <div className={`grid ${bill.receiver ? 'grid-cols-2' : 'grid-cols-1'} border`}>
        <div className={`p-2 print:p-1 ${bill.receiver ? 'border-r' : ''}`}>
          <p className="font-bold text-base print:text-sm">{shopAddress.name}</p>
          <p className="whitespace-pre-line">{shopAddress.address}</p>
          <p><span className="font-semibold">GSTIN/UIN:</span> {shopAddress.gstin}</p>
        </div>
        {bill.receiver && (
          <div className="grid grid-cols-2 text-xs">
            <div className="p-2 print:p-1 border-r"><span className="font-semibold">Invoice No.</span><br />{bill.invoiceNumber}</div>
            <div className="p-2 print:p-1"><span className="font-semibold">Dated</span><br />{new Date(bill.createdAt).toLocaleDateString('en-GB')}</div>
            <div className="p-2 print:p-1 border-r border-t"><span className="font-semibold">Buyer's Order No.</span><br/>{bill.buyersOrderNo}</div>
            <div className="p-2 print:p-1 border-t"><span className="font-semibold">Dispatched Through</span><br/>{bill.dispatchedThrough}</div>
          </div>
        )}
      </div>
      {bill.receiver && (
        <div className="grid grid-cols-2 border border-t-0">
          <div className="p-2 print:p-1 border-r">
            <p className="font-semibold">SHIPPING ADDRESS :</p>
            <p className="font-bold">{receiverName}</p>
            <p className="whitespace-pre-line">{shippingAddressText}</p>
            {bill.receiver.gstin && <p><span className="font-semibold">GSTIN/UIN:</span> {bill.receiver.gstin}</p>}
          </div>
          <div className="p-2 print:p-1">
            <p className="font-semibold">BILLING ADDRESS :</p>
            <p className="font-bold">{receiverName}</p>
            <p className="whitespace-pre-line">{billingAddressText}</p>
            {bill.receiver.gstin && <p><span className="font-semibold">GSTIN/UIN:</span> {bill.receiver.gstin}</p>}
          </div>
        </div>
      )}

      {/* Table Section */}
      <table className="w-full border-x border-b text-center">
        <thead className="bg-gray-50 align-top">
          <tr className="border-b">
            <th className="p-1 print:py-0.5 print:px-1 border-r font-semibold">Sl</th>
            <th className="p-1 print:py-0.5 print:px-1 border-r font-semibold text-left">Description</th>
            <th className="p-1 print:py-0.5 print:px-1 border-r font-semibold">HSN</th>
            <th className="p-1 print:py-0.5 print:px-1 border-r font-semibold">Quantity</th>
            <th className="p-1 print:py-0.5 print:px-1 border-r font-semibold text-right">MRP</th>
            <th className="p-1 print:py-0.5 print:px-1 border-r font-semibold text-right">Rate</th>
            <th className="p-1 print:py-0.5 print:px-1 border-r font-semibold" colSpan={2}>CGST</th>
            <th className="p-1 print:py-0.5 print:px-1 border-r font-semibold" colSpan={2}>SGST</th>
            <th className="p-1 print:py-0.5 print:px-1 font-semibold text-right">Amount</th>
          </tr>
          <tr className="border-b bg-gray-50 text-xs">
            <th className="p-1 print:py-0.5 print:px-1 border-r"></th><th className="p-1 print:py-0.5 print:px-1 border-r"></th><th className="p-1 print:py-0.5 print:px-1 border-r"></th>
            <th className="p-1 print:py-0.5 print:px-1 border-r"></th><th className="p-1 print:py-0.5 print:px-1 border-r"></th><th className="p-1 print:py-0.5 print:px-1 border-r"></th>
            <th className="p-1 print:py-0.5 print:px-1 border-r font-semibold">Rate</th><th className="p-1 print:py-0.5 print:px-1 border-r font-semibold text-right">Amt</th>
            <th className="p-1 print:py-0.5 print:px-1 border-r font-semibold">Rate</th><th className="p-1 print:py-0.5 print:px-1 border-r font-semibold text-right">Amt</th>
            <th className="p-1 print:py-0.5 print:px-1"></th>
          </tr>
        </thead>
        <tbody>
          {bill.items.map((item, index) => {
            const basicValue = item.price * item.quantity;
            const gstRate = item.gstRate || 0;
            const gstAmount = basicValue * (gstRate / 100);
            const cgstSgstRate = gstRate / 2;
            const cgstSgstAmount = gstAmount / 2;
            const total = parseFloat(basicValue.toFixed(2)) + parseFloat(cgstSgstAmount.toFixed(2)) + parseFloat(cgstSgstAmount.toFixed(2));
            return (
              <tr key={item.id + index} className="border-b">
                <td className="p-1 print:py-0.5 print:px-1 border-r">{index + 1}</td>
                <td className="p-1 print:py-0.5 print:px-1 border-r text-left">{item.name} {item.weight ? `(${item.weight}${item.weightUnit})` : ''}</td>
                <td className="p-1 print:py-0.5 print:px-1 border-r">{item.hsnCode || ''}</td>
                <td className="p-1 print:py-0.5 print:px-1 border-r">{item.quantity}</td>
                <td className="p-1 print:py-0.5 print:px-1 border-r text-right">₹{item.mrp ? formatCurrency(item.mrp) : 'N/A'}</td>
                <td className="p-1 print:py-0.5 print:px-1 border-r text-right">₹{formatCurrency(item.price * item.quantity)}</td>
                <td className="p-1 print:py-0.5 print:px-1 border-r">{cgstSgstRate.toFixed(2)}%</td>
                <td className="p-1 print:py-0.5 print:px-1 border-r text-right">₹{formatCurrency(cgstSgstAmount)}</td>
                <td className="p-1 print:py-0.5 print:px-1 border-r">{cgstSgstRate.toFixed(2)}%</td>
                <td className="p-1 print:py-0.5 print:px-1 border-r text-right">₹{formatCurrency(cgstSgstAmount)}</td>
                <td className="p-1 print:py-0.5 print:px-1 text-right font-semibold">₹{formatCurrency(total)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      
      {/* Final Totals Section Below Table */}
      <div className="flex justify-between border-x border-b p-2 print:p-1">
        <div>
          <p className="font-bold">Total (in words):</p>
          <p>---</p>
        </div>
        <div className="w-1/3 text-sm text-right">
            <div className="flex justify-between">
                <span className="font-semibold">Sub Total:</span>
                <span>₹{formatCurrency(bill.subtotal)}</span>
            </div>
            <div className="flex justify-between">
                <span className="font-semibold">Total CGST:</span>
                <span>₹{formatCurrency(bill.cgst)}</span>
            </div>
            <div className="flex justify-between">
                <span className="font-semibold">Total SGST:</span>
                <span>₹{formatCurrency(bill.sgst)}</span>
            </div>
            <div className="flex justify-between font-bold border-t mt-1 pt-1">
                <span>GRAND TOTAL:</span>
                <span>₹{formatCurrency(finalTotal)}</span>
            </div>
        </div>
      </div>
      
      {/* FIX: The Bank Details and T&C section has been removed */}

      <footer className="mt-4 text-center text-gray-500 text-xs">
        <p>THANK YOU</p>
      </footer>
    </div>
  );
};

export default Invoice;