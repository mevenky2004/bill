import React from 'react';
import { Bill, Address } from '../App';

interface Props {
  bill: Bill;
}

const formatCurrency = (num: number) => num.toFixed(2);

// Helper function to format the structured address into a string
const formatAddress = (addr: Address | undefined): string => {
    if (!addr) return 'N/A';
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
    name: "KS MARKETING",
    address: "Suggappa Layout\nBalagi Recedency\nSecond Cross\nYALAHANKA BENGALORE - 560064",
    gstin: "",
  };
  
  // Use the new structured name or the old displayName
  const receiverName = bill.receiver?.displayName || bill.receiver?.name || 'N/A';
  const billingAddressText = formatAddress(bill.receiver?.billingAddress);
  const shippingAddressText = formatAddress(bill.receiver?.shippingAddress);


  return (
    <div className="max-w-4xl mx-auto bg-white p-8 border print:border-none print:shadow-none print:p-0 font-sans text-sm">
      <div className="flex justify-center items-start mb-4">
          <h1 className="text-2xl font-bold text-center">GST INVOICE</h1>
      </div>

      <div className={`grid ${bill.receiver ? 'grid-cols-2' : 'grid-cols-1'} border`}>
        <div className={`p-2 ${bill.receiver ? 'border-r' : ''}`}>
          <p className="font-bold text-base">{shopAddress.name}</p>
          <p className="whitespace-pre-line">{shopAddress.address}</p>
          <p><span className="font-semibold">GSTIN/UIN:</span> {shopAddress.gstin}</p>
        </div>
        {bill.receiver && (
          <div className="grid grid-cols-2 text-xs">
            <div className="p-2 border-r"><span className="font-semibold">Invoice No.</span><br />{bill.invoiceNumber}</div>
            <div className="p-2"><span className="font-semibold">Dated</span><br />{new Date(bill.createdAt).toLocaleDateString('en-GB')}</div>
            <div className="p-2 border-r border-t"><span className="font-semibold">Buyer's Order No.</span><br/>{bill.buyersOrderNo}</div>
            <div className="p-2 border-t"><span className="font-semibold">Dispatched Through</span><br/>{bill.dispatchedThrough}</div>
          </div>
        )}
      </div>

      {bill.receiver && (
        <div className="grid grid-cols-2 border border-t-0">
          <div className="p-2 border-r">
            <p className="font-semibold">SHIPPING ADDRESS:</p>
            <p className="font-bold">{receiverName}</p>
            <p className="whitespace-pre-line">{shippingAddressText}</p>
            {bill.receiver.gstin && <p><span className="font-semibold">GSTIN/UIN:</span> {bill.receiver.gstin}</p>}
          </div>
          <div className="p-2">
            <p className="font-semibold">BILLING ADDRESS:</p>
            <p className="font-bold">{receiverName}</p>
            <p className="whitespace-pre-line">{billingAddressText}</p>
            {bill.receiver.gstin && <p><span className="font-semibold">GSTIN/UIN:</span> {bill.receiver.gstin}</p>}
          </div>
        </div>
      )}

      <table className="w-full border-x">
        <thead className="bg-gray-50">
          <tr className="border-b">
            <th className="p-1 border-r font-semibold">Sl</th>
            <th className="p-1 border-r font-semibold text-left">Description</th>
            <th className="p-1 border-r font-semibold">HSN</th>
            <th className="p-1 border-r font-semibold">Qty</th>
            <th className="p-1 border-r font-semibold text-right">MRP</th>
            <th className="p-1 border-r font-semibold text-right">Basic Value</th>
            <th className="p-1 border-r font-semibold" colSpan={2}>CGST</th>
            <th className="p-1" colSpan={2}>SGST</th>
          </tr>
          <tr className="border-b bg-gray-50">
            <th className="p-1 border-r"></th><th className="p-1 border-r"></th><th className="p-1 border-r"></th><th className="p-1 border-r"></th><th className="p-1 border-r"></th><th className="p-1 border-r"></th>
            <th className="p-1 border-r font-semibold">Rate</th><th className="p-1 border-r font-semibold text-right">Amt</th>
            <th className="p-1 border-r font-semibold">Rate</th><th className="p-1 font-semibold text-right">Amt</th>
          </tr>
        </thead>
        <tbody>
          {bill.items.map((item, index) => {
            const gstRate = item.gstRate || 0;
            const baseValue = item.total / (1 + gstRate / 100);
            const gstAmount = item.total - baseValue;
            const cgstSgstRate = gstRate / 2;
            const cgstSgstAmount = gstAmount / 2;
            return (
              <tr key={item.id + index} className="border-b">
                <td className="p-1 border-r text-center">{index + 1}</td>
                <td className="p-1 border-r">{item.name} {item.weight ? `(${item.weight}${item.weightUnit})` : ''}</td>
                <td className="p-1 border-r text-center">{item.hsnCode || ''}</td>
                <td className="p-1 border-r text-center">{item.quantity}</td>
                <td className="p-1 border-r text-right">₹{formatCurrency(item.price)}</td>
                <td className="p-1 border-r text-right">₹{formatCurrency(baseValue)}</td>
                <td className="p-1 border-r text-center">{cgstSgstRate.toFixed(2)}%</td>
                <td className="p-1 border-r text-right">₹{formatCurrency(cgstSgstAmount)}</td>
                <td className="p-1 border-r text-center">{cgstSgstRate.toFixed(2)}%</td>
                <td className="p-1 text-right">₹{formatCurrency(cgstSgstAmount)}</td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr className="border-t font-semibold">
            <td className="p-1 border-r text-right" colSpan={5}>Total</td>
            <td className="p-1 border-r text-right">₹{formatCurrency(bill.subtotal)}</td>
            <td className="p-1 border-r"></td>
            <td className="p-1 border-r text-right">₹{formatCurrency(bill.cgst)}</td>
            <td className="p-1 border-r"></td>
            <td className="p-1 text-right">₹{formatCurrency(bill.sgst)}</td>
          </tr>
        </tfoot>
      </table>

      <div className="flex justify-between border border-t-0 p-2">
        <div><p className="font-bold">Total (in words):</p><p>---</p></div>
        <div className="text-right">
          <div className="flex justify-between gap-4"><span>Subtotal:</span><span>₹{formatCurrency(bill.subtotal)}</span></div>
          <div className="flex justify-between gap-4"><span>CGST:</span><span>₹{formatCurrency(bill.cgst)}</span></div>
          <div className="flex justify-between gap-4"><span>SGST:</span><span>₹{formatCurrency(bill.sgst)}</span></div>
          <div className="flex justify-between gap-4 font-bold border-t mt-1 pt-1"><span>GRAND TOTAL:</span><span>₹{formatCurrency(bill.total)}</span></div>
        </div>
      </div>
    </div>
  );
};

export default Invoice;