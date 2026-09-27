import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import '../utils/colors.dart';
import '../utils/typography.dart';
import '../widgets/squircle_container.dart';

class BillingScreen extends StatelessWidget {
  const BillingScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.primary,
        elevation: 0,
        title: const Text(
          'Counter Billing',
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.w600, fontSize: 18),
        ),
        actions: [
          IconButton(
            icon: const Icon(CupertinoIcons.printer, color: Colors.white),
            tooltip: 'Printer Setup',
            onPressed: () {},
          ),
        ],
      ),
      body: Column(
        children: [
          // Bill summary header
          Container(
            padding: const EdgeInsets.all(16),
            color: AppColors.surface,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Bill #INV-2026-0042', style: AppTypography.heading3),
                    Text('Customer: Walk-in Cash', style: AppTypography.bodySecondary.copyWith(fontSize: 12)),
                  ],
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: AppColors.sectionBilling,
                    borderRadius: BorderRadius.circular(6),
                    border: Border.all(color: AppColors.primary.withOpacity(0.2)),
                  ),
                  child: const Text('DRAFT', style: TextStyle(color: AppColors.primary, fontWeight: FontWeight.w600, fontSize: 11)),
                ),
              ],
            ),
          ),
          const Divider(height: 1, color: AppColors.border),

          // Items list placeholder
          Expanded(
            child: ListView(
              padding: const EdgeInsets.all(16),
              children: [
                _buildBillingItem('Shahi Sipari Premium 24s', '3 boxes', 'Rs 55', 'Rs 165'),
                _buildBillingItem('Rio Chocolate Cream Biscuit Box', '2 boxes', 'Rs 220', 'Rs 440'),
                _buildBillingItem('Ding Dong Bubble Gum (Jar 100s)', '1 jar', 'Rs 300', 'Rs 300'),
                const SizedBox(height: 16),
                OutlinedButton.icon(
                  style: OutlinedButton.styleFrom(
                    foregroundColor: AppColors.primary,
                    side: const BorderSide(color: AppColors.border),
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  ),
                  icon: const Icon(Icons.add, size: 18),
                  label: const Text('Scan Barcode or Add Item', style: TextStyle(fontWeight: FontWeight.w500)),
                  onPressed: () {},
                ),
              ],
            ),
          ),

          // Bottom Checkout Bar
          Container(
            padding: const EdgeInsets.all(16),
            decoration: const BoxDecoration(
              color: AppColors.surface,
              border: Border(top: BorderSide(color: AppColors.border)),
            ),
            child: SafeArea(
              child: Row(
                children: [
                  const Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Grand Total (PKR)', style: AppTypography.labelSmall),
                      Text('Rs 905', style: AppTypography.tabularTotal),
                    ],
                  ),
                  const Spacer(),
                  ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.accent,
                      foregroundColor: AppColors.textPrimary,
                      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                    icon: const Icon(Icons.print, size: 18),
                    label: const Text('Save & Print', style: TextStyle(fontWeight: FontWeight.w600)),
                    onPressed: () {},
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBillingItem(String title, String qty, String price, String total) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: AppColors.border),
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: AppTypography.labelMedium),
                const SizedBox(height: 2),
                Text('$qty × $price', style: AppTypography.tabularQuantity.copyWith(color: AppColors.textSecondary, fontSize: 12)),
              ],
            ),
          ),
          Text(total, style: AppTypography.tabularCurrency),
        ],
      ),
    );
  }
}
