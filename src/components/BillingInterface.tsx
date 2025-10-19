// src/components/BillingInterface.tsx

import React, { useState, useMemo } from 'react';
import { Plus, Minus, Trash2, ChevronsUpDown, X, ShoppingCart, UserPlus, User, Phone, Mail, MapPin, Briefcase } from 'lucide-react';
import { ItemVariant, BillItem, Receiver, NewReceiver } from '../App';

interface Props {
  items: ItemVariant[];
  receivers: Receiver[];
  currentBill: BillItem[];
  onAddToBill: (item: ItemVariant, quantity: number) => void;
  onRemoveFromBill: (itemId: string) => void;
  onUpdateQuantity: (itemId: string, newQuantity: number) => void;
  onProceedToInvoice: (
    receiver: Receiver | NewReceiver | null,
    extraDetails: { buyersOrderNo?: string; dispatchedThrough?: string; destination?: string },
    paymentStatus: 'paid' | 'unpaid',
    saveReceiver: boolean
  ) => void;
  billTotals: { subtotal: number; cgst: number; sgst: number; total: number };
}

const BillingInterface: React.FC<Props> = ({
  items,
  receivers,
  currentBill,
  onAddToBill,
  onRemoveFromBill,
  onUpdateQuantity,
  onProceedToInvoice,
  billTotals
}) => {
  const [itemSearch, setItemSearch] = useState('');
  const [selectedItem, setSelectedItem] = useState<ItemVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [showItemSuggestions, setShowItemSuggestions] = useState(false);
  const [selectedReceiver, setSelectedReceiver] = useState<Receiver | null>(null);
  const [receiverSearch, setReceiverSearch] = useState('');
  const [showReceiverSuggestions, setShowReceiverSuggestions] = useState(false);
  const [showNewReceiverModal, setShowNewReceiverModal] = useState(false);
  const [buyersOrderNo, setBuyersOrderNo] = useState('');
  const [dispatchedThrough, setDispatchedThrough] = useState('');
  const [destination, setDestination] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<'paid' | 'unpaid'>('unpaid');
  const [manualReceiver, setManualReceiver] = useState<Partial<NewReceiver>>({
    displayName: '', workPhone: '', email: '',
    billingAddress: { addressLine1: '' }, gstin: '', customerType: 'individual',
  });
  
  const [saveForFuture, setSaveForFuture] = useState(true);
  const [shouldSaveReceiver, setShouldSaveReceiver] = useState(false);


  const filteredItems = useMemo(() => itemSearch ? items.filter(i => i.name.toLowerCase().includes(itemSearch.toLowerCase())) : [], [items, itemSearch]);
  const filteredReceivers = useMemo(() => {
    if (!receiverSearch) return receivers;
    const term = receiverSearch.toLowerCase();
    return receivers.filter(r => r.displayName.toLowerCase().includes(term) || r.gstin?.toLowerCase().includes(term));
  }, [receivers, receiverSearch]);

  const handleSelectItem = (item: ItemVariant) => {
    setSelectedItem(item);
    setItemSearch(item.name);
    setShowItemSuggestions(false);
    setQuantity(1);
  };

  const handleClearItem = () => {
    setSelectedItem(null);
    setItemSearch('');
    setQuantity(1);
  };

  const handleAddToBillClick = () => {
    if (!selectedItem) return;
    onAddToBill(selectedItem, quantity);
    setSelectedItem(null);
    setItemSearch('');
    setQuantity(1);
  };
  
  const handleSelectReceiver = (receiver: Receiver) => {
    setSelectedReceiver(receiver);
    setReceiverSearch(receiver.displayName);
    setShowReceiverSuggestions(false);
    setShowNewReceiverModal(false);
    setShouldSaveReceiver(false);
  };

  const handleClearReceiver = () => {
    setSelectedReceiver(null);
    setReceiverSearch('');
    setManualReceiver({
      displayName: '', workPhone: '', email: '',
      billingAddress: { addressLine1: '' }, gstin: '', customerType: 'individual',
    });
    setShouldSaveReceiver(false);
  };

  const handleSetManualReceiver = () => {
    if (!manualReceiver.displayName) {
      alert("Recipient Name is required.");
      return;
    }

    const newReceiver: NewReceiver = {
      ...manualReceiver,
      displayName: manualReceiver.displayName,
      billingAddress: manualReceiver.billingAddress || { addressLine1: '' },
      shippingAddress: manualReceiver.billingAddress || { addressLine1: '' },
      customerType: manualReceiver.customerType || 'individual',
    };
    
    setSelectedReceiver(newReceiver as Receiver);
    setShouldSaveReceiver(saveForFuture);
    setShowNewReceiverModal(false);
  };
  
  const handleGenerateInvoice = () => {
    let receiverToUse: Receiver | NewReceiver | null = selectedReceiver;
    
    if (!receiverToUse?.displayName) {
        alert("Please select or enter a Recipient Name.");
        return;
    }
    
    onProceedToInvoice(receiverToUse, { buyersOrderNo, dispatchedThrough, destination }, paymentStatus, shouldSaveReceiver);
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* LEFT COLUMN: INPUTS */}
      <div className="bg-white rounded-lg shadow-md p-6 space-y-8">
        {/* Recipient Details Section */}
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center justify-center gap-3 border-b pb-4 uppercase">Recipient Details</h2>
          {selectedReceiver ? (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg text-sm text-gray-700 relative">
              <button onClick={handleClearReceiver} className="absolute top-2 right-2 text-gray-400 hover:text-gray-600" title="Clear Recipient"><X className="h-5 w-5" /></button>
              <p className="font-bold pr-6 text-base">{selectedReceiver.displayName}</p>
              <p className="whitespace-pre-line mt-1">{selectedReceiver.billingAddress?.addressLine1}</p>
              {selectedReceiver.gstin && <p className="mt-1">GSTIN: {selectedReceiver.gstin}</p>}
              {selectedReceiver.workPhone && <p className="mt-1">Phone: {selectedReceiver.workPhone}</p>}
              {selectedReceiver.email && <p className="mt-1">Email: {selectedReceiver.email}</p>}
            </div>
          ) : (
            <div className="space-y-4 mt-4">
              <div className="relative">
                <input type="text" value={receiverSearch} onChange={e => { setReceiverSearch(e.target.value); }} onFocus={() => setShowReceiverSuggestions(true)} onBlur={() => setTimeout(() => setShowReceiverSuggestions(false), 200)} className="w-full pl-4 pr-10 py-3 border border-gray-300 rounded-lg" placeholder="Search Existing Recipient..." />
                <ChevronsUpDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                {showReceiverSuggestions && (
                  <div className="absolute z-20 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {filteredReceivers.map(r => (
                      <div key={r.id} onMouseDown={() => handleSelectReceiver(r)} className="px-4 py-3 hover:bg-gray-100 cursor-pointer"><p className="font-medium">{r.displayName}</p><p className="text-sm text-gray-500">{r.gstin || 'No GSTIN'}</p></div>
                    ))}
                  </div>
                )}
              </div>
              <div className="text-center">
                <button onClick={() => setShowNewReceiverModal(true)} className="text-sm text-blue-600 font-semibold hover:text-blue-800 p-2 inline-flex items-center gap-2">
                  <Plus className="h-4 w-4" /> Add New Recipient
                </button>
              </div>
            </div>
          )}
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center justify-center gap-3 border-b pb-4 uppercase">Add Items</h2>
          <div className="space-y-4 mt-4">
            <div className="relative">
              <input type="text" value={selectedItem ? selectedItem.name : itemSearch} onChange={(e) => { setItemSearch(e.target.value); setSelectedItem(null); setShowItemSuggestions(true); }} onFocus={() => setShowItemSuggestions(true)} onBlur={() => setTimeout(() => setShowItemSuggestions(false), 200)} className="w-full px-4 py-3 border border-gray-300 rounded-lg" placeholder="Search for items..." disabled={!!selectedItem} />
              {showItemSuggestions && filteredItems.length > 0 && itemSearch && (
                <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {filteredItems.map((item) => (<div key={item.id} onMouseDown={() => handleSelectItem(item)} className="px-4 py-3 hover:bg-gray-100 cursor-pointer flex justify-between"><div><p className="font-medium">{item.name}</p><p className="text-sm text-gray-500">{item.weight ? `${item.weight} ${item.weightUnit}` : 'Packet/Piece'}</p></div><p className="font-bold">₹{item.price.toFixed(2)}</p></div>))}
                </div>
              )}
            </div>
            {selectedItem && (
              <div className="bg-blue-50 p-4 rounded-lg relative">
                <button onClick={handleClearItem} className="absolute top-2 right-2 text-gray-400 hover:text-gray-600" title="Clear Item"><X className="h-5 w-5" /></button>
                <p className="font-medium mb-2 pr-6">{selectedItem.name}</p>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2"><label className="text-sm font-medium">Qty:</label><div className="flex items-center border border-gray-300 rounded bg-white"><button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="px-2 py-1"><Minus className="h-4 w-4" /></button><input type="number" value={quantity} onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 1))} className="w-12 text-center border-0 focus:ring-0" min="1" /><button onClick={() => setQuantity(q => q + 1)} className="px-2 py-1"><Plus className="h-4 w-4" /></button></div></div>
                  <button onClick={handleAddToBillClick} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex-1">Add to Bill</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: "CURRENT BILL" */}
      <div className="bg-white rounded-lg shadow-md flex flex-col">
        <h2 className="text-xl font-semibold flex items-center justify-center gap-3 p-4 border-b bg-gray-50 rounded-t-lg uppercase">Current Bill</h2>
        {currentBill.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-gray-500">
            <ShoppingCart className="h-16 w-16 mb-4 text-blue-500" />
            <h3 className="text-lg font-semibold text-gray-600">Your Bill is Empty</h3>
            <p className="text-sm">Add items from the left to get started.</p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col justify-between">
            <div className="space-y-3 p-4 overflow-y-auto">
              {currentBill.map(item => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-gray-100 rounded-lg">
                  <div className="flex-1 mr-2"><p className="font-medium">{item.name}</p><p className="text-sm text-gray-600">₹{item.price.toFixed(2)}</p></div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center border rounded bg-white"><button onClick={() => onUpdateQuantity(item.id, item.quantity - 1)} className="px-2 py-1"><Minus className="h-3 w-3" /></button><span className="w-8 text-center text-sm">{item.quantity}</span><button onClick={() => onUpdateQuantity(item.id, item.quantity + 1)} className="px-2 py-1"><Plus className="h-3 w-3" /></button></div>
                    <p className="font-bold min-w-[80px] text-right">₹{item.total.toFixed(2)}</p>
                    <button onClick={() => onRemoveFromBill(item.id)} className="text-red-500 p-1"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
              ))}
            </div>
            {/* FIX: The entire totals and "Generate Invoice" button section has been removed */}
          </div>
        )}
      </div>

      {/* New Recipient Modal */}
      {showNewReceiverModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full">
            <div className="flex flex-col items-center justify-center mb-6">
              <div className="p-4 rounded-full bg-blue-100 text-blue-600 mb-4"><UserPlus className="h-10 w-10" /></div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-2">Add New Recipient</h3>
              <p className="text-sm text-gray-500 text-center">Enter recipient details below.</p>
            </div>
            <div className="space-y-4">
              {/* Recipient Name */}
              <div className="relative flex items-center bg-gray-50 rounded-xl px-4 py-3 border border-gray-200">
                <User className="h-5 w-5 text-gray-400 mr-3" />
                <input
                  type="text"
                  placeholder="Recipient Name *"
                  value={manualReceiver.displayName}
                  onChange={e => setManualReceiver({ ...manualReceiver, displayName: e.target.value })}
                  className="flex-1 bg-transparent border-none p-0 focus:ring-0 text-gray-800 placeholder-gray-500 text-sm"
                />
              </div>
              {/* Phone Number */}
              <div className="relative flex items-center bg-gray-50 rounded-xl px-4 py-3 border border-gray-200">
                <Phone className="h-5 w-5 text-gray-400 mr-3" />
                <input
                  type="text"
                  placeholder="Phone Number (optional)"
                  value={manualReceiver.workPhone}
                  onChange={e => setManualReceiver({ ...manualReceiver, workPhone: e.target.value })}
                  className="flex-1 bg-transparent border-none p-0 focus:ring-0 text-gray-800 placeholder-gray-500 text-sm"
                />
              </div>
              {/* Email */}
              <div className="relative flex items-center bg-gray-50 rounded-xl px-4 py-3 border border-gray-200">
                <Mail className="h-5 w-5 text-gray-400 mr-3" />
                <input
                  type="email"
                  placeholder="Email (optional)"
                  value={manualReceiver.email}
                  onChange={e => setManualReceiver({ ...manualReceiver, email: e.target.value })}
                  className="flex-1 bg-transparent border-none p-0 focus:ring-0 text-gray-800 placeholder-gray-500 text-sm"
                />
              </div>
              {/* Address */}
              <div className="relative flex items-start bg-gray-50 rounded-xl px-4 py-3 border border-gray-200">
                <MapPin className="h-5 w-5 text-gray-400 mr-3 mt-1" />
                <textarea
                  placeholder="Address"
                  value={manualReceiver.billingAddress?.addressLine1}
                  onChange={e => setManualReceiver({ ...manualReceiver, billingAddress: { addressLine1: e.target.value } })}
                  rows={2}
                  className="flex-1 bg-transparent border-none p-0 focus:ring-0 text-gray-800 placeholder-gray-500 text-sm resize-y"
                ></textarea>
              </div>
              {/* GST / Tax ID */}
              <div className="relative flex items-center bg-gray-50 rounded-xl px-4 py-3 border border-gray-200">
                <Briefcase className="h-5 w-5 text-gray-400 mr-3" />
                <input
                  type="text"
                  placeholder="GST / Tax ID (optional)"
                  value={manualReceiver.gstin}
                  onChange={e => setManualReceiver({ ...manualReceiver, gstin: e.target.value })}
                  className="flex-1 bg-transparent border-none p-0 focus:ring-0 text-gray-800 placeholder-gray-500 text-sm"
                />
              </div>
            </div>
            {/* "Save for future" checkbox */}
            <div className="flex items-center mt-6">
              <input id="save-for-future" type="checkbox" checked={saveForFuture} onChange={e => setSaveForFuture(e.target.checked)} className="h-5 w-5 text-emerald-500 border-gray-300 rounded focus:ring-emerald-400" />
              <label htmlFor="save-for-future" className="ml-3 block text-base text-gray-700">Save details for future use</label>
            </div>
            <div className="flex justify-end gap-3 mt-8">
              <button onClick={() => setShowNewReceiverModal(false)} className="flex-1 px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-200 font-semibold transition-colors">Cancel</button>
              <button onClick={handleSetManualReceiver} className="flex-1 px-4 py-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 font-semibold transition-colors">Save Recipient</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillingInterface;