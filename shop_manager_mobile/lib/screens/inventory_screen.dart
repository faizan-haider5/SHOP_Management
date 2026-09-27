import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import '../utils/colors.dart';
import '../utils/typography.dart';
import '../widgets/squircle_container.dart';

class InventoryScreen extends StatelessWidget {
  const InventoryScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.primary,
        elevation: 0,
        title: const Text(
          'Inventory & Stock',
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.w600, fontSize: 18),
        ),
        actions: [
          IconButton(
            icon: const Icon(CupertinoIcons.barcode_viewfinder, color: Colors.white),
            onPressed: () {},
          ),
          IconButton(
            icon: const Icon(Icons.add, color: Colors.white),
            onPressed: () {},
          ),
        ],
      ),
      body: Column(
        children: [
          // Search & Filter
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            color: AppColors.surface,
            child: TextField(
              decoration: InputDecoration(
                hintText: 'Search SKU or item name...',
                prefixIcon: const Icon(CupertinoIcons.search, size: 20, color: AppColors.textSecondary),
                filled: true,
                fillColor: AppColors.background,
                contentPadding: const EdgeInsets.symmetric(vertical: 0, horizontal: 12),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(10),
                  borderSide: const BorderSide(color: AppColors.border),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(10),
                  borderSide: const BorderSide(color: AppColors.border),
                ),
              ),
            ),
          ),
          const Divider(height: 1, color: AppColors.border),

          // Categories with iOS-inspired Squircles
          Container(
            height: 84,
            padding: const EdgeInsets.symmetric(vertical: 10),
            color: AppColors.surface,
            child: ListView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              children: [
                _buildCategoryItem('All', Icons.grid_view, AppColors.primary, Colors.white, true),
                _buildCategoryItem('Dairy', Icons.egg_outlined, AppColors.sectionBilling, AppColors.primary, false),
                _buildCategoryItem('Bakery', Icons.bakery_dining_outlined, AppColors.sectionInventory, AppColors.warning, false),
                _buildCategoryItem('Beverages', Icons.local_drink_outlined, AppColors.sectionLoans, Colors.indigo, false),
                _buildCategoryItem('Snacks', Icons.cookie_outlined, AppColors.sectionExpenses, AppColors.danger, false),
              ],
            ),
          ),
          const Divider(height: 1, color: AppColors.border),

          // Stock list with tabular quantities
          Expanded(
            child: ListView(
              padding: const EdgeInsets.all(16),
              children: [
                _buildStockItem('Shahi Sipari Premium 24s', 'SIP-001', 42, 10, 'Rs 55'),
                _buildStockItem('Rio Chocolate Cream Biscuit', 'BIS-002', 4, 8, 'Rs 220', isLow: true),
                _buildStockItem('Fresh Swiss Roll Cake (Box 12)', 'CAK-006', 0, 5, 'Rs 320', isOut: true),
                _buildStockItem('Ding Dong Bubble Gum (Jar 100s)', 'BUB-003', 18, 5, 'Rs 300'),
                _buildStockItem('Crispy Salted Paapr Family Pack', 'PAP-004', 2, 6, 'Rs 160', isLow: true),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCategoryItem(String title, IconData icon, Color bgColor, Color iconColor, bool isSelected) {
    return Padding(
      padding: const EdgeInsets.only(right: 14),
      child: Column(
        children: [
          SquircleContainer(
            size: 42,
            cornerRadius: 12,
            backgroundColor: isSelected ? AppColors.primary : bgColor,
            child: Icon(icon, size: 20, color: isSelected ? Colors.white : iconColor),
          ),
          const SizedBox(height: 4),
          Text(title, style: AppTypography.labelSmall.copyWith(fontSize: 11)),
        ],
      ),
    );
  }

  Widget _buildStockItem(String name, String sku, int qty, int minAlert, String price, {bool isLow = false, bool isOut = false}) {
    Color badgeColor = AppColors.success;
    String statusText = '$qty in stock';
    if (isOut) {
      badgeColor = AppColors.danger;
      statusText = 'Out of stock (0)';
    } else if (isLow) {
      badgeColor = AppColors.warning;
      statusText = 'Low stock ($qty left)';
    }

    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: AppColors.border),
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(name, style: AppTypography.labelMedium),
                const SizedBox(height: 2),
                Text('$sku · $statusText', style: TextStyle(color: badgeColor, fontSize: 11, fontWeight: FontWeight.w500)),
              ],
            ),
          ),
          Text(price, style: AppTypography.tabularCurrency),
        ],
      ),
    );
  }
}
