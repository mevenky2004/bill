import React, { useState, useEffect } from 'react';
import { Package, Receipt, Plus, Search, Printer, CreditCard, Banknote, LogOut } from 'lucide-react';
import ItemManager from './components/ItemManager.tsx';
import BillingInterface from './components/BillingInterface.tsx';
import Invoice from './components/Invoice.tsx';
import Login from './components/Login.tsx';

export interface ItemVariant {
  id: string;
  name: string;
  weight?: number;
  weightUnit: string;
  price: number;
}

export interface BillItem {
  id: string;
  name: string;
  weight?: number;
  weightUnit: string;
  price: number;
  quantity: number;
  total: number;
}

export interface Bill {
  id: string;
  items: BillItem[];
  subtotal: number;
  total: number;
  createdAt: string;
}

function App() {
  const [activeTab, setActiveTab] = useState<'items' | 'billing'>('items');
  const [items, setItems] = useState<ItemVariant[]>([]);
  const [currentBill, setCurrentBill] = useState<BillItem[]>([]);
  const [completedBill, setCompletedBill] = useState<Bill | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Only load items if logged in
    if (isLoggedIn) {
      const savedItems = localStorage.getItem('billingItems');
      if (savedItems) {
        setItems(JSON.parse(savedItems));
      }
    }
  }, [isLoggedIn]);

  const saveItems = (newItems: ItemVariant[]) => {
    setItems(newItems);
    localStorage.setItem('billingItems', JSON.stringify(newItems));
  };

  const handleAddToBill = (item: ItemVariant, quantity: number) => {
    const existingItemIndex = currentBill.findIndex(billItem => billItem.id === item.id);
    
    if (existingItemIndex >= 0) {
      const updatedBill = [...currentBill];
      updatedBill[existingItemIndex] = {
        ...updatedBill[existingItemIndex],
        quantity: updatedBill[existingItemIndex].quantity + quantity,
        total: (updatedBill[existingItemIndex].quantity + quantity) * item.price
      };
      setCurrentBill(updatedBill);
    } else {
      const billItem: BillItem = {
        id: item.id,
        name: item.name,
        weight: item.weight,
        weightUnit: item.weightUnit,
        price: item.price,
        quantity,
        total: item.price * quantity
      };
      setCurrentBill([...currentBill, billItem]);
    }
  };

  const handleRemoveFromBill = (itemId: string) => {
    setCurrentBill(currentBill.filter(item => item.id !== itemId));
  };

  const handleUpdateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveFromBill(itemId);
      return;
    }
    
    const updatedBill = currentBill.map(item => 
      item.id === itemId 
        ? { ...item, quantity: newQuantity, total: item.price * newQuantity }
        : item
    );
    setCurrentBill(updatedBill);
  };

  const getBillTotal = () => {
    return currentBill.reduce((sum, item) => sum + item.total, 0);
  };

  const handleProceedToInvoice = () => {
    const bill: Bill = {
      id: Date.now().toString(),
      items: currentBill,
      subtotal: getBillTotal(),
      total: getBillTotal(),
      createdAt: new Date().toISOString()
    };
    
    setCompletedBill(bill);
    setCurrentBill([]);
    
    // Auto-print after a short delay
    setTimeout(() => {
      window.print();
    }, 500);
  };

  const startNewBill = () => {
    setCompletedBill(null);
    setCurrentBill([]);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    // Clear any bill or item data if needed upon logout
    setItems([]);
    setCurrentBill([]);
    setCompletedBill(null);
  };

  if (!isLoggedIn) {
    return <Login onLogin={setIsLoggedIn} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Receipt className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Billing System</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {completedBill && (
                <button
                  onClick={startNewBill}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  New Bill
                </button>
              )}
              <button
                onClick={handleLogout}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {!completedBill ? (
        <>
          <div className="bg-white shadow-sm print:hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex space-x-8">
                <button
                  onClick={() => setActiveTab('items')}
                  className={`py-4 px-2 border-b-2 font-medium text-sm ${
                    activeTab === 'items'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Package className="h-4 w-4 inline mr-2" />
                  Item Management
                </button>
                <button
                  onClick={() => setActiveTab('billing')}
                  className={`py-4 px-2 border-b-2 font-medium text-sm ${
                    activeTab === 'billing'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Receipt className="h-4 w-4 inline mr-2" />
                  Billing
                  {currentBill.length > 0 && (
                    <span className="ml-2 bg-blue-100 text-blue-600 py-1 px-2 rounded-full text-xs">
                      {currentBill.length}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {activeTab === 'items' ? (
              <ItemManager items={items} onSaveItems={saveItems} />
            ) : (
              <BillingInterface
                items={items}
                currentBill={currentBill}
                onAddToBill={handleAddToBill}
                onRemoveFromBill={handleRemoveFromBill}
                onUpdateQuantity={handleUpdateQuantity}
                onProceedToInvoice={handleProceedToInvoice}
                total={getBillTotal()}
              />
            )}
          </div>
        </>
      ) : (
        <Invoice bill={completedBill} />
      )}
    </div>
  );
}

export default App;
