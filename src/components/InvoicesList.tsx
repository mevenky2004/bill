import React, { useState, useMemo } from 'react';
import { Bill } from '../App';
import { Eye, DollarSign, Trash2 } from 'lucide-react'; // Import Trash2 icon

interface Props {
  invoices: Bill[];
  onViewInvoice: (invoice: Bill) => void;
  onUpdateInvoiceStatus: (invoiceId: string, newStatus: 'paid' | 'unpaid') => void;
  onDeleteInvoice: (invoiceId: string) => void; // New prop for deleting
}

const InvoicesList: React.FC<Props> = ({ invoices, onViewInvoice, onUpdateInvoiceStatus, onDeleteInvoice }) => {
  const [filter, setFilter] = useState<'all' | 'unpaid' | 'paid'>('all');

  const filteredInvoices = useMemo(() => {
    if (filter === 'paid') {
      return invoices.filter(inv => inv.paymentStatus === 'paid');
    }
    if (filter === 'unpaid') {
      return invoices.filter(inv => inv.paymentStatus === 'unpaid' || !inv.paymentStatus);
    }
    return invoices;
  }, [invoices, filter]);

  const totalSales = useMemo(() => {
    return filteredInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
  }, [filteredInvoices]);

  const getFilterText = () => {
    if (filter === 'paid') return 'Paid Invoices';
    if (filter === 'unpaid') return 'Unpaid Invoices';
    return 'All Invoices';
  };

  const handleDeleteClick = (invoiceId: string, invoiceNumber: string) => {
    if (window.confirm(`Are you sure you want to delete invoice #${invoiceNumber}? This action cannot be undone.`)) {
      onDeleteInvoice(invoiceId);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Saved Invoices</h2>
        <div className="flex items-center gap-2 p-1 bg-gray-200 rounded-lg">
          <button onClick={() => setFilter('all')} className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${filter === 'all' ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:bg-gray-300'}`}>All</button>
          <button onClick={() => setFilter('paid')} className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${filter === 'paid' ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:bg-gray-300'}`}>Paid</button>
          <button onClick={() => setFilter('unpaid')} className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${filter === 'unpaid' ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:bg-gray-300'}`}>Unpaid</button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 text-left font-semibold text-gray-600">Invoice No.</th>
                <th className="p-3 text-left font-semibold text-gray-600">Date</th>
                <th className="p-3 text-left font-semibold text-gray-600">Receiver</th>
                <th className="p-3 text-right font-semibold text-gray-600">Amount</th>
                <th className="p-3 text-center font-semibold text-gray-600">Status</th>
                <th className="p-3 text-right font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.map((invoice, index) => (
                <tr key={invoice.id || index} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="p-3 font-medium">{invoice.invoiceNumber || 'N/A'}</td>
                  <td className="p-3">{invoice.createdAt ? new Date(invoice.createdAt).toLocaleDateString() : 'N/A'}</td>
                  <td className="p-3 font-medium">{invoice.receiver?.name ?? 'N/A'}</td>
                  <td className="p-3 text-right font-semibold">₹{(invoice.total ?? 0).toFixed(2)}</td>
                  <td className="p-3 text-center">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${invoice.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {(invoice.paymentStatus || 'unpaid').charAt(0).toUpperCase() + (invoice.paymentStatus || 'unpaid').slice(1)}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex justify-end space-x-1">
                        {invoice.paymentStatus !== 'paid' && (
                            <button onClick={() => onUpdateInvoiceStatus(invoice.id, 'paid')} className="text-green-600 hover:text-green-800 p-1" title="Mark as Paid">
                                <DollarSign className="h-4 w-4" />
                            </button>
                        )}
                        <button onClick={() => onViewInvoice(invoice)} className="text-blue-600 hover:text-blue-800 p-1" title="View Invoice">
                            <Eye className="h-4 w-4" />
                        </button>
                        {/* --- NEW: Delete button --- */}
                        <button onClick={() => handleDeleteClick(invoice.id, invoice.invoiceNumber)} className="text-red-600 hover:text-red-800 p-1" title="Delete Invoice">
                            <Trash2 className="h-4 w-4" />
                        </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredInvoices.length === 0 && (
          <div className="text-center p-12 text-gray-500"><p>No {filter !== 'all' ? filter : ''} invoices found.</p></div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-md p-4 mt-6 flex justify-end items-center">
        <div className="text-right">
            <p className="text-sm text-gray-600">Total Sales ({getFilterText()})</p>
            <p className="text-2xl font-bold text-gray-900">₹{totalSales.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
};

export default InvoicesList;