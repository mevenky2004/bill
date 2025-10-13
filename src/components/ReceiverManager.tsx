import React, { useState, useRef, useEffect } from 'react';
import { Plus, Trash2, Edit, Save, X } from 'lucide-react';
import { collection, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebase.js";
import { Receiver, Address, NewReceiver } from '../App';

interface Props {
  receivers: Receiver[];
  onReceiversUpdate: () => void;
}

const initialAddressState: Address = {
  attention: '', countryRegion: 'India', addressLine1: '', addressLine2: '',
  city: '', state: '', pinCode: '', phone: '', faxNumber: ''
};

const initialReceiverState: NewReceiver = {
  customerType: 'business',
  displayName: '',
  companyName: '',
  email: '',
  firstName: '',
  lastName: '',
  salutation: 'Mr.',
  mobile: '',
  workPhone: '',
  gstin: '',
  billingAddress: { ...initialAddressState },
  shippingAddress: { ...initialAddressState }
};

const ReceiverManager: React.FC<Props> = ({ receivers, onReceiversUpdate }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<NewReceiver>({ ...initialReceiverState });
  const [isShippingSameAsBilling, setIsShippingSameAsBilling] = useState(true);

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
    setFormData({ ...initialReceiverState });
    setEditingId(null);
    setIsFormOpen(false);
    setIsShippingSameAsBilling(true);
  };

  const handleOpenForm = (receiver: Receiver | null = null) => {
    if (receiver) {
      setEditingId(receiver.id);
      const fullReceiverData = { ...initialReceiverState, ...receiver };
      setFormData(fullReceiverData);
      const shippingSame = JSON.stringify(receiver.billingAddress) === JSON.stringify(receiver.shippingAddress);
      setIsShippingSameAsBilling(shippingSame);
    } else {
      setEditingId(null);
      setFormData({ ...initialReceiverState });
      setIsShippingSameAsBilling(true);
    }
    setIsFormOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.displayName.trim()) {
      alert("Display Name is required.");
      return;
    }
    
    const dataToSave = {
      ...formData,
      shippingAddress: isShippingSameAsBilling ? formData.billingAddress : formData.shippingAddress,
    };

    try {
      if (editingId) {
        await updateDoc(doc(db, "receivers", editingId), dataToSave);
      } else {
        await addDoc(collection(db, "receivers"), dataToSave);
      }
      onReceiversUpdate();
      resetForm();
    } catch (e) { console.error("Error saving receiver: ", e); alert("Failed to save receiver."); }
  };

  const handleDelete = async (receiver: Receiver) => {
    if (window.confirm(`Are you sure you want to delete "${receiver.displayName}"?`)) {
      try {
        await deleteDoc(doc(db, "receivers", receiver.id));
        onReceiversUpdate();
      } catch (e) { console.error("Error deleting receiver: ", e); alert("Failed to delete receiver."); }
    }
  };

  const handleAddressChange = (type: 'billingAddress' | 'shippingAddress', field: keyof Address, value: string) => {
    setFormData(prev => ({ ...prev, [type]: { ...prev[type], [field]: value } }));
  };
  
  const inputStyle = "w-full mt-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm";
  const labelStyle = "text-sm font-medium text-gray-700";

  const AddressFields: React.FC<{ type: 'billingAddress' | 'shippingAddress', disabled?: boolean }> = ({ type, disabled }) => (
    <div className="space-y-4">
      <div><label className={labelStyle}>Attention</label><input type="text" value={formData[type]?.attention || ''} onChange={e => handleAddressChange(type, 'attention', e.target.value)} className={inputStyle} disabled={disabled} /></div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className={labelStyle}>City</label><input type="text" value={formData[type]?.city || ''} onChange={e => handleAddressChange(type, 'city', e.target.value)} className={inputStyle} disabled={disabled} /></div>
        <div><label className={labelStyle}>State</label><input type="text" value={formData[type]?.state || ''} onChange={e => handleAddressChange(type, 'state', e.target.value)} className={inputStyle} disabled={disabled} /></div>
      </div>
      <div><label className={labelStyle}>Address</label><textarea value={formData[type]?.addressLine1 || ''} onChange={e => handleAddressChange(type, 'addressLine1', e.target.value)} className={inputStyle} rows={2} placeholder="Street 1" disabled={disabled}></textarea><textarea value={formData[type]?.addressLine2 || ''} onChange={e => handleAddressChange(type, 'addressLine2', e.target.value)} className={`${inputStyle} mt-2`} rows={2} placeholder="Street 2" disabled={disabled}></textarea></div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className={labelStyle}>Pin Code</label><input type="text" value={formData[type]?.pinCode || ''} onChange={e => handleAddressChange(type, 'pinCode', e.target.value)} className={inputStyle} disabled={disabled} /></div>
        <div><label className={labelStyle}>Phone</label><input type="text" value={formData[type]?.phone || ''} onChange={e => handleAddressChange(type, 'phone', e.target.value)} className={inputStyle} disabled={disabled} /></div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-start p-4 overflow-y-auto">
          <div ref={formRef} className="bg-white rounded-lg shadow-2xl w-full max-w-2xl my-8">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-800">{editingId ? 'Edit Customer' : 'New Customer'}</h3>
                <button onClick={resetForm} className="text-gray-400 hover:text-gray-600"><X /></button>
              </div>
            </div>
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              
              {/* --- SYSTEMATIC ONE-BY-ONE FORM LAYOUT --- */}
              <div className="space-y-4">
                <div>
                  <label className={labelStyle}>Customer Type</label>
                  <div className="flex gap-6 mt-2"><label className="flex items-center gap-2"><input type="radio" name="customerType" value="business" checked={formData.customerType === 'business'} onChange={() => setFormData({...formData, customerType: 'business'})} /> Business</label><label className="flex items-center gap-2"><input type="radio" name="customerType" value="individual" checked={formData.customerType === 'individual'} onChange={() => setFormData({...formData, customerType: 'individual'})} /> Individual</label></div>
                </div>

                <div>
                  <label className={labelStyle}>Primary Contact</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-1">
                    <select value={formData.salutation} onChange={e => setFormData({ ...formData, salutation: e.target.value })} className={inputStyle}>
                      <option>Mr.</option><option>Mrs.</option><option>Ms.</option><option>Miss</option><option>Dr.</option>
                    </select>
                    <input type="text" placeholder="First Name" value={formData.firstName} onChange={e => setFormData({ ...formData, firstName: e.target.value })} className={inputStyle} />
                    <input type="text" placeholder="Last Name" value={formData.lastName} onChange={e => setFormData({ ...formData, lastName: e.target.value })} className={inputStyle} />
                  </div>
                </div>

                <div>
                    <label className={labelStyle}>Company Name</label>
                    <input type="text" value={formData.companyName} onChange={e => setFormData({ ...formData, companyName: e.target.value })} className={inputStyle} />
                </div>
                <div>
                    <label className={labelStyle}>Display Name <span className="text-red-500">*</span></label>
                    <input type="text" value={formData.displayName} onChange={e => setFormData({ ...formData, displayName: e.target.value })} className={inputStyle} required />
                </div>
                <div>
                  <label className={labelStyle}>Email Address</label>
                  <input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className={inputStyle} />
                </div>
                <div>
                    <label className={labelStyle}>GSTIN</label>
                    <input type="text" value={formData.gstin} onChange={e => setFormData({ ...formData, gstin: e.target.value })} className={inputStyle} />
                </div>
                <div>
                    <label className={labelStyle}>Phone</label>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      <input type="tel" placeholder="Work Phone" value={formData.workPhone} onChange={e => setFormData({ ...formData, workPhone: e.target.value })} className={inputStyle} />
                      <input type="tel" placeholder="Mobile" value={formData.mobile} onChange={e => setFormData({ ...formData, mobile: e.target.value })} className={inputStyle} />
                    </div>
                </div>
              </div>
              
              <div className="space-y-6 pt-4 border-t">
                <div>
                  <h4 className="font-semibold mb-4">Billing Address</h4>
                  <AddressFields type="billingAddress" />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-semibold">Shipping Address</h4>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" id="sameAsBilling" checked={isShippingSameAsBilling} onChange={e => setIsShippingSameAsBilling(e.target.checked)} />
                      <label htmlFor="sameAsBilling" className="text-sm">Same as Billing</label>
                    </div>
                  </div>
                  {!isShippingSameAsBilling && <AddressFields type="shippingAddress" />}
                </div>
              </div>
            </div>
            <div className="p-6 bg-gray-50 border-t flex justify-end gap-4">
              <button type="button" onClick={resetForm} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300">Cancel</button>
              <button type="button" onClick={handleSubmit} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"><Save className="h-4 w-4" /> {editingId ? "Update" : "Save"}</button>
            </div>
          </div>
        </div>
      )}

      {/* Main Page Content */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Receiver Management</h2>
        <button onClick={() => handleOpenForm()} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
          <Plus className="h-4 w-4" /> Add Customer
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-left font-semibold">Display Name</th>
              <th className="p-3 text-left font-semibold">Company Name</th>
              <th className="p-3 text-left font-semibold">Email</th>
              <th className="p-3 text-left font-semibold">Phone</th>
              <th className="p-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {receivers.length === 0 ? (
              <tr><td colSpan={5} className="text-center p-4 text-gray-500">No customers added yet.</td></tr>
            ) : receivers.map(r => (
              <tr key={r.id} className="border-t hover:bg-gray-50">
                <td className="p-3 font-medium">{r.displayName}</td>
                <td className="p-3">{r.companyName || '--'}</td>
                <td className="p-3">{r.email || '--'}</td>
                <td className="p-3">{r.mobile || r.workPhone || '--'}</td>
                <td className="p-3">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => handleOpenForm(r)} title="Edit" className="text-blue-600 hover:text-blue-800"><Edit className="h-4 w-4" /></button>
                    <button onClick={() => handleDelete(r)} title="Delete" className="text-red-500 hover:red-700"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReceiverManager;