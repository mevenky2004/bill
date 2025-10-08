import React from 'react';
import { Printer } from 'lucide-react';
import { Bill } from '../App';

interface Props {
  bill: Bill;
}

const Invoice: React.FC<Props> = ({ bill }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div>
      {/* Print Button - Hidden during print */}
      <div className="max-w-2xl mx-auto p-4 print:hidden">
        <button
          onClick={handlePrint}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 mb-6"
        >
          <Printer className="h-5 w-5" />
          Print Invoice
        </button>
      </div>

      {/* Invoice Content */}
      <div className="max-w-2xl mx-auto bg-white p-8 print:p-0 print:max-w-none">
        
        <div className="text-center mb-8">
          {/* REMOVED: The manually added "Billing System" paragraph is gone */}
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">INVOICE</h1>
          <div className="text-sm text-gray-600">
            Invoice #: {bill.id}
          </div>
          <div className="text-sm text-gray-600">
            Date: {new Date(bill.createdAt).toLocaleDateString('en-IN')}
          </div>
          <div className="text-sm text-gray-600">
            Time: {new Date(bill.createdAt).toLocaleTimeString('en-IN')}
          </div>
        </div>

        {/* Items Table */}
        <div className="mb-8">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-300">
                <th className="text-left py-2 font-semibold">Item</th>
                <th className="text-center py-2 font-semibold">Weight</th>
                <th className="text-right py-2 font-semibold">Price</th>
                <th className="text-center py-2 font-semibold">Qty</th>
                <th className="text-right py-2 font-semibold">Total</th>
              </tr>
            </thead>
            <tbody>
              {bill.items.map((item, index) => (
                <tr key={item.id} className="border-b border-gray-200">
                  <td className="py-3 font-medium">{item.name}</td>
                  <td className="py-3 text-center">
                    {item.weight ? `${item.weight} ${item.weightUnit}` : 'Packet/Piece'}
                  </td>
                  <td className="py-3 text-right">₹{item.price.toFixed(2)}</td>
                  <td className="py-3 text-center">{item.quantity}</td>
                  <td className="py-3 text-right font-medium">₹{item.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="border-t-2 border-gray-300 pt-4">
          <div className="flex justify-between items-center text-xl font-bold">
            <span>TOTAL AMOUNT:</span>
            <span>₹{bill.total.toFixed(2)}</span>
          </div>
          
          <div className="mt-4 text-center">
            <div className="text-sm text-gray-600">
              Thank you for your purchase!
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-gray-600">
          <div className="border-t border-gray-200 pt-4">
            <p className="mb-2">Thank you for your business!</p>
            <p>Generated on {new Date().toLocaleString('en-IN')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Invoice;
