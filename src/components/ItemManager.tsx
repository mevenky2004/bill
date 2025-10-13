import React, { useState, useRef, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X, Package } from 'lucide-react';
import { ItemVariant } from '../App';
import { collection, addDoc, doc, deleteDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase.js";

interface Props {
  items: ItemVariant[];
  onItemsUpdate: () => void;
}

interface ItemForm {
  name: string;
  weight: string;
  weightUnit: string;
  price: string; // This will now always be the final MRP (incl. GST)
  basePrice: string; // New field for the price before tax
  isWeightless: boolean;
  hsnCode: string;
  gstRate: string;
}

const ItemManager: React.FC<Props> = ({ items, onItemsUpdate }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ItemVariant | null>(null);
  const [formData, setFormData] = useState<ItemForm>({
    name: '', weight: '', weightUnit: 'g', price: '', basePrice: '',
    isWeightless: true, hsnCode: '', gstRate: ''
  });

  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isFormOpen && formRef.current && !formRef.current.contains(event.target as Node)) {
        resetForm();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isFormOpen]);

  const resetForm = () => {
    setFormData({
      name: '', weight: '', weightUnit: 'g', price: '', basePrice: '',
      isWeightless: true, hsnCode: '', gstRate: ''
    });
    setEditingItem(null);
    setIsFormOpen(false);
  };

  const handleOpenForm = (item: ItemVariant | null = null) => {
    if (item) {
      setEditingItem(item);
      const gst = item.gstRate || 0;
      const mrp = item.price || 0;
      const base = mrp / (1 + gst / 100);

      setFormData({
        name: item.name,
        weight: item.weight ? item.weight.toString() : '',
        weightUnit: item.weightUnit,
        price: item.price.toString(),
        basePrice: base.toFixed(2),
        isWeightless: !item.weight,
        hsnCode: item.hsnCode || '',
        gstRate: item.gstRate ? item.gstRate.toString() : ''
      });
    } else {
      setEditingItem(null);
      setFormData({
        name: '', weight: '', weightUnit: 'g', price: '', basePrice: '',
        isWeightless: true, hsnCode: '', gstRate: ''
      });
    }
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price) {
      alert('Please fill all required fields: Name and Price.');
      return;
    }
    if (!formData.isWeightless && !formData.weight) {
      alert('Please enter a weight for the weighted item.');
      return;
    }
    const { basePrice, ...itemDataToSave } = formData; // Exclude basePrice from the data to be saved
    const itemData: Omit<ItemVariant, 'id'> = {
      name: itemDataToSave.name.trim(),
      price: parseFloat(itemDataToSave.price),
      hsnCode: itemDataToSave.hsnCode.trim(),
      gstRate: parseFloat(itemDataToSave.gstRate) || 0,
      weightUnit: itemDataToSave.isWeightless ? 'pieces' : itemDataToSave.weightUnit,
      ...(!itemDataToSave.isWeightless && { weight: parseFloat(itemDataToSave.weight) })
    };
    try {
      if (editingItem) {
        await updateDoc(doc(db, "items", editingItem.id), itemData as { [x: string]: any });
      } else {
        await addDoc(collection(db, "items"), itemData);
      }
      onItemsUpdate();
      resetForm();
    } catch (error) { console.error("Error writing document: ", error); }
  };
  
  const handleDelete = async (itemId: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      try { await deleteDoc(doc(db, "items", itemId)); onItemsUpdate(); } 
      catch (error) { console.error("Error deleting document: ", error); }
    }
  };

  // --- NEW: Function to handle dynamic price calculations ---
  const handlePriceChange = (field: 'price' | 'basePrice' | 'gstRate', value: string) => {
    let newFormData = { ...formData, [field]: value };
    const price = parseFloat(newFormData.price);
    const basePrice = parseFloat(newFormData.basePrice);
    const gstRate = parseFloat(newFormData.gstRate) || 0;

    if (field === 'price') {
      if (!isNaN(price)) {
        const newBasePrice = price / (1 + gstRate / 100);
        newFormData.basePrice = isNaN(newBasePrice) ? '' : newBasePrice.toFixed(2);
      }
    } else if (field === 'basePrice') {
      if (!isNaN(basePrice)) {
        const newPrice = basePrice * (1 + gstRate / 100);
        newFormData.price = isNaN(newPrice) ? '' : newPrice.toFixed(2);
      }
    } else if (field === 'gstRate') {
      if (!isNaN(basePrice)) { // Recalculate MRP from base price when GST changes
        const newPrice = basePrice * (1 + (parseFloat(value) || 0) / 100);
        newFormData.price = isNaN(newPrice) ? '' : newPrice.toFixed(2);
      } else if (!isNaN(price)) { // Or recalculate base price from MRP
        const newBasePrice = price / (1 + (parseFloat(value) || 0) / 100);
        newFormData.basePrice = isNaN(newBasePrice) ? '' : newBasePrice.toFixed(2);
      }
    }
    setFormData(newFormData);
  };

  const groupedItems = items.reduce((groups, item) => {
    const key = item.name.toLowerCase();
    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
    return groups;
  }, {} as Record<string, ItemVariant[]>);

  const inputStyle = "w-full mt-1 px-3 py-2 bg-gray-100 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm";
  const labelStyle = "block text-sm font-medium text-gray-700";

  return (
    <div className="space-y-6">
      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center p-4">
          <div ref={formRef} className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b"><div className="flex justify-between items-center"><h3 className="text-xl font-semibold text-gray-800">{editingItem ? 'Edit Item' : 'Add New Item'}</h3><button onClick={resetForm} className="text-gray-400 hover:text-gray-600"><X /></button></div></div>
            <form onSubmit={handleSubmit}>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2"><label className={labelStyle}>Item Name</label><input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className={inputStyle} required /></div>
                
                {/* --- PRICE SECTION UPDATED --- */}
                <div><label className={labelStyle}>Base Price (excl. GST) (₹)</label><input type="number" value={formData.basePrice} onChange={e => handlePriceChange('basePrice', e.target.value)} className={inputStyle} step="0.01" /></div>
                <div><label className={labelStyle}>Total Price (MRP, incl. GST) (₹)</label><input type="number" value={formData.price} onChange={e => handlePriceChange('price', e.target.value)} className={inputStyle} step="0.01" required /></div>
                <div><label className={labelStyle}>HSN/SAC Code</label><input type="text" value={formData.hsnCode} onChange={e => setFormData({ ...formData, hsnCode: e.target.value })} className={inputStyle} /></div>
                <div><label className={labelStyle}>GST Rate (%)</label><input type="number" value={formData.gstRate} onChange={e => handlePriceChange('gstRate', e.target.value)} className={inputStyle} step="0.01" /></div>
                
                <div className="md:col-span-2 flex items-center space-x-6">
                  <label className="flex items-center gap-2"><input type="radio" name="itemType" checked={formData.isWeightless} onChange={() => setFormData({ ...formData, isWeightless: true, weightUnit: 'pieces' })} /> Packet/Piece</label>
                  <label className="flex items-center gap-2"><input type="radio" name="itemType" checked={!formData.isWeightless} onChange={() => setFormData({ ...formData, isWeightless: false, weightUnit: 'g' })} /> Weighted</label>
                </div>

                {!formData.isWeightless && (
                  <div className="md:col-span-2">
                    <label className={labelStyle}>Weight</label>
                    <div className="grid grid-cols-4 gap-2">
                      <input type="number" value={formData.weight} onChange={e => setFormData({ ...formData, weight: e.target.value })} className={`${inputStyle} col-span-3`} step="0.01" required />
                      <select value={formData.weightUnit} onChange={e => setFormData({ ...formData, weightUnit: e.target.value })} className={`${inputStyle} col-span-1`}>
                        <option value="g">g</option><option value="kg">kg</option><option value="ml">ml</option><option value="l">l</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
              <div className="p-6 bg-gray-50 border-t flex justify-end gap-4">
                <button type="button" onClick={resetForm} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300">Cancel</button>
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"><Save className="h-4 w-4" /> {editingItem ? 'Update' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main Page Content */}
      <div className="flex justify-between items-center"><h2 className="text-2xl font-bold text-gray-900 uppercase">Item Management</h2><button onClick={() => handleOpenForm()} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"><Plus className="h-4 w-4" /> Add Item</button></div>
      {Object.entries(groupedItems).map(([itemName, variants]) => (
        <div key={itemName} className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 capitalize">{variants[0].name}</h3>
          <div className="overflow-x-auto"><table className="min-w-full text-sm"><thead className="bg-gray-50"><tr className="border-b"><th className="text-left p-2 font-semibold">Variant</th><th className="text-left p-2 font-semibold">MRP</th><th className="text-left p-2 font-semibold">HSN</th><th className="text-left p-2 font-semibold">GST</th><th className="text-right p-2 font-semibold">Actions</th></tr></thead>
          <tbody>{variants.map((item) => (<tr key={item.id} className="border-b last:border-0"><td className="p-2">{item.weight ? `${item.weight} ${item.weightUnit}` : 'Packet/Piece'}</td><td className="p-2 font-medium">₹{item.price.toFixed(2)}</td><td className="p-2">{item.hsnCode || 'N/A'}</td><td className="p-2">{item.gstRate}%</td><td className="p-2 text-right"><div className="flex justify-end space-x-2"><button onClick={() => handleOpenForm(item)} className="text-blue-600 p-1" title="Edit"><Edit className="h-4 w-4" /></button><button onClick={() => handleDelete(item.id)} className="text-red-600 p-1" title="Delete"><Trash2 className="h-4 w-4" /></button></div></td></tr>))}</tbody>
          </table></div>
        </div>
      ))}
      {items.length === 0 && !isFormOpen && (<div className="bg-white rounded-lg shadow-md p-12 text-center"><Package className="h-12 w-12 text-gray-400 mx-auto mb-4" /><h3 className="text-lg font-medium">No items yet</h3><p className="text-gray-600 mb-4">Start by adding your first item.</p><button onClick={() => handleOpenForm()} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg inline-flex items-center gap-2"><Plus className="h-4 w-4" /> Add First Item</button></div>)}
    </div>
  );
};

export default ItemManager;