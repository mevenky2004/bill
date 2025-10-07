import React, { useState, useMemo } from 'react';
import { Search, Plus, Minus, Trash2, Receipt } from 'lucide-react';
import { ItemVariant, BillItem } from '../App';

interface Props {
  items: ItemVariant[];
  currentBill: BillItem[];
  onAddToBill: (item: ItemVariant, quantity: number) => void;
  onRemoveFromBill: (itemId: string) => void;
  onUpdateQuantity: (itemId: string, newQuantity: number) => void;
  onProceedToInvoice: () => void;
  total: number;
}

const BillingInterface: React.FC<Props> = ({
  items,
  currentBill,
  onAddToBill,
  onRemoveFromBill,
  onUpdateQuantity,
  onProceedToInvoice,
  total
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<ItemVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const filteredItems = useMemo(() => {
    if (!searchTerm) return [];
    return items.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [items, searchTerm]);

  const handleSelectItem = (item: ItemVariant) => {
    setSelectedItem(item);
    setSearchTerm(`${item.name} - ${item.weight}${item.weightUnit} - ₹${item.price}`);
    setShowSuggestions(false);
    setQuantity(1);
  };

  const handleAddToBill = () => {
    if (!selectedItem) return;
    
    onAddToBill(selectedItem, quantity);
    setSelectedItem(null);
    setSearchTerm('');
    setQuantity(1);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && selectedItem) {
      handleAddToBill();
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Add Items Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
          <Search className="h-5 w-5 text-blue-600" />
          Add Items to Bill
        </h2>
        
        <div className="space-y-4">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowSuggestions(true);
                setSelectedItem(null);
              }}
              onFocus={() => setShowSuggestions(true)}
              onKeyPress={handleKeyPress}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Search for items..."
            />
            
            {showSuggestions && filteredItems.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {filteredItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleSelectItem(item)}
                    className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-gray-600">
                          {item.weight ? `${item.weight} ${item.weightUnit}` : 'Packet/Piece'}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">₹{item.price.toFixed(2)}</div>
                        <div className="text-xs text-gray-500">
                          {item.weight ? `₹${(item.price / item.weight).toFixed(2)}/${item.weightUnit}` : 'Fixed price'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {selectedItem && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-3">
                <div>
                  <div className="font-medium">{selectedItem.name}</div>
                  <div className="text-sm text-gray-600">
                    {selectedItem.weight ? `${selectedItem.weight} ${selectedItem.weightUnit}` : 'Packet/Piece'} - ₹{selectedItem.price}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium">Quantity:</label>
                  <div className="flex items-center border border-gray-300 rounded">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-2 py-1 hover:bg-gray-100"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-16 px-2 py-1 text-center border-0 focus:outline-none"
                      min="1"
                    />
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-2 py-1 hover:bg-gray-100"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <button
                  onClick={handleAddToBill}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Add to Bill
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Current Bill Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
          <Receipt className="h-5 w-5 text-green-600" />
          Current Bill
        </h2>
        
        {currentBill.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No items added yet. Start by searching and adding items.
          </div>
        ) : (
          <div className="space-y-4">
            {currentBill.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="font-medium">{item.name}</div>
                  <div className="text-sm text-gray-600">
                    {item.weight ? `${item.weight} ${item.weightUnit}` : 'Packet/Piece'} × ₹{item.price}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="flex items-center border border-gray-300 rounded">
                    <button
                      onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                      className="px-2 py-1 hover:bg-gray-100"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-8 text-center text-sm">{item.quantity}</span>
                    <button
                      onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                      className="px-2 py-1 hover:bg-gray-100"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                  
                  <div className="text-right min-w-[80px]">
                    <div className="font-bold">₹{item.total.toFixed(2)}</div>
                  </div>
                  
                  <button
                    onClick={() => onRemoveFromBill(item.id)}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
            
            <div className="border-t pt-4">
              <div className="flex justify-between items-center text-xl font-bold">
                <span>Total:</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
              
              <button
                onClick={onProceedToInvoice}
                className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
              >
                Generate Invoice
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BillingInterface;