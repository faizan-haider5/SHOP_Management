import {
  ActivityLogEntry,
  Bill,
  Customer,
  Expense,
  InventoryItem,
  LoanPayment,
  PartnershipRatioRecord,
  UserAccount,
} from '../types';

export const DEFAULT_CATEGORIES = [
  'Sipari',
  'Biscuit',
  'Bubble',
  'Paapr',
  'Toffees',
  'Cake',
];

const INITIAL_USERS: UserAccount[] = [
  {
    id: 'user-admin-1',
    name: 'Sadaf Ali',
    pin: '1234',
    role: 'admin',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'user-partner-1',
    name: 'Bilal Ahmed',
    pin: '0000',
    role: 'partner',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
];

const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'cust-1',
    name: 'Ahmad Raza',
    phone: '0300-1234567',
    shopName: 'Raza Karyana Store',
    balanceDue: 2400.0,
    createdAt: new Date(Date.now() - 86400000 * 15).toISOString(),
  },
  {
    id: 'cust-2',
    name: 'Kamran Ali',
    phone: '0321-9876543',
    shopName: 'Ali Corner Shop',
    balanceDue: 1100.0,
    createdAt: new Date(Date.now() - 86400000 * 25).toISOString(),
  },
  {
    id: 'cust-3',
    name: 'Haji Aslam',
    phone: '0333-4567890',
    shopName: 'Madina General',
    balanceDue: -500.0, // Payable to customer
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
  },
];

const INITIAL_INVENTORY: InventoryItem[] = [
  {
    id: 1,
    sku: 'SIP-001',
    name: 'Shahi Sipari Premium 24s',
    category: 'Sipari',
    costPrice: 40.0,
    sellingPrice: 55.0,
    stockQuantity: 42,
    minStockAlert: 10,
    unit: 'boxes',
    isDeleted: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 2,
    sku: 'BIS-002',
    name: 'Rio Chocolate Cream Biscuit Box',
    category: 'Biscuit',
    costPrice: 180.0,
    sellingPrice: 220.0,
    stockQuantity: 4, // Low stock alert!
    minStockAlert: 8,
    unit: 'boxes',
    isDeleted: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 3,
    sku: 'BUB-003',
    name: 'Ding Dong Bubble Gum (Jar 100pcs)',
    category: 'Bubble',
    costPrice: 250.0,
    sellingPrice: 300.0,
    stockQuantity: 18,
    minStockAlert: 5,
    unit: 'jars',
    isDeleted: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 4,
    sku: 'PAP-004',
    name: 'Crispy Salted Paapr Family Pack',
    category: 'Paapr',
    costPrice: 120.0,
    sellingPrice: 160.0,
    stockQuantity: 2, // Low stock alert!
    minStockAlert: 6,
    unit: 'packs',
    isDeleted: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 5,
    sku: 'TOF-005',
    name: 'Butter Toffees Chewy Bag 500g',
    category: 'Toffees',
    costPrice: 180.0,
    sellingPrice: 240.0,
    stockQuantity: 26,
    minStockAlert: 5,
    unit: 'bags',
    isDeleted: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 6,
    sku: 'CAK-006',
    name: 'Fresh Swiss Roll Cake (Box of 12)',
    category: 'Cake',
    costPrice: 260.0,
    sellingPrice: 320.0,
    stockQuantity: 0, // Out of stock!
    minStockAlert: 5,
    unit: 'boxes',
    isDeleted: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const INITIAL_BILLS: Bill[] = [
  {
    id: 1001,
    billNumber: 'BILL-1001',
    createdAt: new Date().toISOString(),
    customerId: 'cust-1',
    customerName: 'Ahmad Raza',
    customerPhone: '0300-1234567',
    customerShopName: 'Raza Karyana Store',
    subtotal: 765.0,
    discount: 25.0,
    grandTotal: 740.0,
    paymentType: 'PAID',
    status: 'COMPLETED',
    createdByName: 'Sadaf Ali',
    items: [
      {
        itemId: 1,
        itemName: 'Shahi Sipari Premium 24s',
        sku: 'SIP-001',
        quantity: 3,
        unitPrice: 55.0,
        costPrice: 40.0,
        lineTotal: 165.0,
      },
      {
        itemId: 3,
        itemName: 'Ding Dong Bubble Gum (Jar 100pcs)',
        sku: 'BUB-003',
        quantity: 2,
        unitPrice: 300.0,
        costPrice: 250.0,
        lineTotal: 600.0,
      },
    ],
  },
  {
    id: 1002,
    billNumber: 'BILL-1002',
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    customerId: 'cust-2',
    customerName: 'Kamran Ali',
    customerPhone: '0321-9876543',
    customerShopName: 'Ali Corner Shop',
    subtotal: 880.0,
    discount: 0.0,
    grandTotal: 880.0,
    paymentType: 'LOAN',
    status: 'COMPLETED',
    createdByName: 'Sadaf Ali',
    items: [
      {
        itemId: 2,
        itemName: 'Rio Chocolate Cream Biscuit Box',
        sku: 'BIS-002',
        quantity: 4,
        unitPrice: 220.0,
        costPrice: 180.0,
        lineTotal: 880.0,
      },
    ],
  },
];

const INITIAL_EXPENSES: Expense[] = [
  {
    id: 1,
    category: 'Petrol',
    amount: 1500.0,
    notes: 'Stock delivery bike fuel',
    expenseDate: new Date().toISOString(),
    recordedBy: 'Sadaf Ali',
  },
  {
    id: 2,
    category: 'Food',
    amount: 850.0,
    notes: 'Counter lunch & refreshments',
    expenseDate: new Date(Date.now() - 86400000).toISOString(),
    recordedBy: 'Sadaf Ali',
  },
  {
    id: 3,
    category: 'Bike/Maintenance',
    amount: 2200.0,
    notes: 'Bike brake cable and oil replacement',
    expenseDate: new Date(Date.now() - 86400000 * 3).toISOString(),
    recordedBy: 'Sadaf Ali',
  },
];

const INITIAL_RATIO_HISTORY: PartnershipRatioRecord[] = [
  {
    id: 'ratio-init',
    partner1Name: 'Sadaf Ali',
    partner2Name: 'Bilal Ahmed',
    partner1Ratio: 60,
    partner2Ratio: 40,
    effectiveDate: '2026-01-01T00:00:00.000Z',
  },
];

const INITIAL_ACTIVITY_LOGS: ActivityLogEntry[] = [
  {
    id: 'act-1',
    action: 'CREATE',
    module: 'SYSTEM',
    description: 'System initialized with offline Drift local database (PKR)',
    performedBy: 'Sadaf Ali',
    timestamp: new Date().toISOString(),
  },
];

const KEYS = {
  USERS: 'smm_users_v2',
  CURRENT_USER: 'smm_current_user_v2',
  STORE_NAME: 'smm_store_name_v2',
  CUSTOMERS: 'smm_customers_v2',
  INVENTORY: 'smm_inventory_v2',
  CATEGORIES: 'smm_categories_v2',
  BILLS: 'smm_bills_v2',
  EXPENSES: 'smm_expenses_v2',
  PAYMENTS: 'smm_loan_payments_v2',
  RATIO_HISTORY: 'smm_ratio_history_v2',
  ACTIVITY_LOG: 'smm_activity_log_v2',
  LAST_BACKUP: 'smm_last_backup_date',
  BIOMETRIC: 'smm_biometric_enabled',
};

export const localDb = {
  // Users & Auth
  getUsers(): UserAccount[] {
    try {
      const data = localStorage.getItem(KEYS.USERS);
      return data ? JSON.parse(data) : INITIAL_USERS;
    } catch {
      return INITIAL_USERS;
    }
  },
  saveUsers(users: UserAccount[]) {
    localStorage.setItem(KEYS.USERS, JSON.stringify(users));
  },
  getCurrentUser(): UserAccount | null {
    try {
      const data = localStorage.getItem(KEYS.CURRENT_USER);
      if (data) return JSON.parse(data);
      const users = this.getUsers();
      return users.find((u) => u.isActive && u.role === 'admin') || users[0] || null;
    } catch {
      return null;
    }
  },
  setCurrentUser(user: UserAccount | null) {
    if (user) {
      localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(KEYS.CURRENT_USER);
    }
  },
  getBiometricEnabled(): boolean {
    return localStorage.getItem(KEYS.BIOMETRIC) === 'true';
  },
  setBiometricEnabled(enabled: boolean) {
    localStorage.setItem(KEYS.BIOMETRIC, enabled ? 'true' : 'false');
  },

  // Store Profile (Chosen by Admin Only)
  getStoreName(): string {
    try {
      const stored = localStorage.getItem(KEYS.STORE_NAME);
      return stored && stored.trim() ? stored.trim() : 'Al-Madina General Store';
    } catch {
      return 'Al-Madina General Store';
    }
  },
  setStoreName(name: string, role: string, actorName = 'Admin'): boolean {
    if (role !== 'admin') {
      console.warn('Unauthorized: Store name can only be chosen by an Admin');
      return false;
    }
    const trimmed = name.trim();
    if (!trimmed) return false;
    localStorage.setItem(KEYS.STORE_NAME, trimmed);
    this.logActivity('UPDATE', 'SYSTEM', `Store name changed to: "${trimmed}"`, actorName);
    return true;
  },

  // Categories
  getCategories(): string[] {
    try {
      const data = localStorage.getItem(KEYS.CATEGORIES);
      return data ? JSON.parse(data) : DEFAULT_CATEGORIES;
    } catch {
      return DEFAULT_CATEGORIES;
    }
  },
  saveCategories(cats: string[]) {
    localStorage.setItem(KEYS.CATEGORIES, JSON.stringify(cats));
  },

  // Customers & Loans
  getCustomers(): Customer[] {
    try {
      const data = localStorage.getItem(KEYS.CUSTOMERS);
      return data ? JSON.parse(data) : INITIAL_CUSTOMERS;
    } catch {
      return INITIAL_CUSTOMERS;
    }
  },
  saveCustomers(customers: Customer[]) {
    localStorage.setItem(KEYS.CUSTOMERS, JSON.stringify(customers));
  },
  getPayments(): LoanPayment[] {
    try {
      const data = localStorage.getItem(KEYS.PAYMENTS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },
  savePayments(payments: LoanPayment[]) {
    localStorage.setItem(KEYS.PAYMENTS, JSON.stringify(payments));
  },

  // Inventory
  getInventory(): InventoryItem[] {
    try {
      const data = localStorage.getItem(KEYS.INVENTORY);
      return data ? JSON.parse(data) : INITIAL_INVENTORY;
    } catch {
      return INITIAL_INVENTORY;
    }
  },
  saveInventory(items: InventoryItem[]) {
    localStorage.setItem(KEYS.INVENTORY, JSON.stringify(items));
  },

  // Bills
  getBills(): Bill[] {
    try {
      const data = localStorage.getItem(KEYS.BILLS);
      return data ? JSON.parse(data) : INITIAL_BILLS;
    } catch {
      return INITIAL_BILLS;
    }
  },
  saveBills(bills: Bill[]) {
    localStorage.setItem(KEYS.BILLS, JSON.stringify(bills));
  },

  // Expenses
  getExpenses(): Expense[] {
    try {
      const data = localStorage.getItem(KEYS.EXPENSES);
      return data ? JSON.parse(data) : INITIAL_EXPENSES;
    } catch {
      return INITIAL_EXPENSES;
    }
  },
  saveExpenses(expenses: Expense[]) {
    localStorage.setItem(KEYS.EXPENSES, JSON.stringify(expenses));
  },

  // Ratio History
  getRatioHistory(): PartnershipRatioRecord[] {
    try {
      const data = localStorage.getItem(KEYS.RATIO_HISTORY);
      return data ? JSON.parse(data) : INITIAL_RATIO_HISTORY;
    } catch {
      return INITIAL_RATIO_HISTORY;
    }
  },
  saveRatioHistory(records: PartnershipRatioRecord[]) {
    localStorage.setItem(KEYS.RATIO_HISTORY, JSON.stringify(records));
  },

  // Activity Log
  getActivityLogs(): ActivityLogEntry[] {
    try {
      const data = localStorage.getItem(KEYS.ACTIVITY_LOG);
      return data ? JSON.parse(data) : INITIAL_ACTIVITY_LOGS;
    } catch {
      return INITIAL_ACTIVITY_LOGS;
    }
  },
  logActivity(
    action: ActivityLogEntry['action'],
    module: ActivityLogEntry['module'],
    description: string,
    performedBy: string
  ) {
    const logs = this.getActivityLogs();
    const newEntry: ActivityLogEntry = {
      id: `act-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      action,
      module,
      description,
      performedBy,
      timestamp: new Date().toISOString(),
    };
    const updated = [newEntry, ...logs.slice(0, 199)]; // Keep latest 200
    localStorage.setItem(KEYS.ACTIVITY_LOG, JSON.stringify(updated));
  },

  // Backup Timestamps
  getLastBackupDate(): string | null {
    return localStorage.getItem(KEYS.LAST_BACKUP);
  },
  setLastBackupDate(dateIso: string) {
    localStorage.setItem(KEYS.LAST_BACKUP, dateIso);
  },

  // Full Database Export / Import
  exportFullDatabase(): string {
    const data = {
      exportVersion: '1.0.0',
      exportedAt: new Date().toISOString(),
      app: 'shop_manager_mobile',
      storeName: this.getStoreName(),
      users: this.getUsers(),
      categories: this.getCategories(),
      customers: this.getCustomers(),
      inventory: this.getInventory(),
      bills: this.getBills(),
      expenses: this.getExpenses(),
      payments: this.getPayments(),
      ratioHistory: this.getRatioHistory(),
      activityLogs: this.getActivityLogs(),
    };
    return JSON.stringify(data, null, 2);
  },

  restoreFullDatabase(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed.inventory || !parsed.bills) {
        throw new Error('Invalid backup schema');
      }
      if (parsed.storeName) localStorage.setItem(KEYS.STORE_NAME, parsed.storeName);
      if (parsed.users) localStorage.setItem(KEYS.USERS, JSON.stringify(parsed.users));
      if (parsed.categories) localStorage.setItem(KEYS.CATEGORIES, JSON.stringify(parsed.categories));
      if (parsed.customers) localStorage.setItem(KEYS.CUSTOMERS, JSON.stringify(parsed.customers));
      if (parsed.inventory) localStorage.setItem(KEYS.INVENTORY, JSON.stringify(parsed.inventory));
      if (parsed.bills) localStorage.setItem(KEYS.BILLS, JSON.stringify(parsed.bills));
      if (parsed.expenses) localStorage.setItem(KEYS.EXPENSES, JSON.stringify(parsed.expenses));
      if (parsed.payments) localStorage.setItem(KEYS.PAYMENTS, JSON.stringify(parsed.payments));
      if (parsed.ratioHistory) localStorage.setItem(KEYS.RATIO_HISTORY, JSON.stringify(parsed.ratioHistory));
      if (parsed.activityLogs) localStorage.setItem(KEYS.ACTIVITY_LOG, JSON.stringify(parsed.activityLogs));
      this.setLastBackupDate(new Date().toISOString());
      this.logActivity('RESTORE', 'SYSTEM', 'Database restored from backup file', 'Admin');
      return true;
    } catch (e) {
      console.error('Restore error:', e);
      return false;
    }
  },

  resetAll() {
    localStorage.clear();
  },
};
