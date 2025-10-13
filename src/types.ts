// src/types.ts

export interface ItemVariant {
  id: string;
  name: string;
  weight?: number;
  weightUnit: string;
  price: number; // This will now represent the RATE (exclusive of GST)
  mrp?: number;   // This is the optional, non-calculative MRP
  hsnCode?: string;
  gstRate?: number;
}

export interface BillItem {
  id: string;
  name: string;
  weight?: number;
  weightUnit: string;
  price: number; // Rate
  quantity: number;
  total: number; // This will be calculated as (rate * quantity) + GST
  hsnCode?: string;
  gstRate?: number;
  mrp?: number;
}

export interface Address {
  attention?: string;
  countryRegion?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  pinCode?: string;
  phone?: string;
  faxNumber?: string;
}

export interface Receiver {
  id: string;
  customerType: 'business' | 'individual';
  salutation?: string;
  firstName?: string;
  lastName?: string;
  companyName?: string;
  displayName: string;
  email?: string;
  workPhone?: string;
  mobile?: string;
  gstin?: string;
  billingAddress: Address;
  shippingAddress: Address;
}

export type NewReceiver = Omit<Receiver, 'id'>;

export interface Bill {
  id: string;
  invoiceNumber: string;
  receiver: Receiver | NewReceiver | null;
  items: BillItem[];
  subtotal: number;
  cgst: number;
  sgst: number;
  total: number;
  createdAt: string;
  paymentStatus: 'paid' | 'unpaid';
  buyersOrderNo?: string;
  dispatchedThrough?: string;
  destination?: string;
}

export const initialAddressState: Address = {
  attention: '', countryRegion: 'India', addressLine1: '', addressLine2: '',
  city: '', state: '', pinCode: '', phone: '', faxNumber: ''
};