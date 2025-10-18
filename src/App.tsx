// src/App.tsx

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Package, Receipt, Plus, Users, Archive, ArrowLeft, Printer, ChevronDown } from 'lucide-react';
import ItemManager from './components/ItemManager.tsx';
import ReceiverManager from './components/ReceiverManager.tsx';
import BillingInterface from './components/BillingInterface.tsx';
import Invoice from './components/Invoice.tsx';
import InvoicesList from './components/InvoicesList.tsx';
import Login from './components/Login.tsx';
import { collection, getDocs, addDoc, query, orderBy, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "./firebase.js";
import { Bill, BillItem, ItemVariant, Receiver, NewReceiver, initialAddressState } from './types.ts';

function App() {
  const [activeTab, setActiveTab] = useState<'billing' | 'items' | 'receivers' | 'invoices'>('billing');
  const [items, setItems] = useState<ItemVariant[]>([]);
  const [receivers, setReceivers] = useState<Receiver[]>([]);
  const [invoices, setInvoices] = useState<Bill[]>([]);
  const [currentBill, setCurrentBill] = useState<BillItem[]>([]);
  const [completedBill, setCompletedBill] = useState<Bill | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  const [isManagementMenuOpen, setManagementMenuOpen] = useState(false);
  const managementMenuRef = useRef<HTMLDivElement>(null);

  const fetchAllData = useCallback(async () => {
    if (!isLoggedIn) return;
    try {
      const itemsSnapshot = await getDocs(collection(db, "items"));
      setItems(itemsSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as ItemVariant[]);
      
      const receiversSnapshot = await getDocs(collection(db, "receivers"));
      const safeReceivers = receiversSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          customerType: data.customerType || 'business',
          displayName: data.displayName || 'N/A',
          billingAddress: data.billingAddress || initialAddressState,
          shippingAddress: data.shippingAddress || initialAddressState,
          ...data,
        } as Receiver;
      });
      setReceivers(safeReceivers);

      const invoicesQuery = query(collection(db, "invoices"), orderBy("createdAt", "desc"));
      const invoiceSnapshot = await getDocs(invoicesQuery);
      setInvoices(invoiceSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Bill[]);
    } catch (e) { console.error("Error fetching data: ", e); }
  }, [isLoggedIn]);

  useEffect(() => { fetchAllData(); }, [fetchAllData]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (managementMenuRef.current && !managementMenuRef.current.contains(event.target as Node)) {
            setManagementMenuOpen(false);
        }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const viewInvoice = (invoice: Bill) => setCompletedBill(invoice);

  const updateInvoiceStatus = async (invoiceId: string, newStatus: 'paid' | 'unpaid') => {
    try { await updateDoc(doc(db, "invoices", invoiceId), { paymentStatus: newStatus }); fetchAllData(); } 
    catch (e) { console.error("Error updating invoice status: ", e); }
  };
  
  const handleDeleteInvoice = async (invoiceId: string) => {
    try { await deleteDoc(doc(db, "invoices", invoiceId)); fetchAllData(); } 
    catch (e) { console.error("Error deleting invoice: ", e); }
  };

  const handleAddToBill = (item: ItemVariant, quantity: number) => {
    setCurrentBill(prevBill => {
      const existingIdx = prevBill.findIndex(i => i.id === item.id);
      // --- CORRECTED CALCULATION ---
      const total = item.price * quantity;

      if (existingIdx >= 0) {
        return prevBill.map((billItem, index) => 
          index === existingIdx 
            ? { ...billItem, quantity: billItem.quantity + quantity, total: billItem.total + total } 
            : billItem
        );
      } else {
        return [...prevBill, { ...item, quantity, total }];
      }
    });
  };

  const handleRemoveFromBill = (itemId: string) => setCurrentBill(currentBill.filter(item => item.id !== itemId));

  const handleUpdateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) { handleRemoveFromBill(itemId); return; }
    setCurrentBill(currentBill.map(item => {
      if (item.id === itemId) {
        // --- CORRECTED CALCULATION ---
        const newTotal = item.price * newQuantity;
        return { ...item, quantity: newQuantity, total: newTotal };
      }
      return item;
    }));
  };

  const getBillTotals = () => {
    let subtotal = 0; // This is now the sum of (rate * quantity)
    let totalGst = 0;

    currentBill.forEach(item => {
      const itemSubtotal = item.price * item.quantity;
      const gstAmount = itemSubtotal * ((item.gstRate || 0) / 100);
      subtotal += itemSubtotal;
      totalGst += gstAmount;
    });
    
    const cgst = totalGst / 2;
    const sgst = totalGst / 2;
    const total = subtotal + totalGst;

    return { subtotal, cgst, sgst, total };
  };

  const handleProceedToInvoice = async (
    receiverDetails: Receiver | NewReceiver | null,
    extraDetails: { buyersOrderNo?: string; dispatchedThrough?: string; destination?: string },
    paymentStatus: 'paid' | 'unpaid',
    saveReceiver: boolean
  ) => {
    if (currentBill.length === 0) {
      alert("Cannot generate an invoice with no items.");
      return;
    }
    if (saveReceiver && receiverDetails && !('id' in receiverDetails)) {
      try { await addDoc(collection(db, "receivers"), receiverDetails); fetchAllData(); } 
      catch (e) { console.error("Error saving new receiver:", e); }
    }
    const { subtotal, cgst, sgst, total } = getBillTotals();
    const numericInvoiceNumber = Date.now().toString();
    const tempBill: Omit<Bill, 'id'> = {
      invoiceNumber: numericInvoiceNumber, receiver: receiverDetails, items: currentBill, subtotal, cgst, sgst, total,
      paymentStatus, createdAt: new Date().toISOString(), ...extraDetails
    };
    try {
      const docRef = await addDoc(collection(db, "invoices"), tempBill);
      setCompletedBill({ ...tempBill, id: docRef.id });
      fetchAllData();
    } catch (e) { console.error("Error saving invoice: ", e); }
    setCurrentBill([]);
    setTimeout(() => window.print(), 500);
  };

  const startNewBill = () => {
    setCompletedBill(null);
    setCurrentBill([]);
    setActiveTab('billing');
  };

  if (!isLoggedIn) return <Login onLogin={setIsLoggedIn} />;
  
  const isManagementTabActive = ['invoices', 'items', 'receivers'].includes(activeTab);

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-gradient-to-r from-blue-600 to-indigo-700 shadow-md print:hidden sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"><div className="flex items-center justify-center h-16"><h1 className="text-2xl font-bold text-white uppercase tracking-wider">Billing System</h1></div></div>
      </header>
      {!completedBill ? (
        <>
          <nav className="bg-white shadow-sm print:hidden sticky top-16 z-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-center items-center py-2">
                <div className="flex space-x-1 bg-gray-200 p-1 rounded-lg">
                  <button onClick={() => setActiveTab('billing')} className={`px-6 py-2 rounded-md font-semibold text-sm transition-all ${activeTab === 'billing' ? 'bg-blue-600 text-white shadow' : 'text-gray-600 hover:bg-gray-300'}`}>BILLING</button>
                  <div className="relative" ref={managementMenuRef}>
                    <button onClick={() => setManagementMenuOpen(!isManagementMenuOpen)} className={`px-6 py-2 rounded-md font-semibold text-sm transition-all flex items-center gap-2 ${isManagementTabActive ? 'bg-blue-600 text-white shadow' : 'text-gray-600 hover:bg-gray-300'}`}>MANAGEMENT</button>
                    {isManagementMenuOpen && (
                      <div className="absolute mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                        <div className="py-1" role="menu" aria-orientation="vertical">
                          <a href="#" onClick={() => { setActiveTab('invoices'); setManagementMenuOpen(false); }} className={`block px-4 py-2 text-sm ${activeTab === 'invoices' ? 'font-bold text-blue-700' : 'text-gray-700'} hover:bg-gray-100`} role="menuitem">Saved Invoices</a>
                          <a href="#" onClick={() => { setActiveTab('items'); setManagementMenuOpen(false); }} className={`block px-4 py-2 text-sm ${activeTab === 'items' ? 'font-bold text-blue-700' : 'text-gray-700'} hover:bg-gray-100`} role="menuitem">Item Management</a>
                          <a href="#" onClick={() => { setActiveTab('receivers'); setManagementMenuOpen(false); }} className={`block px-4 py-2 text-sm ${activeTab === 'receivers' ? 'font-bold text-blue-700' : 'text-gray-700'} hover:bg-gray-100`} role="menuitem">Receiver Management</a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </nav>
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {activeTab === 'items' && <ItemManager items={items} onItemsUpdate={fetchAllData} />}
            {activeTab === 'receivers' && <ReceiverManager receivers={receivers} onReceiversUpdate={fetchAllData} />}
            {activeTab === 'billing' && (
              <BillingInterface
                items={items} receivers={receivers} currentBill={currentBill} onAddToBill={handleAddToBill} onRemoveFromBill={handleRemoveFromBill}
                onUpdateQuantity={handleUpdateQuantity} onProceedToInvoice={handleProceedToInvoice} billTotals={getBillTotals()}
              />
            )}
            {activeTab === 'invoices' && <InvoicesList invoices={invoices} onViewInvoice={viewInvoice} onUpdateInvoiceStatus={updateInvoiceStatus} onDeleteInvoice={handleDeleteInvoice} />}
          </main>
        </>
      ) : (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="print:hidden mb-6 flex justify-between items-center"><button onClick={startNewBill} className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"><ArrowLeft className="h-4 w-4" /> Back</button><button onClick={() => window.print()} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors font-semibold"><Printer className="h-5 w-5" /> Print Invoice</button><button onClick={startNewBill} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"><Plus className="h-4 w-4" /> New Bill</button></div>
            <Invoice bill={completedBill} />
        </div>
      )}
    </div>
  );
}
export default App;