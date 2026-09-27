export type UserRole = 'admin' | 'partner';

export interface UserAccount {
  id: string;
  name: string;
  pin: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  phone?: string;
  shopName?: string;
  balanceDue: number; // Positive = customer owes shop (Receivable), Negative = shop owes customer (Payable)
  createdAt: string;
}

export interface InventoryItem {
  id: number;
  sku: string;
  name: string;
  category: string;
  costPrice: number;
  sellingPrice: number;
  stockQuantity: number;
  minStockAlert: number;
  unit: string;
  isDeleted: boolean; // Soft delete
  createdAt: string;
  updatedAt: string;
}

export interface BillItem {
  itemId: number;
  itemName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  costPrice: number;
  lineTotal: number;
}

export interface Bill {
  id: number;
  billNumber: string;
  createdAt: string;
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  customerShopName?: string;
  subtotal: number;
  discount: number;
  grandTotal: number;
  paymentType: 'PAID' | 'LOAN';
  status: 'COMPLETED' | 'CANCELLED';
  items: BillItem[];
  createdByName: string;
}

export interface LoanPayment {
  id: string;
  customerId: string;
  amount: number;
  paymentDate: string;
  notes?: string;
  recordedBy: string;
}

export interface Expense {
  id: number;
  category: string;
  amount: number;
  notes?: string;
  expenseDate: string;
  recordedBy: string;
}

export interface PartnershipRatioRecord {
  id: string;
  partner1Ratio: number; // e.g. 60
  partner2Ratio: number; // e.g. 40
  partner1Name: string;
  partner2Name: string;
  effectiveDate: string;
}

export interface ActivityLogEntry {
  id: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'BACKUP' | 'RESTORE' | 'PAYMENT';
  module: 'INVENTORY' | 'BILLING' | 'LOANS' | 'EXPENSES' | 'SYSTEM' | 'AUTH';
  description: string;
  performedBy: string;
  timestamp: string;
}

export type TabId = 'dashboard' | 'billing' | 'inventory' | 'loans' | 'more';

export type SubScreenId =
  | 'expenses'
  | 'partnership'
  | 'reports'
  | 'settings'
  | 'bill-history'
  | 'activity-log'
  | 'about'
  | null;
