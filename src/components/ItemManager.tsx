import React, { useState } from 'react';
import { Plus, CreditCard as Edit, Trash2, Save, X, Package } from 'lucide-react';
import { ItemVariant } from '../App';

interface Props {
  items: ItemVariant[];
  onSaveItems: (items: ItemVariant[]) => void;
}

interface ItemForm {
  name: string;
  weight: string;
  weightUnit: string;
  price: string;
  isWeightless: boolean;
}

const ItemManager: React.FC<Props> = ({ items, onSaveItems }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [formData, setFormData] = useState<ItemForm>({
    name: '',
    weight: '',
    weightUnit: 'pieces',
    price: '',
    isWeightless: true
  });

  const resetForm = () => {
    setFormData({
      name: '',
      weight: '',
      weightUnit: 'pieces',
      price: '',
      isWeightless: true
    });
    setShowForm(false);
    setEditingItem(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price) {
      alert('Please fill name and price fields');
      return;
    }

    if (!formData.isWeightless && !formData.weight) {
      alert('Please enter weight for weighted items');
      return;
    }

    const itemData: ItemVariant = {
      id: editingItem || Date.now().toString(),
      name: formData.name.trim(),
      weight: formData.isWeightless ? undefined : parseFloat(formData.weight),
      weightUnit: formData.weightUnit,
      price: parseFloat(formData.price)
    };

    let newItems;
    if (editingItem) {
      newItems = items.map(item => item.id === editingItem ? itemData : item);
    } else {
      newItems = [...items, itemData];
    }

    onSaveItems(newItems);
    resetForm();
  };

  const handleEdit = (item: ItemVariant) => {
    setFormData({
      name: item.name,
      weight: item.weight ? item.weight.toString() : '',
      weightUnit: item.weightUnit,
      price: item.price.toString(),
      isWeightless: !item.weight
    });
    setEditingItem(item.id);
    setShowForm(true);
  };

  const handleDelete = (itemId: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      const newItems = items.filter(item => item.id !== itemId);
      onSaveItems(newItems);
    }
  };

  // Group items by name for better display
  const groupedItems = items.reduce((groups, item) => {
    const key = item.name.toLowerCase();
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(item);
    return groups;
  }, {} as Record<string, ItemVariant[]>);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Item Management</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Item
        </button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">
              {editingItem ? 'Edit Item' : 'Add New Item'}
            </h3>
            <button
              onClick={resetForm}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Item Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Rice, Oil, Masala Packet"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price (₹)
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="10"
                  step="0.01"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="itemType"
                  checked={formData.isWeightless}
                  onChange={() => setFormData({ ...formData, isWeightless: true, weightUnit: 'pieces' })}
                  className="mr-2"
                />
                <span className="text-sm font-medium text-gray-700">Packet/Piece (no weight)</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="itemType"
                  checked={!formData.isWeightless}
                  onChange={() => setFormData({ ...formData, isWeightless: false, weightUnit: 'g' })}
                  className="mr-2"
                />
                <span className="text-sm font-medium text-gray-700">Weighted item</span>
              </label>
            </div>
            {!formData.isWeightless && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Weight
                  </label>
                  <div className="flex">
                    <input
                      type="number"
                      value={formData.weight}
                      onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="10"
                      step="0.01"
                    />
                    <select
                      value={formData.weightUnit}
                      onChange={(e) => setFormData({ ...formData, weightUnit: e.target.value })}
                      className="px-3 py-2 border border-l-0 border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="g">g</option>
                      <option value="kg">kg</option>
                      <option value="ml">ml</option>
                      <option value="l">l</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md flex items-center gap-2 transition-colors"
              >
                <Save className="h-4 w-4" />
                {editingItem ? 'Update' : 'Add'} Item
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Items List */}
      <div className="space-y-4">
        {Object.entries(groupedItems).map(([itemName, variants]) => (
          <div key={itemName} className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 capitalize">
              {variants[0].name}
            </h3>
            
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 text-sm font-medium text-gray-700">Weight</th>
                    <th className="text-left py-2 text-sm font-medium text-gray-700">Price</th>
                    <th className="text-left py-2 text-sm font-medium text-gray-700">Price per Unit</th>
                    <th className="text-right py-2 text-sm font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {variants.map((item) => (
                    <tr key={item.id} className="border-b border-gray-100">
                      <td className="py-3 text-sm">
                        {item.weight ? `${item.weight} ${item.weightUnit}` : 'Packet/Piece'}
                      </td>
                      <td className="py-3 text-sm font-medium">
                        ₹{item.price.toFixed(2)}
                      </td>
                      <td className="py-3 text-sm text-gray-600">
                        {item.weight ? `₹${(item.price / item.weight).toFixed(2)}/${item.weightUnit}` : 'Fixed price'}
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleEdit(item)}
                            className="text-blue-600 hover:text-blue-800 p-1"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="text-red-600 hover:text-red-800 p-1"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
        
        {items.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No items yet</h3>
            <p className="text-gray-600 mb-4">
              Start by adding your first item with different weight and price variants.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg inline-flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add First Item
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ItemManager;