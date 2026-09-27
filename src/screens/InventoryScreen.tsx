import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  Plus,
  Camera,
  Layers,
  Edit2,
  Trash2,
  RotateCcw,
  AlertTriangle,
  Package,
  Check,
  X,
  Sparkles,
} from 'lucide-react';
import { AppColors, formatCurrency } from '../utils/colors';
import { Squircle } from '../components/Squircle';
import { localDb } from '../utils/storage';
import { InventoryItem, UserRole } from '../types';

interface InventoryScreenProps {
  userRole: UserRole;
}

export const InventoryScreen: React.FC<InventoryScreenProps> = ({ userRole }) => {
  const [items, setItems] = useState<InventoryItem[]>(() =>
    localDb.getInventory().filter((i) => !i.isDeleted)
  );
  const [categories, setCategories] = useState<string[]>(() =>
    localDb.getCategories()
  );
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Sipari');
  const [sku, setSku] = useState('');
  const [costPrice, setCostPrice] = useState('4.00');
  const [sellingPrice, setSellingPrice] = useState('6.00');
  const [stockQuantity, setStockQuantity] = useState('20');
  const [minStockAlert, setMinStockAlert] = useState('5');
  const [customCatName, setCustomCatName] = useState('');

  const isAdmin = userRole === 'admin';

  // Category Icon & Tint Helper
  const getCategoryTheme = (cat: string) => {
    switch (cat.toLowerCase()) {
      case 'sipari':
        return { bg: '#E2EFEA', color: AppColors.primary, label: 'SP' };
      case 'biscuit':
        return { bg: '#FEF4DC', color: '#B45309', label: 'BS' };
      case 'bubble':
        return { bg: '#FDE8E1', color: '#B3491F', label: 'BB' };
      case 'paapr':
        return { bg: '#F0EBF8', color: '#7C3AED', label: 'PR' };
      case 'toffees':
        return { bg: '#ECEFF8', color: '#3B82F6', label: 'TF' };
      case 'cake':
        return { bg: '#FCE7F3', color: '#DB2777', label: 'CK' };
      default:
        return { bg: '#E5F4EB', color: AppColors.primary, label: cat.slice(0, 2).toUpperCase() };
    }
  };

  const filteredItems = items.filter((item) => {
    const matchCat = selectedCategory === 'All' || item.category === selectedCategory;
    const matchQuery =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchQuery;
  });

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    if (!name.trim()) return;

    const allInventory = localDb.getInventory();

    if (editingItem) {
      // Update item
      const updated = allInventory.map((it) => {
        if (it.id === editingItem.id) {
          return {
            ...it,
            name: name.trim(),
            category,
            sku: sku.trim() || `SKU-${Date.now().toString().slice(-4)}`,
            costPrice: parseFloat(costPrice) || 0,
            sellingPrice: parseFloat(sellingPrice) || 0,
            stockQuantity: parseFloat(stockQuantity) || 0,
            minStockAlert: parseFloat(minStockAlert) || 5,
            updatedAt: new Date().toISOString(),
          };
        }
        return it;
      });
      localDb.saveInventory(updated);
      setItems(updated.filter((i) => !i.isDeleted));
      localDb.logActivity('UPDATE', 'INVENTORY', `Updated item ${name}`, 'Admin');
    } else {
      // Add new item
      const newItem: InventoryItem = {
        id: Date.now(),
        sku: sku.trim() || `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
        name: name.trim(),
        category,
        costPrice: parseFloat(costPrice) || 0,
        sellingPrice: parseFloat(sellingPrice) || 0,
        stockQuantity: parseFloat(stockQuantity) || 0,
        minStockAlert: parseFloat(minStockAlert) || 5,
        unit: 'pcs',
        isDeleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const updated = [newItem, ...allInventory];
      localDb.saveInventory(updated);
      setItems(updated.filter((i) => !i.isDeleted));
      localDb.logActivity('CREATE', 'INVENTORY', `Created item ${newItem.name} (${newItem.sku})`, 'Admin');
    }

    closeModal();
  };

  const handleSoftDelete = (id: number) => {
    if (!isAdmin) return;
    if (confirm('Are you sure you want to delete this item? (Existing bills will retain historical data).')) {
      const all = localDb.getInventory();
      const updated = all.map((it) => (it.id === id ? { ...it, isDeleted: true } : it));
      localDb.saveInventory(updated);
      setItems(updated.filter((i) => !i.isDeleted));
      localDb.logActivity('DELETE', 'INVENTORY', `Soft deleted item #${id}`, 'Admin');
    }
  };

  const handleRestock = (id: number, addQty: number) => {
    if (!isAdmin) return;
    const all = localDb.getInventory();
    const updated = all.map((it) => {
      if (it.id === id) {
        return {
          ...it,
          stockQuantity: it.stockQuantity + addQty,
          updatedAt: new Date().toISOString(),
        };
      }
      return it;
    });
    localDb.saveInventory(updated);
    setItems(updated.filter((i) => !i.isDeleted));
    localDb.logActivity('UPDATE', 'INVENTORY', `Restocked item #${id} with +${addQty}`, 'Admin');
  };

  const handleAddCustomCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin || !customCatName.trim()) return;
    if (!categories.includes(customCatName.trim())) {
      const updated = [...categories, customCatName.trim()];
      setCategories(updated);
      localDb.saveCategories(updated);
      setCategory(customCatName.trim());
      localDb.logActivity('CREATE', 'INVENTORY', `Added custom category: ${customCatName.trim()}`, 'Admin');
    }
    setCustomCatName('');
    setShowAddCategoryModal(false);
  };

  const openEditModal = (item: InventoryItem) => {
    if (!isAdmin) return;
    setEditingItem(item);
    setName(item.name);
    setCategory(item.category);
    setSku(item.sku);
    setCostPrice(item.costPrice.toString());
    setSellingPrice(item.sellingPrice.toString());
    setStockQuantity(item.stockQuantity.toString());
    setMinStockAlert(item.minStockAlert.toString());
    setShowAddModal(true);
  };

  const closeModal = () => {
    setShowAddModal(false);
    setEditingItem(null);
    setName('');
    setSku('');
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#F6F5F1] select-none">
      {/* Top Header */}
      <div
        style={{ backgroundColor: AppColors.primary }}
        className="px-4 py-3 text-white flex items-center justify-between shrink-0 shadow-xs"
      >
        <div>
          <h1 className="text-[17px] font-semibold tracking-tight text-white">
            Inventory & Stock
          </h1>
          <div className="text-[11px] text-teal-100/80">
            {items.length} items active · Offline Drift SQLite
          </div>
        </div>

        {isAdmin ? (
          <button
            type="button"
            onClick={() => {
              setEditingItem(null);
              setName('');
              setSku('');
              setShowAddModal(true);
            }}
            style={{ backgroundColor: AppColors.accent, color: AppColors.textPrimary }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-xs active:scale-95 transition-transform cursor-pointer"
          >
            <Plus size={14} />
            <span>Add Item</span>
          </button>
        ) : (
          <span className="text-[10px] bg-white/10 text-white/80 px-2 py-1 rounded-md font-medium">
            Partner (Read-Only)
          </span>
        )}
      </div>

      {/* Live Search Bar */}
      <div className="p-3 bg-white border-b border-[#E3E0D8] shrink-0">
        <div className="relative">
          <Search
            size={16}
            style={{ color: AppColors.textSecondary }}
            className="absolute left-3 top-1/2 -translate-y-1/2"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search items, SKU, or category..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-[#F6F5F1] rounded-xl border border-[#E3E0D8] text-[#22262B] placeholder:text-slate-400 focus:outline-none focus:border-teal-700"
          />
        </div>
      </div>

      {/* iOS-Inspired Squircle Category Bar */}
      <div className="p-2.5 bg-white border-b border-[#E3E0D8] overflow-x-auto no-scrollbar shrink-0 flex items-center gap-2.5">
        {/* All Tab */}
        <button
          type="button"
          onClick={() => setSelectedCategory('All')}
          className="flex flex-col items-center gap-1 cursor-pointer focus:outline-none shrink-0"
        >
          <Squircle
            size={44}
            backgroundColor={selectedCategory === 'All' ? AppColors.primary : '#E2EFEA'}
            className="shadow-2xs transition-all active:scale-95"
          >
            <Layers
              size={18}
              style={{ color: selectedCategory === 'All' ? '#FFFFFF' : AppColors.primary }}
            />
          </Squircle>
          <span
            style={{
              color: selectedCategory === 'All' ? AppColors.primary : AppColors.textSecondary,
            }}
            className="text-[11px] font-medium"
          >
            All
          </span>
        </button>

        {/* Dynamic Categories */}
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat;
          const theme = getCategoryTheme(cat);
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className="flex flex-col items-center gap-1 cursor-pointer focus:outline-none shrink-0"
            >
              <Squircle
                size={44}
                backgroundColor={isSelected ? AppColors.primary : theme.bg}
                className="shadow-2xs transition-all active:scale-95"
              >
                <span
                  style={{ color: isSelected ? '#FFFFFF' : theme.color }}
                  className="text-xs font-bold font-sans"
                >
                  {theme.label}
                </span>
              </Squircle>
              <span
                style={{
                  color: isSelected ? AppColors.primary : AppColors.textSecondary,
                }}
                className={`text-[11px] truncate max-w-[54px] ${
                  isSelected ? 'font-semibold' : 'font-medium'
                }`}
              >
                {cat}
              </span>
            </button>
          );
        })}

        {/* Add Category Button (Admin only) */}
        {isAdmin && (
          <button
            type="button"
            onClick={() => setShowAddCategoryModal(true)}
            className="flex flex-col items-center gap-1 cursor-pointer focus:outline-none shrink-0"
          >
            <Squircle
              size={44}
              backgroundColor="#F6F5F1"
              borderColor="#E3E0D8"
              borderWidth={1}
              className="hover:border-teal-700 active:scale-95"
            >
              <Plus size={16} className="text-[#6B7078]" />
            </Squircle>
            <span className="text-[11px] text-[#6B7078] font-medium">+ Add</span>
          </button>
        )}
      </div>

      {/* Staggered Item List */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-3 space-y-2.5">
        {filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <Squircle size={56} backgroundColor="#E2EFEA" className="mx-auto mb-3">
              <Package size={26} style={{ color: AppColors.primary }} />
            </Squircle>
            <div className="text-sm font-semibold text-[#22262B]">
              No inventory items found
            </div>
            <p className="text-xs text-[#6B7078] mt-1 max-w-xs mx-auto">
              {isAdmin
                ? 'Tap "Add Item" or use the camera barcode scanner to catalog your first product.'
                : 'No items match your filter criteria.'}
            </p>
          </div>
        ) : (
          filteredItems.map((item, index) => {
            const isOutOfStock = item.stockQuantity <= 0;
            const isLowStock =
              item.stockQuantity > 0 && item.stockQuantity <= item.minStockAlert;
            const theme = getCategoryTheme(item.category);

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.22,
                  delay: Math.min(index * 0.03, 0.3),
                  ease: 'easeOut',
                }}
                style={{
                  backgroundColor: AppColors.surface,
                  borderColor: AppColors.border,
                }}
                className="p-3.5 rounded-xl border flex items-center justify-between gap-3 shadow-2xs hover:border-slate-300 transition-colors"
              >
                {/* Category Icon in Squircle */}
                <Squircle
                  size={42}
                  backgroundColor={theme.bg}
                  className="shrink-0"
                >
                  <span
                    style={{ color: theme.color }}
                    className="text-xs font-bold"
                  >
                    {theme.label}
                  </span>
                </Squircle>

                {/* Details */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      style={{ color: AppColors.textPrimary }}
                      className="text-[14px] font-medium leading-tight truncate"
                    >
                      {item.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-[#6B7078] mt-1 font-tabular">
                    <span>{item.sku}</span>
                    <span>·</span>
                    <span>Cost {formatCurrency(item.costPrice)}</span>
                    <span>·</span>
                    <span className="font-semibold text-[#22262B]">
                      Sell {formatCurrency(item.sellingPrice)}
                    </span>
                  </div>

                  {/* Stock state badge in squircle chips */}
                  <div className="mt-1 flex items-center gap-2">
                    {isOutOfStock ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#FDE8E1] text-[#B3491F] text-[10px] font-semibold">
                        <AlertTriangle size={11} />
                        <span>Out of Stock (0)</span>
                      </span>
                    ) : isLowStock ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#FEF4DC] text-[#B45309] text-[10px] font-semibold">
                        <AlertTriangle size={11} />
                        <span>Low Stock ({item.stockQuantity} left)</span>
                      </span>
                    ) : (
                      <span className="text-[11px] text-[#2E7D4F] font-medium font-tabular">
                        Stock: {item.stockQuantity} {item.unit}
                      </span>
                    )}
                  </div>
                </div>

                {/* Price & Action Row */}
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <span
                    style={{ color: AppColors.primary }}
                    className="text-[17px] font-bold font-tabular"
                  >
                    {formatCurrency(item.sellingPrice)}
                  </span>

                  {isAdmin && (
                    <div className="flex items-center gap-1">
                      {/* Restock quick action */}
                      <button
                        type="button"
                        onClick={() => handleRestock(item.id, 10)}
                        title="Quick Restock +10"
                        className="px-2 py-1 rounded bg-[#E2EFEA] text-[#1B4B43] text-[10px] font-bold hover:bg-teal-200 transition-colors cursor-pointer"
                      >
                        +10
                      </button>

                      {/* Edit */}
                      <button
                        type="button"
                        onClick={() => openEditModal(item)}
                        className="p-1.5 text-slate-400 hover:text-[#1B4B43] transition-colors cursor-pointer"
                      >
                        <Edit2 size={14} />
                      </button>

                      {/* Soft Delete */}
                      <button
                        type="button"
                        onClick={() => handleSoftDelete(item.id)}
                        className="p-1.5 text-slate-400 hover:text-[#B3491F] transition-colors cursor-pointer"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Add / Edit Item Modal */}
      {showAddModal && (
        <div className="absolute inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-[#22262B]">
                {editingItem ? 'Edit Product' : 'Add New Item'}
              </h2>
              <button
                type="button"
                onClick={closeModal}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-[#6B7078] block mb-1">
                  Product Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ding Dong Bubble Gum"
                  className="w-full px-3 py-2 text-xs border border-[#E3E0D8] rounded-xl focus:outline-none focus:border-teal-700 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-[#6B7078] block mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-2 py-2 text-xs border border-[#E3E0D8] rounded-xl bg-white focus:outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[#6B7078] block mb-1">
                    SKU / Barcode
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={sku}
                      onChange={(e) => setSku(e.target.value.toUpperCase())}
                      placeholder="SKU-XXXX"
                      className="w-full pl-2 pr-7 py-2 text-xs border border-[#E3E0D8] rounded-xl focus:outline-none uppercase font-tabular"
                    />
                    <button
                      type="button"
                      onClick={() => setShowScannerModal(true)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-teal-700 p-0.5 hover:scale-110"
                      title="Scan via Camera"
                    >
                      <Camera size={14} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-[#6B7078] block mb-1">
                    Cost Price (Rs)
                  </label>
                  <input
                    type="number"
                    step="1"
                    required
                    value={costPrice}
                    onChange={(e) => setCostPrice(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-[#E3E0D8] rounded-xl font-tabular"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-[#6B7078] block mb-1">
                    Selling Price (Rs)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-[#E3E0D8] rounded-xl font-tabular font-bold text-[#1B4B43]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-[#6B7078] block mb-1">
                    Starting Stock
                  </label>
                  <input
                    type="number"
                    required
                    value={stockQuantity}
                    onChange={(e) => setStockQuantity(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-[#E3E0D8] rounded-xl font-tabular"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-[#6B7078] block mb-1">
                    Low Stock Alert
                  </label>
                  <input
                    type="number"
                    required
                    value={minStockAlert}
                    onChange={(e) => setMinStockAlert(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-[#E3E0D8] rounded-xl font-tabular"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t border-[#E3E0D8]">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 py-2.5 text-xs font-semibold text-[#6B7078] border border-[#E3E0D8] rounded-xl hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ backgroundColor: AppColors.accent, color: AppColors.textPrimary }}
                  className="flex-1 py-2.5 text-xs font-bold rounded-xl active:scale-95 transition-transform shadow-xs cursor-pointer"
                >
                  {editingItem ? 'Save Changes' : 'Add to Inventory'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Barcode Camera Scanner Simulator Modal */}
      {showScannerModal && (
        <div className="absolute inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xs rounded-3xl p-5 shadow-2xl text-center">
            <h3 className="text-sm font-bold text-[#22262B]">
              Camera Barcode Scanner
            </h3>
            <p className="text-[11px] text-[#6B7078] mt-0.5">
              Simulating Android mobile_scanner viewfinder
            </p>

            {/* Viewfinder box */}
            <div className="my-4 h-36 bg-slate-900 rounded-2xl relative overflow-hidden flex items-center justify-center border-2 border-teal-500">
              <div className="w-48 h-0.5 bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
              <span className="absolute bottom-2 text-[9px] text-white/70 font-mono">
                Point at product barcode
              </span>
            </div>

            <div className="space-y-1.5">
              <button
                type="button"
                onClick={() => {
                  const generated = `BAR-${Math.floor(100000 + Math.random() * 900000)}`;
                  setSku(generated);
                  setShowScannerModal(false);
                }}
                style={{ backgroundColor: AppColors.primary, color: '#FFFFFF' }}
                className="w-full py-2 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Scan Barcode
              </button>
              <button
                type="button"
                onClick={() => setShowScannerModal(false)}
                className="w-full py-1.5 text-xs text-[#6B7078]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Category Modal */}
      {showAddCategoryModal && (
        <div className="absolute inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xs rounded-3xl p-5 shadow-2xl">
            <h3 className="text-sm font-bold text-[#22262B] mb-2">
              Add Custom Category
            </h3>
            <form onSubmit={handleAddCustomCategory} className="space-y-3">
              <input
                type="text"
                required
                value={customCatName}
                onChange={(e) => setCustomCatName(e.target.value)}
                placeholder="e.g. Masala, Drinks, Candies"
                className="w-full px-3 py-2 text-xs border border-[#E3E0D8] rounded-xl"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddCategoryModal(false)}
                  className="flex-1 py-2 text-xs border border-[#E3E0D8] rounded-xl text-[#6B7078]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ backgroundColor: AppColors.accent, color: AppColors.textPrimary }}
                  className="flex-1 py-2 text-xs font-bold rounded-xl"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
